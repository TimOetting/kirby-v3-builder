<?php

use Kirby\Form\Form;
use Kirby\Cms\Blueprint;
use Kirby\Form\Field;
use Kirby\Form\Fields;

Kirby::plugin('timoetting/builder', [
  'options' => array(
    'cache' => true,
  ),
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
        },
        'cssUrls' => function() {
            $cssUrls = array_map(function($arr) {
                return array_key_exists('css', $arr['preview']) ? $arr['preview']['css'] : '';
            }, $this->fieldsets);
            $cssUrls = array_filter($cssUrls);
            $cssUrls = array_unique($cssUrls);
            $cssUrls = array_values($cssUrls);
            return $cssUrls;
        },
        'jsUrls' => function() {
            $jsUrls = array_map(function($arr) {
                return array_key_exists('js', $arr['preview']) ? $arr['preview']['js'] : '';
            }, $this->fieldsets);
            $jsUrls = array_filter($jsUrls);
            $jsUrls = array_unique($jsUrls);
            $jsUrls = array_values($jsUrls);
            return $jsUrls;
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
  'api' => [
    'routes' => [
      [
        'pattern' => 'kirby-builder/get-preview',
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
            'preview' => snippet($snippet, ['page' => $originalPage, $modelName => $page->content()], true) 
          );
        }
      ],
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
]);