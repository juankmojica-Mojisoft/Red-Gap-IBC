import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Bell, 
  CheckCircle, 
  AlertCircle, 
  Info,
  Trash2,
  CheckCheck,
  ArrowLeft
} from 'lucide-react';
import { notificacionesMock } from '@/data/mockData';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Notificacion {
  id: string;
  usuarioId: string;
  tipo: 'info' | 'success' | 'warning' | 'error';
  titulo: string;
  mensaje: string;
  fecha: string;
  leida: boolean;
  accion?: string;
}

interface NotificacionesModuleProps {
  onVolver?: () => void;
}

const NotificacionesModule: React.FC<NotificacionesModuleProps> = ({ onVolver }) => {
  const { usuario, tema } = useAuth();
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>(
    notificacionesMock.filter(n => n.usuarioId === usuario?.id)
  );
  const [filtro, setFiltro] = useState<'todas' | 'no-leidas' | 'leidas'>('todas');

  const notificacionesFiltradas = notificaciones.filter(n => {
    if (filtro === 'no-leidas') return !n.leida;
    if (filtro === 'leidas') return n.leida;
    return true;
  });

  const marcarComoLeida = (id: string) => {
    setNotificaciones(notificaciones.map(n => 
      n.id === id ? { ...n, leida: true } : n
    ));
  };

  const marcarTodasComoLeidas = () => {
    setNotificaciones(notificaciones.map(n => ({ ...n, leida: true })));
  };

  const eliminarNotificacion = (id: string) => {
    setNotificaciones(notificaciones.filter(n => n.id !== id));
  };

  const getIconoPorTipo = (tipo: string) => {
    switch (tipo) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'info':
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getColorPorTipo = (tipo: string) => {
    switch (tipo) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'info':
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  const noLeidas = notificaciones.filter(n => !n.leida).length;

  return (
    <div className="space-y-6 pb-24 lg:pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          {onVolver && (
            <Button variant="ghost" size="icon" onClick={onVolver} className="text-gray-500 hover:text-gray-700">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          )}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Bell className="w-6 h-6" style={{ color: tema.primario }} />
              Notificaciones
            </h2>
            <p className="text-gray-500">
              {noLeidas > 0 ? `Tienes ${noLeidas} notificación${noLeidas !== 1 ? 'es' : ''} sin leer` : 'No tienes notificaciones pendientes'}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={marcarTodasComoLeidas}
            disabled={noLeidas === 0}
          >
            <CheckCheck className="w-4 h-4 mr-2" />
            Marcar todas como leídas
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-2">
        <Button
          variant={filtro === 'todas' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFiltro('todas')}
          style={filtro === 'todas' ? { backgroundColor: tema.primario } : {}}
          className={filtro === 'todas' ? 'text-white' : ''}
        >
          Todas ({notificaciones.length})
        </Button>
        <Button
          variant={filtro === 'no-leidas' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFiltro('no-leidas')}
          style={filtro === 'no-leidas' ? { backgroundColor: tema.primario } : {}}
          className={filtro === 'no-leidas' ? 'text-white' : ''}
        >
          No leídas ({noLeidas})
        </Button>
        <Button
          variant={filtro === 'leidas' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFiltro('leidas')}
          style={filtro === 'leidas' ? { backgroundColor: tema.primario } : {}}
          className={filtro === 'leidas' ? 'text-white' : ''}
        >
          Leídas ({notificaciones.filter(n => n.leida).length})
        </Button>
      </div>

      {/* Lista de notificaciones */}
      <div className="space-y-3">
        {notificacionesFiltradas.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Bell className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No hay notificaciones</p>
            </CardContent>
          </Card>
        ) : (
          notificacionesFiltradas.map((notificacion) => (
            <Card 
              key={notificacion.id}
              className={`${getColorPorTipo(notificacion.tipo)} ${!notificacion.leida ? 'border-l-4 border-l-blue-500' : ''}`}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    {getIconoPorTipo(notificacion.tipo)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className={`font-semibold ${!notificacion.leida ? 'text-gray-900' : 'text-gray-600'}`}>
                        {notificacion.titulo}
                      </h3>
                      {!notificacion.leida && (
                        <Badge className="bg-blue-100 text-blue-800 text-xs">Nueva</Badge>
                      )}
                    </div>
                    <p className={`text-sm ${!notificacion.leida ? 'text-gray-700' : 'text-gray-500'}`}>
                      {notificacion.mensaje}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      {format(new Date(notificacion.fecha), 'dd MMMM yyyy - HH:mm', { locale: es })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {!notificacion.leida && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => marcarComoLeida(notificacion.id)}
                      >
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => eliminarNotificacion(notificacion.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificacionesModule;
