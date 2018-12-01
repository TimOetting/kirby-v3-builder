<?php

use Kirby\Form\Form;
use Kirby\Cms\Blueprint;
use Kirby\Form\Field;
use Kirby\Form\Fields;

Kirby::plugin('timoetting/testfield', [
  'fields' => [
    'builder' => [
      'props' => [
        'value' => function ($value = null) {
            return $value;
        }
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