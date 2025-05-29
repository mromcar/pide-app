
INSERT INTO establishments (name, tax_id, city, is_active)
VALUES
  ('Bar La Plaza', 'B12345678', 'Madrid', TRUE),
  ('Café Central', 'C98765432', 'Sevilla', TRUE);

INSERT INTO users (role, name, email, password_hash, establishment_id)
VALUES
  ('establishment_admin', 'Admin Plaza', 'admin@laplaza.com', 'hash123', 1),
  ('establishment_admin', 'Admin Central', 'admin@central.com', 'hash456', 2);


INSERT INTO categories (establishment_id, name, is_active)
VALUES
  (1, 'Entrantes', TRUE),
  (1, 'Bebidas', TRUE),
  (2, 'Appetizers', TRUE),
  (2, 'Drinks', TRUE);

INSERT INTO category_translations (category_id, language_code, name)
VALUES
  (1, 'es', 'Entrantes'),
  (1, 'en', 'Appetizers'),
  (2, 'es', 'Bebidas'),
  (2, 'en', 'Drinks'),
  (3, 'es', 'Entrantes'),
  (3, 'en', 'Appetizers'),
  (4, 'es', 'Bebidas'),
  (4, 'en', 'Drinks');


INSERT INTO products (establishment_id, category_id, name, description, is_active, responsible_role, created_by_user_id)
VALUES
  (1, 1, 'Croquetas caseras', 'Croquetas de jamón y pollo', TRUE, 'cook', 1),
  (1, 2, 'Cerveza artesanal', 'Cerveza local tipo IPA', TRUE, 'waiter', 1),


  (2, 3, 'Patatas Bravas', 'Papas fritas con salsa picante', TRUE, 'cook', 2),
  (2, 4, 'Zumo natural', 'Zumo de naranja recién exprimido', TRUE, 'waiter', 2);

INSERT INTO product_translations (product_id, language_code, name, description)
VALUES
  (1, 'es', 'Croquetas caseras', 'Croquetas de jamón y pollo'),
  (1, 'en', 'Homemade croquettes', 'Ham and chicken croquettes'),
  (2, 'es', 'Cerveza artesanal', 'Cerveza local tipo IPA'),
  (2, 'en', 'Craft beer', 'Local IPA beer'),
  (3, 'es', 'Patatas Bravas', 'Papas fritas con salsa picante'),
  (3, 'en', 'Spicy potatoes', 'Fried potatoes with spicy sauce'),
  (4, 'es', 'Zumo natural', 'Zumo de naranja recién exprimido'),
  (4, 'en', 'Fresh juice', 'Freshly squeezed orange juice');

INSERT INTO product_variants (product_id, establishment_id, variant_description, price, created_by_user_id)
VALUES
  (1, 1, '6 unidades', 5.50, 1),
  (1, 1, '12 unidades', 9.90, 1),

  (2, 1, '33cl', 3.00, 1),
  (2, 1, '50cl', 4.50, 1),

  (3, 2, 'Tamaño individual', 4.00, 2),
  (3, 2, 'Para compartir', 7.00, 2),

  (4, 2, 'Vaso pequeño', 2.50, 2),
  (4, 2, 'Vaso grande', 3.50, 2);


INSERT INTO product_variant_translations (variant_id, language_code, variant_description)
VALUES
  (1, 'es', '6 unidades'),
  (1, 'en', '6 pieces'),
  (2, 'es', '12 unidades'),
  (2, 'en', '12 pieces'),
  (3, 'es', '33cl'),
  (3, 'en', '33cl'),
  (4, 'es', '50cl'),
  (4, 'en', '50cl'),
  (5, 'es', 'Tamaño individual'),
  (5, 'en', 'Single size'),
  (6, 'es', 'Para compartir'),
  (6, 'en', 'To share'),
  (7, 'es', 'Vaso pequeño'),
  (7, 'en', 'Small glass'),
  (8, 'es', 'Vaso grande'),
  (8, 'en', 'Large glass');
