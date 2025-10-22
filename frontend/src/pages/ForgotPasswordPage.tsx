import React from 'react'
import AuthLayout from '@/components/auth/AuthLayout'
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm'

const ForgotPasswordPage: React.FC = () => {
  return (
    <AuthLayout
      title="Recuperar Contraseña"
      subtitle="Te enviaremos un enlace para restablecer tu contraseña"
    >
      <ForgotPasswordForm />
    </AuthLayout>
  )
}

export default ForgotPasswordPage