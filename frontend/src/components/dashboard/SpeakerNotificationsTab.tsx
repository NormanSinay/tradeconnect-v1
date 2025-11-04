import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bell, CheckCircle, AlertCircle, Calendar, DollarSign, Star, Eye, Filter, CheckCheck, Trash2, Settings } from 'lucide-react';
import { SpeakerDashboardService, SpeakerNotification } from '@/services/speakerDashboardService';
import { useSpeakerDashboardState } from '@/hooks/useSpeakerDashboardState';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const SpeakerNotificationsTab: React.FC<{ activeTab: string }> = () => {
  const [notifications, setNotifications] = useState<SpeakerNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [readFilter, setReadFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const { formatDate } = useSpeakerDashboardState();

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const speakerNotifications = await SpeakerDashboardService.getSpeakerNotifications();
      setNotifications(speakerNotifications);
    } catch (error) {
      console.error('Error loading notifications:', error);
      toast.error('Error al cargar notificaciones');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: number) => {
    try {
      await SpeakerDashboardService.markNotificationAsRead(notificationId);
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId ? { ...notif, read: true } : notif
        )
      );
      toast.success('Notificación marcada como leída');
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Error al marcar notificación como leída');
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.read);
      if (unreadNotifications.length > 0) {
        await SpeakerDashboardService.markMultipleNotificationsAsRead(unreadNotifications.map(n => n.id));
        setNotifications(prev =>
          prev.map(notif => ({ ...notif, read: true }))
        );
        toast.success('Todas las notificaciones marcadas como leídas');
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast.error('Error al marcar todas las notificaciones como leídas');
    }
  };

  const filteredNotifications = useMemo(() => {
    return notifications.filter(notification => {
      const matchesType = typeFilter === 'all' || notification.type === typeFilter;
      const matchesRead = readFilter === 'all' ||
        (readFilter === 'read' && notification.read) ||
        (readFilter === 'unread' && !notification.read);
      const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           notification.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (notification.eventTitle && notification.eventTitle.toLowerCase().includes(searchTerm.toLowerCase()));

      return matchesType && matchesRead && matchesSearch;
    });
  }, [notifications, typeFilter, readFilter, searchTerm]);

  const handleQuickAction = async (notification: SpeakerNotification) => {
    try {
      switch (notification.type) {
        case 'event_invitation':
          await SpeakerDashboardService.executeNotificationAction(notification.id, 'view_event', { eventId: notification.eventId });
          toast.success('Redirigiendo a detalles del evento...');
          break;
        case 'event_reminder':
          await SpeakerDashboardService.executeNotificationAction(notification.id, 'acknowledge_reminder');
          markAsRead(notification.id);
          break;
        case 'payment':
          await SpeakerDashboardService.executeNotificationAction(notification.id, 'view_payment');
          toast.success('Redirigiendo a sección de pagos...');
          break;
        case 'evaluation':
          await SpeakerDashboardService.executeNotificationAction(notification.id, 'view_evaluation');
          toast.success('Redirigiendo a evaluaciones...');
          break;
        default:
          markAsRead(notification.id);
      }
    } catch (error) {
      console.error('Error executing notification action:', error);
      toast.error('Error al ejecutar acción');
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'event_invitation':
        return <Calendar className="w-5 h-5 text-blue-600" />;
      case 'event_reminder':
        return <AlertCircle className="w-5 h-5 text-orange-600" />;
      case 'payment':
        return <DollarSign className="w-5 h-5 text-green-600" />;
      case 'evaluation':
        return <Star className="w-5 h-5 text-yellow-600" />;
      default:
        return <Bell className="w-5 h-5 text-purple-600" />;
    }
  };

  const getNotificationBadge = (type: string) => {
    switch (type) {
      case 'event_invitation':
        return <Badge className="bg-blue-100 text-blue-800"><Calendar className="w-3 h-3 mr-1" />Invitación</Badge>;
      case 'event_reminder':
        return <Badge className="bg-orange-100 text-orange-800"><AlertCircle className="w-3 h-3 mr-1" />Recordatorio</Badge>;
      case 'payment':
        return <Badge className="bg-green-100 text-green-800"><DollarSign className="w-3 h-3 mr-1" />Pago</Badge>;
      case 'evaluation':
        return <Badge className="bg-yellow-100 text-yellow-800"><Star className="w-3 h-3 mr-1" />Evaluación</Badge>;
      default:
        return <Badge className="bg-purple-100 text-purple-800"><Bell className="w-3 h-3 mr-1" />Sistema</Badge>;
    }
  };

  const getQuickActionButton = (notification: SpeakerNotification) => {
    const baseClasses = "text-xs px-2 py-1 rounded-md transition-colors";
    switch (notification.type) {
      case 'event_invitation':
        return (
          <Button
            size="sm"
            className={`${baseClasses} bg-blue-100 text-blue-700 hover:bg-blue-200`}
            onClick={() => handleQuickAction(notification)}
          >
            <Eye className="w-3 h-3 mr-1" />
            Ver Evento
          </Button>
        );
      case 'event_reminder':
        return (
          <Button
            size="sm"
            className={`${baseClasses} bg-orange-100 text-orange-700 hover:bg-orange-200`}
            onClick={() => handleQuickAction(notification)}
          >
            <Calendar className="w-3 h-3 mr-1" />
            Ir al Evento
          </Button>
        );
      case 'payment':
        return (
          <Button
            size="sm"
            className={`${baseClasses} bg-green-100 text-green-700 hover:bg-green-200`}
            onClick={() => handleQuickAction(notification)}
          >
            <DollarSign className="w-3 h-3 mr-1" />
            Ver Pago
          </Button>
        );
      case 'evaluation':
        return (
          <Button
            size="sm"
            className={`${baseClasses} bg-yellow-100 text-yellow-700 hover:bg-yellow-200`}
            onClick={() => handleQuickAction(notification)}
          >
            <Star className="w-3 h-3 mr-1" />
            Ver Evaluación
          </Button>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center py-12"
      >
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        <span className="ml-3 text-gray-600">Cargando notificaciones...</span>
      </motion.div>
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
          <h2 className="text-2xl font-bold text-purple-600">Mis Notificaciones</h2>
          <p className="text-gray-600">Mantente al día con tus eventos y actividades</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-600">
            {notifications.filter(n => !n.read).length} sin leer
          </div>
          {notifications.filter(n => !n.read).length > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={markAllAsRead}
              className="border-purple-300 text-purple-700 hover:bg-purple-50"
            >
              <CheckCheck className="w-4 h-4 mr-2" />
              Marcar todas como leídas
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder="Buscar notificaciones..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Todos los tipos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                <SelectItem value="event_invitation">Invitaciones</SelectItem>
                <SelectItem value="event_reminder">Recordatorios</SelectItem>
                <SelectItem value="payment">Pagos</SelectItem>
                <SelectItem value="evaluation">Evaluaciones</SelectItem>
                <SelectItem value="system">Sistema</SelectItem>
              </SelectContent>
            </Select>
            <Select value={readFilter} onValueChange={setReadFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Todos los estados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="unread">Sin leer</SelectItem>
                <SelectItem value="read">Leídas</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => {
                setTypeFilter('all');
                setReadFilter('all');
                setSearchTerm('');
              }}
            >
              <Filter className="w-4 h-4 mr-2" />
              Limpiar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <div className="space-y-4">
        {filteredNotifications.map((notification, index) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <Card
              className={`hover:shadow-lg transition-all duration-200 ${
                !notification.read
                  ? 'border-purple-200 bg-purple-50/50 shadow-sm'
                  : 'hover:border-gray-300'
              }`}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className={`font-semibold text-lg ${
                          !notification.read ? 'text-purple-900' : 'text-gray-900'
                        }`}>
                          {notification.title}
                        </h3>
                        {getNotificationBadge(notification.type)}
                        {!notification.read && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-2 h-2 bg-purple-600 rounded-full"
                          />
                        )}
                      </div>
                      <p className={`text-sm mb-3 leading-relaxed ${
                        !notification.read ? 'text-purple-800' : 'text-gray-700'
                      }`}>
                        {notification.message}
                      </p>
                      {notification.eventTitle && (
                        <div className="flex items-center text-sm text-gray-600 mb-2">
                          <Calendar className="w-4 h-4 mr-2" />
                          <span className="font-medium">Evento:</span>
                          <span className="ml-1 text-purple-600">{notification.eventTitle}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-500">
                          {formatDate(notification.createdAt)}
                        </p>
                        <div className="flex items-center space-x-2">
                          {getQuickActionButton(notification)}
                          {!notification.read && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => markAsRead(notification.id)}
                              className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Marcar como leída
                            </Button>
                          )}
                          {notification.read && (
                            <div className="flex items-center text-green-600 text-sm">
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Leída
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredNotifications.length === 0 && notifications.length > 0 && (
        <div className="text-center py-12">
          <Filter className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No se encontraron notificaciones con los filtros aplicados
          </h3>
          <p className="text-gray-600">
            Intenta ajustar los filtros para ver más notificaciones.
          </p>
        </div>
      )}

      {notifications.length === 0 && (
        <div className="text-center py-12">
          <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No tienes notificaciones
          </h3>
          <p className="text-gray-600">
            Cuando tengas invitaciones, recordatorios o actualizaciones, aparecerán aquí.
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default SpeakerNotificationsTab;