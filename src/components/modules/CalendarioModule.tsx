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
  ArrowLeft, 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Clock, 
  MapPin, 
  Users,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { formatearHora12 } from '@/lib/utils';
import { 
  eventosCalendarioMock, 
  miembrosMock,
  crearEventoCalendario 
} from '@/data/mockData';
import type { EventoCalendario, TipoEvento, PrioridadEvento } from '@/types';
import { startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, addMonths, subMonths, startOfWeek, endOfWeek, isToday } from 'date-fns';

interface CalendarioModuleProps {
  onVolver: () => void;
}

const CalendarioModule: React.FC<CalendarioModuleProps> = ({ onVolver }) => {
  const { usuario, tema } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [eventoSeleccionado, setEventoSeleccionado] = useState<EventoCalendario | null>(null);

  // Filtrar eventos según el rol y visibilidad
  const eventosFiltrados = useMemo(() => {
    if (!usuario) return [];
    
    return eventosCalendarioMock.filter(evento => {
      // Eventos inactivos no se muestran
      if (!evento.activo) return false;
      
      // Eventos del Pastor Principal son visibles para todos
      if (evento.creadorRol === 'pastor_principal' && evento.visibleParaTodos) {
        return true;
      }
      
      // Eventos del Pastor son visibles para todos excepto timoteos
      if (evento.creadorRol === 'pastor' && evento.visibleParaTodos) {
        return true;
      }
      
      // Si es el creador, siempre ve el evento
      if (evento.creadorId === usuario.id) return true;
      
      // Verificar visibilidad por rol
      if (evento.visibleParaRoles?.includes(usuario.rol)) return true;
      
      // Verificar visibilidad por GAP
      if (evento.visibleParaGAPs && usuario.gapId && evento.visibleParaGAPs.includes(usuario.gapId)) {
        return true;
      }
      
      // Eventos específicos del GAP del usuario
      if (evento.gapId && usuario.gapId && evento.gapId === usuario.gapId) {
        return true;
      }
      
      return false;
    });
  }, [usuario]);

  // Generar cumpleaños automáticos de miembros (filtrados por GAP para Timoteo)
  const cumpleanosMiembros = useMemo(() => {
    const hoy = new Date();
    const anioActual = hoy.getFullYear();
    
    // Filtrar miembros según el rol
    const miembrosFiltrados = usuario?.rol === 'timoteo' 
      ? miembrosMock.filter(m => m.gapId === usuario.gapId)
      : miembrosMock;
    
    return miembrosFiltrados.map(miembro => {
      const fechaNacimiento = new Date(miembro.fechaNacimiento);
      const mes = fechaNacimiento.getMonth();
      const dia = fechaNacimiento.getDate();
      
      return {
        id: `cumple-${miembro.id}`,
        titulo: `🎂 ${miembro.nombres} ${miembro.apellidos}`,
        descripcion: `Cumpleaños de ${miembro.nombres} ${miembro.apellidos}`,
        tipo: 'Cumpleaños' as TipoEvento,
        fecha: new Date(anioActual, mes, dia).toISOString().split('T')[0],
        tipoAuto: true,
        gapId: miembro.gapId,
      };
    });
  }, [usuario]);

  // Navegación del calendario
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const goToToday = () => setCurrentDate(new Date());

  // Generar días del calendario
  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 0 });
    const end = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 0 });
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  // Obtener eventos de un día específico
  const getEventosDelDia = (date: Date) => {
    const fechaStr = date.toISOString().split('T')[0];
    const eventosDelDia = eventosFiltrados.filter(e => e.fecha === fechaStr);
    
    // Agregar cumpleaños si corresponde
    const cumpleanosDelDia = cumpleanosMiembros.filter(c => {
      const cumpleFecha = new Date(c.fecha);
      return cumpleFecha.getDate() === date.getDate() && cumpleFecha.getMonth() === date.getMonth();
    });
    
    return [...eventosDelDia, ...cumpleanosDelDia];
  };

  // Verificar si el usuario puede crear eventos en una fecha
  const puedeCrearEvento = (fecha: Date) => {
    if (!usuario) return false;
    
    const fechaStr = fecha.toISOString().split('T')[0];
    
    // Verificar si hay eventos de Pastor Principal en esa fecha
    const eventosPastorPrincipal = eventosCalendarioMock.filter(e => 
      e.fecha === fechaStr && 
      e.creadorRol === 'pastor_principal' && 
      e.prioridad === 'Alta' &&
      e.activo
    );
    
    // Verificar si hay eventos de Pastor en esa fecha
    const eventosPastor = eventosCalendarioMock.filter(e => 
      e.fecha === fechaStr && 
      e.creadorRol === 'pastor' && 
      e.prioridad === 'Alta' &&
      e.activo
    );
    
    // Pastor Principal siempre puede crear
    if (usuario.rol === 'pastor_principal') return true;
    
    // Pastor puede crear excepto si hay eventos del Pastor Principal
    if (usuario.rol === 'pastor') {
      return eventosPastorPrincipal.length === 0;
    }
    
    // Líder Mentor, Líder, Timoteo no pueden crear si hay eventos de Pastor Principal o Pastor
    if (['lider_mentor', 'lider_gap', 'timoteo'].includes(usuario.rol)) {
      return eventosPastorPrincipal.length === 0 && eventosPastor.length === 0;
    }
    
    return false;
  };

  // Colores por tipo de evento
  const getColorEvento = (tipo: TipoEvento, prioridad?: PrioridadEvento, esCumpleanos?: boolean) => {
    if (esCumpleanos) return { bg: 'bg-pink-100', text: 'text-pink-700', border: 'border-pink-300' };
    
    if (prioridad === 'Alta') {
      return { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300' };
    }
    
    switch (tipo) {
      case 'Reunion': return { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300' };
      case 'Evento': return { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-300' };
      case 'Actividad': return { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300' };
      case 'ReunionGAP': return { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-300' };
      default: return { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-300' };
    }
  };

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    setEventoSeleccionado(null);
    setDialogOpen(true);
  };

  const handleEventoClick = (evento: EventoCalendario, e: React.MouseEvent) => {
    e.stopPropagation();
    setEventoSeleccionado(evento);
    setDialogOpen(true);
  };

  const nombresDias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const nombresMeses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto animate-fade-in pb-24 lg:pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={onVolver} className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Volver
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Calendario de Eventos</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={goToToday} size="sm">
            Hoy
          </Button>
        </div>
      </div>

      {/* Calendario */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="w-5 h-5" style={{ color: tema.primario }} />
              {nombresMeses[currentDate.getMonth()]} {currentDate.getFullYear()}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={prevMonth}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={nextMonth}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Días de la semana */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {nombresDias.map(dia => (
              <div key={dia} className="text-center text-sm font-medium text-gray-500 py-2">
                {dia}
              </div>
            ))}
          </div>

          {/* Días del mes */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, index) => {
              const eventosDelDia = getEventosDelDia(day);
              const esHoy = isToday(day);
              const esMesActual = isSameMonth(day, currentDate);
              const puedeCrear = puedeCrearEvento(day);
              
              return (
                <div
                  key={index}
                  onClick={() => handleDayClick(day)}
                  className={`
                    min-h-[80px] sm:min-h-[100px] p-1 sm:p-2 border rounded-lg cursor-pointer transition-all
                    ${esMesActual ? 'bg-white' : 'bg-gray-50'}
                    ${esHoy ? 'ring-2 ring-blue-500' : ''}
                    ${!puedeCrear && esMesActual ? 'opacity-70' : ''}
                    hover:shadow-md
                  `}
                >
                  <div className={`text-right text-sm font-medium ${esHoy ? 'text-blue-600' : esMesActual ? 'text-gray-700' : 'text-gray-400'}`}>
                    {day.getDate()}
                  </div>
                  <div className="space-y-1 mt-1">
                    {eventosDelDia.slice(0, 3).map((evento: any, idx) => {
                      const esCumpleanos = 'tipoAuto' in evento;
                      const tipo = esCumpleanos ? 'Cumpleaños' : evento.tipo;
                      const prioridad = evento.prioridad;
                      const colores = getColorEvento(tipo as TipoEvento, prioridad, esCumpleanos);
                      
                      return (
                        <div
                          key={idx}
                          onClick={(e) => handleEventoClick(evento as EventoCalendario, e)}
                          className={`text-[10px] sm:text-xs px-1.5 py-0.5 rounded truncate ${colores.bg} ${colores.text} cursor-pointer hover:opacity-80`}
                        >
                          {evento.titulo}
                        </div>
                      );
                    })}
                    {eventosDelDia.length > 3 && (
                      <div className="text-[10px] text-gray-500 text-center">
                        +{eventosDelDia.length - 3} más
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Leyenda */}
          <div className="mt-4 flex flex-wrap gap-3 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-red-100 border border-red-300"></div>
              <span>Alta Prioridad</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-blue-100 border border-blue-300"></div>
              <span>Reunión</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-purple-100 border border-purple-300"></div>
              <span>Evento</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-green-100 border border-green-300"></div>
              <span>Actividad</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-pink-100 border border-pink-300"></div>
              <span>Cumpleaños</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialog para crear/ver evento */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          {eventoSeleccionado ? (
            <VerEventoDialog 
              evento={eventoSeleccionado} 
              onClose={() => setDialogOpen(false)} 
            />
          ) : selectedDate ? (
            <CrearEventoDialog 
              fecha={selectedDate}
              onClose={() => setDialogOpen(false)}
              puedeCrear={puedeCrearEvento(selectedDate)}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Componente para ver detalles de un evento
const VerEventoDialog: React.FC<{ evento: EventoCalendario; onClose: () => void }> = ({ evento, onClose }) => {
  const { tema } = useAuth();
  const colores = evento.tipo === 'Cumpleaños' 
    ? { bg: 'bg-pink-100', text: 'text-pink-700' }
    : evento.prioridad === 'Alta'
    ? { bg: 'bg-red-100', text: 'text-red-700' }
    : { bg: 'bg-blue-100', text: 'text-blue-700' };

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-lg ${colores.bg} flex items-center justify-center`}>
            <Calendar className={`w-4 h-4 ${colores.text}`} />
          </div>
          Detalle del Evento
        </DialogTitle>
      </DialogHeader>
      
      <div className="space-y-4 mt-4">
        <div>
          <h3 className="font-semibold text-lg">{evento.titulo}</h3>
          <Badge 
            variant="outline" 
            className={
              evento.tipo === 'Cumpleaños' 
                ? 'bg-pink-100 text-pink-700 border-pink-200' 
                : evento.prioridad === 'Alta' 
                ? 'bg-red-100 text-red-700 border-red-200' 
                : 'bg-blue-100 text-blue-700 border-blue-200'
            }
          >
            {evento.tipo === 'Cumpleaños' ? 'Cumpleaños' : evento.prioridad === 'Alta' ? 'Alta Prioridad' : evento.tipo}
          </Badge>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>{new Date(evento.fecha).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
          {evento.hora && (
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="w-4 h-4" />
              <span>{formatearHora12(evento.hora)}</span>
            </div>
          )}
          {evento.ubicacion && (
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="w-4 h-4" />
              <span>{evento.ubicacion}</span>
            </div>
          )}
        </div>

        {evento.descripcion && (
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-sm text-gray-700">{evento.descripcion}</p>
          </div>
        )}

        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Users className="w-4 h-4" />
          <span>Creado por: {evento.creadorNombre || 'Sistema (Automático)'}</span>
        </div>

        <Button onClick={onClose} className="w-full" style={{ backgroundColor: tema.primario }}>
          Cerrar
        </Button>
      </div>
    </>
  );
};

// Componente para crear un nuevo evento
const CrearEventoDialog: React.FC<{ fecha: Date; onClose: () => void; puedeCrear: boolean }> = ({ 
  fecha, 
  onClose,
  puedeCrear 
}) => {
  const { usuario, tema } = useAuth();
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
    
    // Simular creación
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

  if (!puedeCrear) {
    return (
      <>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-orange-500" />
            No Se Puede Crear Evento
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4 space-y-4">
          <p className="text-gray-600">
            Esta fecha tiene eventos de alta prioridad creados por el Pastor Principal o Pastor. 
            No se pueden crear eventos adicionales.
          </p>
          <Button onClick={onClose} variant="outline" className="w-full">
            Cerrar
          </Button>
        </div>
      </>
    );
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Plus className="w-5 h-5" style={{ color: tema.primario }} />
          Crear Nuevo Evento
        </DialogTitle>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div className="bg-blue-50 rounded-lg p-3">
          <p className="text-sm text-blue-700">
            <strong>Fecha:</strong> {fecha.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="titulo">Título del Evento *</Label>
          <Input
            id="titulo"
            value={formData.titulo}
            onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
            placeholder="Ej: Reunión de Líderes"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="tipo">Tipo de Evento</Label>
            <Select 
              value={formData.tipo} 
              onValueChange={(value) => setFormData({ ...formData, tipo: value as TipoEvento })}
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
          <div className="space-y-2">
            <Label htmlFor="prioridad">Prioridad</Label>
            <Select 
              value={formData.prioridad} 
              onValueChange={(value) => setFormData({ ...formData, prioridad: value as PrioridadEvento })}
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

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="hora">Hora</Label>
            <Input
              id="hora"
              type="time"
              value={formData.hora}
              onChange={(e) => setFormData({ ...formData, hora: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ubicacion">Ubicación</Label>
            <Input
              id="ubicacion"
              value={formData.ubicacion}
              onChange={(e) => setFormData({ ...formData, ubicacion: e.target.value })}
              placeholder="Ej: Salón Principal"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="descripcion">Descripción</Label>
          <Textarea
            id="descripcion"
            value={formData.descripcion}
            onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
            placeholder="Detalles del evento..."
            rows={3}
          />
        </div>

        {usuario?.rol === 'pastor_principal' && (
          <div className="flex items-center space-x-2">
            <Checkbox
              id="visibleParaTodos"
              checked={formData.visibleParaTodos}
              onCheckedChange={(checked) => setFormData({ ...formData, visibleParaTodos: checked as boolean })}
            />
            <Label htmlFor="visibleParaTodos" className="font-normal">
              Visible para todos los roles
            </Label>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button 
            type="submit" 
            className="flex-1 text-white"
            style={{ backgroundColor: tema.primario }}
            disabled={guardando}
          >
            {guardando ? 'Guardando...' : 'Crear Evento'}
          </Button>
        </div>
      </form>
    </>
  );
};

export default CalendarioModule;
