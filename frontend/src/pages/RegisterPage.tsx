import React from 'react'
import AuthLayout from '@/components/auth/AuthLayout'
import RegisterForm from '@/components/auth/RegisterForm'

const RegisterPage: React.FC = () => {
  return (
    <AuthLayout
      title="Crear Cuenta"
      subtitle="Únete a nuestra comunidad de eventos y cursos"
    >
      <RegisterForm />
    </AuthLayout>
  )
}

export default RegisterPage