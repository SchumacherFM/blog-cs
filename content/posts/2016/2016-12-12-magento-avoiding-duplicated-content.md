---
title: Avoiding duplicate content in Magento's EAV model
author: Cyrill
date: 2016-12-12
categories:
  - Thoughts
tags:
  - Magento1
  - Magento2
  - EAV
---

Magento's (1+2) EAV
([Entity-Attribute-Value](https://en.wikipedia.org/wiki/Entity–attribute–value_model))
database model allows too much redundant data. This leads to an unusual large
database and strains errors when working with that data in the backend. Taking
care of the shop content is for most merchants a pretty huge task. In this post
I would like to propose an overall fix to this problem with backwards
incompatible changes to the database structure.

<!--more-->

TODO: Fix grammar.

Even if you use a PIM ([Product Information
Management](https://en.wikipedia.org/wiki/Product_information_management)) the
amount of data is still the same. The PIM connector does all the work to push
the data into Magento. The database will be slowed down.

Magento's customers, price structure and stock handling affects this issue too.
We remove those limitations.

With the following proposed changes a PIM might become superfluous ;-) and we
gain overall flexibility with customers, prices and stocks.

### Intro and wording

Magento itself states different confusing names in the backend for the overall
scope setting. We stick here to the database table names:

- Admin -> Default 
- Website -> Website
- Store -> Group
- Store View -> Store

 Magento Backend Scope  | Our wording for Scope   
 ---------------------- | ----------------------   
 Admin                 | Default   
 Website               | Website      
 Store                 | Group      
 Store View            | Store     

The hierarchy level goes always from the highest (Default) to the lowest and
most granular (Store).

###### Default -> Website -> Group -> Store

The simplified database schema of those three tables are:

![Magento Scope Schema](posts/eav/scope_schema.png "Magento Scope Schema")

##### Possible scopes for Magento Configuration settings

Config Setting | Default | Website | Store Group | Store View 
-------------- | ------- | ------- | ----------- | ----------   
Product settings | X | | | X |
Product prices | X | X |
Product tax class | X | X |
Base currency | X | X |
(Default) display currency | X | | | X |
Category settings | X | | | X |
System configuration settings | X | X | | X |
Root category configuration | | | X |
Orders | | | | X |
Customers | X | X |

As you can set a lot of settings cannot be applied to another scope, despite you
need sometimes!

Even scopes which can officially only be applied on the website level will be
finally stored on store level.

### EAV Database Architecture

I pick a random EAV type table `catalog_product_entity_varchar` and its parent
`catalog_product_entity` table where you can see in the entity type table that
the column `store_id` is mandatory. The schema has been simplified.

![Magento Catalog Product Simple Schema](posts/eav/catalog_product_simple_schema.png "Magento Catalog Product Simple Schema")

Also in the tier_price table you can see the `website_id` column, same
"architectural bug" as the `store_id` column.

In total the EAV schema exists of 7 tables:

- catalog_product_entity_datetime
- catalog_product_entity_decimal
- catalog_product_entity_int
- catalog_product_entity_text
- catalog_product_entity_varchar
- catalog_product_entity_tier_price (special)

### The challenge

Most Magento stores I've implemented, and have seen, work with the country as
website scope, group scope unused and on the store level the language for a
country. Even Magento itself suggests this kind of setup for multi language
stores. This looks in a current production store like:

![Magento Multi Language Store Setup](posts/eav/mage-store-setup.png "Magento Multi Language Store Setup")

To summarize the used languages:

- 6x English
- 5x German
- 4x French
- 2x Italian

If we reflect the EAV database schema you can imagine that each language
specific text/description/setting must be stored the number of times the
language gets used.

Usually this will be done via an import module which copies all the data into
the database. But if you're not in the luck to rely on the imported data from
e.g. a PIM (Product Information System) then you must change the product data
for each scope manually. That takes time and triggers subtle errors.

Pretty weird but not really solvable to avoid duplicated language specific
content and prices in the database.

### Suggested new hierarchy

During programming another e-commerce project, lets call it "Project CS", in a
different language, I thought that this can be fixed. But with a refactoring of
the database schema this leads mostly to a backwards incompatible break. But I
think this seems worth it as it gains much more flexibility.

First of all a scope (int8) can not only be Default, Website, Group or Store but
also other values up to 255. The related scope ID (int24) can grow to values up
to 8.388.607. This means I can have 8.3m stores in one scope. So the
configuration service of "Project CS" can handle all kind of scopes. This
removes the above shown limits when configuring settings.

Excursus: Why int8 and int24? Because in "Project CS" I can store the scope
(int8) and its related ID (int24) in a single int32 type via bit shifting. For
now this is enough, can be optimized later.

The following three print screen show the new structure. A language binds to the
website, a country to the group (which means each country can have a different
category tree) and the final store consists of the country and language name.
Heck it's even possible to include e.g. a B2B store in Germany.
Abbreviation in the print screens: POS = Point of Sales.

##### Table Website

![Website Database Table](posts/eav/store_website.png "Website Database Table")

##### Table Group

![Group Database Table](posts/eav/store_group.png "Group Database Table")

##### Table Store

![Store Database Table](posts/eav/store.png "Store Database Table")

The EAV tables must be refactored. An EAV type table must be able to store all
scopes with all its IDs. This can be achieved by either adding two new columns
for the `scope` and its `scope_id` or a single column `scope_type_id` which
merges via bit shifting the scope and the ID. But as humans usually create SQL
statements on the fly, it might be better to add two columns. That allows you to
create queries without any helper functions to merge/explode scope and ID.

`scope` column contains either Default (0), Website (1), Group (2) or Store (3)
(or as mentioned above values up to 255). Remember hierarchy says:
Default->Website->Group->Store, where Store gives the lowest and most granular
level.

`scope_id` column contains the corresponding integer value for the scopes
Website, Group and Store. The Default scope always has a zero `scope_id`.

##### scope_type_id Example

```sql
SELECT 'website'                AS scope_name, 
       1                        AS scope, 
       website_id               AS scope_id, 
       ( 1 << 24 | website_id ) AS scope_type_id, 
       name 
FROM   store_website 
UNION ALL 
SELECT 'group'                AS scope_name, 
       2                      AS scope, 
       group_id               AS scope_id, 
       ( 2 << 24 | group_id ) AS scope_type_id, 
       name 
FROM   store_group 
UNION ALL 
SELECT 'store'                AS scope_name, 
       3                      AS scope, 
       store_id               AS scope_id, 
       ( 3 << 24 | store_id ) AS scope_type_id, 
       name 
FROM   `store` 
ORDER  BY scope_type_id 
```

![Scope Type ID](posts/eav/scope_type_id.png "Scope Type ID")

##### New simplified catalog product EAV schema

![New EAV Table Type Schema](posts/eav/catalog_product_eav_schema_new.png "New EAV Table Type Schema")

SQL queries for returning a value in the store scope gets more hard.

I'll give it a try. The following variables apply:

- attribute ID 83 contains the manufacturer (string)
- scope 0 = Default
- scope 1 = Website
- scope 2 = Group
- scope 3 = Store
- scope_id 10 = English (DB table `store_website`)
- scope_id 20 = Germany (DB table `store_group`)
- scope_id 30 = German store with english language (DB table `store`)

The scope_id usually starts in all 3 tables with 1 (auto increment) but we want
to avoid here confusion ;-).

```sql
SELECT cpe.*,
  IFNULL(manufacturerStore.value, 
    IFNULL(manufacturerGroup.value, 
      IFNULL(manufacturerWebsite.value,
        IFNULL(manufacturerDefault.value,'')))) AS `manufacturer`
  FROM
    catalog_product_entity AS `cpe`
    LEFT JOIN catalog_product_entity_varchar AS `manufacturerDefault` 
      ON cpe.entity_id=manufacturerDefault.entity_id AND 
          manufacturerDefault.scope=0 AND manufacturerDefault.scope_id=0 AND 
          manufacturerDefault.attribute_id=83 AND manufacturerDefault.value IS NOT NULL 
    LEFT JOIN catalog_product_entity_varchar AS `manufacturerWebsite` 
      ON cpe.entity_id=manufacturerWebsite.entity_id AND 
          manufacturerWebsite.scope=1 AND manufacturerWebsite.scope_id=10 AND 
          manufacturerWebsite.attribute_id=83 AND manufacturerWebsite.value IS NOT NULL 
    LEFT JOIN catalog_product_entity_varchar AS `manufacturerGroup` 
      ON cpe.entity_id=manufacturerGroup.entity_id AND 
          manufacturerGroup.scope=2 AND manufacturerGroup.scope_id=20 AND 
          manufacturerGroup.attribute_id=83 AND manufacturerGroup.value IS NOT NULL 
    LEFT JOIN catalog_product_entity_varchar AS `manufacturerStore` 
      ON cpe.entity_id=manufacturerStore.entity_id AND 
          manufacturerStore.scope=3 AND manufacturerStore.scope_id=30 AND 
          manufacturerStore.attribute_id=83 AND manufacturerStore.value IS NOT NULL
```

As you can see we generated a lot of SQL just for selecting one single
attribute, but we have the full hierarchy implemented. Now imagine we have 1000
attributes ... ;-)

We need to consider the full fallback hierarchy (up to a level of 255 but for
now only 4 levels). Each column NULL value falls back to the next scope:
Store->Website->Group->Default. But this can be solved by great tools or a
generated SQL view or a materialized view or ... ;-)

The amount of views or materialized views depends on the amount of stores.

Any more ideas for a database schema? Flat tables would be an option to create
for each scope a table. One table contains all columns but I think concurrent
row updates will block as row locks leads to blocking.

Schemaless is not an option as I strive for a mathematical correct strict model.

### What about prices?

Prices are by Default-Magento bound to the website scope. This needs to be
refactored the same way as the EAV tables to remove the `website_id` column and
replace it with the two new columns `scope` and `scope_id` (same with sales rules).

As price calculation throws a lot of complexity into the whole system I consider
that a dedicated plugable "microservice", a price engine. Here you throw in scope,
scope_id, customer groups, customer IDs, promotion ID, etc and the product ID to
retrieve the correct price/s.

### What about customers?

Customers are by Default-Magento bound to the website scope. This needs to be
refactored the same way as the EAV tables to remove the `website_id` column and
replace it with the two new columns `scope` andm `scope_id`.  The higher a
customer has been assigned to a scope the more s/he can switch between the
different scopes.

### What about the stock?

Stock levels and warehouses are by Default-Magento bound to the website scope.
The table `cataloginventory_stock_item` has even totally wrong foreign keys
which annoys lots of developers ;-). This needs to be refactored the same way as
the EAV tables to remove the `website_id` column and replace it with the two new
columns `scope` and `scope_id`. The stock can maybe have a configurable fall
back to the different scopes but can be also bound to just one specific scope
with its ID.

The above change allows us to implement e.g. a "Click & Collect" feature for a
merchant with many brick and mortar stores, each with their own stock level.

You can think here also of a dedicated plugable "microservice".

### What about orders?

No changes here as they are still bound to the scope *store*.

### Indexation must be huge!

Project "CS" uses a parallel and concurrent indexer which works totally
different than the indexer you know from Default-Magento. This indexer is
neither visible to the frontend nor to the backend.

### But ...

The question remains: Breaking compatibility to Magento? Gaining more
flexibility but harder and complex SQL queries? What about MySQL/MariaDB
performance?

### What do you think?

Write me a comment here, a tweet or an email!
