import React, { useState, useEffect } from 'react'
import { FaSave, FaTimes, FaUpload, FaPlus, FaTrash } from 'react-icons/fa'
import { AdminLayout } from '@/layouts/AdminLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { adminSpeakerService } from '@/services/admin'
import { toast } from '@/utils/toast'
import type {
  DetailedSpeaker,
  UpdateSpeakerData,
  SpecialtyInfo,
  SpeakerCategory,
  RateType,
  Modality,
} from '@/types/admin'

interface AdminSpeakerEditPageProps {
  speakerId: number
}

const AdminSpeakerEditPage: React.FC<AdminSpeakerEditPageProps> = ({ speakerId }) => {
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [specialties, setSpecialties] = useState<SpecialtyInfo[]>([])
  const [selectedSpecialties, setSelectedSpecialties] = useState<number[]>([])
  const [speaker, setSpeaker] = useState<DetailedSpeaker | null>(null)
  const [formData, setFormData] = useState<UpdateSpeakerData>({})

  // Cargar datos del speaker y especialidades
  useEffect(() => {
    loadSpeaker()
    loadSpecialties()
  }, [speakerId])

  const loadSpeaker = async () => {
    try {
      setFetching(true)
      const data = await adminSpeakerService.getSpeakerById(speakerId)
      setSpeaker(data)
      setSelectedSpecialties((data as any).specialties.map((s: any) => s.speakerSpecialtyId))
    } catch (error) {
      console.error('Error cargando speaker:', error)
      toast.error('Error al cargar el speaker')
    } finally {
      setFetching(false)
    }
  }

  const loadSpecialties = async () => {
    try {
      const data = await adminSpeakerService.getSpecialties()
      setSpecialties(data)
    } catch (error) {
      console.error('Error cargando especialidades:', error)
      toast.error('Error al cargar las especialidades')
    }
  }

  // Manejar cambios en el formulario
  const handleInputChange = (field: keyof UpdateSpeakerData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Manejar selección de especialidades
  const handleSpecialtyToggle = (specialtyId: number, checked: boolean) => {
    setSelectedSpecialties(prev =>
      checked
        ? [...prev, specialtyId]
        : prev.filter(id => id !== specialtyId)
    )
  }

  // Manejar selección de modalidades
  const handleModalityToggle = (modality: Modality, checked: boolean) => {
    const currentModalities = formData.modalities || speaker?.modalities || []
    setFormData(prev => ({
      ...prev,
      modalities: checked
        ? [...currentModalities, modality]
        : currentModalities.filter(m => m !== modality)
    } as any))
  }

  // Manejar idiomas
  const [newLanguage, setNewLanguage] = useState('')
  const handleAddLanguage = () => {
    if (newLanguage.trim()) {
      const currentLanguages = formData.languages || speaker?.languages || []
      if (!currentLanguages.includes(newLanguage.trim())) {
        setFormData(prev => ({
          ...prev,
          languages: [...currentLanguages, newLanguage.trim()]
        }))
        setNewLanguage('')
      }
    }
  }

  const handleRemoveLanguage = (language: string) => {
    const currentLanguages = formData.languages || speaker?.languages || []
    setFormData(prev => ({
      ...prev,
      languages: currentLanguages.filter(l => l !== language)
    }))
  }

  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!speaker) return

    try {
      setLoading(true)

      const submitData: UpdateSpeakerData = {
        ...formData,
        specialtyIds: selectedSpecialties,
      }

      await adminSpeakerService.updateSpeaker(speakerId, submitData)
      toast.success('Speaker actualizado exitosamente')

      // Recargar datos
      await loadSpeaker()
    } catch (error) {
      console.error('Error actualizando speaker:', error)
      toast.error('Error al actualizar el speaker')
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <AdminLayout title="Editar Speaker" breadcrumbs={[]}>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    )
  }

  if (!speaker) {
    return (
      <AdminLayout title="Editar Speaker" breadcrumbs={[]}>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900">Speaker no encontrado</h2>
          <p className="text-gray-600 mt-2">El speaker solicitado no existe o ha sido eliminado.</p>
        </div>
      </AdminLayout>
    )
  }

  const breadcrumbs = [
    { label: 'Dashboard', href: '/admin' },
    { label: 'Speakers', href: '/admin/speakers' },
    { label: `Editar ${speaker.fullName}` },
  ]

  return (
    <AdminLayout title={`Editar Speaker - ${speaker.fullName}`} breadcrumbs={breadcrumbs}>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Editar Speaker</h1>
            <p className="text-gray-600">Modificar la información de {speaker.fullName}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información Personal */}
          <Card>
            <CardHeader>
              <CardTitle>Información Personal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">Nombre *</Label>
                  <Input
                    id="firstName"
                    defaultValue={speaker.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Apellido *</Label>
                  <Input
                    id="lastName"
                    defaultValue={speaker.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    defaultValue={speaker.email}
                    disabled
                    className="bg-gray-50"
                  />
                  <p className="text-sm text-gray-500 mt-1">El email no se puede modificar</p>
                </div>
                <div>
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input
                    id="phone"
                    defaultValue={speaker.phone || ''}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="country">País</Label>
                  <Input
                    id="country"
                    defaultValue={speaker.country || ''}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="nit">NIT</Label>
                  <Input
                    id="nit"
                    defaultValue={speaker.nit || ''}
                    onChange={(e) => handleInputChange('nit', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="cui">CUI</Label>
                  <Input
                    id="cui"
                    defaultValue={speaker.cui || ''}
                    onChange={(e) => handleInputChange('cui', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="rtu">RTU</Label>
                <Input
                  id="rtu"
                  defaultValue={speaker.rtu || ''}
                  onChange={(e) => handleInputChange('rtu', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Información Profesional */}
          <Card>
            <CardHeader>
              <CardTitle>Información Profesional</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Categoría</Label>
                  <Select
                    defaultValue={speaker.category}
                    onValueChange={(value) => handleInputChange('category', value as SpeakerCategory)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="national">Nacional</SelectItem>
                      <SelectItem value="international">Internacional</SelectItem>
                      <SelectItem value="expert">Experto</SelectItem>
                      <SelectItem value="special_guest">Invitado Especial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="baseRate">Tarifa Base</Label>
                  <Input
                    id="baseRate"
                    type="number"
                    min="0"
                    step="0.01"
                    defaultValue={speaker.baseRate}
                    onChange={(e) => handleInputChange('baseRate', parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="rateType">Tipo de Tarifa</Label>
                <Select
                  defaultValue={speaker.rateType}
                  onValueChange={(value) => handleInputChange('rateType', value as RateType)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">Por hora</SelectItem>
                    <SelectItem value="daily">Por día</SelectItem>
                    <SelectItem value="event">Por evento</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Modalidades</Label>
                <div className="flex flex-wrap gap-4 mt-2">
                  {(['presential', 'virtual', 'hybrid'] as Modality[]).map((modality) => (
                    <div key={modality} className="flex items-center space-x-2">
                      <Checkbox
                        id={`modality-${modality}`}
                        defaultChecked={(formData.modalities || speaker.modalities).includes(modality)}
                        onCheckedChange={(checked) => handleModalityToggle(modality, checked as boolean)}
                      />
                      <Label htmlFor={`modality-${modality}`} className="capitalize">
                        {modality === 'presential' ? 'Presencial' :
                         modality === 'virtual' ? 'Virtual' : 'Híbrida'}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label>Idiomas</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    placeholder="Agregar idioma"
                    value={newLanguage}
                    onChange={(e) => setNewLanguage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddLanguage())}
                  />
                  <Button type="button" onClick={handleAddLanguage}>
                    <FaPlus />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {(formData.languages || speaker.languages).map((language) => (
                    <Badge key={language} variant="secondary" className="flex items-center gap-1">
                      {language}
                      <FaTrash
                        className="cursor-pointer"
                        onClick={() => handleRemoveLanguage(language)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Especialidades */}
          <Card>
            <CardHeader>
              <CardTitle>Especialidades</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {specialties.map((specialty) => (
                  <div key={specialty.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`specialty-${specialty.id}`}
                      checked={selectedSpecialties.includes(specialty.id)}
                      onCheckedChange={(checked) => handleSpecialtyToggle(specialty.id, checked as boolean)}
                    />
                    <Label htmlFor={`specialty-${specialty.id}`}>
                      {specialty.name}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Biografía y Redes Sociales */}
          <Card>
            <CardHeader>
              <CardTitle>Biografía y Redes Sociales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="shortBio">Biografía Corta</Label>
                <Textarea
                  id="shortBio"
                  defaultValue={speaker.shortBio || ''}
                  onChange={(e) => handleInputChange('shortBio', e.target.value)}
                  placeholder="Breve descripción profesional..."
                />
              </div>

              <div>
                <Label htmlFor="fullBio">Biografía Completa</Label>
                <Textarea
                  id="fullBio"
                  defaultValue={speaker.fullBio || ''}
                  onChange={(e) => handleInputChange('fullBio', e.target.value)}
                  placeholder="Biografía detallada..."
                  rows={6}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="linkedinUrl">LinkedIn</Label>
                  <Input
                    id="linkedinUrl"
                    defaultValue={speaker.linkedinUrl || ''}
                    onChange={(e) => handleInputChange('linkedinUrl', e.target.value)}
                    placeholder="https://linkedin.com/in/..."
                  />
                </div>
                <div>
                  <Label htmlFor="twitterUrl">Twitter</Label>
                  <Input
                    id="twitterUrl"
                    defaultValue={speaker.twitterUrl || ''}
                    onChange={(e) => handleInputChange('twitterUrl', e.target.value)}
                    placeholder="https://twitter.com/..."
                  />
                </div>
                <div>
                  <Label htmlFor="websiteUrl">Sitio Web</Label>
                  <Input
                    id="websiteUrl"
                    defaultValue={speaker.websiteUrl || ''}
                    onChange={(e) => handleInputChange('websiteUrl', e.target.value)}
                    placeholder="https://..."
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Estado */}
          <Card>
            <CardHeader>
              <CardTitle>Estado</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isActive"
                  defaultChecked={speaker.isActive}
                  onCheckedChange={(checked) => handleInputChange('isActive', checked)}
                />
                <Label htmlFor="isActive">Speaker activo</Label>
              </div>
            </CardContent>
          </Card>

          {/* Acciones */}
          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={() => window.history.back()}>
              <FaTimes className="mr-2" />
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              <FaSave className="mr-2" />
              {loading ? 'Actualizando...' : 'Actualizar Speaker'}
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  )
}

export default AdminSpeakerEditPage