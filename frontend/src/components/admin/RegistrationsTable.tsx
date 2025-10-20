import React, { useState } from 'react'
import { FaEye, FaCheck, FaTimes, FaDownload, FaSearch, FaFilter } from 'react-icons/fa'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatDateTime } from '@/utils/date'
import type { Registration, ComponentProps } from '@/types'

interface RegistrationsTableProps extends ComponentProps {
  registrations: Registration[]
  loading?: boolean
  onView?: (registration: Registration) => void
  onApprove?: (registrationId: string) => void
  onReject?: (registrationId: string) => void
  onExport?: () => void
}

export const RegistrationsTable: React.FC<RegistrationsTableProps> = ({
  registrations,
  loading = false,
  onView,
  onApprove,
  onReject,
  onExport,
  className,
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // Filter registrations based on search and status
  const filteredRegistrations = registrations.filter(registration => {
    // This would need to be enhanced with user/event data
    const matchesSearch = registration.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || registration.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const getStatusBadgeVariant = (status: Registration['status']) => {
    switch (status) {
      case 'confirmed':
        return 'default'
      case 'pending':
        return 'secondary'
      case 'cancelled':
        return 'destructive'
      case 'attended':
        return 'outline'
      default:
        return 'secondary'
    }
  }

  const getStatusLabel = (status: Registration['status']) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmado'
      case 'pending':
        return 'Pendiente'
      case 'cancelled':
        return 'Cancelado'
      case 'attended':
        return 'Asistió'
      default:
        return status
    }
  }

  const getPaymentStatusBadge = (status: Registration['paymentStatus']) => {
    switch (status) {
      case 'paid':
        return <Badge variant="default">Pagado</Badge>
      case 'pending':
        return <Badge variant="secondary">Pendiente</Badge>
      case 'refunded':
        return <Badge variant="outline">Reembolsado</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex space-x-4">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Registro de Participantes</CardTitle>
          {onExport && (
            <Button onClick={onExport} variant="outline">
              <FaDownload className="mr-2" />
              Exportar
            </Button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <div className="relative flex-1">
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
            <Input
              placeholder="Buscar registros..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">Todos los estados</option>
            <option value="pending">Pendiente</option>
            <option value="confirmed">Confirmado</option>
            <option value="cancelled">Cancelado</option>
            <option value="attended">Asistió</option>
          </select>
        </div>
      </CardHeader>

      <CardContent>
        {filteredRegistrations.length === 0 ? (
          <div className="text-center py-12">
            <FaSearch className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No se encontraron registros
            </h3>
            <p className="text-gray-600">
              {searchTerm || statusFilter !== 'all'
                ? 'Intenta ajustar los filtros de búsqueda.'
                : 'Aún no hay registros de participantes.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID Registro</TableHead>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Evento</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Pago</TableHead>
                  <TableHead>Fecha Registro</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRegistrations.map((registration) => (
                  <TableRow key={registration.id}>
                    <TableCell className="font-mono text-sm">
                      {registration.id.slice(-8)}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{registration.userId}</div>
                        <div className="text-sm text-gray-500">
                          ID: {registration.userId.slice(-8)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{registration.eventId}</div>
                        <div className="text-sm text-gray-500">
                          ID: {registration.eventId.slice(-8)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(registration.status)}>
                        {getStatusLabel(registration.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {getPaymentStatusBadge(registration.paymentStatus)}
                        <div className="text-sm text-gray-600">
                          Q{registration.paymentAmount.toFixed(2)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {formatDateTime(registration.registrationDate)}
                        </div>
                        <div className="text-sm text-gray-500">
                          Actualizado: {formatDateTime(registration.createdAt)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {onView && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onView(registration)}
                          >
                            <FaEye className="h-4 w-4" />
                          </Button>
                        )}

                        {registration.status === 'pending' && (
                          <>
                            {onApprove && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onApprove(registration.id)}
                                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                              >
                                <FaCheck className="h-4 w-4" />
                              </Button>
                            )}
                            {onReject && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onReject(registration.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <FaTimes className="h-4 w-4" />
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Results summary */}
        <div className="mt-4 text-sm text-gray-600">
          Mostrando {filteredRegistrations.length} de {registrations.length} registros
        </div>
      </CardContent>
    </Card>
  )
}