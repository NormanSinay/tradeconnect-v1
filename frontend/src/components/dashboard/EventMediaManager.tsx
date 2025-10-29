import React, { useState, useEffect, useCallback } from 'react';
import { DashboardService, EventMedia } from '@/services/dashboardService';
import { usePermissions } from '@/hooks/usePermissions';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Upload, File, Image, Video, FileText, Music, Trash2, Eye, AlertTriangle, Plus, Download } from 'lucide-react';
import EventMediaUploadModal from './EventMediaUploadModal';
import EventMediaGallery from './EventMediaGallery';
import toast from 'react-hot-toast';

interface EventMediaManagerProps {
  eventId: number;
  eventTitle: string;
}

const EventMediaManager: React.FC<EventMediaManagerProps> = ({ eventId, eventTitle }) => {
  const permissions = usePermissions();
  const { withErrorHandling } = useErrorHandler();

  const [mediaFiles, setMediaFiles] = useState<EventMedia[]>([]);
  const [loading, setLoading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<EventMedia | null>(null);

  useEffect(() => {
    loadEventMedia();
  }, [eventId]);

  const loadEventMedia = useCallback(async () => {
    try {
      setLoading(true);
      const loadData = withErrorHandling(async () => {
        const media = await DashboardService.getEventMedia(eventId);
        setMediaFiles(media);
      }, 'Error al cargar archivos multimedia');

      await loadData();
    } catch (error) {
      console.error('Error in loadEventMedia:', error);
    } finally {
      setLoading(false);
    }
  }, [eventId, withErrorHandling]);

  const handleUploadSuccess = useCallback(async (newMedia: EventMedia[]) => {
    setMediaFiles(prev => [...prev, ...newMedia]);
    setShowUploadModal(false);
    toast.success(`${newMedia.length} archivo(s) subido(s) exitosamente`);
  }, []);

  const handleDeleteMediaClick = (media: EventMedia) => {
    setSelectedMedia(media);
    setShowDeleteModal(true);
  };

  const handleDeleteMediaConfirm = async () => {
    if (!selectedMedia) return;

    try {
      const deleteData = withErrorHandling(async () => {
        await DashboardService.deleteEventMedia(eventId, selectedMedia.id);
        setMediaFiles(prev => prev.filter(m => m.id !== selectedMedia.id));
        toast.success('Archivo eliminado exitosamente');
        setShowDeleteModal(false);
        setSelectedMedia(null);
      }, 'Error al eliminar archivo multimedia');

      await deleteData();
    } catch (error) {
      console.error('Error in handleDeleteMediaConfirm:', error);
    }
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image': return <Image className="h-8 w-8 text-blue-500" />;
      case 'video': return <Video className="h-8 w-8 text-red-500" />;
      case 'document': return <FileText className="h-8 w-8 text-green-500" />;
      case 'audio': return <Music className="h-8 w-8 text-purple-500" />;
      default: return <File className="h-8 w-8 text-gray-500" />;
    }
  };

  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      case 'image': return 'default';
      case 'video': return 'secondary';
      case 'document': return 'outline';
      case 'audio': return 'secondary';
      default: return 'outline';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-GT', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getMediaStats = () => {
    const stats = {
      total: mediaFiles.length,
      images: mediaFiles.filter(m => m.type === 'image').length,
      videos: mediaFiles.filter(m => m.type === 'video').length,
      documents: mediaFiles.filter(m => m.type === 'document').length,
      audio: mediaFiles.filter(m => m.type === 'audio').length,
      totalSize: mediaFiles.reduce((sum, m) => sum + m.size, 0)
    };
    return stats;
  };

  const stats = getMediaStats();

  return (
    <div className="space-y-6">
      {/* Verificación de permisos */}
      {!permissions.canManageEvents && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            No tienes permisos para gestionar archivos multimedia de eventos.
          </AlertDescription>
        </Alert>
      )}

      {/* Header con estadísticas y acciones */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h3 className="text-lg font-semibold">Archivos Multimedia</h3>
          <p className="text-sm text-gray-600">{eventTitle}</p>
        </div>

        <div className="flex flex-wrap gap-4">
          {/* Estadísticas rápidas */}
          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-1">
              <File className="h-4 w-4 text-gray-500" />
              <span>{stats.total} archivos</span>
            </div>
            <div className="flex items-center gap-1">
              <Image className="h-4 w-4 text-blue-500" />
              <span>{stats.images} imágenes</span>
            </div>
            <div className="flex items-center gap-1">
              <Video className="h-4 w-4 text-red-500" />
              <span>{stats.videos} videos</span>
            </div>
            <div className="text-gray-500">
              {formatFileSize(stats.totalSize)} total
            </div>
          </div>

          {permissions.canManageEvents && (
            <Dialog open={showUploadModal} onOpenChange={setShowUploadModal}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Subir Archivos
                </Button>
              </DialogTrigger>
              <EventMediaUploadModal
                eventId={eventId}
                onSuccess={handleUploadSuccess}
                onClose={() => setShowUploadModal(false)}
              />
            </Dialog>
          )}
        </div>
      </div>

      {/* Contenido principal */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando archivos multimedia...</p>
          </div>
        </div>
      ) : mediaFiles.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Upload className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay archivos multimedia</h3>
            <p className="text-gray-600 text-center mb-6">
              Sube imágenes, videos, documentos y otros archivos para enriquecer tu evento.
            </p>
            {permissions.canManageEvents && (
              <Button onClick={() => setShowUploadModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Subir Primer Archivo
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <EventMediaGallery
          mediaFiles={mediaFiles}
          onDelete={handleDeleteMediaClick}
          canManage={permissions.canManageEvents}
        />
      )}

      {/* Modal de confirmación de eliminación */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Confirmar Eliminación
            </DialogTitle>
            <DialogDescription>
              ¿Está seguro de que desea eliminar este archivo? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>

          {selectedMedia && (
            <div className="py-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  {getFileIcon(selectedMedia.type)}
                  <div className="flex-1">
                    <h3 className="font-semibold">{selectedMedia.originalName}</h3>
                    <p className="text-sm text-gray-600">{formatFileSize(selectedMedia.size)}</p>
                    <Badge variant={getTypeBadgeVariant(selectedMedia.type)} className="mt-1">
                      {selectedMedia.type}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">
                  <strong>Advertencia:</strong> Al eliminar este archivo, se perderá permanentemente
                  y no podrá ser recuperado.
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteMediaConfirm}
            >
              Eliminar Archivo
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EventMediaManager;