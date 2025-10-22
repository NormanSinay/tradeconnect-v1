import { Event } from '@/types'

// Sample events data (same as in the HTML mockup)
export const sampleEvents: Event[] = [
  {
    id: 1,
    title: "Conferencia de Innovación Empresarial 2023",
    description: "Evento anual que reúne a los principales líderes empresariales para discutir tendencias y oportunidades.",
    date: "2023-11-15",
    time: "09:00 - 17:00",
    location: "Centro de Convenciones, Ciudad de Guatemala",
    modality: "presencial",
    type: "conferencia",
    price: 250,
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    featured: true,
    category: "conferencia"
  },
  {
    id: 2,
    title: "Taller de Marketing Digital",
    description: "Aprende estrategias efectivas de marketing digital para impulsar tu negocio.",
    date: "2023-11-20",
    time: "14:00 - 18:00",
    location: "Virtual",
    modality: "virtual",
    type: "taller",
    price: 120,
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    featured: true,
    category: "taller"
  },
  {
    id: 3,
    title: "Networking Empresarial",
    description: "Conecta con otros profesionales y expande tu red de contactos.",
    date: "2023-11-25",
    time: "18:00 - 20:00",
    location: "Hotel Camino Real, Ciudad de Guatemala",
    modality: "presencial",
    type: "networking",
    price: 50,
    image: "https://images.unsplash.com/photo-1511578314322-379afb476865?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    featured: true,
    category: "networking"
  },
  {
    id: 4,
    title: "Seminario de Liderazgo",
    description: "Desarrolla habilidades de liderazgo para gestionar equipos de alto rendimiento.",
    date: "2023-12-05",
    time: "09:00 - 13:00",
    location: "Híbrido",
    modality: "hibrido",
    type: "seminario",
    price: 180,
    image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    featured: true,
    category: "seminario"
  }
]

// Utility functions
export const formatCurrency = (amount: number): string => {
  return `Q${amount.toFixed(2)}`
}

export const formatDate = (dateString: string): string => {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }
  return new Date(dateString).toLocaleDateString('es-GT', options)
}

export const getModalityText = (modality: string): string => {
  const modalityMap: Record<string, string> = {
    presencial: 'Presencial',
    virtual: 'Virtual',
    hibrido: 'Híbrido'
  }
  return modalityMap[modality] || modality
}

export const getTypeText = (type: string): string => {
  const typeMap: Record<string, string> = {
    conferencia: 'Conferencia',
    taller: 'Taller',
    networking: 'Networking',
    seminario: 'Seminario',
    curso: 'Curso'
  }
  return typeMap[type] || type
}