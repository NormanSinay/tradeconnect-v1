import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaBuilding,
  FaBriefcase,
  FaMapMarkerAlt,
  FaExclamationTriangle,
  FaCheckCircle,
  FaSave,
  FaEdit,
  FaCalendarAlt
} from 'react-icons/fa'
import { useAuthStore } from '@/stores/authStore'
import { UserService, UserProfile, UserUpdateData } from '@/services/userService'
import DashboardSidebar from '@/components/ui/dashboard-sidebar'
import DashboardHeader from '@/components/ui/dashboard-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'

const DashboardProfilePage: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuthStore()
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Form state
  const [formData, setFormData] = useState<UserUpdateData>({
    firstName: '',
    lastName: '',
    phone: '',
    nit: '',
    cui: '',
    timezone: 'America/Guatemala',
    locale: 'es'
  })

  useEffect(() => {
    if (isAuthenticated) {
      loadProfileData()
    }
  }, [isAuthenticated])

  const loadProfileData = async () => {
    try {
      setLoading(true)
      setError(null)

      const profile = await UserService.getProfile()
      setUserProfile(profile)

      // Initialize form data
      setFormData({
        firstName: profile.firstName,
        lastName: profile.lastName,
        phone: profile.phone || '',
        nit: profile.nit || '',
        cui: profile.cui || '',
        timezone: profile.timezone,
        locale: profile.locale
      })
    } catch (err) {
      console.error('Error loading profile data:', err)
      setError(err instanceof Error ? err.message : 'Error cargando perfil')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof UserUpdateData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setError(null)
      setSuccess(null)

      await UserService.updateProfile(formData)

      // Reload profile data
      await loadProfileData()

      setSuccess('Perfil actualizado exitosamente')
      setIsEditing(false)

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      console.error('Error updating profile:', err)
      setError(err instanceof Error ? err.message : 'Error actualizando perfil')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    if (userProfile) {
      setFormData({
        firstName: userProfile.firstName,
        lastName: userProfile.lastName,
        phone: userProfile.phone || '',
        nit: userProfile.nit || '',
        cui: userProfile.cui || '',
        timezone: userProfile.timezone,
        locale: userProfile.locale
      })
    }
    setIsEditing(false)
    setError(null)
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Acceso Denegado</h1>
          <p className="text-gray-600 mb-6">Debes iniciar sesión para acceder al dashboard.</p>
          <Link to="/login">
            <Button className="bg-[#6B1E22] hover:bg-[#8a2b30] text-white">
              Ir al Login
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <Link to="/" className="flex items-center">
                <span className="text-2xl font-bold text-[#6B1E22]">TradeConnect</span>
              </Link>
              <div className="flex items-center space-x-4">
                <span className="text-gray-700">Cargando...</span>
                <Button
                  onClick={logout}
                  variant="outline"
                  className="text-gray-700 border-gray-300 hover:bg-gray-50"
                >
                  Cerrar Sesión
                </Button>
              </div>
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6B1E22]"></div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-bold text-[#6B1E22]">TradeConnect</span>
            </Link>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Bienvenido, {UserService.getFullName(userProfile)}</span>
              <Button
                onClick={logout}
                variant="outline"
                className="text-gray-700 border-gray-300 hover:bg-gray-50"
              >
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-80 flex-shrink-0">
            <DashboardSidebar />
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <DashboardHeader
              title="Mi Perfil"
              subtitle="Gestiona tu información personal y profesional"
            />

            {/* Success/Error Messages */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
              >
                <Alert className="border-red-200 bg-red-50">
                  <FaExclamationTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    {error}
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}

            {success && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
              >
                <Alert className="border-green-200 bg-green-50">
                  <FaCheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    {success}
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}

            {/* Profile Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Información Personal</h2>
                {!isEditing && (
                  <Button
                    onClick={() => setIsEditing(true)}
                    variant="outline"
                    size="sm"
                  >
                    <FaEdit className="mr-2" />
                    Editar
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* First Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre
                  </label>
                  {isEditing ? (
                    <Input
                      type="text"
                      value={formData.firstName || ''}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      placeholder="Ingresa tu nombre"
                      className="w-full"
                    />
                  ) : (
                    <div className="flex items-center p-3 bg-gray-50 rounded-md">
                      <FaUser className="text-gray-400 mr-3" />
                      <span className="text-gray-900">{userProfile?.firstName || 'No especificado'}</span>
                    </div>
                  )}
                </div>

                {/* Last Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Apellido
                  </label>
                  {isEditing ? (
                    <Input
                      type="text"
                      value={formData.lastName || ''}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      placeholder="Ingresa tu apellido"
                      className="w-full"
                    />
                  ) : (
                    <div className="flex items-center p-3 bg-gray-50 rounded-md">
                      <FaUser className="text-gray-400 mr-3" />
                      <span className="text-gray-900">{userProfile?.lastName || 'No especificado'}</span>
                    </div>
                  )}
                </div>

                {/* Email (Read-only) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Correo Electrónico
                  </label>
                  <div className="flex items-center p-3 bg-gray-50 rounded-md">
                    <FaEnvelope className="text-gray-400 mr-3" />
                    <span className="text-gray-900">{userProfile?.email}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    El email no puede ser modificado
                  </p>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono
                  </label>
                  {isEditing ? (
                    <Input
                      type="tel"
                      value={formData.phone || ''}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="+502 1234-5678"
                      className="w-full"
                    />
                  ) : (
                    <div className="flex items-center p-3 bg-gray-50 rounded-md">
                      <FaPhone className="text-gray-400 mr-3" />
                      <span className="text-gray-900">{userProfile?.phone || 'No especificado'}</span>
                    </div>
                  )}
                </div>

                {/* NIT */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    NIT
                  </label>
                  {isEditing ? (
                    <Input
                      type="text"
                      value={formData.nit || ''}
                      onChange={(e) => handleInputChange('nit', e.target.value)}
                      placeholder="12345678-9"
                      className="w-full"
                    />
                  ) : (
                    <div className="flex items-center p-3 bg-gray-50 rounded-md">
                      <FaBuilding className="text-gray-400 mr-3" />
                      <span className="text-gray-900">{userProfile?.nit || 'No especificado'}</span>
                    </div>
                  )}
                </div>

                {/* CUI */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CUI
                  </label>
                  {isEditing ? (
                    <Input
                      type="text"
                      value={formData.cui || ''}
                      onChange={(e) => handleInputChange('cui', e.target.value)}
                      placeholder="1234567890123"
                      className="w-full"
                    />
                  ) : (
                    <div className="flex items-center p-3 bg-gray-50 rounded-md">
                      <FaMapMarkerAlt className="text-gray-400 mr-3" />
                      <span className="text-gray-900">{userProfile?.cui || 'No especificado'}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Account Information (Read-only) */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Información de Cuenta</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estado de la Cuenta
                    </label>
                    <div className="flex items-center p-3 bg-gray-50 rounded-md">
                      <FaCheckCircle className="text-green-600 mr-3" />
                      <span className="text-gray-900">
                        {userProfile?.isActive ? 'Activa' : 'Inactiva'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Verificado
                    </label>
                    <div className="flex items-center p-3 bg-gray-50 rounded-md">
                      <FaCheckCircle className={`mr-3 ${userProfile?.isEmailVerified ? 'text-green-600' : 'text-yellow-600'}`} />
                      <span className="text-gray-900">
                        {userProfile?.isEmailVerified ? 'Verificado' : 'Pendiente'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Miembro desde
                    </label>
                    <div className="flex items-center p-3 bg-gray-50 rounded-md">
                      <FaCalendarAlt className="text-gray-400 mr-3" />
                      <span className="text-gray-900">
                        {userProfile?.createdAt ? new Date(userProfile.createdAt).toLocaleDateString('es-GT') : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {isEditing && (
                <div className="flex flex-col sm:flex-row gap-3 mt-8 pt-6 border-t border-gray-200">
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 bg-[#6B1E22] hover:bg-[#8a2b30] text-white"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Guardando...
                      </>
                    ) : (
                      <>
                        <FaSave className="mr-2" />
                        Guardar Cambios
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={handleCancel}
                    variant="outline"
                    disabled={saving}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardProfilePage