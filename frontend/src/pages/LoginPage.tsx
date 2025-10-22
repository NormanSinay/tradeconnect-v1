import React from 'react'
import AuthLayout from '@/components/auth/AuthLayout'
import LoginForm from '@/components/auth/LoginForm'

const LoginPage: React.FC = () => {
  return (
    <AuthLayout
      title="Iniciar Sesión"
      subtitle="Accede a tu cuenta para gestionar tus eventos y cursos"
    >
      <LoginForm />
    </AuthLayout>
  )
}

export default LoginPage