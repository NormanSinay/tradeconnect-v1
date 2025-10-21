import React, { useState } from 'react'
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
  CreateSpeakerData,
  SpecialtyInfo,
  SpeakerCategory,
  RateType,
  Modality,
} from '@/types/admin'

const AdminSpeakerCreatePage: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [specialties, setSpecialties] = useState<SpecialtyInfo[]>([])
  const [selectedSpecialties, setSelectedSpecialties] = useState<number[]>([])
  const [formData, setFormData] = useState<CreateSpeakerData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    country: '',
    nit: '',
    cui: '',
    rtu: '',
    profileImage: '',
    shortBio: '',
    fullBio: '',
    linkedinUrl: '',
    twitterUrl: '',
    websiteUrl: '',
    baseRate: 0,
    rateType: 'hourly',
    modalities: [],
    languages: [],
    cvFile: '',
    category: 'national',
    specialtyIds: [],
  })

  // Cargar especialidades al montar
  React.useEffect(() => {
    loadSpecialties()
  }, [])

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
  const handleInputChange = (field: keyof CreateSpeakerData, value: any) => {
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
    setFormData(prev => ({
      ...prev,
      modalities: checked
        ? [...prev.modalities, modality]
        : prev.modalities.filter(m => m !== modality)
    }))
  }

  // Manejar idiomas
  const [newLanguage, setNewLanguage] = useState('')
  const handleAddLanguage = () => {
    if (newLanguage.trim() && !formData.languages.includes(newLanguage.trim())) {
      setFormData(prev => ({
        ...prev,
        languages: [...prev.languages, newLanguage.trim()]
      }))
      setNewLanguage('')
    }
  }

  const handleRemoveLanguage = (language: string) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.filter(l => l !== language)
    }))
  }

  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setLoading(true)

      const submitData: CreateSpeakerData = {
        ...formData,
        specialtyIds: selectedSpecialties,
      }

      await adminSpeakerService.createSpeaker(submitData)
      toast.success('Speaker creado exitosamente')

      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        country: '',
        nit: '',
        cui: '',
        rtu: '',
        profileImage: '',
        shortBio: '',
        fullBio: '',
        linkedinUrl: '',
        twitterUrl: '',
        websiteUrl: '',
        baseRate: 0,
        rateType: 'hourly',
        modalities: [],
        languages: [],
        cvFile: '',
        category: 'national',
        specialtyIds: [],
      })
      setSelectedSpecialties([])
    } catch (error) {
      console.error('Error creando speaker:', error)
      toast.error('Error al crear el speaker')
    } finally {
      setLoading(false)
    }
  }

  const breadcrumbs = [
    { label: 'Dashboard', href: '/admin' },
    { label: 'Speakers', href: '/admin/speakers' },
    { label: 'Crear Speaker' },
  ]

  return (
    <AdminLayout title="Crear Speaker" breadcrumbs={breadcrumbs}>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Crear Nuevo Speaker</h1>
            <p className="text-gray-600">Complete la información del speaker</p>
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
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Apellido *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="country">País</Label>
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="nit">NIT</Label>
                  <Input
                    id="nit"
                    value={formData.nit}
                    onChange={(e) => handleInputChange('nit', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="cui">CUI</Label>
                  <Input
                    id="cui"
                    value={formData.cui}
                    onChange={(e) => handleInputChange('cui', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="rtu">RTU</Label>
                <Input
                  id="rtu"
                  value={formData.rtu}
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
                  <Label htmlFor="category">Categoría *</Label>
                  <Select
                    value={formData.category}
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
                  <Label htmlFor="baseRate">Tarifa Base *</Label>
                  <Input
                    id="baseRate"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.baseRate}
                    onChange={(e) => handleInputChange('baseRate', parseFloat(e.target.value) || 0)}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="rateType">Tipo de Tarifa *</Label>
                <Select
                  value={formData.rateType}
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
                <Label>Modalidades *</Label>
                <div className="flex flex-wrap gap-4 mt-2">
                  {(['presential', 'virtual', 'hybrid'] as Modality[]).map((modality) => (
                    <div key={modality} className="flex items-center space-x-2">
                      <Checkbox
                        id={`modality-${modality}`}
                        checked={formData.modalities.includes(modality)}
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
                  {formData.languages.map((language) => (
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
                <Label htmlFor="shortBio">Biografía Corta *</Label>
                <Textarea
                  id="shortBio"
                  value={formData.shortBio}
                  onChange={(e) => handleInputChange('shortBio', e.target.value)}
                  placeholder="Breve descripción profesional..."
                  required
                />
              </div>

              <div>
                <Label htmlFor="fullBio">Biografía Completa</Label>
                <Textarea
                  id="fullBio"
                  value={formData.fullBio}
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
                    value={formData.linkedinUrl}
                    onChange={(e) => handleInputChange('linkedinUrl', e.target.value)}
                    placeholder="https://linkedin.com/in/..."
                  />
                </div>
                <div>
                  <Label htmlFor="twitterUrl">Twitter</Label>
                  <Input
                    id="twitterUrl"
                    value={formData.twitterUrl}
                    onChange={(e) => handleInputChange('twitterUrl', e.target.value)}
                    placeholder="https://twitter.com/..."
                  />
                </div>
                <div>
                  <Label htmlFor="websiteUrl">Sitio Web</Label>
                  <Input
                    id="websiteUrl"
                    value={formData.websiteUrl}
                    onChange={(e) => handleInputChange('websiteUrl', e.target.value)}
                    placeholder="https://..."
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Archivos */}
          <Card>
            <CardHeader>
              <CardTitle>Archivos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="profileImage">Imagen de Perfil</Label>
                <Input
                  id="profileImage"
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleInputChange('profileImage', e.target.files?.[0]?.name || '')}
                />
              </div>

              <div>
                <Label htmlFor="cvFile">CV/Resume</Label>
                <Input
                  id="cvFile"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => handleInputChange('cvFile', e.target.files?.[0]?.name || '')}
                />
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
              {loading ? 'Creando...' : 'Crear Speaker'}
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  )
}

export default AdminSpeakerCreatePage