---
title: Magento2 mock classes for removed core modules
author: Cyrill
date: 2018-07-01
disqus_identifier: /2018/07/01/mage2mocks/
categories:
  - Projects
tags:
  - Magento2
  - Mocks
  - Performance
---

How to physically remove unneeded Magento2 core modules (even those with
dependencies) via composer.json with the help of this module providing mock
classes.

<!--more-->

Abstract: Magento 2 provides many modules for your convenience but you don't
need all of those modules. Removing them introduces a slimmer code base, less
confusion and less WTFs.

Removed PHP and XML files even improve the overall performance of your store. I
currently haven't done any measurement but this seems obvious.

There are two types of modules for considering removing:

1. Those without any hidden dependencies to other modules
2. Those with code references in other modules.

### Core modules without any hidden dependencies to other modules

Please refer to integer_net (Andreas von Studnitz) blog post <a
href="https://www.integer-net.com/removing-unused-core-modules-from-magento-2-the-right-way"
target="_blank">Removing unused core modules from Magento 2 – the right way</a>.

Andreas lists for Magento 2.2.3 and 2.2.5 the modules which can be physically
removed without any danger. For example the excerpt from the final root
composer.json file (found at the end of this blog post in the Github repo) for
2.2.5 looks like, with my even more added modules:

```javascript
    "replace": {
        "magento/module-admin-notification": "*",
        "magento/module-dhl": "*",
        "magento/module-fedex": "*",
        "magento/module-marketplace": "*",
        "magento/module-captcha": "*",
        "magento/module-persistent": "*",
        "magento/module-catalog-rule-configurable": "*",
        "magento/module-authorizenet": "*",
        "magento/module-google-adwords": "*",
        "magento/module-sample-data": "*",
        "magento/module-send-friend": "*",
        "magento/module-swagger": "*",
        "magento/module-swatches": "*",
        "magento/module-swatches-layered-navigation": "*",
        "magento/module-tax-import-export": "*",
        "magento/module-google-optimizer": "*",
        "magento/module-ups": "*",
        "magento/module-encryption-key": "*",
        "magento/module-usps": "*",
        "magento/module-release-notification": "*",
        "magento/module-braintree": "*",
        "magento/module-webapi-security": "*",
        "magento/module-weee": "*",
        "magento/module-signifyd": "*",
        "magento/module-analytics": "*",
        "magento/module-catalog-analytics": "*",
        "magento/module-customer-analytics": "*",
        "magento/module-quote-analytics": "*",
        "magento/module-review-analytics": "*",
        "magento/module-sales-analytics": "*",
        "magento/module-wishlist-analytics": "*",
        "temando/module-shipping-m2": "*",
        "dotmailer/dotmailer-magento2-extension": "*",
        "shopialfb/facebook-module": "*",
        "klarna/module-kp": "*",
        "klarna/module-ordermanagement": "*",
        "klarna/module-core": "*",
        "amzn/amazon-pay-and-login-magento-2-module": "*",
        "vertex/module-tax": "*"
    },
```

BTW: Andreas suggests to remove `Magento\Multishipping` because it does not list
any dependencies but `Magento\GiftMessage` lists it in the `di.xml`, so bummer.
But for a solution to keep GiftMessage despite having Multishipping removed,
keep on reading.

### Core modules with code references in other modules.

The above list gets now extended with core modules but they have some code
occurrences in the other core modules.


```javascript
    "replace": {
        // .... see above
        "magento/module-multishipping": "*",
        "magento/module-rss": "*",
        "magento/module-bundle": "*",
        "magento/module-bundle-import-export": "*",
        "magento/module-downloadable": "*",
        "magento/module-downloadable-import-export": "*",
        "magento/module-msrp": "*",
        "magento/module-newsletter": "*",
        // add more modules ...
        // .... see above
    },
```

For example adding the `Magento\Bundle` module to the list would throw during
`setup:di:compile` an error:

```text
$ ./bin/magento setup:di:compile
Compilation was started.
Interception cache generation... 6/7 [========================>---]  85% 1 min 166.0 MiBErrors during configuration scanning:
	Magento\Bundle\Api\Data\OptionInterfaceFactory
		Invalid Factory for nonexistent class Magento\Bundle\Api\Data\OptionInterface in file /var/www/project/setup/src/Magento/Setup/Model/FixtureGenerator/BundleProductTemplateGenerator.php
	Magento\Bundle\Api\Data\LinkInterfaceFactory
		Invalid Factory for nonexistent class Magento\Bundle\Api\Data\LinkInterface in file /var/www/project/setup/src/Magento/Setup/Model/FixtureGenerator/BundleProductTemplateGenerator.php
Total Errors Count: 2


  [Magento\Framework\Validator\Exception]
  Error during compilation


setup:di:compile
```

```text
$ ./bin/magento setup:di:compile
Compilation was started.
Repositories code generation... 1/7 [====>-----------------------]  14% 1 sec 34.0 MiB

  [RuntimeException]
  Source class "\Magento\Bundle\Model\Product\Price" for "Magento\Bundle\Model\Product\PriceFactory" generation does not exist.


setup:di:compile
```

The above error message is easy to spot. But sometimes the errors aren't that
obvious and only reveal by loading certain areas in the adminhtml backend or
running a cronjob. Then you have to take a look into `var/log/*log` files or
`var/report/*` or `/var/log/nginx/error.log` folder to see the required class and its method.

In some cases the CLI suppresses the real source of the error and then things
escalate quickly ;-(. I've done some research for you and created already some
mock classes. You can now add `"schumacherfm/mage2-mocks": "X.Y.Z"` to your root
composer.json file to mock the missing classes.

As you can see below, we need mocks for Multishipping, Bundle, Downloadable
GroupedProduct, Msrp, Newsletter, ProductAlert, ProductVideo and Review. More
core modules should be added depending on what you would like to remove.

```javascript
  "autoload": {
    "psr-4": {
      "Magento\\Multishipping\\Model\\Checkout\\Type\\": "vendor/schumacherfm/mage2-mocks/Mocks/Multishipping/Model/Checkout/Type",
      "Magento\\Multishipping\\Helper\\": "vendor/schumacherfm/mage2-mocks/Mocks/Multishipping/Model/Checkout/Type",
      "Magento\\Bundle\\Api\\Data\\": "vendor/schumacherfm/mage2-mocks/Mocks/Bundle/Api/Data",
      "Magento\\Bundle\\Model\\Product\\": "vendor/schumacherfm/mage2-mocks/Mocks/Bundle/Model/Product",
      "Magento\\Bundle\\Model\\ResourceModel\\": "vendor/schumacherfm/mage2-mocks/Mocks/Bundle/Model/ResourceModel",
      "Magento\\Downloadable\\Model\\Product\\": "vendor/schumacherfm/mage2-mocks/Mocks/Downloadable/Model/Product",
      "Magento\\GroupedProduct\\Model\\ResourceModel\\Product\\": "vendor/schumacherfm/mage2-mocks/Mocks/GroupedProduct/Model/ResourceModel/Product",
      "Magento\\Framework\\": "site/lib/internal/Magento/Framework/",
      "Magento\\Msrp\\Helper\\": "vendor/schumacherfm/mage2-mocks/Mocks/Msrp/Helper",
      "Magento\\Msrp\\Pricing\\Price\\": "vendor/schumacherfm/mage2-mocks/Mocks/Msrp/Pricing/Price",
      "Magento\\Newsletter\\Model\\": "vendor/schumacherfm/mage2-mocks/Mocks/Newsletter/Model",
      "Magento\\Newsletter\\Model\\ResourceModel\\Queue\\": "vendor/schumacherfm/mage2-mocks/Mocks/Newsletter/Model/ResourceModel/Queue",
      "Magento\\ProductAlert\\Model\\": "vendor/schumacherfm/mage2-mocks/Mocks/ProductAlert/Model",
      "Magento\\ProductVideo\\Block\\Adminhtml\\Product\\Edit\\": "vendor/schumacherfm/mage2-mocks/Mocks/ProductVideo/Block/Adminhtml/Product/Edit",
      "Magento\\Review\\Block\\Adminhtml\\": "vendor/schumacherfm/mage2-mocks/Mocks/Review/Block/Adminhtml",
      "Magento\\Review\\Helper\\": "vendor/schumacherfm/mage2-mocks/Mocks/Review/Helper",
      "Magento\\Review\\Model\\Rating\\Option\\": "vendor/schumacherfm/mage2-mocks/Mocks/Review/Model/Rating/Option",
      "Magento\\Review\\Model\\ResourceModel\\Review\\": "vendor/schumacherfm/mage2-mocks/Mocks/Review/Model/ResourceModel/Review",
      "Magento\\Setup\\": "site/setup/src/Magento/Setup/"
    }
  },
// more stuff ...
```

Add the above lines depending on your removed modules to your root composer.json
and run either: `$ composer.phar dumpautoload -o` or  `$ composer.phar update -o`.

If you add a mock class in the PSR-4 section and still have the module enabled
you might see unexpected business logic in your code. Composer will also
complain with `Ambiguous class resolution`.

The tests in folder `dev/tests` will not work properly so you need to excluded
the tests.

Some core modules are missing in the Magento2-Mocks module and maybe you can
send me a pull request to add their mocks.

{{% hubinfo u="SchumacherFM" r="Magento2-Mocks" c="5" %}}

[https://github.com/SchumacherFM/Magento2-Mocks](https://github.com/SchumacherFM/Magento2-Mocks)
