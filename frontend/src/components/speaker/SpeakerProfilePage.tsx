/**
 * @fileoverview Página de Perfil del Speaker
 * @description Gestión completa del perfil de speaker con contratos, pagos y evaluaciones
 *
 * Arquitectura Recomendada:
 * React (componentes interactivos)
 *   ↓
 * Astro (routing y SSR)
 *   ↓
 * shadcn/ui (componentes UI)
 *   ↓
 * Tailwind CSS (estilos)
 *   ↓
 * Radix UI (primitivos accesibles)
 *   ↓
 * Lucide Icons (iconos)
 *
 * @version 1.0.0
 * @since 2024
 */

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import {
  FileText,
  DollarSign,
  Star,
  Edit,
  Linkedin,
  Globe,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div role="tabpanel" hidden={value !== index}>
    {value === index && <div className="py-6">{children}</div>}
  </div>
);

const SpeakerProfilePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);

  // Mock data
  const speakerProfile = {
    firstName: 'Juan',
    lastName: 'Pérez',
    email: 'juan.perez@example.com',
    phone: '+502 1234-5678',
    bio: 'Experto en transformación digital con más de 15 años de experiencia. Apasionado por la innovación tecnológica y el liderazgo empresarial.',
    specialties: ['Transformación Digital', 'Inteligencia Artificial', 'Liderazgo'],
    linkedinUrl: 'https://linkedin.com/in/juanperez',
    websiteUrl: 'https://juanperez.com',
    rating: 4.7,
    totalEvaluations: 24,
  };

  const contracts = [
    {
      id: 1,
      eventTitle: 'Transformación Digital 2024',
      type: 'Keynote Speaker',
      fee: 5000,
      status: 'active',
      signedDate: '2024-01-15',
      eventDate: '2024-03-15',
    },
    {
      id: 2,
      eventTitle: 'Innovación Tecnológica',
      type: 'Panel Moderator',
      fee: 3000,
      status: 'pending',
      signedDate: '2024-02-01',
      eventDate: '2024-03-20',
    },
  ];

  const payments = [
    {
      id: 1,
      eventTitle: 'Liderazgo Digital',
      amount: 5000,
      status: 'paid',
      paidDate: '2024-02-15',
      method: 'Transferencia Bancaria',
    },
    {
      id: 2,
      eventTitle: 'IA en Empresas',
      amount: 4000,
      status: 'pending',
      dueDate: '2024-03-20',
      method: 'Cheque',
    },
  ];

  const evaluations = [
    {
      id: 1,
      eventTitle: 'Transformación Digital',
      rating: 5,
      date: '2024-02-10',
      attendees: 150,
      comments: 8,
      highlights: [
        { category: 'Contenido', score: 4.9 },
        { category: 'Presentación', score: 5.0 },
        { category: 'Interacción', score: 4.8 },
      ],
    },
    {
      id: 2,
      eventTitle: 'Liderazgo en la Era Digital',
      rating: 4.5,
      date: '2024-01-20',
      attendees: 200,
      comments: 12,
      highlights: [
        { category: 'Contenido', score: 4.7 },
        { category: 'Presentación', score: 4.5 },
        { category: 'Interacción', score: 4.3 },
      ],
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'paid':
        return 'success';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  const formatCurrency = (amount: number) => `Q${amount.toLocaleString()}`;

  return (
    <div className="max-w-7xl mx-auto py-8">
      {/* Header with Profile Info */}
      <Card className="p-6 mb-8">
        <div className="flex gap-6">
          <Avatar className="w-32 h-32 bg-primary text-primary-foreground text-4xl">
            <AvatarFallback>
              {speakerProfile.firstName[0]}
              {speakerProfile.lastName[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div className="space-y-4">
                <div>
                  <h1 className="text-3xl font-bold">
                    {speakerProfile.firstName} {speakerProfile.lastName}
                  </h1>
                  <p className="text-muted-foreground">
                    {speakerProfile.email} • {speakerProfile.phone}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{speakerProfile.rating}</span>
                  </div>
                  <span className="text-muted-foreground">
                    ({speakerProfile.totalEvaluations} evaluaciones)
                  </span>
                </div>
                <div className="flex gap-2">
                  {speakerProfile.specialties.map((specialty) => (
                    <Badge key={specialty} variant="secondary">
                      {specialty}
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  {speakerProfile.linkedinUrl && (
                    <Button size="sm" variant="outline" asChild>
                      <a href={speakerProfile.linkedinUrl} target="_blank" rel="noopener noreferrer">
                        <Linkedin className="w-4 h-4 mr-2" />
                        LinkedIn
                      </a>
                    </Button>
                  )}
                  {speakerProfile.websiteUrl && (
                    <Button size="sm" variant="outline" asChild>
                      <a href={speakerProfile.websiteUrl} target="_blank" rel="noopener noreferrer">
                        <Globe className="w-4 h-4 mr-2" />
                        Sitio Web
                      </a>
                    </Button>
                  )}
                </div>
              </div>
              <Button variant="outline">
                <Edit className="w-4 h-4 mr-2" />
                Editar Perfil
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <Card>
        <Tabs value={activeTab.toString()} onValueChange={(value) => setActiveTab(parseInt(value))} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="0" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Contratos
            </TabsTrigger>
            <TabsTrigger value="1" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Pagos
            </TabsTrigger>
            <TabsTrigger value="2" className="flex items-center gap-2">
              <Star className="w-4 h-4" />
              Evaluaciones
            </TabsTrigger>
          </TabsList>

        <TabsContent value="0" className="mt-6">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Evento</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Honorarios</TableHead>
                  <TableHead>Fecha del Evento</TableHead>
                  <TableHead>Firmado</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contracts.map((contract) => (
                  <TableRow key={contract.id}>
                    <TableCell>{contract.eventTitle}</TableCell>
                    <TableCell>{contract.type}</TableCell>
                    <TableCell className="font-bold">
                      {formatCurrency(contract.fee)}
                    </TableCell>
                    <TableCell>
                      {new Date(contract.eventDate).toLocaleDateString('es-GT')}
                    </TableCell>
                    <TableCell>
                      {new Date(contract.signedDate).toLocaleDateString('es-GT')}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={contract.status === 'active' ? 'default' : 'secondary'}
                        className={cn(
                          contract.status === 'active' ? 'bg-green-100 text-green-800' : ''
                        )}
                      >
                        {contract.status === 'active' ? 'Activo' : 'Pendiente'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline">Ver Contrato</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="1" className="mt-6">
          <div className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-green-600 text-white">
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold mb-2">
                    {formatCurrency(5000)}
                  </div>
                  <p className="text-sm">Total Pagado (este mes)</p>
                </CardContent>
              </Card>
              <Card className="bg-orange-600 text-white">
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold mb-2">
                    {formatCurrency(4000)}
                  </div>
                  <p className="text-sm">Pendiente de Pago</p>
                </CardContent>
              </Card>
              <Card className="bg-primary text-primary-foreground">
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold mb-2">
                    {formatCurrency(18000)}
                  </div>
                  <p className="text-sm">Total Año 2024</p>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Evento</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>Método</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>{payment.eventTitle}</TableCell>
                    <TableCell className="font-bold">
                      {formatCurrency(payment.amount)}
                    </TableCell>
                    <TableCell>{payment.method}</TableCell>
                    <TableCell>
                      {payment.status === 'paid'
                        ? new Date(payment.paidDate!).toLocaleDateString('es-GT')
                        : `Vence: ${new Date(payment.dueDate!).toLocaleDateString('es-GT')}`}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={payment.status === 'paid' ? 'default' : 'secondary'}
                        className={cn(
                          payment.status === 'paid' ? 'bg-green-100 text-green-800' : ''
                        )}
                      >
                        {payment.status === 'paid' ? 'Pagado' : 'Pendiente'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline">Ver Recibo</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="2" className="mt-6">
          {evaluations.map((evaluation) => (
            <Card key={evaluation.id} className="mb-6">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">{evaluation.eventTitle}</h3>
                    <p className="text-muted-foreground">
                      {new Date(evaluation.date).toLocaleDateString('es-GT')} • {evaluation.attendees} asistentes
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 mb-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{evaluation.rating}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{evaluation.comments} comentarios</p>
                  </div>
                </div>

                <hr className="my-4" />

                <h4 className="font-semibold mb-4">Desglose por Categoría</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {evaluation.highlights.map((highlight) => (
                    <div key={highlight.category}>
                      <p className="text-sm mb-2">{highlight.category}</p>
                      <div className="flex items-center gap-2">
                        <Progress
                          value={(highlight.score / 5) * 100}
                          className="flex-1 h-2"
                        />
                        <span className="text-sm font-bold">{highlight.score}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4">
                  <Button size="sm" variant="outline">
                    Ver Todos los Comentarios
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default SpeakerProfilePage;
