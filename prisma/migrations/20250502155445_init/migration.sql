-- CreateEnum
CREATE TYPE "RolUsuario" AS ENUM ('cliente', 'camarero', 'cocinero', 'establishment_admin', 'general_admin');

-- CreateEnum
CREATE TYPE "EstadoPedidoGeneral" AS ENUM ('PENDIENTE', 'EN_PREPARACION', 'LISTO', 'ENTREGADO', 'COMPLETADO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "EstadoItemPedido" AS ENUM ('PENDIENTE', 'EN_PREPARACION', 'LISTO', 'ENTREGADO', 'CANCELADO');

-- CreateTable
CREATE TABLE "usuarios" (
    "id_usuario" SERIAL NOT NULL,
    "rol" "RolUsuario" NOT NULL,
    "nombre" VARCHAR(255),
    "email" VARCHAR(255),
    "contrasena" VARCHAR(255),
    "id_establecimiento" INTEGER,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id_usuario")
);

-- CreateTable
CREATE TABLE "establecimientos" (
    "id_establecimiento" SERIAL NOT NULL,
    "nombre" VARCHAR(255) NOT NULL,
    "cif" VARCHAR(20),
    "direccion" TEXT,
    "cp" VARCHAR(10),
    "ciudad" VARCHAR(100),
    "telefono1" VARCHAR(20),
    "telefono2" VARCHAR(20),
    "datos_bancarios_cobro" TEXT,
    "datos_bancarios_pago" TEXT,
    "contacto" VARCHAR(255),
    "id_administrador_establecimiento" INTEGER,

    CONSTRAINT "establecimientos_pkey" PRIMARY KEY ("id_establecimiento")
);

-- CreateTable
CREATE TABLE "categorias" (
    "id_categoria" SERIAL NOT NULL,
    "nombre" VARCHAR(255) NOT NULL,
    "imagen_url" VARCHAR(255),
    "id_establecimiento" INTEGER NOT NULL,
    "orden" INTEGER DEFAULT 0,

    CONSTRAINT "categorias_pkey" PRIMARY KEY ("id_categoria")
);

-- CreateTable
CREATE TABLE "productos" (
    "id_producto" SERIAL NOT NULL,
    "nombre" VARCHAR(255) NOT NULL,
    "descripcion" TEXT,
    "precio" DECIMAL(10,2) NOT NULL,
    "imagen_url" VARCHAR(255),
    "id_categoria" INTEGER NOT NULL,
    "id_establecimiento" INTEGER NOT NULL,
    "orden" INTEGER DEFAULT 0,

    CONSTRAINT "productos_pkey" PRIMARY KEY ("id_producto")
);

-- CreateTable
CREATE TABLE "productos_traducciones" (
    "id_traduccion" SERIAL NOT NULL,
    "id_producto" INTEGER NOT NULL,
    "idioma" VARCHAR(10) NOT NULL,
    "nombre" VARCHAR(255) NOT NULL,
    "descripcion" TEXT,

    CONSTRAINT "productos_traducciones_pkey" PRIMARY KEY ("id_traduccion")
);

-- CreateTable
CREATE TABLE "categorias_traducciones" (
    "id_traduccion" SERIAL NOT NULL,
    "id_categoria" INTEGER NOT NULL,
    "idioma" VARCHAR(10) NOT NULL,
    "nombre" VARCHAR(255) NOT NULL,

    CONSTRAINT "categorias_traducciones_pkey" PRIMARY KEY ("id_traduccion")
);

-- CreateTable
CREATE TABLE "pedidos" (
    "id_pedido" SERIAL NOT NULL,
    "id_cliente" INTEGER,
    "id_establecimiento" INTEGER NOT NULL,
    "fecha_hora" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estado" "EstadoPedidoGeneral" DEFAULT 'PENDIENTE',
    "total" DECIMAL(10,2),
    "metodo_pago" VARCHAR(50),

    CONSTRAINT "pedidos_pkey" PRIMARY KEY ("id_pedido")
);

-- CreateTable
CREATE TABLE "detallespedido" (
    "id_detalle_pedido" SERIAL NOT NULL,
    "id_pedido" INTEGER NOT NULL,
    "id_producto" INTEGER NOT NULL,
    "cantidad" INTEGER NOT NULL DEFAULT 1,
    "especialidades" TEXT,
    "estado" "EstadoItemPedido",

    CONSTRAINT "detallespedido_pkey" PRIMARY KEY ("id_detalle_pedido")
);

-- CreateTable
CREATE TABLE "estadospedido" (
    "id_estado_pedido" SERIAL NOT NULL,
    "id_pedido" INTEGER NOT NULL,
    "id_usuario" INTEGER,
    "estado" "EstadoPedidoGeneral" NOT NULL,
    "fecha_hora" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "estadospedido_pkey" PRIMARY KEY ("id_estado_pedido")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "establecimientos_id_administrador_establecimiento_key" ON "establecimientos"("id_administrador_establecimiento");

-- CreateIndex
CREATE UNIQUE INDEX "unique_producto_idioma" ON "productos_traducciones"("id_producto", "idioma");

-- CreateIndex
CREATE UNIQUE INDEX "unique_categoria_idioma" ON "categorias_traducciones"("id_categoria", "idioma");

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "fk_usuario_establecimiento" FOREIGN KEY ("id_establecimiento") REFERENCES "establecimientos"("id_establecimiento") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "establecimientos" ADD CONSTRAINT "fk_establecimiento_admin" FOREIGN KEY ("id_administrador_establecimiento") REFERENCES "usuarios"("id_usuario") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "categorias" ADD CONSTRAINT "fk_categoria_establecimiento" FOREIGN KEY ("id_establecimiento") REFERENCES "establecimientos"("id_establecimiento") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "productos" ADD CONSTRAINT "fk_producto_categoria" FOREIGN KEY ("id_categoria") REFERENCES "categorias"("id_categoria") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "productos" ADD CONSTRAINT "fk_producto_establecimiento" FOREIGN KEY ("id_establecimiento") REFERENCES "establecimientos"("id_establecimiento") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "productos_traducciones" ADD CONSTRAINT "fk_traduccion_producto" FOREIGN KEY ("id_producto") REFERENCES "productos"("id_producto") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "categorias_traducciones" ADD CONSTRAINT "fk_traduccion_categoria" FOREIGN KEY ("id_categoria") REFERENCES "categorias"("id_categoria") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "pedidos" ADD CONSTRAINT "fk_pedido_cliente" FOREIGN KEY ("id_cliente") REFERENCES "usuarios"("id_usuario") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "pedidos" ADD CONSTRAINT "fk_pedido_establecimiento" FOREIGN KEY ("id_establecimiento") REFERENCES "establecimientos"("id_establecimiento") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "detallespedido" ADD CONSTRAINT "fk_detalle_pedido" FOREIGN KEY ("id_pedido") REFERENCES "pedidos"("id_pedido") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "detallespedido" ADD CONSTRAINT "fk_detalle_producto" FOREIGN KEY ("id_producto") REFERENCES "productos"("id_producto") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "estadospedido" ADD CONSTRAINT "fk_estado_pedido" FOREIGN KEY ("id_pedido") REFERENCES "pedidos"("id_pedido") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "estadospedido" ADD CONSTRAINT "fk_estado_usuario" FOREIGN KEY ("id_usuario") REFERENCES "usuarios"("id_usuario") ON DELETE SET NULL ON UPDATE NO ACTION;
