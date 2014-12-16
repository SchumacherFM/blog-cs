---
title: Magento OPCache Panel
author: Cyrill
date: 2013-12-20
disqus_identifier: /2013/12/20/magento-opcache/
categories:
  - Projects
tags:
  - Magento
  - OPCache
  - Backend
---

OpCache (Zend Optimizer) Control Panel (GUI) for the Magento Backend. 

<!--more-->

{{% hubinfo u="SchumacherFM" r="Magento-OpCache" c="5" %}}

OpCache Control Panel for Magento Backend.

Based on: [https://gist.github.com/ck-on/4959032](https://gist.github.com/ck-on/4959032)

![image](https://raw.github.com/SchumacherFM/Magento-OpCache/master/doc/Magento-OpCache-PS1.jpg)

- Recheck Cache
- Reset Cache
- Compile all PHP Files in directories app and lib
- SVG pie charts with live reload every 5 seconds.
- APC/APCu integration lacks (looking for contributors)

Configuration
-------------

System -> Configuration -> System -> OpCachePanel Settings

Set here the API Key name and value for resetting the cache via cURL or wget with a post request.

```
curl --data "keyName=keyValue" http://magento-store.tld/opcachepanel
```


Developer Usage
---------------

See model SchumacherFM_OpCachePanel_Model_Cache:

```
<?php  Mage::getModel('opcache/cache')->reset(); ?>
```
You cannot clear the cache via command line. Please use the cURL post command.

Todo
----

- Use line charts with a live view
- internal refactorings
- integrate APC better


About
-----

- Key: SchumacherFM_OpCache
- Current Version: 1.0.2
- [Download tarball](https://github.com/SchumacherFM/Magento-OpCache/tags)
- Donation: [http://www.seashepherd.org/](http://www.seashepherd.org/)
