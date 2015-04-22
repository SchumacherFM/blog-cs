---
title: Magento2 Stores and Scopes
author: Cyrill
date: 2015-04-20
disqus_identifier: /2015/04/20/mage2-stores-and-scopes/
categories:
  - Thoughts
tags:
  - Magento2
  - CoreStore
---

Exploring the *Store* package and its init process with scopes in Magento2 (0.74.0-beta4) and Magento1 (1.9 CE).

<!--more-->

A quick overview of some demo stores on how it looks in the Magento2 backend. 
The confusing name *Store* of the middle column should be called *Store Group*.

![Graphical view of websites and stores](wp-content/uploads/magento2_website_stores.png)

### Stores

Overview of the models and database tables. Each of the model is also its own scope. 
In addition there is also the default scope. In total: 4 scopes.

| Magento | Backend Label | Website | StoreGroup | Store View |
| ------------- |-----------| --------------|---------|---------|
| v1 | Model Class | `Mage_Core_Model_Website` | `Mage_Core_Model_Store_Group` | `Mage_Core_Model_Store` |
| v1 | Database Table | `core_website` | `core_store_group` | `core_store` |
| v2| Model Class | [`Magento\Store\Model\Website`](https://github.com/magento/magento2/blob/develop/app%2Fcode%2FMagento%2FStore%2FModel%2FWebsite.php) | [`Magento\Store\Model\Group`](https://github.com/magento/magento2/blob/develop/app%2Fcode%2FMagento%2FStore%2FModel%2FGroup.php) | [`Magento\Store\Model\Store`](https://github.com/magento/magento2/blob/develop/app%2Fcode%2FMagento%2FStore%2FModel%2FStore.php) |
| v2 | Database Table | `store_website` | `store_group` | `store` |

Relation view of the three tables:

![Store Table relations](wp-content/uploads/magento2_store_relations.png)

Important: Table `store` has a unique key on column `code`. Why that is important will be explained later.

### Scopes


`app/code/Magento/Store/Model/ScopeInterface.php` defines these scope types:

    const SCOPE_STORES = 'stores';
    const SCOPE_WEBSITES = 'websites';

    const SCOPE_STORE   = 'store';
    const SCOPE_GROUP   = 'group';
    const SCOPE_WEBSITE = 'website';

where as `lib/internal/Magento/Framework/App/ScopeInterface.php` defines the default global scope:

	const SCOPE_DEFAULT = 'default';

These *single scope names* are mainly used to retrieve via PHP a configuration value:


**SCOPE_STORE ~973x**

```
$this->_scopeConfig->getValue('path/to/key', \Magento\Store\Model\ScopeInterface::SCOPE_STORE);

$useCategoryUrl = $this->_scopeConfig->getValue(
    \Magento\Catalog\Helper\Product::XML_PATH_PRODUCT_URL_USE_CATEGORY,
    \Magento\Store\Model\ScopeInterface::SCOPE_STORE,
    $this->getStoreId() // can be either a store_id or store_code
);

$this->scopeConfig->isSetFlag(
    Url::XML_PATH_CUSTOMER_STARTUP_REDIRECT_TO_DASHBOARD,
    ScopeInterface::SCOPE_STORE
);

```

**SCOPE_GROUP ~9x**

Mostly used in these switch statements and more often in unit tests.

```
switch ($type) {
    case \Magento\Store\Model\ScopeInterface::SCOPE_WEBSITE:
        $this->_loadWebsiteCollection();
        break;
    case \Magento\Store\Model\ScopeInterface::SCOPE_GROUP:
        $this->_loadGroupCollection();
        break;
    case \Magento\Store\Model\ScopeInterface::SCOPE_STORE:
        $this->_loadStoreCollection();
        break;
    default:
        break;
}
```

**SCOPE_WEBSITE ~63x**

```
$this->config->getValue('catalog/price/scope', \Magento\Store\Model\ScopeInterface::SCOPE_WEBSITE);
```

Used all over the place in different szenarios.

The *plural scope names* and *default* are used to handle the SQL statements for table `core_config_data` 
together with the scope_id (= store_id).

![core_config_data table](wp-content/uploads/magento2_core_config_data.png)

**Unique key on: scope, scope_id and path.**

- `SCOPE_STORES` is mainly used in [`\Magento\Store\Model\Config\Reader\Store`](https://github.com/magento/magento2/blob/develop/app%2Fcode%2FMagento%2FStore%2FModel%2FConfig%2FReader%2FStore.php).
- `SCOPE_WEBSITES` is mainly used in [`\Magento\Store\Model\Config\Reader\Website`](https://github.com/magento/magento2/blob/develop/app%2Fcode%2FMagento%2FStore%2FModel%2FConfig%2FReader%2FWebsite.php).


#### Scope Matrix

|  &nbsp; |Default	| Website	| Store Group | Store View |
| ---| -------| ------| -------------| ----------- |
| URL rewrites |	&nbsp; | &nbsp; | &nbsp; |X |
| Product settings |	X | &nbsp; | &nbsp; |X |
| Product prices |	X | X | &nbsp; |  &nbsp; |
| Product tax class |	X |	X | &nbsp; | &nbsp; |
| Base currency |	X |	X | &nbsp; | &nbsp; |
| (Default) display currency | X | &nbsp; | &nbsp; | X |
| Category settings	| X | &nbsp; | &nbsp; | X |
| System configuration settings | X| X | &nbsp; | X |
| Root category configuration	| &nbsp; | &nbsp; | X |  &nbsp; |
| Orders	| &nbsp; | &nbsp; | &nbsp; |  X |
| Customers | X | X | &nbsp; | &nbsp; |	
| CMS Page | X |&nbsp; |&nbsp; | X | 	
| CMS Block | X |&nbsp; |&nbsp; | X | 	
| Checkout Agreements | X |&nbsp; |&nbsp; | X | 	
	
Inspired from [Aoe_ManageStores](http://fbrnc.net/blog/2012/02/magento-website-store-groups-store-views).


### StoreManager

With Magento2 there has been introduced the [`Magento\Store\Model\StoreManager`](https://github.com/magento/magento2/blob/develop/app%2Fcode%2FMagento%2FStore%2FModel%2FStoreManager.php) which is wrapper abround the `Magento\Store\Model\Storage\Db` or `\Magento\Store\Model\Storage\DefaultStorage`. The `DefaultStorage` will only be used in testing.

The StoreManager also defines the `MAGE_RUN_CODE` and `MAGE_RUN_TYPE` environment variables which are used in 
Nginx or Apache config to force set a specific website, store group or store view to a domain/path/etc. 
In PHP (especially in the index.php) it can be written like (don't do that in the core file):

```
$_SERVER[\Magento\Store\Model\StoreManager::PARAM_RUN_CODE] = 'website_code|group_id|store_code';
$_SERVER[\Magento\Store\Model\StoreManager::PARAM_RUN_TYPE] = 'website|group|store';
```

Yes you can even set the group_id in `MAGE_RUN_CODE` when `MAGE_RUN_TYPE` is `group`.

### StorageFactory

With Magento2 there has been introduced the [`Magento\Store\Model\StorageFactory`](https://github.com/magento/magento2/blob/develop/app%2Fcode%2FMagento%2FStore%2FModel%2FStorageFactory.php) which is only used within the `StoreManager` and instantiates the `Storage\Db` or `Storage\DefaultStorage` depending on website code, group id or store code.

StorageFactory responsibilities are detecting which website/store to load and to reinit the collections 
of websites, store groups and stores.

Errors during init process when a `RUN_CODE` or `RUN_TYPE` string cannot be found:

1. `\Magento\Store\Model\StorageFactory:_reinitStores()`: Store Manager has not been initialized properly.
2. `\Magento\Store\Model\Storage\Db::getStore()`: Store Manager has been initialized not properly.

Confusing messages... 😂 and its meanings are:

1. The scope type (store, group, website) cannot be found. Mostly a typo in `$_SERVER['MAGE_RUN_TYPE']`. 
See all options [in the scopeType switch](https://github.com/magento/magento2/blob/develop/app%2Fcode%2FMagento%2FStore%2FModel%2FStorageFactory.php#L151).
2. The call `getStore()` in the `Storage\Db` class returns null, no (default) store found. 

The [scopeType switch](https://github.com/magento/magento2/blob/develop/app%2Fcode%2FMagento%2FStore%2FModel%2FStorageFactory.php#L151) (in 1.) 
sets the store depending on the scopeCode which can be website code, group id or store code.

If all scopes and stores have been found the current store can be overridden in the following order with:

1. Cookie Name `\Magento\Store\Model\Store::COOKIE_NAME` => `store`. If found then `setCurrentStore()` will be called.
2. Request: Either in `$_GET` or in `$_POST` (and maybe also in `$_COOKIE`). Name: `___store`. If found 
then `setCurrentStore()` will be called if this method returns true then check if ___store is equal 
to the current store then check if the websites default store is equal to 
the __store -> cookie delete else 2x cookie create.

The Request always wins in setting a store but only if: see next.

`setCurrentStore($storage, $scopeCode, $scopeType)` implements besides setting the store also some 
checks: Prevent running a store from another website or store group, if website or store group was 
specified explicitly. Falls back to the default store for a website or store group.

The store code in a request parameter will be used to select a store from `store` table. Therefore 
the column `code` must be unique.

### StoresConfig

With Magento2 there has been introduced the [`Magento\Store\Model\StoresConfig`](https://github.com/magento/magento2/blob/develop/app%2Fcode%2FMagento%2FStore%2FModel%2FStoresConfig.php) 
which is a convenience helper class to retrieve (with method `getStoresConfigByPath()`) for a 
config path all config values for each store view. Only used in Customer group to check if the 
current group is the default group to create an account AND in `\Magento\Sales\Model\Observer\CleanExpiredQuotes` 
to clean the expired quotes.

### Other

During code review I've found a lot of unused properties and variables in Magento2 Store module. No I didn't send a PR ...