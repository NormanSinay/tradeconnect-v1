import axios from 'axios'

interface TurnstileVerificationResult {
  success: boolean
  challenge_ts?: string
  hostname?: string
  'error-codes'?: string[]
  action?: string
  cdata?: string
  metadata?: {
    ephemeral_id?: string
  }
}

interface TurnstileAssessmentResult {
  isValid: boolean
  score: number
  reasons: string[]
  error?: string
  challenge_ts?: string
  hostname?: string
  action?: string
}

class TurnstileService {
  private secretKey: string
  private verifyEndpoint = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'

  constructor() {
    this.secretKey = process.env.TURNSTILE_SECRET_KEY || ''

    if (!this.secretKey) {
      console.warn('⚠️ TURNSTILE_SECRET_KEY not configured in environment variables')
    }
  }

  /**
   * Verifica un token de Turnstile con la API de Cloudflare
   *
   * @param token - El token generado por el widget de Turnstile
   * @param remoteip - (Opcional) La dirección IP del usuario
   * @param idempotencyKey - (Opcional) UUID para protección contra reintentos
   * @returns Resultado de la verificación de Turnstile
   */
  async verifyToken(
    token: string,
    remoteip?: string,
    idempotencyKey?: string
  ): Promise<TurnstileAssessmentResult> {
    try {
      console.log('🔍 Verificando token de Cloudflare Turnstile...')
      console.log('🎯 Token:', token.substring(0, 20) + '...')

      // Validación básica del token
      if (!token || typeof token !== 'string') {
        console.warn('❌ Token de Turnstile inválido o vacío')
        return {
          isValid: false,
          score: 0,
          reasons: ['Token inválido o vacío'],
          error: 'Token inválido'
        }
      }

      if (token.length > 2048) {
        console.warn('❌ Token de Turnstile demasiado largo')
        return {
          isValid: false,
          score: 0,
          reasons: ['Token demasiado largo'],
          error: 'Token excede la longitud máxima'
        }
      }

      // Preparar los datos del formulario
      const formData = new URLSearchParams()
      formData.append('secret', this.secretKey)
      formData.append('response', token)

      if (remoteip) {
        formData.append('remoteip', remoteip)
      }

      if (idempotencyKey) {
        formData.append('idempotency_key', idempotencyKey)
      }

      console.log('📤 Enviando solicitud de verificación a Cloudflare...')

      // Realizar la solicitud a la API de Turnstile
      const response = await axios.post<TurnstileVerificationResult>(
        this.verifyEndpoint,
        formData.toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          timeout: 10000 // 10 segundos de timeout
        }
      )

      const result = response.data

      console.log('📥 Respuesta recibida de Cloudflare')
      console.log('✓ Success:', result.success)
      console.log('📝 Hostname:', result.hostname)
      console.log('⏰ Challenge timestamp:', result.challenge_ts)

      // Verificar si la validación fue exitosa
      if (!result.success) {
        const errorCodes = result['error-codes'] || []
        console.warn('❌ Verificación de Turnstile falló:', errorCodes)

        return {
          isValid: false,
          score: 0,
          reasons: errorCodes.map(code => this.getErrorMessage(code)),
          error: errorCodes.join(', ')
        }
      }

      // Verificación exitosa
      console.log('✅ Verificación de Turnstile completada exitosamente')

      return {
        isValid: true,
        score: 1.0, // Turnstile no proporciona score, asumimos 1.0 si es exitoso
        reasons: [],
        challenge_ts: result.challenge_ts,
        hostname: result.hostname,
        action: result.action
      }

    } catch (error) {
      console.error('❌ Error en verificación de Turnstile:', error)

      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
          return {
            isValid: false,
            score: 0,
            reasons: ['Timeout en la verificación'],
            error: 'La verificación excedió el tiempo límite'
          }
        }

        if (error.response) {
          return {
            isValid: false,
            score: 0,
            reasons: ['Error en la respuesta de Cloudflare'],
            error: `Error HTTP ${error.response.status}`
          }
        }
      }

      return {
        isValid: false,
        score: 0,
        reasons: ['Error interno en verificación de Turnstile'],
        error: error instanceof Error ? error.message : 'Error desconocido'
      }
    }
  }

  /**
   * Obtiene un mensaje descriptivo para un código de error de Turnstile
   */
  private getErrorMessage(errorCode: string): string {
    const errorMessages: Record<string, string> = {
      'missing-input-secret': 'Clave secreta no proporcionada',
      'invalid-input-secret': 'Clave secreta inválida o expirada',
      'missing-input-response': 'Token no proporcionado',
      'invalid-input-response': 'Token inválido, malformado o expirado',
      'bad-request': 'Solicitud malformada',
      'timeout-or-duplicate': 'Token ya fue validado o expiró',
      'internal-error': 'Error interno de Cloudflare'
    }

    return errorMessages[errorCode] || `Error desconocido: ${errorCode}`
  }

  /**
   * Verifica un token de Turnstile para login
   */
  async verifyLoginToken(token: string, remoteip?: string): Promise<TurnstileAssessmentResult> {
    return this.verifyToken(token, remoteip)
  }

  /**
   * Verifica un token de Turnstile para registro
   */
  async verifyRegisterToken(token: string, remoteip?: string): Promise<TurnstileAssessmentResult> {
    return this.verifyToken(token, remoteip)
  }

  /**
   * Verifica un token de Turnstile para recuperación de contraseña
   */
  async verifyForgotPasswordToken(token: string, remoteip?: string): Promise<TurnstileAssessmentResult> {
    return this.verifyToken(token, remoteip)
  }

  /**
   * Verifica un token de Turnstile para cambio de contraseña
   */
  async verifyChangePasswordToken(token: string, remoteip?: string): Promise<TurnstileAssessmentResult> {
    return this.verifyToken(token, remoteip)
  }

  /**
   * Verifica un token con validaciones adicionales personalizadas
   */
  async verifyTokenEnhanced(
    token: string,
    remoteip?: string,
    options?: {
      expectedAction?: string
      expectedHostname?: string
      idempotencyKey?: string
    }
  ): Promise<TurnstileAssessmentResult> {
    const result = await this.verifyToken(token, remoteip, options?.idempotencyKey)

    if (!result.isValid) {
      return result
    }

    // Validar acción esperada
    if (options?.expectedAction && result.action !== options.expectedAction) {
      console.warn('⚠️ Acción de Turnstile no coincide:', {
        expected: options.expectedAction,
        received: result.action
      })

      return {
        ...result,
        isValid: false,
        reasons: ['La acción no coincide con la esperada']
      }
    }

    // Validar hostname esperado
    if (options?.expectedHostname && result.hostname !== options.expectedHostname) {
      console.warn('⚠️ Hostname de Turnstile no coincide:', {
        expected: options.expectedHostname,
        received: result.hostname
      })

      return {
        ...result,
        isValid: false,
        reasons: ['El hostname no coincide con el esperado']
      }
    }

    // Verificar edad del token (advertir si tiene más de 4 minutos)
    if (result.challenge_ts) {
      const challengeTime = new Date(result.challenge_ts)
      const now = new Date()
      const ageMinutes = (now.getTime() - challengeTime.getTime()) / (1000 * 60)

      if (ageMinutes > 4) {
        console.warn(`⚠️ Token tiene ${ageMinutes.toFixed(1)} minutos de antigüedad`)
      }
    }

    return result
  }
}

// Exporta una instancia singleton
export const turnstileService = new TurnstileService()
export default turnstileService
