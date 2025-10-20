import { format, formatDistanceToNow, parseISO, isValid, addDays, subDays, startOfDay, endOfDay } from 'date-fns'
import { es } from 'date-fns/locale'

/**
 * Formatea una fecha en formato legible para humanos
 */
export const formatDate = (date: Date | string | number, formatStr: string = 'dd/MM/yyyy'): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : new Date(date)
    if (!isValid(dateObj)) return 'Fecha inválida'
    return format(dateObj, formatStr, { locale: es })
  } catch (error) {
    console.error('Error formatting date:', error)
    return 'Fecha inválida'
  }
}

/**
 * Formatea una fecha con hora
 */
export const formatDateTime = (date: Date | string | number): string => {
  return formatDate(date, 'dd/MM/yyyy HH:mm')
}

/**
 * Formatea una fecha relativa (ej: "hace 2 días", "en 3 horas")
 */
export const formatRelativeDate = (date: Date | string | number): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : new Date(date)
    if (!isValid(dateObj)) return 'Fecha inválida'
    return formatDistanceToNow(dateObj, { addSuffix: true, locale: es })
  } catch (error) {
    console.error('Error formatting relative date:', error)
    return 'Fecha inválida'
  }
}

/**
 * Verifica si una fecha es en el futuro
 */
export const isFutureDate = (date: Date | string | number): boolean => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : new Date(date)
    return dateObj > new Date()
  } catch (error) {
    return false
  }
}

/**
 * Verifica si una fecha es en el pasado
 */
export const isPastDate = (date: Date | string | number): boolean => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : new Date(date)
    return dateObj < new Date()
  } catch (error) {
    return false
  }
}

/**
 * Verifica si una fecha está dentro de un rango
 */
export const isDateInRange = (
  date: Date | string | number,
  startDate: Date | string | number,
  endDate: Date | string | number
): boolean => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : new Date(date)
    const startObj = typeof startDate === 'string' ? parseISO(startDate) : new Date(startDate)
    const endObj = typeof endDate === 'string' ? parseISO(endDate) : new Date(endDate)

    return dateObj >= startObj && dateObj <= endObj
  } catch (error) {
    return false
  }
}

/**
 * Obtiene el inicio del día
 */
export const getStartOfDay = (date: Date | string | number): Date => {
  const dateObj = typeof date === 'string' ? parseISO(date) : new Date(date)
  return startOfDay(dateObj)
}

/**
 * Obtiene el fin del día
 */
export const getEndOfDay = (date: Date | string | number): Date => {
  const dateObj = typeof date === 'string' ? parseISO(date) : new Date(date)
  return endOfDay(dateObj)
}

/**
 * Agrega días a una fecha
 */
export const addDaysToDate = (date: Date | string | number, days: number): Date => {
  const dateObj = typeof date === 'string' ? parseISO(date) : new Date(date)
  return addDays(dateObj, days)
}

/**
 * Resta días a una fecha
 */
export const subDaysFromDate = (date: Date | string | number, days: number): Date => {
  const dateObj = typeof date === 'string' ? parseISO(date) : new Date(date)
  return subDays(dateObj, days)
}

/**
 * Formatea duración en horas y minutos
 */
export const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60

  if (hours === 0) {
    return `${mins}min`
  } else if (mins === 0) {
    return `${hours}h`
  } else {
    return `${hours}h ${mins}min`
  }
}

/**
 * Convierte una cadena de fecha a objeto Date de forma segura
 */
export const safeParseDate = (dateStr: string | Date | number): Date | null => {
  try {
    if (dateStr instanceof Date) return dateStr
    if (typeof dateStr === 'number') return new Date(dateStr)

    const parsed = parseISO(dateStr)
    return isValid(parsed) ? parsed : null
  } catch (error) {
    console.error('Error parsing date:', error)
    return null
  }
}

/**
 * Formatea fecha para eventos (ej: "Hoy", "Mañana", "15 de enero")
 */
export const formatEventDate = (date: Date | string | number): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : new Date(date)
    const today = new Date()
    const tomorrow = addDays(today, 1)

    if (format(dateObj, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')) {
      return 'Hoy'
    } else if (format(dateObj, 'yyyy-MM-dd') === format(tomorrow, 'yyyy-MM-dd')) {
      return 'Mañana'
    } else {
      return format(dateObj, 'd \'de\' MMMM', { locale: es })
    }
  } catch (error) {
    return 'Fecha inválida'
  }
}