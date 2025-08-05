
TRUNCATE TABLE
  establishments,
  users,
  categories,
  category_translations,
  products,
  product_translations,
  product_variants,
  product_variant_translations,
  allergens,
  product_allergens,
  orders,
  order_items,
  order_status_history
RESTART IDENTITY CASCADE;

SELECT 'Todas las tablas han sido vaciadas y las secuencias reiniciadas.' AS status;
