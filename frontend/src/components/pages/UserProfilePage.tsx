import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaBuilding, FaIdCard, FaSave, FaCamera } from 'react-icons/fa'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuth } from '@/context/AuthContext'
import { showToast } from '@/utils/toast'
import { api } from '@/services/api'

// Validation schema
const profileSchema = z.object({
  name: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede tener más de 100 caracteres'),
  email: z
    .string()
    .email('Ingresa un email válido'),
  phone: z
    .string()
    .optional()
    .refine((val) => !val || /^\+?[\d\s\-\(\)]+$/.test(val), {
      message: 'Ingresa un número de teléfono válido'
    }),
  company: z
    .string()
    .max(100, 'El nombre de la empresa no puede tener más de 100 caracteres')
    .optional(),
  position: z
    .string()
    .max(100, 'El cargo no puede tener más de 100 caracteres')
    .optional(),
  address: z
    .string()
    .max(200, 'La dirección no puede tener más de 200 caracteres')
    .optional(),
  city: z
    .string()
    .max(50, 'La ciudad no puede tener más de 50 caracteres')
    .optional(),
  country: z
    .string()
    .max(50, 'El país no puede tener más de 50 caracteres')
    .optional(),
  nit: z
    .string()
    .optional()
    .refine((val) => !val || /^\d{4,12}$/.test(val), {
      message: 'El NIT debe contener solo números (4-12 dígitos)'
    }),
  dateOfBirth: z
    .string()
    .optional()
    .refine((val) => !val || !isNaN(Date.parse(val)), {
      message: 'Ingresa una fecha válida'
    }),
})

type ProfileFormData = z.infer<typeof profileSchema>

export const UserProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: (user as any)?.phone || '',
      company: (user as any)?.company || '',
      position: (user as any)?.position || '',
      address: (user as any)?.address || '',
      city: (user as any)?.city || '',
      country: (user as any)?.country || 'Guatemala',
      nit: (user as any)?.nit || '',
      dateOfBirth: (user as any)?.dateOfBirth || '',
    },
  })

  useEffect(() => {
    // Update form when user data changes
    if (user) {
      form.reset({
        name: user.name || '',
        email: user.email || '',
        phone: (user as any).phone || '',
        company: (user as any).company || '',
        position: (user as any).position || '',
        address: (user as any).address || '',
        city: (user as any).city || '',
        country: (user as any).country || 'Guatemala',
        nit: (user as any).nit || '',
        dateOfBirth: (user as any).dateOfBirth || '',
      })
    }
  }, [user, form])

  const onSubmit = async (data: ProfileFormData) => {
    try {
      setIsLoading(true)

      // Handle avatar upload if there's a file
      let avatarUrl = user?.avatar
      if (avatarFile) {
        // In a real app, you would upload the file to your server
        // const formData = new FormData()
        // formData.append('avatar', avatarFile)
        // const uploadResponse = await api.post('/user/upload-avatar', formData)
        // avatarUrl = uploadResponse.data.avatarUrl

        // For now, just simulate the upload
        await new Promise(resolve => setTimeout(resolve, 1000))
        avatarUrl = avatarPreview || undefined // Use the preview as the new avatar
      }

      // Update profile
      const result = await updateProfile({
        ...data,
        avatar: avatarUrl,
      })

      if (result.success) {
        showToast.success('Perfil actualizado exitosamente')
        setAvatarFile(null)
        setAvatarPreview(null)
      } else {
        showToast.error(result.error || 'Error al actualizar el perfil')
      }
    } catch (error) {
      console.error('Profile update error:', error)
      showToast.error('Error inesperado. Inténtalo de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        showToast.error('Por favor selecciona un archivo de imagen válido')
        return
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showToast.error('La imagen no puede ser mayor a 5MB')
        return
      }

      setAvatarFile(file)

      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Editar Perfil</h1>
          <p className="text-gray-600 mt-1">
            Mantén tu información personal actualizada
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Avatar Section */}
          <Card>
            <CardHeader>
              <CardTitle>Foto de Perfil</CardTitle>
              <CardDescription>
                Sube una foto profesional para tu perfil
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="relative mx-auto mb-4 w-32 h-32">
                <Avatar className="w-32 h-32">
                  <AvatarImage
                    src={avatarPreview || user?.avatar}
                    alt={user?.name}
                  />
                  <AvatarFallback className="text-2xl">
                    {user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
                  </AvatarFallback>
                </Avatar>

                <label
                  htmlFor="avatar-upload"
                  className="absolute bottom-0 right-0 bg-primary text-white rounded-full p-2 cursor-pointer hover:bg-primary/90 transition-colors"
                >
                  <FaCamera className="h-4 w-4" />
                </label>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </div>

              <p className="text-sm text-gray-600 mb-4">
                JPG, PNG o GIF. Máximo 5MB.
              </p>

              {avatarFile && (
                <div className="text-sm text-green-600 mb-4">
                  ✓ Imagen seleccionada: {avatarFile.name}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Profile Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Información Personal</CardTitle>
                <CardDescription>
                  Completa tu información para una mejor experiencia
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Basic Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nombre Completo *</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  placeholder="Tu nombre completo"
                                  {...field}
                                  disabled={isLoading}
                                />
                                <FaUser className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email *</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  type="email"
                                  placeholder="tu@email.com"
                                  {...field}
                                  disabled={isLoading}
                                />
                                <FaEnvelope className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Contact Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Teléfono</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  type="tel"
                                  placeholder="+502 5555-5555"
                                  {...field}
                                  disabled={isLoading}
                                />
                                <FaPhone className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="dateOfBirth"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Fecha de Nacimiento</FormLabel>
                            <FormControl>
                              <Input
                                type="date"
                                {...field}
                                disabled={isLoading}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Professional Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="company"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Empresa</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  placeholder="Nombre de tu empresa"
                                  {...field}
                                  disabled={isLoading}
                                />
                                <FaBuilding className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="position"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cargo</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Tu cargo en la empresa"
                                {...field}
                                disabled={isLoading}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Address Information */}
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Dirección</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  placeholder="Dirección completa"
                                  {...field}
                                  disabled={isLoading}
                                />
                                <FaMapMarkerAlt className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name="city"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Ciudad</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Ciudad"
                                  {...field}
                                  disabled={isLoading}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="country"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>País</FormLabel>
                              <FormControl>
                                <select
                                  {...field}
                                  disabled={isLoading}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                >
                                  <option value="Guatemala">Guatemala</option>
                                  <option value="El Salvador">El Salvador</option>
                                  <option value="Honduras">Honduras</option>
                                  <option value="Nicaragua">Nicaragua</option>
                                  <option value="Costa Rica">Costa Rica</option>
                                  <option value="Panamá">Panamá</option>
                                  <option value="Belice">Belice</option>
                                </select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="nit"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>NIT</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Input
                                    placeholder="12345678"
                                    {...field}
                                    disabled={isLoading}
                                  />
                                  <FaIdCard className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-6">
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="min-w-[150px]"
                      >
                        {isLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Guardando...
                          </>
                        ) : (
                          <>
                            <FaSave className="mr-2 h-4 w-4" />
                            Guardar Cambios
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}