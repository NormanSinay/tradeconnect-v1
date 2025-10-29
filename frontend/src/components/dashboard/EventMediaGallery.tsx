import React, { useState } from 'react';
import { EventMedia } from '@/services/dashboardService';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Image, Video, FileText, Music, File, Trash2, Eye, Download, Grid, List } from 'lucide-react';

interface EventMediaGalleryProps {
  mediaFiles: EventMedia[];
  onDelete: (media: EventMedia) => void;
  canManage: boolean;
}

const EventMediaGallery: React.FC<EventMediaGalleryProps> = ({
  mediaFiles,
  onDelete,
  canManage
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedMedia, setSelectedMedia] = useState<EventMedia | null>(null);

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

  const handleViewMedia = (media: EventMedia) => {
    setSelectedMedia(media);
  };

  const handleDownload = (media: EventMedia) => {
    // Implementar descarga del archivo
    window.open(media.url, '_blank');
  };

  const MediaPreview = ({ media }: { media: EventMedia }) => {
    if (media.type === 'image') {
      return (
        <img
          src={media.url}
          alt={media.altText || media.originalName}
          className="w-full h-32 object-cover rounded-t-lg"
        />
      );
    }

    return (
      <div className="w-full h-32 bg-gray-100 flex items-center justify-center rounded-t-lg">
        {getFileIcon(media.type)}
      </div>
    );
  };

  const GridView = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {mediaFiles.map((media) => (
        <Card key={media.id} className="overflow-hidden hover:shadow-md transition-shadow">
          <MediaPreview media={media} />
          <CardContent className="p-3">
            <div className="space-y-2">
              <h3 className="font-semibold text-sm truncate" title={media.originalName}>
                {media.originalName}
              </h3>
              <div className="flex items-center justify-between">
                <Badge variant={getTypeBadgeVariant(media.type)} className="text-xs">
                  {media.type}
                </Badge>
                <span className="text-xs text-gray-500">
                  {formatFileSize(media.size)}
                </span>
              </div>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleViewMedia(media)}
                  className="flex-1"
                >
                  <Eye className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDownload(media)}
                  className="flex-1"
                >
                  <Download className="h-3 w-3" />
                </Button>
                {canManage && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onDelete(media)}
                    className="flex-1 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const ListView = () => (
    <div className="space-y-2">
      {mediaFiles.map((media) => (
        <Card key={media.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0">
                {getFileIcon(media.type)}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold truncate" title={media.originalName}>
                  {media.originalName}
                </h3>
                <div className="flex items-center gap-4 mt-1">
                  <Badge variant={getTypeBadgeVariant(media.type)} className="text-xs">
                    {media.type}
                  </Badge>
                  <span className="text-sm text-gray-500">
                    {formatFileSize(media.size)}
                  </span>
                  <span className="text-sm text-gray-500">
                    {formatDate(media.uploadedAt)}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleViewMedia(media)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDownload(media)}
                >
                  <Download className="h-4 w-4" />
                </Button>
                {canManage && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onDelete(media)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Controles de vista */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
        <div className="text-sm text-gray-600">
          {mediaFiles.length} archivo{mediaFiles.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Vista de archivos */}
      {viewMode === 'grid' ? <GridView /> : <ListView />}

      {/* Modal de vista previa */}
      <Dialog open={!!selectedMedia} onOpenChange={() => setSelectedMedia(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>{selectedMedia?.originalName}</DialogTitle>
            <DialogDescription>
              {selectedMedia && (
                <div className="flex items-center gap-4 mt-2">
                  <Badge variant={getTypeBadgeVariant(selectedMedia.type)}>
                    {selectedMedia.type}
                  </Badge>
                  <span className="text-sm text-gray-600">
                    {formatFileSize(selectedMedia.size)}
                  </span>
                  <span className="text-sm text-gray-600">
                    Subido: {formatDate(selectedMedia.uploadedAt)}
                  </span>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>

          {selectedMedia && (
            <div className="space-y-4">
              {/* Vista previa del archivo */}
              <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-center min-h-[300px]">
                {selectedMedia.type === 'image' ? (
                  <img
                    src={selectedMedia.url}
                    alt={selectedMedia.altText || selectedMedia.originalName}
                    className="max-w-full max-h-[400px] object-contain"
                  />
                ) : selectedMedia.type === 'video' ? (
                  <video
                    src={selectedMedia.url}
                    controls
                    className="max-w-full max-h-[400px]"
                  >
                    Tu navegador no soporta la reproducción de video.
                  </video>
                ) : selectedMedia.type === 'audio' ? (
                  <audio
                    src={selectedMedia.url}
                    controls
                    className="w-full"
                  >
                    Tu navegador no soporta la reproducción de audio.
                  </audio>
                ) : (
                  <div className="text-center">
                    {getFileIcon(selectedMedia.type)}
                    <p className="mt-2 text-gray-600">
                      Vista previa no disponible para este tipo de archivo
                    </p>
                  </div>
                )}
              </div>

              {/* Información adicional */}
              {selectedMedia.description && (
                <div>
                  <h4 className="font-semibold mb-2">Descripción</h4>
                  <p className="text-gray-700">{selectedMedia.description}</p>
                </div>
              )}

              {/* Acciones */}
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => handleDownload(selectedMedia)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Descargar
                </Button>
                {canManage && (
                  <Button
                    variant="destructive"
                    onClick={() => {
                      onDelete(selectedMedia);
                      setSelectedMedia(null);
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eliminar
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EventMediaGallery;