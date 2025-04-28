export type Pedido = {
    id: number
    estado: string
    detalles: any[]
    // ...otros campos relevantes
}

export enum RolUsuario {
    ADMIN = 'ADMIN',
    CAMARERO = 'CAMARERO',
    COCINERO = 'COCINERO',
}
