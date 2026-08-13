import React, { useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
  ClipboardCheck,
  Crown,
  UserCheck,
  BarChart3,
  Eye,
  Layers,
  Bell
} from 'lucide-react';
import { 
  getGAPsByLiderMentor,
  getEscalamientosByUsuario,
  getMiembrosByGAP,
  getUsuariosByLiderMentor,
  eventosCalendarioMock,
  materialEnsenanzaMock,
  salasVideollamadaMock,
  gapsMock,
  notificacionesMock
} from '@/data/mockData';
import { format, parseISO, isToday, isTomorrow, isThisWeek } from 'date-fns';
import { es } from 'date-fns/locale';
import { formatearHora12 } from '@/lib/utils';

interface DashboardLiderMentorProps {
  onNavegar: (vista: string) => void;
}

const DashboardLiderMentor: React.FC<DashboardLiderMentorProps> = ({ onNavegar }) => {
  const { usuario, tema } = useAuth();
  const notificaciones = notificacionesMock.filter(n => n.usuarioId === usuario?.id && !n.leida);
  
  // Obtener GAPs bajo la responsabilidad del lÃ­der mentor
  const misGAPs = useMemo(() => {
    if (!usuario) return [];
    return getGAPsByLiderMentor(usuario.id);
  }, [usuario]);
  
  // Obtener lÃ­deres y timoteos bajo su supervisiÃ³n
  const misLideres = useMemo(() => {
    if (!usuario) return [];
    return getUsuariosByLiderMentor(usuario.id).filter(u => u.rol === 'lider_gap');
  }, [usuario]);
  
  const misTimoteos = useMemo(() => {
    if (!usuario) return [];
    return misGAPs.map(gap => {
      const timoteo = gapsMock.find(g => g.id === gap.id);
      return timoteo ? { id: timoteo.timoteoId, nombre: timoteo.timoteoNombre } : null;
    }).filter(Boolean);
  }, [misGAPs]);
  
  // Contar total de integrantes en todos sus GAPs
  const totalIntegrantes = useMemo(() => {
    return misGAPs.reduce((total, gap) => {
      return total + getMiembrosByGAP(gap.id).length;
    }, 0);
  }, [misGAPs]);
  
  // Escalamientos de sus GAPs
  const escalamientos = useMemo(() => {
    if (!usuario) return [];
    return getEscalamientosByUsuario(usuario);
  }, [usuario]);
  
  const escalamientosPendientes = escalamientos.filter(e => e.estado !== 'Cerrado');
  
  // Eventos prÃ³ximos
  const eventosProximos = useMemo(() => {
    const hoy = new Date().toISOString().split('T')[0];
    return eventosCalendarioMock
      .filter(e => e.fecha >= hoy && e.activo)
      .sort((a, b) => a.fecha.localeCompare(b.fecha))
      .slice(0, 4);
  }, []);
  
  // Material de enseÃ±anza reciente
  const materialReciente = useMemo(() => {
    return materialEnsenanzaMock
      .filter(m => m.activo)
      .sort((a, b) => new Date(b.fechaSubida).getTime() - new Date(a.fechaSubida).getTime())
      .slice(0, 3);
  }, []);
  
  // Videollamadas activas del Pastor Principal
  const videollamadasActivas = useMemo(() => {
    return salasVideollamadaMock.filter(s => 
      s.activa && s.iniciadaPorRol === 'pastor_principal'
    );
  }, []);

  const getEventoBadge = (fecha: string) => {
    if (isToday(parseISO(fecha))) return { text: 'Hoy', color: 'bg-red-100 text-red-700' };
    if (isTomorrow(parseISO(fecha))) return { text: 'MaÃ±ana', color: 'bg-orange-100 text-orange-700' };
    if (isThisWeek(parseISO(fecha))) return { text: 'Esta semana', color: 'bg-blue-100 text-blue-700' };
    return { text: 'PrÃ³ximo', color: 'bg-gray-100 text-gray-700' };
  };

  // Calcular progreso de asistencia promedio de sus GAPs
  const progresoAsistencia = 85;
  console.log('Progreso asistencia:', progresoAsistencia); // Usar la variable

  return (
    <div className="p-4 sm:p-6 space-y-6 animate-fade-in pb-24 lg:pb-6">
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
              <Crown className="w-5 h-5 text-yellow-300" />
              <span className="text-slate-500 text-sm font-medium">Rol: LÃ­der Mentor</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold">Â¡Bienvenido, {usuario?.nombre}!</h2>
            <p className="text-slate-500 mt-1">
              Supervisando {misGAPs.length} GAP{misGAPs.length !== 1 ? 's' : ''} â€¢ {misLideres.length} LÃ­der{misLideres.length !== 1 ? 'es' : ''} â€¢ {misTimoteos.length} Timoteo{misTimoteos.length !== 1 ? 's' : ''}
            </p>
            
            <div className="flex flex-wrap items-center gap-3 mt-4">
              <Badge className="bg-white/20 text-white border-0">
                <Layers className="w-3 h-3 mr-1" />
                {misGAPs.length} GAPs
              </Badge>
              <Badge className="bg-white/20 text-white border-0">
                <Users className="w-3 h-3 mr-1" />
                {totalIntegrantes} Integrantes
              </Badge>
            </div>
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

      {/* EstadÃ­sticas Principales */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-500">GAPs</p>
                <h3 className="text-2xl font-bold mt-1">{misGAPs.length}</h3>
              </div>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${tema.primario}20` }}>
                <MapPin className="w-5 h-5" style={{ color: tema.primario }} />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-500">LÃ­deres</p>
                <h3 className="text-2xl font-bold mt-1">{misLideres.length}</h3>
              </div>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${tema.exito}20` }}>
                <UserCheck className="w-5 h-5" style={{ color: tema.exito }} />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-500">Timoteos</p>
                <h3 className="text-2xl font-bold mt-1">{misTimoteos.length}</h3>
              </div>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${tema.secundario}20` }}>
                <UserPlus className="w-5 h-5" style={{ color: tema.secundario }} />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-500">Integrantes</p>
                <h3 className="text-2xl font-bold mt-1">{totalIntegrantes}</h3>
              </div>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${tema.info}20` }}>
                <Users className="w-5 h-5" style={{ color: tema.info }} />
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
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${tema.advertencia}20` }}>
                <TrendingUp className="w-5 h-5" style={{ color: tema.advertencia }} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Acciones rÃ¡pidas */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Acciones RÃ¡pidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            <Button
              variant="outline"
              className="flex flex-col items-center gap-2 h-auto py-4"
              onClick={() => onNavegar('agregar-integrante')}
            >
              <UserPlus className="w-6 h-6" style={{ color: tema.primario }} />
              <span className="text-xs text-center">Agregar Integrante</span>
            </Button>
            
            <Button
              variant="outline"
              className="flex flex-col items-center gap-2 h-auto py-4"
              onClick={() => onNavegar('crear-usuario')}
            >
              <Crown className="w-6 h-6" style={{ color: tema.exito }} />
              <span className="text-xs text-center">Crear LÃ­der</span>
            </Button>
            
            <Button
              variant="outline"
              className="flex flex-col items-center gap-2 h-auto py-4"
              onClick={() => onNavegar('crear-usuario')}
            >
              <UserCheck className="w-6 h-6" style={{ color: tema.secundario }} />
              <span className="text-xs text-center">Crear Timoteo</span>
            </Button>
            
            <Button
              variant="outline"
              className="flex flex-col items-center gap-2 h-auto py-4"
              onClick={() => onNavegar('miembros')}
            >
              <Eye className="w-6 h-6" style={{ color: tema.primario }} />
              <span className="text-xs">Ver Integrantes</span>
            </Button>
            
            <Button
              variant="outline"
              className="flex flex-col items-center gap-2 h-auto py-4"
              onClick={() => onNavegar('supervision')}
            >
              <BarChart3 className="w-6 h-6" style={{ color: tema.info }} />
              <span className="text-xs">Supervisar</span>
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
              <span className="text-xs">Video</span>
            </Button>
            
            <Button
              variant="outline"
              className="flex flex-col items-center gap-2 h-auto py-4"
              onClick={() => onNavegar('ensenanza')}
            >
              <BookOpen className="w-6 h-6" style={{ color: tema.secundario }} />
              <span className="text-xs">Material</span>
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

      {/* Mi Estructura - SupervisiÃ³n */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Layers className="w-5 h-5" style={{ color: tema.primario }} />
              Mi Estructura de SupervisiÃ³n
            </CardTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onNavegar('gaps')}
              className="text-xs"
            >
              Ver detalle
              <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {misGAPs.length === 0 ? (
            <div className="text-center py-8">
              <Layers className="w-12 h-12 mx-auto text-gray-300 mb-2" />
              <p className="text-gray-500">No tienes GAPs asignados</p>
            </div>
          ) : (
            <div className="space-y-4">
              {misGAPs.map((gap) => {
                const integrantesGAP = getMiembrosByGAP(gap.id);
                return (
                  <div 
                    key={gap.id} 
                    className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={() => onNavegar('gaps')}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{gap.codigo}</h3>
                          <Badge variant="outline" className="text-xs">
                            {integrantesGAP.length} integrantes
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm text-gray-600">
                          <div>
                            <span className="text-gray-400">LÃ­der:</span> {gap.liderGapNombre}
                          </div>
                          <div>
                            <span className="text-gray-400">Timoteo:</span> {gap.timoteoNombre}
                          </div>
                          <div>
                            <span className="text-gray-400">DÃ­a:</span> {gap.diaReunion}
                          </div>
                          <div>
                            <span className="text-gray-400">Barrio:</span> {gap.barrio}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <p className="text-xs text-gray-400">Asistencia</p>
                          <p className="font-semibold" style={{ color: tema.exito }}>85%</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Eventos PrÃ³ximos */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="w-5 h-5" style={{ color: tema.primario }} />
                PrÃ³ximos Eventos
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
                <p className="text-gray-500 text-sm">No hay eventos prÃ³ximos</p>
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

        {/* Material de EnseÃ±anza */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <BookOpen className="w-5 h-5" style={{ color: tema.primario }} />
                Material de EnseÃ±anza
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

      {/* Peticiones de OraciÃ³n */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageCircle className="w-5 h-5" style={{ color: tema.primario }} />
              Peticiones de OraciÃ³n
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
            <p className="text-sm text-gray-500">Gestiona las peticiones de oraciÃ³n de tus GAPs</p>
            <Button 
              className="mt-3 text-white text-sm"
              style={{ backgroundColor: tema.primario }}
              onClick={() => onNavegar('peticiones-oracion')}
            >
              <Plus className="w-4 h-4 mr-2" />
              Nueva PeticiÃ³n
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Resumen de Asistencia */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5" style={{ color: tema.primario }} />
            Resumen de Asistencia de mis GAPs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg text-center">
              <p className="text-3xl font-bold" style={{ color: tema.exito }}>85%</p>
              <p className="text-sm text-gray-500">Promedio de Asistencia</p>
              <Progress value={85} className="mt-2 h-2" />
            </div>
            <div className="p-4 bg-gray-50 rounded-lg text-center">
              <p className="text-3xl font-bold" style={{ color: tema.primario }}>12</p>
              <p className="text-sm text-gray-500">Reuniones este mes</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg text-center">
              <p className="text-3xl font-bold" style={{ color: tema.secundario }}>5</p>
              <p className="text-sm text-gray-500">Nuevos integrantes</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardLiderMentor;



