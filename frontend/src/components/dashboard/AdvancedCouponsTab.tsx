import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  Percent,
  ShoppingCart,
  Truck,
  Package
} from 'lucide-react';
import toast from 'react-hot-toast';

interface AdvancedCoupon {
  id: number;
  code: string;
  name: string;
  description?: string;
  status: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'EXPIRED' | 'DEPLETED';
  discountConfig: {
    type: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'BUY_X_GET_Y' | 'SPECIAL_PRICE' | 'FREE_SHIPPING' | 'BUNDLE_DISCOUNT';
    value: number;
    maxDiscountAmount?: number;
  };
  conditions: any[];
  applicationType: 'AUTOMATIC' | 'MANUAL' | 'CONDITIONAL';
  priority: number;
  isStackable: boolean;
  startDate?: string;
  endDate?: string;
  maxUsesTotal?: number;
  maxUsesPerUser: number;
  currentUsesTotal: number;
  minPurchaseAmount?: number;
  maxDiscountAmount?: number;
  autoApply: boolean;
  requiresApproval: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CouponStats {
  totalCoupons: number;
  activeCoupons: number;
  totalUses: number;
  averageUsesPerCoupon: number;
  totalDiscountAmount: number;
}

const AdvancedCouponsTab: React.FC<{ activeTab: string }> = ({ activeTab }) => {
  const [coupons, setCoupons] = useState<AdvancedCoupon[]>([]);
  const [stats, setStats] = useState<CouponStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<AdvancedCoupon | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    discountType: 'PERCENTAGE',
    discountValue: 0,
    maxDiscountAmount: '',
    applicationType: 'MANUAL',
    priority: 0,
    isStackable: true,
    startDate: '',
    endDate: '',
    maxUsesTotal: '',
    maxUsesPerUser: 1,
    minPurchaseAmount: '',
    maxDiscountAmountGlobal: '',
    autoApply: false,
    requiresApproval: false
  });

  const loadCoupons = useCallback(async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== 'ALL' && { status: statusFilter }),
        ...(typeFilter !== 'ALL' && { discountType: typeFilter })
      });

      const response = await fetch(`/api/v1/advanced-coupons?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('Error al cargar cupones');

      const data = await response.json();
      setCoupons(data.data.coupons || []);
      setTotalPages(data.data.totalPages || 1);

    } catch (error) {
      console.error('Error loading coupons:', error);
      toast.error('Error al cargar los cupones');
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, statusFilter, typeFilter]);

  const loadStats = useCallback(async () => {
    try {
      const response = await fetch('/api/v1/advanced-coupons/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'advanced-coupons') {
      loadCoupons();
      loadStats();
    }
  }, [activeTab, loadCoupons, loadStats]);

  const handleCreateCoupon = async () => {
    try {
      const couponData = {
        code: formData.code.toUpperCase(),
        name: formData.name,
        description: formData.description,
        status: 'DRAFT',
        discountConfig: {
          type: formData.discountType,
          value: formData.discountValue,
          ...(formData.maxDiscountAmount && { maxDiscountAmount: parseFloat(formData.maxDiscountAmount) })
        },
        conditions: [],
        applicationType: formData.applicationType,
        priority: formData.priority,
        isStackable: formData.isStackable,
        startDate: formData.startDate || null,
        endDate: formData.endDate || null,
        maxUsesTotal: formData.maxUsesTotal ? parseInt(formData.maxUsesTotal) : null,
        maxUsesPerUser: formData.maxUsesPerUser,
        minPurchaseAmount: formData.minPurchaseAmount ? parseFloat(formData.minPurchaseAmount) : null,
        maxDiscountAmount: formData.maxDiscountAmountGlobal ? parseFloat(formData.maxDiscountAmountGlobal) : null,
        autoApply: formData.autoApply,
        requiresApproval: formData.requiresApproval
      };

      const response = await fetch('/api/v1/advanced-coupons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(couponData)
      });

      if (!response.ok) throw new Error('Error al crear cupón');

      toast.success('Cupón creado exitosamente');
      setShowCreateModal(false);
      resetForm();
      loadCoupons();
      loadStats();

    } catch (error) {
      console.error('Error creating coupon:', error);
      toast.error('Error al crear el cupón');
    }
  };

  const handleDeleteCoupon = async (couponId: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este cupón?')) return;

    try {
      const response = await fetch(`/api/v1/advanced-coupons/${couponId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('Error al eliminar cupón');

      toast.success('Cupón eliminado exitosamente');
      loadCoupons();
      loadStats();

    } catch (error) {
      console.error('Error deleting coupon:', error);
      toast.error('Error al eliminar el cupón');
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      description: '',
      discountType: 'PERCENTAGE',
      discountValue: 0,
      maxDiscountAmount: '',
      applicationType: 'MANUAL',
      priority: 0,
      isStackable: true,
      startDate: '',
      endDate: '',
      maxUsesTotal: '',
      maxUsesPerUser: 1,
      minPurchaseAmount: '',
      maxDiscountAmountGlobal: '',
      autoApply: false,
      requiresApproval: false
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      DRAFT: { variant: 'secondary' as const, label: 'Borrador' },
      ACTIVE: { variant: 'default' as const, label: 'Activo' },
      PAUSED: { variant: 'outline' as const, label: 'Pausado' },
      EXPIRED: { variant: 'destructive' as const, label: 'Expirado' },
      DEPLETED: { variant: 'destructive' as const, label: 'Agotado' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.DRAFT;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getDiscountTypeIcon = (type: string) => {
    switch (type) {
      case 'PERCENTAGE': return <Percent className="w-4 h-4" />;
      case 'FIXED_AMOUNT': return <DollarSign className="w-4 h-4" />;
      case 'BUY_X_GET_Y': return <ShoppingCart className="w-4 h-4" />;
      case 'FREE_SHIPPING': return <Truck className="w-4 h-4" />;
      case 'BUNDLE_DISCOUNT': return <Package className="w-4 h-4" />;
      default: return <DollarSign className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Cupones Avanzados</h2>
          <p className="text-gray-600">Gestiona cupones con reglas complejas y condiciones avanzadas</p>
        </div>
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Crear Cupón
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Crear Cupón Avanzado</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="code">Código del Cupón</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                    placeholder="DESCUENTO20"
                  />
                </div>
                <div>
                  <Label htmlFor="name">Nombre</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Cupón de descuento"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Descripción del cupón"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="discountType">Tipo de Descuento</Label>
                  <Select value={formData.discountType} onValueChange={(value) => setFormData({...formData, discountType: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PERCENTAGE">Porcentaje</SelectItem>
                      <SelectItem value="FIXED_AMOUNT">Monto Fijo</SelectItem>
                      <SelectItem value="BUY_X_GET_Y">Compra X Lleva Y</SelectItem>
                      <SelectItem value="SPECIAL_PRICE">Precio Especial</SelectItem>
                      <SelectItem value="FREE_SHIPPING">Envío Gratis</SelectItem>
                      <SelectItem value="BUNDLE_DISCOUNT">Descuento por Paquete</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="discountValue">Valor del Descuento</Label>
                  <Input
                    id="discountValue"
                    type="number"
                    value={formData.discountValue}
                    onChange={(e) => setFormData({...formData, discountValue: parseFloat(e.target.value) || 0})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="applicationType">Tipo de Aplicación</Label>
                  <Select value={formData.applicationType} onValueChange={(value) => setFormData({...formData, applicationType: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AUTOMATIC">Automático</SelectItem>
                      <SelectItem value="MANUAL">Manual</SelectItem>
                      <SelectItem value="CONDITIONAL">Condicional</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="priority">Prioridad</Label>
                  <Input
                    id="priority"
                    type="number"
                    value={formData.priority}
                    onChange={(e) => setFormData({...formData, priority: parseInt(e.target.value) || 0})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Fecha de Inicio</Label>
                  <Input
                    id="startDate"
                    type="datetime-local"
                    value={formData.startDate}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">Fecha de Fin</Label>
                  <Input
                    id="endDate"
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="maxUsesTotal">Máximo de Usos Totales</Label>
                  <Input
                    id="maxUsesTotal"
                    type="number"
                    value={formData.maxUsesTotal}
                    onChange={(e) => setFormData({...formData, maxUsesTotal: e.target.value})}
                    placeholder="Ilimitado si vacío"
                  />
                </div>
                <div>
                  <Label htmlFor="maxUsesPerUser">Máximo de Usos por Usuario</Label>
                  <Input
                    id="maxUsesPerUser"
                    type="number"
                    value={formData.maxUsesPerUser}
                    onChange={(e) => setFormData({...formData, maxUsesPerUser: parseInt(e.target.value) || 1})}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isStackable"
                    checked={formData.isStackable}
                    onCheckedChange={(checked) => setFormData({...formData, isStackable: !!checked})}
                  />
                  <Label htmlFor="isStackable">Acumulable con otros descuentos</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="autoApply"
                    checked={formData.autoApply}
                    onCheckedChange={(checked) => setFormData({...formData, autoApply: !!checked})}
                  />
                  <Label htmlFor="autoApply">Aplicar automáticamente</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="requiresApproval"
                    checked={formData.requiresApproval}
                    onCheckedChange={(checked) => setFormData({...formData, requiresApproval: !!checked})}
                  />
                  <Label htmlFor="requiresApproval">Requiere aprobación</Label>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateCoupon}>
                  Crear Cupón
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Cupones</p>
                  <p className="text-2xl font-bold text-primary">{stats.totalCoupons}</p>
                </div>
                <BarChart3 className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Cupones Activos</p>
                  <p className="text-2xl font-bold text-green-600">{stats.activeCoupons}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Usos</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.totalUses}</p>
                </div>
                <ShoppingCart className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Descuento Total</p>
                  <p className="text-2xl font-bold text-purple-600">Q{stats.totalDiscountAmount.toFixed(2)}</p>
                </div>
                <DollarSign className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64">
              <Input
                placeholder="Buscar cupones..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos los Estados</SelectItem>
                <SelectItem value="DRAFT">Borrador</SelectItem>
                <SelectItem value="ACTIVE">Activo</SelectItem>
                <SelectItem value="PAUSED">Pausado</SelectItem>
                <SelectItem value="EXPIRED">Expirado</SelectItem>
                <SelectItem value="DEPLETED">Agotado</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Tipo de Descuento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos los Tipos</SelectItem>
                <SelectItem value="PERCENTAGE">Porcentaje</SelectItem>
                <SelectItem value="FIXED_AMOUNT">Monto Fijo</SelectItem>
                <SelectItem value="BUY_X_GET_Y">Compra X Lleva Y</SelectItem>
                <SelectItem value="FREE_SHIPPING">Envío Gratis</SelectItem>
                <SelectItem value="BUNDLE_DISCOUNT">Paquete</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={loadCoupons}>
              <Search className="w-4 h-4 mr-2" />
              Buscar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Coupons Table */}
      <Card>
        <CardHeader>
          <CardTitle>Cupones Avanzados</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Usos</TableHead>
                <TableHead>Fecha Inicio</TableHead>
                <TableHead>Fecha Fin</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {coupons.map((coupon) => (
                <TableRow key={coupon.id}>
                  <TableCell className="font-mono font-semibold">{coupon.code}</TableCell>
                  <TableCell>{coupon.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getDiscountTypeIcon(coupon.discountConfig.type)}
                      <span className="text-sm">
                        {coupon.discountConfig.type === 'PERCENTAGE' && `${coupon.discountConfig.value}%`}
                        {coupon.discountConfig.type === 'FIXED_AMOUNT' && `Q${coupon.discountConfig.value}`}
                        {coupon.discountConfig.type === 'BUY_X_GET_Y' && 'Compra X Lleva Y'}
                        {coupon.discountConfig.type === 'FREE_SHIPPING' && 'Envío Gratis'}
                        {coupon.discountConfig.type === 'BUNDLE_DISCOUNT' && 'Paquete'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(coupon.status)}</TableCell>
                  <TableCell>
                    <span className="text-sm">
                      {coupon.currentUsesTotal}
                      {coupon.maxUsesTotal && `/${coupon.maxUsesTotal}`}
                    </span>
                  </TableCell>
                  <TableCell>
                    {coupon.startDate ? new Date(coupon.startDate).toLocaleDateString() : 'N/A'}
                  </TableCell>
                  <TableCell>
                    {coupon.endDate ? new Date(coupon.endDate).toLocaleDateString() : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteCoupon(coupon.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {coupons.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No se encontraron cupones</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            Anterior
          </Button>
          <span className="flex items-center px-4">
            Página {currentPage} de {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            Siguiente
          </Button>
        </div>
      )}
    </motion.div>
  );
};

export default AdvancedCouponsTab;