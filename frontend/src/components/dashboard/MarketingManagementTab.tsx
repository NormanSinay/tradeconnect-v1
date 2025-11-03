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
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Send,
  Pause,
  Play,
  Mail,
  Image,
  Megaphone,
  BarChart3,
  Users,
  TrendingUp,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileText,
  Target,
  DollarSign
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Banner {
  id: number;
  title: string;
  imageUrl: string;
  linkUrl?: string;
  position: string;
  isActive: boolean;
  priority: number;
  startDate?: string;
  endDate?: string;
  clickCount: number;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

interface PromotionalAd {
  id: number;
  title: string;
  description?: string;
  adType: string;
  targetPlatform: string;
  isActive: boolean;
  priority: number;
  budget?: number;
  currency: string;
  startDate?: string;
  endDate?: string;
  clickCount: number;
  viewCount: number;
  conversionCount: number;
  createdAt: string;
  updatedAt: string;
}

interface EmailCampaign {
  id: number;
  name: string;
  subject: string;
  status: string;
  type: string;
  totalRecipients: number;
  sentCount: number;
  scheduledAt?: string;
  sentAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface EmailTemplate {
  id: number;
  code: string;
  name: string;
  subject: string;
  type: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const MarketingManagementTab: React.FC<{ activeTab: string }> = ({ activeTab }) => {
  const [activeMarketingTab, setActiveMarketingTab] = useState('campaigns');
  const [banners, setBanners] = useState<Banner[]>([]);
  const [promotionalAds, setPromotionalAds] = useState<PromotionalAd[]>([]);
  const [emailCampaigns, setEmailCampaigns] = useState<EmailCampaign[]>([]);
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Form states
  const [formData, setFormData] = useState({
    // Banners
    title: '',
    imageUrl: '',
    linkUrl: '',
    position: 'header',
    priority: 0,
    startDate: '',
    endDate: '',

    // Promotional Ads
    description: '',
    adType: 'banner',
    targetPlatform: 'web',
    budget: 0,
    currency: 'GTQ',

    // Email Campaigns
    name: '',
    subject: '',
    fromName: '',
    fromEmail: '',
    type: 'marketing',
    templateId: '',
    scheduledAt: '',

    // Email Templates
    code: '',
    content: '',
    variables: ''
  });

  const loadBanners = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/v1/cms/banners', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setBanners(data.data?.banners || []);
      }
    } catch (error) {
      console.error('Error loading banners:', error);
      toast.error('Error al cargar banners');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadPromotionalAds = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/v1/cms/promotional-ads', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPromotionalAds(data.data?.ads || []);
      }
    } catch (error) {
      console.error('Error loading promotional ads:', error);
      toast.error('Error al cargar anuncios promocionales');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadEmailCampaigns = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        limit: '20',
        offset: ((currentPage - 1) * 20).toString()
      });

      const response = await fetch(`/api/v1/campaigns?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setEmailCampaigns(data.data?.campaigns || []);
        setTotalPages(Math.ceil((data.data?.pagination?.total || 0) / 20));
      }
    } catch (error) {
      console.error('Error loading email campaigns:', error);
      toast.error('Error al cargar campañas de email');
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  const loadEmailTemplates = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/v1/email-templates', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setEmailTemplates(data.data?.templates || []);
      }
    } catch (error) {
      console.error('Error loading email templates:', error);
      toast.error('Error al cargar plantillas de email');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'marketing') {
      switch (activeMarketingTab) {
        case 'banners':
          loadBanners();
          break;
        case 'ads':
          loadPromotionalAds();
          break;
        case 'campaigns':
          loadEmailCampaigns();
          break;
        case 'templates':
          loadEmailTemplates();
          break;
      }
    }
  }, [activeTab, activeMarketingTab, loadBanners, loadPromotionalAds, loadEmailCampaigns, loadEmailTemplates]);

  const handleCreateItem = async () => {
    try {
      let endpoint = '';
      let data = {};

      switch (activeMarketingTab) {
        case 'banners':
          endpoint = '/api/v1/cms/banners';
          data = {
            title: formData.title,
            imageUrl: formData.imageUrl,
            linkUrl: formData.linkUrl,
            position: formData.position,
            priority: formData.priority,
            startDate: formData.startDate || undefined,
            endDate: formData.endDate || undefined,
            isActive: true
          };
          break;
        case 'ads':
          endpoint = '/api/v1/cms/promotional-ads';
          data = {
            title: formData.title,
            description: formData.description,
            adType: formData.adType,
            targetPlatform: formData.targetPlatform,
            budget: formData.budget,
            currency: formData.currency,
            startDate: formData.startDate || undefined,
            endDate: formData.endDate || undefined,
            isActive: true,
            priority: formData.priority
          };
          break;
        case 'campaigns':
          endpoint = '/api/v1/campaigns';
          data = {
            name: formData.name,
            subject: formData.subject,
            fromName: formData.fromName,
            fromEmail: formData.fromEmail,
            type: formData.type,
            templateId: formData.templateId || undefined,
            scheduledAt: formData.scheduledAt || undefined
          };
          break;
        case 'templates':
          endpoint = '/api/v1/email-templates';
          data = {
            code: formData.code,
            name: formData.title,
            subject: formData.subject,
            content: formData.content,
            type: formData.type,
            variables: formData.variables ? JSON.parse(formData.variables) : {}
          };
          break;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) throw new Error('Error al crear elemento');

      toast.success('Elemento creado exitosamente');
      setShowCreateModal(false);
      resetForm();

      // Reload current tab
      switch (activeMarketingTab) {
        case 'banners':
          loadBanners();
          break;
        case 'ads':
          loadPromotionalAds();
          break;
        case 'campaigns':
          loadEmailCampaigns();
          break;
        case 'templates':
          loadEmailTemplates();
          break;
      }

    } catch (error) {
      console.error('Error creating item:', error);
      toast.error('Error al crear el elemento');
    }
  };

  const handleDeleteItem = async (id: number, type: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este elemento?')) return;

    try {
      let endpoint = '';
      switch (type) {
        case 'banners':
          endpoint = `/api/v1/cms/banners/${id}`;
          break;
        case 'ads':
          endpoint = `/api/v1/cms/promotional-ads/${id}`;
          break;
        case 'campaigns':
          endpoint = `/api/v1/campaigns/${id}`;
          break;
        case 'templates':
          endpoint = `/api/v1/email-templates/${id}`;
          break;
      }

      const response = await fetch(endpoint, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('Error al eliminar elemento');

      toast.success('Elemento eliminado exitosamente');

      // Reload current tab
      switch (activeMarketingTab) {
        case 'banners':
          loadBanners();
          break;
        case 'ads':
          loadPromotionalAds();
          break;
        case 'campaigns':
          loadEmailCampaigns();
          break;
        case 'templates':
          loadEmailTemplates();
          break;
      }

    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Error al eliminar el elemento');
    }
  };

  const handleCampaignAction = async (campaignId: number, action: string) => {
    try {
      const response = await fetch(`/api/v1/campaigns/${campaignId}/${action}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error(`Error al ${action} campaña`);

      toast.success(`Campaña ${action === 'send' ? 'enviada' : action === 'pause' ? 'pausada' : 'cancelada'} exitosamente`);
      loadEmailCampaigns();

    } catch (error) {
      console.error(`Error ${action} campaign:`, error);
      toast.error(`Error al ${action} la campaña`);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      imageUrl: '',
      linkUrl: '',
      position: 'header',
      priority: 0,
      startDate: '',
      endDate: '',
      description: '',
      adType: 'banner',
      targetPlatform: 'web',
      budget: 0,
      currency: 'GTQ',
      name: '',
      subject: '',
      fromName: '',
      fromEmail: '',
      type: 'marketing',
      templateId: '',
      scheduledAt: '',
      code: '',
      content: '',
      variables: ''
    });
  };

  const renderBanners = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Banners</h3>
          <p className="text-gray-600">Gestiona banners publicitarios del sitio web</p>
        </div>
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Banner
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Crear Banner</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Título</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="Título del banner"
                  />
                </div>
                <div>
                  <Label htmlFor="position">Posición</Label>
                  <Select value={formData.position} onValueChange={(value) => setFormData({...formData, position: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="header">Header</SelectItem>
                      <SelectItem value="sidebar">Sidebar</SelectItem>
                      <SelectItem value="footer">Footer</SelectItem>
                      <SelectItem value="popup">Popup</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="imageUrl">URL de Imagen</Label>
                <Input
                  id="imageUrl"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                  placeholder="https://ejemplo.com/imagen.jpg"
                />
              </div>

              <div>
                <Label htmlFor="linkUrl">URL de Enlace (opcional)</Label>
                <Input
                  id="linkUrl"
                  value={formData.linkUrl}
                  onChange={(e) => setFormData({...formData, linkUrl: e.target.value})}
                  placeholder="https://ejemplo.com"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="priority">Prioridad</Label>
                  <Input
                    id="priority"
                    type="number"
                    value={formData.priority}
                    onChange={(e) => setFormData({...formData, priority: parseInt(e.target.value) || 0})}
                  />
                </div>
                <div>
                  <Label htmlFor="startDate">Fecha Inicio</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">Fecha Fin</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateItem}>
                  Crear Banner
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Imagen</TableHead>
            <TableHead>Título</TableHead>
            <TableHead>Posición</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Estadísticas</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {banners.map((banner) => (
            <TableRow key={banner.id}>
              <TableCell>
                <img src={banner.imageUrl} alt={banner.title} className="w-16 h-10 object-cover rounded" />
              </TableCell>
              <TableCell>{banner.title}</TableCell>
              <TableCell>
                <Badge variant="outline" className="capitalize">{banner.position}</Badge>
              </TableCell>
              <TableCell>
                {banner.isActive ? (
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Activo
                  </Badge>
                ) : (
                  <Badge variant="secondary">
                    <XCircle className="w-3 h-3 mr-1" />
                    Inactivo
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                <div className="text-sm">
                  <div>Vistas: {banner.viewCount}</div>
                  <div>Clics: {banner.clickCount}</div>
                </div>
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
                    onClick={() => handleDeleteItem(banner.id, 'banners')}
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
    </div>
  );

  const renderPromotionalAds = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Anuncios Promocionales</h3>
          <p className="text-gray-600">Gestiona anuncios publicitarios avanzados</p>
        </div>
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Anuncio
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Crear Anuncio Promocional</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Título</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="Título del anuncio"
                  />
                </div>
                <div>
                  <Label htmlFor="adType">Tipo de Anuncio</Label>
                  <Select value={formData.adType} onValueChange={(value) => setFormData({...formData, adType: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="banner">Banner</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="text">Texto</SelectItem>
                      <SelectItem value="rich_media">Rich Media</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Descripción del anuncio"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="targetPlatform">Plataforma</Label>
                  <Select value={formData.targetPlatform} onValueChange={(value) => setFormData({...formData, targetPlatform: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="web">Web</SelectItem>
                      <SelectItem value="mobile">Móvil</SelectItem>
                      <SelectItem value="social">Redes Sociales</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="budget">Presupuesto</Label>
                  <Input
                    id="budget"
                    type="number"
                    value={formData.budget}
                    onChange={(e) => setFormData({...formData, budget: parseFloat(e.target.value) || 0})}
                  />
                </div>
                <div>
                  <Label htmlFor="currency">Moneda</Label>
                  <Select value={formData.currency} onValueChange={(value) => setFormData({...formData, currency: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GTQ">GTQ</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="priority">Prioridad</Label>
                  <Input
                    id="priority"
                    type="number"
                    value={formData.priority}
                    onChange={(e) => setFormData({...formData, priority: parseInt(e.target.value) || 0})}
                  />
                </div>
                <div>
                  <Label htmlFor="startDate">Fecha Inicio</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">Fecha Fin</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateItem}>
                  Crear Anuncio
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Título</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Plataforma</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Rendimiento</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {promotionalAds.map((ad) => (
            <TableRow key={ad.id}>
              <TableCell>{ad.title}</TableCell>
              <TableCell>
                <Badge variant="outline" className="capitalize">{ad.adType}</Badge>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="capitalize">{ad.targetPlatform}</Badge>
              </TableCell>
              <TableCell>
                {ad.isActive ? (
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Activo
                  </Badge>
                ) : (
                  <Badge variant="secondary">
                    <XCircle className="w-3 h-3 mr-1" />
                    Inactivo
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                <div className="text-sm">
                  <div>Vistas: {ad.viewCount}</div>
                  <div>Clics: {ad.clickCount}</div>
                  <div>Conversiones: {ad.conversionCount}</div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <BarChart3 className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteItem(ad.id, 'ads')}
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
    </div>
  );

  const renderEmailCampaigns = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Campañas de Email</h3>
          <p className="text-gray-600">Gestiona campañas de email marketing automatizadas</p>
        </div>
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nueva Campaña
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Crear Campaña de Email</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nombre de Campaña</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Nombre de la campaña"
                  />
                </div>
                <div>
                  <Label htmlFor="type">Tipo</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="newsletter">Newsletter</SelectItem>
                      <SelectItem value="promotional">Promocional</SelectItem>
                      <SelectItem value="transactional">Transaccional</SelectItem>
                      <SelectItem value="welcome">Bienvenida</SelectItem>
                      <SelectItem value="reengagement">Re-engagement</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="subject">Asunto</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  placeholder="Asunto del email"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fromName">Nombre Remitente</Label>
                  <Input
                    id="fromName"
                    value={formData.fromName}
                    onChange={(e) => setFormData({...formData, fromName: e.target.value})}
                    placeholder="TradeConnect"
                  />
                </div>
                <div>
                  <Label htmlFor="fromEmail">Email Remitente</Label>
                  <Input
                    id="fromEmail"
                    type="email"
                    value={formData.fromEmail}
                    onChange={(e) => setFormData({...formData, fromEmail: e.target.value})}
                    placeholder="noreply@tradeconnect.com"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="templateId">Plantilla (opcional)</Label>
                <Select value={formData.templateId} onValueChange={(value) => setFormData({...formData, templateId: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar plantilla" />
                  </SelectTrigger>
                  <SelectContent>
                    {emailTemplates.map((template) => (
                      <SelectItem key={template.id} value={template.id.toString()}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="scheduledAt">Programar envío (opcional)</Label>
                <Input
                  id="scheduledAt"
                  type="datetime-local"
                  value={formData.scheduledAt}
                  onChange={(e) => setFormData({...formData, scheduledAt: e.target.value})}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateItem}>
                  Crear Campaña
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Asunto</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Progreso</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {emailCampaigns.map((campaign) => (
            <TableRow key={campaign.id}>
              <TableCell>{campaign.name}</TableCell>
              <TableCell className="max-w-xs truncate" title={campaign.subject}>
                {campaign.subject}
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="capitalize">{campaign.type}</Badge>
              </TableCell>
              <TableCell>
                {campaign.status === 'SENT' ? (
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Enviada
                  </Badge>
                ) : campaign.status === 'SENDING' ? (
                  <Badge variant="default" className="bg-blue-100 text-blue-800">
                    <Send className="w-3 h-3 mr-1" />
                    Enviando
                  </Badge>
                ) : campaign.status === 'SCHEDULED' ? (
                  <Badge variant="secondary">
                    <Clock className="w-3 h-3 mr-1" />
                    Programada
                  </Badge>
                ) : campaign.status === 'PAUSED' ? (
                  <Badge variant="secondary">
                    <Pause className="w-3 h-3 mr-1" />
                    Pausada
                  </Badge>
                ) : (
                  <Badge variant="outline">
                    <Edit className="w-3 h-3 mr-1" />
                    Borrador
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Progress
                    value={campaign.totalRecipients > 0 ? (campaign.sentCount / campaign.totalRecipients) * 100 : 0}
                    className="w-20"
                  />
                  <span className="text-sm text-gray-600">
                    {campaign.sentCount}/{campaign.totalRecipients}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {campaign.status === 'DRAFT' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCampaignAction(campaign.id, 'send')}
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  )}
                  {campaign.status === 'SENDING' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCampaignAction(campaign.id, 'pause')}
                    >
                      <Pause className="w-4 h-4" />
                    </Button>
                  )}
                  {campaign.status === 'PAUSED' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCampaignAction(campaign.id, 'send')}
                    >
                      <Play className="w-4 h-4" />
                    </Button>
                  )}
                  <Button variant="outline" size="sm">
                    <BarChart3 className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteItem(campaign.id, 'campaigns')}
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
    </div>
  );

  const renderEmailTemplates = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Plantillas de Email</h3>
          <p className="text-gray-600">Gestiona plantillas reutilizables para emails</p>
        </div>
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nueva Plantilla
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Crear Plantilla de Email</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="code">Código</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                    placeholder="WELCOME_EMAIL"
                  />
                </div>
                <div>
                  <Label htmlFor="title">Nombre</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="Email de Bienvenida"
                  />
                </div>
                <div>
                  <Label htmlFor="type">Tipo</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="transactional">Transaccional</SelectItem>
                      <SelectItem value="promotional">Promocional</SelectItem>
                      <SelectItem value="operational">Operacional</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="subject">Asunto</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  placeholder="Asunto del email"
                />
              </div>

              <div>
                <Label htmlFor="content">Contenido HTML</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  placeholder="<h1>Hola {{recipient_first_name}}</h1>..."
                  rows={12}
                />
              </div>

              <div>
                <Label htmlFor="variables">Variables (JSON)</Label>
                <Textarea
                  id="variables"
                  value={formData.variables}
                  onChange={(e) => setFormData({...formData, variables: e.target.value})}
                  placeholder='{"recipient_first_name": "string", "event_name": "string"}'
                  rows={4}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateItem}>
                  Crear Plantilla
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Código</TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Última Actualización</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {emailTemplates.map((template) => (
            <TableRow key={template.id}>
              <TableCell className="font-mono text-sm">{template.code}</TableCell>
              <TableCell>{template.name}</TableCell>
              <TableCell>
                <Badge variant="outline" className="capitalize">{template.type}</Badge>
              </TableCell>
              <TableCell>
                {template.isActive ? (
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Activa
                  </Badge>
                ) : (
                  <Badge variant="secondary">
                    <XCircle className="w-3 h-3 mr-1" />
                    Inactiva
                  </Badge>
                )}
              </TableCell>
              <TableCell>{new Date(template.updatedAt).toLocaleDateString()}</TableCell>
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
                    onClick={() => handleDeleteItem(template.id, 'templates')}
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
    </div>
  );

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
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Marketing</h2>
          <p className="text-gray-600">Administra banners, anuncios promocionales, campañas de email y plantillas</p>
        </div>
      </div>

      {/* Marketing Tabs */}
      <Tabs value={activeMarketingTab} onValueChange={setActiveMarketingTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="banners" className="flex items-center gap-2">
            <Image className="w-4 h-4" />
            Banners
          </TabsTrigger>
          <TabsTrigger value="ads" className="flex items-center gap-2">
            <Megaphone className="w-4 h-4" />
            Anuncios
          </TabsTrigger>
          <TabsTrigger value="campaigns" className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Campañas
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Plantillas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="banners" className="mt-6">
          <Card>
            <CardContent className="p-6">
              {renderBanners()}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ads" className="mt-6">
          <Card>
            <CardContent className="p-6">
              {renderPromotionalAds()}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="campaigns" className="mt-6">
          <Card>
            <CardContent className="p-6">
              {renderEmailCampaigns()}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="mt-6">
          <Card>
            <CardContent className="p-6">
              {renderEmailTemplates()}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default MarketingManagementTab;