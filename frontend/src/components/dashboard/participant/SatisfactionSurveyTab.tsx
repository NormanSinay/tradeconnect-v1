import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import {
  Star,
  MessageSquare,
  CheckCircle,
  Clock,
  ThumbsUp,
  AlertTriangle,
  Calendar,
  Users
} from 'lucide-react';

interface Survey {
  id: number;
  eventTitle: string;
  eventDate: string;
  status: 'pending' | 'completed';
  dueDate: string;
  questions: SurveyQuestion[];
  submittedDate?: string;
}

interface SurveyQuestion {
  id: number;
  question: string;
  type: 'rating' | 'text' | 'multiple_choice';
  required: boolean;
  options?: string[];
  answer?: any;
}

const SatisfactionSurveyTab: React.FC<{ activeTab: string }> = ({ activeTab }) => {
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null);
  const [answers, setAnswers] = useState<{ [key: number]: any }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock data - será reemplazado con datos reales de la API
  const surveys: Survey[] = [
    {
      id: 1,
      eventTitle: 'Taller de Marketing Digital Avanzado',
      eventDate: '2024-11-15',
      status: 'completed',
      dueDate: '2024-11-22',
      submittedDate: '2024-11-18',
      questions: []
    },
    {
      id: 2,
      eventTitle: 'Conferencia Innovación Empresarial 2024',
      eventDate: '2024-10-20',
      status: 'pending',
      dueDate: '2024-10-27',
      questions: [
        {
          id: 1,
          question: '¿Cómo calificarías la calidad del contenido del evento?',
          type: 'rating',
          required: true
        },
        {
          id: 2,
          question: '¿El horario del evento fue conveniente para ti?',
          type: 'multiple_choice',
          required: true,
          options: ['Muy conveniente', 'Conveniente', 'Poco conveniente', 'Nada conveniente']
        },
        {
          id: 3,
          question: '¿Recomendarías este evento a otros profesionales?',
          type: 'multiple_choice',
          required: true,
          options: ['Definitivamente sí', 'Probablemente sí', 'Tal vez', 'No']
        },
        {
          id: 4,
          question: 'Comentarios adicionales o sugerencias para mejorar',
          type: 'text',
          required: false
        }
      ]
    },
    {
      id: 3,
      eventTitle: 'Seminario Gestión del Talento Humano',
      eventDate: '2024-11-25',
      status: 'pending',
      dueDate: '2024-12-02',
      questions: [
        {
          id: 5,
          question: '¿Cómo calificarías la organización general del evento?',
          type: 'rating',
          required: true
        },
        {
          id: 6,
          question: '¿Los ponentes cumplieron con tus expectativas?',
          type: 'multiple_choice',
          required: true,
          options: ['Superaron expectativas', 'Cumplieron expectativas', 'Por debajo de expectativas', 'Muy por debajo']
        }
      ]
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

  const renderStars = (questionId: number, currentRating: number = 0) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className="text-2xl hover:scale-110 transition-transform"
            onClick={() => setAnswers({ ...answers, [questionId]: star })}
          >
            <Star
              className={`w-6 h-6 ${
                star <= (answers[questionId] || currentRating)
                  ? 'text-yellow-400 fill-current'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  const handleSubmitSurvey = async () => {
    if (!selectedSurvey) return;

    // Check required questions
    const unansweredRequired = selectedSurvey.questions.filter(q =>
      q.required && !answers[q.id]
    );

    if (unansweredRequired.length > 0) {
      alert('Por favor responde todas las preguntas obligatorias.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Update survey status
      const updatedSurveys = surveys.map(survey =>
        survey.id === selectedSurvey.id
          ? { ...survey, status: 'completed' as const, submittedDate: new Date().toISOString().split('T')[0] }
          : survey
      );

      setSelectedSurvey(null);
      setAnswers({});

      alert('¡Encuesta enviada exitosamente! Gracias por tu feedback.');
    } catch (error) {
      alert('Error al enviar la encuesta. Por favor intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const pendingSurveys = surveys.filter(s => s.status === 'pending').length;
  const completedSurveys = surveys.filter(s => s.status === 'completed').length;
  const completionRate = surveys.length > 0 ? (completedSurveys / surveys.length) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Información importante */}
      <Alert className="border-blue-200 bg-blue-50">
        <MessageSquare className="h-4 w-4" />
        <AlertDescription>
          <strong>Encuestas de Satisfacción:</strong> Tu opinión es muy valiosa para nosotros.
          Las encuestas deben completarse dentro de los 7 días posteriores al evento.
        </AlertDescription>
      </Alert>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-8 h-8 text-[#607D8B]" />
              <div>
                <p className="text-sm text-gray-600">Total Encuestas</p>
                <p className="text-2xl font-bold">{surveys.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-600">Pendientes</p>
                <p className="text-2xl font-bold">{pendingSurveys}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Tasa de Respuesta</p>
                <p className="text-2xl font-bold">{Math.round(completionRate)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Barra de progreso general */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Progreso general de encuestas</span>
              <span className="text-sm text-gray-600">{completedSurveys}/{surveys.length} completadas</span>
            </div>
            <Progress value={completionRate} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Lista de encuestas */}
      <div className="space-y-4">
        {surveys.map((survey, index) => (
          <motion.div
            key={survey.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{survey.eventTitle}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      Evento realizado el {formatDate(survey.eventDate)}
                    </p>
                  </div>
                  <Badge className={getStatusColor(survey.status)}>
                    {getStatusText(survey.status)}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent>
                {survey.status === 'completed' ? (
                  <div className="space-y-4">
                    <Alert className="border-green-200 bg-green-50">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-800">
                        Encuesta completada el {formatDate(survey.submittedDate || '')}.
                        ¡Gracias por tu participación!
                      </AlertDescription>
                    </Alert>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Alert className="border-yellow-200 bg-yellow-50">
                      <Clock className="h-4 w-4" />
                      <AlertDescription className="text-yellow-800">
                        <strong>Encuesta pendiente:</strong> Disponible hasta el {formatDate(survey.dueDate)}.
                        Tu feedback es importante para mejorar nuestros eventos.
                      </AlertDescription>
                    </Alert>

                    <div className="text-sm text-gray-600">
                      <strong>{survey.questions.length} preguntas</strong> •
                      Tiempo estimado: {Math.ceil(survey.questions.length * 0.5)} minutos
                    </div>

                    <Button
                      onClick={() => setSelectedSurvey(survey)}
                      className="bg-[#607D8B] hover:bg-[#546E7A]"
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Completar Encuesta
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Modal de encuesta */}
      {selectedSurvey && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
          >
            <h3 className="text-xl font-semibold mb-4">
              Encuesta: {selectedSurvey.eventTitle}
            </h3>

            <div className="space-y-6">
              {selectedSurvey.questions.map((question, index) => (
                <div key={question.id} className="space-y-3">
                  <div className="flex items-start gap-2">
                    <span className="text-sm font-medium text-gray-700 min-w-0 flex-1">
                      {index + 1}. {question.question}
                      {question.required && <span className="text-red-500 ml-1">*</span>}
                    </span>
                  </div>

                  {question.type === 'rating' && (
                    <div className="ml-6">
                      {renderStars(question.id)}
                    </div>
                  )}

                  {question.type === 'multiple_choice' && question.options && (
                    <div className="ml-6 space-y-2">
                      {question.options.map((option, optionIndex) => (
                        <label key={optionIndex} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name={`question-${question.id}`}
                            value={option}
                            checked={answers[question.id] === option}
                            onChange={() => setAnswers({ ...answers, [question.id]: option })}
                            className="text-[#607D8B] focus:ring-[#607D8B]"
                          />
                          <span className="text-sm">{option}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {question.type === 'text' && (
                    <div className="ml-6">
                      <Textarea
                        placeholder="Escribe tu respuesta aquí..."
                        value={answers[question.id] || ''}
                        onChange={(e) => setAnswers({ ...answers, [question.id]: e.target.value })}
                        rows={3}
                        className="resize-none"
                      />
                    </div>
                  )}
                </div>
              ))}

              <div className="flex gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedSurvey(null);
                    setAnswers({});
                  }}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSubmitSurvey}
                  disabled={isSubmitting}
                  className="flex-1 bg-[#607D8B] hover:bg-[#546E7A]"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Enviando...
                    </>
                  ) : (
                    <>
                      <ThumbsUp className="w-4 h-4 mr-2" />
                      Enviar Encuesta
                    </>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default SatisfactionSurveyTab;