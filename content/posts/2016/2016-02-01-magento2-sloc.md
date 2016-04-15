---
draft: false
title: 'Magento2: SLOC - Single Lines of Code'
author: Cyrill
date: 2016-04-15
disqus_identifier: /2016/04/15/magento2-sloc/
categories:
  - Thoughts
tags:
  - Magento2
---

Statistics about Magento2 lines of code, comments and used languages. Updated from time to time
and compared with different versions.

<!--more-->

Generating the data:

```
$ go install github.com/hotei/sloc
$ git clone https://github.com/magento/magento2.git
$ git checkout <tag>
$ composer.phar install
$ ./bin/magento setup:upgrade
$ ./bin/magento setup:di:compile
$ sloc
```

{{< mage2_sloc >}}
