SELECT
  entity_id,
  name,
  sku,
  url_path,
  price,
  updated_at
FROM `catalog_product_flat_1`
WHERE type_id = "configurable" AND price > 80