import React, { useState, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  MapPin, 
  Calendar,
  ClipboardCheck,
  BookOpen,
  Video,
  MessageSquare,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Target,
  Bell
} from 'lucide-react';
import { 
  getGAPByTimoteo,
  getMiembrosByGAP,
  getAsistenciasByGAP,
  eventosMock,
  materialesEnsenanzaMock,
  notificacionesMock
} from '@/data/mockData';
import { subWeeks, format, parseISO, isToday, isTomorrow, isThisWeek } from 'date-fns';
import { es } from 'date-fns/locale';
import { formatearHora12 } from '@/lib/utils';

interface DashboardTimoteoProps {
  onNavegar: (vista: string) => void;
}

const DashboardTimoteo: React.FC<DashboardTimoteoProps> = ({ onNavegar }) => {
  const { usuario, tema } = useAuth();
  const miGAP = getGAPByTimoteo(usuario?.id || '');
  const miembros = miGAP ? getMiembrosByGAP(miGAP.id) : [];
  const asistencias = miGAP ? getAsistenciasByGAP(miGAP.id) : [];
  const notificaciones = notificacionesMock.filter(n => n.usuarioId === usuario?.id && !n.leida);
  
  // Estado para tareas del timoteo
  const [tareas, setTareas] = useState([
    { id: 1, titulo: 'Confirmar asistencia para reunión', completada: false, prioridad: 'alta' },
    { id: 2, titulo: 'Preparar material de enseñanza', completada: true, prioridad: 'media' },
    { id: 3, titulo: 'Contactar miembros ausentes', completada: false, prioridad: 'media' },
    { id: 4, titulo: 'Enviar recordatorio de reunión', completada: false, prioridad: 'baja' },
  ]);

  // Estadísticas de asistencia
  const estadisticasAsistencia = useMemo(() => {
    if (!miGAP || asistencias.length === 0) return null;
    
    const ultimas4Semanas = asistencias.filter(a => {
      const fechaRegistro = new Date(a.fecha);
      const hace4Semanas = subWeeks(new Date(), 4);
      return fechaRegistro >= hace4Semanas;
    });
    
    const totalAsistencias = ultimas4Semanas.reduce((sum, r) => sum + r.totalAsistentes, 0);
    const promedioAsistencia = ultimas4Semanas.length > 0 
      ? Math.round(totalAsistencias / ultimas4Semanas.length) 
      : 0;
    
    const totalMiembros = miembros.length + 2; // +2 por líder y timoteo
    const porcentajeAsistencia = totalMiembros > 0 
      ? Math.round((promedioAsistencia / totalMiembros) * 100) 
      : 0;

    return {
      promedioAsistencia,
      porcentajeAsistencia,
      totalReuniones: ultimas4Semanas.length,
      nuevosUltimoMes: ultimas4Semanas.reduce((sum, r) => sum + r.nuevosMiembros, 0),
      visitantesUltimoMes: ultimas4Semanas.reduce((sum, r) => sum + r.visitantes, 0),
    };
  }, [miGAP, asistencias, miembros.length]);

  // Eventos próximos
  const eventosProximos = useMemo(() => {
    const hoy = new Date().toISOString().split('T')[0];
    return eventosMock
      .filter(e => e.fecha >= hoy && e.activo)
      .sort((a, b) => a.fecha.localeCompare(b.fecha))
      .slice(0, 3);
  }, []);

  // Material de enseñanza más reciente
  const materialReciente = useMemo(() => {
    return materialesEnsenanzaMock
      .filter(m => m.activo)
      .sort((a, b) => new Date(b.fechaSubida).getTime() - new Date(a.fechaSubida).getTime())
      .slice(0, 2);
  }, []);

  const toggleTarea = (id: number) => {
    setTareas(prev => prev.map(t => 
      t.id === id ? { ...t, completada: !t.completada } : t
    ));
  };

  const getPrioridadColor = (prioridad: string) => {
    switch (prioridad) {
      case 'alta': return 'bg-red-100 text-red-700 border-red-300';
      case 'media': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'baja': return 'bg-green-100 text-green-700 border-green-300';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getEventoBadge = (fecha: string) => {
    if (isToday(parseISO(fecha))) return { text: 'Hoy', color: 'bg-red-100 text-red-700' };
    if (isTomorrow(parseISO(fecha))) return { text: 'Mañana', color: 'bg-orange-100 text-orange-700' };
    if (isThisWeek(parseISO(fecha))) return { text: 'Esta semana', color: 'bg-blue-100 text-blue-700' };
    return { text: 'Próximo', color: 'bg-gray-100 text-gray-700' };
  };

  const tareasCompletadas = tareas.filter(t => t.completada).length;
  const progresoTareas = tareas.length > 0 ? (tareasCompletadas / tareas.length) * 100 : 0;

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
              <Sparkles className="w-5 h-5 text-yellow-300" />
              <span className="text-white/80 text-sm font-medium">Rol: Timoteo</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold">¡Hola, {usuario?.nombre}!</h2>
            <p className="text-white/80 mt-1">
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

      {/* Estadísticas Rápidas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-500">Miembros</p>
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

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-500">Asistencia</p>
                <h3 className="text-2xl font-bold mt-1">
                  {estadisticasAsistencia?.porcentajeAsistencia || 0}%
                </h3>
              </div>
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${tema.exito}20` }}
              >
                <TrendingUp className="w-5 h-5" style={{ color: tema.exito }} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-500">Tareas</p>
                <h3 className="text-2xl font-bold mt-1">{tareasCompletadas}/{tareas.length}</h3>
              </div>
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${tema.secundario}20` }}
              >
                <CheckCircle2 className="w-5 h-5" style={{ color: tema.secundario }} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
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
      </div>

      {/* Acciones Rápidas */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="w-5 h-5" style={{ color: tema.primario }} />
            Acciones Rápidas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <Button
              variant="outline"
              className="flex flex-col items-center gap-2 h-auto py-4 hover:border-primary hover:bg-primary/5"
              onClick={() => onNavegar('asistencia')}
              style={{ '--tw-border-opacity': 1 } as React.CSSProperties}
            >
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${tema.primario}20` }}
              >
                <ClipboardCheck className="w-5 h-5" style={{ color: tema.primario }} />
              </div>
              <span className="text-xs font-medium">Tomar Asistencia</span>
            </Button>

            <Button
              variant="outline"
              className="flex flex-col items-center gap-2 h-auto py-4"
              onClick={() => onNavegar('ensenanza')}
            >
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${tema.secundario}20` }}
              >
                <BookOpen className="w-5 h-5" style={{ color: tema.secundario }} />
              </div>
              <span className="text-xs font-medium">Material</span>
            </Button>

            <Button
              variant="outline"
              className="flex flex-col items-center gap-2 h-auto py-4"
              onClick={() => onNavegar('calendario')}
            >
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${tema.info}20` }}
              >
                <Calendar className="w-5 h-5" style={{ color: tema.info }} />
              </div>
              <span className="text-xs font-medium">Calendario</span>
            </Button>

            <Button
              variant="outline"
              className="flex flex-col items-center gap-2 h-auto py-4"
              onClick={() => onNavegar('videollamada')}
            >
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${tema.advertencia}20` }}
              >
                <Video className="w-5 h-5" style={{ color: tema.advertencia }} />
              </div>
              <span className="text-xs font-medium">Videollamada</span>
            </Button>

            <Button
              variant="outline"
              className="flex flex-col items-center gap-2 h-auto py-4"
              onClick={() => onNavegar('mensajes')}
            >
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${tema.primario}20` }}
              >
                <MessageSquare className="w-5 h-5" style={{ color: tema.primario }} />
              </div>
              <span className="text-xs font-medium">Mensajes</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tareas del Timoteo */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" style={{ color: tema.primario }} />
                Mis Tareas
              </CardTitle>
              <Badge variant="outline" className="text-xs">
                {tareasCompletadas}/{tareas.length}
              </Badge>
            </div>
            <Progress value={progresoTareas} className="h-2 mt-2" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {tareas.map((tarea) => (
                <div 
                  key={tarea.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer ${
                    tarea.completada ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-200 hover:border-primary'
                  }`}
                  onClick={() => toggleTarea(tarea.id)}
                >
                  <div 
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                      tarea.completada 
                        ? 'bg-primary border-primary' 
                        : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: tarea.completada ? tema.primario : undefined }}
                  >
                    {tarea.completada && <CheckCircle2 className="w-3 h-3 text-white" />}
                  </div>
                  <span className={`flex-1 text-sm ${tarea.completada ? 'line-through text-gray-400' : ''}`}>
                    {tarea.titulo}
                  </span>
                  <Badge className={`text-xs ${getPrioridadColor(tarea.prioridad)}`}>
                    {tarea.prioridad}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Material de Enseñanza Reciente */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <BookOpen className="w-5 h-5" style={{ color: tema.primario }} />
                Material de Apoyo
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
                          <span className="text-xs text-gray-400">
                            {material.paraFrecuencia}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Información del GAP */}
        {miGAP && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="w-5 h-5" style={{ color: tema.primario }} />
                Mi GAP
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">Código</p>
                  <p className="font-semibold">{miGAP.codigo}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">Día</p>
                  <p className="font-semibold">{miGAP.diaReunion}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">Hora</p>
                  <p className="font-semibold">{formatearHora12(miGAP.horaReunion)}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">Modalidad</p>
                  <p className="font-semibold">{miGAP.modalidad}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg col-span-2">
                  <p className="text-xs text-gray-500">Líder del GAP</p>
                  <p className="font-semibold">{miGAP.liderGapNombre}</p>
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
      </div>

      {/* Alertas y Recordatorios */}
      {(!miGAP?.reunionConfirmada) && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-orange-800">Recordatorio importante</p>
                <p className="text-sm text-orange-600 mt-1">
                  No olvides confirmar la asistencia para la próxima reunión del GAP.
                </p>
                <Button 
                  size="sm" 
                  className="mt-3 bg-orange-600 hover:bg-orange-700 text-white"
                  onClick={() => onNavegar('asistencia')}
                >
                  Confirmar Asistencia
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de Miembros */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="w-5 h-5" style={{ color: tema.primario }} />
            Miembros del GAP
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onNavegar('miembros')}
          >
            Ver todos
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </CardHeader>
        <CardContent>
          {miembros.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 mx-auto text-gray-300 mb-2" />
              <p className="text-gray-500">No hay miembros registrados</p>
              <p className="text-sm text-gray-400 mt-2">
                Contacta a tu líder para agregar miembros al GAP
              </p>
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

export default DashboardTimoteo;
