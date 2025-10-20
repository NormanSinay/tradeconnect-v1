/**
 * @fileoverview VoiceAssistant Component - Arquitectura React/Astro + Tailwind CSS + shadcn/ui
 *
 * Arquitectura recomendada para migración:
 * React (componentes interactivos) → Astro (routing y SSR) → shadcn/ui (componentes UI)
 * → Tailwind CSS (estilos) → Radix UI (primitivos accesibles) → Lucide Icons (iconos)
 *
 * @version 2.0.0
 * @author TradeConnect Team
 * @description Componente de asistente de voz con reconocimiento de voz y síntesis de voz.
 * Compatible con SSR de Astro y optimizado para performance.
 */

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

// Componente de botón de voz usando Tailwind CSS y shadcn/ui
const VoiceButton = ({ isListening, onClick, className }: {
  isListening: boolean;
  onClick: () => void;
  className?: string;
}) => (
  <Button
    onClick={onClick}
    className={cn(
      "fixed bottom-6 right-6 w-[70px] h-[70px] rounded-full bg-gradient-to-br from-primary to-yellow-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 z-[1000] animate-pulse hover:scale-105",
      isListening && "animate-ping",
      className
    )}
    aria-label={isListening ? 'Detener escucha' : 'Iniciar asistente de voz'}
  >
    {isListening ? <MicOff className="w-7 h-7" /> : <Mic className="w-7 h-7" />}
  </Button>
);

// Componente de burbuja de chat usando Tailwind CSS y shadcn/ui
const ChatBubble = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <Card className={cn(
    "fixed bottom-28 right-6 max-w-[300px] min-w-[250px] p-4 bg-white/95 backdrop-blur-md rounded-lg shadow-lg border border-white/20 z-[999]",
    className
  )}>
    <CardContent className="p-0 flex flex-col gap-2">
      {children}
    </CardContent>
  </Card>
);

const VoiceAssistant: React.FC = () => {
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
        isListening={isListening}
        onClick={toggleListening}
        className={isListening ? 'voice-active' : ''}
      />

      {/* Chat Bubble */}
      {isOpen && (
        <ChatBubble>
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-bold text-primary">
              Asistente TradeConnect
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={closeChat}
              className="p-1 h-auto"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {transcript && (
            <div className="mb-2">
              <p className="text-sm italic text-gray-600">
                " {transcript} "
              </p>
            </div>
          )}

          <div className="flex items-center gap-2">
            {isProcessing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Volume2 className="w-4 h-4 text-primary" />
            )}
            <p className="text-sm flex-1">
              {response || 'Di algo para comenzar...'}
            </p>
          </div>

          <p className="text-xs text-gray-500 mt-2">
            {isListening ? 'Escuchando...' : 'Toca el botón para hablar'}
          </p>
        </ChatBubble>
      )}
    </>
  );
};

export default VoiceAssistant;