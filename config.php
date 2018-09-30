<?php

use Kirby\Form\Form;
use Kirby\Cms\Blueprint;
use Kirby\Form\Field;
use Kirby\Form\Fields;

Kirby::plugin('timoetting/testfield', [
  'fields' => [
    'builder' => [
      'props' => [
      ],
      'computed' => [
        'pageUid' => function () {
          return $this->model()->uid();
        },
        'pageId' => function () {
          return $this->model()->id();
        },
        'fieldsets' => function () {
          $fieldSets = Yaml::decode($this->fieldsets);

          $fieldSets = $this->extendRecursively($fieldSets);
          
          return $fieldSets;
        },
        'value' => function () {
          $values = Yaml::decode($this->props['value']);
          return $values;
        },
        'pageUid' => function () {
          return $this->model()->uid();
        },
        'pageId' => function () {
          return $this->model()->id();
        }
      ],
      'methods' => [
        'extendRecursively' => function ($properties, $currentPropertiesName = null) {
          foreach ($properties as $propertyName => $property) {
            if(is_array($property)){
              $dies = $this;

              $properties[$propertyName] = $this->model()->blueprint()->extend($property);
              $properties[$propertyName] = $this->extendRecursively($properties[$propertyName], $propertyName);
            }
          }
          if ($currentPropertiesName === 'fields') {
            $fieldForm = new Form([
              'fields' => $properties,
              'model'  => $this->model() ?? null
            ]);
            $values = $fieldForm->values();
            $properties = $fieldForm->fields()->toArray();
          }
          return $properties;
        }
      ],
    ],
  ],
  'routes' => [
    [
      'pattern' => 'api/kirby-builder/preview',
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
        $responsePage = page('projects/oceans-are-quite-nice');
        $responsePage = new Page([
          'slug' => 'virtual-reality',
          'template' => 'snippet-wrapper',
          'content' => $content
        ]);
        return $responsePage;
      }
    ],
  ],   
  'templates' => [
    'snippet-wrapper' => __DIR__ . '/templates/snippet-wrapper.php'
  ]
]);