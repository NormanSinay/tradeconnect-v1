import React, { useState, useEffect } from 'react';
import { DashboardService, FinancialStats, FinancialReport, FinancialKPIs, CommissionData } from '@/services/dashboardService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Download, Eye, FileText, TrendingUp, DollarSign, CreditCard, Receipt, BarChart3 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useErrorHandler } from '@/hooks/useErrorHandler';

interface FinanceManagementTabProps {
  activeTab: string;
}

const FinanceManagementTab: React.FC<FinanceManagementTabProps> = ({ activeTab }) => {
  const { handleError } = useErrorHandler();
  const [activeFinanceTab, setActiveFinanceTab] = useState('transactions');

  // Estados para transacciones
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [gatewayFilter, setGatewayFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Estados para estadísticas financieras
  const [financialStats, setFinancialStats] = useState<FinancialStats | null>(null);
  const [financialStatsLoading, setFinancialStatsLoading] = useState(false);
  const [financialReport, setFinancialReport] = useState<FinancialReport | null>(null);
  const [financialKPIs, setFinancialKPIs] = useState<FinancialKPIs | null>(null);

  // Estados para comisiones
  const [commissionData, setCommissionData] = useState<CommissionData | null>(null);
  const [commissionCalculator, setCommissionCalculator] = useState({
    gateway: 'paypal',
    amount: 100,
    currency: 'GTQ'
  });

  // Estados para reportes
  const [reportFilters, setReportFilters] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  // Cargar datos iniciales cuando se monta el componente
  useEffect(() => {
    loadFinancialStats();
    loadTransactions();
  }, []);

  useEffect(() => {
    if (activeTab === 'finance') {
      loadTransactions();
    }
  }, [activeTab, currentPage, statusFilter, gatewayFilter]);

  const loadFinancialStats = async () => {
    try {
      setFinancialStatsLoading(true);
      const stats = await DashboardService.getFinancialStats();
      setFinancialStats(stats);
    } catch (error) {
      handleError(error);
      // Fallback a datos simulados
      setFinancialStats({
        totalRevenue: 245680,
        totalCommissions: 15680,
        totalRefunds: 2450,
        netProfit: 225650,
        transactionCount: 1247,
        averageTransactionValue: 197,
        topGateways: [],
        topEvents: [],
        monthlyGrowth: 12.5
      });
    } finally {
      setFinancialStatsLoading(false);
    }
  };


  const loadFinancialReport = async () => {
    try {
      const report = await DashboardService.getFinancialReport({
        startDate: reportFilters.startDate,
        endDate: reportFilters.endDate
      });
      setFinancialReport(report);
    } catch (error) {
      handleError(error);
    }
  };

  const loadFinancialKPIs = async () => {
    try {
      const kpis = await DashboardService.getFinancialKPIs({
        startDate: reportFilters.startDate,
        endDate: reportFilters.endDate
      });
      setFinancialKPIs(kpis);
    } catch (error) {
      handleError(error);
    }
  };

  const calculateCommission = async () => {
    try {
      const result = await DashboardService.calculateGatewayCommissions(
        commissionCalculator.gateway,
        commissionCalculator.amount,
        commissionCalculator.currency
      );
      setCommissionData(result);
    } catch (error) {
      handleError(error);
    }
  };

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: currentPage,
        limit: 20,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        gateway: gatewayFilter !== 'all' ? gatewayFilter : undefined,
        sortBy: 'createdAt',
        sortOrder: 'DESC'
      };

      const result = await DashboardService.getFinancialTransactions(params);
      setTransactions(result.transactions);
      setTotalPages(result.pagination.totalPages);
    } catch (error) {
      handleError(error);
      toast.error('Error al cargar transacciones');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    loadTransactions();
  };

  const handleExportData = async (type: 'transactions' | 'report' | 'commissions') => {
    try {
      const blob = await DashboardService.exportFinancialData({
        type,
        startDate: reportFilters.startDate,
        endDate: reportFilters.endDate,
        format: 'excel'
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `finanzas-${type}-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('Datos exportados exitosamente');
    } catch (error) {
      handleError(error);
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveFinanceTab(tab);
    if (tab === 'reports') {
      loadFinancialReport();
      loadFinancialKPIs();
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'pending': return 'secondary';
      case 'processing': return 'outline';
      case 'failed': return 'destructive';
      case 'cancelled': return 'destructive';
      case 'refunded': return 'secondary';
      default: return 'outline';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-GT', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-GT', {
      style: 'currency',
      currency: 'GTQ'
    }).format(amount);
  };

  if (activeTab !== 'finance') return null;

  return (
    <div className="space-y-6">
      {/* Estadísticas Financieras */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {financialStatsLoading ? 'Cargando...' : financialStats ? formatCurrency(financialStats.totalRevenue) : 'Sin datos'}
            </div>
            <p className="text-xs text-muted-foreground">
              +{financialStats?.monthlyGrowth || 0}% este mes
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ganancia Neta</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {financialStatsLoading ? 'Cargando...' : financialStats ? formatCurrency(financialStats.netProfit) : 'Sin datos'}
            </div>
            <p className="text-xs text-muted-foreground">Después de comisiones</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transacciones</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {financialStatsLoading ? 'Cargando...' : financialStats ? financialStats.transactionCount.toLocaleString() : 'Sin datos'}
            </div>
            <p className="text-xs text-muted-foreground">Total procesadas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Promedio</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {financialStatsLoading ? 'Cargando...' : financialStats ? formatCurrency(financialStats.averageTransactionValue) : 'Sin datos'}
            </div>
            <p className="text-xs text-muted-foreground">Por transacción</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs de navegación financiera */}
      <Tabs value={activeFinanceTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="transactions">Transacciones</TabsTrigger>
          <TabsTrigger value="commissions">Comisiones</TabsTrigger>
          <TabsTrigger value="refunds">Reembolsos</TabsTrigger>
          <TabsTrigger value="reports">Reportes</TabsTrigger>
        </TabsList>

        {/* Tab de Transacciones */}
        <TabsContent value="transactions" className="space-y-4">
          {/* Header con acciones */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar transacción..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filtrar por estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="completed">Completado</SelectItem>
                  <SelectItem value="pending">Pendiente</SelectItem>
                  <SelectItem value="processing">Procesando</SelectItem>
                  <SelectItem value="failed">Fallido</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                  <SelectItem value="refunded">Reembolsado</SelectItem>
                </SelectContent>
              </Select>
              <Select value={gatewayFilter} onValueChange={setGatewayFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filtrar por pasarela" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las pasarelas</SelectItem>
                  <SelectItem value="paypal">PayPal</SelectItem>
                  <SelectItem value="stripe">Stripe</SelectItem>
                  <SelectItem value="neonet">NeoNet</SelectItem>
                  <SelectItem value="bam">BAM</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => handleExportData('transactions')}>
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>

          {/* Tabla de transacciones */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Evento</TableHead>
                  <TableHead>Pasarela</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      Cargando transacciones...
                    </TableCell>
                  </TableRow>
                ) : transactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      No se encontraron transacciones
                    </TableCell>
                  </TableRow>
                ) : (
                  transactions.map((transaction: any) => (
                    <TableRow key={transaction.id}>
                      <TableCell>{transaction.transactionId}</TableCell>
                      <TableCell>{formatDate(transaction.createdAt)}</TableCell>
                      <TableCell>
                        {transaction.registration?.user
                          ? `${transaction.registration.user.firstName} ${transaction.registration.user.lastName}`
                          : 'N/A'
                        }
                      </TableCell>
                      <TableCell>
                        {transaction.registration?.event?.title || 'N/A'}
                      </TableCell>
                      <TableCell className="capitalize">{transaction.gateway}</TableCell>
                      <TableCell>{formatCurrency(transaction.amount)}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(transaction.status)}>
                          {transaction.status === 'completed' ? 'Completado' :
                           transaction.status === 'pending' ? 'Pendiente' :
                           transaction.status === 'processing' ? 'Procesando' :
                           transaction.status === 'failed' ? 'Fallido' :
                           transaction.status === 'cancelled' ? 'Cancelado' :
                           transaction.status === 'refunded' ? 'Reembolsado' : transaction.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <FileText className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Anterior
              </Button>
              <span className="px-4 py-2 text-sm">
                Página {currentPage} de {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Siguiente
              </Button>
            </div>
          )}
        </TabsContent>

        {/* Tab de Comisiones */}
        <TabsContent value="commissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Calculadora de Comisiones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">Pasarela de Pago</label>
                  <Select
                    value={commissionCalculator.gateway}
                    onValueChange={(value) => setCommissionCalculator(prev => ({ ...prev, gateway: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="paypal">PayPal</SelectItem>
                      <SelectItem value="stripe">Stripe</SelectItem>
                      <SelectItem value="neonet">NeoNet</SelectItem>
                      <SelectItem value="bam">BAM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Monto</label>
                  <Input
                    type="number"
                    value={commissionCalculator.amount}
                    onChange={(e) => setCommissionCalculator(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                    placeholder="0.00"
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={calculateCommission} className="w-full">
                    Calcular Comisión
                  </Button>
                </div>
              </div>

              {commissionData && (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Resultado del Cálculo</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Monto Original:</span>
                      <div className="font-medium">{formatCurrency(commissionData.amount)}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Comisión:</span>
                      <div className="font-medium text-red-600">-{formatCurrency(commissionData.fee)}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Monto Neto:</span>
                      <div className="font-medium text-green-600">{formatCurrency(commissionData.netAmount)}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Tasa:</span>
                      <div className="font-medium">{(commissionData.commissionRate * 100).toFixed(2)}%</div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab de Reembolsos */}
        <TabsContent value="refunds" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sistema de Reembolsos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Funcionalidad de reembolsos próximamente disponible.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab de Reportes */}
        <TabsContent value="reports" className="space-y-4">
          <div className="flex gap-4 mb-4">
            <div>
              <label className="text-sm font-medium">Fecha Inicio</label>
              <Input
                type="date"
                value={reportFilters.startDate}
                onChange={(e) => setReportFilters(prev => ({ ...prev, startDate: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Fecha Fin</label>
              <Input
                type="date"
                value={reportFilters.endDate}
                onChange={(e) => setReportFilters(prev => ({ ...prev, endDate: e.target.value }))}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={() => { loadFinancialReport(); loadFinancialKPIs(); }}>
                <BarChart3 className="h-4 w-4 mr-2" />
                Generar Reporte
              </Button>
            </div>
            <div className="flex items-end">
              <Button variant="outline" onClick={() => handleExportData('report')}>
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>

          {financialReport && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Reporte Financiero</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span>Ingresos Totales:</span>
                    <span className="font-medium">{formatCurrency(financialReport.revenue.total)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Gastos Totales:</span>
                    <span className="font-medium text-red-600">-{formatCurrency(financialReport.expenses.total)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-medium">Ganancia Neta:</span>
                    <span className="font-medium text-green-600">{formatCurrency(financialReport.netProfit)}</span>
                  </div>
                </CardContent>
              </Card>

              {financialKPIs && (
                <Card>
                  <CardHeader>
                    <CardTitle>KPIs Financieros</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span>ROI:</span>
                      <span className="font-medium">{financialKPIs.roi.toFixed(2)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Margen de Ganancia:</span>
                      <span className="font-medium">{financialKPIs.profitMargin.toFixed(2)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Valor Promedio:</span>
                      <span className="font-medium">{formatCurrency(financialKPIs.averageOrderValue)}</span>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FinanceManagementTab;