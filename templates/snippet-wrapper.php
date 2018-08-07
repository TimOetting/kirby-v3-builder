<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <?php if ($page->csspath()): ?>
    <?= css([$page->csspath(), '@auto']) ?>
  <?php endif ?>
</head>
<body>
  
<?php
// dump($page->snippetcontent()->yaml()['eventlist']) 
// dump($page->snippetcontent()->yaml())
snippet($page->snippetpath(), $page->snippetcontent()->yaml()); 
// snippet($page->snippetpath()); 
// snippet($page->snippetpath(), ['data' => $page->snippetcontent()]); 
?>

</body>
</html>