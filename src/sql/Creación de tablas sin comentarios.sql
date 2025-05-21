DROP TYPE IF EXISTS "UserRole" CASCADE;
DROP TYPE IF EXISTS "OrderStatus" CASCADE;
DROP TYPE IF EXISTS "OrderItemStatus" CASCADE;

DROP TABLE IF EXISTS allergen_translations CASCADE;
DROP TABLE IF EXISTS product_allergens CASCADE;
DROP TABLE IF EXISTS allergens CASCADE;
DROP TABLE IF EXISTS order_status_history CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS product_variant_translations CASCADE;
DROP TABLE IF EXISTS product_variants CASCADE;
DROP TABLE IF EXISTS product_translations CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS category_translations CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS establishment_administrators CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS establishments CASCADE;

CREATE TYPE "UserRole" AS ENUM (
  'client',
  'waiter',
  'cook',
  'establishment_admin',
  'general_admin'
);

CREATE TYPE "OrderStatus" AS ENUM (
  'PENDING',
  'PREPARING',
  'READY',
  'DELIVERED',
  'COMPLETED',
  'CANCELLED'
);

CREATE TYPE "OrderItemStatus" AS ENUM (
  'PENDING',
  'PREPARING',
  'READY',
  'DELIVERED',
  'CANCELLED'
);

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
  accepts_orders BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE users (
  user_id SERIAL PRIMARY KEY,
  role "UserRole" NOT NULL,
  name VARCHAR(255),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  establishment_id INTEGER,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE establishment_administrators (
  user_id INTEGER NOT NULL,
  establishment_id INTEGER NOT NULL,
  CONSTRAINT pk_establishment_admin PRIMARY KEY (user_id, establishment_id),
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
  CONSTRAINT fk_product_establishment FOREIGN KEY (establishment_id) REFERENCES establishments(establishment_id) ON DELETE CASCADE,
  CONSTRAINT fk_product_category FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE RESTRICT,
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
    CONSTRAINT pk_product_allergen PRIMARY KEY (product_id, allergen_id),
    CONSTRAINT fk_pa_product FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
    CONSTRAINT fk_pa_allergen FOREIGN KEY (allergen_id) REFERENCES allergens(allergen_id) ON DELETE CASCADE
);

CREATE TABLE product_variants (
  variant_id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL,
  establishment_id INTEGER NOT NULL,
  variant_description VARCHAR(100) NOT NULL,
  price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
  sku VARCHAR(50) UNIQUE,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  CONSTRAINT fk_variant_product FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
  CONSTRAINT fk_variant_establishment FOREIGN KEY (establishment_id) REFERENCES establishments(establishment_id) ON DELETE CASCADE,
  CONSTRAINT unique_product_variant_description UNIQUE (product_id, variant_description)
);

CREATE TABLE product_variant_translations (
  translation_id SERIAL PRIMARY KEY,
  variant_id INTEGER NOT NULL,
  language_code VARCHAR(10) NOT NULL,
  variant_description VARCHAR(255) NOT NULL,
  CONSTRAINT fk_translation_variant FOREIGN KEY (variant_id) REFERENCES product_variants(variant_id) ON DELETE CASCADE,
  CONSTRAINT unique_variant_language UNIQUE (variant_id, language_code)
);

CREATE TABLE orders (
  order_id SERIAL PRIMARY KEY,
  establishment_id INTEGER NOT NULL,
  client_user_id INTEGER,
  waiter_user_id INTEGER,
  table_number VARCHAR(20),
  status "OrderStatus" NOT NULL DEFAULT 'PENDING',
  total_amount DECIMAL(10, 2) DEFAULT 0.00,
  payment_method VARCHAR(50),
  payment_status VARCHAR(20) DEFAULT 'UNPAID',
  order_type VARCHAR(50),
  notes TEXT,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_order_establishment FOREIGN KEY (establishment_id) REFERENCES establishments(establishment_id) ON DELETE RESTRICT,
  CONSTRAINT fk_order_client FOREIGN KEY (client_user_id) REFERENCES users(user_id) ON DELETE SET NULL,
  CONSTRAINT fk_order_waiter FOREIGN KEY (waiter_user_id) REFERENCES users(user_id) ON DELETE SET NULL
);

CREATE TABLE order_items (
  order_item_id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL,
  variant_id INTEGER NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price DECIMAL(10, 2) NOT NULL,
  item_total_price DECIMAL(10, 2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
  status "OrderItemStatus" DEFAULT 'PENDING',
  notes TEXT,
  CONSTRAINT fk_item_order FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
  CONSTRAINT fk_item_variant FOREIGN KEY (variant_id) REFERENCES product_variants(variant_id) ON DELETE RESTRICT
);

CREATE TABLE order_status_history (
  history_id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL,
  status "OrderStatus" NOT NULL,
  changed_by_user_id INTEGER,
  changed_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  notes TEXT,
  CONSTRAINT fk_history_order FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
  CONSTRAINT fk_history_user FOREIGN KEY (changed_by_user_id) REFERENCES users(user_id) ON DELETE SET NULL
);

ALTER TABLE users
  ADD CONSTRAINT fk_user_establishment
  FOREIGN KEY (establishment_id) REFERENCES establishments(establishment_id) ON DELETE SET NULL;

CREATE INDEX idx_users_establishment_id ON users(establishment_id);
CREATE INDEX idx_categories_establishment_id ON categories(establishment_id);
CREATE INDEX idx_category_translations_category_id ON category_translations(category_id);
CREATE INDEX idx_category_translations_language_code ON category_translations(language_code);
CREATE INDEX idx_products_establishment_id ON products(establishment_id);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_responsible_role ON products(responsible_role);
CREATE INDEX idx_product_translations_product_id ON product_translations(product_id);
CREATE INDEX idx_product_translations_language_code ON product_translations(language_code);
CREATE INDEX idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX idx_product_variants_establishment_id ON product_variants(establishment_id);
CREATE INDEX idx_product_variant_translations_variant_id ON product_variant_translations(variant_id);
CREATE INDEX idx_product_variant_translations_language_code ON product_variant_translations(language_code);
CREATE INDEX idx_orders_establishment_id ON orders(establishment_id);
CREATE INDEX idx_orders_client_user_id ON orders(client_user_id);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_variant_id ON order_items(variant_id);
CREATE INDEX idx_order_status_history_order_id ON order_status_history(order_id);
CREATE INDEX idx_order_status_history_changed_at ON order_status_history(changed_at);
CREATE INDEX idx_ea_user_id ON establishment_administrators(user_id);
CREATE INDEX idx_ea_establishment_id ON establishment_administrators(establishment_id);
CREATE INDEX idx_allergens_code ON allergens(code);
CREATE INDEX idx_allergen_translations_allergen_id ON allergen_translations(allergen_id);
CREATE INDEX idx_allergen_translations_language_code ON allergen_translations(language_code);
CREATE INDEX idx_product_allergens_product_id ON product_allergens(product_id);
CREATE INDEX idx_product_allergens_allergen_id ON product_allergens(allergen_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_product_variants_price ON product_variants(price);

CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_timestamp_users
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_orders
BEFORE UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

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

SELECT 'Script de creación de esquema completado exitosamente.' AS status;
