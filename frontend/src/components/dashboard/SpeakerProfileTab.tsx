import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { User, Save, Edit, Star, Calendar, DollarSign, Award, TrendingUp, Users, MapPin, Phone, Globe, Linkedin, Twitter, Briefcase, Target } from 'lucide-react';
import { SpeakerDashboardService, SpeakerStats } from '@/services/speakerDashboardService';
import { useSpeakerDashboardState } from '@/hooks/useSpeakerDashboardState';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

interface SpeakerProfile {
  shortBio: string;
  fullBio: string;
  linkedinUrl: string;
  twitterUrl: string;
  websiteUrl: string;
  phone: string;
  country: string;
  specialties: string[];
  languages: string[];
  experience: string;
  availability: 'available' | 'limited' | 'unavailable';
}

interface Evaluation {
  id: number;
  eventTitle: string;
  rating: number;
  comment: string;
  createdAt: string;
}

const SpeakerProfileTab: React.FC<{ activeTab: string }> = () => {
  const [profile, setProfile] = useState<SpeakerProfile>({
    shortBio: '',
    fullBio: '',
    linkedinUrl: '',
    twitterUrl: '',
    websiteUrl: '',
    phone: '',
    country: '',
    specialties: [],
    languages: [],
    experience: '',
    availability: 'available'
  });
  const [stats, setStats] = useState<SpeakerStats | null>(null);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const { formatCurrency, formatRating, formatDate } = useSpeakerDashboardState();

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      const speakerStats = await SpeakerDashboardService.getSpeakerStats();
      setStats(speakerStats);

      // Placeholder profile data - in real implementation, fetch from API
      setProfile({
        shortBio: 'Experto en tecnología y emprendimiento con más de 10 años de experiencia.',
        fullBio: 'Soy un apasionado de la tecnología y el emprendimiento. He trabajado en múltiples startups y he sido speaker en conferencias internacionales.',
        linkedinUrl: 'https://linkedin.com/in/speaker',
        twitterUrl: 'https://twitter.com/speaker',
        websiteUrl: 'https://speaker.com',
        phone: '+502 1234 5678',
        country: 'Guatemala',
        specialties: ['Tecnología', 'Emprendimiento', 'Innovación'],
        languages: ['Español', 'Inglés'],
        experience: '10+ años',
        availability: 'available'
      });

      // Placeholder evaluations
      setEvaluations([
        {
          id: 1,
          eventTitle: 'Tech Conference 2024',
          rating: 5,
          comment: 'Excelente presentación, muy inspiradora.',
          createdAt: '2024-11-01T10:00:00Z'
        },
        {
          id: 2,
          eventTitle: 'Startup Summit',
          rating: 4,
          comment: 'Buen contenido, pero podría mejorar la interacción.',
          createdAt: '2024-10-15T14:30:00Z'
        }
      ]);
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error('Error al cargar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await SpeakerDashboardService.updateSpeakerProfile(profile);
      setEditing(false);
      toast.success('Perfil actualizado exitosamente');
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Error al guardar el perfil');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateAvailabilityBlock = async () => {
    // Implementar modal para crear bloqueo de disponibilidad
    toast.success('Funcionalidad de disponibilidad próximamente');
  };

  const handleInputChange = (field: keyof SpeakerProfile, value: string | string[]) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const getAvailabilityBadge = (availability: string) => {
    switch (availability) {
      case 'available':
        return <Badge className="bg-green-100 text-green-800">Disponible</Badge>;
      case 'limited':
        return <Badge className="bg-yellow-100 text-yellow-800">Disponibilidad Limitada</Badge>;
      case 'unavailable':
        return <Badge className="bg-red-100 text-red-800">No Disponible</Badge>;
      default:
        return <Badge variant="secondary">{availability}</Badge>;
    }
  };

  const averageRating = evaluations.length > 0
    ? evaluations.reduce((sum, evaluation) => sum + evaluation.rating, 0) / evaluations.length
    : 0;

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center py-12"
      >
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        <span className="ml-3 text-gray-600">Cargando perfil...</span>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-purple-600">Mi Perfil de Speaker</h2>
          <p className="text-gray-600">Gestiona tu información personal y profesional</p>
        </div>
        {!editing && (
          <Button
            onClick={() => setEditing(true)}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Edit className="w-4 h-4 mr-2" />
            Editar Perfil
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Estadísticas y Disponibilidad */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-purple-600 flex items-center">
                <Award className="w-5 h-5 mr-2" />
                Estadísticas Profesionales
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {stats && (
                <>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Calendar className="w-5 h-5 text-purple-600 mr-2" />
                      <span className="text-sm">Eventos Realizados</span>
                    </div>
                    <span className="font-semibold">{stats.completedEvents}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Star className="w-5 h-5 text-purple-600 mr-2" />
                      <span className="text-sm">Calificación</span>
                    </div>
                    <span className="font-semibold">
                      {stats.averageRating > 0 ? `${formatRating(stats.averageRating)} ⭐` : 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <DollarSign className="w-5 h-5 text-purple-600 mr-2" />
                      <span className="text-sm">Ganancias Totales</span>
                    </div>
                    <span className="font-semibold">{formatCurrency(stats.totalEarnings)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Users className="w-5 h-5 text-purple-600 mr-2" />
                      <span className="text-sm">Materiales</span>
                    </div>
                    <span className="font-semibold">{stats.totalMaterials}</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-purple-600 flex items-center">
                <Target className="w-5 h-5 mr-2" />
                Disponibilidad
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm">Estado actual:</span>
                {getAvailabilityBadge(profile.availability)}
              </div>
              {editing && (
                <Select
                  value={profile.availability}
                  onValueChange={(value: 'available' | 'limited' | 'unavailable') =>
                    handleInputChange('availability', value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Disponible</SelectItem>
                    <SelectItem value="limited">Disponibilidad Limitada</SelectItem>
                    <SelectItem value="unavailable">No Disponible</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </CardContent>
          </Card>

          {/* Especialidades */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-purple-600 flex items-center">
                <Briefcase className="w-5 h-5 mr-2" />
                Especialidades
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {profile.specialties.map((specialty, index) => (
                  <Badge key={index} variant="secondary">{specialty}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Información Personal y Profesional */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-purple-600">Información Personal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone" className="flex items-center">
                    <Phone className="w-4 h-4 mr-2" />
                    Teléfono
                  </Label>
                  <Input
                    id="phone"
                    value={profile.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    disabled={!editing}
                  />
                </div>
                <div>
                  <Label htmlFor="country" className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    País
                  </Label>
                  <Input
                    id="country"
                    value={profile.country}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                    disabled={!editing}
                  />
                </div>
                <div>
                  <Label htmlFor="experience">Experiencia</Label>
                  <Input
                    id="experience"
                    value={profile.experience}
                    onChange={(e) => handleInputChange('experience', e.target.value)}
                    disabled={!editing}
                    placeholder="ej: 5+ años"
                  />
                </div>
                <div>
                  <Label htmlFor="languages">Idiomas</Label>
                  <Input
                    id="languages"
                    value={profile.languages.join(', ')}
                    onChange={(e) => handleInputChange('languages', e.target.value.split(', '))}
                    disabled={!editing}
                    placeholder="Español, Inglés"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="shortBio">Biografía Corta</Label>
                <Textarea
                  id="shortBio"
                  value={profile.shortBio}
                  onChange={(e) => handleInputChange('shortBio', e.target.value)}
                  disabled={!editing}
                  rows={3}
                  placeholder="Una breve descripción de ti como speaker..."
                />
              </div>

              <div>
                <Label htmlFor="fullBio">Biografía Completa</Label>
                <Textarea
                  id="fullBio"
                  value={profile.fullBio}
                  onChange={(e) => handleInputChange('fullBio', e.target.value)}
                  disabled={!editing}
                  rows={5}
                  placeholder="Describe tu experiencia, logros y lo que ofreces como speaker..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Redes Sociales */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-purple-600 flex items-center">
                <Globe className="w-5 h-5 mr-2" />
                Redes Sociales y Web
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="linkedinUrl" className="flex items-center">
                    <Linkedin className="w-4 h-4 mr-2" />
                    LinkedIn
                  </Label>
                  <Input
                    id="linkedinUrl"
                    value={profile.linkedinUrl}
                    onChange={(e) => handleInputChange('linkedinUrl', e.target.value)}
                    disabled={!editing}
                    placeholder="https://linkedin.com/in/tu-perfil"
                  />
                </div>
                <div>
                  <Label htmlFor="twitterUrl" className="flex items-center">
                    <Twitter className="w-4 h-4 mr-2" />
                    Twitter
                  </Label>
                  <Input
                    id="twitterUrl"
                    value={profile.twitterUrl}
                    onChange={(e) => handleInputChange('twitterUrl', e.target.value)}
                    disabled={!editing}
                    placeholder="https://twitter.com/tu-usuario"
                  />
                </div>
                <div>
                  <Label htmlFor="websiteUrl" className="flex items-center">
                    <Globe className="w-4 h-4 mr-2" />
                    Sitio Web
                  </Label>
                  <Input
                    id="websiteUrl"
                    value={profile.websiteUrl}
                    onChange={(e) => handleInputChange('websiteUrl', e.target.value)}
                    disabled={!editing}
                    placeholder="https://tu-sitio-web.com"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Evaluaciones Recientes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-purple-600 flex items-center">
                <Star className="w-5 h-5 mr-2" />
                Evaluaciones Recientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {evaluations.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="text-2xl font-bold text-purple-600">
                      {averageRating.toFixed(1)} ⭐
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">
                        Promedio de {evaluations.length} evaluaciones
                      </div>
                      <Progress value={(averageRating / 5) * 100} className="w-32 mt-1" />
                    </div>
                  </div>
                  <div className="space-y-3 max-h-48 overflow-y-auto">
                    {evaluations.slice(0, 3).map((evaluation) => (
                      <div key={evaluation.id} className="border-l-4 border-purple-200 pl-4 py-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-sm">{evaluation.eventTitle}</span>
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3 h-3 ${
                                  i < evaluation.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 italic">"{evaluation.comment}"</p>
                        <p className="text-xs text-gray-500 mt-1">{formatDate(evaluation.createdAt)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-gray-600 text-center py-4">
                  Aún no tienes evaluaciones. Participa en eventos para recibir feedback.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {editing && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-end gap-4"
        >
          <Button
            variant="outline"
            onClick={() => {
              setEditing(false);
              loadProfileData(); // Reset changes
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Guardando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Guardar Cambios
              </>
            )}
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default SpeakerProfileTab;