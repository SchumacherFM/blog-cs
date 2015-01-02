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

A how-to on curl PUT requests to search Magento2s REST API using search_criteria and filter_groups.

<!--more-->

Searching for products with the REST API can be at the beginning pretty complex. These tips will hopefully
help you.

These search criteria applies to all API classes/interfaces which implements the method:
`getList(\Magento\Framework\Api\SearchCriteriaInterface $searchCriteria)`

- /V1/products
- /V1/products/attributes
- /V1/products/attribute-sets/sets/list
- /V1/products/attribute-sets/groups/list
- /V1/products/attribute-sets/:attributeSetId/groups
- /V1/products/media/types/:attributeSetName
- /V1/categories
- /V1/categories/attributes
- /V1/customerGroups/search
- /V1/customers/search
- /V1/eav/attribute-sets/list
- /V1/orders
- /V1/invoices
- /V1/creditmemos
- /V1/shipments
- /V1/transactions
- /V1/taxRate/search
- /V1/taxRules/search
- /V1/taxClass/search


The basic setup for the command line looks:

```
$ curl -X PUT -i \
-H 'Content-type: application/json' \
-d 'Enter here JSON Data' \
http://magento2.local/rest/V1/products
```

# Array structure

```
{
    "search_criteria": {
        "filter_groups": [
            {
                "filters": [
                    {
                        "field": "attribute_name",
                        "value": [string|int|float],
                        "condition_type": [string]; optional
                    }
                    more entries
                ]
            }
            more entries
        ],
        "current_page": [int] page number; optional
        "page_size": [int] number of items on a page; optional
        "sort_orders": [ optional
            {
                "field": "attribute_name",
                "direction": [int] -1 or 1
            }
            more entries
        ]
    }
}
```

- search_criteria: outer wrapper
- filter_groups: wrapper for n filters
- current_page: current page ;-)
- page_size: number of items per result
- sort_orders: array of fields and directions. Note: direction is either 1 (ASC) or -1 (DESC)

The direction of the sort_orders are defined in [`Magento\Framework\Api\SearchCriteriaInterface`](https://github.com/magento/magento2/blob/develop/lib%2Finternal%2FMagento%2FFramework%2FApi%2FSearchCriteriaInterface.php#L11).

The conversion of the array structure into the SearchCriteriaInterface happens in: 
[`Magento\Webapi\Controller\ServiceArgsSerializer`](https://github.com/magento/magento2/blob/develop/app%2Fcode%2FMagento%2FWebapi%2FController%2FServiceArgsSerializer.php#L77)

# Condition Types and Sorting

I'll show here only two conditions on how to use them. Other possibilities are listed here:

[lib/internal/Magento/Framework/Api/CriteriaInterface.php](https://github.com/magento/magento2/blob/develop/lib/internal/Magento/Framework/Api/CriteriaInterface.php#L37)

## Greater than and like queries

This query searches all products which price is (greater than 500 OR smaller than 10) AND name contains canon.
It lists the first 10 results.

```
{
    "search_criteria": {
        "filter_groups": [
            {
                "filters": [
                    {
                        "field": "price",
                        "value": "500",
                        "condition_type": "gt"
                    },
                    {
                        "field": "price",
                        "value": "10",
                        "condition_type": "lt"
                    }
                ]
            },
            {
                "filters": [
                    {
                        "field": "name",
                        "value": "%canon%",
                        "condition_type": "like"
                    }
                ]
            }
        ],
        "current_page": 1,
        "page_size": 10
    }
}
```

The `filters` are merged the OR way. Here: `price > 100 OR price < 10`.

The `filter_groups` are merged the AND way.

## like

```
{
    "search_criteria": {
        "filter_groups": [
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
    "search_criteria": {
        "filter_groups": [
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
-d '{"search_criteria":{"filter_groups":[{"filters":[{"field":"price","value":"100","condition_type":"gt"}]}],"current_page":1,"page_size":10,"sort_orders":[{"field":"price","direction":-1}]}}' \
http://magento2.local/rest/V1/products
```

## CustomAttributes

```
{
    "searchCriteria": {
        "filterGroups": [
            {
                "filters": [
                    {
                        "custom_attributes": [
                            {
                                "attribute_code": "weight",
                                "value": 100
                            }
                        ]
                    },
                    {
                        "field": "price",
                        "value": "10",
                        "condition_type": "lt"
                    }
                ]
            },
            {
                "filters": [
                    {
                        "field": "sku",
                        "value": "W2452T-TF"
                    }
                ]
            }
        ],
        "current_page": 1,
        "page_size": 10
    }
}
```

Despite following the structure for custom_attributes in a test for a customer ... the filter
does not work is always empty. I've tried some variations but that is so hard to debug :-(

Custom_attributes have assigned the interface `Magento\Framework\Api\AttributeInterface` which lacks of
a method for the `condition_type`. [Source](https://github.com/magento/magento2/blob/develop/lib%2Finternal%2FMagento%2FFramework%2FApi%2FAttributeInterface.php#L11)
That means you can only filter custom_attributes with `eq`, the default condition.

The curl command:

```
curl -X PUT -i -H 'Content-type: application/json' \
-d '{"searchCriteria":{"filterGroups":[{"filters":[{"custom_attributes":[{"attribute_code":"weight","value":100}]},{"field":"price","value":"10","condition_type":"lt"}]},{"filters":[{"field":"sku","value":"W2452T-TF"}]}],"current_page":1,"page_size":10}}' \
http://magento2.local/rest/V1/products | lynx -stdin
```

Yes I'm using lynx for debugging with var_dump because the xdebug debugger does not work :-(

Or I've just figured out this style: 

```
curl \
	-X PUT \
	 -i -H 'Content-type: application/json' \
	--data @- \
	http://magento2.local/rest/V1/products <<EOP
{
    "searchCriteria": {
        "filterGroups": [
            {
                "filters": [
                    {
                        "custom_attributes": [
                            {
                                "attribute_code": "weight",
                                "value": 100
                            }
                        ]
                    }
                ]
            }
        ]
    }
}
EOP
```

If you don't like the CLI you can use: [http://www.getpostman.com/](http://www.getpostman.com/)
