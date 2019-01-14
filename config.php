<?php

use Kirby\Form\Form;
use Kirby\Cms\Blueprint;
use Kirby\Form\Field;
use Kirby\Form\Fields;

Kirby::plugin('timoetting/kirbybuilder', [
  'fields' => [
    'builder' => [
      'props' => [
        'value' => function ($value = null) {
            return $value;
        }
      ],
      'computed' => [
        'pageId' => function () {
          return $this->model()->id();
        },
        'pageUid' => function () {
          return $this->model()->uid();
        },
        'encodedPageId' => function () {
          return str_replace('/', '+', $this->model()->id());
        },
        'fieldsets' => function () {
          $fieldSets = Yaml::decode($this->fieldsets);
          $fieldSets = $this->extendRecursively($fieldSets);
          return $fieldSets;
        },
        'value' => function () {
          $values = Yaml::decode($this->value);
          $vals = [];
          foreach ($values as $key => $value) {
            if (array_key_exists('fields', $this->fieldsets[$value['_key']])) {
              $form = new Form([
                'fields' => $this->fieldsets[$value['_key']]['fields'],
                'values' => $value,
                'model'  => $this->model() ?? null
              ]);
              $vals[] = $form->values();
            }
          }
          return $vals;
        },
        'cssUrls' => function() {
          $cssUrls = array_map(function($arr) {
            if(array_key_exists('preview', $arr)) {
              return array_key_exists('css', $arr['preview']) ? $arr['preview']['css'] : '';
            }
          }, $this->fieldsets);
          $cssUrls = array_filter($cssUrls);
          // $cssUrls = array_unique($cssUrls);
          return $cssUrls;
        },
        'jsUrls' => function() {
          $jsUrls = array_map(function($arr) {
            if(array_key_exists('preview', $arr)) {
              return array_key_exists('js', $arr['preview']) ? $arr['preview']['js'] : '';
            }
          }, $this->fieldsets);
          $jsUrls = array_filter($jsUrls);
          $jsUrls = array_unique($jsUrls);
          return $jsUrls;
        }	        
      ],
      'methods' => [
        'extendRecursively' => function ($properties, $currentPropertiesName = null) {
          foreach ($properties as $propertyName => $property) {
            if(is_array($property)){
              $properties[$propertyName] = $this->model()->blueprint()->extend($property);
              $properties[$propertyName] = $this->extendRecursively($properties[$propertyName], $propertyName);
            }
          }
          if ($currentPropertiesName === 'fields') {
            $fieldForm = new Form([
              'fields' => $properties,
              'model'  => $this->model() ?? null
            ]);
            $properties = $fieldForm->fields()->toArray();
          }
          return $properties;
        },
      ],
      'save' => function ($values = null) {
        $vals = [];
        foreach ($values as $key => $value) {
          if (array_key_exists('fields', $this->fieldsets[$value['_key']])) {
            $form = new Form([
              'fields' => $this->fieldsets[$value['_key']]['fields'],
              'values' => $value,
              'model'  => $this->model() ?? null
            ]);
            $vals[] = $form->data();
          }
        }
        return $vals;
      },
    ],
  ],
  'api' => [
    'routes' => [
      [
        'pattern' => 'kirby-builder/preview',
        'method' => 'POST',
        'action'  => function () {
          $existingPreviews = kirby()->session()->data()->get('kirby-builder-previews');
          $newPreview = [get('blockUid') => get('blockcontent')];
          if (isset($existingPreviews)) {
            $updatedPreviews = $existingPreviews;
            $updatedPreviews[get('blockUid')] = get('blockcontent');
            kirby()->session()->set('kirby-builder-previews', $updatedPreviews);
          } else {
            $newPreview = [get('blockUid') => get('blockcontent')];
            kirby()->session()->set('kirby-builder-previews', $newPreview);
          }
          return [
            'code' => 200,
            'status' => 'ok'
          ];
        }
      ],
      [
        'pattern' => 'kirby-builder/rendered-preview',
        'method' => 'POST',
        'action'  => function () {
          $kirby            = kirby();
          $blockUid         = get('blockUid');
          $blockContent     = get('blockContent');
          $previewOptions   = get('preview');
          $cache            = $kirby->cache('timoetting.builder');
          $existingPreviews = $cache->get('previews');
          if(isset($existingPreviews)) {
            $updatedPreviews            = $existingPreviews;
            $updatedPreviews[$blockUid] = $blockContent;
            $cache->set('previews', $updatedPreviews);
          } else {
            $newPreview = [$blockUid => $blockContent];
            $cache->set('previews', $newPreview);
          }
          $snippet      = $previewOptions['snippet'] ?? null;
          $modelName    = $previewOptions['modelname'] ?? 'data';
          $originalPage = $kirby->page(get('pageid'));
          $page = new Page([
            'slug'     => 'builder-preview',
            'template' => 'builder-preview',
            'content'  => $blockContent,
          ]);
          return array(
            'preview' => snippet($snippet, ['page' => $originalPage, $modelName => $page->content()], true) ,
            'content' => get('blockContent')
          );
        }
      ],
      // mocked validation for file, pages and structure field
      [
        'pattern' => 'kirby-builder/pages/(:any)/fields/(:any)/validate',
        'method' => 'POST',
        'action'  => function ($fieldPath) {
          return [
            'code' => 200,
            'status' => 'ok'
          ];
        }
      ],
    ],
  ],
  'routes' => [
    [
      'pattern' => 'kirby-builder-preview/(:any)',
      'method' => 'GET',
      'action'  => function ($blockUid) {
        $content = kirby()->session()->data()->get('kirby-builder-previews')[$blockUid];
        if (get('pageid')) {
          $content['_pageid'] = get('pageid');
        }
        if (get('snippet')) {
          $content['_snippetpath'] = get('snippet');
        }
        if (get('css')) {
          $content['_csspath'] = get('css');
        }
        if (get('js')) {
          $content['_jspath'] = get('js');
        }
        $content['_modelname'] = (get('modelname')) ? get('modelname') : 'data';
        $responsePage = new Page([
          'slug' => 'virtual-reality',
          'template' => 'snippet-wrapper',
          'content' => $content
        ]);
        return $responsePage;
      }
    ],
    [
      'pattern' => 'kirby-builder-frame',
      'method' => 'GET',
      'action'  => function () {
        return '<!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta http-equiv="X-UA-Compatible" content="ie=edge">
            <title>Document</title>
          </head>
          <body>
            hey
          </body>
          </html>';
      }
    ],
    // [
    //   'pattern' => 'kirby-builder/validationtest',
    //   'method' => 'GET',
    //   'action'  => function () {                
    //     $props = [
    //       'name'  => 'Hi',
    //       'label' => 'test text field',
    //       'maxlength' => 2,
    //       'value'  => 'mein value'
    //     ];
    //     $field = new Field('text', $props);
    //     $field->save();
    //     $field->validate();
    //     return [
    //       'code' => 200,
    //       'field' => $field->errors()
    //     ];
    //   }
    // ],
  ], 
  'translations' => [
    'en' => [
      'builder.clone' => 'Clone',
    ],
    'fr' => [
      'builder.clone' => 'Dupliquer',
    ],
    'de' => [
      'builder.clone' => 'Duplizieren',
    ],
  ],  
  'templates' => [
    'snippet-wrapper' => __DIR__ . '/templates/snippet-wrapper.php'
  ]
]);