import ProtectedPage from '@/components/ProtectedPage'
import PedidosRealtime from '@/components/PedidosRealtime'

export default function PedidosEmpleadoPage() {
  return (
    <ProtectedPage allowedRoles={['camarero', 'establishment_admin']}>
      <main>
        <h1 className="text-2xl font-bold mb-4">Gestión de pedidos</h1>
        <PedidosRealtime />
      </main>
    </ProtectedPage>
  )
}
