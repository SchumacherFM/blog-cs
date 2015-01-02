---
title: Magento2 - Search parameters for the REST API
author: Cyrill
date: 2015-01-02
disqus_identifier: /2015/01/02/mage2-rest-search-params/
categories:
  - Thoughts
tags:
  - Magento2
  - REST API
---

How to do curl PUT request to search the REST API using searchCriteria and filterGroups.

<!--more-->

Searching for products with the REST API can be at the beginning pretty complex.

The basic setup for the command line looks:

```
$ curl -X PUT -i \
-H 'Content-type: application/json' \
-d 'Enter here JSON Data' \
http://magento2.local/rest/V1/products
```

# Array structure

- searchCriteria: outer wrapper
- filterGroups: wrapper for n filters
- current_page: current page ;-)
- page_size: number of items per result
- sort_orders: array of fields and directions. Note: direction is either 1 (ASC) or -1 (DESC)

The direction of the sort_orders are defined in `Magento\Framework\Api\SearchCriteriaInterface`.

The conversion of the array structure into the correct class happens in: 
`Magento\Webapi\Controller\ServiceArgsSerializer`

# Condition Types and Sorting

I'll show here only two conditions on how to use them. Other possibilities are listed here:

[lib/internal/Magento/Framework/Api/CriteriaInterface.php](https://github.com/magento/magento2/blob/develop/lib/internal/Magento/Framework/Api/CriteriaInterface.php#L37)

## Greater Than gt

This query searches all products which price is greater than 100 and sorts them descending.
It lists the first 10 results.

```
{
    "searchCriteria": {
        "filterGroups": [
            {
                "filters": [
                    {
                        "field": "price",
                        "value": "100",
                        "condition_type": "gt"
                    },
                    {
                        "field": "price",
                        "value": "10",
                        "condition_type": "lt"
                    }
                ]
            }
        ],
        "current_page": 1,
        "page_size": 10
    }
}
```

The filters are merged the OR way. Here: `price > 100 OR price < 10`.

## like

```
{
    "searchCriteria": {
        "filterGroups": [
            {
                "filters": [
                    {
                        "field": "name",
                        "value": "%computer%",
                        "condition_type": "like"
                    }
                ]
            }
        ],
        "current_page": 1,
        "page_size": 1
    }
}
```

## Sorting

This query searches all products which price is greater than 100 and sorts them descending.
It lists the first 10 results.

```
{
    "searchCriteria": {
        "filterGroups": [
            {
                "filters": [
                    {
                        "field": "price",
                        "value": "100",
                        "condition_type": "gt"
                    }
                ]
            }
        ],
        "current_page": 1,
        "page_size": 10,
        "sort_orders": [
            {
                "field": "price",
                "direction": -1
            }
        ]
    }
}
```

Also the sorting for the price does not work. Because
`app/code/Magento/Catalog/Model/ProductRepository.php::getList()` adds the `price` order to the collection
but the internal mapper in method `lib/internal/Magento/Framework/Data/Collection/Db.php::_setOrder()` and
there in the function `_getMappedField()` rewrites `price` to `price_index.price`.
When the collection loads `_renderOrders()` adds all orders to the select() but ONLY if `addAttributeToSort()`
can find the attribute in the join, static or attributes fields. And of course the `price_index.price` is not in there.
We also have no possibility to extend the collection with other fields. 

The query:

```
curl -X PUT -i -H 'Content-type: application/json' \
-d '{"searchCriteria":{"filterGroups":[{"filters":[{"field":"price","value":"100","condition_type":"gt"}]}],"current_page":1,"page_size":10,"sort_orders":[{"field":"price","direction":-1}]}}' \
http://magento2.local/rest/V1/products
```

## CustomAttributes

@todo
