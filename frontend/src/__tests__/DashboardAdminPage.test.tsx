import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import DashboardAdminPage from '../pages/DashboardAdminPage';
import { useAuthStore } from '../stores/authStore';
import { DashboardService } from '../services/dashboardService';
import { usePermissions } from '../hooks/usePermissions';
import { useErrorHandler } from '../hooks/useErrorHandler';
import toast from 'react-hot-toast';

// Mock de dependencias
jest.mock('../stores/authStore');
jest.mock('../services/dashboardService');
jest.mock('../hooks/usePermissions');
jest.mock('../hooks/useErrorHandler');
jest.mock('react-hot-toast');
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>
  }
}));

// Mock de componentes hijos
jest.mock('../components/dashboard/AdvancedUserManagementTab', () => {
  return function MockAdvancedUserManagementTab({ activeTab }: { activeTab: string }) {
    return <div data-testid="advanced-user-management-tab">AdvancedUserManagementTab - {activeTab}</div>;
  };
});

jest.mock('../components/dashboard/EventManagementTab', () => {
  return function MockEventManagementTab({ activeTab }: { activeTab: string }) {
    return <div data-testid="event-management-tab">EventManagementTab - {activeTab}</div>;
  };
});

jest.mock('../components/dashboard/FinanceManagementTab', () => {
  return function MockFinanceManagementTab({ activeTab }: { activeTab: string }) {
    return <div data-testid="finance-management-tab">FinanceManagementTab - {activeTab}</div>;
  };
});

jest.mock('../components/dashboard/AnalyticsTab', () => {
  return function MockAnalyticsTab({ activeTab }: { activeTab: string }) {
    return <div data-testid="analytics-tab">AnalyticsTab - {activeTab}</div>;
  };
});

jest.mock('../components/dashboard/AdvancedCouponsTab', () => {
  return function MockAdvancedCouponsTab({ activeTab }: { activeTab: string }) {
    return <div data-testid="advanced-coupons-tab">AdvancedCouponsTab - {activeTab}</div>;
  };
});

jest.mock('../components/dashboard/ContentManagementTab', () => {
  return function MockContentManagementTab({ activeTab }: { activeTab: string }) {
    return <div data-testid="content-management-tab">ContentManagementTab - {activeTab}</div>;
  };
});

jest.mock('../components/dashboard/MarketingManagementTab', () => {
  return function MockMarketingManagementTab({ activeTab }: { activeTab: string }) {
    return <div data-testid="marketing-management-tab">MarketingManagementTab - {activeTab}</div>;
  };
});

// Mock de componentes UI
jest.mock('../components/ui/card', () => ({
  Card: ({ children, ...props }: any) => <div data-testid="card" {...props}>{children}</div>,
  CardContent: ({ children, ...props }: any) => <div data-testid="card-content" {...props}>{children}</div>,
  CardHeader: ({ children, ...props }: any) => <div data-testid="card-header" {...props}>{children}</div>,
  CardTitle: ({ children, ...props }: any) => <div data-testid="card-title" {...props}>{children}</div>
}));

jest.mock('../components/ui/button', () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button data-testid="button" onClick={onClick} {...props}>{children}</button>
  )
}));

jest.mock('../components/ui/badge', () => ({
  Badge: ({ children, ...props }: any) => <span data-testid="badge" {...props}>{children}</span>
}));

jest.mock('../components/ui/table', () => ({
  Table: ({ children, ...props }: any) => <table data-testid="table" {...props}>{children}</table>,
  TableBody: ({ children, ...props }: any) => <tbody data-testid="table-body" {...props}>{children}</tbody>,
  TableCell: ({ children, ...props }: any) => <td data-testid="table-cell" {...props}>{children}</td>,
  TableHead: ({ children, ...props }: any) => <th data-testid="table-head" {...props}>{children}</th>,
  TableHeader: ({ children, ...props }: any) => <thead data-testid="table-header" {...props}>{children}</thead>,
  TableRow: ({ children, ...props }: any) => <tr data-testid="table-row" {...props}>{children}</tr>
}));

jest.mock('../components/ui/alert', () => ({
  Alert: ({ children, ...props }: any) => <div data-testid="alert" {...props}>{children}</div>,
  AlertDescription: ({ children, ...props }: any) => <div data-testid="alert-description" {...props}>{children}</div>
}));

// Mock de iconos
jest.mock('lucide-react', () => ({
  Users: () => <div data-testid="users-icon" />,
  Calendar: () => <div data-testid="calendar-icon" />,
  BookOpen: () => <div data-testid="book-open-icon" />,
  DollarSign: () => <div data-testid="dollar-sign-icon" />,
  TrendingUp: () => <div data-testid="trending-up-icon" />,
  AlertTriangle: () => <div data-testid="alert-triangle-icon" />,
  Settings: () => <div data-testid="settings-icon" />,
  Search: () => <div data-testid="search-icon" />,
  Plus: () => <div data-testid="plus-icon" />,
  BarChart3: () => <div data-testid="bar-chart-3-icon" />,
  FileText: () => <div data-testid="file-text-icon" />,
  Megaphone: () => <div data-testid="megaphone-icon" />,
  UserCheck: () => <div data-testid="user-check-icon" />,
  Ticket: () => <div data-testid="ticket-icon" />
}));

describe('DashboardAdminPage', () => {
  const mockUser = {
    id: 1,
    email: 'admin@test.com',
    role: 'admin',
    firstName: 'Admin',
    lastName: 'User'
  };

  const mockPermissions = {
    canManageUsers: true,
    canManageEvents: true,
    canManageFinance: true,
    canManageContent: true,
    canManageMarketing: true
  };

  const mockErrorHandler = {
    withErrorHandling: jest.fn((fn) => fn)
  };

  const mockDashboardService = {
    getSystemMetrics: jest.fn(),
    getSalesReport: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Configurar mocks por defecto
    (useAuthStore as any).mockReturnValue({
      user: mockUser,
      logout: jest.fn()
    });

    (usePermissions as any).mockReturnValue(mockPermissions);
    (useErrorHandler as any).mockReturnValue(mockErrorHandler);
    (DashboardService as any).mockImplementation(() => mockDashboardService);

    // Mock de window.location
    delete (window as any).location;
    window.location = { href: '', assign: jest.fn(), replace: jest.fn() } as any;

    // Mock de toast
    (toast.error as jest.Mock).mockImplementation(() => {});
    (toast.success as jest.Mock).mockImplementation(() => {});
  });

  describe('Verificación de permisos', () => {
    it('debe mostrar error y redirigir si no tiene permisos de admin', () => {
      (usePermissions as jest.Mock).mockReturnValue({
        ...mockPermissions,
        canManageUsers: false
      });

      render(<DashboardAdminPage />);

      expect(toast.error).toHaveBeenCalledWith('No tienes permisos para acceder al dashboard de Administrador');
      expect(window.location.href).toBe('/dashboard');
    });

    it('debe renderizar correctamente si tiene permisos de admin', () => {
      render(<DashboardAdminPage />);

      expect(screen.getByText('TradeConnect')).toBeInTheDocument();
      expect(screen.getByText('ADMIN')).toBeInTheDocument();
    });
  });

  describe('Carga inicial de datos', () => {
    it('debe mostrar loading inicialmente', () => {
      render(<DashboardAdminPage />);

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });

    it('debe cargar datos del dashboard correctamente', async () => {
      const mockMetrics = {
        totalUsers: 150,
        activeEvents: 25,
        totalCourses: 10,
        userSatisfaction: 85,
        incidentReports: 2
      };

      const mockSalesReport = {
        totalRevenue: 50000
      };

      mockDashboardService.getSystemMetrics.mockResolvedValue(mockMetrics);
      mockDashboardService.getSalesReport.mockResolvedValue(mockSalesReport);

      await act(async () => {
        render(<DashboardAdminPage />);
      });

      await waitFor(() => {
        expect(mockDashboardService.getSystemMetrics).toHaveBeenCalled();
        expect(mockDashboardService.getSalesReport).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(screen.getByText('150')).toBeInTheDocument(); // totalUsers
        expect(screen.getByText('25')).toBeInTheDocument(); // activeEvents
        expect(screen.getByText('Q50,000.00')).toBeInTheDocument(); // totalRevenue
      });
    });

    it('debe manejar errores en la carga de datos', async () => {
      const error = new Error('Error de API');
      mockDashboardService.getSystemMetrics.mockRejectedValue(error);

      await act(async () => {
        render(<DashboardAdminPage />);
      });

      await waitFor(() => {
        expect(mockErrorHandler.withErrorHandling).toHaveBeenCalled();
      });
    });
  });

  describe('Navegación entre pestañas', () => {
    beforeEach(async () => {
      mockDashboardService.getSystemMetrics.mockResolvedValue({
        totalUsers: 100,
        activeEvents: 10,
        totalCourses: 5,
        userSatisfaction: 80,
        incidentReports: 0
      });
      mockDashboardService.getSalesReport.mockResolvedValue({
        totalRevenue: 25000
      });

      await act(async () => {
        render(<DashboardAdminPage />);
      });

      await waitFor(() => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
      });
    });

    it('debe mostrar dashboard principal por defecto', () => {
      expect(screen.getByText('Dashboard Administrador')).toBeInTheDocument();
      expect(screen.getByText('Vista general y métricas de la plataforma')).toBeInTheDocument();
    });

    it('debe cambiar a pestaña de usuarios', async () => {
      const userTab = screen.getByText('Gestión de Usuarios');
      fireEvent.click(userTab);

      await waitFor(() => {
        expect(screen.getByTestId('advanced-user-management-tab')).toBeInTheDocument();
        expect(screen.getByText('Gestión de Usuarios')).toBeInTheDocument();
      });
    });

    it('debe cambiar a pestaña de eventos', async () => {
      const eventsTab = screen.getByText('Gestión de Eventos');
      fireEvent.click(eventsTab);

      await waitFor(() => {
        expect(screen.getByTestId('event-management-tab')).toBeInTheDocument();
        expect(screen.getByText('Gestión de Eventos')).toBeInTheDocument();
      });
    });

    it('debe cambiar a pestaña de finanzas', async () => {
      const financeTab = screen.getByText('Gestión Financiera');
      fireEvent.click(financeTab);

      await waitFor(() => {
        expect(screen.getByTestId('finance-management-tab')).toBeInTheDocument();
        expect(screen.getByText('Gestión Financiera')).toBeInTheDocument();
      });
    });

    it('debe cambiar a pestaña de analytics', async () => {
      const analyticsTab = screen.getByText('Analítica');
      fireEvent.click(analyticsTab);

      await waitFor(() => {
        expect(screen.getByTestId('analytics-tab')).toBeInTheDocument();
        expect(screen.getByText('Analítica del Sistema')).toBeInTheDocument();
      });
    });

    it('debe cambiar a pestaña de contenido', async () => {
      const contentTab = screen.getByText('Gestión de Contenido');
      fireEvent.click(contentTab);

      await waitFor(() => {
        expect(screen.getByTestId('content-management-tab')).toBeInTheDocument();
      });
    });

    it('debe cambiar a pestaña de marketing', async () => {
      const marketingTab = screen.getByText('Gestión de Marketing');
      fireEvent.click(marketingTab);

      await waitFor(() => {
        expect(screen.getByTestId('marketing-management-tab')).toBeInTheDocument();
      });
    });

    it('debe cambiar a pestaña de cupones avanzados', async () => {
      const couponsTab = screen.getByText('Gestión de Cupones');
      fireEvent.click(couponsTab);

      await waitFor(() => {
        expect(screen.getByTestId('advanced-coupons-tab')).toBeInTheDocument();
        expect(screen.getByText('Cupones Avanzados')).toBeInTheDocument();
      });
    });
  });

  describe('Acciones rápidas', () => {
    beforeEach(async () => {
      mockDashboardService.getSystemMetrics.mockResolvedValue({
        totalUsers: 100,
        activeEvents: 10,
        totalCourses: 5,
        userSatisfaction: 80,
        incidentReports: 0
      });
      mockDashboardService.getSalesReport.mockResolvedValue({
        totalRevenue: 25000
      });

      await act(async () => {
        render(<DashboardAdminPage />);
      });

      await waitFor(() => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
      });
    });

    it('debe navegar a gestión de usuarios al hacer clic en "Crear Usuario"', () => {
      const createUserButton = screen.getByText('Crear Usuario');
      fireEvent.click(createUserButton);

      expect(screen.getByTestId('advanced-user-management-tab')).toBeInTheDocument();
    });

    it('debe mostrar toast para funcionalidades en desarrollo', () => {
      const createEventButton = screen.getByText('Crear Evento');
      fireEvent.click(createEventButton);

      expect(toast.success).toHaveBeenCalledWith('Funcionalidad en desarrollo');
    });

    it('debe navegar a analytics al hacer clic en "Ver Analítica"', () => {
      const viewAnalyticsButton = screen.getByText('Ver Analítica');
      fireEvent.click(viewAnalyticsButton);

      expect(screen.getByTestId('analytics-tab')).toBeInTheDocument();
    });

    it('debe navegar a gestión de contenido al hacer clic en "Gestionar Contenido"', () => {
      const manageContentButton = screen.getByText('Gestionar Contenido');
      fireEvent.click(manageContentButton);

      expect(screen.getByTestId('content-management-tab')).toBeInTheDocument();
    });
  });

  describe('Métricas del dashboard', () => {
    beforeEach(async () => {
      mockDashboardService.getSystemMetrics.mockResolvedValue({
        totalUsers: 1000,
        activeEvents: 50,
        totalCourses: 25,
        userSatisfaction: 92,
        incidentReports: 3
      });
      mockDashboardService.getSalesReport.mockResolvedValue({
        totalRevenue: 75000
      });

      await act(async () => {
        render(<DashboardAdminPage />);
      });

      await waitFor(() => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
      });
    });

    it('debe mostrar métricas correctamente formateadas', () => {
      expect(screen.getByText('1,000')).toBeInTheDocument(); // totalUsers formateado
      expect(screen.getByText('50')).toBeInTheDocument(); // activeEvents
      expect(screen.getByText('Q75,000.00')).toBeInTheDocument(); // totalRevenue formateado
      expect(screen.getByText('92%')).toBeInTheDocument(); // userSatisfaction
      expect(screen.getByText('3')).toBeInTheDocument(); // incidentReports
    });

    it('debe mostrar alerta de incidentes cuando hay reportes', () => {
      expect(screen.getByTestId('alert')).toBeInTheDocument();
      expect(screen.getByText('⚠️ Alertas del Sistema:')).toBeInTheDocument();
      expect(screen.getByText('3 incidentes requieren atención.')).toBeInTheDocument();
    });

    it('debe mostrar indicadores de "Datos actualizados" para métricas positivas', () => {
      const trendingIcons = screen.getAllByTestId('trending-up-icon');
      expect(trendingIcons.length).toBeGreaterThan(0);
    });
  });

  describe('Cierre de sesión', () => {
    beforeEach(async () => {
      mockDashboardService.getSystemMetrics.mockResolvedValue({
        totalUsers: 100,
        activeEvents: 10,
        totalCourses: 5,
        userSatisfaction: 80,
        incidentReports: 0
      });
      mockDashboardService.getSalesReport.mockResolvedValue({
        totalRevenue: 25000
      });

      await act(async () => {
        render(<DashboardAdminPage />);
      });

      await waitFor(() => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
      });
    });

    it('debe cerrar sesión correctamente', () => {
      const logoutButton = screen.getByText('Cerrar Sesión');
      fireEvent.click(logoutButton);

      expect(useAuthStore().logout).toHaveBeenCalled();
      expect(window.location.href).toBe('/login');
    });
  });

  describe('Manejo de errores', () => {
    it('debe manejar errores de carga de datos y mostrar valores por defecto', async () => {
      mockDashboardService.getSystemMetrics.mockRejectedValue(new Error('API Error'));
      mockDashboardService.getSalesReport.mockRejectedValue(new Error('API Error'));

      await act(async () => {
        render(<DashboardAdminPage />);
      });

      await waitFor(() => {
        expect(screen.getByText('0')).toBeInTheDocument(); // valores por defecto
      });
    });

    it('debe mostrar mensaje de error cuando falla la carga inicial', async () => {
      mockDashboardService.getSystemMetrics.mockRejectedValue(new Error('Network Error'));

      await act(async () => {
        render(<DashboardAdminPage />);
      });

      await waitFor(() => {
        expect(mockErrorHandler.withErrorHandling).toHaveBeenCalled();
      });
    });
  });

  describe('Permisos condicionales', () => {
    it('debe mostrar solo pestañas permitidas por permisos', async () => {
      (usePermissions as jest.Mock).mockReturnValue({
        canManageUsers: true,
        canManageEvents: false,
        canManageFinance: false,
        canManageContent: false,
        canManageMarketing: false
      });

      mockDashboardService.getSystemMetrics.mockResolvedValue({
        totalUsers: 100,
        activeEvents: 10,
        totalCourses: 5,
        userSatisfaction: 80,
        incidentReports: 0
      });
      mockDashboardService.getSalesReport.mockResolvedValue({
        totalRevenue: 25000
      });

      await act(async () => {
        render(<DashboardAdminPage />);
      });

      await waitFor(() => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
      });

      // Debe mostrar solo las pestañas permitidas
      expect(screen.getByText('Gestión de Usuarios')).toBeInTheDocument();
      expect(screen.queryByText('Gestión de Eventos')).not.toBeInTheDocument();
      expect(screen.queryByText('Gestión Financiera')).not.toBeInTheDocument();
      expect(screen.queryByText('Gestión de Contenido')).not.toBeInTheDocument();
      expect(screen.queryByText('Gestión de Marketing')).not.toBeInTheDocument();
    });

    it('debe mostrar todas las pestañas para admin con todos los permisos', async () => {
      await act(async () => {
        render(<DashboardAdminPage />);
      });

      await waitFor(() => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
      });

      expect(screen.getByText('Gestión de Usuarios')).toBeInTheDocument();
      expect(screen.getByText('Gestión de Eventos')).toBeInTheDocument();
      expect(screen.getByText('Gestión Financiera')).toBeInTheDocument();
      expect(screen.getByText('Gestión de Contenido')).toBeInTheDocument();
      expect(screen.getByText('Gestión de Marketing')).toBeInTheDocument();
      expect(screen.getByText('Gestión de Cupones')).toBeInTheDocument();
      expect(screen.getByText('Analítica')).toBeInTheDocument();
    });
  });
});