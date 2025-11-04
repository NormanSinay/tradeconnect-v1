import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { FileText, Upload, Download, Eye, Trash2, Plus, File, Image, Video, Music, Archive, X, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { SpeakerDashboardService, SpeakerMaterial } from '@/services/speakerDashboardService';
import { useSpeakerDashboardState } from '@/hooks/useSpeakerDashboardState';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const SpeakerMaterialsTab: React.FC<{ activeTab: string }> = () => {
  const [materials, setMaterials] = useState<SpeakerMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [eventFilter, setEventFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { formatDate } = useSpeakerDashboardState();

  // Upload form state
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    eventId: '',
    file: null as File | null
  });

  useEffect(() => {
    loadMaterials();
  }, []);

  const loadMaterials = async () => {
    try {
      setLoading(true);
      const speakerMaterials = await SpeakerDashboardService.getSpeakerMaterials();
      setMaterials(speakerMaterials);
    } catch (error) {
      console.error('Error loading materials:', error);
      toast.error('Error al cargar materiales');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadForm(prev => ({ ...prev, file }));
    }
  };

  const handleUpload = async () => {
    if (!uploadForm.file || !uploadForm.title.trim()) {
      toast.error('Por favor completa todos los campos requeridos');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', uploadForm.file);
      formData.append('title', uploadForm.title);
      formData.append('description', uploadForm.description);
      if (uploadForm.eventId) {
        formData.append('eventId', uploadForm.eventId);
      }

      await SpeakerDashboardService.uploadMaterial(0, formData); // eventId será manejado en el backend

      toast.success('Material subido exitosamente');
      setUploadDialogOpen(false);
      setUploadForm({ title: '', description: '', eventId: '', file: null });
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      loadMaterials();
    } catch (error) {
      console.error('Error uploading material:', error);
      toast.error('Error al subir el material');
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateMaterialStatus = async (materialId: number, status: 'draft' | 'published' | 'archived') => {
    try {
      await SpeakerDashboardService.updateMaterialStatus(materialId, status);
      toast.success(`Material ${status === 'published' ? 'publicado' : status === 'archived' ? 'archivado' : 'guardado como borrador'}`);
      loadMaterials();
    } catch (error) {
      console.error('Error updating material status:', error);
      toast.error('Error al actualizar estado del material');
    }
  };

  const handleDeleteMaterial = async (materialId: number) => {
    if (confirm('¿Estás seguro de que quieres eliminar este material?')) {
      try {
        await SpeakerDashboardService.deleteMaterial(materialId);
        toast.success('Material eliminado exitosamente');
        loadMaterials();
      } catch (error) {
        console.error('Error deleting material:', error);
        toast.error('Error al eliminar el material');
      }
    }
  };

  const getFileTypeIcon = (fileType: string) => {
    switch (fileType) {
      case 'presentation':
        return <File className="w-8 h-8 text-blue-600" />;
      case 'document':
        return <FileText className="w-8 h-8 text-red-600" />;
      case 'video':
        return <Video className="w-8 h-8 text-purple-600" />;
      case 'audio':
        return <Music className="w-8 h-8 text-green-600" />;
      default:
        return <Archive className="w-8 h-8 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Publicado</Badge>;
      case 'draft':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Borrador</Badge>;
      case 'archived':
        return <Badge className="bg-gray-100 text-gray-800"><Archive className="w-3 h-3 mr-1" />Archivado</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'border-green-200 bg-green-50';
      case 'draft':
        return 'border-yellow-200 bg-yellow-50';
      case 'archived':
        return 'border-gray-200 bg-gray-50';
      default:
        return 'border-gray-200';
    }
  };

  const filteredMaterials = materials.filter(material => {
    const matchesEvent = eventFilter === 'all' || material.eventId?.toString() === eventFilter;
    const matchesStatus = statusFilter === 'all' || material.status === statusFilter;
    const matchesSearch = material.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         material.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesEvent && matchesStatus && matchesSearch;
  });

  const uniqueEvents = [...new Set(materials.map(m => m.eventId).filter(Boolean))];

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center py-12"
      >
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        <span className="ml-3 text-gray-600">Cargando materiales...</span>
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
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-purple-600">Mis Materiales</h2>
          <p className="text-gray-600">Gestiona tus presentaciones y documentos</p>
        </div>
        <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Plus className="w-4 h-4 mr-2" />
              Subir Material
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Subir Nuevo Material</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Título del material"
                />
              </div>
              <div>
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descripción del material"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="event">Evento (opcional)</Label>
                <Select value={uploadForm.eventId} onValueChange={(value) => setUploadForm(prev => ({ ...prev, eventId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar evento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Sin evento específico</SelectItem>
                    {uniqueEvents.map(eventId => {
                      const event = materials.find(m => m.eventId === eventId);
                      return (
                        <SelectItem key={eventId} value={eventId!.toString()}>
                          {event?.eventTitle || `Evento ${eventId}`}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="file">Archivo *</Label>
                <Input
                  id="file"
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept=".pdf,.ppt,.pptx,.doc,.docx,.xls,.xlsx,.mp4,.avi,.mov,.mp3,.wav"
                />
                {uploadForm.file && (
                  <p className="text-sm text-gray-600 mt-1">
                    Archivo seleccionado: {uploadForm.file.name}
                  </p>
                )}
              </div>
              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setUploadDialogOpen(false);
                    setUploadForm({ title: '', description: '', eventId: '', file: null });
                  }}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleUpload}
                  disabled={uploading || !uploadForm.file || !uploadForm.title.trim()}
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                >
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Subiendo...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Subir
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder="Buscar materiales..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Select value={eventFilter} onValueChange={setEventFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Todos los eventos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los eventos</SelectItem>
                {uniqueEvents.map(eventId => {
                  const event = materials.find(m => m.eventId === eventId);
                  return (
                    <SelectItem key={eventId} value={eventId!.toString()}>
                      {event?.eventTitle || `Evento ${eventId}`}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Todos los estados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="draft">Borrador</SelectItem>
                <SelectItem value="published">Publicado</SelectItem>
                <SelectItem value="archived">Archivado</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => {
                setEventFilter('all');
                setStatusFilter('all');
                setSearchTerm('');
              }}
            >
              Limpiar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Materials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMaterials.map((material, index) => (
          <motion.div
            key={material.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card className={`hover:shadow-lg transition-shadow ${getStatusColor(material.status)}`}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-3">
                    {getFileTypeIcon(material.fileType)}
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg font-semibold text-purple-600 truncate">
                        {material.title}
                      </CardTitle>
                      {material.eventTitle && (
                        <p className="text-sm text-gray-600 truncate">Evento: {material.eventTitle}</p>
                      )}
                    </div>
                  </div>
                  {getStatusBadge(material.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-700 line-clamp-3">
                  {material.description}
                </p>

                <div className="text-xs text-gray-500">
                  Subido: {formatDate(material.uploadedAt)}
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => window.open(material.fileUrl, '_blank')}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Ver
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = material.fileUrl;
                      link.download = material.title;
                      link.click();
                    }}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Descargar
                  </Button>
                </div>

                {/* Acciones de estado */}
                <div className="flex gap-2 pt-2 border-t">
                  {material.status === 'draft' && (
                    <Button
                      size="sm"
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      onClick={() => handleUpdateMaterialStatus(material.id, 'published')}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Publicar
                    </Button>
                  )}
                  {material.status === 'published' && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleUpdateMaterialStatus(material.id, 'archived')}
                    >
                      <Archive className="w-4 h-4 mr-2" />
                      Archivar
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDeleteMaterial(material.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredMaterials.length === 0 && materials.length > 0 && (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No se encontraron materiales con los filtros aplicados
          </h3>
          <p className="text-gray-600">
            Intenta ajustar los filtros para ver más materiales.
          </p>
        </div>
      )}

      {materials.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No tienes materiales subidos
          </h3>
          <p className="text-gray-600 mb-4">
            Sube tus presentaciones, documentos y otros materiales para tus eventos.
          </p>
          <Button
            className="bg-purple-600 hover:bg-purple-700"
            onClick={() => setUploadDialogOpen(true)}
          >
            <Upload className="w-4 h-4 mr-2" />
            Subir Primer Material
          </Button>
        </div>
      )}
    </motion.div>
  );
};

export default SpeakerMaterialsTab;