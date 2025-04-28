import ProtectedPage from '@/components/ProtectedPage'
import PedidosRealtime from '@/components/PedidosRealtime'
import { pageMainClasses, pageTitleClasses } from '@/utils/tailwind'

export default function PedidosEmpleadoPage() {
  return (
    <ProtectedPage allowedRoles={['camarero', 'establishment_admin']}>
      <main className={pageMainClasses}>
        <h1 className={pageTitleClasses}>Gestión de pedidos</h1>
        <PedidosRealtime />
      </main>
    </ProtectedPage>
  )
}
