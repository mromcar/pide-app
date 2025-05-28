-- ===================================================
-- Script SQL para la base de datos del proyecto "Pide"
-- Con soporte para historial, soft deletes, auditoría y vistas
-- ===================================================

-- ENUMS
CREATE TYPE user_role AS ENUM ('admin_general', 'admin', 'waiter', 'cook');
CREATE TYPE order_status AS ENUM ('pending', 'preparing', 'ready', 'delivered', 'cancelled');

-- USUARIOS
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role user_role NOT NULL,
  establishment_id INTEGER REFERENCES establishment(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ESTABLECIMIENTOS
CREATE TABLE establishment (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- CATEGORÍAS
CREATE TABLE category (
  id SERIAL PRIMARY KEY,
  establishment_id INTEGER NOT NULL REFERENCES establishment(id) ON DELETE CASCADE,
  position INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

CREATE TABLE category_translation (
  id SERIAL PRIMARY KEY,
  category_id INTEGER NOT NULL REFERENCES category(id) ON DELETE CASCADE,
  language_code TEXT NOT NULL,
  name TEXT NOT NULL,
  UNIQUE (category_id, language_code)
);

-- PRODUCTOS
CREATE TABLE product (
  id SERIAL PRIMARY KEY,
  category_id INTEGER NOT NULL REFERENCES category(id) ON DELETE CASCADE,
  establishment_id INTEGER NOT NULL REFERENCES establishment(id) ON DELETE CASCADE,
  price NUMERIC(10,2) NOT NULL,
  available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by INTEGER REFERENCES users(id),
  deleted_at TIMESTAMP
);

CREATE TABLE product_translation (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES product(id) ON DELETE CASCADE,
  language_code TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  UNIQUE (product_id, language_code)
);

-- HISTORIAL PRODUCTOS
CREATE TABLE product_history (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES product(id) ON DELETE CASCADE,
  name TEXT,
  price NUMERIC(10,2),
  description TEXT,
  available BOOLEAN,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- VARIANTES
CREATE TABLE product_variant (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES product(id) ON DELETE CASCADE,
  price_delta NUMERIC(10,2),
  available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by INTEGER REFERENCES users(id),
  deleted_at TIMESTAMP
);

CREATE TABLE product_variant_translation (
  id SERIAL PRIMARY KEY,
  variant_id INTEGER NOT NULL REFERENCES product_variant(id) ON DELETE CASCADE,
  language_code TEXT NOT NULL,
  name TEXT NOT NULL,
  UNIQUE (variant_id, language_code)
);

-- HISTORIAL VARIANTES
CREATE TABLE product_variant_history (
  id SERIAL PRIMARY KEY,
  variant_id INTEGER REFERENCES product_variant(id) ON DELETE CASCADE,
  name TEXT,
  price_delta NUMERIC(10,2),
  available BOOLEAN,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- PEDIDOS
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  establishment_id INTEGER NOT NULL REFERENCES establishment(id) ON DELETE CASCADE,
  status order_status NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- DETALLES DEL PEDIDO
CREATE TABLE order_detail (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES product(id),
  variant_id INTEGER REFERENCES product_variant(id),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price NUMERIC(10,2) NOT NULL
);

-- VISTA TRADUCIDA DEL MENÚ
CREATE VIEW menu_translated AS
SELECT
  c.establishment_id,
  c.id AS category_id,
  ct.name AS category_name,
  p.id AS product_id,
  pt.name AS product_name,
  pt.description,
  p.price,
  p.available,
  pt.language_code
FROM category c
JOIN category_translation ct ON ct.category_id = c.id
JOIN product p ON p.category_id = c.id
JOIN product_translation pt ON pt.product_id = p.id
WHERE c.deleted_at IS NULL AND p.deleted_at IS NULL AND p.available = TRUE;

-- TRIGGERS PARA updated_at Y HISTORIAL
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION archive_product()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO product_history (product_id, name, price, description, available)
  SELECT OLD.id, pt.name, OLD.price, pt.description, OLD.available
  FROM product_translation pt
  WHERE pt.product_id = OLD.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION archive_variant()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO product_variant_history (variant_id, name, price_delta, available)
  SELECT OLD.id, vt.name, OLD.price_delta, OLD.available
  FROM product_variant_translation vt
  WHERE vt.variant_id = OLD.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- APLICAR TRIGGERS
CREATE TRIGGER trg_update_product
BEFORE UPDATE ON product
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_update_variant
BEFORE UPDATE ON product_variant
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_archive_product
BEFORE UPDATE ON product
FOR EACH ROW
EXECUTE FUNCTION archive_product();

CREATE TRIGGER trg_archive_variant
BEFORE UPDATE ON product_variant
FOR EACH ROW
EXECUTE FUNCTION archive_variant();

-- ÍNDICES
CREATE INDEX idx_product_available ON product(available);
CREATE INDEX idx_product_establishment ON product(establishment_id);
CREATE INDEX idx_order_status ON orders(status);
CREATE INDEX idx_translation_lang_cat ON category_translation(language_code);
CREATE INDEX idx_translation_lang_prod ON product_translation(language_code, product_id);
CREATE INDEX idx_translation_lang_var ON product_variant_translation(language_code, variant_id);
