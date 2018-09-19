<?php

use Kirby\Form\Form;
use Kirby\Cms\Blueprint;

Kirby::plugin('timoetting/testfield', [
  'fields' => [
    'builder' => [
      'props' => [
        'pageUid' => function () {
          return $this->model()->uid();
        },
        'pageId' => function () {
          return $this->model()->id();
        }
      ],
      'computed' => [
        'fieldsets' => function () {
          $fieldSets = Yaml::decode($this->props['fieldsets']);

          $fieldSets = $this->extendRecursively($fieldSets);
          
          return $fieldSets;
        },
        'value' => function () {
          $values = Yaml::decode($this->props['value']);
          return $values;
        },
      ],
      'methods' => [
        'extendRecursively' => function ($properties, $isField = false) {
          foreach ($properties as $propertyName => $property) {
            if(is_array($property)){
              $blueprint = new Blueprint(['model' => 'null']); // We need a Blueprint instance to get access to blueprint->extend()
              $properties[$propertyName] = $blueprint->extend($property);
              $properties[$propertyName] = $this->extendRecursively($properties[$propertyName], ($propertyName == 'fields'));
            }
          }
          if ($isField) {
            $fieldForm = new Form(array_merge([
              'fields' => $properties,
              'model'  => $this->data['model'] ?? null
            ], $this->data));
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