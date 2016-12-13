ALTER TABLE `catalog_product_entity_datetime`
  CHANGE `store_id` `scope_id` INT(10) NOT NULL DEFAULT '0',
  ADD `scope` SMALLINT(3) NOT NULL DEFAULT '0' AFTER `attribute_id`;

