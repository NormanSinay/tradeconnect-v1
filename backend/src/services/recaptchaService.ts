import { RecaptchaEnterpriseServiceClient } from '@google-cloud/recaptcha-enterprise'

interface RecaptchaAssessmentResult {
  isValid: boolean
  score: number
  reasons: string[]
  error?: string
}

class RecaptchaService {
  private client: RecaptchaEnterpriseServiceClient
  private projectId: string
  private siteKey: string

  constructor() {
    this.client = new RecaptchaEnterpriseServiceClient()
    this.projectId = process.env.GOOGLE_CLOUD_PROJECT || 'trade-476415'
    this.siteKey = process.env.RECAPTCHA_SITE_KEY || '6Lcl0PcrAAAAAIQaUDHCfKmwdCAMSIpHOsASEWaw'
  }

  /**
   * Crea una evaluación para analizar el riesgo de una acción de la IU.
   *
   * @param token - El token generado obtenido del cliente
   * @param recaptchaAction - El nombre de la acción que corresponde al token
   * @returns Resultado de la evaluación de reCAPTCHA
   */
  async createAssessment(token: string, recaptchaAction: string): Promise<RecaptchaAssessmentResult> {
    try {
      console.log('🔍 Verificando token de reCAPTCHA Enterprise...')
      console.log('📝 Acción:', recaptchaAction)
      console.log('🎯 Token:', token.substring(0, 20) + '...')

      const projectPath = this.client.projectPath(this.projectId)

      // Crea la solicitud de evaluación
      const request = {
        assessment: {
          event: {
            token: token,
            siteKey: this.siteKey,
          },
        },
        parent: projectPath,
      }

      console.log('📤 Enviando solicitud de evaluación a Google Cloud...')

      const [response] = await this.client.createAssessment(request)

      console.log('📥 Respuesta recibida de Google Cloud')

      // Verifica si el token es válido
      if (!response.tokenProperties?.valid) {
        const invalidReason = response.tokenProperties?.invalidReason || 'UNKNOWN_INVALID_REASON'
        console.warn('❌ Token de reCAPTCHA inválido:', invalidReason)

        return {
          isValid: false,
          score: 0,
          reasons: [`Token inválido: ${invalidReason}`],
          error: `Token inválido: ${invalidReason}`
        }
      }

      // Verifica si se ejecutó la acción esperada
      if (response.tokenProperties?.action !== recaptchaAction) {
        console.warn('⚠️ Acción de reCAPTCHA no coincide:', {
          expected: recaptchaAction,
          received: response.tokenProperties?.action
        })

        return {
          isValid: false,
          score: 0,
          reasons: ['Acción de reCAPTCHA no coincide con la esperada'],
          error: 'Acción de reCAPTCHA no coincide'
        }
      }

      // Obtén la puntuación de riesgo y los motivos
      const score = response.riskAnalysis?.score || 0
      const reasons = response.riskAnalysis?.reasons || []

      console.log('✅ Evaluación de reCAPTCHA completada:')
      console.log('📊 Puntuación:', score)
      console.log('📋 Motivos:', reasons)

      // Consideramos válido si la puntuación es mayor a 0.5
      const isValid = score >= 0.5

      return {
        isValid,
        score,
        reasons: reasons.map(reason => reason.toString())
      }

    } catch (error) {
      console.error('❌ Error en evaluación de reCAPTCHA:', error)

      return {
        isValid: false,
        score: 0,
        reasons: ['Error interno en verificación de reCAPTCHA'],
        error: error instanceof Error ? error.message : 'Error desconocido'
      }
    }
  }

  /**
   * Verifica un token de reCAPTCHA para login
   */
  async verifyLoginToken(token: string): Promise<RecaptchaAssessmentResult> {
    // For development tokens, skip verification
    if (token.startsWith('recaptcha-dev-token-')) {
      console.log('🔧 Development token detected, skipping Google Cloud verification')
      return {
        isValid: true,
        score: 0.9,
        reasons: []
      }
    }

    return this.createAssessment(token, 'LOGIN')
  }

  /**
   * Verifica un token de reCAPTCHA para registro
   */
  async verifyRegisterToken(token: string): Promise<RecaptchaAssessmentResult> {
    // For development tokens, skip verification
    if (token.startsWith('recaptcha-dev-token-')) {
      console.log('🔧 Development token detected, skipping Google Cloud verification')
      return {
        isValid: true,
        score: 0.9,
        reasons: []
      }
    }

    return this.createAssessment(token, 'REGISTER')
  }

  /**
   * Verifica un token de reCAPTCHA para recuperación de contraseña
   */
  async verifyForgotPasswordToken(token: string): Promise<RecaptchaAssessmentResult> {
    // For development tokens, skip verification
    if (token.startsWith('recaptcha-dev-token-')) {
      console.log('🔧 Development token detected, skipping Google Cloud verification')
      return {
        isValid: true,
        score: 0.9,
        reasons: []
      }
    }

    return this.createAssessment(token, 'FORGOT_PASSWORD')
  }

  /**
   * Verifica un token de reCAPTCHA para cambio de contraseña
   */
  async verifyChangePasswordToken(token: string): Promise<RecaptchaAssessmentResult> {
    // For development tokens, skip verification
    if (token.startsWith('recaptcha-dev-token-')) {
      console.log('🔧 Development token detected, skipping Google Cloud verification')
      return {
        isValid: true,
        score: 0.9,
        reasons: []
      }
    }

    return this.createAssessment(token, 'CHANGE_PASSWORD')
  }
}

// Exporta una instancia singleton
export const recaptchaService = new RecaptchaService()
export default recaptchaService