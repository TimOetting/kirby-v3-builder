<?php

use Kirby\Cms\Blueprint;

Kirby::plugin('timoetting/testfield', [
  'fields' => [
    'builder' => [
      'props' => [
          'value' => function ($value = null) {
            return Yaml::decode($value);
          },
          'fieldsets' => function ($fieldSets = null) {
            $fieldSets = Yaml::decode($fieldSets);
            $fieldSets = extendRecursively($fieldSets);
            return $fieldSets;
          },
          'pageUid' => function () {
            return $this->model()->uid();
          },
          'pageId' => function () {
            return $this->model()->id();
          },
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
    [
      'pattern' => 'test',
      'method' => 'GET',
      'action'  => function () {
        dump(kirby()->session()->data());
      }
    ]
  ] ,   
  'templates' => [
    'snippet-wrapper' => __DIR__ . '/templates/snippet-wrapper.php'
  ],
  'panel' => [
    'js' => 'assets/css/panel.js'
  ]
]);

function extendRecursively($fields) {
  foreach ($fields as $fieldName => $field) {
    if(is_array($field)){
      $fields[$fieldName] = Blueprint::extend($field);
      $fields[$fieldName] = extendRecursively($fields[$fieldName]);
    }
  }
  return $fields;
}