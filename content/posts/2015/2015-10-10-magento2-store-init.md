---
title: Magento2 Stores and Scopes v1.0.0
author: Cyrill
date: 2015-10-10
disqus_identifier: /2015/10/10/mage2-stores-and-scopes-v100/
categories:
  - Thoughts
tags:
  - Magento2
  - CoreStore
---

Exploring the *Store* package and its init process with scopes in Magento2 (1.0.0-beta).

See the [previous post](2015/04/20/magento2-stores-and-scopes/) where we've explored 
the differences between Magento 1.9 and Magento 2 0.74.0 regarding Scopes and Websites, 
Groups and Stores.

<!--more-->

# @todo
 
### StoreManager

With Magento2 there has been introduced the [`Magento\Store\Model\StoreManager`](https://github.com/magento/magento2/blob/develop/app%2Fcode%2FMagento%2FStore%2FModel%2FStoreManager.php) 
which is responsible for resolving the correct store during a request.

The StoreManager also defines the `MAGE_RUN_CODE` and `MAGE_RUN_TYPE` environment variables which are used in 
Nginx or Apache config to force set a specific website, store group or store view to a domain/path/etc. 
In PHP (especially in the index.php) it can be written like (don't do that in the core file):

```
$_SERVER[\Magento\Store\Model\StoreManager::PARAM_RUN_CODE] = 'website_code|group_id|store_code';
$_SERVER[\Magento\Store\Model\StoreManager::PARAM_RUN_TYPE] = 'website|group|store';
```

Yes you can even set the group_id in `MAGE_RUN_CODE` when `MAGE_RUN_TYPE` is `group`.

### StoreResolver

The StorageFactory has been replaced with the StoreResolver...

### StoresConfig

With Magento2 there has been introduced the [`Magento\Store\Model\StoresConfig`](https://github.com/magento/magento2/blob/develop/app%2Fcode%2FMagento%2FStore%2FModel%2FStoresConfig.php) 
which is a convenience helper class to retrieve (with method `getStoresConfigByPath()`) for a 
config path all config values for each store view. Only used in Customer group to check if the 
current group is the default group to create an account AND in `\Magento\Sales\Model\Observer\CleanExpiredQuotes` 
to clean the expired quotes.
