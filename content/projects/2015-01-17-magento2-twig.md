---
title: Twig Template Engine For Magento2
author: Cyrill
date: 2015-01-17
categories:
  - Projects
tags:
  - Magento2
  - Twig
  - Template
---

Magento2 itself uses PHP as the template engine (as what PHP has been developed for in ~1996 ;-) ).

The [Twig](http://twig.sensiolabs.org) template engine cannot execute directly PHP code which seems more secure.

<!--more-->

This module is meant to be used additionally to the `.phtml` files and does not 
provide any `.twig` template file.

The biggest advantage of using Twig templates instead of `.phtml` PHP native files is that you cannot
really add a lot of business logic and not even add database queries into the template.

Twig forces you to move you business logic into a model.

A use case for this Magento2 module would be if you write your first Magento2 module you can 
require this package and write all your template files in Twig.

{{% hubinfo u="SchumacherFM" r="Magento2-Twig" c="5" %}}

Tweets
-------

<blockquote class="twitter-tweet" lang="en"><p>Magento2 modularity: 
<a href="https://twitter.com/SchumacherFM">@SchumacherFM</a> replaced the templating engine with only a 
few config files and 150 lines of code <a href="https://t.co/Xz5VfYSXXa">https://t.co/Xz5VfYSXXa</a>
</p>&mdash; Fooman (@foomanNZ) 
<a href="https://twitter.com/foomanNZ/status/556715856638390273">January 18, 2015</a></blockquote>

<blockquote class="twitter-tweet" lang="en"><p>
<a href="https://twitter.com/SchumacherFM">@SchumacherFM</a> 
<a href="https://twitter.com/akent99">@akent99</a> perfect example of when Magento should not build 
and let an extension/module be built from the community</p>&mdash; Paul Boisvert (@ProductPaul) 
<a href="https://twitter.com/ProductPaul/status/556733000172724224">January 18, 2015</a></blockquote>

Events & Configuration
-------------

The Twig template engine class dispatches two events so that you can modify Twig.

Event `twig_loader` with event object `loader`. You can set `loader` any other class which implements
`Twig_LoaderInterface`. [http://twig.sensiolabs.org/doc/api.html#loaders](http://twig.sensiolabs.org/doc/api.html#loaders)

Event `twig_init` with event object `twig`. You can add here more functions, filters, tags, etc.
[http://twig.sensiolabs.org/doc/advanced.html](http://twig.sensiolabs.org/doc/advanced.html)

Configuration options can be found Stores -> Settings -> Configuration -> Advanced -> Developer -> Twig.

Frontend Integration
--------------------

Your template files must have the file extension `.twig` to get automatically recognized.

In your layout xml files or blocks please specify the new template

```xml
<referenceBlock name="top.links">
    <block class="Magento\Theme\Block\Html\Header" template="html/header.twig" name="header" as="header" before="-">
        <arguments>
            <argument name="show_part" xsi:type="string">welcome</argument>
        </arguments>
    </block>
</referenceBlock>
```

#### Example header.phtml converted to header.twig

```php
<?php switch ($this->getShowPart()):
    case 'welcome': ?>
        <li class="greet welcome"><?php echo $this->getWelcome() ?></li>
    <?php break; ?>
    <?php case 'other': ?>
        <?php echo $this->getChildHtml(); ?>
    <?php break; ?>
<?php endswitch; ?>
```

```twig
{% if getShowPart() == 'welcome' %}
    <li class="greet welcome">{{ getWelcome() }}</li>
{% endif %}

{% if getShowPart() == 'other' %}
    {{ getChildHtml() }}
{% endif %}
```

#### Example breadcrumbs.phtml converted to breadcrumbs.twig

```php
<?php if ($crumbs && is_array($crumbs)) : ?>
<div class="breadcrumbs">
    <ul class="items">
        <?php foreach ($crumbs as $crumbName => $crumbInfo) : ?>
            <li class="item <?php echo $crumbName ?>">
            <?php if ($crumbInfo['link']) : ?>
                <a href="<?php echo $crumbInfo['link'] ?>" title="<?php echo $this->escapeHtml($crumbInfo['title']) ?>">
                    <?php echo $this->escapeHtml($crumbInfo['label']) ?>
                </a>
            <?php elseif ($crumbInfo['last']) : ?>
                <strong><?php echo $this->escapeHtml($crumbInfo['label']) ?></strong>
            <?php else: ?>
                <?php echo $this->escapeHtml($crumbInfo['label']) ?>
            <?php endif; ?>
            </li>
        <?php endforeach; ?>
    </ul>
</div>
<?php endif; ?>
```

```twig
{% if crumbs %}
<div class="breadcrumbs">
    <ul class="items">
    {% for crumbName,crumbInfo in crumbs %}
        <li class="item {{ crumbName }}">
            {% if crumbInfo.link %}
                <a href="{{ crumbInfo.link }}" title="{{ crumbInfo.title }}">
                    {{ crumbInfo.label }}
                </a>
            {% elseif crumbInfo.last %}
                <strong>{{ crumbInfo.label }}</strong>
            {% else %}
                {{ crumbInfo.label }}
            {% endif %}
        </li>
    {% endfor %}
    </ul>
</div>
{% endif %}
```

#### Access helper methods

Write in your `.twig` file:

```
{{ helper("Magento\\Core\\Helper\\Url").getHomeUrl() }}
```

Installation via Composer
------------

Add the following to the require section of your Magento 2 `composer.json` file

    "schumacherfm/mage2-twig": "dev-master"

additionally add the following in the repository section

        "repositories": [
        {
            "type": "vcs",
            "url": "https://github.com/SchumacherFM/Magento2-Twig.git"
        }
    ]
    
run `composer update`

add the following to `app/etc/config.php`

    'SchumacherFM_Twig'=>1
