import React from 'react'
import { useNavigate } from 'react-router-dom'
import { AdminLayout } from '@/layouts/AdminLayout'
import AdminEventFormWizard from '@/components/admin/AdminEventFormWizard'
import type { DetailedEvent } from '@/types/admin'

const AdminEventCreatePage: React.FC = () => {
  const navigate = useNavigate()

  const handleSave = (event: DetailedEvent) => {
    // Mostrar mensaje de éxito y redirigir
    navigate(`/admin/eventos/${event.id}/editar`, {
      state: { message: 'Evento creado exitosamente' }
    })
  }

  const handleCancel = () => {
    navigate('/admin/eventos')
  }

  const breadcrumbs = [
    { label: 'Dashboard', href: '/admin' },
    { label: 'Eventos', href: '/admin/eventos' },
    { label: 'Crear Evento' },
  ]

  return (
    <AdminLayout title="Crear Nuevo Evento" breadcrumbs={breadcrumbs}>
      <AdminEventFormWizard
        onSave={handleSave}
        onCancel={handleCancel}
      />
    </AdminLayout>
  )
}

export default AdminEventCreatePage