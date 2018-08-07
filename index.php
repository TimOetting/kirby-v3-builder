<?php

Kirby::plugin('timoetting/testfield', [
  'fields' => [
    'builder' => [
      'props' => [
          'value' => function ($value = null) {
              return Yaml::decode($value);
          },
          'fieldsets' => function ($subfields = null) {
            return Yaml::decode($subfields);
          },
      ],
    ],
  ],
  'routes' => [
    [
      'pattern' => 'api/kirby-builder/preview',
      'method' => 'POST',
      'action'  => function () {
        // return get('snippetpath');
        $responsePage = new Page([
          'slug' => 'virtual-reality',
          'template' => 'snippet-wrapper',
          // 'content' => $data
          'content' => [
            'snippetpath' => (isset(get('preview')['snippet'])) ? get('preview')['snippet'] : null,
            'csspath' => (isset(get('preview')['css'])) ? get('preview')['css'] : null,
            'snippetcontent'  => get('blockcontent')
          ]
        ]);
        return [
          'code' => 200,
          'status' => 'ok',
          'data' => $responsePage->render(),
          'type' => 'model'
        ];
      }
    ],
    [
      'pattern' => 'api/kirby-builder/preview',
      'method' => 'POST',
      'action'  => function () {
        // return get('snippetpath');
        $responsePage = new Page([
          'slug' => 'virtual-reality',
          'template' => 'snippet-wrapper',
          // 'content' => $data
          'content' => [
            'snippetpath' => (isset(get('preview')['snippet'])) ? get('preview')['snippet'] : null,
            'csspath' => (isset(get('preview')['css'])) ? get('preview')['css'] : null,
            'snippetcontent'  => get('blockcontent')
          ]
        ]);
        return [
          'code' => 200,
          'status' => 'ok',
          'data' => $responsePage->render(),
          'type' => 'model'
        ];
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