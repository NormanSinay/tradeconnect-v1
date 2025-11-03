import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Star,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Send,
  MessageSquare
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Evaluation {
  id: number;
  eventTitle: string;
  eventDate: string;
  status: 'pending' | 'completed';
  submittedAt?: string;
  rating?: number;
  comments?: string;
}

const PostEventEvaluationTab: React.FC<{ activeTab: string }> = ({ activeTab }) => {
  const [selectedEvaluation, setSelectedEvaluation] = useState<Evaluation | null>(null);
  const [rating, setRating] = useState(0);
  const [comments, setComments] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock data - será reemplazado con datos reales de la API
  const evaluations: Evaluation[] = [
    {
      id: 1,
      eventTitle: 'Taller de Marketing Digital Avanzado',
      eventDate: '2024-09-15',
      status: 'pending'
    },
    {
      id: 2,
      eventTitle: 'Conferencia Innovación Empresarial 2024',
      eventDate: '2024-10-20',
      status: 'completed',
      submittedAt: '2024-10-21',
      rating: 5,
      comments: 'Excelente evento, muy bien organizado y con contenido de calidad.'
    },
    {
      id: 3,
      eventTitle: 'Seminario Gestión del Talento Humano',
      eventDate: '2024-11-10',
      status: 'pending'
    }
  ];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-GT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Completada';
      case 'pending': return 'Pendiente';
      default: return status;
    }
  };

  const handleSubmitEvaluation = async () => {
    if (!selectedEvaluation || rating === 0) {
      toast.error('Por favor selecciona una calificación');
      return;
    }

    setIsSubmitting(true);
    try {
      // Mock API call - será reemplazado con llamada real
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast.success('Evaluación enviada exitosamente');
      setSelectedEvaluation(null);
      setRating(0);
      setComments('');
    } catch (error) {
      toast.error('Error al enviar la evaluación');
    } finally {
      setIsSubmitting(false);
    }
  };

  const pendingEvaluations = evaluations.filter(e => e.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Alertas */}
      {pendingEvaluations > 0 && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>⚠️ Evaluaciones Pendientes:</strong> Tienes {pendingEvaluations} evaluación(es) pendiente(s) de completar.
            Tu feedback es muy importante para mejorar nuestros eventos.
          </AlertDescription>
        </Alert>
      )}

      {/* Lista de evaluaciones */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {evaluations.map((evaluation, index) => (
          <motion.div
            key={evaluation.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className={`h-full ${evaluation.status === 'pending' ? 'border-yellow-200 bg-yellow-50/30' : ''}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg line-clamp-2">{evaluation.eventTitle}</CardTitle>
                  <Badge className={getStatusColor(evaluation.status)}>
                    {getStatusText(evaluation.status)}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  {formatDate(evaluation.eventDate)}
                </div>
              </CardHeader>

              <CardContent>
                {evaluation.status === 'completed' ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Calificación:</span>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${
                              star <= (evaluation.rating || 0)
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">({evaluation.rating}/5)</span>
                    </div>

                    {evaluation.comments && (
                      <div>
                        <span className="text-sm font-medium">Comentarios:</span>
                        <p className="text-sm text-gray-600 mt-1 bg-gray-50 p-3 rounded-md">
                          {evaluation.comments}
                        </p>
                      </div>
                    )}

                    <div className="text-xs text-gray-500">
                      Enviada el {evaluation.submittedAt ? formatDate(evaluation.submittedAt) : 'N/A'}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Alert>
                      <MessageSquare className="h-4 w-4" />
                      <AlertDescription className="text-sm">
                        Tu opinión es muy importante. Ayúdanos a mejorar completando esta evaluación.
                      </AlertDescription>
                    </Alert>

                    <Button
                      className="w-full bg-[#4CAF50] hover:bg-[#45a049]"
                      onClick={() => setSelectedEvaluation(evaluation)}
                    >
                      Completar Evaluación
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Modal de evaluación */}
      {selectedEvaluation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-4">Evaluar Evento</h3>
            <p className="text-gray-600 mb-6">{selectedEvaluation.eventTitle}</p>

            <div className="space-y-6">
              {/* Calificación */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Calificación General *
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          star <= rating
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300 hover:text-yellow-400'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {rating === 0 ? 'Selecciona una calificación' : `${rating} estrella${rating !== 1 ? 's' : ''}`}
                </p>
              </div>

              {/* Comentarios */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Comentarios y Sugerencias
                </label>
                <Textarea
                  placeholder="Comparte tu experiencia, qué te gustó, qué podríamos mejorar..."
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Máximo 500 caracteres (opcional)
                </p>
              </div>

              {/* Vista previa */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Vista Previa</h4>
                <div className="text-sm space-y-2">
                  <p><strong>Evento:</strong> {selectedEvaluation.eventTitle}</p>
                  <p><strong>Calificación:</strong> {rating}/5 estrellas</p>
                  <p><strong>Comentarios:</strong> {comments || 'Sin comentarios'}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setSelectedEvaluation(null);
                  setRating(0);
                  setComments('');
                }}
              >
                Cancelar
              </Button>
              <Button
                className="flex-1 bg-[#4CAF50] hover:bg-[#45a049]"
                onClick={handleSubmitEvaluation}
                disabled={rating === 0 || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Enviar Evaluación
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostEventEvaluationTab;