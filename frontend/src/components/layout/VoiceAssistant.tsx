import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Mic,
  MicOff,
  X,
  Volume2,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Animations
const pulse = keyframes`
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
`;

const voiceActive = keyframes`
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(107, 30, 34, 0.7);
  }
  50% {
    transform: scale(1.15);
    box-shadow: 0 0 0 10px rgba(107, 30, 34, 0);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(107, 30, 34, 0);
  }
`;

// Styled Components
const VoiceButton = styled(Fab)(({ theme }) => ({
  position: 'fixed',
  bottom: 24,
  right: 24,
  width: 70,
  height: 70,
  background: `linear-gradient(135deg, ${theme.palette.primary.main}, #D4AF37)`,
  color: 'white',
  boxShadow: '0 4px 20px rgba(107, 30, 34, 0.3)',
  zIndex: 1000,
  transition: 'all 0.3s ease-in-out',
  animation: `${pulse} 2s infinite`,

  '&:hover': {
    background: `linear-gradient(135deg, ${theme.palette.primary.dark}, #D4AF37)`,
    transform: 'scale(1.05)',
  },

  '&.voice-active': {
    animation: `${voiceActive} 1.5s infinite`,
  },
}));

const ChatBubble = styled(Paper)(({ theme }) => ({
  position: 'fixed',
  bottom: 110,
  right: 24,
  maxWidth: 300,
  minWidth: 250,
  padding: theme.spacing(2),
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(10px)',
  borderRadius: theme.spacing(2),
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  zIndex: 999,
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
}));

const VoiceAssistant: React.FC = () => {
  const theme = useTheme();
  const [isListening, setIsListening] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();

      const recognition = recognitionRef.current;
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'es-GT'; // Spanish (Guatemala)

      recognition.onstart = () => {
        setIsListening(true);
        setTranscript('');
        setResponse('');
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setTranscript(transcript);
        handleVoiceQuery(transcript);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        setResponse('Lo siento, no pude entenderte. ¿Puedes intentarlo de nuevo?');
        speak('Lo siento, no pude entenderte. ¿Puedes intentarlo de nuevo?');
      };

      recognition.onend = () => {
        setIsListening(false);
      };
    }

    // Initialize speech synthesis
    if ('speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  const speak = (text: string) => {
    if (synthRef.current) {
      // Cancel any ongoing speech
      synthRef.current.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'es-GT'; // Spanish (Guatemala)
      utterance.rate = 0.9;
      utterance.pitch = 1;

      synthRef.current.speak(utterance);
    }
  };

  const handleVoiceQuery = async (query: string) => {
    setIsProcessing(true);
    setIsOpen(true);

    try {
      // TODO: Integrate with backend assistant API
      // For now, simulate responses based on keywords
      const lowerQuery = query.toLowerCase();

      let response = '';
      if (lowerQuery.includes('evento') || lowerQuery.includes('eventos')) {
        response = 'Te ayudo a encontrar eventos. ¿Qué tipo de evento buscas? Puedo mostrarte eventos destacados, próximos o por categoría.';
      } else if (lowerQuery.includes('carrito') || lowerQuery.includes('comprar')) {
        response = 'Veo que quieres gestionar tu carrito. ¿Quieres agregar un evento, ver tu carrito actual o proceder al pago?';
      } else if (lowerQuery.includes('certificado') || lowerQuery.includes('certificados')) {
        response = 'Sobre certificados, puedo ayudarte a ver tus certificados emitidos o verificar la autenticidad de uno.';
      } else if (lowerQuery.includes('ayuda') || lowerQuery.includes('help')) {
        response = 'Estoy aquí para ayudarte. Puedo buscar eventos, gestionar tu carrito, mostrar certificados o responder preguntas sobre TradeConnect.';
      } else {
        response = 'Hola, soy el asistente de TradeConnect. ¿En qué puedo ayudarte hoy? Puedo buscar eventos, gestionar compras o mostrar información sobre certificados.';
      }

      setResponse(response);
      speak(response);

    } catch (error) {
      console.error('Error processing voice query:', error);
      const errorMessage = 'Lo siento, hubo un error al procesar tu consulta. ¿Puedes intentarlo de nuevo?';
      setResponse(errorMessage);
      speak(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      setResponse('Lo siento, el reconocimiento de voz no está disponible en tu navegador.');
      setIsOpen(true);
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  const closeChat = () => {
    setIsOpen(false);
    setTranscript('');
    setResponse('');
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  return (
    <>
      {/* Voice Assistant Button */}
      <VoiceButton
        onClick={toggleListening}
        className={isListening ? 'voice-active' : ''}
        aria-label={isListening ? 'Detener escucha' : 'Iniciar asistente de voz'}
      >
        {isListening ? (
          <MicOffIcon sx={{ fontSize: 28 }} />
        ) : (
          <MicIcon sx={{ fontSize: 28 }} />
        )}
      </VoiceButton>

      {/* Chat Bubble */}
      {isOpen && (
        <ChatBubble elevation={0}>
          <Box component={"div" as any} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
              Asistente TradeConnect
            </Typography>
            <IconButton size="small" onClick={closeChat} sx={{ p: 0.5 }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          {transcript && (
            <Box component={"div" as any} sx={{ mb: 1 }}>
              <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                " {transcript} "
              </Typography>
            </Box>
          )}

          <Box component={"div" as any} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {isProcessing ? (
              <CircularProgress size={16} />
            ) : (
              <VolumeUpIcon sx={{ fontSize: 16, color: 'primary.main' }} />
            )}
            <Typography variant="body2" sx={{ flex: 1 }}>
              {response || 'Di algo para comenzar...'}
            </Typography>
          </Box>

          <Typography variant="caption" sx={{ color: 'text.secondary', mt: 1 }}>
            {isListening ? 'Escuchando...' : 'Toca el botón para hablar'}
          </Typography>
        </ChatBubble>
      )}
    </>
  );
};

export default VoiceAssistant;