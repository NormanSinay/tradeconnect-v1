import CryptoJS from 'crypto-js'

// Clave de encriptación - En producción, esta debería venir de variables de entorno
// Para desarrollo, usamos una clave segura pero conocida
const ENCRYPTION_KEY = import.meta.env.VITE_ENCRYPTION_KEY || 'Tc2024$Secure@Key!Guatemala#Trade'

// Función para validar que la encriptación funciona correctamente
export const validateEncryption = (): boolean => {
  try {
    const testPassword = 'test123'
    const encrypted = encryptPassword(testPassword)
    const decrypted = decryptPassword(encrypted)
    return decrypted === testPassword
  } catch (error) {
    console.error('Error validating encryption:', error)
    return false
  }
}

// Función para encriptar contraseña antes de enviar al backend
export const encryptPassword = (password: string): string => {
  try {
    // Usar AES para encriptar la contraseña
    const encrypted = CryptoJS.AES.encrypt(password, ENCRYPTION_KEY).toString()
    return encrypted
  } catch (error) {
    console.error('Error encrypting password:', error)
    throw new Error('Error al encriptar la contraseña')
  }
}

// Función para desencriptar contraseña (solo para casos específicos, generalmente no se usa)
export const decryptPassword = (encryptedPassword: string): string => {
  try {
    const decrypted = CryptoJS.AES.decrypt(encryptedPassword, ENCRYPTION_KEY)
    return decrypted.toString(CryptoJS.enc.Utf8)
  } catch (error) {
    console.error('Error decrypting password:', error)
    throw new Error('Error al desencriptar la contraseña')
  }
}

// Función para hashear datos sensibles (como emails para logs)
export const hashData = (data: string): string => {
  try {
    return CryptoJS.SHA256(data).toString()
  } catch (error) {
    console.error('Error hashing data:', error)
    return data // fallback
  }
}

// Función para generar un hash único para sesiones
export const generateSessionHash = (): string => {
  const timestamp = Date.now().toString()
  const random = Math.random().toString()
  return CryptoJS.SHA256(timestamp + random).toString()
}