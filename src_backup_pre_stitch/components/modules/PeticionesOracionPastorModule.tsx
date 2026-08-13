import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { 
  Hand, 
  Plus, 
  Search, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  TrendingUp,
  Users,
  MessageSquare,
  Calendar
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';

// Tipos para peticiones de oración
interface SeguimientoPeticion {
  id: string;
  fecha: string;
  comentario: string;
  tipo: 'Oracion' | 'Visita' | 'Llamada' | 'Mensaje' | 'Otro';
  realizadoPor: string;
}

interface PeticionOracionCompleta {
  id: string;
  titulo: string;
  descripcion: string;
  creadorId: string;
  creadorNombre: string;
  creadorRol: string;
  gapId?: string;
  gapCodigo?: string;
  fechaCreacion: string;
  estado: 'Pendiente' | 'En Proceso' | 'Respondida' | 'Cerrada';
  prioridad: 'Baja' | 'Media' | 'Alta' | 'Urgente';
  categoria: 'Salud' | 'Familia' | 'Economica' | 'Espiritual' | 'Laboral' | 'Otra';
  seguimientos: SeguimientoPeticion[];
  respuestaRecibida?: string;
  fechaRespuesta?: string;
}

// Mock data para peticiones
const peticionesMock: PeticionOracionCompleta[] = [
  {
    id: 'pet1',
    titulo: 'Oración por recuperación de salud',
    descripcion: 'Hermana María necesita oración por su cirugía de corazón programada para la próxima semana.',
    creadorId: '6',
    creadorNombre: 'Juan Pérez Díaz',
    creadorRol: 'lider_gap',
    gapId: 'gap1',
    gapCodigo: 'GAP-1',
    fechaCreacion: '2026-03-10',
    estado: 'En Proceso',
    prioridad: 'Alta',
    categoria: 'Salud',
    seguimientos: [
      { id: 'seg1', fecha: '2026-03-11', comentario: 'Se visitó a la hermana María, se oró con ella y su familia.', tipo: 'Visita', realizadoPor: 'Pedro Sánchez' },
      { id: 'seg2', fecha: '2026-03-13', comentario: 'Llamada de seguimiento, se siente tranquila y agradecida.', tipo: 'Llamada', realizadoPor: 'Pedro Sánchez' },
    ],
  },
  {
    id: 'pet2',
    titulo: 'Provisión para pago de arriendo',
    descripcion: 'Familia García está pasando por dificultades económicas y necesita ayuda para el pago de arriendo.',
    creadorId: '5',
    creadorNombre: 'Luis Hernández',
    creadorRol: 'lider_mentor',
    gapId: 'gap1',
    gapCodigo: 'GAP-1',
    fechaCreacion: '2026-03-08',
    estado: 'Pendiente',
    prioridad: 'Urgente',
    categoria: 'Economica',
    seguimientos: [],
  },
  {
    id: 'pet3',
    titulo: 'Restauración matrimonial',
    descripcion: 'Oración por la restauración del matrimonio de los hermanos López.',
    creadorId: '7',
    creadorNombre: 'Sofía López',
    creadorRol: 'timoteo',
    gapId: 'gap2',
    gapCodigo: 'GAP-2',
    fechaCreacion: '2026-03-01',
    estado: 'Respondida',
    prioridad: 'Media',
    categoria: 'Familia',
    seguimientos: [
      { id: 'seg3', fecha: '2026-03-05', comentario: 'Primera reunión de consejería con la pareja.', tipo: 'Otro', realizadoPor: 'Pedro Sánchez' },
      { id: 'seg4', fecha: '2026-03-12', comentario: 'La pareja asistió a la reunión de matrimonios.', tipo: 'Otro', realizadoPor: 'Pedro Sánchez' },
    ],
    respuestaRecibida: 'La pareja está en proceso de reconciliación y asistiendo a consejería.',
    fechaRespuesta: '2026-03-14',
  },
  {
    id: 'pet4',
    titulo: 'Empleo para hermano desempleado',
    descripcion: 'Hermano Carlos lleva 3 meses sin empleo, necesita oración por un trabajo.',
    creadorId: '6',
    creadorNombre: 'Juan Pérez Díaz',
    creadorRol: 'lider_gap',
    gapId: 'gap1',
    gapCodigo: 'GAP-1',
    fechaCreacion: '2026-03-05',
    estado: 'En Proceso',
    prioridad: 'Media',
    categoria: 'Laboral',
    seguimientos: [
      { id: 'seg5', fecha: '2026-03-10', comentario: 'Se enviaron referencias a dos empresas.', tipo: 'Otro', realizadoPor: 'Pedro Sánchez' },
    ],
  },
  {
    id: 'pet5',
    titulo: 'Conversión de familiar',
    descripcion: 'Oración por la conversión del hijo de la hermana Carmen.',
    creadorId: '6',
    creadorNombre: 'Juan Pérez Díaz',
    creadorRol: 'lider_gap',
    gapId: 'gap1',
    gapCodigo: 'GAP-1',
    fechaCreacion: '2026-02-20',
    estado: 'Cerrada',
    prioridad: 'Baja',
    categoria: 'Espiritual',
    seguimientos: [
      { id: 'seg6', fecha: '2026-02-25', comentario: 'Se ha estado orando constantemente.', tipo: 'Oracion', realizadoPor: 'Pedro Sánchez' },
    ],
    respuestaRecibida: 'El joven asistió al culto dominical y mostró interés.',
    fechaRespuesta: '2026-03-01',
  },
];

const PeticionesOracionPastorModule: React.FC = () => {
  const { usuario, tema } = useAuth();
  const [peticiones, setPeticiones] = useState<PeticionOracionCompleta[]>(peticionesMock);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  const [filtroPrioridad, setFiltroPrioridad] = useState<string>('todos');
  const [peticionSeleccionada, setPeticionSeleccionada] = useState<PeticionOracionCompleta | null>(null);
  const [dialogoSeguimientoAbierto, setDialogoSeguimientoAbierto] = useState(false);
  const [nuevoSeguimiento, setNuevoSeguimiento] = useState({
    comentario: '',
    tipo: 'Oracion' as SeguimientoPeticion['tipo']
  });

  // Filtrar peticiones
  const peticionesFiltradas = peticiones.filter(p => {
    const coincideBusqueda = p.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
                            p.descripcion.toLowerCase().includes(busqueda.toLowerCase()) ||
                            p.creadorNombre.toLowerCase().includes(busqueda.toLowerCase());
    const coincideEstado = filtroEstado === 'todos' || p.estado === filtroEstado;
    const coincidePrioridad = filtroPrioridad === 'todos' || p.prioridad === filtroPrioridad;
    return coincideBusqueda && coincideEstado && coincidePrioridad;
  });

  // Estadísticas
  const stats = {
    total: peticiones.length,
    pendientes: peticiones.filter(p => p.estado === 'Pendiente').length,
    enProceso: peticiones.filter(p => p.estado === 'En Proceso').length,
    respondidas: peticiones.filter(p => p.estado === 'Respondida').length,
    urgentes: peticiones.filter(p => p.prioridad === 'Urgente' && p.estado !== 'Cerrada' && p.estado !== 'Respondida').length,
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'Pendiente': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'En Proceso': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Respondida': return 'bg-green-100 text-green-800 border-green-200';
      case 'Cerrada': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPrioridadColor = (prioridad: string) => {
    switch (prioridad) {
      case 'Urgente': return 'bg-red-100 text-red-800';
      case 'Alta': return 'bg-orange-100 text-orange-800';
      case 'Media': return 'bg-yellow-100 text-yellow-800';
      case 'Baja': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoriaIcon = (categoria: string) => {
    switch (categoria) {
      case 'Salud': return '❤️';
      case 'Familia': return '👨‍👩‍👧‍👦';
      case 'Economica': return '💰';
      case 'Espiritual': return '✝️';
      case 'Laboral': return '💼';
      default: return '🙏';
    }
  };

  const calcularProgreso = (peticion: PeticionOracionCompleta) => {
    const diasTranscurridos = differenceInDays(new Date(), new Date(peticion.fechaCreacion));
    const seguimientos = peticion.seguimientos.length;
    if (peticion.estado === 'Respondida' || peticion.estado === 'Cerrada') return 100;
    if (seguimientos === 0) return 10;
    return Math.min(25 + (seguimientos * 15) + (diasTranscurridos * 2), 90);
  };

  const agregarSeguimiento = () => {
    if (!peticionSeleccionada || !nuevoSeguimiento.comentario.trim()) return;

    const seguimiento: SeguimientoPeticion = {
      id: `seg${Date.now()}`,
      fecha: new Date().toISOString().split('T')[0],
      comentario: nuevoSeguimiento.comentario,
      tipo: nuevoSeguimiento.tipo,
      realizadoPor: usuario?.nombre || 'Pastor',
    };

    const peticionesActualizadas = peticiones.map(p => {
      if (p.id === peticionSeleccionada.id) {
        return {
          ...p,
          estado: 'En Proceso' as const,
          seguimientos: [...p.seguimientos, seguimiento]
        };
      }
      return p;
    });

    setPeticiones(peticionesActualizadas);
    setNuevoSeguimiento({ comentario: '', tipo: 'Oracion' });
    setDialogoSeguimientoAbierto(false);
    
    // Actualizar la petición seleccionada
    const peticionActualizada = peticionesActualizadas.find(p => p.id === peticionSeleccionada.id);
    if (peticionActualizada) {
      setPeticionSeleccionada(peticionActualizada);
    }
  };

  return (
    <div className="space-y-6 pb-24 lg:pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Peticiones de Oración</h2>
          <p className="text-gray-500">Gestión y seguimiento de peticiones de tu red</p>
        </div>
        <Button 
          style={{ backgroundColor: tema.primario }}
          className="text-white"
          onClick={() => setPeticionSeleccionada({
            id: 'nueva',
            titulo: '',
            descripcion: '',
            creadorId: usuario?.id || '',
            creadorNombre: usuario?.nombre || '',
            creadorRol: usuario?.rol || '',
            fechaCreacion: new Date().toISOString().split('T')[0],
            estado: 'Pendiente',
            prioridad: 'Media',
            categoria: 'Otra',
            seguimientos: [],
          } as PeticionOracionCompleta)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Nueva Petición
        </Button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Hand className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pendientes</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pendientes}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">En Proceso</p>
                <p className="text-2xl font-bold text-blue-600">{stats.enProceso}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Respondidas</p>
                <p className="text-2xl font-bold text-green-600">{stats.respondidas}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Urgentes</p>
                <p className="text-2xl font-bold text-red-600">{stats.urgentes}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar peticiones..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filtroEstado} onValueChange={setFiltroEstado}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los estados</SelectItem>
                <SelectItem value="Pendiente">Pendiente</SelectItem>
                <SelectItem value="En Proceso">En Proceso</SelectItem>
                <SelectItem value="Respondida">Respondida</SelectItem>
                <SelectItem value="Cerrada">Cerrada</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filtroPrioridad} onValueChange={setFiltroPrioridad}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Prioridad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas las prioridades</SelectItem>
                <SelectItem value="Urgente">Urgente</SelectItem>
                <SelectItem value="Alta">Alta</SelectItem>
                <SelectItem value="Media">Media</SelectItem>
                <SelectItem value="Baja">Baja</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Peticiones */}
      <div className="space-y-4">
        {peticionesFiltradas.map((peticion) => (
          <Card 
            key={peticion.id} 
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => setPeticionSeleccionada(peticion)}
          >
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                {/* Icono y categoría */}
                <div className="flex items-center gap-3 lg:w-48">
                  <span className="text-3xl">{getCategoriaIcon(peticion.categoria)}</span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{peticion.categoria}</p>
                    <p className="text-xs text-gray-500">{peticion.gapCodigo}</p>
                  </div>
                </div>

                {/* Contenido principal */}
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h3 className="font-semibold text-gray-900">{peticion.titulo}</h3>
                    <Badge className={getEstadoColor(peticion.estado)}>{peticion.estado}</Badge>
                    <Badge className={getPrioridadColor(peticion.prioridad)}>{peticion.prioridad}</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{peticion.descripcion}</p>
                  
                  {/* Progreso */}
                  <div className="flex items-center gap-3">
                    <Progress value={calcularProgreso(peticion)} className="flex-1 h-2" />
                    <span className="text-xs text-gray-500 whitespace-nowrap">
                      {calcularProgreso(peticion)}%
                    </span>
                  </div>

                  {/* Seguimientos */}
                  <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-4 h-4" />
                      {peticion.seguimientos.length} seguimientos
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {format(new Date(peticion.fechaCreacion), 'dd MMM yyyy', { locale: es })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {peticion.creadorNombre}
                    </span>
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex lg:flex-col gap-2">
                  {peticion.estado !== 'Respondida' && peticion.estado !== 'Cerrada' && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPeticionSeleccionada(peticion);
                        setDialogoSeguimientoAbierto(true);
                      }}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Seguimiento
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {peticionesFiltradas.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Hand className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No se encontraron peticiones con los filtros seleccionados</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Diálogo de detalle de petición */}
      <Dialog open={!!peticionSeleccionada && !dialogoSeguimientoAbierto} onOpenChange={() => setPeticionSeleccionada(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {peticionSeleccionada && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <span className="text-2xl">{getCategoriaIcon(peticionSeleccionada.categoria)}</span>
                  {peticionSeleccionada.titulo}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6">
                {/* Información general */}
                <div className="flex flex-wrap gap-2">
                  <Badge className={getEstadoColor(peticionSeleccionada.estado)}>
                    {peticionSeleccionada.estado}
                  </Badge>
                  <Badge className={getPrioridadColor(peticionSeleccionada.prioridad)}>
                    {peticionSeleccionada.prioridad}
                  </Badge>
                  <Badge variant="outline">{peticionSeleccionada.gapCodigo}</Badge>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Descripción</h4>
                  <p className="text-gray-600">{peticionSeleccionada.descripcion}</p>
                </div>

                {/* Progreso */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">Progreso</h4>
                    <span className="text-sm font-medium" style={{ color: tema.primario }}>
                      {calcularProgreso(peticionSeleccionada)}%
                    </span>
                  </div>
                  <Progress value={calcularProgreso(peticionSeleccionada)} className="h-3" />
                </div>

                {/* Información de creación */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Creado por:</span>
                    <p className="font-medium">{peticionSeleccionada.creadorNombre}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Fecha:</span>
                    <p className="font-medium">
                      {format(new Date(peticionSeleccionada.fechaCreacion), 'dd MMMM yyyy', { locale: es })}
                    </p>
                  </div>
                </div>

                {/* Respuesta recibida */}
                {peticionSeleccionada.respuestaRecibida && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-medium text-green-800 mb-2 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      Respuesta Recibida
                    </h4>
                    <p className="text-green-700">{peticionSeleccionada.respuestaRecibida}</p>
                    <p className="text-sm text-green-600 mt-2">
                      {peticionSeleccionada.fechaRespuesta && 
                        format(new Date(peticionSeleccionada.fechaRespuesta), 'dd MMMM yyyy', { locale: es })}
                    </p>
                  </div>
                )}

                {/* Historial de seguimientos */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-gray-900">Historial de Seguimientos</h4>
                    {peticionSeleccionada.estado !== 'Respondida' && peticionSeleccionada.estado !== 'Cerrada' && (
                      <Button 
                        size="sm"
                        onClick={() => setDialogoSeguimientoAbierto(true)}
                        style={{ backgroundColor: tema.primario }}
                        className="text-white"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Agregar
                      </Button>
                    )}
                  </div>

                  <div className="space-y-3">
                    {peticionSeleccionada.seguimientos.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">No hay seguimientos registrados</p>
                    ) : (
                      peticionSeleccionada.seguimientos.map((seg) => (
                        <div key={seg.id} className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{seg.tipo}</Badge>
                              <span className="text-sm text-gray-500">
                                {format(new Date(seg.fecha), 'dd MMM yyyy', { locale: es })}
                              </span>
                            </div>
                            <span className="text-sm text-gray-600">{seg.realizadoPor}</span>
                          </div>
                          <p className="text-gray-700">{seg.comentario}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Diálogo de nuevo seguimiento */}
      <Dialog open={dialogoSeguimientoAbierto} onOpenChange={setDialogoSeguimientoAbierto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar Seguimiento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Tipo de seguimiento</label>
              <Select 
                value={nuevoSeguimiento.tipo} 
                onValueChange={(v) => setNuevoSeguimiento({ ...nuevoSeguimiento, tipo: v as SeguimientoPeticion['tipo'] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Oracion">Oración</SelectItem>
                  <SelectItem value="Visita">Visita</SelectItem>
                  <SelectItem value="Llamada">Llamada</SelectItem>
                  <SelectItem value="Mensaje">Mensaje</SelectItem>
                  <SelectItem value="Otro">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Comentario</label>
              <Textarea
                value={nuevoSeguimiento.comentario}
                onChange={(e) => setNuevoSeguimiento({ ...nuevoSeguimiento, comentario: e.target.value })}
                placeholder="Describa el seguimiento realizado..."
                rows={4}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setDialogoSeguimientoAbierto(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={agregarSeguimiento}
                style={{ backgroundColor: tema.primario }}
                className="text-white"
                disabled={!nuevoSeguimiento.comentario.trim()}
              >
                Guardar Seguimiento
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PeticionesOracionPastorModule;
