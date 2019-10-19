---
title: Data Migration from Magento1 to Magento2
author: Cyrill
date: 2015-01-29
categories:
  - Projects
tags:
  - Magento2
  - Magento1
  - Migration
---

Migrates database from Magento 1.8,1.9 to Magento 2 beta5.

<!--more-->

This program comes with ABSOLUTELY NO WARRANTY.

For each new Magento2 release/pre-release this module must be adapted, mainly when there are new setup scripts.

Also Magento2 will change a lot of code so that more internal refactoring here will be necessary.

{{% hubinfo u="SchumacherFM" r="Magento2-Data-Migration" c="5" %}}

Tweets
-------

<blockquote class="twitter-tweet" lang="en"><p>Here is the composer package for migrating 
Magento1 to <a href="https://twitter.com/hashtag/magento2?src=hash">#magento2</a> 
&#10;<a href="https://t.co/hRRcFYpXhf">https://t.co/hRRcFYpXhf</a>&#10;&#10;Maybe someone might have a look at 
the 3rd &quot;bug&quot;.</p>&mdash; Cyrill Schumacher (@SchumacherFM) 
<a href="https://twitter.com/SchumacherFM/status/560743069956333568">January 29, 2015</a></blockquote>

<blockquote class="twitter-tweet" lang="en"><p>Projects like 
<a href="https://twitter.com/SchumacherFM">@SchumacherFM</a>&#39;s Magento 2 data migrations are going to 
hugely important if Magento 2 going to get any traction.</p>&mdash; Alan Storm (@alanstorm) 
<a href="https://twitter.com/alanstorm/status/560814723638493185">January 29, 2015</a></blockquote>

## Installation

Only via composer possible.

Add to your `required-dev` section in your `composer.json`:

```
    "require-dev": {
        ...
        "schumacherfm/mage1-to-mage2": "dev-master",
        ...
    },
    
    ...
    
    "repositories": [
        ...
        {
            "type": "vcs",
            "url": "git@github.com:SchumacherFM/Magento2-Data-Migration.git"
        },
        ...
```

Run the command to update your installation:

```
$ composer.phar update
```

## Usage

Jump to your Magento2 root directory and call the `migrator`:

```
$ vendor/bin/migrator
Magento2 Migrator version 0.0.1 by Cyrill Schumacher

You must read the help. Run: vendor/bin/migrator help migrate_xx

Usage:
 [options] command [arguments]

Options:
 --help (-h)           Display this help message
 --quiet (-q)          Do not output any message
 --verbose (-v|vv|vvv) Increase the verbosity of messages: 1 for normal output, 2 for more verbose output and 3 for debug
 --version (-V)        Display this application version
 --ansi                Force ANSI output
 --no-ansi             Disable ANSI output
 --no-interaction (-n) Do not ask any interactive question

Available commands:
 help         Displays help for a command
 list         Lists commands
 migrate_ce   Database migration process for community edition
 migrate_ee   Database migration process for enterprise edition.
```

### Help for migrate_ce

```
$ vendor/bin/migrator help migrate_ce
Usage:
 migrate_ce [--host[="..."]] [--username[="..."]] [--password[="..."]] [--dbname[="..."]] [--prefix[="..."]]

Options:
 --host                Database host_name:port (default: "localhost")
 --username            Database user name (default: "root")
 --password            Database password
 --dbname              Database name
 --prefix              Table name prefix (default: "")
 --help (-h)           Display this help message
 --quiet (-q)          Do not output any message
 --verbose (-v|vv|vvv) Increase the verbosity of messages: 1 for normal output, 2 for more verbose output and 3 for debug
 --version (-V)        Display this application version
 --ansi                Force ANSI output
 --no-ansi             Disable ANSI output
 --no-interaction (-n) Do not ask any interactive question

Help:
     This program comes with ABSOLUTELY NO WARRANTY.

 No tables will be dropped except catalog_category_flat* and catalog_product_flat_*.
 Truncated table is core_resource.
 Obsolete tables will have the prefix zz_ in their name.
 Obsolete columns starts with z_.
 All keys and indexes on all tables will be dropped and recreated with the original install scripts.
 If you have custom foreign keys you must recreate them yourself afterwards.

 Increase verbosity to see the SQL commands: -v or -vvv

 How to start:

     1. Create a new MySQL database
     2. Copy all tables and data into the new database for magento2
     3. Enter the new database access data either into app/config.php or
        use the command line options here.
     4. Run the migration tool and wait ...
     5. Clear caches of Magento2
     6a. Follow the steps in https://github.com/magento/magento2/issues/1000#issue-55454189
     6b. Run: "$ php -f index.php update" in the root/setup directory
     6c. Check EAV tables IF you have custom models they will have the prefix Magento and not
         your namespace. @todo
     7. Reindex everything on the CLI
     8. Cross fingers & Load Magento2 backend or frontend

 Expected errors:

     1. Column "code" does not exist in table "widget". (because column name is already widget_code)
     2. Column "type" does not exist in table "widget"
     3. Maybe: some renaming error for googleoptimizer_code

 Your work/review after the migration:
     - Table cms_page: old column root_template new column page_layout => strings are written differently!
     - Table widget_instance: Update the theme.
     - Table core_layout_link
     - Table zz_googleoptimizer_code compared to googleoptimizer_code
     - Table zz_core_url_rewrite compared to url_rewrite. For SEO reasons you can try to rebuild existing URLs ...
     - Check categories and remove Default ones.
```

### Help for migrate_ee

@todo Looking for help here or pay me.

## Missing Features aka Bugs

- Table Prefix has not been properly implemented. Too lazy ;-(
- There needs another CLI flag with which you can provide your Namespace_Module names for converting the model names
  in all eav tables.
- Cannot login into backend (I even copied the tables from a clean Mage2 install but didn't work. Need to dig deeper.)

## Compatibility

- Magento >= 2
- php >= 5.4.11


Licence
-------
[OSL - Open Software Licence 3.0](http://opensource.org/licenses/osl-3.0.php)
