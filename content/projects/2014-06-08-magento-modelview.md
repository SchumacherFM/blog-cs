---
title: Magento ModelView
author: Cyrill
date: 2014-06-08
disqus_identifier: /2014/06/08/magento-modelview/
categories:
  - Projects
tags:
  - Magento
  - ModelView
---

Magento ModelView - Using a model to simulate a database view. 
This module contains only abstract classes. 
getData() is now type safe. `__call()` disabled. 
<!--more-->

{{% hubinfo u="SchumacherFM" r="Magento-ModelView" c="5" %}}


This module contains only abstract classes.

- `getData()` is now type safe
- All `__call()` methods are disabled
- All data modifying functions throw an exception
- Currently only catalog/product views are supported


Developer Usage
---------------

@todo

