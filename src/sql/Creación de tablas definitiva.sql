
DROP VIEW IF EXISTS menu_translated CASCADE;
DROP TABLE IF EXISTS product_variant_history CASCADE;
DROP TABLE IF EXISTS product_history CASCADE;
DROP TABLE IF EXISTS order_status_history CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS order_detail CASCADE;
DROP TABLE IF EXISTS product_variant_translations CASCADE;
DROP TABLE IF EXISTS product_variants CASCADE;
DROP TABLE IF EXISTS product_translations CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS category_translations CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS product_allergens CASCADE;
DROP TABLE IF EXISTS allergen_translations CASCADE;
DROP TABLE IF EXISTS allergens CASCADE;
DROP TABLE IF EXISTS establishment_administrators CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS establishments CASCADE;

DROP TYPE IF EXISTS "UserRole" CASCADE;
DROP TYPE IF EXISTS "OrderStatus" CASCADE;
DROP TYPE IF EXISTS "OrderItemStatus" CASCADE;


CREATE TYPE "UserRole" AS ENUM ('client', 'waiter', 'cook', 'establishment_admin', 'general_admin');
CREATE TYPE "OrderStatus" AS ENUM ('pending', 'preparing', 'ready', 'delivered', 'cancelled', 'completed' );
CREATE TYPE "OrderItemStatus" AS ENUM ('pending', 'preparing', 'ready', 'delivered');


CREATE TABLE establishments (
  establishment_id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  tax_id VARCHAR(20) UNIQUE,
  address TEXT,
  postal_code VARCHAR(10),
  city VARCHAR(100),
  phone1 VARCHAR(20),
  phone2 VARCHAR(20),
  billing_bank_details TEXT,
  payment_bank_details TEXT,
  contact_person VARCHAR(255),
  description TEXT,
  website VARCHAR(255),
  is_active BOOLEAN DEFAULT TRUE,
  accepts_orders BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE users (
  user_id SERIAL PRIMARY KEY,
  role "UserRole" NOT NULL,
  name VARCHAR(255),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  establishment_id INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_user_establishment FOREIGN KEY (establishment_id) REFERENCES establishments(establishment_id) ON DELETE SET NULL
);

CREATE TABLE establishment_administrators (
  user_id INTEGER NOT NULL,
  establishment_id INTEGER NOT NULL,
  PRIMARY KEY (user_id, establishment_id),
  CONSTRAINT fk_ea_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  CONSTRAINT fk_ea_establishment FOREIGN KEY (establishment_id) REFERENCES establishments(establishment_id) ON DELETE CASCADE
);


CREATE TABLE categories (
  category_id SERIAL PRIMARY KEY,
  establishment_id INTEGER NOT NULL,
  name VARCHAR(255) NOT NULL,
  image_url VARCHAR(255),
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP,
  CONSTRAINT fk_category_establishment FOREIGN KEY (establishment_id) REFERENCES establishments(establishment_id) ON DELETE CASCADE
);


CREATE TABLE category_translations (
  translation_id SERIAL PRIMARY KEY,
  category_id INTEGER NOT NULL,
  language_code VARCHAR(10) NOT NULL,
  name VARCHAR(255) NOT NULL,
  CONSTRAINT fk_translation_category FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE CASCADE,
  CONSTRAINT unique_category_language UNIQUE (category_id, language_code)
);


CREATE TABLE products (
  product_id SERIAL PRIMARY KEY,
  establishment_id INTEGER NOT NULL,
  category_id INTEGER NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  image_url VARCHAR(255),
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  responsible_role "UserRole",
  created_by_user_id INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP,
  CONSTRAINT fk_product_establishment FOREIGN KEY (establishment_id) REFERENCES establishments(establishment_id) ON DELETE CASCADE,
  CONSTRAINT fk_product_category FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE RESTRICT,
  CONSTRAINT fk_product_creator FOREIGN KEY (created_by_user_id) REFERENCES users(user_id),
  CONSTRAINT chk_product_responsible_role CHECK (responsible_role IN ('cook', 'waiter'))
);

CREATE TABLE product_translations (
  translation_id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL,
  language_code VARCHAR(10) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  CONSTRAINT fk_translation_product FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
  CONSTRAINT unique_product_language UNIQUE (product_id, language_code)
);

CREATE TABLE product_history (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(product_id) ON DELETE CASCADE,
  name TEXT,
  description TEXT,
  is_active BOOLEAN,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE product_history
ADD COLUMN action_type VARCHAR(255),
ADD COLUMN details JSONB,
ADD COLUMN user_id INTEGER REFERENCES users(user_id) ON DELETE SET NULL;

ALTER TABLE product_history RENAME COLUMN updated_at TO changed_at;

CREATE TABLE product_variants (
  variant_id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(product_id) ON DELETE CASCADE,
  establishment_id INTEGER NOT NULL REFERENCES establishments(establishment_id) ON DELETE CASCADE,
  variant_description VARCHAR(100) NOT NULL,
  price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
  sku VARCHAR(50) UNIQUE,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_by_user_id INTEGER REFERENCES users(user_id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP,
  UNIQUE (product_id, variant_description)
);

CREATE TABLE product_variant_translations (
  translation_id SERIAL PRIMARY KEY,
  variant_id INTEGER NOT NULL REFERENCES product_variants(variant_id) ON DELETE CASCADE,
  language_code VARCHAR(10) NOT NULL,
  variant_description VARCHAR(255) NOT NULL,
  UNIQUE (variant_id, language_code)
);

CREATE TABLE product_variant_history (
  id SERIAL PRIMARY KEY,
  variant_id INTEGER REFERENCES product_variants(variant_id) ON DELETE CASCADE,
  variant_description TEXT,
  price DECIMAL(10,2),
  is_active BOOLEAN,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE allergens (
  allergen_id SERIAL PRIMARY KEY,
  code VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon_url VARCHAR(255),
  is_major_allergen BOOLEAN DEFAULT TRUE
);


CREATE TABLE allergen_translations (
  translation_id SERIAL PRIMARY KEY,
  allergen_id INTEGER NOT NULL,
  language_code VARCHAR(10) NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  CONSTRAINT fk_translation_allergen FOREIGN KEY (allergen_id) REFERENCES allergens(allergen_id) ON DELETE CASCADE,
  CONSTRAINT unique_allergen_language UNIQUE (allergen_id, language_code)
);


CREATE TABLE product_allergens (
  product_id INTEGER NOT NULL,
  allergen_id INTEGER NOT NULL,
  PRIMARY KEY (product_id, allergen_id),
  CONSTRAINT fk_pa_product FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
  CONSTRAINT fk_pa_allergen FOREIGN KEY (allergen_id) REFERENCES allergens(allergen_id) ON DELETE CASCADE
);

CREATE TABLE orders (
  order_id SERIAL PRIMARY KEY,
  establishment_id INTEGER NOT NULL REFERENCES establishments(establishment_id) ON DELETE RESTRICT,
  client_user_id INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
  waiter_user_id INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
  table_number VARCHAR(20),
  status "OrderStatus" NOT NULL DEFAULT 'PENDING',
  total_amount DECIMAL(10, 2) DEFAULT 0.00,
  payment_method VARCHAR(50),
  payment_status VARCHAR(20) DEFAULT 'UNPAID',
  order_type VARCHAR(50),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE order_items (
  order_item_id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
  variant_id INTEGER NOT NULL REFERENCES product_variants(variant_id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price DECIMAL(10, 2) NOT NULL,
  item_total_price DECIMAL(10, 2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
  status "OrderItemStatus" DEFAULT 'pending',
  notes TEXT
);

CREATE TABLE order_status_history (
  history_id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
  status "OrderStatus" NOT NULL,
  changed_by_user_id INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
  changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  notes TEXT
);


CREATE OR REPLACE VIEW menu_translated AS
SELECT
  c.establishment_id,
  c.category_id,
  ct.name AS category_name,
  p.product_id,
  pt.name AS product_name,
  pt.description AS product_description,
  p.is_active,
  pt.language_code,
  pv.variant_id,
  pvt.variant_description,
  pv.price AS variant_price
FROM categories c
JOIN category_translations ct ON ct.category_id = c.category_id
JOIN products p ON p.category_id = c.category_id
JOIN product_translations pt ON pt.product_id = p.product_id AND pt.language_code = ct.language_code
LEFT JOIN product_variants pv ON pv.product_id = p.product_id AND pv.is_active = TRUE AND pv.deleted_at IS NULL
LEFT JOIN product_variant_translations pvt ON pvt.variant_id = pv.variant_id AND pvt.language_code = pt.language_code
WHERE c.deleted_at IS NULL
  AND p.deleted_at IS NULL
  AND c.is_active = TRUE
  AND p.is_active = TRUE;


CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION archive_product()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO product_history (product_id, name, description, is_active, updated_at)
  VALUES (OLD.product_id, OLD.name, OLD.description, OLD.is_active, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_set_timestamp_products
BEFORE UPDATE ON products
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER trg_archive_product
AFTER UPDATE ON products
FOR EACH ROW
WHEN (OLD.name IS DISTINCT FROM NEW.name OR OLD.description IS DISTINCT FROM NEW.description OR OLD.is_active IS DISTINCT FROM NEW.is_active)
EXECUTE FUNCTION archive_product();


CREATE OR REPLACE FUNCTION archive_variant()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO product_variant_history (variant_id, variant_description, price, is_active, updated_at)
  VALUES (OLD.variant_id, OLD.variant_description, OLD.price, OLD.is_active, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_set_timestamp_variants
BEFORE UPDATE ON product_variants
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER trg_archive_variant
AFTER UPDATE ON product_variants
FOR EACH ROW
WHEN (OLD.variant_description IS DISTINCT FROM NEW.variant_description OR OLD.price IS DISTINCT FROM NEW.price OR OLD.is_active IS DISTINCT FROM NEW.is_active)
EXECUTE FUNCTION archive_variant();


CREATE OR REPLACE FUNCTION update_order_total()
RETURNS TRIGGER AS $$
DECLARE
  v_order_id INTEGER;
BEGIN
  IF (TG_OP = 'DELETE') THEN
    v_order_id := OLD.order_id;
  ELSE
    v_order_id := NEW.order_id;
  END IF;

  UPDATE orders
  SET total_amount = COALESCE((SELECT SUM(item_total_price)
                               FROM order_items
                               WHERE order_id = v_order_id), 0.00)
  WHERE order_id = v_order_id;

  IF (TG_OP = 'DELETE') THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_order_total
AFTER INSERT OR UPDATE OR DELETE ON order_items
FOR EACH ROW EXECUTE FUNCTION update_order_total();


CREATE OR REPLACE FUNCTION log_initial_order_status()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO order_status_history (order_id, status, changed_by_user_id, changed_at)
  VALUES (NEW.order_id, NEW.status, NEW.client_user_id, NEW.created_at);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_log_initial_order_status
AFTER INSERT ON orders
FOR EACH ROW EXECUTE FUNCTION log_initial_order_status();


CREATE TRIGGER trg_set_timestamp_users
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();


CREATE TRIGGER trg_set_timestamp_orders
BEFORE UPDATE ON orders
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();


CREATE TRIGGER trg_set_timestamp_categories
BEFORE UPDATE ON categories
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();


CREATE TRIGGER trg_set_timestamp_establishments
BEFORE UPDATE ON establishments
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();


CREATE OR REPLACE FUNCTION validate_order_status_transition()
RETURNS TRIGGER AS $$
BEGIN
  IF (
    OLD.status IN ('completed', 'cancelled') AND
    NEW.status NOT IN ('completed', 'cancelled')
  ) THEN
    RAISE EXCEPTION 'No se puede cambiar un pedido de estado % a %', OLD.status, NEW.status;
  END IF;


  IF (
    OLD.status = 'pending' AND NEW.status = 'ready'
  ) THEN
    RAISE EXCEPTION 'No se puede pasar de pending a ready directamente';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validate_order_status
BEFORE UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION validate_order_status_transition();



CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_status ON order_items(status);
CREATE INDEX idx_products_is_active ON products(is_active);
CREATE INDEX idx_categories_is_active ON categories(is_active);

CREATE INDEX idx_translation_lang_cat ON category_translations(language_code, category_id);
CREATE INDEX idx_translation_lang_prod ON product_translations(language_code, product_id);
CREATE INDEX idx_translation_lang_var ON product_variant_translations(language_code, variant_id);

SELECT 'Script de creación de esquema completado exitosamente.' AS status;
