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


INSERT INTO allergens (code, name) VALUES
('GL', 'Gluten'), ('CR', 'Crustaceans'), ('EG', 'Eggs'), ('FI', 'Fish'),
('PN', 'Peanuts'), ('SO', 'Soy'), ('LA', 'Dairy'), ('NU', 'Nuts'),
('CE', 'Celery'), ('MU', 'Mustard'), ('SE', 'Sesame'), ('SU', 'Sulphites'),
('LU', 'Lupin'), ('MO', 'Molluscs')
ON CONFLICT (code) DO NOTHING;


WITH allergen_ids AS (
  SELECT allergen_id, code FROM allergens
)
INSERT INTO allergen_translations (allergen_id, language_code, name)
SELECT a.allergen_id, 'es', a.name FROM allergens a WHERE a.code IN ('GL', 'CR', 'HU', 'PE', 'CA', 'SO', 'LA', 'FR', 'AP', 'MO', 'SE', 'SU', 'AL', 'ML')
ON CONFLICT (allergen_id, language_code) DO NOTHING;

INSERT INTO allergen_translations (allergen_id, language_code, name) VALUES
((SELECT allergen_id FROM allergens WHERE code = 'GL'), 'en', 'Gluten'),
((SELECT allergen_id FROM allergens WHERE code = 'CR'), 'en', 'Crustaceans'),
((SELECT allergen_id FROM allergens WHERE code = 'EG'), 'en', 'Eggs'),
((SELECT allergen_id FROM allergens WHERE code = 'FI'), 'en', 'Fish'),
((SELECT allergen_id FROM allergens WHERE code = 'PN'), 'en', 'Peanuts'),
((SELECT allergen_id FROM allergens WHERE code = 'SO'), 'en', 'Soy'),
((SELECT allergen_id FROM allergens WHERE code = 'LA'), 'en', 'Dairy'),
((SELECT allergen_id FROM allergens WHERE code = 'NU'), 'en', 'Nuts'),
((SELECT allergen_id FROM allergens WHERE code = 'CE'), 'en', 'Celery'),
((SELECT allergen_id FROM allergens WHERE code = 'MU'), 'en', 'Mustard'),
((SELECT allergen_id FROM allergens WHERE code = 'SE'), 'en', 'Sesame'),
((SELECT allergen_id FROM allergens WHERE code = 'SU'), 'en', 'Sulphites'),
((SELECT allergen_id FROM allergens WHERE code = 'LU'), 'en', 'Lupin'),
((SELECT allergen_id FROM allergens WHERE code = 'MO'), 'en', 'Molluscs'),
-- Traducciones en español
((SELECT allergen_id FROM allergens WHERE code = 'GL'), 'es', 'Gluten'),
((SELECT allergen_id FROM allergens WHERE code = 'CR'), 'es', 'Crustáceos'),
((SELECT allergen_id FROM allergens WHERE code = 'EG'), 'es', 'Huevos'),
((SELECT allergen_id FROM allergens WHERE code = 'FI'), 'es', 'Pescado'),
((SELECT allergen_id FROM allergens WHERE code = 'PN'), 'es', 'Cacahuetes'),
((SELECT allergen_id FROM allergens WHERE code = 'SO'), 'es', 'Soja'),
((SELECT allergen_id FROM allergens WHERE code = 'LA'), 'es', 'Lácteos'),
((SELECT allergen_id FROM allergens WHERE code = 'NU'), 'es', 'Frutos de cáscara'),
((SELECT allergen_id FROM allergens WHERE code = 'CE'), 'es', 'Apio'),
((SELECT allergen_id FROM allergens WHERE code = 'MU'), 'es', 'Mostaza'),
((SELECT allergen_id FROM allergens WHERE code = 'SE'), 'es', 'Sésamo'),
((SELECT allergen_id FROM allergens WHERE code = 'SU'), 'es', 'Sulfitos'),
((SELECT allergen_id FROM allergens WHERE code = 'LU'), 'es', 'Altramuces'),
((SELECT allergen_id FROM allergens WHERE code = 'MO'), 'es', 'Moluscos')
ON CONFLICT (allergen_id, language_code) DO NOTHING;

INSERT INTO establishments (establishment_id, name, tax_id, city, is_active)
VALUES (3, 'La Trattoria del Ponte', 'G12345678', 'Florencia', TRUE) ON CONFLICT (establishment_id) DO NOTHING;

INSERT INTO users (user_id, role, name, email, password_hash, establishment_id)
VALUES (3, 'establishment_admin', 'Marco Bianchi', 'admin@trattoriaponte.com', 'hash789', 3) ON CONFLICT (user_id) DO NOTHING;

INSERT INTO categories (establishment_id, name, image_url, is_active)
VALUES
  (3, 'Antipasti', NULL, TRUE),
  (3, 'Primi Piatti', NULL, TRUE),
  (3, 'Secondi Piatti', NULL, TRUE),
  (3, 'Pizze', NULL, TRUE),
  (3, 'Dolci', NULL, TRUE),
  (3, 'Bevande', NULL, TRUE);

INSERT INTO category_translations (category_id, language_code, name)
VALUES
  (5, 'es', 'Entrantes'), (5, 'en', 'Appetizers'),
  (6, 'es', 'Primeros Platos'), (6, 'en', 'First Courses'),
  (7, 'es', 'Segundos Platos'), (7, 'en', 'Main Courses'),
  (8, 'es', 'Pizzas'), (8, 'en', 'Pizzas'),
  (9, 'es', 'Postres'), (9, 'en', 'Desserts'),
  (10, 'es', 'Bebidas'), (10, 'en', 'Beverages');

INSERT INTO products (establishment_id, category_id, name, description, image_url, is_active, responsible_role, created_by_user_id)
VALUES
  (3, 5, 'Bruschetta al Pomodoro', 'Pan tostado con tomate fresco, ajo, albahaca y aceite de oliva', NULL, TRUE, 'cook', 3),
  (3, 5, 'Insalata Caprese', 'Tomate, mozzarella fresca, albahaca y aceite de oliva virgen extra', NULL, TRUE, 'cook', 3),
  (3, 6, 'Spaghetti alla Carbonara', 'Spaghetti con huevo, queso Pecorino, guanciale y pimienta negra', NULL, TRUE, 'cook', 3),
  (3, 6, 'Lasagna alla Bolognese', 'Capas de pasta con salsa boloñesa, bechamel y queso Parmigiano', NULL, TRUE, 'cook', 3),
  (3, 7, 'Saltimbocca alla Romana', 'Filetes de ternera con jamón serrano y salvia', NULL, TRUE, 'cook', 3),
  (3, 8, 'Pizza Margherita', 'Salsa de tomate, mozzarella y albahaca fresca', NULL, TRUE, 'cook', 3),
  (3, 8, 'Pizza Diavola', 'Salsa de tomate, mozzarella y salami picante', NULL, TRUE, 'cook', 3),
  (3, 9, 'Tiramisù', 'Clásico postre italiano con café, mascarpone y cacao', NULL, TRUE, 'waiter', 3),
  (3, 10, 'Acqua Minerale', 'Agua con o sin gas', NULL, TRUE, 'waiter', 3),
  (3, 10, 'Vino Rosso della Casa', 'Vino tinto de la casa', NULL, TRUE, 'waiter', 3);

INSERT INTO product_translations (product_id, language_code, name, description)
VALUES
  (5, 'es', 'Bruschetta de Tomate', 'Pan tostado con tomate fresco, ajo, albahaca y aceite de oliva'),
  (5, 'en', 'Tomato Bruschetta', 'Toasted bread with fresh tomato, garlic, basil, and olive oil'),
  (6, 'es', 'Ensalada Caprese', 'Tomate, mozzarella fresca, albahaca y aceite de oliva virgen extra'),
  (6, 'en', 'Caprese Salad', 'Tomato, fresh mozzarella, basil, and extra virgin olive oil'),
  (7, 'es', 'Spaghetti a la Carbonara', 'Spaghetti con huevo, queso Pecorino, guanciale y pimienta negra'),
  (7, 'en', 'Spaghetti Carbonara', 'Spaghetti with egg, Pecorino cheese, guanciale, and black pepper'),
  (8, 'es', 'Lasaña a la Boloñesa', 'Capas de pasta con salsa boloñesa, bechamel y queso Parmigiano'),
  (8, 'en', 'Lasagna Bolognese', 'Layers of pasta with Bolognese sauce, béchamel, and Parmesan cheese'),
  (9, 'es', 'Saltimbocca a la Romana', 'Filetes de ternera con jamón serrano y salvia'),
  (9, 'en', 'Saltimbocca alla Romana', 'Veal cutlets with prosciutto and sage'),
  (10, 'es', 'Pizza Margarita', 'Salsa de tomate, mozzarella y albahaca fresca'),
  (10, 'en', 'Margherita Pizza', 'Tomato sauce, mozzarella, and fresh basil'),
  (11, 'es', 'Pizza Diavola', 'Salsa de tomate, mozzarella y salami picante'),
  (11, 'en', 'Diavola Pizza', 'Tomato sauce, mozzarella, and spicy salami'),
  (12, 'es', 'Tiramisú', 'Clásico postre italiano con café, mascarpone y cacao'),
  (12, 'en', 'Tiramisu', 'Classic Italian dessert with coffee, mascarpone, and cocoa'),
  (13, 'es', 'Agua Mineral', 'Agua con o sin gas'),
  (13, 'en', 'Mineral Water', 'Still or sparkling water'),
  (14, 'es', 'Vino Tinto de la Casa', 'Vino tinto de la casa'),
  (14, 'en', 'House Red Wine', 'House red wine');

INSERT INTO product_variants (product_id, establishment_id, variant_description, price, created_by_user_id)
VALUES
  (5, 3, 'Ración', 6.50, 3),
  (6, 3, 'Plato único', 9.00, 3),
  (7, 3, 'Plato único', 12.00, 3),
  (8, 3, 'Ración', 13.50, 3),
  (9, 3, 'Plato único', 16.00, 3),
  (10, 3, 'Individual', 10.00, 3),
  (11, 3, 'Individual', 11.50, 3),
  (12, 3, 'Porción', 5.50, 3),
  (13, 3, '500ml', 2.50, 3),
  (14, 3, 'Copa', 3.50, 3),
  (14, 3, 'Botella', 15.00, 3);

INSERT INTO product_variant_translations (variant_id, language_code, variant_description)
VALUES
  (9, 'es', 'Ración'), (9, 'en', 'Portion'),
  (10, 'es', 'Plato único'), (10, 'en', 'Single dish'),
  (11, 'es', 'Plato único'), (11, 'en', 'Single dish'),
  (12, 'es', 'Ración'), (12, 'en', 'Portion'),
  (13, 'es', 'Plato único'), (13, 'en', 'Single dish'),
  (14, 'es', 'Individual'), (14, 'en', 'Individual'),
  (15, 'es', 'Individual'), (15, 'en', 'Individual'),
  (16, 'es', 'Porción'), (16, 'en', 'Slice'),
  (17, 'es', '500ml'), (17, 'en', '500ml'),
  (18, 'es', 'Copa'), (18, 'en', 'Glass'),
  (19, 'es', 'Botella'), (19, 'en', 'Bottle');

SELECT 'Script para La Trattoria del Ponte completado.' AS status;



INSERT INTO establishments (establishment_id, name, address, city, phone1, description, accepts_orders)
VALUES (4, 'El Rincón de las Tapas', 'Plaza del Sol, 10', 'Madrid', '912345679', 'Auténticas tapas españolas en el corazón de Madrid.', TRUE)
ON CONFLICT (establishment_id) DO NOTHING;


INSERT INTO users (user_id, role, name, email, password_hash, establishment_id)
VALUES (4, 'establishment_admin', 'Admin Tapas', 'admin@rincontapas.com', 'hash101112', 4)
ON CONFLICT (user_id) DO NOTHING;

SELECT 'Script de inserción de datos completado exitosamente.' AS status;



INSERT INTO product_allergens (product_id, allergen_id)
SELECT 1, allergen_id FROM allergens WHERE code IN ('GL', 'LA', 'EG')
ON CONFLICT (product_id, allergen_id) DO NOTHING;

INSERT INTO product_allergens (product_id, allergen_id)
SELECT 3, allergen_id FROM allergens WHERE code = 'GL'
ON CONFLICT (product_id, allergen_id) DO NOTHING;

INSERT INTO product_allergens (product_id, allergen_id)
SELECT 5, allergen_id FROM allergens WHERE code = 'GL'
ON CONFLICT (product_id, allergen_id) DO NOTHING;

INSERT INTO product_allergens (product_id, allergen_id)
SELECT 6, allergen_id FROM allergens WHERE code = 'LA'
ON CONFLICT (product_id, allergen_id) DO NOTHING;

INSERT INTO product_allergens (product_id, allergen_id)
SELECT 7, allergen_id FROM allergens WHERE code IN ('GL', 'EG', 'LA')
ON CONFLICT (product_id, allergen_id) DO NOTHING;

INSERT INTO product_allergens (product_id, allergen_id)
SELECT 8, allergen_id FROM allergens WHERE code IN ('GL', 'LA', 'EG')
ON CONFLICT (product_id, allergen_id) DO NOTHING;

INSERT INTO product_allergens (product_id, allergen_id)
SELECT 10, allergen_id FROM allergens WHERE code IN ('GL', 'LA')
ON CONFLICT (product_id, allergen_id) DO NOTHING;

INSERT INTO product_allergens (product_id, allergen_id)
SELECT 11, allergen_id FROM allergens WHERE code IN ('GL', 'LA')
ON CONFLICT (product_id, allergen_id) DO NOTHING;

INSERT INTO product_allergens (product_id, allergen_id)
SELECT 12, allergen_id FROM allergens WHERE code IN ('GL', 'LA', 'EG')
ON CONFLICT (product_id, allergen_id) DO NOTHING;

