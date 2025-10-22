import React from 'react'
import AuthLayout from '@/components/auth/AuthLayout'
import VerifyEmailForm from '@/components/auth/VerifyEmailForm'

const VerifyEmailPage: React.FC = () => {
  return (
    <AuthLayout
      title="Verifica tu Email"
      subtitle="Hemos enviado un código de verificación a tu correo electrónico"
    >
      <VerifyEmailForm />
    </AuthLayout>
  )
}

export default VerifyEmailPage