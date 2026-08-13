import React, { useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  MapPin, 
  TrendingUp, 
  UserPlus,
  Plus,
  Calendar,
  ArrowRight,
  Video,
  BookOpen,
  MessageCircle,
  Clock,
  CheckCircle2,
  Sparkles,
  ClipboardCheck,
  Bell
} from 'lucide-react';
import { 
  getGAPByLider,
  getEscalamientosByUsuario,
  getMiembrosByGAP,
  eventosCalendarioMock,
  materialEnsenanzaMock,
  salasVideollamadaMock,
  notificacionesMock
} from '@/data/mockData';
import { format, parseISO, isToday, isTomorrow, isThisWeek } from 'date-fns';
import { es } from 'date-fns/locale';
import { formatearHora12 } from '@/lib/utils';

interface DashboardLiderGAPProps {
  onNavegar: (vista: string) => void;
}

const DashboardLiderGAP: React.FC<DashboardLiderGAPProps> = ({ onNavegar }) => {
  const { usuario, tema } = useAuth();
  const miGAP = getGAPByLider(usuario?.id || '');
  const miembros = miGAP ? getMiembrosByGAP(miGAP.id) : [];
  const escalamientos = getEscalamientosByUsuario(usuario!);
  const escalamientosPendientes = escalamientos.filter(e => e.estado !== 'Cerrado');
  const notificaciones = notificacionesMock.filter(n => n.usuarioId === usuario?.id && !n.leida);
  
  // Eventos próximos
  const eventosProximos = useMemo(() => {
    const hoy = new Date().toISOString().split('T')[0];
    return eventosCalendarioMock
      .filter(e => e.fecha >= hoy && e.activo)
      .sort((a, b) => a.fecha.localeCompare(b.fecha))
      .slice(0, 3);
  }, []);
  
  // Material de enseñanza reciente
  const materialReciente = useMemo(() => {
    return materialEnsenanzaMock
      .filter(m => m.activo)
      .sort((a, b) => new Date(b.fechaSubida).getTime() - new Date(a.fechaSubida).getTime())
      .slice(0, 2);
  }, []);
  
  // Videollamadas activas del Pastor Principal
  const videollamadasActivas = useMemo(() => {
    return salasVideollamadaMock.filter(s => 
      s.activa && s.iniciadaPorRol === 'pastor_principal'
    );
  }, []);

  const getEventoBadge = (fecha: string) => {
    if (isToday(parseISO(fecha))) return { text: 'Hoy', color: 'bg-red-100 text-red-700' };
    if (isTomorrow(parseISO(fecha))) return { text: 'Mañana', color: 'bg-orange-100 text-orange-700' };
    if (isThisWeek(parseISO(fecha))) return { text: 'Esta semana', color: 'bg-blue-100 text-blue-700' };
    return { text: 'Próximo', color: 'bg-gray-100 text-gray-700' };
  };

  return (
    <div className="px-margin-mobile md:px-margin-desktop max-w-7xl mx-auto mt-gutter animate-fade-in pb-24 lg:pb-6 space-y-gutter">
      {/* Header Personalizado */}
      <div 
        className="rounded-2xl p-6 text-white relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${tema.primario} 0%, ${tema.secundario} 100%)` }}
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative z-10 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-yellow-300" />
              <span className="text-slate-500 text-sm font-medium">Rol: Líder GAP</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold">¡Bienvenido, {usuario?.nombre}!</h2>
            <p className="text-slate-500 mt-1">
              {miGAP ? `${miGAP.codigo} - ${miGAP.barrio}` : 'Sin GAP Asignado'}
            </p>
            
            {miGAP && (
              <div className="flex flex-wrap items-center gap-3 mt-4">
                <Badge className="bg-white/20 text-white border-0">
                  <Clock className="w-3 h-3 mr-1" />
                  {miGAP.diaReunion} {formatearHora12(miGAP.horaReunion)}
                </Badge>
                <Badge className="bg-white/20 text-white border-0">
                  <MapPin className="w-3 h-3 mr-1" />
                  {miGAP.ubicacionReunion}
                </Badge>
              </div>
            )}
          </div>
          <button 
            className="relative w-12 h-12 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
            onClick={() => onNavegar('notificaciones')}
          >
            <Bell className="w-6 h-6 text-white" />
            {notificaciones.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center font-bold">
                {notificaciones.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-500">Integrantes</p>
                <h3 className="text-2xl font-bold mt-1">{miembros.length}</h3>
              </div>
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${tema.primario}20` }}
              >
                <Users className="w-5 h-5" style={{ color: tema.primario }} />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card 
          onClick={() => onNavegar('escalamientos')} 
          className="cursor-pointer hover:shadow-md transition-shadow"
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-500">Casos</p>
                <h3 className="text-2xl font-bold mt-1">{escalamientosPendientes.length}</h3>
              </div>
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${tema.advertencia}20` }}
              >
                <TrendingUp className="w-5 h-5" style={{ color: tema.advertencia }} />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card 
          onClick={() => onNavegar('calendario')}
          className="cursor-pointer hover:shadow-md transition-shadow"
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-500">Eventos</p>
                <h3 className="text-2xl font-bold mt-1">{eventosProximos.length}</h3>
              </div>
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${tema.info}20` }}
              >
                <Calendar className="w-5 h-5" style={{ color: tema.info }} />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-500">Timoteo</p>
                <h3 className="text-2xl font-bold mt-1">1</h3>
              </div>
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${tema.secundario}20` }}
              >
                <UserPlus className="w-5 h-5" style={{ color: tema.secundario }} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Acciones rápidas */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Acciones Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            <Button
              variant="outline"
              className="flex flex-col items-center gap-2 h-auto py-4"
              onClick={() => onNavegar('agregar-integrante')}
            >
              <UserPlus className="w-6 h-6" style={{ color: tema.primario }} />
              <span className="text-xs text-center">Agregar Nuevo Integrante</span>
            </Button>
            
            <Button
              variant="outline"
              className="flex flex-col items-center gap-2 h-auto py-4"
              onClick={() => onNavegar('asistencia')}
            >
              <ClipboardCheck className="w-6 h-6" style={{ color: tema.exito }} />
              <span className="text-xs">Asistencia</span>
            </Button>
            
            <Button
              variant="outline"
              className="flex flex-col items-center gap-2 h-auto py-4"
              onClick={() => onNavegar('crear-escalamiento')}
            >
              <Plus className="w-6 h-6" style={{ color: tema.advertencia }} />
              <span className="text-xs">Nuevo Caso</span>
            </Button>
            
            <Button
              variant="outline"
              className="flex flex-col items-center gap-2 h-auto py-4"
              onClick={() => onNavegar('miembros')}
            >
              <Users className="w-6 h-6" style={{ color: tema.primario }} />
              <span className="text-xs">Ver Integrantes</span>
            </Button>
            
            <Button
              variant="outline"
              className="flex flex-col items-center gap-2 h-auto py-4"
              onClick={() => onNavegar('calendario')}
            >
              <Calendar className="w-6 h-6" style={{ color: tema.info }} />
              <span className="text-xs">Calendario</span>
            </Button>
            
            <Button
              variant="outline"
              className="flex flex-col items-center gap-2 h-auto py-4"
              onClick={() => onNavegar('videollamada')}
            >
              <Video className="w-6 h-6" style={{ color: tema.exito }} />
              <span className="text-xs">Videollamada</span>
            </Button>
            
            <Button
              variant="outline"
              className="flex flex-col items-center gap-2 h-auto py-4"
              onClick={() => onNavegar('ensenanza')}
            >
              <BookOpen className="w-6 h-6" style={{ color: tema.secundario }} />
              <span className="text-xs">Enseñanzas</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Videollamadas Activas del Pastor Principal */}
      {videollamadasActivas.length > 0 && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 text-green-800">
              <Video className="w-5 h-5" />
              Videollamada del Pastor Principal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {videollamadasActivas.map((sala) => (
                <div 
                  key={sala.id} 
                  className="p-4 bg-white rounded-lg border border-green-200 flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium">Videollamada - {sala.gapCodigo}</p>
                    <p className="text-sm text-gray-500">Iniciada por: {sala.iniciadaPorNombre}</p>
                  </div>
                  <Button 
                    className="text-white"
                    style={{ backgroundColor: tema.exito }}
                    onClick={() => onNavegar('videollamada')}
                  >
                    <Video className="w-4 h-4 mr-2" />
                    Unirse
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Eventos Próximos */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="w-5 h-5" style={{ color: tema.primario }} />
                Próximos Eventos
              </CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onNavegar('calendario')}
                className="text-xs"
              >
                Ver todos
                <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {eventosProximos.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                <p className="text-gray-500 text-sm">No hay eventos próximos</p>
              </div>
            ) : (
              <div className="space-y-3">
                {eventosProximos.map((evento) => {
                  const badge = getEventoBadge(evento.fecha);
                  return (
                    <div 
                      key={evento.id} 
                      className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{evento.titulo}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {format(parseISO(evento.fecha), 'EEEE d MMMM', { locale: es })}
                            {evento.hora && ` - ${formatearHora12(evento.hora)}`}
                          </p>
                          {evento.ubicacion && (
                            <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                              <MapPin className="w-3 h-3" />
                              {evento.ubicacion}
                            </p>
                          )}
                        </div>
                        <Badge className={`text-xs ${badge.color}`}>
                          {badge.text}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Material de Enseñanza */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <BookOpen className="w-5 h-5" style={{ color: tema.primario }} />
                Material de Enseñanza
              </CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onNavegar('ensenanza')}
                className="text-xs"
              >
                Ver todos
                <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {materialReciente.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                <p className="text-gray-500 text-sm">No hay material disponible</p>
              </div>
            ) : (
              <div className="space-y-3">
                {materialReciente.map((material) => (
                  <div 
                    key={material.id} 
                    className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={() => onNavegar('ensenanza')}
                  >
                    <div className="flex items-start gap-3">
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${tema.primario}20` }}
                      >
                        <BookOpen className="w-5 h-5" style={{ color: tema.primario }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{material.titulo}</p>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                          {material.descripcion}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {material.tipo}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Peticiones de Oración */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageCircle className="w-5 h-5" style={{ color: tema.primario }} />
              Peticiones de Oración
            </CardTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onNavegar('peticiones-oracion')}
              className="text-xs"
            >
              Ver todas
              <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-gray-50 rounded-lg text-center">
            <MessageCircle className="w-10 h-10 mx-auto text-gray-300 mb-2" />
            <p className="text-sm text-gray-500">Gestiona las peticiones de oración de tu GAP</p>
            <Button 
              className="mt-3 text-white text-sm"
              style={{ backgroundColor: tema.primario }}
              onClick={() => onNavegar('peticiones-oracion')}
            >
              <Plus className="w-4 h-4 mr-2" />
              Nueva Petición
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Información del GAP */}
      {miGAP && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="w-5 h-5" style={{ color: tema.primario }} />
              Información de {miGAP.codigo}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">Día</p>
                <p className="font-semibold">{miGAP.diaReunion}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">Hora</p>
                <p className="font-semibold">{formatearHora12(miGAP.horaReunion)}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">Barrio</p>
                <p className="font-semibold">{miGAP.barrio}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">Timoteo</p>
                <p className="font-semibold">{miGAP.timoteoNombre}</p>
              </div>
            </div>
            
            {miGAP.reunionConfirmada && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-green-800">Reunión confirmada</p>
                  <p className="text-xs text-green-600">
                    {miGAP.fechaReunionConfirmada && format(parseISO(miGAP.fechaReunionConfirmada), 'd MMMM', { locale: es })}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Lista de integrantes */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="w-5 h-5" style={{ color: tema.primario }} />
            Integrantes del GAP
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={() => onNavegar('miembros')}>
            Ver todos
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </CardHeader>
        <CardContent>
          {miembros.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 mx-auto text-gray-300 mb-2" />
              <p className="text-gray-500">No hay integrantes registrados</p>
              <Button 
                className="mt-4 text-white"
                style={{ backgroundColor: tema.primario }}
                onClick={() => onNavegar('agregar-integrante')}
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Agregar Nuevo Integrante
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {miembros.slice(0, 6).map((miembro) => (
                <div 
                  key={miembro.id} 
                  className="p-3 bg-gray-50 rounded-lg flex items-center gap-3 hover:bg-gray-100 transition-colors"
                >
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold"
                    style={{ backgroundColor: tema.primario }}
                  >
                    {miembro.nombres.charAt(0)}{miembro.apellidos.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {miembro.nombres} {miembro.apellidos}
                    </p>
                    <p className="text-xs text-gray-500">{miembro.telefono}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardLiderGAP;




