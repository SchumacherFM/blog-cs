---
title: Avoiding duplicate content in Magento's EAV model
author: Cyrill
date: 2016-12-12
disqus_identifier: /2016/12/12/mage-no-duplicates/
categories:
  - Thoughts
tags:
  - Magento1
  - Magento2
  - EAV
---

Magento's (1+2) EAV database model allows to much redundant content which blows
up the overall size. Taking care of this content is for most merchants, without
a PIM (Product Information System like Akeneo), a pretty huge task. In this post
I would like to propose an overall fix to this problem with backwards
incompatible changes to the database structure.

<!--more-->

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

```sql
CREATE TABLE `store_website` (
  `website_id` smallint(5),
  `code` varchar(32),
  `name` varchar(64),
  `sort_order` smallint(5),
  `default_group_id` smallint(5),
  `is_default` smallint(5),
  PRIMARY KEY (`website_id`),
  UNIQUE KEY `STORE_WEBSITE_CODE` (`code`),
);

CREATE TABLE `store_group` (
  `group_id` smallint(5),
  `website_id` smallint(5),
  `name` varchar(255),
  `root_category_id` int(10),
  `default_store_id` smallint(5),
  PRIMARY KEY (`group_id`),
  CONSTRAINT `a` FOREIGN KEY (`website_id`) REFERENCES `store_website` (`website_id`) ON DELETE CASCADE
);

CREATE TABLE `store` (
  `store_id` smallint(5),
  `code` varchar(32),
  `website_id` smallint(5),
  `group_id` smallint(5),
  `name` varchar(255),
  `sort_order` smallint(5),
  `is_active` smallint(5),
  PRIMARY KEY (`store_id`),
  UNIQUE KEY `STORE_CODE` (`code`),
  CONSTRAINT `a` FOREIGN KEY (`group_id`) REFERENCES `store_group` (`group_id`) ON DELETE CASCADE,
  CONSTRAINT `b` FOREIGN KEY (`website_id`) REFERENCES `store_website` (`website_id`) ON DELETE CASCADE
);
```

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

As you can set a lot of settings cannot be applied to another scope despite the
need for!

### EAV Database Architecture

I pick a random EAV type table `catalog_product_entity_varchar` and its parent
`catalog_product_entity` table where you can see in the entity type table that
the column `store_id` is mandatory. The following SQL has been simplified.

```sql
CREATE TABLE `catalog_product_entity` (
  `entity_id` int(10),
  `attribute_set_id` smallint(5),
  `type_id` varchar(32),
  `sku` varchar(64),
  `has_options` smallint(6),
  `required_options`,
  `created_at` timestamp,
  `updated_at` timestamp ,
  PRIMARY KEY (`entity_id`)
);

CREATE TABLE `catalog_product_entity_varchar` (
  `value_id` int(11),
  `attribute_id` smallint(5),
  `store_id` smallint(5),
  `entity_id` int(10),
  `value` varchar(255),
  PRIMARY KEY (`value_id`),
  UNIQUE KEY `a` (`entity_id`,`attribute_id`,`store_id`),
  CONSTRAINT `b` FOREIGN KEY (`store_id`) REFERENCES `store` (`store_id`) ON DELETE CASCADE,
  CONSTRAINT `c` FOREIGN KEY (`attribute_id`) REFERENCES `eav_attribute` (`attribute_id`) ON DELETE CASCADE,
  CONSTRAINT `d` FOREIGN KEY (`entity_id`) REFERENCES `catalog_product_entity` (`entity_id`) ON DELETE CASCADE
);
```

In total the EAV schema exists of 7 tables:

- catalog_product_entity_datetime
- catalog_product_entity_decimal
- catalog_product_entity_int
- catalog_product_entity_text
- catalog_product_entity_varchar
- catalog_product_entity_tier_price (special)

## The challenge

Most Magento stores I've implemented, and have seen, work with the country as
website scope, group scope unused and on the store level the language for a
country. Even Magento itself suggests this kind of setup for multi language
stores. This looks in a current production store like:

![Magento Multi Language Store Setup](posts/mage-store-setup.png "Magento Multi Language Store Setup")

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
for each scope manually. That takes time and throws lots of errors.

Pretty weird but not really solvable to avoid duplicated language specific
content in the database.

### Suggested new hierarchy

During programming another e-commerce project, lets call it "Project CS", in a
different language, I thought that this can be fixed. But with a refactoring of
the database schema this leads mostly to a backwards incompatible break.

First of all a scope (int8) can not only be Default, Website, Group or Store but
also other values up to 255. The related scope ID (int24) can grow to values up
to 8.388.607. This means I can have 8.3m stores in one scope. So the
configuration service of "Project CS" can handle all kind of scopes. This
removes the above shown limits when configuring settings.
 
The following three print screen show the new structure. A language binds to the
website, a country to the group (which means each country can have a different
category tree) and the final store consists of the country and language name.
Heck it's even possible to include e.g. a B2B store in Germany.
Abbreviation in the print screens: POS = Point of Sales.

##### Table Website

![Website Database Table](posts/store_website.png "Website Database Table")

##### Table Group

![Group Database Table](posts/store_group.png "Group Database Table")

##### Table Store

![Store Database Table](posts/store.png "Store Database Table")

The EAV tables must be refactored. An EAV type table must be able to store all
scopes with all its IDs.

Hence it breaks default compatibility with Magento (can build a module which
fixes this ...). A suggested change (simplified SQL) could be:

```sql
ALTER `catalog_[category|product]_entity_[TYPE]` DROP `store_id`;

ALTER `catalog_[category|product]_entity_[TYPE]` 
    ADD `scope` TINYINT unsigned,
    ADD `scope_id` MEDIUMINT unsigned;
```

`scope` column contains either Default, Website, Group or Store (or as mentioned
above values up to 255). Remember hierarchy says:
Default->Website->Group->Store, where Store gives the lowest and most granular
level.

`scope_id` column contains the corresponding integer value for the scopes
Website, Group and Store. The Default scope always has a zero `scope_id`.

SQL queries for returning a value in the store scope gets more hard.

I'll give it a try. The following variables apply:

- attribute ID 83 contains the manufacturer (string)
- scope 0 = Default; scope 1 = Website; scope 2 = Group; scope 3 = Store
- scope_id 10 = English (DB table website)
- scope_id 20 = Germany (DB table group)
- scope_id 30 = German store with english language (DB table store)

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
          manufacturerDefault.attribute_id=83 
    JOIN catalog_product_entity_varchar AS `manufacturerWebsite` 
      ON cpe.entity_id=manufacturerWebsite.entity_id AND 
          manufacturerWebsite.scope=1 AND manufacturerWebsite.scope_id=10 AND 
          manufacturerWebsite.attribute_id=83 
    JOIN catalog_product_entity_varchar AS `manufacturerGroup` 
      ON cpe.entity_id=manufacturerGroup.entity_id AND 
          manufacturerGroup.scope=2 AND manufacturerGroup.scope_id=20 AND 
          manufacturerGroup.attribute_id=83 
    JOIN catalog_product_entity_varchar AS `manufacturerStore` 
      ON cpe.entity_id=manufacturerStore.entity_id AND 
          manufacturerStore.scope=3 AND manufacturerStore.scope_id=30 AND 
          manufacturerStore.attribute_id=83 
```

As you can see we generated a lot of SQL just for selecting one single attribute,
but we have the full hierarchy implemented. Now imagine we have 1000 attributes ... ;-)

The next idea seems to be crap ....

Another solution would be to avoid this SQL query generation to create a flat table
for each scope. That means up to 255 flat tables, but usually 4:

- catalog_product_flat_default
- catalog_product_flat_website
- catalog_product_flat_group
- catalog_product_flat_store

Each of those 4 tables would like like:

```sql
CREATE TABLE `catalog_product_flat_default` (
  `id` int(10) AUTO_INCREMENT,
  `entity_id` int(10),
  `scope_id` smallint(5),
  `attribute_set_id` smallint(5),
  -- ... 500 more attributes
  `created_at` timestamp,
  `manufacturer` varchar(255),
  
  PRIMARY KEY (`id`),
  UNIQUE KEY (`entity_id`, `scope_id`)
);
```

We need to consider the full fallback hierarchy. Each column NULL value
falls back to the next scope: Store->Website->Group->Default. But this
can be solved by great tools or a generated SQL view or ... ;-)
