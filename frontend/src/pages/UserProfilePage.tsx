import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { FaUser, FaEnvelope, FaPhone, FaBuilding, FaBriefcase, FaSave, FaCamera } from 'react-icons/fa';

interface UserProfile {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  company?: string;
  position?: string;
  bio?: string;
  interests?: string;
  avatar?: string;
  nit?: string;
  cui?: string;
  emailVerified: boolean;
  is2faEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

const UserProfilePage: React.FC = () => {
  const { user, isAuthenticated } = useAuthStore();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    company: '',
    position: '',
    bio: '',
    interests: ''
  });

  useEffect(() => {
    if (isAuthenticated) {
      fetchProfile();
    }
  }, [isAuthenticated]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      // TODO: Implementar llamada real a la API
      // const response = await fetch('/api/v1/users/profile');
      // const data = await response.json();

      // Datos mock por ahora
      const mockProfile: UserProfile = {
        id: 1,
        email: 'usuario@ejemplo.com',
        firstName: 'María',
        lastName: 'González',
        phone: '+502 1234-5678',
        company: 'Innovatech Solutions',
        position: 'Gerente de Marketing',
        bio: 'Profesional con 8 años de experiencia en marketing digital y estrategias de crecimiento empresarial. Especializada en transformación digital y desarrollo de marcas.',
        interests: 'Marketing Digital, Innovación, Liderazgo, Tecnología',
        nit: '12345678-9',
        cui: '1234567890123',
        emailVerified: true,
        is2faEnabled: true,
        createdAt: '2023-01-15T10:00:00.000Z',
        updatedAt: '2023-10-01T12:00:00.000Z'
      };

      setProfile(mockProfile);
      setFormData({
        firstName: mockProfile.firstName,
        lastName: mockProfile.lastName,
        phone: mockProfile.phone || '',
        company: mockProfile.company || '',
        position: mockProfile.position || '',
        bio: mockProfile.bio || '',
        interests: mockProfile.interests || ''
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      // TODO: Implementar llamada real a la API
      // const response = await fetch('/api/v1/users/profile', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData)
      // });
      // const data = await response.json();

      // Simular delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      console.log('Perfil actualizado:', formData);
      alert('Perfil actualizado exitosamente');
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Error al guardar el perfil');
    } finally {
      setSaving(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Acceso Denegado</h1>
          <p className="text-gray-600 mb-6">Debes iniciar sesión para acceder a esta página.</p>
          <Link to="/login">
            <Button className="bg-[#6B1E22] hover:bg-[#8a2b30] text-white">
              Ir al Login
            </Button>
          </Link>
        </div>
      </div>
    );
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
              <span className="text-gray-700">Bienvenido, {user?.name}</span>
              <Link to="/dashboard">
                <Button variant="outline" className="text-gray-700 border-gray-300 hover:bg-gray-50">
                  Volver al Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="px-4 py-6 sm:px-0"
        >
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Mi Perfil</h1>
            <p className="mt-2 text-gray-600">Gestiona tu información personal y profesional</p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6B1E22] mx-auto"></div>
              <p className="text-gray-600 mt-4">Cargando perfil...</p>
            </div>
          ) : profile ? (
            <div className="space-y-6">
              {/* Profile Header Card */}
              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <div className="w-20 h-20 bg-[#6B1E22] rounded-full flex items-center justify-center">
                        <FaUser className="text-white text-2xl" />
                      </div>
                      <button className="absolute bottom-0 right-0 bg-[#6B1E22] text-white p-2 rounded-full hover:bg-[#8a2b30] transition-colors">
                        <FaCamera className="text-sm" />
                      </button>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        {profile.firstName} {profile.lastName}
                      </h2>
                      <p className="text-gray-600">{profile.position} en {profile.company}</p>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                        <span className="flex items-center">
                          <FaEnvelope className="mr-1" />
                          {profile.email}
                        </span>
                        {profile.emailVerified && (
                          <span className="text-green-600">✓ Email verificado</span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {/* Profile Form */}
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold text-gray-900">Información Personal</h3>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre
                      </label>
                      <Input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        placeholder="Tu nombre"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Apellido
                      </label>
                      <Input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        placeholder="Tu apellido"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FaEnvelope className="inline mr-2" />
                      Correo Electrónico
                    </label>
                    <Input
                      type="email"
                      value={profile.email}
                      disabled
                      className="bg-gray-50"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      El email no puede ser modificado. Contacta soporte si necesitas cambiarlo.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FaPhone className="inline mr-2" />
                      Teléfono
                    </label>
                    <Input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="+502 1234-5678"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <FaBuilding className="inline mr-2" />
                        Empresa
                      </label>
                      <Input
                        type="text"
                        value={formData.company}
                        onChange={(e) => handleInputChange('company', e.target.value)}
                        placeholder="Nombre de tu empresa"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <FaBriefcase className="inline mr-2" />
                        Cargo
                      </label>
                      <Input
                        type="text"
                        value={formData.position}
                        onChange={(e) => handleInputChange('position', e.target.value)}
                        placeholder="Tu cargo o posición"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Biografía
                    </label>
                    <Textarea
                      value={formData.bio}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      placeholder="Cuéntanos sobre ti..."
                      rows={4}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Intereses Profesionales
                    </label>
                    <Input
                      type="text"
                      value={formData.interests}
                      onChange={(e) => handleInputChange('interests', e.target.value)}
                      placeholder="Ej: Marketing Digital, Innovación, Liderazgo"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Separe sus intereses con comas
                    </p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="bg-[#6B1E22] hover:bg-[#8a2b30]"
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
                </CardFooter>
              </Card>

              {/* Account Info */}
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold text-gray-900">Información de Cuenta</h3>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Miembro desde:</span>
                      <p className="text-gray-600">
                        {new Date(profile.createdAt).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Última actualización:</span>
                      <p className="text-gray-600">
                        {new Date(profile.updatedAt).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Estado de email:</span>
                      <p className={`font-medium ${profile.emailVerified ? 'text-green-600' : 'text-red-600'}`}>
                        {profile.emailVerified ? '✓ Verificado' : '✗ No verificado'}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Autenticación 2FA:</span>
                      <p className={`font-medium ${profile.is2faEnabled ? 'text-green-600' : 'text-gray-600'}`}>
                        {profile.is2faEnabled ? '✓ Habilitada' : 'Deshabilitada'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">Error al cargar el perfil</p>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default UserProfilePage;