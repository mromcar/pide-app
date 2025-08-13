-- ===================================================================
-- DATOS DE EJEMPLO PARA PIDE-APP DATABASE
-- Sincronizado con el nuevo schema unificado
-- ===================================================================

-- PASO 1: INSERTAR ESTABLECIMIENTOS
-- ===================================================================

INSERT INTO establishments (name, tax_id, city, phone1, contact_person, description, is_active, accepts_orders)
VALUES
  ('Bar La Plaza', 'B12345678', 'Madrid', '+34 91 123 4567', 'María García', 'Bar tradicional en el centro de Madrid', TRUE, TRUE),
  ('Café Central', 'C98765432', 'Sevilla', '+34 95 987 6543', 'José Martínez', 'Café con ambiente acogedor en Sevilla', TRUE, TRUE),
  ('Restaurante El Rincón', 'A11223344', 'Barcelona', '+34 93 555 7788', 'Carmen López', 'Cocina mediterránea de calidad', TRUE, TRUE);

-- PASO 2: INSERTAR USUARIOS
-- ===================================================================

-- TODOS LOS USUARIOS TIENEN LA CONTRASEÑA: miguel1234
INSERT INTO users (role, name, email, password_hash, establishment_id)
VALUES
  ('establishment_admin', 'María García', 'admin@laplaza.com', '$2b$10$Oh0fgGrpIdGIsMTZDtEGH.qtum7h6rCUfPMD3rOI/ZPlAz9XLWru6', 1),
  ('establishment_admin', 'José Martínez', 'admin@central.com', '$2b$10$Oh0fgGrpIdGIsMTZDtEGH.qtum7h6rCUfPMD3rOI/ZPlAz9XLWru6', 2),
  ('establishment_admin', 'Carmen López', 'admin@rincon.com', '$2b$10$Oh0fgGrpIdGIsMTZDtEGH.qtum7h6rCUfPMD3rOI/ZPlAz9XLWru6', 3),
  ('waiter', 'Ana Rodríguez', 'ana@laplaza.com', '$2b$10$Oh0fgGrpIdGIsMTZDtEGH.qtum7h6rCUfPMD3rOI/ZPlAz9XLWru6', 1),
  ('cook', 'Luis Fernández', 'luis@laplaza.com', '$2b$10$Oh0fgGrpIdGIsMTZDtEGH.qtum7h6rCUfPMD3rOI/ZPlAz9XLWru6', 1),
  ('waiter', 'Pedro Sánchez', 'pedro@central.com', '$2b$10$Oh0fgGrpIdGIsMTZDtEGH.qtum7h6rCUfPMD3rOI/ZPlAz9XLWru6', 2),
  ('cook', 'Elena Torres', 'elena@central.com', '$2b$10$Oh0fgGrpIdGIsMTZDtEGH.qtum7h6rCUfPMD3rOI/ZPlAz9XLWru6', 2),
  ('client', 'Juan Cliente', 'juan@email.com', '$2b$10$Oh0fgGrpIdGIsMTZDtEGH.qtum7h6rCUfPMD3rOI/ZPlAz9XLWru6', NULL),
  ('client', 'Laura Usuaria', 'laura@email.com', '$2b$10$Oh0fgGrpIdGIsMTZDtEGH.qtum7h6rCUfPMD3rOI/ZPlAz9XLWru6', NULL),
  ('general_admin', 'Super Admin', 'superadmin@pideapp.com', '$2b$10$Oh0fgGrpIdGIsMTZDtEGH.qtum7h6rCUfPMD3rOI/ZPlAz9XLWru6', NULL);
-- PASO 3: INSERTAR RELACIONES ADMINISTRADOR-ESTABLECIMIENTO
-- ===================================================================

INSERT INTO establishment_administrators (user_id, establishment_id)
VALUES
  (1, 1),
  (2, 2),
  (3, 3);

-- PASO 4: INSERTAR CATEGORÍAS
-- ===================================================================

INSERT INTO categories (establishment_id, name, sort_order, is_active)
VALUES
  (1, 'Entrantes', 1, TRUE),
  (1, 'Bebidas', 2, TRUE),
  (1, 'Postres', 3, TRUE),
  (2, 'Desayunos', 1, TRUE),
  (2, 'Bebidas Calientes', 2, TRUE),
  (2, 'Bebidas Frías', 3, TRUE),
  (2, 'Dulces', 4, TRUE),
  (3, 'Entrantes', 1, TRUE),
  (3, 'Principales', 2, TRUE),
  (3, 'Bebidas', 3, TRUE),
  (3, 'Postres', 4, TRUE);

-- PASO 5: INSERTAR TRADUCCIONES DE CATEGORÍAS
-- ===================================================================

INSERT INTO category_translations (category_id, language_code, name)
VALUES
  (1, 'es', 'Entrantes'), (1, 'en', 'Appetizers'), (1, 'fr', 'Entrées'),
  (2, 'es', 'Bebidas'), (2, 'en', 'Drinks'), (2, 'fr', 'Boissons'),
  (3, 'es', 'Postres'), (3, 'en', 'Desserts'), (3, 'fr', 'Desserts'),
  (4, 'es', 'Desayunos'), (4, 'en', 'Breakfast'), (4, 'fr', 'Petit-déjeuner'),
  (5, 'es', 'Bebidas Calientes'), (5, 'en', 'Hot Drinks'), (5, 'fr', 'Boissons Chaudes'),
  (6, 'es', 'Bebidas Frías'), (6, 'en', 'Cold Drinks'), (6, 'fr', 'Boissons Froides'),
  (7, 'es', 'Dulces'), (7, 'en', 'Sweets'), (7, 'fr', 'Sucreries'),
  (8, 'es', 'Entrantes'), (8, 'en', 'Appetizers'), (8, 'fr', 'Entrées'),
  (9, 'es', 'Principales'), (9, 'en', 'Main Courses'), (9, 'fr', 'Plats Principaux'),
  (10, 'es', 'Bebidas'), (10, 'en', 'Drinks'), (10, 'fr', 'Boissons'),
  (11, 'es', 'Postres'), (11, 'en', 'Desserts'), (11, 'fr', 'Desserts');

-- PASO 6: INSERTAR PRODUCTOS
-- ===================================================================

INSERT INTO products (establishment_id, category_id, name, description, sort_order, is_active, responsible_role, created_by_user_id)
VALUES
  (1, 1, 'Croquetas Caseras', 'Croquetas de jamón ibérico y pollo', 1, TRUE, 'cook', 5),
  (1, 1, 'Tortilla Española', 'Tortilla de patatas tradicional', 2, TRUE, 'cook', 5),
  (1, 1, 'Jamón Ibérico', 'Selección de jamón ibérico de bellota', 3, TRUE, 'waiter', 4),
  (1, 2, 'Cerveza Artesanal', 'Cerveza local tipo IPA', 1, TRUE, 'waiter', 4),
  (1, 2, 'Vino Tinto', 'Vino tinto de la casa', 2, TRUE, 'waiter', 4),
  (1, 2, 'Agua Mineral', 'Agua mineral con o sin gas', 3, TRUE, 'waiter', 4),
  (1, 3, 'Flan Casero', 'Flan tradicional con caramelo', 1, TRUE, 'cook', 5),
  (1, 3, 'Tarta de Queso', 'Tarta de queso al horno', 2, TRUE, 'cook', 5),
  (2, 4, 'Tostadas Integrales', 'Pan integral con tomate y aceite', 1, TRUE, 'cook', 7),
  (2, 4, 'Croissant Mantequilla', 'Croissant francés con mantequilla', 2, TRUE, 'cook', 7),
  (2, 5, 'Café Espresso', 'Café espresso italiano', 1, TRUE, 'waiter', 6),
  (2, 5, 'Cappuccino', 'Café con leche espumosa', 2, TRUE, 'waiter', 6),
  (2, 5, 'Té Verde', 'Té verde orgánico', 3, TRUE, 'waiter', 6);

-- PASO 7: INSERTAR TRADUCCIONES DE PRODUCTOS
-- ===================================================================

INSERT INTO product_translations (product_id, language_code, name, description)
VALUES
  (1, 'es', 'Croquetas Caseras', 'Croquetas de jamón ibérico y pollo'),
  (1, 'en', 'Homemade Croquettes', 'Iberian ham and chicken croquettes'),
  (1, 'fr', 'Croquettes Maison', 'Croquettes de jambon ibérique et poulet'),
  (2, 'es', 'Tortilla Española', 'Tortilla de patatas tradicional'),
  (2, 'en', 'Spanish Omelet', 'Traditional potato omelet'),
  (2, 'fr', 'Tortilla Espagnole', 'Omelette traditionnelle aux pommes de terre'),
  (3, 'es', 'Jamón Ibérico', 'Selección de jamón ibérico de bellota'),
  (3, 'en', 'Iberian Ham', 'Selection of acorn-fed Iberian ham'),
  (3, 'fr', 'Jambon Ibérique', 'Sélection de jambon ibérique de gland'),
  (4, 'es', 'Cerveza Artesanal', 'Cerveza local tipo IPA'),
  (4, 'en', 'Craft Beer', 'Local IPA beer'),
  (4, 'fr', 'Bière Artisanale', 'Bière IPA locale'),
  (11, 'es', 'Café Espresso', 'Café espresso italiano'),
  (11, 'en', 'Espresso Coffee', 'Italian espresso coffee'),
  (11, 'fr', 'Café Espresso', 'Café espresso italien');

-- PASO 8: INSERTAR VARIANTES DE PRODUCTOS
-- ===================================================================

INSERT INTO product_variants (product_id, establishment_id, variant_description, price, sku, sort_order, is_active, created_by_user_id)
VALUES
  (1, 1, 'Ración (6 unidades)', 8.50, 'BAR001-R6', 1, TRUE, 5),
  (1, 1, 'Media ración (3 unidades)', 4.50, 'BAR001-R3', 2, TRUE, 5),
  (2, 1, 'Pincho', 2.50, 'BAR002-P', 1, TRUE, 5),
  (2, 1, 'Ración', 7.00, 'BAR002-R', 2, TRUE, 5),
  (3, 1, 'Ración (100g)', 18.00, 'BAR003-100G', 1, TRUE, 4),
  (3, 1, 'Media ración (50g)', 9.50, 'BAR003-50G', 2, TRUE, 4),
  (4, 1, 'Caña (200ml)', 2.50, 'BAR004-200ML', 1, TRUE, 4),
  (4, 1, 'Copa (330ml)', 3.80, 'BAR004-330ML', 2, TRUE, 4),
  (4, 1, 'Botella (500ml)', 5.20, 'BAR004-500ML', 3, TRUE, 4),
  (5, 1, 'Copa', 3.20, 'BAR005-COPA', 1, TRUE, 4),
  (5, 1, 'Botella', 18.50, 'BAR005-BOT', 2, TRUE, 4),
  (11, 2, 'Simple', 1.20, 'CAF011-SIMP', 1, TRUE, 6),
  (11, 2, 'Doble', 1.80, 'CAF011-DOBL', 2, TRUE, 6),
  (12, 2, 'Regular', 2.50, 'CAF012-REG', 1, TRUE, 6),
  (12, 2, 'Grande', 3.20, 'CAF012-GRA', 2, TRUE, 6);

-- PASO 9: INSERTAR TRADUCCIONES DE VARIANTES
-- ===================================================================

INSERT INTO product_variant_translations (variant_id, language_code, variant_description)
VALUES
  (1, 'es', 'Ración (6 unidades)'), (1, 'en', 'Full portion (6 pieces)'), (1, 'fr', 'Portion complète (6 pièces)'),
  (2, 'es', 'Media ración (3 unidades)'), (2, 'en', 'Half portion (3 pieces)'), (2, 'fr', 'Demi-portion (3 pièces)'),
  (3, 'es', 'Pincho'), (3, 'en', 'Slice'), (3, 'fr', 'Tranche'),
  (4, 'es', 'Ración'), (4, 'en', 'Full portion'), (4, 'fr', 'Portion complète'),
  (7, 'es', 'Caña (200ml)'), (7, 'en', 'Small beer (200ml)'), (7, 'fr', 'Petite bière (200ml)'),
  (8, 'es', 'Copa (330ml)'), (8, 'en', 'Regular beer (330ml)'), (8, 'fr', 'Bière normale (330ml)'),
  (9, 'es', 'Botella (500ml)'), (9, 'en', 'Bottle (500ml)'), (9, 'fr', 'Bouteille (500ml)');

-- PASO 10: INSERTAR ALÉRGENOS
-- ===================================================================

INSERT INTO allergens (code, name, description, is_major_allergen)
VALUES
  ('GLUT', 'Gluten', 'Cereales que contienen gluten', TRUE),
  ('CRUS', 'Crustáceos', 'Crustáceos y productos a base de crustáceos', TRUE),
  ('EGGS', 'Huevos', 'Huevos y productos a base de huevo', TRUE),
  ('FISH', 'Pescado', 'Pescado y productos a base de pescado', TRUE),
  ('PNUT', 'Cacahuetes', 'Cacahuetes y productos a base de cacahuetes', TRUE),
  ('SOYA', 'Soja', 'Soja y productos a base de soja', TRUE),
  ('MILK', 'Leche', 'Leche y productos lácteos', TRUE),
  ('NUTS', 'Frutos secos', 'Frutos de cáscara y productos derivados', TRUE),
  ('APIM', 'Apio', 'Apio y productos derivados', FALSE),
  ('MUST', 'Mostaza', 'Mostaza y productos derivados', FALSE),
  ('SESS', 'Sésamo', 'Granos de sésamo y productos derivados', FALSE),
  ('SULF', 'Sulfitos', 'Anhídrido sulfuroso y sulfitos', FALSE),
  ('LUPI', 'Altramuces', 'Altramuces y productos derivados', FALSE),
  ('MOLL', 'Moluscos', 'Moluscos y productos a base de moluscos', TRUE);

-- PASO 11: INSERTAR TRADUCCIONES DE ALÉRGENOS
-- ===================================================================

INSERT INTO allergen_translations (allergen_id, language_code, name, description)
VALUES
  (1, 'es', 'Gluten', 'Cereales que contienen gluten'),
  (1, 'en', 'Gluten', 'Cereals containing gluten'),
  (1, 'fr', 'Gluten', 'Céréales contenant du gluten'),
  (3, 'es', 'Huevos', 'Huevos y productos a base de huevo'),
  (3, 'en', 'Eggs', 'Eggs and egg-based products'),
  (3, 'fr', 'Œufs', 'Œufs et produits à base d\'œufs'),
  (7, 'es', 'Leche', 'Leche y productos lácteos'),
  (7, 'en', 'Milk', 'Milk and dairy products'),
  (7, 'fr', 'Lait', 'Lait et produits laitiers');

-- PASO 12: INSERTAR RELACIONES PRODUCTO-ALÉRGENO
-- ===================================================================

INSERT INTO product_allergens (product_id, allergen_id)
VALUES
  (1, 1), (1, 3), (1, 7),
  (2, 3),
  (9, 1),
  (10, 1), (10, 3), (10, 7);

-- PASO 13: INSERTAR PEDIDOS DE EJEMPLO
-- ===================================================================

INSERT INTO orders (establishment_id, client_user_id, waiter_user_id, table_number, status, payment_method, order_type, notes)
VALUES
  (1, 8, 4, 'Mesa 5', 'pending', 'card', 'dine_in', 'Sin cebolla en las croquetas'),
  (1, 9, 4, 'Mesa 3', 'preparing', 'cash', 'dine_in', NULL),
  (2, 8, 6, 'Mesa 1', 'completed', 'card', 'dine_in', 'Café descafeinado');

-- PASO 14: INSERTAR ITEMS DE PEDIDOS
-- ===================================================================

INSERT INTO order_items (order_id, variant_id, quantity, unit_price, notes)
VALUES
  (1, 1, 1, 8.50, 'Sin cebolla'),
  (1, 7, 2, 2.50, NULL),
  (2, 3, 1, 2.50, NULL),
  (2, 8, 1, 3.80, NULL),
  (3, 11, 2, 1.20, 'Descafeinado'),
  (3, 13, 1, 2.50, NULL);

-- PASO 15: VERIFICACIÓN FINAL
-- ===================================================================

-- Mostrar resumen de datos insertados
SELECT
  'Datos de ejemplo insertados correctamente' AS status,
  (SELECT COUNT(*) FROM establishments) AS establecimientos,
  (SELECT COUNT(*) FROM users) AS usuarios,
  (SELECT COUNT(*) FROM categories) AS categorias,
  (SELECT COUNT(*) FROM products) AS productos,
  (SELECT COUNT(*) FROM product_variants) AS variantes,
  (SELECT COUNT(*) FROM allergens) AS alergenos,
  (SELECT COUNT(*) FROM orders) AS pedidos,
  (SELECT COUNT(*) FROM order_items) AS items_pedidos;

-- Mostrar menú del Bar La Plaza en español
SELECT
  'MENÚ BAR LA PLAZA' AS menu,
  ct.name AS categoria,
  pt.name AS producto,
  pvt.variant_description AS variante,
  pv.price AS precio
FROM categories c
JOIN category_translations ct ON c.category_id = ct.category_id
JOIN products p ON c.category_id = p.category_id
JOIN product_translations pt ON p.product_id = pt.product_id
JOIN product_variants pv ON p.product_id = pv.product_id
JOIN product_variant_translations pvt ON pv.variant_id = pvt.variant_id
WHERE c.establishment_id = 1
  AND ct.language_code = 'es'
  AND pt.language_code = 'es'
  AND pvt.language_code = 'es'
  AND c.is_active = TRUE
  AND p.is_active = TRUE
  AND pv.is_active = TRUE
ORDER BY c.sort_order, p.sort_order, pv.sort_order;
