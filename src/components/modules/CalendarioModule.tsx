import React, { useState, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { 
  ArrowLeft, 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Clock, 
  MapPin, 
  Users,
  AlertCircle,
  Activity,
  Star,
  Gift
} from 'lucide-react';
import { toast } from 'sonner';
import { formatearHora12 } from '@/lib/utils';
import { 
  eventosCalendarioMock, 
  miembrosMock,
  crearEventoCalendario 
} from '@/data/mockData';
import type { EventoCalendario, TipoEvento, PrioridadEvento } from '@/types';
import { startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, addMonths, subMonths, startOfWeek, endOfWeek, isToday, format } from 'date-fns';
import { es } from 'date-fns/locale';

interface CalendarioModuleProps {
  onVolver: () => void;
}

const CalendarioModule: React.FC<CalendarioModuleProps> = ({ onVolver }) => {
  const { usuario } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Sheet de Agenda Diaria
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  // Dialogs de Eventos
  const [eventoSeleccionado, setEventoSeleccionado] = useState<EventoCalendario | null>(null);
  const [creandoEventoEnFecha, setCreandoEventoEnFecha] = useState<Date | null>(null);

  // Filtrar eventos según el rol y visibilidad
  const eventosFiltrados = useMemo(() => {
    if (!usuario) return [];
    
    return eventosCalendarioMock.filter(evento => {
      if (!evento.activo) return false;
      if (evento.creadorRol === 'pastor_principal' && evento.visibleParaTodos) return true;
      if (evento.creadorRol === 'pastor' && evento.visibleParaTodos) return true;
      if (evento.creadorId === usuario.id) return true;
      if (evento.visibleParaRoles?.includes(usuario.rol)) return true;
      if (evento.visibleParaGAPs && usuario.gapId && evento.visibleParaGAPs.includes(usuario.gapId)) return true;
      if (evento.gapId && usuario.gapId && evento.gapId === usuario.gapId) return true;
      return false;
    });
  }, [usuario]);

  // Generar cumpleaños automáticos
  const cumpleanosMiembros = useMemo(() => {
    const hoy = new Date();
    const anioActual = hoy.getFullYear();
    
    const miembrosFiltrados = usuario?.rol === 'timoteo' 
      ? miembrosMock.filter(m => m.gapId === usuario.gapId)
      : miembrosMock;
    
    return miembrosFiltrados.map(miembro => {
      const fechaNacimiento = new Date(miembro.fechaNacimiento);
      const mes = fechaNacimiento.getMonth();
      const dia = fechaNacimiento.getDate();
      
      return {
        id: `cumple-${miembro.id}`,
        titulo: `Cumpleaños de ${miembro.nombres}`,
        descripcion: `Celebra el cumpleaños de ${miembro.nombres} ${miembro.apellidos}`,
        tipo: 'Cumpleaños' as TipoEvento,
        fecha: new Date(anioActual, mes, dia).toISOString().split('T')[0],
        tipoAuto: true,
        gapId: miembro.gapId,
      } as any; // Cast temporal para evitar errores estrictos de tipo en auto-eventos
    });
  }, [usuario]);

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const goToToday = () => setCurrentDate(new Date());

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 0 });
    const end = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 0 });
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  const getEventosDelDia = (date: Date) => {
    const fechaStr = date.toISOString().split('T')[0];
    const eventosDelDia = eventosFiltrados.filter(e => e.fecha === fechaStr);
    
    const cumpleanosDelDia = cumpleanosMiembros.filter(c => {
      const cumpleFecha = new Date(c.fecha);
      return cumpleFecha.getDate() === date.getDate() && cumpleFecha.getMonth() === date.getMonth();
    });
    
    return [...eventosDelDia, ...cumpleanosDelDia];
  };

  const puedeCrearEvento = (fecha: Date) => {
    if (!usuario) return false;
    const fechaStr = fecha.toISOString().split('T')[0];
    
    // Eventos de alta prioridad o de la iglesia general
    const eventosIglesia = eventosCalendarioMock.filter(e => 
      e.fecha === fechaStr && 
      (e.creadorRol === 'pastor_principal' || e.creadorRol === 'administrador' || e.prioridad === 'Alta') && 
      e.activo
    );
    
    // Los administradores o pastores principales siempre pueden
    if (usuario.rol === 'pastor_principal' || usuario.rol === 'administrador') return true;
    
    // Si hay un evento de la iglesia, los demás roles NO pueden programar nada ese día
    if (eventosIglesia.length > 0) return false;
    
    return true;
  };

  const getColorEvento = (tipo: string, prioridad?: string) => {
    if (tipo === 'Cumpleaños') return { bg: 'bg-pink-100', text: 'text-pink-700', border: 'border-pink-200', icon: Gift };
    if (prioridad === 'Alta') return { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200', icon: AlertCircle };
    
    switch (tipo) {
      case 'Reunion': return { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200', icon: Users };
      case 'Evento': return { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200', icon: Star };
      case 'Actividad': return { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200', icon: Activity };
      case 'ReunionGAP': return { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200', icon: Users };
      default: return { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200', icon: Calendar };
    }
  };

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
  };

  const handleEventoClick = (evento: EventoCalendario, e: React.MouseEvent) => {
    e.stopPropagation();
    setEventoSeleccionado(evento);
  };

  const nombresDias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const mesActualCapitalizado = format(currentDate, 'MMMM', { locale: es }).charAt(0).toUpperCase() + format(currentDate, 'MMMM', { locale: es }).slice(1);

  return (
    <div className="space-y-6 animate-fade-in pb-20 md:pb-0 text-slate-900">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={onVolver} className="text-slate-600 hover:bg-slate-100">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold text-slate-900">
            Calendario de Red
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={goToToday} variant="outline" className="bg-white hover:bg-slate-50 text-slate-700">
            Hoy
          </Button>
          {puedeCrearEvento(new Date()) && (
            <Button onClick={() => setCreandoEventoEnFecha(new Date())} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
              <Plus className="w-4 h-4" /> Nuevo Evento
            </Button>
          )}
        </div>
      </div>

      {/* Calendario */}
      <Card className="bg-white border-slate-200 shadow-sm overflow-hidden">
        <CardHeader className="border-b border-slate-100 py-4 bg-slate-50/50">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-xl font-semibold text-slate-800">
              <Calendar className="w-5 h-5 text-emerald-600" />
              {mesActualCapitalizado} {currentDate.getFullYear()}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={prevMonth} className="bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={nextMonth} className="bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 bg-white">
          {/* Días de la semana */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {nombresDias.map(dia => (
              <div key={dia} className="text-center text-xs font-bold uppercase tracking-widest text-slate-500 py-2">
                {dia}
              </div>
            ))}
          </div>

          {/* Días del mes */}
          <div className="grid grid-cols-7 gap-2">
            {days.map((day, index) => {
              const eventosDelDia = getEventosDelDia(day);
              const esHoy = isToday(day);
              const esMesActual = isSameMonth(day, currentDate);
              const dayPuedeCrear = puedeCrearEvento(day);
              
              return (
                <HoverCard key={index} openDelay={200}>
                  <HoverCardTrigger asChild>
                    <div
                      onClick={() => handleDayClick(day)}
                      className={`
                        min-h-[100px] sm:min-h-[130px] p-2 rounded-xl transition-all border cursor-pointer
                        ${esMesActual ? 'bg-white border-slate-100 hover:border-emerald-300 hover:shadow-md' : 'bg-slate-50/50 border-transparent opacity-40 pointer-events-none'}
                        ${esHoy ? 'border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.1)] bg-emerald-50/30' : ''}
                        ${!dayPuedeCrear && esMesActual ? 'opacity-90 bg-slate-50/80' : ''}
                        flex flex-col group
                      `}
                    >
                      <div className={`text-right text-sm font-semibold mb-2 ${esHoy ? 'text-emerald-600' : 'text-slate-500 group-hover:text-emerald-600 transition-colors'}`}>
                        <span className={esHoy ? 'bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full' : ''}>
                          {day.getDate()}
                        </span>
                      </div>
                      <div className="space-y-1.5 flex-1 overflow-y-auto scrollbar-none">
                        {eventosDelDia.slice(0, 3).map((evento: any, idx) => {
                          const tipo = evento.tipoAuto ? 'Cumpleaños' : evento.tipo;
                          const colores = getColorEvento(tipo, evento.prioridad);
                          
                          return (
                            <div
                              key={idx}
                              onClick={(e) => handleEventoClick(evento as EventoCalendario, e)}
                              className={`text-xs px-2 py-1 rounded-md border truncate transition-opacity flex items-center gap-1.5 ${colores.bg} ${colores.text} ${colores.border} hover:opacity-80`}
                              title={evento.titulo}
                            >
                              <colores.icon className="w-3 h-3 flex-shrink-0" />
                              <span className="truncate font-medium">{evento.titulo}</span>
                            </div>
                          );
                        })}
                        {eventosDelDia.length > 3 && (
                          <div className="text-[10px] text-slate-500 font-bold bg-slate-100 rounded-md py-1 px-2 flex items-center justify-between">
                            <span>+{eventosDelDia.length - 3} más</span>
                            <ChevronRight className="w-3 h-3" />
                          </div>
                        )}
                      </div>
                    </div>
                  </HoverCardTrigger>
                  
                  {eventosDelDia.length > 0 && esMesActual && (
                    <HoverCardContent side="right" align="start" className="w-64 p-3 bg-white shadow-xl border-slate-200 z-50">
                      <div className="font-bold text-slate-800 border-b border-slate-100 pb-2 mb-2 flex items-center justify-between">
                        <span>Eventos del {format(day, 'dd MMM', { locale: es })}</span>
                        <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">{eventosDelDia.length}</Badge>
                      </div>
                      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                        {eventosDelDia.map((evento: any, idx) => {
                          const tipo = evento.tipoAuto ? 'Cumpleaños' : evento.tipo;
                          const colores = getColorEvento(tipo, evento.prioridad);
                          return (
                            <div key={idx} className={`text-xs p-2 rounded-md border flex flex-col gap-1 ${colores.bg} ${colores.text} ${colores.border}`}>
                              <div className="flex items-center gap-1.5 font-bold">
                                <colores.icon className="w-3.5 h-3.5 flex-shrink-0" />
                                <span className="line-clamp-1">{evento.titulo}</span>
                              </div>
                              {evento.hora && (
                                <div className="flex items-center gap-1 text-[10px] opacity-80 pl-5">
                                  <Clock className="w-3 h-3" /> {formatearHora12(evento.hora)}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </HoverCardContent>
                  )}
                </HoverCard>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Leyenda */}
      <div className="flex flex-wrap gap-4 px-2">
        <LeyendaItem tipo="Alta Prioridad" />
        <LeyendaItem tipo="Reunión" />
        <LeyendaItem tipo="Evento" />
        <LeyendaItem tipo="Actividad" />
        <LeyendaItem tipo="Cumpleaños" />
      </div>

      {/* Sheet de Agenda Diaria */}
      <Sheet open={!!selectedDate} onOpenChange={(open) => !open && setSelectedDate(null)}>
        <SheetContent className="w-full sm:max-w-md border-l border-slate-200 bg-white text-slate-900 p-0 shadow-2xl">
          {selectedDate && (
            <div className="flex flex-col h-full">
              <SheetHeader className="p-6 border-b border-slate-100 bg-slate-50/80 sticky top-0 z-10 backdrop-blur-md">
                <SheetTitle className="text-xl font-bold text-slate-900 flex items-center gap-3 m-0">
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 flex flex-col items-center justify-center text-emerald-700 border border-emerald-200 shadow-sm">
                    <span className="text-[10px] uppercase font-bold leading-none">{format(selectedDate, 'MMM', { locale: es })}</span>
                    <span className="text-xl font-black leading-none mt-0.5">{format(selectedDate, 'dd')}</span>
                  </div>
                  <div>
                    <span className="block capitalize text-slate-800">{format(selectedDate, 'eeee', { locale: es })}</span>
                    <span className="text-sm font-medium text-slate-500">Agenda del Día</span>
                  </div>
                </SheetTitle>
              </SheetHeader>
              
              <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30">
                {getEventosDelDia(selectedDate).length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-70 py-12">
                    <Calendar className="w-16 h-16 text-slate-300" />
                    <p className="text-slate-500 font-medium">No hay eventos programados para este día.</p>
                  </div>
                ) : (
                  <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                    {getEventosDelDia(selectedDate).map((evento: any, idx) => {
                      const tipo = evento.tipoAuto ? 'Cumpleaños' : evento.tipo;
                      const colores = getColorEvento(tipo, evento.prioridad);
                      
                      return (
                        <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                          {/* Timeline dot */}
                          <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-white ${colores.bg} ${colores.text} shadow-sm shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 absolute left-0 md:left-1/2 transform md:transform-none z-10`}>
                            <colores.icon className="w-4 h-4" />
                          </div>
                          
                          {/* Card */}
                          <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] ml-auto md:ml-0 cursor-pointer" onClick={() => setEventoSeleccionado(evento)}>
                            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm hover:border-emerald-400 hover:shadow-md transition-all">
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="font-bold text-slate-800 leading-tight">{evento.titulo}</h4>
                              </div>
                              <div className="flex flex-col gap-1.5 text-xs text-slate-500">
                                {evento.hora && (
                                  <div className="flex items-center gap-1.5">
                                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                                    <span className="font-medium text-slate-700">{formatearHora12(evento.hora)}</span>
                                  </div>
                                )}
                                {evento.ubicacion && (
                                  <div className="flex items-center gap-1.5">
                                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                    <span className="truncate font-medium text-slate-700">{evento.ubicacion}</span>
                                  </div>
                                )}
                                <div className="mt-2">
                                  <Badge className={`${colores.bg} ${colores.text} border-none font-semibold`}>
                                    {tipo}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              
              <div className="p-6 border-t border-slate-200 bg-white shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)] z-20">
                {puedeCrearEvento(selectedDate) ? (
                  <Button 
                    onClick={() => {
                      setCreandoEventoEnFecha(selectedDate);
                      setSelectedDate(null);
                    }} 
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-md font-bold text-base py-6"
                  >
                    <Plus className="w-5 h-5 mr-2" /> Programar Nuevo Evento
                  </Button>
                ) : (
                  <div className="text-center p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-sm flex flex-col items-center justify-center gap-2">
                    <AlertCircle className="w-6 h-6 text-amber-500" /> 
                    <span className="font-semibold">Día Reservado</span>
                    <span className="text-amber-600/80 text-xs text-balance">
                      Hay un evento general programado. No puedes crear eventos este día.
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Modal para Crear Evento */}
      <Dialog open={!!creandoEventoEnFecha} onOpenChange={(open) => !open && setCreandoEventoEnFecha(null)}>
        <DialogContent className="max-w-lg bg-slate-900 border border-white/10 text-white">
          {creandoEventoEnFecha && (
            <CrearEventoDialog 
              fecha={creandoEventoEnFecha}
              onClose={() => setCreandoEventoEnFecha(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Modal para Ver Evento */}
      <Dialog open={!!eventoSeleccionado} onOpenChange={(open) => !open && setEventoSeleccionado(null)}>
        <DialogContent className="max-w-md bg-slate-900 border border-white/10 text-white p-0 overflow-hidden">
          {eventoSeleccionado && (
            <VerEventoDialog 
              evento={eventoSeleccionado} 
              onClose={() => setEventoSeleccionado(null)} 
            />
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
};

// Componente para Leyenda
const LeyendaItem = ({ tipo }: { tipo: string }) => {
  const getColors = (t: string) => {
    if (t === 'Cumpleaños') return 'bg-pink-500/20 border-pink-500/50 text-pink-400';
    if (t === 'Alta Prioridad') return 'bg-red-500/20 border-red-500/50 text-red-400';
    if (t === 'Reunión') return 'bg-blue-500/20 border-blue-500/50 text-blue-400';
    if (t === 'Evento') return 'bg-purple-500/20 border-purple-500/50 text-purple-400';
    if (t === 'Actividad') return 'bg-green-500/20 border-green-500/50 text-green-400';
    return 'bg-white/10 border-white/20 text-white';
  };

  return (
    <div className="flex items-center gap-2 text-xs font-medium text-white/70">
      <div className={`w-3 h-3 rounded-full border ${getColors(tipo)}`}></div>
      {tipo}
    </div>
  );
};

// Componente para ver detalles de un evento
const VerEventoDialog: React.FC<{ evento: any; onClose: () => void }> = ({ evento, onClose }) => {
  const isCumple = evento.tipoAuto;
  const tipo = isCumple ? 'Cumpleaños' : evento.tipo;
  
  const getColorClasses = () => {
    if (isCumple) return 'bg-gradient-to-br from-pink-500/20 to-purple-500/20 border-pink-500/30 text-pink-400';
    if (evento.prioridad === 'Alta') return 'bg-gradient-to-br from-red-500/20 to-orange-500/20 border-red-500/30 text-red-400';
    return 'bg-gradient-to-br from-emerald-500/20 to-blue-500/20 border-emerald-500/30 text-emerald-400';
  };
  
  const Icono = isCumple ? Gift : (evento.prioridad === 'Alta' ? AlertCircle : Calendar);

  return (
    <div className="flex flex-col">
      <div className={`p-8 border-b border-white/10 flex flex-col items-center text-center ${getColorClasses()} relative overflow-hidden`}>
        <div className="absolute top-0 right-0 p-4 opacity-10 transform translate-x-1/4 -translate-y-1/4">
          <Icono className="w-32 h-32" />
        </div>
        <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-xl mb-4 relative z-10">
          <Icono className="w-8 h-8 text-current" />
        </div>
        <h3 className="font-bold text-2xl text-white relative z-10">{evento.titulo}</h3>
        <Badge className={`mt-3 bg-black/20 text-current border border-current hover:bg-black/30 relative z-10`}>
          {tipo} {evento.prioridad === 'Alta' && ' - Urgente'}
        </Badge>
      </div>
      
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 rounded-xl bg-white/5 border border-white/5">
            <p className="text-[10px] uppercase tracking-wider text-white/40 mb-1">Fecha</p>
            <div className="flex items-center gap-2 text-sm font-medium">
              <Calendar className="w-4 h-4 text-emerald-400" />
              <span>{format(new Date(evento.fecha), 'dd MMM yyyy', { locale: es })}</span>
            </div>
          </div>
          {evento.hora && (
            <div className="p-3 rounded-xl bg-white/5 border border-white/5">
              <p className="text-[10px] uppercase tracking-wider text-white/40 mb-1">Hora</p>
              <div className="flex items-center gap-2 text-sm font-medium">
                <Clock className="w-4 h-4 text-emerald-400" />
                <span>{formatearHora12(evento.hora)}</span>
              </div>
            </div>
          )}
        </div>

        {evento.ubicacion && (
          <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-white/40">Ubicación</p>
              <p className="text-sm font-medium text-white">{evento.ubicacion}</p>
            </div>
          </div>
        )}

        {evento.descripcion && (
          <div className="p-4 rounded-xl bg-black/20 border border-white/5 text-sm text-white/70 leading-relaxed">
            {evento.descripcion}
          </div>
        )}

        <div className="pt-4 border-t border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-white/50">
            <Users className="w-4 h-4" />
            <span>Por: <strong className="text-white/80">{evento.creadorNombre || 'Sistema (Automático)'}</strong></span>
          </div>
          <Button variant="ghost" onClick={onClose} className="text-white/60 hover:text-white hover:bg-white/10">
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  );
};

// Componente para crear un nuevo evento
const CrearEventoDialog: React.FC<{ fecha: Date; onClose: () => void }> = ({ fecha, onClose }) => {
  const { usuario } = useAuth();
  const [guardando, setGuardando] = useState(false);
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    tipo: 'Evento' as TipoEvento,
    hora: '',
    ubicacion: '',
    prioridad: 'Media' as PrioridadEvento,
    visibleParaTodos: false,
    gapId: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usuario) return;

    setGuardando(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    
    crearEventoCalendario({
      titulo: formData.titulo,
      descripcion: formData.descripcion,
      tipo: formData.tipo,
      fecha: fecha.toISOString().split('T')[0],
      hora: formData.hora,
      ubicacion: formData.ubicacion,
      creadorId: usuario.id,
      creadorNombre: `${usuario.nombre} ${usuario.apellidos}`,
      creadorRol: usuario.rol,
      prioridad: formData.prioridad,
      visibleParaTodos: formData.visibleParaTodos || usuario.rol === 'pastor_principal',
      gapId: formData.gapId || undefined,
      recordatorioEnviado: false,
      activo: true,
    });
    
    setGuardando(false);
    toast.success('Evento creado exitosamente');
    onClose();
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2 text-xl font-bold">
          <Plus className="w-5 h-5 text-emerald-400" />
          Programar Evento
        </DialogTitle>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="mt-4 space-y-5">
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 flex items-center justify-between">
          <span className="text-sm text-emerald-400 font-medium">Fecha Seleccionada</span>
          <span className="text-sm text-white font-bold">{format(fecha, 'dd MMM yyyy', { locale: es })}</span>
        </div>

        <div className="space-y-2">
          <Label htmlFor="titulo" className="text-white/70">Título del Evento *</Label>
          <Input
            id="titulo"
            value={formData.titulo}
            onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
            placeholder="Ej: Reunión de Consolidación"
            required
            className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-emerald-500/50"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="tipo" className="text-white/70">Tipo de Evento</Label>
            <Select 
              value={formData.tipo} 
              onValueChange={(value) => setFormData({ ...formData, tipo: value as TipoEvento })}
            >
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-white/10 text-white">
                <SelectItem value="Reunion">Reunión</SelectItem>
                <SelectItem value="Evento">Evento Especial</SelectItem>
                <SelectItem value="Actividad">Actividad</SelectItem>
                <SelectItem value="ReunionGAP">Reunión GAP</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="prioridad" className="text-white/70">Prioridad</Label>
            <Select 
              value={formData.prioridad} 
              onValueChange={(value) => setFormData({ ...formData, prioridad: value as PrioridadEvento })}
            >
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-white/10 text-white">
                <SelectItem value="Alta" className="text-red-400">Alta (Urgente)</SelectItem>
                <SelectItem value="Media" className="text-blue-400">Media</SelectItem>
                <SelectItem value="Baja" className="text-white/60">Baja</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="hora" className="text-white/70">Hora</Label>
            <Input
              id="hora"
              type="time"
              value={formData.hora}
              onChange={(e) => setFormData({ ...formData, hora: e.target.value })}
              className="bg-white/5 border-white/10 text-white dark:[color-scheme:dark]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ubicacion" className="text-white/70">Ubicación (Opcional)</Label>
            <Input
              id="ubicacion"
              value={formData.ubicacion}
              onChange={(e) => setFormData({ ...formData, ubicacion: e.target.value })}
              placeholder="Ej: Salón 3"
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="descripcion" className="text-white/70">Descripción</Label>
          <Textarea
            id="descripcion"
            value={formData.descripcion}
            onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
            placeholder="Detalles, orden del día..."
            rows={3}
            className="bg-white/5 border-white/10 text-white placeholder:text-white/30 resize-none"
          />
        </div>

        {usuario?.rol === 'pastor_principal' && (
          <div className="flex items-center space-x-2 bg-white/5 p-3 rounded-lg border border-white/10">
            <Checkbox
              id="visibleParaTodos"
              checked={formData.visibleParaTodos}
              onCheckedChange={(checked) => setFormData({ ...formData, visibleParaTodos: checked as boolean })}
              className="border-white/20 data-[state=checked]:bg-emerald-500"
            />
            <Label htmlFor="visibleParaTodos" className="font-medium text-white">
              Hacer visible globalmente
              <span className="block text-xs text-white/50 font-normal">Todos los roles podrán ver este evento.</span>
            </Label>
          </div>
        )}

        <div className="flex gap-3 pt-4 border-t border-white/10">
          <Button type="button" variant="ghost" onClick={onClose} className="flex-1 text-white/70 hover:text-white hover:bg-white/10">
            Cancelar
          </Button>
          <Button 
            type="submit" 
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
            disabled={guardando}
          >
            {guardando ? 'Guardando...' : 'Programar Evento'}
          </Button>
        </div>
      </form>
    </>
  );
};

export default CalendarioModule;
