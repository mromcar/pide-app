/*
  Warnings:

  - You are about to drop the `categorias` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `categorias_traducciones` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `detallespedido` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `establecimientos` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `estadospedido` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `pedidos` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `productos` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `productos_traducciones` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `usuarios` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('client', 'waiter', 'cook', 'establishment_admin', 'general_admin');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('pending', 'preparing', 'ready', 'delivered', 'cancelled', 'completed');

-- CreateEnum
CREATE TYPE "OrderItemStatus" AS ENUM ('pending', 'preparing', 'ready', 'delivered');

-- DropForeignKey
ALTER TABLE "categorias" DROP CONSTRAINT "fk_categoria_establecimiento";

-- DropForeignKey
ALTER TABLE "categorias_traducciones" DROP CONSTRAINT "fk_traduccion_categoria";

-- DropForeignKey
ALTER TABLE "detallespedido" DROP CONSTRAINT "fk_detalle_pedido";

-- DropForeignKey
ALTER TABLE "detallespedido" DROP CONSTRAINT "fk_detalle_producto";

-- DropForeignKey
ALTER TABLE "establecimientos" DROP CONSTRAINT "fk_establecimiento_admin";

-- DropForeignKey
ALTER TABLE "estadospedido" DROP CONSTRAINT "fk_estado_pedido";

-- DropForeignKey
ALTER TABLE "estadospedido" DROP CONSTRAINT "fk_estado_usuario";

-- DropForeignKey
ALTER TABLE "pedidos" DROP CONSTRAINT "fk_pedido_cliente";

-- DropForeignKey
ALTER TABLE "pedidos" DROP CONSTRAINT "fk_pedido_establecimiento";

-- DropForeignKey
ALTER TABLE "productos" DROP CONSTRAINT "fk_producto_categoria";

-- DropForeignKey
ALTER TABLE "productos" DROP CONSTRAINT "fk_producto_establecimiento";

-- DropForeignKey
ALTER TABLE "productos_traducciones" DROP CONSTRAINT "fk_traduccion_producto";

-- DropForeignKey
ALTER TABLE "usuarios" DROP CONSTRAINT "fk_usuario_establecimiento";

-- DropTable
DROP TABLE "categorias";

-- DropTable
DROP TABLE "categorias_traducciones";

-- DropTable
DROP TABLE "detallespedido";

-- DropTable
DROP TABLE "establecimientos";

-- DropTable
DROP TABLE "estadospedido";

-- DropTable
DROP TABLE "pedidos";

-- DropTable
DROP TABLE "productos";

-- DropTable
DROP TABLE "productos_traducciones";

-- DropTable
DROP TABLE "usuarios";

-- DropEnum
DROP TYPE "EstadoItemPedido";

-- DropEnum
DROP TYPE "EstadoPedidoGeneral";

-- DropEnum
DROP TYPE "RolUsuario";

-- CreateTable
CREATE TABLE "establishments" (
    "establishment_id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "tax_id" VARCHAR(20),
    "address" TEXT,
    "postal_code" VARCHAR(10),
    "city" VARCHAR(100),
    "phone1" VARCHAR(20),
    "phone2" VARCHAR(20),
    "billing_bank_details" TEXT,
    "payment_bank_details" TEXT,
    "contact_person" VARCHAR(255),
    "description" TEXT,
    "website" VARCHAR(255),
    "is_active" BOOLEAN DEFAULT true,
    "accepts_orders" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "establishments_pkey" PRIMARY KEY ("establishment_id")
);

-- CreateTable
CREATE TABLE "users" (
    "user_id" SERIAL NOT NULL,
    "role" "UserRole" NOT NULL,
    "name" VARCHAR(255),
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255),
    "establishment_id" INTEGER,
    "google_id" TEXT,
    "apple_id" TEXT,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "establishment_administrators" (
    "user_id" INTEGER NOT NULL,
    "establishment_id" INTEGER NOT NULL,

    CONSTRAINT "establishment_administrators_pkey" PRIMARY KEY ("user_id","establishment_id")
);

-- CreateTable
CREATE TABLE "categories" (
    "category_id" SERIAL NOT NULL,
    "establishment_id" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "image_url" VARCHAR(255),
    "sort_order" INTEGER DEFAULT 0,
    "is_active" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(6),

    CONSTRAINT "categories_pkey" PRIMARY KEY ("category_id")
);

-- CreateTable
CREATE TABLE "category_translations" (
    "translation_id" SERIAL NOT NULL,
    "category_id" INTEGER NOT NULL,
    "language_code" VARCHAR(10) NOT NULL,
    "name" VARCHAR(255) NOT NULL,

    CONSTRAINT "category_translations_pkey" PRIMARY KEY ("translation_id")
);

-- CreateTable
CREATE TABLE "products" (
    "product_id" SERIAL NOT NULL,
    "establishment_id" INTEGER NOT NULL,
    "category_id" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "image_url" VARCHAR(255),
    "sort_order" INTEGER DEFAULT 0,
    "is_active" BOOLEAN DEFAULT true,
    "responsible_role" "UserRole",
    "created_by_user_id" INTEGER,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(6),

    CONSTRAINT "products_pkey" PRIMARY KEY ("product_id")
);

-- CreateTable
CREATE TABLE "product_translations" (
    "translation_id" SERIAL NOT NULL,
    "product_id" INTEGER NOT NULL,
    "language_code" VARCHAR(10) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,

    CONSTRAINT "product_translations_pkey" PRIMARY KEY ("translation_id")
);

-- CreateTable
CREATE TABLE "product_history" (
    "id" SERIAL NOT NULL,
    "product_id" INTEGER NOT NULL,
    "name" TEXT,
    "description" TEXT,
    "is_active" BOOLEAN,
    "changed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "action_type" TEXT NOT NULL,
    "details" JSONB,
    "user_id" INTEGER,

    CONSTRAINT "product_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_variants" (
    "variant_id" SERIAL NOT NULL,
    "product_id" INTEGER NOT NULL,
    "establishment_id" INTEGER NOT NULL,
    "variant_description" VARCHAR(100) NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "sku" VARCHAR(50),
    "sort_order" INTEGER DEFAULT 0,
    "is_active" BOOLEAN DEFAULT true,
    "created_by_user_id" INTEGER,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(6),

    CONSTRAINT "product_variants_pkey" PRIMARY KEY ("variant_id")
);

-- CreateTable
CREATE TABLE "product_variant_translations" (
    "translation_id" SERIAL NOT NULL,
    "variant_id" INTEGER NOT NULL,
    "language_code" VARCHAR(10) NOT NULL,
    "variant_description" VARCHAR(255) NOT NULL,

    CONSTRAINT "product_variant_translations_pkey" PRIMARY KEY ("translation_id")
);

-- CreateTable
CREATE TABLE "product_variant_history" (
    "id" SERIAL NOT NULL,
    "variant_id" INTEGER,
    "variant_description" TEXT,
    "price" DECIMAL(10,2),
    "is_active" BOOLEAN,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_variant_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "allergens" (
    "allergen_id" SERIAL NOT NULL,
    "code" VARCHAR(20) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "icon_url" VARCHAR(255),
    "is_major_allergen" BOOLEAN DEFAULT true,

    CONSTRAINT "allergens_pkey" PRIMARY KEY ("allergen_id")
);

-- CreateTable
CREATE TABLE "allergen_translations" (
    "translation_id" SERIAL NOT NULL,
    "allergen_id" INTEGER NOT NULL,
    "language_code" VARCHAR(10) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,

    CONSTRAINT "allergen_translations_pkey" PRIMARY KEY ("translation_id")
);

-- CreateTable
CREATE TABLE "product_allergens" (
    "product_id" INTEGER NOT NULL,
    "allergen_id" INTEGER NOT NULL,

    CONSTRAINT "product_allergens_pkey" PRIMARY KEY ("product_id","allergen_id")
);

-- CreateTable
CREATE TABLE "orders" (
    "order_id" SERIAL NOT NULL,
    "establishment_id" INTEGER NOT NULL,
    "client_user_id" INTEGER,
    "waiter_user_id" INTEGER,
    "table_number" VARCHAR(20),
    "status" "OrderStatus" NOT NULL DEFAULT 'pending',
    "total_amount" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "payment_method" VARCHAR(50),
    "payment_status" VARCHAR(20) DEFAULT 'unpaid',
    "order_type" VARCHAR(50),
    "notes" TEXT,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("order_id")
);

-- CreateTable
CREATE TABLE "order_items" (
    "order_item_id" SERIAL NOT NULL,
    "order_id" INTEGER NOT NULL,
    "variant_id" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unit_price" DECIMAL(10,2) NOT NULL,
    "status" "OrderItemStatus" DEFAULT 'pending',
    "notes" TEXT,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("order_item_id")
);

-- CreateTable
CREATE TABLE "order_status_history" (
    "history_id" SERIAL NOT NULL,
    "order_id" INTEGER NOT NULL,
    "status" "OrderStatus" NOT NULL,
    "changed_by_user_id" INTEGER,
    "changed_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,

    CONSTRAINT "order_status_history_pkey" PRIMARY KEY ("history_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "establishments_tax_id_key" ON "establishments"("tax_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_google_id_key" ON "users"("google_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_apple_id_key" ON "users"("apple_id");

-- CreateIndex
CREATE UNIQUE INDEX "unique_category_language" ON "category_translations"("category_id", "language_code");

-- CreateIndex
CREATE UNIQUE INDEX "unique_product_language" ON "product_translations"("product_id", "language_code");

-- CreateIndex
CREATE UNIQUE INDEX "product_variants_sku_key" ON "product_variants"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "product_variants_product_id_variant_description_key" ON "product_variants"("product_id", "variant_description");

-- CreateIndex
CREATE UNIQUE INDEX "product_variant_translations_variant_id_language_code_key" ON "product_variant_translations"("variant_id", "language_code");

-- CreateIndex
CREATE UNIQUE INDEX "allergens_code_key" ON "allergens"("code");

-- CreateIndex
CREATE UNIQUE INDEX "unique_allergen_language" ON "allergen_translations"("allergen_id", "language_code");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "fk_user_establishment" FOREIGN KEY ("establishment_id") REFERENCES "establishments"("establishment_id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "establishment_administrators" ADD CONSTRAINT "fk_ea_establishment" FOREIGN KEY ("establishment_id") REFERENCES "establishments"("establishment_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "establishment_administrators" ADD CONSTRAINT "fk_ea_user" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "fk_category_establishment" FOREIGN KEY ("establishment_id") REFERENCES "establishments"("establishment_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "category_translations" ADD CONSTRAINT "fk_translation_category" FOREIGN KEY ("category_id") REFERENCES "categories"("category_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "fk_product_category" FOREIGN KEY ("category_id") REFERENCES "categories"("category_id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "fk_product_creator" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "fk_product_establishment" FOREIGN KEY ("establishment_id") REFERENCES "establishments"("establishment_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "product_translations" ADD CONSTRAINT "fk_translation_product" FOREIGN KEY ("product_id") REFERENCES "products"("product_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "product_history" ADD CONSTRAINT "product_history_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("product_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_history" ADD CONSTRAINT "product_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_establishment_id_fkey" FOREIGN KEY ("establishment_id") REFERENCES "establishments"("establishment_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("product_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "product_variant_translations" ADD CONSTRAINT "product_variant_translations_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "product_variants"("variant_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "product_variant_history" ADD CONSTRAINT "product_variant_history_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "product_variants"("variant_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "allergen_translations" ADD CONSTRAINT "fk_translation_allergen" FOREIGN KEY ("allergen_id") REFERENCES "allergens"("allergen_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "product_allergens" ADD CONSTRAINT "fk_pa_allergen" FOREIGN KEY ("allergen_id") REFERENCES "allergens"("allergen_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "product_allergens" ADD CONSTRAINT "fk_pa_product" FOREIGN KEY ("product_id") REFERENCES "products"("product_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_establishment_id_fkey" FOREIGN KEY ("establishment_id") REFERENCES "establishments"("establishment_id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_client_user_id_fkey" FOREIGN KEY ("client_user_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_waiter_user_id_fkey" FOREIGN KEY ("waiter_user_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("order_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "product_variants"("variant_id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "order_status_history" ADD CONSTRAINT "order_status_history_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("order_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "order_status_history" ADD CONSTRAINT "order_status_history_changed_by_user_id_fkey" FOREIGN KEY ("changed_by_user_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE NO ACTION;
