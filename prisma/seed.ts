import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Crear un usuario administrador
  const adminUsuario = await prisma.usuario.create({
    data: {
      rol: 'establishment_admin',  // Rol de administrador
      nombre: 'Administrador Establecimiento',
      email: 'admin@pideapp.com',
      contrasena: 'admin123',
    },
  });

  // Crear un establecimiento y asignar el administrador
  const establecimiento = await prisma.establecimiento.create({
    data: {
      nombre: 'Restaurante Pide',
      direccion: 'Calle Ficticia 123, Ciudad',
      contacto: '123456789',
      administrador: {
        connect: { id_usuario: adminUsuario.id_usuario },
      },
    },
  });

  // Crear categorías para el establecimiento
  const categoriaComida = await prisma.categoria.create({
    data: {
      nombre: 'Comida',
      establecimiento: {
        connect: { id_establecimiento: establecimiento.id_establecimiento },
      },
    },
  });

  const categoriaBebidas = await prisma.categoria.create({
    data: {
      nombre: 'Bebidas',
      establecimiento: {
        connect: { id_establecimiento: establecimiento.id_establecimiento },
      },
    },
  });

  // Crear productos en el establecimiento
  const productoPizza = await prisma.producto.create({
    data: {
      nombre: 'Pizza Margherita',
      descripcion: 'Pizza con tomate, mozzarella y albahaca',
      precio: 10.5,
      categoria: {
        connect: { id_categoria: categoriaComida.id_categoria },
      },
      establecimiento: {
        connect: { id_establecimiento: establecimiento.id_establecimiento },
      },
    },
  });

  const productoCerveza = await prisma.producto.create({
    data: {
      nombre: 'Cerveza Artesanal',
      descripcion: 'Cerveza de fabricación local',
      precio: 3.0,
      categoria: {
        connect: { id_categoria: categoriaBebidas.id_categoria },
      },
      establecimiento: {
        connect: { id_establecimiento: establecimiento.id_establecimiento },
      },
    },
  });

  // Crear un usuario cliente
  const clienteUsuario = await prisma.usuario.create({
    data: {
      rol: 'cliente',
      nombre: 'Juan Pérez',
      email: 'juan@pideapp.com',
      contrasena: 'juan123',
      id_establecimiento: establecimiento.id_establecimiento,  // Asociamos al cliente con el establecimiento
    },
  });

  // Crear un pedido para el cliente
  const pedido = await prisma.pedido.create({
    data: {
      id_cliente: clienteUsuario.id_usuario,
      id_establecimiento: establecimiento.id_establecimiento,
      estado: 'pendiente',
      total: 13.5,
      metodo_pago: 'tarjeta',
    },
  });

  // Añadir productos al pedido
  await prisma.detallePedido.create({
    data: {
      id_pedido: pedido.id_pedido,
      id_producto: productoPizza.id_producto,
      cantidad: 1,
      especialidades: 'Sin albahaca',
      estado: 'pendiente',
    },
  });

  await prisma.detallePedido.create({
    data: {
      id_pedido: pedido.id_pedido,
      id_producto: productoCerveza.id_producto,
      cantidad: 2,
      especialidades: '',
      estado: 'pendiente',
    },
  });

  // Crear un estado para el pedido
  await prisma.estadoPedido.create({
    data: {
      id_pedido: pedido.id_pedido,
      id_usuario: clienteUsuario.id_usuario,
      estado: 'pendiente',
    },
  });

  console.log('¡Datos de prueba creados!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
