import React, { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { useAdmin } from '@/context/AdminContext'
import { cn } from '@/lib/utils'
import type { ComponentProps } from '@/types'

interface AdminLayoutProps extends ComponentProps {
  title?: string
  breadcrumbs?: Array<{ label: string; href?: string }>
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  title,
  breadcrumbs,
  className,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { hasPermission } = useAdmin()

  const handleLogout = () => {
    // Implementar logout
    navigate('/login')
  }

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const handleSearch = (query: string) => {
    // Implementar búsqueda global
    console.log('Buscar:', query)
  }

  // Generar breadcrumbs automáticos si no se proporcionan
  const generateBreadcrumbs = () => {
    if (breadcrumbs) return breadcrumbs

    const pathSegments = location.pathname.split('/').filter(Boolean)
    const crumbs = [{ label: 'Dashboard', href: '/admin' }]

    let currentPath = ''
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`
      if (index > 0) { // Skip 'admin'
        const label = segment.charAt(0).toUpperCase() + segment.slice(1).replace('-', ' ')
        crumbs.push({
          label,
          href: currentPath
        })
      }
    })

    return crumbs
  }

  const currentBreadcrumbs = generateBreadcrumbs()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <AdminSidebar
        isOpen={sidebarOpen}
        onToggle={toggleSidebar}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Header */}
        <AdminHeader
          onMenuClick={toggleSidebar}
          onSearch={handleSearch}
        />

        {/* Breadcrumbs */}
        {currentBreadcrumbs && currentBreadcrumbs.length > 1 && (
          <nav className="bg-white border-b border-gray-200 px-4 py-2 lg:px-6">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              {currentBreadcrumbs.map((crumb, index) => (
                <React.Fragment key={index}>
                  {index > 0 && <span className="text-gray-400">/</span>}
                  {crumb.href && index < currentBreadcrumbs.length - 1 ? (
                    <a
                      href={crumb.href}
                      className="hover:text-gray-900 transition-colors"
                    >
                      {crumb.label}
                    </a>
                  ) : (
                    <span className="text-gray-900 font-medium">
                      {crumb.label}
                    </span>
                  )}
                </React.Fragment>
              ))}
            </div>
          </nav>
        )}

        {/* Page Content */}
        <main className={cn("flex-1 p-4 lg:p-6", className)}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}