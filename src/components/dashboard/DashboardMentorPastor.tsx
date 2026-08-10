import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  MapPin, 
  TrendingUp, 
  Plus,
  ArrowRight,
  Network,
  BookOpen,
  Calendar,
  Eye,
  CheckCircle,
  AlertCircle,
  UserPlus,
  Video,
  Bell,
  Phone,
  Clock,
  MapPin as MapPinIcon
} from 'lucide-react';
import { 
  getGAPsByPastor,
  getEscalamientosByUsuario,
  miembrosMock,
  notificacionesMock
} from '@/data/mockData';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import { formatearHora12 } from '@/lib/utils';

interface DashboardMentorPastorProps {
  onNavegar: (vista: string) => void;
}

interface Evento {
  id: string;
  titulo: string;
  descripcion?: string;
  fecha: string;
  hora?: string;
  tipo: string;
  prioridad: string;
  creadorRol: string;
  creadorNombre?: string;
  ubicacion?: string;
}

// Mock de eventos del pastor y pastor principal
const eventosMock: Evento[] = [
  {
    id: 'evt1',
    titulo: 'Reunión de Líderes',
    descripcion: 'Reunión mensual con todos los líderes de GAPs para revisar estadísticas y planificar actividades.',
    fecha: '2026-03-20',
    hora: '19:00',
    tipo: 'Reunion',
    prioridad: 'Alta',
    creadorRol: 'pastor',
    creadorNombre: 'Pedro Sánchez',
    ubicacion: 'Sala de Conferencias IBC',
  },
  {
    id: 'evt2',
    titulo: 'Cumpleaños - Juan Pérez',
    descripcion: 'Celebración de cumpleaños del líder del GAP-1.',
    fecha: '2026-03-25',
    tipo: 'Cumpleaños',
    prioridad: 'Media',
    creadorRol: 'pastor',
    creadorNombre: 'Pedro Sánchez',
  },
  {
    id: 'evt3',
    titulo: 'Conferencia Anual IBC',
    descripcion: 'Evento anual de la iglesia con invitados especiales. Todos los GAPs deben asistir.',
    fecha: '2026-03-28',
    hora: '09:00',
    tipo: 'Evento',
    prioridad: 'Alta',
    creadorRol: 'pastor_principal',
    creadorNombre: 'Carlos Martínez',
    ubicacion: 'Auditorio Principal IBC',
  },
  {
    id: 'evt4',
    titulo: 'Taller de Liderazgo',
    descripcion: 'Capacitación para nuevos líderes y timoteos.',
    fecha: '2026-03-15',
    hora: '15:00',
    tipo: 'Actividad',
    prioridad: 'Media',
    creadorRol: 'pastor',
    creadorNombre: 'Pedro Sánchez',
    ubicacion: 'Salón 201',
  },
];

// Mock de videollamadas activas
const videollamadasMock = [
  {
    id: 'vid1',
    gapCodigo: 'GAP-1',
    estado: 'activa',
    participantes: 5,
  },
];

const DashboardMentorPastor: React.FC<DashboardMentorPastorProps> = ({ onNavegar }) => {
  const { usuario, tema } = useAuth();
  const misGAPs = getGAPsByPastor(usuario?.id || '');
  const escalamientos = getEscalamientosByUsuario(usuario!);
  const escalamientosPendientes = escalamientos.filter(e => e.estado !== 'Cerrado');
  const notificaciones = notificacionesMock.filter(n => n.usuarioId === usuario?.id && !n.leida);
  
  const [dialogoEventoAbierto, setDialogoEventoAbierto] = useState(false);
  const [dialogoDetalleEventoAbierto, setDialogoDetalleEventoAbierto] = useState(false);
  const [eventosDiaSeleccionado, setEventosDiaSeleccionado] = useState<Evento[]>([]);
  const [dialogoCasoAbierto, setDialogoCasoAbierto] = useState(false);
  const [casoSeleccionado, setCasoSeleccionado] = useState<any>(null);
  const [dialogoVideollamadaAbierto, setDialogoVideollamadaAbierto] = useState(false);
  const [mesActual, setMesActual] = useState(new Date());
  
  const [nuevoEvento, setNuevoEvento] = useState({
    titulo: '',
    descripcion: '',
    fecha: '',
    hora: '',
    tipo: 'Evento',
    prioridad: 'Media',
  });

  // Calcular estadísticas de miembros
  const totalMiembros = misGAPs.reduce((acc, g) => {
    const miembrosGAP = miembrosMock.filter(m => m.gapId === g.id).length;
    return acc + miembrosGAP + 2;
  }, 0);

  const todosLosMiembros = misGAPs.flatMap(gap => 
    miembrosMock.filter(m => m.gapId === gap.id)
  );
  const bautizados = todosLosMiembros.filter(m => m.esBautizado).length;
  const miembrosIBC = todosLosMiembros.filter(m => m.esMiembroIBC).length;
  const graduadosEFC = todosLosMiembros.filter(m => m.escuelaFormacion === 'Graduado').length;

  // Calendario
  const diasMes = eachDayOfInterval({
    start: startOfMonth(mesActual),
    end: endOfMonth(mesActual),
  });

  const getEventosDia = (dia: Date) => {
    return eventosMock.filter(e => isSameDay(new Date(e.fecha), dia));
  };

  const getColorPrioridad = (prioridad: string, creadorRol: string) => {
    if (creadorRol === 'pastor_principal') return 'bg-red-500';
    if (prioridad === 'Alta') return 'bg-orange-500';
    if (prioridad === 'Media') return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getBadgeColorPrioridad = (prioridad: string, creadorRol: string) => {
    if (creadorRol === 'pastor_principal') return 'bg-red-100 text-red-800 border-red-200';
    if (prioridad === 'Alta') return 'bg-orange-100 text-orange-800 border-orange-200';
    if (prioridad === 'Media') return 'bg-blue-100 text-blue-800 border-blue-200';
    return 'bg-green-100 text-green-800 border-green-200';
  };

  const abrirDetalleCaso = (caso: any) => {
    setCasoSeleccionado(caso);
    setDialogoCasoAbierto(true);
  };

  const handleDiaClick = (dia: Date) => {
    const eventos = getEventosDia(dia);
    if (eventos.length > 0) {
      setEventosDiaSeleccionado(eventos);
      setDialogoDetalleEventoAbierto(true);
    } else {
      setDialogoEventoAbierto(true);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 animate-fade-in pb-24 lg:pb-6">
      {/* Header con notificaciones */}
      <div 
        className="rounded-2xl p-6 text-white relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${tema.primario} 0%, ${tema.secundario} 100%)` }}
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative z-10 flex items-start justify-between">
          <div>
            <p className="text-white/80 text-sm mb-1">Pastor - Sistema GAP</p>
            <h2 className="text-2xl sm:text-3xl font-bold">¡Bienvenido, {usuario?.nombre}!</h2>
            <p className="text-white/80 mt-2">
              {misGAPs.length} GAPs • {totalMiembros} integrantes
            </p>
          </div>
          <div className="flex items-center gap-3">
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
      </div>

      {/* Estadísticas principales */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card onClick={() => onNavegar('gaps')} className="cursor-pointer hover:shadow-lg transition-shadow border-l-4" style={{ borderLeftColor: tema.primario }}>
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Mis GAPs</p>
                <h3 className="text-3xl font-bold mt-1">{misGAPs.length}</h3>
              </div>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${tema.primario}15` }}>
                <MapPin className="w-6 h-6" style={{ color: tema.primario }} />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card onClick={() => onNavegar('ver-integrantes')} className="cursor-pointer hover:shadow-lg transition-shadow border-l-4" style={{ borderLeftColor: '#22c55e' }}>
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Integrantes</p>
                <h3 className="text-3xl font-bold mt-1">{totalMiembros}</h3>
              </div>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-green-50">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card onClick={() => onNavegar('escalamientos')} className="cursor-pointer hover:shadow-lg transition-shadow border-l-4" style={{ borderLeftColor: '#f59e0b' }}>
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Casos Pendientes</p>
                <h3 className="text-3xl font-bold mt-1">{escalamientosPendientes.length}</h3>
              </div>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-amber-50">
                <TrendingUp className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-lg transition-shadow border-l-4 border-l-red-500" onClick={() => setDialogoVideollamadaAbierto(true)}>
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Videollamada</p>
                <h3 className="text-lg font-bold mt-1">Iniciar Llamada</h3>
              </div>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-red-50">
                <Video className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Acciones rápidas - Solo 6 opciones para Pastor */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Plus className="w-5 h-5" style={{ color: tema.primario }} />
            Acciones Rápidas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <Button
              variant="outline"
              className="flex flex-col items-center gap-2 h-auto py-4 hover:border-blue-300 hover:bg-blue-50 transition-all"
              onClick={() => onNavegar('ver-integrantes')}
            >
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Eye className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-xs font-medium">Ver Integrantes</span>
            </Button>
            <Button
              variant="outline"
              className="flex flex-col items-center gap-2 h-auto py-4 hover:border-purple-300 hover:bg-purple-50 transition-all"
              onClick={() => onNavegar('red-gap')}
            >
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Network className="w-5 h-5 text-purple-600" />
              </div>
              <span className="text-xs font-medium">Mi Red GAP</span>
            </Button>
            <Button
              variant="outline"
              className="flex flex-col items-center gap-2 h-auto py-4 hover:border-green-300 hover:bg-green-50 transition-all"
              onClick={() => onNavegar('crear-gap')}
            >
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-xs font-medium">Crear GAP</span>
            </Button>
            <Button
              variant="outline"
              className="flex flex-col items-center gap-2 h-auto py-4 hover:border-orange-300 hover:bg-orange-50 transition-all"
              onClick={() => onNavegar('crear-usuario')}
            >
              <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                <UserPlus className="w-5 h-5 text-orange-600" />
              </div>
              <span className="text-xs font-medium">Crear Líder GAP</span>
            </Button>
            <Button
              variant="outline"
              className="flex flex-col items-center gap-2 h-auto py-4 hover:border-cyan-300 hover:bg-cyan-50 transition-all"
              onClick={() => setDialogoEventoAbierto(true)}
            >
              <div className="w-10 h-10 rounded-lg bg-cyan-100 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-cyan-600" />
              </div>
              <span className="text-xs font-medium">Agregar Evento</span>
            </Button>
            <Button
              variant="outline"
              className="flex flex-col items-center gap-2 h-auto py-4 hover:border-indigo-300 hover:bg-indigo-50 transition-all"
              onClick={() => onNavegar('ensenanza-pastor')}
            >
              <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-indigo-600" />
              </div>
              <span className="text-xs font-medium">Enseñanza</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Calendario Interactivo Mejorado */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="w-5 h-5" style={{ color: tema.primario }} />
            Calendario de Eventos
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setMesActual(subMonths(mesActual, 1))}>
              ←
            </Button>
            <span className="font-medium min-w-[140px] text-center capitalize">
              {format(mesActual, 'MMMM yyyy', { locale: es })}
            </span>
            <Button variant="outline" size="sm" onClick={() => setMesActual(addMonths(mesActual, 1))}>
              →
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Leyenda mejorada */}
          <div className="flex flex-wrap gap-3 mb-4 text-xs">
            <div className="flex items-center gap-1.5 px-2 py-1 bg-red-50 rounded-full border border-red-100">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
              <span className="text-red-700 font-medium">Pastor Principal</span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1 bg-orange-50 rounded-full border border-orange-100">
              <div className="w-2.5 h-2.5 rounded-full bg-orange-500"></div>
              <span className="text-orange-700 font-medium">Alta Prioridad</span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1 bg-blue-50 rounded-full border border-blue-100">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
              <span className="text-blue-700 font-medium">Media Prioridad</span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1 bg-green-50 rounded-full border border-green-100">
              <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
              <span className="text-green-700 font-medium">Baja Prioridad</span>
            </div>
          </div>
          
          {/* Grid de días mejorado */}
          <div className="grid grid-cols-7 gap-1">
            {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(dia => (
              <div key={dia} className="text-center text-xs font-semibold text-gray-500 py-2 bg-gray-50 rounded">
                {dia}
              </div>
            ))}
            {diasMes.map((dia, index) => {
              const eventosDia = getEventosDia(dia);
              const tieneEventos = eventosDia.length > 0;
              const esHoy = isSameDay(dia, new Date());
              
              return (
                <div 
                  key={index}
                  className={`
                    min-h-[90px] p-2 border rounded-lg transition-all
                    ${esHoy ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' : 'border-gray-200 bg-white'}
                    ${tieneEventos ? 'cursor-pointer hover:shadow-md hover:border-blue-300' : 'cursor-pointer hover:bg-gray-50'}
                  `}
                  onClick={() => handleDiaClick(dia)}
                >
                  <div className={`text-sm font-semibold mb-1 ${esHoy ? 'text-blue-600' : 'text-gray-700'}`}>
                    {format(dia, 'd')}
                  </div>
                  <div className="space-y-1">
                    {eventosDia.slice(0, 2).map((evento, i) => (
                      <div 
                        key={i}
                        className={`text-[10px] px-1.5 py-0.5 rounded text-white truncate font-medium ${getColorPrioridad(evento.prioridad, evento.creadorRol)}`}
                        title={evento.titulo}
                      >
                        {evento.hora && `${formatearHora12(evento.hora)} `}{evento.titulo}
                      </div>
                    ))}
                    {eventosDia.length > 2 && (
                      <div className="text-[10px] text-blue-600 text-center font-medium bg-blue-50 rounded py-0.5">
                        +{eventosDia.length - 2} más
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Instrucción */}
          <p className="text-xs text-gray-400 mt-3 text-center">
            Haz clic en un día para ver detalles o agregar un evento
          </p>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Mis GAPs */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="w-5 h-5" style={{ color: tema.primario }} />
              Mis GAPs
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => onNavegar('gaps')}>
              Ver todos
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {misGAPs.slice(0, 3).map((gap) => {
                const miembrosCount = miembrosMock.filter(m => m.gapId === gap.id).length + 2;
                return (
                  <div 
                    key={gap.id} 
                    className="p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 cursor-pointer hover:shadow-md hover:border-blue-200 transition-all"
                    onClick={() => onNavegar('gaps')}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">{gap.codigo}</p>
                        <p className="text-sm text-gray-500">
                          Líder: {gap.liderGapNombre}
                        </p>
                      </div>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        {miembrosCount} integrantes
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {gap.diaReunion} {formatearHora12(gap.horaReunion)}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPinIcon className="w-3 h-3" />
                        {gap.barrio}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Casos Pendientes con Acciones */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-amber-600" />
              Casos Pendientes
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => onNavegar('escalamientos')}>
              Ver todos
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {escalamientosPendientes.slice(0, 3).map((caso: any) => (
                <div 
                  key={caso.id} 
                  className="p-4 bg-gradient-to-r from-amber-50 to-white rounded-xl border border-amber-100 cursor-pointer hover:shadow-md transition-all"
                  onClick={() => abrirDetalleCaso(caso)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">{caso.titulo}</p>
                      <p className="text-sm text-gray-500">{caso.creadorNombre}</p>
                    </div>
                    <Badge className={
                      caso.prioridad === 'Urgente' ? 'bg-red-100 text-red-800 border-red-200' :
                      caso.prioridad === 'Importante' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                      'bg-blue-100 text-blue-800 border-blue-200'
                    }>
                      {caso.estado}
                    </Badge>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" variant="outline" className="text-xs bg-white">
                      En Proceso
                    </Button>
                    <Button size="sm" variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200 hover:bg-green-100">
                      Cerrar Caso
                    </Button>
                  </div>
                </div>
              ))}
              {escalamientosPendientes.length === 0 && (
                <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-xl">
                  <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-400" />
                  <p>No hay casos pendientes</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resumen Ministerial */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckCircle className="w-5 h-5" style={{ color: tema.primario }} />
            Resumen Ministerial de tu Red
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
              <p className="text-3xl font-bold text-green-600">{miembrosIBC}</p>
              <p className="text-sm text-green-700 font-medium">Miembros IBC</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-xl border border-cyan-200">
              <p className="text-3xl font-bold text-cyan-600">{bautizados}</p>
              <p className="text-sm text-cyan-700 font-medium">Bautizados</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
              <p className="text-3xl font-bold text-purple-600">{graduadosEFC}</p>
              <p className="text-sm text-purple-700 font-medium">Graduados EFC</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl border border-amber-200">
              <p className="text-3xl font-bold text-amber-600">{escalamientosPendientes.length}</p>
              <p className="text-sm text-amber-700 font-medium">Casos Pendientes</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Diálogo de nuevo evento */}
      <Dialog open={dialogoEventoAbierto} onOpenChange={setDialogoEventoAbierto}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" style={{ color: tema.primario }} />
              Agregar Nuevo Evento
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Título *</label>
              <Input
                value={nuevoEvento.titulo}
                onChange={(e) => setNuevoEvento({ ...nuevoEvento, titulo: e.target.value })}
                placeholder="Título del evento"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Descripción</label>
              <Textarea
                value={nuevoEvento.descripcion}
                onChange={(e) => setNuevoEvento({ ...nuevoEvento, descripcion: e.target.value })}
                placeholder="Descripción del evento..."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Fecha *</label>
                <Input
                  type="date"
                  value={nuevoEvento.fecha}
                  onChange={(e) => setNuevoEvento({ ...nuevoEvento, fecha: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Hora</label>
                <Input
                  type="time"
                  value={nuevoEvento.hora}
                  onChange={(e) => setNuevoEvento({ ...nuevoEvento, hora: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Tipo</label>
                <Select 
                  value={nuevoEvento.tipo} 
                  onValueChange={(v) => setNuevoEvento({ ...nuevoEvento, tipo: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Reunion">Reunión</SelectItem>
                    <SelectItem value="Evento">Evento</SelectItem>
                    <SelectItem value="Actividad">Actividad</SelectItem>
                    <SelectItem value="ReunionGAP">Reunión GAP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Prioridad</label>
                <Select 
                  value={nuevoEvento.prioridad} 
                  onValueChange={(v) => setNuevoEvento({ ...nuevoEvento, prioridad: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Alta">Alta</SelectItem>
                    <SelectItem value="Media">Media</SelectItem>
                    <SelectItem value="Baja">Baja</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-800 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                Los eventos del Pastor Principal tienen prioridad. Verifica que tu evento no interfiera con los eventos globales.
              </p>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setDialogoEventoAbierto(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={() => {
                  setDialogoEventoAbierto(false);
                  setNuevoEvento({
                    titulo: '',
                    descripcion: '',
                    fecha: '',
                    hora: '',
                    tipo: 'Evento',
                    prioridad: 'Media',
                  });
                }}
                style={{ backgroundColor: tema.primario }}
                className="text-white"
                disabled={!nuevoEvento.titulo.trim() || !nuevoEvento.fecha}
              >
                <Plus className="w-4 h-4 mr-2" />
                Agregar Evento
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Diálogo de detalle de evento(s) */}
      <Dialog open={dialogoDetalleEventoAbierto} onOpenChange={setDialogoDetalleEventoAbierto}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" style={{ color: tema.primario }} />
              {eventosDiaSeleccionado.length > 1 ? 'Eventos del Día' : 'Detalle del Evento'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {eventosDiaSeleccionado.map((evento) => (
                <div key={evento.id} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">{evento.titulo}</h3>
                    <Badge className={getBadgeColorPrioridad(evento.prioridad, evento.creadorRol)}>
                      {evento.creadorRol === 'pastor_principal' ? 'Pastor Principal' : evento.prioridad}
                    </Badge>
                  </div>
                  {evento.descripcion && (
                    <p className="text-gray-600 mb-3 text-sm">{evento.descripcion}</p>
                  )}
                  <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                    {evento.hora && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatearHora12(evento.hora)}
                      </span>
                    )}
                    {evento.ubicacion && (
                      <span className="flex items-center gap-1">
                        <MapPinIcon className="w-3 h-3" />
                        {evento.ubicacion}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            <div className="flex gap-2 justify-end pt-2">
              <Button variant="outline" onClick={() => setDialogoDetalleEventoAbierto(false)}>
                Cerrar
              </Button>
              <Button 
                onClick={() => {
                  setDialogoDetalleEventoAbierto(false);
                  setDialogoEventoAbierto(true);
                }}
                style={{ backgroundColor: tema.primario }}
                className="text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Agregar Evento
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Diálogo de detalle de caso */}
      <Dialog open={dialogoCasoAbierto} onOpenChange={setDialogoCasoAbierto}>
        <DialogContent className="max-w-lg">
          {casoSeleccionado && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-amber-600" />
                  {casoSeleccionado.titulo}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500 mb-1">Descripción</p>
                  <p className="text-gray-700">{casoSeleccionado.descripcion}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-500 mb-1">Clasificación</p>
                    <Badge variant="outline">{casoSeleccionado.clasificacion}</Badge>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-500 mb-1">Prioridad</p>
                    <Badge className={
                      casoSeleccionado.prioridad === 'Urgente' ? 'bg-red-100 text-red-800' :
                      casoSeleccionado.prioridad === 'Importante' ? 'bg-amber-100 text-amber-800' :
                      'bg-blue-100 text-blue-800'
                    }>
                      {casoSeleccionado.prioridad}
                    </Badge>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-2">Cambiar Estado</p>
                  <Select defaultValue={casoSeleccionado.estado}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Abierto">Abierto</SelectItem>
                      <SelectItem value="En Tratamiento">En Tratamiento</SelectItem>
                      <SelectItem value="Cerrado">Cerrado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button 
                    className="flex-1" 
                    variant="outline"
                    onClick={() => setDialogoCasoAbierto(false)}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    className="flex-1 bg-amber-500 hover:bg-amber-600 text-white"
                    onClick={() => setDialogoCasoAbierto(false)}
                  >
                    Marcar En Proceso
                  </Button>
                  <Button 
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                    onClick={() => setDialogoCasoAbierto(false)}
                  >
                    Cerrar Caso
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Diálogo de videollamada */}
      <Dialog open={dialogoVideollamadaAbierto} onOpenChange={setDialogoVideollamadaAbierto}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Video className="w-5 h-5 text-red-500" />
              Iniciar Videollamada
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Seleccionar GAP</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un GAP" />
                </SelectTrigger>
                <SelectContent>
                  {misGAPs.map(gap => (
                    <SelectItem key={gap.id} value={gap.id}>{gap.codigo} - {gap.barrio}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">O ingresar ID de sala</label>
              <Input placeholder="ID de sala" />
            </div>
            {videollamadasMock.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-2">Llamadas activas:</p>
                {videollamadasMock.map(vid => (
                  <div key={vid.id} className="flex items-center justify-between bg-white p-3 rounded-lg border">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="font-medium">{vid.gapCodigo}</span>
                      <span className="text-sm text-gray-500">({vid.participantes} participantes)</span>
                    </div>
                    <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white">
                      <Phone className="w-4 h-4 mr-1" />
                      Unirse
                    </Button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setDialogoVideollamadaAbierto(false)}>
                Cancelar
              </Button>
              <Button 
                style={{ backgroundColor: tema.primario }}
                className="text-white"
              >
                <Video className="w-4 h-4 mr-2" />
                Iniciar Llamada
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DashboardMentorPastor;
