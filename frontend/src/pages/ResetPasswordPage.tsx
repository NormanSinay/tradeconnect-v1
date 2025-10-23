import React from 'react'
import AuthLayout from '@/components/auth/AuthLayout'
import ResetPasswordForm from '@/components/auth/ResetPasswordForm'

const ResetPasswordPage: React.FC = () => {
  return (
    <AuthLayout
      title="Restablecer Contraseña"
      subtitle="Ingresa tu nueva contraseña"
    >
      <ResetPasswordForm />
    </AuthLayout>
  )
}

export default ResetPasswordPage