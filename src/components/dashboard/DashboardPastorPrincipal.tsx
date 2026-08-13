import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Users, 
  Plus,
  ChevronRight,
  Calendar,
  Clock,
  Crown,
  Sparkles,
  MapPin as MapPinIcon,
  Heart,
  MoreHorizontal
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { toast } from 'sonner';
import { 
  gapsMock, 
  miembrosMock, 
  getEstadisticas,
  peticionesOracionMock
} from '@/data/mockData';
import { format, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { formatearHora12 } from '@/lib/utils';

interface DashboardPastorPrincipalProps {
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
  alarmas?: string[];
}

// Mock de eventos
const eventosMock: Evento[] = [
  {
    id: 'evt1',
    titulo: 'Reunión de Pastores',
    descripcion: 'Reunión mensual con todos los pastores para revisar estadísticas y planificar actividades.',
    fecha: '2026-03-20',
    hora: '19:00',
    tipo: 'Reunion',
    prioridad: 'Alta',
    creadorRol: 'pastor_principal',
    creadorNombre: 'Carlos Martínez',
    ubicacion: 'Sala de Conferencias IBC',
    alarmas: ['1 día antes', '1 hora antes'],
  },
  {
    id: 'evt2',
    titulo: 'Conferencia Anual IBC',
    descripcion: 'Evento anual de la iglesia con invitados especiales. Todos los GAPs deben asistir.',
    fecha: '2026-03-28',
    hora: '09:00',
    tipo: 'Evento',
    prioridad: 'Alta',
    creadorRol: 'pastor_principal',
    creadorNombre: 'Carlos Martínez',
    ubicacion: 'Auditorio Principal IBC',
    alarmas: ['1 semana antes', '1 día antes', '1 hora antes'],
  },
  {
    id: 'evt3',
    titulo: 'Cumpleaños - Ana Ramírez',
    descripcion: 'Celebración de cumpleaños de la líder del GAP-3.',
    fecha: '2026-03-25',
    tipo: 'Cumpleaños',
    prioridad: 'Media',
    creadorRol: 'pastor',
    creadorNombre: 'Pedro Sánchez',
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

const DashboardPastorPrincipal: React.FC<DashboardPastorPrincipalProps> = ({ onNavegar }) => {
  const { usuario, tema } = useAuth();
  const stats = getEstadisticas();
  
  const [dialogoEventoAbierto, setDialogoEventoAbierto] = useState(false);
  const [dialogoDetalleEventoAbierto, setDialogoDetalleEventoAbierto] = useState(false);
  const [dialogoDetallesMiembrosAbierto, setDialogoDetallesMiembrosAbierto] = useState(false);
  const [eventosDiaSeleccionado, setEventosDiaSeleccionado] = useState<Evento[]>([]);
  const [gapExpandido, setGapExpandido] = useState<string | null>(null);
  
  const [nuevoEvento, setNuevoEvento] = useState({
    titulo: '',
    descripcion: '',
    fecha: '',
    hora: '',
    tipo: 'Evento',
    prioridad: 'Alta',
    ubicacion: '',
    alarma: '1 día antes',
  });

  const getEventosDia = (dia: Date) => {
    return eventosMock.filter(e => isSameDay(new Date(e.fecha), dia));
  };

  const handleDiaClick = (dia: Date) => {
    const eventos = getEventosDia(dia);
    if (eventos.length > 0) {
      setEventosDiaSeleccionado(eventos);
      setDialogoDetalleEventoAbierto(true);
    } else {
      setDialogoEventoAbierto(true);
      setNuevoEvento({ ...nuevoEvento, fecha: format(dia, 'yyyy-MM-dd') });
    }
  };

  const guardarEvento = () => {
    // Aquí se guardaría el evento y se enviarían alarmas a todos los roles
    toast.success('Evento creado. Se han enviado notificaciones a todos los roles.');
    setDialogoEventoAbierto(false);
    setNuevoEvento({
      titulo: '',
      descripcion: '',
      fecha: '',
      hora: '',
      tipo: 'Evento',
      prioridad: 'Alta',
      ubicacion: '',
      alarma: '1 día antes',
    });
  };

  const toggleGapExpandido = (gapId: string) => {
    setGapExpandido(gapExpandido === gapId ? null : gapId);
  };

  return (
    <div className="px-margin-mobile md:px-margin-desktop max-w-7xl mx-auto mt-gutter animate-fade-in pb-24 lg:pb-6 space-y-gutter text-slate-800">
      {/* Saludo y Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-800">
            ¡Bienvenido de nuevo, Pastor {usuario?.nombre}!
          </h2>
          <p className="text-slate-400 text-xs mt-1">
            {format(new Date(), 'EEEE, d MMMM yyyy', { locale: es })}
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => onNavegar('crear-usuario')}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl px-4 py-2 flex items-center gap-2 shadow-lg transition-all"
          >
            <Plus className="w-4.5 h-4.5" />
            Crear Usuario
          </Button>
          <Button 
            onClick={() => onNavegar('gestion-usuarios')}
            className="bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs rounded-xl px-4 py-2 flex items-center gap-2 shadow-lg transition-all"
          >
            <Users className="w-4 h-4" />
            Gestión de Usuarios
          </Button>
        </div>
      </div>

      {/* Grid Principal de Widgets Premium */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        
        {/* 1. CHURCH MEMBERS STATISTICS */}
        <div className="glass-card p-6 shadow-xl flex flex-col justify-between min-h-[380px]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold tracking-wide text-slate-500">Estadísticas de Miembros</h3>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="text-slate-500 hover:text-slate-800 focus:outline-none">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="glass-card backdrop-blur-md border border-slate-200 text-slate-800 shadow-2xl p-1 rounded-xl min-w-[140px]">
                <DropdownMenuItem 
                  onClick={() => setDialogoDetallesMiembrosAbierto(true)}
                  className="cursor-pointer rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-200/50 dark:hover:bg-slate-100/50 transition-colors focus:bg-slate-200/50 dark:focus:bg-white/10"
                >
                  Ver Detalles
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
            {/* Números Grandes */}
            <div className="space-y-4">
              <div>
                <p className="text-xs text-slate-400 font-medium">Total</p>
                <h4 className="text-4xl font-extrabold tracking-tight text-slate-800 mt-1">
                  {stats.totalMiembros > 0 ? stats.totalMiembros : '8,745'}
                </h4>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">Nuevos Miembros</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xl font-bold text-emerald-400">+112</span>
                  <span className="text-[10px] text-slate-400">este mes</span>
                </div>
              </div>
            </div>

            {/* Barras de Progreso a la Derecha */}
            <div className="space-y-3">
              <p className="text-xs text-slate-400 font-medium mb-1">Demografía por Edad</p>
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                    <span>Jóvenes (15-30)</span>
                    <span>28%</span>
                  </div>
                  <div className="w-full bg-white/60 rounded-full h-1.5">
                    <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '28%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                    <span>Adultos (31-50)</span>
                    <span>42%</span>
                  </div>
                  <div className="w-full bg-white/60 rounded-full h-1.5">
                    <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: '42%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                    <span>Adultos Mayores (51+)</span>
                    <span>20%</span>
                  </div>
                  <div className="w-full bg-white/60 rounded-full h-1.5">
                    <div className="bg-rose-500 h-1.5 rounded-full" style={{ width: '20%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                    <span>Otros</span>
                    <span>10%</span>
                  </div>
                  <div className="w-full bg-white/60 rounded-full h-1.5">
                    <div className="bg-gray-500 h-1.5 rounded-full" style={{ width: '10%' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Fila Inferior con Anillos y Gráfico de Barras */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-100 pt-4 mt-4">
            {/* Anillos de Porcentajes */}
            <div className="flex items-center gap-3 justify-around">
              <div className="text-center">
                <div className="relative w-12 h-12 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path className="text-slate-500" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    <path className="text-emerald-500" strokeDasharray="28, 100" strokeWidth="3" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  </svg>
                  <span className="absolute text-[10px] font-bold">28%</span>
                </div>
                <span className="text-[8px] text-slate-400 block mt-1">15-30</span>
              </div>
              <div className="text-center">
                <div className="relative w-12 h-12 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path className="text-slate-500" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    <path className="text-amber-500" strokeDasharray="42, 100" strokeWidth="3" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  </svg>
                  <span className="absolute text-[10px] font-bold">+112</span>
                </div>
                <span className="text-[8px] text-slate-400 block mt-1">31-50</span>
              </div>
              <div className="text-center">
                <div className="relative w-12 h-12 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path className="text-slate-500" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    <path className="text-rose-500" strokeDasharray="20, 100" strokeWidth="3" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  </svg>
                  <span className="absolute text-[10px] font-bold">20%</span>
                </div>
                <span className="text-[8px] text-slate-400 block mt-1">51+</span>
              </div>
            </div>

            {/* Gráfico de Barras Pequeño */}
            <div className="flex items-end justify-between h-12 px-2 bg-white/60 rounded-lg border border-slate-100 pb-1">
              <div className="w-1.5 bg-emerald-500/80 rounded-t h-[40%]" />
              <div className="w-1.5 bg-emerald-500/80 rounded-t h-[60%]" />
              <div className="w-1.5 bg-amber-500/80 rounded-t h-[30%]" />
              <div className="w-1.5 bg-emerald-500 rounded-t h-[80%]" />
              <div className="w-1.5 bg-rose-500/80 rounded-t h-[50%]" />
              <div className="w-1.5 bg-emerald-500/80 rounded-t h-[70%]" />
              <div className="w-1.5 bg-amber-500/80 rounded-t h-[45%]" />
              <div className="w-1.5 bg-gray-500/80 rounded-t h-[20%]" />
            </div>
          </div>
        </div>

        {/* 2. UPCOMING CALENDAR EVENTS */}
        <div className="glass-card p-6 shadow-xl flex flex-col justify-between min-h-[380px]">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold tracking-wide text-slate-500">Próximos Eventos del Calendario</h3>
              <button className="text-slate-400 hover:text-slate-800" onClick={() => setDialogoEventoAbierto(true)}>
                <Plus className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/60 border border-slate-100 hover:bg-slate-100/50 transition-all cursor-pointer"
                   onClick={() => handleDiaClick(new Date('2026-03-20'))}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/20 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-white">Servicio Dominical</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">Culto y predicación habitual...</p>
                  </div>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">20/03.2026</span>
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/60 border border-slate-100 hover:bg-slate-100/50 transition-all cursor-pointer"
                   onClick={() => handleDiaClick(new Date('2026-03-25'))}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/20 flex items-center justify-center">
                    <Users className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-white">Reunión de Jóvenes</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">Integración y enseñanzas juveniles...</p>
                  </div>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">10:30 AM - 1:00 PM</span>
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/60 border border-slate-100 hover:bg-slate-100/50 transition-all cursor-pointer"
                   onClick={() => handleDiaClick(new Date('2026-03-20'))}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/20 flex items-center justify-center">
                    <Crown className="w-5 h-5 text-rose-400" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-white">Reunión de Líderes</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">Reunión semanal de planeación...</p>
                  </div>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">12:00 PM - 2:00 PM</span>
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/60 border border-slate-100 hover:bg-slate-100/50 transition-all cursor-pointer"
                   onClick={() => handleDiaClick(new Date('2026-03-28'))}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/20 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-white">Evento de Evangelismo</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">Alcance social and evangelístico...</p>
                  </div>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">12:30 PM - 3:00 PM</span>
              </div>
            </div>
          </div>
          
          <div className="flex justify-center gap-1.5 mt-4">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
            <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
          </div>
        </div>

        {/* 3. ACTIVE G.A.P GROUPS */}
        <div className="glass-card p-6 shadow-xl min-h-[380px] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold tracking-wide text-slate-500">Grupos G.A.P Activos</h3>
              <button className="text-slate-400 hover:text-slate-800" onClick={() => onNavegar('gaps')}><ChevronRight className="w-4 h-4" /></button>
            </div>
            
            <div className="flex items-center justify-between text-[10px] text-slate-400 mb-4 font-medium">
              <span>{gapsMock.length} Grupos Activos</span>
              <span>Total de Integrantes: {stats.totalMiembros > 0 ? stats.totalMiembros : '1,450'}</span>
            </div>

            <div className="space-y-2.5">
              {gapsMock.slice(0, 4).map((gap, i) => {
                const nombresAlternativos = ['Vida Nueva', 'Luz y Verdad', 'Impacto', 'Renacer'];
                const miembrosCount = miembrosMock.filter(m => m.gapId === gap.id).length;
                
                return (
                  <div key={gap.id} className="flex items-center justify-between p-3 rounded-xl bg-white/60 border border-slate-100 hover:bg-slate-100/50 transition-all cursor-pointer"
                       onClick={() => toggleGapExpandido(gap.id)}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                        <MapPinIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-white">{nombresAlternativos[i] || gap.codigo}</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5">Líder: {gap.liderGapNombre || 'Samuel Ortiz'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-[10px] font-mono text-slate-500">{miembrosCount > 0 ? miembrosCount : '1,450'}</span>
                      <button 
                        className="text-[9px] bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-lg transition-all font-medium"
                        onClick={(e) => { e.stopPropagation(); onNavegar('gaps'); }}
                      >
                        Estado
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 4. RECENT PRAYER REQUESTS */}
        <div className="glass-card p-6 shadow-xl min-h-[380px] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold tracking-wide text-slate-500">Peticiones de Oración Recientes</h3>
              <button className="text-slate-400 hover:text-slate-800" onClick={() => onNavegar('peticiones-oracion')}><ChevronRight className="w-4 h-4" /></button>
            </div>
            
            <div className="text-[10px] text-slate-400 mb-4 font-medium">
              Total: {peticionesOracionMock.length} activas
            </div>

            <div className="space-y-2.5">
              {peticionesOracionMock.slice(0, 3).map((peticion) => (
                <div key={peticion.id} className="flex items-center justify-between p-3 rounded-xl bg-white/60 border border-slate-100 hover:bg-slate-100/50 transition-all cursor-pointer"
                     onClick={() => onNavegar('peticiones-oracion')}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/20 flex items-center justify-center text-rose-400">
                      <Heart className="w-5 h-5 fill-rose-400/20" />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-white truncate max-w-[180px]">{peticion.titulo}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[180px]">
                        {peticion.comentarios || peticion.descripcion || 'Petición activa'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[9px] bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded font-mono">
                      Dom
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Button 
            className="w-full h-11 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 mt-4 shadow-lg border border-slate-200 transition-all hover:opacity-90"
            style={{ 
              background: `linear-gradient(135deg, ${tema.primario} 0%, ${tema.secundario} 100%)`
            }}
            onClick={() => onNavegar('peticiones-oracion')}
          >
            Enviar Petición de Oración
          </Button>
        </div>

      </div>

      {/* Diálogo de nuevo evento */}
      <Dialog open={dialogoEventoAbierto} onOpenChange={setDialogoEventoAbierto}>
        <DialogContent className="max-w-lg border border-slate-200 text-slate-800 glass-card">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white">
              <Plus className="w-5 h-5 text-emerald-400" />
              Agregar Nuevo Evento
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-slate-500">Título *</Label>
              <Input
                value={nuevoEvento.titulo}
                onChange={(e) => setNuevoEvento({ ...nuevoEvento, titulo: e.target.value })}
                placeholder="Título del evento"
                className="bg-white/60 border-slate-200 text-slate-800 placeholder-white/20"
              />
            </div>
            <div>
              <Label className="text-slate-500">Descripción</Label>
              <Textarea
                value={nuevoEvento.descripcion}
                onChange={(e) => setNuevoEvento({ ...nuevoEvento, descripcion: e.target.value })}
                placeholder="Descripción del evento..."
                rows={3}
                className="bg-white/60 border-slate-200 text-slate-800 placeholder-white/20"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-500">Fecha *</Label>
                <Input
                  type="date"
                  value={nuevoEvento.fecha}
                  onChange={(e) => setNuevoEvento({ ...nuevoEvento, fecha: e.target.value })}
                  className="bg-white/60 border-slate-200 text-slate-800 [color-scheme:dark]"
                />
              </div>
              <div>
                <Label className="text-slate-500">Hora</Label>
                <Input
                  type="time"
                  value={nuevoEvento.hora}
                  onChange={(e) => setNuevoEvento({ ...nuevoEvento, hora: e.target.value })}
                  className="bg-white/60 border-slate-200 text-slate-800 [color-scheme:dark]"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-500">Tipo</Label>
                <Select 
                  value={nuevoEvento.tipo} 
                  onValueChange={(v) => setNuevoEvento({ ...nuevoEvento, tipo: v })}
                >
                  <SelectTrigger className="bg-white/60 border-slate-200 text-slate-800">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-slate-200 text-slate-800 glass-card">
                    <SelectItem value="Reunion">Reunión</SelectItem>
                    <SelectItem value="Evento">Evento</SelectItem>
                    <SelectItem value="Actividad">Actividad</SelectItem>
                    <SelectItem value="Cumpleaños">Cumpleaños</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-slate-500">Prioridad</Label>
                <Select 
                  value={nuevoEvento.prioridad} 
                  onValueChange={(v) => setNuevoEvento({ ...nuevoEvento, prioridad: v })}
                >
                  <SelectTrigger className="bg-white/60 border-slate-200 text-slate-800">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-slate-200 text-slate-800 glass-card">
                    <SelectItem value="Alta">Alta</SelectItem>
                    <SelectItem value="Media">Media</SelectItem>
                    <SelectItem value="Baja">Baja</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="text-slate-500">Ubicación</Label>
              <Input
                value={nuevoEvento.ubicacion}
                onChange={(e) => setNuevoEvento({ ...nuevoEvento, ubicacion: e.target.value })}
                placeholder="Lugar del evento"
                className="bg-white/60 border-slate-200 text-slate-800 placeholder-white/20"
              />
            </div>
            <div>
              <Label className="text-slate-500">Alarma para todos los roles</Label>
              <Select 
                value={nuevoEvento.alarma} 
                onValueChange={(v) => setNuevoEvento({ ...nuevoEvento, alarma: v })}
              >
                <SelectTrigger className="bg-white/60 border-slate-200 text-slate-800">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-slate-200 text-slate-800 glass-card">
                  <SelectItem value="1 semana antes">1 semana antes</SelectItem>
                  <SelectItem value="1 día antes">1 día antes</SelectItem>
                  <SelectItem value="1 hora antes">1 hora antes</SelectItem>
                  <SelectItem value="15 minutos antes">15 minutos antes</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setDialogoEventoAbierto(false)} className="border-slate-200 text-slate-800 hover:bg-slate-100/50">
                Cancelar
              </Button>
              <Button 
                onClick={guardarEvento}
                className="text-white bg-emerald-600 hover:bg-emerald-500"
                disabled={!nuevoEvento.titulo.trim() || !nuevoEvento.fecha}
              >
                <Plus className="w-4 h-4 mr-2" />
                Crear Evento
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Diálogo de detalle de evento(s) */}
      <Dialog open={dialogoDetalleEventoAbierto} onOpenChange={setDialogoDetalleEventoAbierto}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto border border-slate-200 text-slate-800 glass-card">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white">
              <Calendar className="w-5 h-5 text-emerald-400" />
              {eventosDiaSeleccionado.length > 1 ? 'Eventos del Día' : 'Detalle del Evento'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {eventosDiaSeleccionado.map((evento) => (
              <div key={evento.id} className="bg-white/60 rounded-xl p-4 border border-slate-200">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-white">{evento.titulo}</h3>
                  <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {evento.tipo}
                  </Badge>
                </div>
                {evento.descripcion && (
                  <p className="text-slate-500 mb-3 text-sm">{evento.descripcion}</p>
                )}
                <div className="space-y-2 text-sm text-slate-500">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span>{format(new Date(evento.fecha), 'EEEE, dd MMMM yyyy', { locale: es })}</span>
                  </div>
                  {evento.hora && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <span>{formatearHora12(evento.hora)}</span>
                    </div>
                  )}
                  {evento.ubicacion && (
                    <div className="flex items-center gap-2">
                      <MapPinIcon className="w-4 h-4 text-slate-400" />
                      <span>{evento.ubicacion}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div className="flex gap-2 justify-end pt-2">
              <Button variant="outline" onClick={() => setDialogoDetalleEventoAbierto(false)} className="border-slate-200 text-slate-800 hover:bg-slate-100/50">
                Cerrar
              </Button>
              <Button 
                onClick={() => {
                  setDialogoDetalleEventoAbierto(false);
                  setDialogoEventoAbierto(true);
                }}
                className="bg-emerald-600 hover:bg-emerald-500 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Agregar Evento
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialogo Detalles de Estadísticas de Miembros */}
      <Dialog open={dialogoDetallesMiembrosAbierto} onOpenChange={setDialogoDetallesMiembrosAbierto}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto border border-slate-200 text-slate-800 glass-card font-sans">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white text-lg font-bold">
              <Users className="w-5 h-5" style={{ color: tema.primario }} />
              Detalles de Estadísticas de Miembros
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white/60 rounded-xl p-4 border border-slate-200 text-center">
                <p className="text-xs text-slate-400 font-medium">Total Integrantes</p>
                <h4 className="text-2xl font-bold mt-1 text-white">{miembrosMock.length}</h4>
              </div>
              <div className="bg-white/60 rounded-xl p-4 border border-slate-200 text-center">
                <p className="text-xs text-slate-400 font-medium">Bautizados</p>
                <h4 className="text-2xl font-bold mt-1 text-cyan-400">{miembrosMock.filter(m => m.esBautizado).length}</h4>
              </div>
              <div className="bg-white/60 rounded-xl p-4 border border-slate-200 text-center">
                <p className="text-xs text-slate-400 font-medium">Miembros IBC</p>
                <h4 className="text-2xl font-bold mt-1 text-emerald-400">{miembrosMock.filter(m => m.esMiembroIBC).length}</h4>
              </div>
              <div className="bg-white/60 rounded-xl p-4 border border-slate-200 text-center">
                <p className="text-xs text-slate-400 font-medium">Graduados EFC</p>
                <h4 className="text-2xl font-bold mt-1 text-purple-400">{miembrosMock.filter(m => m.escuelaFormacion === 'Graduado').length}</h4>
              </div>
            </div>

            {/* Demographics details table */}
            <div className="bg-white/60 rounded-xl p-5 border border-slate-200">
              <h3 className="text-sm font-semibold mb-4 text-slate-500">Distribución Demográfica Detallada</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span>Jóvenes (15-30 años)</span>
                  </div>
                  <span className="font-semibold">{Math.round(miembrosMock.length * 0.28)} miembros (28%)</span>
                </div>
                <div className="flex justify-between items-center text-sm border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-amber-500" />
                    <span>Adultos (31-50 años)</span>
                  </div>
                  <span className="font-semibold">{Math.round(miembrosMock.length * 0.42)} miembros (42%)</span>
                </div>
                <div className="flex justify-between items-center text-sm border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-rose-500" />
                    <span>Adultos Mayores (51+ años)</span>
                  </div>
                  <span className="font-semibold">{Math.round(miembrosMock.length * 0.20)} miembros (20%)</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-gray-500" />
                    <span>Otros</span>
                  </div>
                  <span className="font-semibold">{Math.round(miembrosMock.length * 0.10)} miembros (10%)</span>
                </div>
              </div>
            </div>

            {/* List of 5 recently registered members */}
            <div className="bg-white/60 rounded-xl p-5 border border-slate-200">
              <h3 className="text-sm font-semibold mb-4 text-slate-500">Integrantes Registrados Recientemente</h3>
              <div className="space-y-3">
                {miembrosMock.slice(0, 5).map((m) => (
                  <div key={m.id} className="flex justify-between items-center p-3 rounded-lg bg-white/60 border border-slate-100 hover:bg-slate-100/50 transition-colors">
                    <div>
                      <p className="font-medium text-sm text-white">{m.nombres} {m.apellidos}</p>
                      <p className="text-[11px] text-slate-400">{m.correo || 'Sin correo'} | Tel: {m.telefono}</p>
                    </div>
                    <div className="flex gap-2">
                      {m.esBautizado && (
                        <Badge className="bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/10 border-cyan-500/20 text-[10px]">
                          Bautizado
                        </Badge>
                      )}
                      <Badge className="bg-slate-100 text-slate-800 border-slate-200 text-[10px]">
                        {m.escuelaFormacion}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button 
                variant="outline" 
                onClick={() => setDialogoDetallesMiembrosAbierto(false)} 
                className="border-slate-200 text-slate-800 hover:bg-slate-100/50"
              >
                Cerrar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DashboardPastorPrincipal;




