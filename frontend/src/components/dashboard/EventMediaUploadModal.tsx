import React, { useState, useCallback, useRef } from 'react';
import { DashboardService, EventMedia } from '@/services/dashboardService';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, X, File, Image, Video, FileText, Music, AlertTriangle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface EventMediaUploadModalProps {
  eventId: number;
  onSuccess: (media: EventMedia[]) => void;
  onClose: () => void;
}

interface FileWithMetadata {
  file: File;
  type: 'image' | 'video' | 'document' | 'audio' | 'other';
  altText?: string;
  description?: string;
  isFeatured?: boolean;
}

const EventMediaUploadModal: React.FC<EventMediaUploadModalProps> = ({
  eventId,
  onSuccess,
  onClose
}) => {
  const { withErrorHandling } = useErrorHandler();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [files, setFiles] = useState<FileWithMetadata[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);

  // Validaciones de archivos
  const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
  const ALLOWED_TYPES = {
    image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    video: ['video/mp4', 'video/avi', 'video/mov', 'video/wmv'],
    audio: ['audio/mp3', 'audio/wav', 'audio/m4a', 'audio/flac'],
    document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
  };

  const getFileType = (file: File): 'image' | 'video' | 'document' | 'audio' | 'other' => {
    if (ALLOWED_TYPES.image.includes(file.type)) return 'image';
    if (ALLOWED_TYPES.video.includes(file.type)) return 'video';
    if (ALLOWED_TYPES.audio.includes(file.type)) return 'audio';
    if (ALLOWED_TYPES.document.includes(file.type)) return 'document';
    return 'other';
  };

  const validateFile = (file: File): string | null => {
    if (file.size > MAX_FILE_SIZE) {
      return `El archivo ${file.name} excede el límite de 50MB`;
    }

    const fileType = getFileType(file);
    if (fileType === 'other') {
      return `Tipo de archivo no soportado: ${file.name}`;
    }

    return null;
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  }, []);

  const handleFiles = (selectedFiles: File[]) => {
    const validFiles: FileWithMetadata[] = [];
    const errors: string[] = [];

    selectedFiles.forEach(file => {
      const validationError = validateFile(file);
      if (validationError) {
        errors.push(validationError);
      } else {
        validFiles.push({
          file,
          type: getFileType(file),
          altText: '',
          description: '',
          isFeatured: false
        });
      }
    });

    if (errors.length > 0) {
      toast.error(`Errores de validación: ${errors.join(', ')}`);
    }

    if (validFiles.length > 0) {
      setFiles(prev => [...prev, ...validFiles]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const updateFileMetadata = (index: number, field: keyof FileWithMetadata, value: any) => {
    setFiles(prev => prev.map((file, i) =>
      i === index ? { ...file, [field]: value } : file
    ));
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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      toast.error('Selecciona al menos un archivo para subir');
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);

      const uploadData = withErrorHandling(async () => {
        // Simular progreso
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => Math.min(prev + 10, 90));
        }, 200);

        try {
          const fileList = files.map(f => f.file);
          const mediaData = files.map(f => ({
            type: f.type,
            altText: f.altText,
            description: f.description,
            isFeatured: f.isFeatured
          }));

          const uploadedMedia = await DashboardService.uploadEventMedia(eventId, fileList, mediaData);

          setUploadProgress(100);
          clearInterval(progressInterval);

          onSuccess(uploadedMedia);
          toast.success(`${uploadedMedia.length} archivo(s) subido(s) exitosamente`);
          onClose();
        } catch (error) {
          clearInterval(progressInterval);
          throw error;
        }
      }, 'Error subiendo archivos multimedia');

      await uploadData();
    } catch (error) {
      console.error('Error in handleUpload:', error);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Subir Archivos Multimedia
          </DialogTitle>
          <DialogDescription>
            Sube imágenes, videos, documentos y archivos de audio para enriquecer tu evento.
            Máximo 50MB por archivo.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Área de drop */}
          <Card>
            <CardContent className="p-6">
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-300 hover:border-primary'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Arrastra y suelta archivos aquí
                </h3>
                <p className="text-gray-600 mb-4">
                  o <button
                    type="button"
                    className="text-primary hover:underline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    selecciona archivos
                  </button>
                </p>
                <p className="text-sm text-gray-500">
                  Tipos soportados: Imágenes, Videos, Documentos, Audio (máx. 50MB)
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
                  onChange={handleFileInput}
                  className="hidden"
                />
              </div>
            </CardContent>
          </Card>

          {/* Lista de archivos seleccionados */}
          {files.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Archivos Seleccionados ({files.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {files.map((fileData, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        {getFileIcon(fileData.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium truncate" title={fileData.file.name}>
                            {fileData.file.name}
                          </h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">
                          {formatFileSize(fileData.file.size)} • {fileData.type}
                        </p>

                        {/* Metadatos */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor={`alt-text-${index}`} className="text-sm">
                              Texto alternativo (opcional)
                            </Label>
                            <Input
                              id={`alt-text-${index}`}
                              value={fileData.altText}
                              onChange={(e) => updateFileMetadata(index, 'altText', e.target.value)}
                              placeholder="Descripción para accesibilidad"
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`description-${index}`} className="text-sm">
                              Descripción (opcional)
                            </Label>
                            <Textarea
                              id={`description-${index}`}
                              value={fileData.description}
                              onChange={(e) => updateFileMetadata(index, 'description', e.target.value)}
                              placeholder="Descripción del archivo"
                              className="mt-1"
                              rows={2}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Barra de progreso durante subida */}
          {uploading && (
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    <span className="font-medium">Subiendo archivos...</span>
                  </div>
                  <Progress value={uploadProgress} className="w-full" />
                  <p className="text-sm text-gray-600 text-center">
                    {uploadProgress}% completado
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Acciones */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose} disabled={uploading}>
              Cancelar
            </Button>
            <Button
              onClick={handleUpload}
              disabled={files.length === 0 || uploading}
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Subiendo...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Subir {files.length} archivo{files.length !== 1 ? 's' : ''}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EventMediaUploadModal;