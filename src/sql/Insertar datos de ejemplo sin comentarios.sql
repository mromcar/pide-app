INSERT INTO establishments (establishment_id, name, tax_id, address, postal_code, city, phone1, description, website, is_active, accepts_orders) VALUES
(1, 'El Rincón Bohemio', 'B12345678', 'Calle de la Luna, 10', '28004', 'Madrid', '912345678', 'Acogedor bar de tapas y raciones con terraza.', 'http://rinconbohemio.example.com', TRUE, TRUE),
(2, 'Sabor Oriental Express', 'C87654321', 'Avenida del Sol, 25', '41002', 'Sevilla', '955678910', 'Restaurante de comida asiática para llevar y a domicilio.', 'http://sabororiental.example.com', TRUE, TRUE),
(3, 'La Pizzería de la Esquina', 'G11223344', 'Plaza Mayor, 5', '37001', 'Salamanca', '923456789', 'Pizzas artesanales y ambiente familiar.', 'http://pizzeriaesquina.example.com', TRUE, FALSE);


INSERT INTO users (user_id, role, name, email, password_hash, establishment_id) VALUES
(1, 'general_admin', 'Admin General', 'admin@pide.app', 'hashed_password_placeholder', NULL);


INSERT INTO users (user_id, role, name, email, password_hash, establishment_id) VALUES
(2, 'establishment_admin', 'Laura Gestión Bohemio', 'laura.bohemio@example.com', 'hashed_password_placeholder', NULL),
(3, 'establishment_admin', 'Carlos Gestión Oriental', 'carlos.oriental@example.com', 'hashed_password_placeholder', NULL),
(4, 'establishment_admin', 'Ana MultiAdmin', 'ana.multi@example.com', 'hashed_password_placeholder', NULL);


INSERT INTO users (user_id, role, name, email, password_hash, establishment_id) VALUES
(5, 'cook', 'Roberto Cocinero Bohemio', 'roberto.cocina@example.com', 'hashed_password_placeholder', 1),
(6, 'cook', 'Mei Lin Chef Oriental', 'mei.lin.cocina@example.com', 'hashed_password_placeholder', 2),
(7, 'cook', 'Luigi Pizzaiolo', 'luigi.pizza@example.com', 'hashed_password_placeholder', 3);


INSERT INTO users (user_id, role, name, email, password_hash, establishment_id) VALUES
(8, 'waiter', 'Sofía Camarera Bohemio', 'sofia.camarera@example.com', 'hashed_password_placeholder', 1),
(9, 'waiter', 'David Camarero Oriental', 'david.camarero@example.com', 'hashed_password_placeholder', 2);


INSERT INTO users (user_id, role, name, email, password_hash, establishment_id) VALUES
(10, 'client', 'Elena Cliente Fiel', 'elena.cliente@example.com', 'hashed_password_placeholder', NULL),
(11, 'client', 'Marcos Pedidos', 'marcos.pedidos@example.com', 'hashed_password_placeholder', NULL);

INSERT INTO establishment_administrators (user_id, establishment_id) VALUES
(2, 1),
(3, 2),
(4, 1),
(4, 2);


INSERT INTO allergens (allergen_id, code, name, description, is_major_allergen) VALUES
(1, 'GLUTEN', 'Gluten', 'Contiene cereales con gluten.', TRUE),
(2, 'LACTOSE', 'Lactosa', 'Contiene leche o sus derivados.', TRUE),
(3, 'NUTS', 'Frutos Secos', 'Contiene frutos de cáscara.', TRUE),
(4, 'SOY', 'Soja', 'Contiene soja y productos a base de soja.', TRUE),
(5, 'FISH', 'Pescado', 'Contiene pescado.', TRUE);


INSERT INTO allergen_translations (allergen_id, language_code, name, description) VALUES
(1, 'es', 'Gluten', 'Contiene cereales con gluten (trigo, centeno, cebada, avena, espelta, kamut o sus variedades híbridas) y productos derivados.'),
(1, 'en', 'Gluten', 'Contains cereals containing gluten (wheat, rye, barley, oats, spelt, kamut or their hybridised strains) and products thereof.'),
(2, 'es', 'Lactosa', 'Contiene leche y sus derivados (incluida la lactosa).'),
(2, 'en', 'Lactose', 'Contains milk and products thereof (including lactose).'),
(3, 'es', 'Frutos Secos', 'Contiene frutos de cáscara, es decir: almendras, avellanas, nueces, anacardos, pacanas, nueces de Brasil, alfóncigos, macadamias o nueces de Australia y productos derivados.'),
(3, 'en', 'Nuts', 'Contains nuts, namely: almonds, hazelnuts, walnuts, cashews, pecan nuts, Brazil nuts, pistachio nuts, macadamia or Queensland nuts and products thereof.'),
(4, 'es', 'Soja', 'Contiene soja y productos a base de soja.'),
(4, 'en', 'Soy', 'Contains soybeans and products thereof.');



INSERT INTO categories (category_id, establishment_id, name, sort_order) VALUES
(1, 1, 'Tapas', 1),
(2, 1, 'Raciones', 2),
(3, 1, 'Bebidas', 3),
(4, 1, 'Postres', 4);


INSERT INTO categories (category_id, establishment_id, name, sort_order) VALUES
(5, 2, 'Entrantes Asiáticos', 1),
(6, 2, 'Arroces y Noodles', 2),
(7, 2, 'Platos Principales (Asia)', 3),
(8, 2, 'Bebidas Asiáticas', 4);


INSERT INTO category_translations (category_id, language_code, name) VALUES
(1, 'es', 'Tapas'), (1, 'en', 'Appetizers (Tapas)'),
(2, 'es', 'Raciones'), (2, 'en', 'Portions'),
(3, 'es', 'Bebidas'), (3, 'en', 'Drinks'),
(4, 'es', 'Postres'), (4, 'en', 'Desserts');

INSERT INTO category_translations (category_id, language_code, name) VALUES
(5, 'es', 'Entrantes Asiáticos'), (5, 'en', 'Asian Starters'),
(6, 'es', 'Arroces y Noodles'), (6, 'en', 'Rice & Noodles'),
(7, 'es', 'Platos Principales (Asia)'), (7, 'en', 'Main Courses (Asia)'),
(8, 'es', 'Bebidas Asiáticas'), (8, 'en', 'Asian Drinks');


INSERT INTO products (product_id, establishment_id, category_id, name, description, responsible_role, image_url) VALUES
(1, 1, 1, 'Patatas Bravas', 'Patatas fritas con salsa brava casera.', 'cook', 'http://example.com/bravas.jpg'),
(2, 1, 1, 'Croquetas de Jamón', 'Cremosas croquetas caseras de jamón ibérico.', 'cook', 'http://example.com/croquetas.jpg'),
(3, 1, 2, 'Pulpo a la Gallega', 'Pulpo tierno con patatas y pimentón.', 'cook', 'http://example.com/pulpo.jpg'),
(4, 1, 3, 'Caña de Cerveza', 'Cerveza de barril bien fría.', 'waiter', 'http://example.com/cana.jpg'),
(5, 1, 3, 'Copa de Vino Tinto', 'Selección de vino tinto de la casa.', 'waiter', 'http://example.com/vino.jpg'),
(6, 1, 4, 'Tarta de Queso', 'Tarta de queso casera con mermelada de frutos rojos.', 'cook', 'http://example.com/tartaqueso.jpg');


INSERT INTO products (product_id, establishment_id, category_id, name, description, responsible_role, image_url) VALUES
(7, 2, 5, 'Rollitos de Primavera (2u)', 'Crujientes rollitos vegetales con salsa agridulce.', 'cook', 'http://example.com/rollitos.jpg'),
(8, 2, 6, 'Arroz Frito Tres Delicias', 'Arroz salteado con gambas, pollo, tortilla y verduras.', 'cook', 'http://example.com/arroz3delicias.jpg'),
(9, 2, 7, 'Pollo al Limón', 'Tiras de pollo rebozado con salsa de limón agridulce.', 'cook', 'http://example.com/pollolimon.jpg'),
(10, 2, 8, 'Té Verde Japonés', 'Auténtico té verde sencha.', 'waiter', 'http://example.com/teverde.jpg');


INSERT INTO product_translations (product_id, language_code, name, description) VALUES
(1, 'es', 'Patatas Bravas', 'Patatas fritas con salsa brava casera y un toque de alioli.'),
(1, 'en', 'Bravas Potatoes', 'Fried potatoes with homemade brava sauce and a touch of alioli.'),
(2, 'es', 'Croquetas de Jamón', 'Cremosas croquetas caseras de jamón ibérico (6 unidades).'),
(2, 'en', 'Ham Croquettes', 'Creamy homemade Iberian ham croquettes (6 units).'),
(4, 'es', 'Caña de Cerveza', 'Cerveza de barril Mahou Clásica.'),
(4, 'en', 'Draft Beer', 'Mahou Clásica draft beer.'),
(7, 'es', 'Rollitos de Primavera (2u)', 'Crujientes rollitos rellenos de verduras frescas, acompañados de salsa agridulce.'),
(7, 'en', 'Spring Rolls (2pcs)', 'Crispy rolls filled with fresh vegetables, served with sweet and sour sauce.');


INSERT INTO product_allergens (product_id, allergen_id) VALUES
(1, 1),
(2, 1),
(2, 2),
(8, 1),
(8, 4),
(9, 1);


INSERT INTO product_variants (variant_id, product_id, establishment_id, variant_description, price, sku, sort_order) VALUES
(1, 1, 1, 'Tapa', 4.50, 'BRAVAS-TAP', 1),
(2, 1, 1, 'Ración', 8.00, 'BRAVAS-RAC', 2);

INSERT INTO product_variants (variant_id, product_id, establishment_id, variant_description, price, sku, sort_order) VALUES
(3, 2, 1, 'Media Ración (4u)', 5.00, 'CROQ-MED', 1),
(4, 2, 1, 'Ración (8u)', 9.50, 'CROQ-RAC', 2);

INSERT INTO product_variants (variant_id, product_id, establishment_id, variant_description, price, sku, sort_order) VALUES
(5, 4, 1, 'Normal', 2.00, 'CANA-NORM', 1);

INSERT INTO product_variants (variant_id, product_id, establishment_id, variant_description, price, sku, sort_order) VALUES
(6, 6, 1, 'Porción', 5.50, 'TARTA-Q-POR', 1);

INSERT INTO product_variants (variant_id, product_id, establishment_id, variant_description, price, sku, sort_order) VALUES
(7, 7, 2, 'Estándar (2u)', 3.50, 'ROLL-STD', 1);

INSERT INTO product_variants (variant_id, product_id, establishment_id, variant_description, price, sku, sort_order) VALUES
(8, 8, 2, 'Individual', 7.50, 'ARROZ3D-IND', 1);

INSERT INTO product_variants (variant_id, product_id, establishment_id, variant_description, price, sku, sort_order) VALUES
(9, 9, 2, 'Plato', 9.00, 'POLLOLIM-PLT', 1);

INSERT INTO product_variants (variant_id, product_id, establishment_id, variant_description, price, sku, sort_order) VALUES
(10, 10, 2, 'Taza', 2.50, 'TEVERDE-TAZA', 1);


INSERT INTO product_variant_translations (variant_id, language_code, variant_description) VALUES
(1, 'es', 'Tapa'), (1, 'en', 'Small Plate'),
(2, 'es', 'Ración'), (2, 'en', 'Full Plate'),
(3, 'es', 'Media Ración (4u)'), (3, 'en', 'Half Portion (4pcs)'),
(4, 'es', 'Ración (8u)'), (4, 'en', 'Full Portion (8pcs)'),
(5, 'es', 'Normal'), (5, 'en', 'Regular'),
(6, 'es', 'Porción'), (6, 'en', 'Slice');


INSERT INTO orders (order_id, establishment_id, client_user_id, waiter_user_id, table_number, status, payment_method, payment_status, order_type, notes, created_at) VALUES
(1, 1, 10, 8, 'Terraza-5', 'PREPARING', 'CARD', 'PAID', 'dine-in', 'Sin picante en las bravas, por favor.', '2025-05-21 19:00:00'),
(2, 1, NULL, 8, 'Mesa-2', 'PENDING', NULL, 'UNPAID', 'dine-in', 'Servir bebidas primero.', '2025-05-21 19:10:00'),
(3, 2, 11, NULL, 'Pedido #1023', 'READY', 'CASH', 'UNPAID', 'takeaway', 'Estaré en 15 minutos.', '2025-05-21 19:15:00'),
(4, 1, 10, 8, 'Terraza-5', 'DELIVERED', 'CARD', 'PAID', 'dine-in', 'Todo perfecto', '2025-05-20 21:00:00'),
(5, 2, NULL, NULL, 'Recogida #305', 'COMPLETED', 'BIZUM', 'PAID', 'takeaway', NULL, '2025-05-20 14:30:00');

INSERT INTO order_items (order_id, variant_id, quantity, unit_price, status, notes) VALUES
(1, 1, 1, 4.50, 'PREPARING', 'Extra de alioli'),
(1, 5, 2, 2.00, 'DELIVERED', NULL);

INSERT INTO order_items (order_id, variant_id, quantity, unit_price, status, notes) VALUES
(2, 3, 1, 5.00, 'PENDING', NULL),
(2, 5, 1, 2.00, 'PENDING', NULL);

INSERT INTO order_items (order_id, variant_id, quantity, unit_price, status, notes) VALUES
(3, 8, 1, 7.50, 'READY', 'Sin gambas'),
(3, 9, 1, 9.00, 'READY', NULL);

INSERT INTO order_status_history (order_id, status, changed_by_user_id, notes, changed_at) VALUES
(1, 'DELIVERED', 8, 'Items de bebida entregados', '2025-05-21 19:05:00'),
(4, 'COMPLETED', 8, 'Cliente ha finalizado y se ha ido.', '2025-05-20 22:00:00');


SELECT setval(pg_get_serial_sequence('establishments', 'establishment_id'), COALESCE(MAX(establishment_id),0) + 1, false) FROM establishments;
SELECT setval(pg_get_serial_sequence('users', 'user_id'), COALESCE(MAX(user_id),0) + 1, false) FROM users;
SELECT setval(pg_get_serial_sequence('allergens', 'allergen_id'), COALESCE(MAX(allergen_id),0) + 1, false) FROM allergens;
SELECT setval(pg_get_serial_sequence('categories', 'category_id'), COALESCE(MAX(category_id),0) + 1, false) FROM categories;
SELECT setval(pg_get_serial_sequence('products', 'product_id'), COALESCE(MAX(product_id),0) + 1, false) FROM products;
SELECT setval(pg_get_serial_sequence('product_variants', 'variant_id'), COALESCE(MAX(variant_id),0) + 1, false) FROM product_variants;
SELECT setval(pg_get_serial_sequence('orders', 'order_id'), COALESCE(MAX(order_id),0) + 1, false) FROM orders;

SELECT 'Script de inserción de datos de ejemplo completado.' AS status;
