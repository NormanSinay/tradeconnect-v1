import React, { useState } from 'react';
import { EventMedia } from '@/services/dashboardService';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Image, Video, FileText, Music, File, Trash2, Eye, Download, Star, Calendar, User } from 'lucide-react';

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
  const [selectedMedia, setSelectedMedia] = useState<EventMedia | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const getFileIcon = (type: string, size: 'sm' | 'lg' = 'sm') => {
    const iconSize = size === 'lg' ? 'h-12 w-12' : 'h-8 w-8';
    switch (type) {
      case 'image': return <Image className={`${iconSize} text-blue-500`} />;
      case 'video': return <Video className={`${iconSize} text-red-500`} />;
      case 'document': return <FileText className={`${iconSize} text-green-500`} />;
      case 'audio': return <Music className={`${iconSize} text-purple-500`} />;
      default: return <File className={`${iconSize} text-gray-500`} />;
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

  const handleDownload = (media: EventMedia) => {
    const link = document.createElement('a');
    link.href = media.url;
    link.download = media.originalName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderMediaPreview = (media: EventMedia) => {
    if (media.type === 'image' && media.thumbnails?.small) {
      return (
        <img
          src={media.thumbnails.small}
          alt={media.altText || media.originalName}
          className="w-full h-32 object-cover rounded"
        />
      );
    }

    if (media.type === 'video') {
      return (
        <video
          src={media.url}
          className="w-full h-32 object-cover rounded"
          muted
          preload="metadata"
        />
      );
    }

    return (
      <div className="w-full h-32 bg-gray-100 rounded flex items-center justify-center">
        {getFileIcon(media.type, 'lg')}
      </div>
    );
  };

  const MediaCard: React.FC<{ media: EventMedia }> = ({ media }) => (
    <Card className="group hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Vista previa */}
          <div className="relative">
            {renderMediaPreview(media)}
            {media.isFeatured && (
              <div className="absolute top-2 right-2">
                <Badge variant="default" className="bg-yellow-500 text-white">
                  <Star className="h-3 w-3 mr-1" />
                  Destacado
                </Badge>
              </div>
            )}
          </div>

          {/* Información del archivo */}
          <div className="space-y-2">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm truncate" title={media.originalName}>
                  {media.originalName}
                </h3>
                <p className="text-xs text-gray-600">{formatFileSize(media.size)}</p>
              </div>
              <Badge variant={getTypeBadgeVariant(media.type)} className="ml-2">
                {media.type}
              </Badge>
            </div>

            {media.description && (
              <p className="text-xs text-gray-600 line-clamp-2" title={media.description}>
                {media.description}
              </p>
            )}

            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Calendar className="h-3 w-3" />
              <span>{formatDate(media.uploadedAt)}</span>
            </div>
          </div>

          {/* Acciones */}
          <div className="flex gap-1">
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => setSelectedMedia(media)}
                >
                  <Eye className="h-3 w-3 mr-1" />
                  Ver
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{media.originalName}</DialogTitle>
                  <DialogDescription>
                    Vista previa del archivo multimedia
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  {/* Vista previa grande */}
                  <div className="flex justify-center">
                    {media.type === 'image' ? (
                      <img
                        src={media.url}
                        alt={media.altText || media.originalName}
                        className="max-w-full max-h-96 object-contain rounded"
                      />
                    ) : media.type === 'video' ? (
                      <video
                        src={media.url}
                        controls
                        className="max-w-full max-h-96 rounded"
                      />
                    ) : (
                      <div className="flex flex-col items-center p-8 bg-gray-50 rounded">
                        {getFileIcon(media.type, 'lg')}
                        <p className="mt-4 text-gray-600">Vista previa no disponible</p>
                        <Button
                          variant="outline"
                          onClick={() => handleDownload(media)}
                          className="mt-4"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Descargar
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Metadatos */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h4 className="font-medium">Información del archivo</h4>
                      <div className="space-y-1 text-sm">
                        <div><strong>Nombre:</strong> {media.originalName}</div>
                        <div><strong>Tipo:</strong> {media.type}</div>
                        <div><strong>Tamaño:</strong> {formatFileSize(media.size)}</div>
                        <div><strong>Subido:</strong> {formatDate(media.uploadedAt)}</div>
                        {media.dimensions && (
                          <div><strong>Dimensiones:</strong> {media.dimensions.width} x {media.dimensions.height}</div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium">Metadatos</h4>
                      <div className="space-y-1 text-sm">
                        {media.altText && <div><strong>Texto alternativo:</strong> {media.altText}</div>}
                        {media.description && <div><strong>Descripción:</strong> {media.description}</div>}
                        <div><strong>Destacado:</strong> {media.isFeatured ? 'Sí' : 'No'}</div>
                        <div><strong>Orden:</strong> {media.sortOrder}</div>
                      </div>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex justify-end gap-2 pt-4 border-t">
                    <Button variant="outline" onClick={() => handleDownload(media)}>
                      <Download className="h-4 w-4 mr-2" />
                      Descargar
                    </Button>
                    {canManage && (
                      <Button
                        variant="destructive"
                        onClick={() => {
                          setSelectedMedia(null);
                          onDelete(media);
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Eliminar
                      </Button>
                    )}
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDownload(media)}
              title="Descargar"
            >
              <Download className="h-3 w-3" />
            </Button>

            {canManage && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(media)}
                className="text-red-600 hover:text-red-700"
                title="Eliminar"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const MediaListItem: React.FC<{ media: EventMedia }> = ({ media }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          {/* Icono/Vista previa */}
          <div className="flex-shrink-0">
            {media.type === 'image' && media.thumbnails?.small ? (
              <img
                src={media.thumbnails.small}
                alt={media.altText || media.originalName}
                className="w-16 h-16 object-cover rounded"
              />
            ) : (
              <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center">
                {getFileIcon(media.type)}
              </div>
            )}
          </div>

          {/* Información */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="font-medium truncate" title={media.originalName}>
                  {media.originalName}
                </h3>
                <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                  <span>{formatFileSize(media.size)}</span>
                  <span>{formatDate(media.uploadedAt)}</span>
                  {media.description && (
                    <span className="truncate max-w-xs" title={media.description}>
                      {media.description}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <Badge variant={getTypeBadgeVariant(media.type)}>
                  {media.type}
                </Badge>
                {media.isFeatured && (
                  <Badge variant="default" className="bg-yellow-500 text-white">
                    <Star className="h-3 w-3 mr-1" />
                    Destacado
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Acciones */}
          <div className="flex gap-1">
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedMedia(media)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{media.originalName}</DialogTitle>
                  <DialogDescription>
                    Vista previa del archivo multimedia
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  {/* Vista previa grande */}
                  <div className="flex justify-center">
                    {media.type === 'image' ? (
                      <img
                        src={media.url}
                        alt={media.altText || media.originalName}
                        className="max-w-full max-h-96 object-contain rounded"
                      />
                    ) : media.type === 'video' ? (
                      <video
                        src={media.url}
                        controls
                        className="max-w-full max-h-96 rounded"
                      />
                    ) : (
                      <div className="flex flex-col items-center p-8 bg-gray-50 rounded">
                        {getFileIcon(media.type, 'lg')}
                        <p className="mt-4 text-gray-600">Vista previa no disponible</p>
                        <Button
                          variant="outline"
                          onClick={() => handleDownload(media)}
                          className="mt-4"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Descargar
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Metadatos */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h4 className="font-medium">Información del archivo</h4>
                      <div className="space-y-1 text-sm">
                        <div><strong>Nombre:</strong> {media.originalName}</div>
                        <div><strong>Tipo:</strong> {media.type}</div>
                        <div><strong>Tamaño:</strong> {formatFileSize(media.size)}</div>
                        <div><strong>Subido:</strong> {formatDate(media.uploadedAt)}</div>
                        {media.dimensions && (
                          <div><strong>Dimensiones:</strong> {media.dimensions.width} x {media.dimensions.height}</div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium">Metadatos</h4>
                      <div className="space-y-1 text-sm">
                        {media.altText && <div><strong>Texto alternativo:</strong> {media.altText}</div>}
                        {media.description && <div><strong>Descripción:</strong> {media.description}</div>}
                        <div><strong>Destacado:</strong> {media.isFeatured ? 'Sí' : 'No'}</div>
                        <div><strong>Orden:</strong> {media.sortOrder}</div>
                      </div>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex justify-end gap-2 pt-4 border-t">
                    <Button variant="outline" onClick={() => handleDownload(media)}>
                      <Download className="h-4 w-4 mr-2" />
                      Descargar
                    </Button>
                    {canManage && (
                      <Button
                        variant="destructive"
                        onClick={() => {
                          setSelectedMedia(null);
                          onDelete(media);
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Eliminar
                      </Button>
                    )}
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDownload(media)}
              title="Descargar"
            >
              <Download className="h-4 w-4" />
            </Button>

            {canManage && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(media)}
                className="text-red-600 hover:text-red-700"
                title="Eliminar"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-4">
      {/* Controles de vista */}
      <div className="flex justify-between items-center">
        <h3 className="font-medium">
          {mediaFiles.length} archivo{mediaFiles.length !== 1 ? 's' : ''} multimedia
        </h3>
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Image className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <File className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Galería */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {mediaFiles.map((media) => (
            <MediaCard key={media.id} media={media} />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {mediaFiles.map((media) => (
            <MediaListItem key={media.id} media={media} />
          ))}
        </div>
      )}
    </div>
  );
};

export default EventMediaGallery;