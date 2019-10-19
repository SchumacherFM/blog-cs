---
title: Magento MySQL AsyncSave
author: Cyrill
date: 2014-06-01
categories:
  - Projects
tags:
  - Magento
  - MySQL
  - Development
  - Project Failed
---

DEPRECATED Magento implementation of http://php.net/manual/en/mysqli.query.php to use
MYSQLI_ASYNC for inserts and updates.
 
<!--more-->

{{% hubinfo u="SchumacherFM" r="Magento-AsyncSave" c="5" %}}

Magento implementation of [http://au1.php.net/manual/en/mysqli.query.php](http://au1.php.net/manual/en/mysqli.query.php)
to use MYSQLI_ASYNC for inserts and updates.

Fire and forget.

This fails because Magento uses too many connections and one async query can
only use one connection. IMHO setting the max connection variable to a higher
value cannot be a solution. The guy here http://sysmagazine.com/posts/155377/ stuck in the same situation ...

Real DML async queries with one connection are not possible :-(

API
---

Please only instantiate this resource via singleton.

### Available methods

`$this save(Mage_Core_Model_Abstract $object, array $_fieldsForUpdate = null)`

With its _beforeSave and _afterSave methods if you want extend the Async resource class.

`$this delete(Mage_Core_Model_Abstract $object)`

With its _beforeDelete and _afterDelete methods if you want extend the Async resource class.

For both methods `save()` and `delete()` the provided `$object` must have a valid resource object.

`$this setSerializableFields(array $serializableFields)`

`raw_query($sql, array $bind = null)`

`null|bool|mysqli_result getLastAsyncResult()`

Examples
--------

```php
$collection = Mage::getModel('catalog/product')->getCollection();
foreach($collection as $product){
    $product->setName(...)->setPrice(...);
    Mage::getResourceSingleton('schumacherfm_asyncsave/async')->save($product);
}
```

```php
$sql = $select->insertFromSelect($this->getFlatTableName($storeId), $fieldList);
Mage::getResourceSingleton('schumacherfm_asyncsave/async')->raw_query($sql, $bind);
```

Disadvantage / Risks
--------------------

This method provides no prepared statements. You are at the risk 
of [SQL injections](https://www.owasp.org/index.php/SQL_Injection).
