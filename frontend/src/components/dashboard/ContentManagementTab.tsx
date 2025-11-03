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
  FileText,
  Shield,
  HelpCircle,
  BookOpen,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Globe,
  Lock
} from 'lucide-react';
import toast from 'react-hot-toast';

interface StaticPage {
  id: number;
  slug: string;
  title: string;
  meta_title?: string;
  meta_description?: string;
  is_published: boolean;
  published_at?: string;
  createdAt: string;
  updatedAt: string;
  creator?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface Term {
  id: number;
  version: string;
  title: string;
  is_active: boolean;
  effective_date: string;
  createdAt: string;
  updatedAt: string;
  creator?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface Policy {
  id: number;
  type: string;
  version: string;
  title: string;
  is_active: boolean;
  effective_date: string;
  createdAt: string;
  updatedAt: string;
  creator?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface FAQ {
  id: number;
  category: string;
  question: string;
  is_published: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
  creator?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
}

const ContentManagementTab: React.FC<{ activeTab: string }> = ({ activeTab }) => {
  const [activeContentTab, setActiveContentTab] = useState('pages');
  const [staticPages, setStaticPages] = useState<StaticPage[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Form states
  const [formData, setFormData] = useState({
    // Static Pages
    slug: '',
    title: '',
    content: '',
    meta_title: '',
    meta_description: '',
    is_published: false,

    // Terms & Policies
    version: '',
    type: 'privacy',
    effective_date: '',

    // FAQs
    category: '',
    question: '',
    answer: '',
    order: 0
  });

  const loadStaticPages = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...(searchTerm && { search: searchTerm })
      });

      const response = await fetch(`/api/v1/cms/static-pages?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStaticPages(data.data.pages || []);
        setTotalPages(data.data.pagination?.totalPages || 1);
      }
    } catch (error) {
      console.error('Error loading static pages:', error);
      toast.error('Error al cargar páginas estáticas');
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm]);

  const loadTerms = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/v1/cms/terms', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTerms(data.data.terms || []);
      }
    } catch (error) {
      console.error('Error loading terms:', error);
      toast.error('Error al cargar términos');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadPolicies = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/v1/cms/policies', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPolicies(data.data.policies || []);
      }
    } catch (error) {
      console.error('Error loading policies:', error);
      toast.error('Error al cargar políticas');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadFAQs = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...(searchTerm && { search: searchTerm })
      });

      const response = await fetch(`/api/v1/cms/faqs?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setFaqs(data.data.faqs || []);
        setTotalPages(data.data.pagination?.totalPages || 1);
      }
    } catch (error) {
      console.error('Error loading FAQs:', error);
      toast.error('Error al cargar FAQs');
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm]);

  useEffect(() => {
    if (activeTab === 'content') {
      switch (activeContentTab) {
        case 'pages':
          loadStaticPages();
          break;
        case 'terms':
          loadTerms();
          break;
        case 'policies':
          loadPolicies();
          break;
        case 'faqs':
          loadFAQs();
          break;
      }
    }
  }, [activeTab, activeContentTab, loadStaticPages, loadTerms, loadPolicies, loadFAQs]);

  const handleCreateItem = async () => {
    try {
      let endpoint = '';
      let data = {};

      switch (activeContentTab) {
        case 'pages':
          endpoint = '/api/v1/cms/static-pages';
          data = {
            slug: formData.slug,
            title: formData.title,
            content: formData.content,
            meta_title: formData.meta_title,
            meta_description: formData.meta_description,
            is_published: formData.is_published
          };
          break;
        case 'terms':
          endpoint = '/api/v1/cms/terms';
          data = {
            version: formData.version,
            title: formData.title,
            content: formData.content,
            is_active: formData.is_published,
            effective_date: formData.effective_date
          };
          break;
        case 'policies':
          endpoint = '/api/v1/cms/policies';
          data = {
            type: formData.type,
            version: formData.version,
            title: formData.title,
            content: formData.content,
            is_active: formData.is_published,
            effective_date: formData.effective_date
          };
          break;
        case 'faqs':
          endpoint = '/api/v1/cms/faqs';
          data = {
            category: formData.category,
            question: formData.question,
            answer: formData.content,
            order: formData.order,
            is_published: formData.is_published
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
      switch (activeContentTab) {
        case 'pages':
          loadStaticPages();
          break;
        case 'terms':
          loadTerms();
          break;
        case 'policies':
          loadPolicies();
          break;
        case 'faqs':
          loadFAQs();
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
        case 'pages':
          endpoint = `/api/v1/cms/static-pages/${id}`;
          break;
        case 'terms':
          endpoint = `/api/v1/cms/terms/${id}`;
          break;
        case 'policies':
          endpoint = `/api/v1/cms/policies/${id}`;
          break;
        case 'faqs':
          endpoint = `/api/v1/cms/faqs/${id}`;
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
      switch (activeContentTab) {
        case 'pages':
          loadStaticPages();
          break;
        case 'terms':
          loadTerms();
          break;
        case 'policies':
          loadPolicies();
          break;
        case 'faqs':
          loadFAQs();
          break;
      }

    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Error al eliminar el elemento');
    }
  };

  const resetForm = () => {
    setFormData({
      slug: '',
      title: '',
      content: '',
      meta_title: '',
      meta_description: '',
      is_published: false,
      version: '',
      type: 'privacy',
      effective_date: '',
      category: '',
      question: '',
      answer: '',
      order: 0
    });
  };

  const renderStaticPages = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Páginas Estáticas</h3>
          <p className="text-gray-600">Gestiona páginas informativas del sitio web</p>
        </div>
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nueva Página
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Crear Página Estática</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData({...formData, slug: e.target.value})}
                    placeholder="mi-pagina"
                  />
                </div>
                <div>
                  <Label htmlFor="title">Título</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="Título de la página"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="content">Contenido</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  placeholder="Contenido de la página"
                  rows={8}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="meta_title">Meta Título</Label>
                  <Input
                    id="meta_title"
                    value={formData.meta_title}
                    onChange={(e) => setFormData({...formData, meta_title: e.target.value})}
                    placeholder="Título para SEO"
                  />
                </div>
                <div>
                  <Label htmlFor="meta_description">Meta Descripción</Label>
                  <Input
                    id="meta_description"
                    value={formData.meta_description}
                    onChange={(e) => setFormData({...formData, meta_description: e.target.value})}
                    placeholder="Descripción para SEO"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_published"
                  checked={formData.is_published}
                  onCheckedChange={(checked) => setFormData({...formData, is_published: !!checked})}
                />
                <Label htmlFor="is_published">Publicar página</Label>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateItem}>
                  Crear Página
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Slug</TableHead>
            <TableHead>Título</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Última Actualización</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {staticPages.map((page) => (
            <TableRow key={page.id}>
              <TableCell className="font-mono text-sm">/{page.slug}</TableCell>
              <TableCell>{page.title}</TableCell>
              <TableCell>
                {page.is_published ? (
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    <Globe className="w-3 h-3 mr-1" />
                    Publicada
                  </Badge>
                ) : (
                  <Badge variant="secondary">
                    <Lock className="w-3 h-3 mr-1" />
                    Borrador
                  </Badge>
                )}
              </TableCell>
              <TableCell>{new Date(page.updatedAt).toLocaleDateString()}</TableCell>
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
                    onClick={() => handleDeleteItem(page.id, 'pages')}
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

  const renderTerms = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Términos y Condiciones</h3>
          <p className="text-gray-600">Gestiona versiones de términos y condiciones</p>
        </div>
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nueva Versión
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Crear Versión de Términos</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="version">Versión</Label>
                  <Input
                    id="version"
                    value={formData.version}
                    onChange={(e) => setFormData({...formData, version: e.target.value})}
                    placeholder="1.0.0"
                  />
                </div>
                <div>
                  <Label htmlFor="effective_date">Fecha de Vigencia</Label>
                  <Input
                    id="effective_date"
                    type="date"
                    value={formData.effective_date}
                    onChange={(e) => setFormData({...formData, effective_date: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Términos y Condiciones"
                />
              </div>

              <div>
                <Label htmlFor="content">Contenido</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  placeholder="Contenido de los términos y condiciones"
                  rows={12}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_published"
                  checked={formData.is_published}
                  onCheckedChange={(checked) => setFormData({...formData, is_published: !!checked})}
                />
                <Label htmlFor="is_published">Activar esta versión</Label>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateItem}>
                  Crear Versión
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Versión</TableHead>
            <TableHead>Título</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Fecha Vigencia</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {terms.map((term) => (
            <TableRow key={term.id}>
              <TableCell className="font-mono">{term.version}</TableCell>
              <TableCell>{term.title}</TableCell>
              <TableCell>
                {term.is_active ? (
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Activa
                  </Badge>
                ) : (
                  <Badge variant="secondary">
                    <Clock className="w-3 h-3 mr-1" />
                    Inactiva
                  </Badge>
                )}
              </TableCell>
              <TableCell>{new Date(term.effective_date).toLocaleDateString()}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Edit className="w-4 h-4" />
                  </Button>
                  {!term.is_active && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteItem(term.id, 'terms')}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  const renderPolicies = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Políticas</h3>
          <p className="text-gray-600">Gestiona políticas de privacidad y otros documentos legales</p>
        </div>
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nueva Política
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Crear Política</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="type">Tipo</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="privacy">Privacidad</SelectItem>
                      <SelectItem value="cookies">Cookies</SelectItem>
                      <SelectItem value="terms">Términos</SelectItem>
                      <SelectItem value="refund">Reembolso</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="version">Versión</Label>
                  <Input
                    id="version"
                    value={formData.version}
                    onChange={(e) => setFormData({...formData, version: e.target.value})}
                    placeholder="1.0.0"
                  />
                </div>
                <div>
                  <Label htmlFor="effective_date">Fecha Vigencia</Label>
                  <Input
                    id="effective_date"
                    type="date"
                    value={formData.effective_date}
                    onChange={(e) => setFormData({...formData, effective_date: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Política de Privacidad"
                />
              </div>

              <div>
                <Label htmlFor="content">Contenido</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  placeholder="Contenido de la política"
                  rows={12}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_published"
                  checked={formData.is_published}
                  onCheckedChange={(checked) => setFormData({...formData, is_published: !!checked})}
                />
                <Label htmlFor="is_published">Activar esta política</Label>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateItem}>
                  Crear Política
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tipo</TableHead>
            <TableHead>Versión</TableHead>
            <TableHead>Título</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Fecha Vigencia</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {policies.map((policy) => (
            <TableRow key={policy.id}>
              <TableCell>
                <Badge variant="outline" className="capitalize">
                  {policy.type === 'privacy' && 'Privacidad'}
                  {policy.type === 'cookies' && 'Cookies'}
                  {policy.type === 'terms' && 'Términos'}
                  {policy.type === 'refund' && 'Reembolso'}
                </Badge>
              </TableCell>
              <TableCell className="font-mono">{policy.version}</TableCell>
              <TableCell>{policy.title}</TableCell>
              <TableCell>
                {policy.is_active ? (
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Activa
                  </Badge>
                ) : (
                  <Badge variant="secondary">
                    <Clock className="w-3 h-3 mr-1" />
                    Inactiva
                  </Badge>
                )}
              </TableCell>
              <TableCell>{new Date(policy.effective_date).toLocaleDateString()}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Edit className="w-4 h-4" />
                  </Button>
                  {!policy.is_active && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteItem(policy.id, 'policies')}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  const renderFAQs = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Preguntas Frecuentes (FAQ)</h3>
          <p className="text-gray-600">Gestiona preguntas y respuestas frecuentes</p>
        </div>
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nueva FAQ
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Crear FAQ</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Categoría</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    placeholder="General"
                  />
                </div>
                <div>
                  <Label htmlFor="order">Orden</Label>
                  <Input
                    id="order"
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({...formData, order: parseInt(e.target.value) || 0})}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="question">Pregunta</Label>
                <Input
                  id="question"
                  value={formData.question}
                  onChange={(e) => setFormData({...formData, question: e.target.value})}
                  placeholder="¿Cuál es la pregunta?"
                />
              </div>

              <div>
                <Label htmlFor="content">Respuesta</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  placeholder="Respuesta detallada"
                  rows={8}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_published"
                  checked={formData.is_published}
                  onCheckedChange={(checked) => setFormData({...formData, is_published: !!checked})}
                />
                <Label htmlFor="is_published">Publicar FAQ</Label>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateItem}>
                  Crear FAQ
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Categoría</TableHead>
            <TableHead>Pregunta</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Orden</TableHead>
            <TableHead>Última Actualización</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {faqs.map((faq) => (
            <TableRow key={faq.id}>
              <TableCell>
                <Badge variant="outline">{faq.category}</Badge>
              </TableCell>
              <TableCell className="max-w-xs truncate" title={faq.question}>
                {faq.question}
              </TableCell>
              <TableCell>
                {faq.is_published ? (
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    <Globe className="w-3 h-3 mr-1" />
                    Publicada
                  </Badge>
                ) : (
                  <Badge variant="secondary">
                    <Lock className="w-3 h-3 mr-1" />
                    Oculta
                  </Badge>
                )}
              </TableCell>
              <TableCell>{faq.order}</TableCell>
              <TableCell>{new Date(faq.updatedAt).toLocaleDateString()}</TableCell>
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
                    onClick={() => handleDeleteItem(faq.id, 'faqs')}
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
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Contenido</h2>
          <p className="text-gray-600">Administra páginas estáticas, términos, políticas y FAQs</p>
        </div>
      </div>

      {/* Content Tabs */}
      <Tabs value={activeContentTab} onValueChange={setActiveContentTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pages" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Páginas
          </TabsTrigger>
          <TabsTrigger value="terms" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Términos
          </TabsTrigger>
          <TabsTrigger value="policies" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Políticas
          </TabsTrigger>
          <TabsTrigger value="faqs" className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4" />
            FAQs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pages" className="mt-6">
          <Card>
            <CardContent className="p-6">
              {renderStaticPages()}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="terms" className="mt-6">
          <Card>
            <CardContent className="p-6">
              {renderTerms()}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="policies" className="mt-6">
          <Card>
            <CardContent className="p-6">
              {renderPolicies()}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="faqs" className="mt-6">
          <Card>
            <CardContent className="p-6">
              {renderFAQs()}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default ContentManagementTab;