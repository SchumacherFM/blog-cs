---
title: Magento2 - Speed up DI with var_export + include instead of serialize
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

Poking around in Magento2 I stumbled upon `Magento\Framework\ObjectManager\DefinitionFactory` which takes care of how the cached DI (Dependency Injections) definitions are loaded. I've created a Pull Request but never submitted it.

<!--more-->

#### TL;DR: Use [igbinary](https://github.com/igbinary/igbinary)

Reviewing `DefinitionFactory` I saw that it only implements `serialize` and `igbinary`. My thoughts are: Hey there are faster methods like direct PHP code cached via OPcache! So I've implement the *var_export and include* feature.

### Adding the feature

`Var_export()` generates a PHP parseable array which can be loaded via `include()` if you write the output of `var_export()` into a file.

Implementation details of the `include()` code can be seen here: [lib/internal/Magento/Framework/ObjectManager/DefinitionFactory.php](https://github.com/SchumacherFM/magento2/commit/09ee71bd6bcffbd30be4d544ffd26ac29e3cc9b1#diff-5b9f9c6ab7bacd2aa9378ae0bc53c90aL58).

The CLI script `dev/tools/Magento/Tools/Di/compiler.php` manages the traversing through all the di.xml files and other PHP files to generate a PHP array with all the dependencies. The `var_export()` method was quickly [implemented](https://github.com/SchumacherFM/magento2/commit/09ee71bd6bcffbd30be4d544ffd26ac29e3cc9b1#diff-0fcf901b66f540cf0bebab8648a1cae4L27) with the new class [dev/tools/Magento/Tools/Di/Definition/Serializer/VarExport.php](https://github.com/SchumacherFM/magento2/commit/09ee71bd6bcffbd30be4d544ffd26ac29e3cc9b1#diff-2b5267482b7babe30d224238111fdeceR1) which handles the generation of the PHP code.

The whole commit with all changes has been put here [https://github.com/SchumacherFM/magento2/commit/09ee71bd6bcffbd30be4d544ffd26ac29e3cc9b1](https://github.com/SchumacherFM/magento2/commit/09ee71bd6bcffbd30be4d544ffd26ac29e3cc9b1).

### Activating the feature

Run the compiler with the new argument:

```
$ php dev/tools/Magento/Tools/Di/compiler.php --serializer=varexport
```

That script runs around ~1min with the default Magento2 installation. The new files (definitions.php, plugins.php and relations.php) will be stored in `var/di/`. Magento2 autodetects the files and loads them immediately.

Add to your `app/etc/config.php` the entry `definition -> format` and then the appropriate entry of either *igbinary*, *serialize* or *varexport*.

```
<?php
return array(
    'definition' => [
        'format' => 'varexport'
    ],
    ...
```

Now the average speed of your store has been increased. Really?

After everything was setup I've loaded the `admin/catalog/product/index` page a couple of times with the different serializers but the effects are marginal compared to each other.

Searching for other blog posts which covers the topic var_export vs serialize I must write a speed test to finally figure out which serializer provides best performance.

- From July 2009: [Cache a large array: JSON, serialize or var_export?](http://techblog.procurios.nl/k/news/view/34972/14863/cache-a-large-array-json-serialize-or-var_export.html) Winner: serialize. Tested without OPcache.
- From August 2011: [Storing arrays using JSON, serialize and var_export](http://ahoj.io/storing-arrays-using-json-serialize-and-var-export) Winner depends on the size of the array. Tested without OPcache.
- From January 2011: [This stackoverflow answer](http://stackoverflow.com/a/4820537) Winner: igbinary
- From Oct 2014: [Caching Data Structures in PHP](http://jrm.cc/posts/caching-data-structures-in-php/) Winner: var_export with Opcache (Array size up to 50kb)

### Speed test

Gist of the speed testing script: 

{{<gist id="7fa66882520c3ccffaa4" >}}

I ran this script in the browser instead of on the command line.

Apache and PHP version:

```
Server version: Apache/2.4.9 (Unix) (bundled with OSX 10.10)

PHP 5.5.20 (cli) (built: Dec 24 2014 11:56:08)
Copyright (c) 1997-2014 The PHP Group
Zend Engine v2.5.0, Copyright (c) 1998-2014 Zend Technologies
    with Zend OPcache v7.0.4-dev, Copyright (c) 1999-2014, by Zend Technologies
    with Xdebug v2.2.5, Copyright (c) 2002-2014, by Derick Rethans
```

Settings of OpCache:

```
zend_extension=/usr/local/php5/lib/php/extensions/no-debug-non-zts-20121212/opcache.so
[opcache]
opcache.enable=1
opcache.enable_cli=1
opcache.max_accelerated_files=12000
opcache.memory_consumption=256
opcache.interned_strings_buffer=16
opcache.save_comments=1
opcache.load_comments=1

; dev settings
opcache.validate_timestamps=1
opcache.revalidate_freq=0
```

Settings of XDebug:

```
zend_extension=/usr/local/php5/lib/php/extensions/no-debug-non-zts-20121212/xdebug.so
[xdebug]
xdebug.remote_enable=on
xdebug.default_enable=on
xdebug.remote_autostart=off
xdebug.remote_port=9000
xdebug.remote_host=localhost
xdebug.profiler_enable=0
xdebug.profiler_enable_trigger=1
xdebug.profiler_output_name=xdebug-profile-cachegrind.out-%H-%R
xdebug.var_display_max_children = 128
xdebug.var_display_max_data = 2048
xdebug.var_display_max_depth = 128
xdebug.max_nesting_level=200
```

#### Results

var_export: ~9 seconds

```
-rw-r--r--   1 user  _www  3275671 Dec 28 18:02 definitions.php
-rw-r--r--   1 user  _www    16162 Dec 28 18:02 plugins.php
-rw-r--r--   1 user  _www   986948 Dec 28 18:02 relations.php
```

serialize: ~5 seconds 

```
-rw-r--r--   1 user  _www  2142821 Dec 28 17:59 definitions.php
-rw-r--r--   1 user  _www    13624 Dec 28 17:59 plugins.php
-rw-r--r--   1 user  _www   842291 Dec 28 17:59 relations.php
```

igbinary: ~4.8 seconds

```
-rw-r--r--   1 user  _www  1552443 Dec 28 17:56 definitions.php
-rw-r--r--   1 user  _www    10261 Dec 28 17:56 plugins.php
-rw-r--r--   1 user  _www   426936 Dec 28 17:56 relations.php
```

The file size decreases also and remember that all .php files are stored within the Opcache.

### Rants about the unit tests

Running the unit tests:

```
cd ~/Sites/magento2/site/dev/tests/unit
$ ~/Sites/magento2/site/vendor/bin/phpunit -v --filter DefinitionFactoryTest
$ ~/Sites/magento2/site/vendor/bin/phpunit -v --filter BinaryTest
$ ~/Sites/magento2/site/vendor/bin/phpunit -v --filter SerializedTest
$ ~/Sites/magento2/site/vendor/bin/phpunit -v --filter ObjectManagerTest
$ ~/Sites/magento2/site/vendor/bin/phpunit -v --filter DefinitionFactoryTest
$ ~/Sites/magento2/site/vendor/bin/phpunit -v --filter VarExportTest
```

Each tests runs around: *Time: 23.49 seconds, Memory: 382.75Mb* which is pretty annoying to wait so long. Running tests in GoLang takes only milliseconds. Go is for me the first language where I enjoy writing tests, not only due to its speed also due to its idiomatic way.

### Optimal settings for Magento2

Your `app/etc/config.php` should look like:

```
<?php
return array(
    'definition' => [
        'format' => 'igbinary'
    ],
    ...
```

Run the compiler:

```
$ dev/tools/Magento/Tools/Di/compiler.php --serializer=igbinary
```

Add to your php.ini:

```
; Use igbinary as session serializer
session.serialize_handler=igbinary
```

See the [How to use](https://github.com/igbinary/igbinary#how-to-use) section on GitHub.

Don't freak out when you get this error in your store after reloading PHP:

Warning: igbinary_unserialize_header: unsupported version: 1601398131, should be 1 or 2 in ~/Sites/magento2/site/lib/internal/Magento/Framework/Session/SessionManager.php on line 166

Clear your session cache and reload.

### My final pull request

The final PR provides only a change in naming to stay consistent:

```
Usage: dev/tools/Magento/Tools/Di/compiler.php [ options ]
--serializer <word>           serializer function that should be used (serialize|binary) default = serialize
--verbose|-v                  output report after tool run
--extra-classes-file <string> path to file with extra proxies and factories to generate
--generation <string>         absolute path to generated classes, <magento_root>/var/generation by default
--di <string>                 absolute path to DI definitions directory, <magento_root>/var/di by default
Please, use quotes(") for wrapping strings.
```

Instead of `binary` the wording should go to `igbinary` as this name is also implemented in `DefinitionFactory.php` [line 59](https://github.com/magento/magento2/blob/develop/lib%2Finternal%2FMagento%2FFramework%2FObjectManager%2FDefinitionFactory.php#L59).
