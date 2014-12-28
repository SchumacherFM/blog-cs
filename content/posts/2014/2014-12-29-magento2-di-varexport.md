---
title: Magento2 - Speed up DI with var_export and include instead of serialize
author: Cyrill
date: 2014-12-29
disqus_identifier: /2014/12/29/mage2-di-varexport/
categories:
  - Thoughts
tags:
  - Magento2
  - Performance
  - Failure
---

Poking around in Magento2 ...

<!--more-->

Gist of the speed testing script: 

{{<gist id="7fa66882520c3ccffaa4" >}}


Add to your config.php the entry definition -> format and then the appropriate entry of either
*igbinary* or *serialize*.

```
<?php
return array(
    'definition' => [
        'format' => 'varexport'
    ],
```