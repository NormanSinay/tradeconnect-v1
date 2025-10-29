import React, { useState, useCallback } from 'react';
import { DashboardService, EventMedia } from '@/services/dashboardService';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
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

  const [files, setFiles] = useState<FileWithMetadata[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);

  // Validaciones de archivos
  const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
  const ALLOWED_TYPES = {
    image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    video: ['video/mp4', 'video/avi', 'video/mov', 'video/wmv'],
    document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'],
    audio: ['audio/mpeg', 'audio/wav', 'audio/ogg']
  };

  const getFileType = (file: File): 'image' | 'video' | 'document' | 'audio' | 'other' => {
    if (ALLOWED_TYPES.image.includes(file.type)) return 'image';
    if (ALLOWED_TYPES.video.includes(file.type)) return 'video';
    if (ALLOWED_TYPES.document.includes(file.type)) return 'document';
    if (ALLOWED_TYPES.audio.includes(file.type)) return 'audio';
    return 'other';
  };

  const validateFile = (file: File): { isValid: boolean; error?: string } => {
    if (file.size > MAX_FILE_SIZE) {
      return { isValid: false, error: `El archivo es demasiado grande. Máximo ${MAX_FILE_SIZE / (1024 * 1024)}MB` };
    }

    const fileType = getFileType(file);
    if (fileType === 'other') {
      return { isValid: false, error: 'Tipo de archivo no permitido' };
    }

    return { isValid: true };
  };

  const handleFileSelect = useCallback((selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    const newFiles: FileWithMetadata[] = [];
    const errors: string[] = [];

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      const validation = validateFile(file);

      if (validation.isValid) {
        newFiles.push({
          file,
          type: getFileType(file),
          altText: '',
          description: '',
          isFeatured: false
        });
      } else {
        errors.push(`${file.name}: ${validation.error}`);
      }
    }

    if (errors.length > 0) {
      toast.error(`Errores en algunos archivos:\n${errors.join('\n')}`);
    }

    if (newFiles.length > 0) {
      setFiles(prev => [...prev, ...newFiles]);
    }
  }, []);

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
      handleFileSelect(e.dataTransfer.files);
    }
  }, [handleFileSelect]);

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const updateFileMetadata = (index: number, field: keyof FileWithMetadata, value: any) => {
    setFiles(prev => prev.map((file, i) =>
      i === index ? { ...file, [field]: value } : file
    ));
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      toast.error('Selecciona al menos un archivo');
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);

      const uploadData = withErrorHandling(async () => {
        // Preparar archivos y metadatos
        const fileList = files.map(f => f.file);
        const mediaData = files.map(f => ({
          type: f.type,
          altText: f.altText,
          description: f.description,
          isFeatured: f.isFeatured
        }));

        // Simular progreso
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => Math.min(prev + 10, 90));
        }, 200);

        const uploadedMedia = await DashboardService.uploadEventMedia(eventId, fileList, mediaData);

        clearInterval(progressInterval);
        setUploadProgress(100);

        onSuccess(uploadedMedia);
        setFiles([]);
        toast.success('Archivos subidos exitosamente');
      }, 'Error al subir archivos multimedia');

      await uploadData();
    } catch (error) {
      console.error('Error in handleUpload:', error);
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image': return <Image className="h-5 w-5 text-blue-500" />;
      case 'video': return <Video className="h-5 w-5 text-red-500" />;
      case 'document': return <FileText className="h-5 w-5 text-green-500" />;
      case 'audio': return <Music className="h-5 w-5 text-purple-500" />;
      default: return <File className="h-5 w-5 text-gray-500" />;
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

  return (
    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Subir Archivos Multimedia</DialogTitle>
        <DialogDescription>
          Selecciona y configura los archivos que deseas subir al evento.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-6">
        {/* Zona de drop de archivos */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive
              ? 'border-primary bg-primary/5'
              : 'border-gray-300 hover:border-primary/50'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <div className="space-y-2">
            <p className="text-lg font-medium">
              Arrastra y suelta archivos aquí, o{' '}
              <label className="text-primary cursor-pointer hover:underline">
                selecciona archivos
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
                  onChange={(e) => handleFileSelect(e.target.files)}
                  className="hidden"
                />
              </label>
            </p>
            <p className="text-sm text-gray-600">
              Máximo 50MB por archivo. Tipos permitidos: imágenes, videos, documentos, audio.
            </p>
          </div>
        </div>

        {/* Lista de archivos seleccionados */}
        {files.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-medium">Archivos seleccionados ({files.length})</h3>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {files.map((fileData, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3 flex-1">
                      {getFileIcon(fileData.type)}
                      <div className="flex-1">
                        <p className="font-medium text-sm">{fileData.file.name}</p>
                        <p className="text-xs text-gray-600">{formatFileSize(fileData.file.size)}</p>
                        <Badge variant={getTypeBadgeVariant(fileData.type)} className="mt-1">
                          {fileData.type}
                        </Badge>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Metadatos del archivo */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor={`alt-${index}`}>Texto alternativo</Label>
                      <Input
                        id={`alt-${index}`}
                        value={fileData.altText}
                        onChange={(e) => updateFileMetadata(index, 'altText', e.target.value)}
                        placeholder="Descripción accesible"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`desc-${index}`}>Descripción</Label>
                      <Textarea
                        id={`desc-${index}`}
                        value={fileData.description}
                        onChange={(e) => updateFileMetadata(index, 'description', e.target.value)}
                        placeholder="Descripción del archivo"
                        rows={2}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-3">
                    <input
                      type="checkbox"
                      id={`featured-${index}`}
                      checked={fileData.isFeatured}
                      onChange={(e) => updateFileMetadata(index, 'isFeatured', e.target.checked)}
                    />
                    <Label htmlFor={`featured-${index}`} className="text-sm">
                      Archivo destacado
                    </Label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Barra de progreso durante subida */}
        {uploading && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subiendo archivos...</span>
              <span>{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="w-full" />
          </div>
        )}

        {/* Alertas de validación */}
        {files.some(f => f.type === 'other') && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Algunos archivos tienen tipos no permitidos y serán ignorados.
            </AlertDescription>
          </Alert>
        )}

        {/* Acciones */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose} disabled={uploading}>
            Cancelar
          </Button>
          <Button
            onClick={handleUpload}
            disabled={files.length === 0 || uploading}
          >
            {uploading ? 'Subiendo...' : `Subir ${files.length} archivo(s)`}
          </Button>
        </div>
      </div>
    </DialogContent>
  );
};

export default EventMediaUploadModal;