---
title: Magento2 - REST API Permissions
author: Cyrill
date: 2015-01-03
disqus_identifier: /2015/01/03/mage2-rest-api-permissions/
categories:
  - Thoughts
tags:
  - Magento2
  - REST API
---

After exploring the Magento2 REST API because I want to implement it into my Wanderlust project
I've figured out many many missing features and bugs ...

<!--more-->

The [Wanderlust project](https://github.com/SchumacherFM/wanderlust) should become one day a cache warmer
for any kind of web app supplied with data from any kind of source. Integrated cron jobs for automatic polling
and concurrent requests completing the picture for the perfect cache warmer.

Wanderlust is written in GoLang and therefore we only have one binary which contains everything. Images, CSS, JS
the cron functions and also the database. This binary can be cross compiled for nearly any operating system.

Additional features and interfaces can be bought via an in-app-purchase. If a customer buys a module the Wanderlust
app gets automatic recompiled and can then be downloaded by the customer. The integrated shop system is 
based on AngularJS and pulls fresh product data from a remote Magento2 store.

With the single binary concept in mind and running everywhere my requirements are that anonymous users retrieve
product data from the Magento2 REST API. Once a customers adds a feature to the cart an automatic frontend
session will be created and the customer can proceed to the checkout.

I've started to create the module [Magento2 Advanced Rest Permissions](https://github.com/SchumacherFM/mage2-advanced-rest-permissions)
which adds only guest roles to the authorization table to access Mage_Catalog. So guest can also 
modify and delete products resp. categories.

**The excerpt from the projects readme:**

Adds new REST guest permission to the Integration and Webapi Module especially when you
would like to use Magento2 with an AngularJS frontend where the AngularJS frontend can
run anywhere.

This module was only created for learning purposes but I've figured out after deeper code review
that overall integration of the WebAPI needs more changes. 

At the moment this module adds a guest user to the `authorization_role` table with read/write permissions
to Magento_Catalog::catalog, Magento_Catalog::catalog_inventory, Magento_Catalog::products and
Magento_Catalog::categories. Due to the missing granularity of permissions we have the write access. See below
for a more detailed description.

Switch to the *Integrations* backend section and click on the button *Add Guest Access*. That's it. You cannot
edit this integration nor active it (See below). The following REST routes (GET, PUT, POST, DELETE) are available:

- http://magento2.local/rest/V1/products/:sku/media
- http://magento2.local/rest/V1/categories
- http://magento2.local/rest/V1/categories/:id/products


The further modifications will be:

- Create a guest token only for specific routes like add to cart. Use this token also for the checkout. Avoid to 
force the guest to login in or to first create an account and then s/he can add a product to the cart.
- Create an (automatic) customer token for specific routes like customer login, customer account create, etc. 
Login feature integrated in CustomerTokenService via route /V1/integration/customer/token and also in Magento\Customer\Api\AccountManagementInterface
- Maybe merge more product data into new routes to avoid querying multiple endpoints.
- Extend [Catalog|Sales]/etc/acl.xml with more granular permissions so that a guest can only read from endpoints 
(needs to be defined) and not modify them. Investigate also other extensions which have an webapi.xml file.
- Extend Magento\Webapi\Model\Plugin\Service\V1\Integration and override protected methods to allow GUESTS
- Add observer to REST: "customer create" that an additional REST role in `authorization_role` table will be created
on a per customer basis. A customer can then have write access to the checkout/account/wishlist/etc.
- `<route url="/V1/carts/" method="POST">` can `createAnonymousCart()` BUT is secured via resource Magento_Sales::create
- Checkout plugins in Magento\Checkout\Model\Cart\Access needs to be modified so that UserContextInterface::USER_TYPE_CUSTOMER
will also be accepted
- Magento\Customer\Api looks well designed :-)
- Fix all performance issues in the Webapi module (see todo comments in the code)
- Fix bugs (sorting) when searching for products

As long as Mage2 is in beta phase it is not worth working on the above mentioned points. These issues needs to be added
and fixed.

Don't use this modules. There are many missing features in Magento2 which still needs to be implemented.
Especially in app/code/Magento/[Catalog|Sales]/etc/acl.xml to allow a more granular access.
