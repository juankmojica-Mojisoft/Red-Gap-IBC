import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  MapPin, 
  Users, 
  Calendar, 
  Clock, 
  Search, 
  Plus,
  MoreVertical,
  User
} from 'lucide-react';
import { gapsMock } from '@/data/mockData';
import type { GAP } from '@/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatearHora12 } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ListaGAPsProps {
  onVolver: () => void;
  onNuevo?: () => void;
  onVerGAP?: (gap: GAP) => void;
  onEditarGAP?: (gap: GAP) => void;
}

const ListaGAPs: React.FC<ListaGAPsProps> = ({ onVolver, onNuevo, onVerGAP, onEditarGAP }) => {
  const { usuario, tema, tienePermiso } = useAuth();
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<'todos' | 'activos' | 'inactivos'>('todos');
  const [gapDetalle, setGapDetalle] = useState<GAP | null>(null);

  // Filtrar GAPs según el rol del usuario
  const getGAPsFiltrados = () => {
    let gaps = gapsMock;
    
    if (usuario?.rol === 'pastor') {
      gaps = gaps.filter(g => g.pastorId === usuario.id);
    } else if (usuario?.rol === 'lider_mentor') {
      gaps = gaps.filter(g => g.liderMentorId === usuario.id);
    } else if (usuario?.rol === 'lider_gap') {
      gaps = gaps.filter(g => g.liderGapId === usuario.id);
    }
    
    // Aplicar filtro de búsqueda
    if (busqueda) {
      gaps = gaps.filter(g => 
        g.codigo.toLowerCase().includes(busqueda.toLowerCase()) ||
        g.barrio.toLowerCase().includes(busqueda.toLowerCase())
      );
    }
    
    // Aplicar filtro de estado
    if (filtroEstado === 'activos') {
      gaps = gaps.filter(g => g.activo);
    } else if (filtroEstado === 'inactivos') {
      gaps = gaps.filter(g => !g.activo);
    }
    
    return gaps;
  };

  const gaps = getGAPsFiltrados();
  const gapsActivos = gaps.filter(g => g.activo);
  const gapsInactivos = gaps.filter(g => !g.activo);

  return (
    <div className="p-6 max-w-6xl mx-auto animate-fade-in pb-24 lg:pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onVolver} className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Volver
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">GAPs Activos</h1>
        </div>
        {tienePermiso('crearGAP') && onNuevo && (
          <Button 
            onClick={onNuevo}
            className="text-white"
            style={{ backgroundColor: tema.primario }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Nuevo GAP
          </Button>
        )}
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold" style={{ color: tema.primario }}>{gaps.length}</p>
            <p className="text-xs text-gray-500">Total GAPs</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold" style={{ color: tema.exito }}>{gapsActivos.length}</p>
            <p className="text-xs text-gray-500">Activos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold" style={{ color: tema.error }}>{gapsInactivos.length}</p>
            <p className="text-xs text-gray-500">Inactivos</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Buscar por nombre, barrio o código..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={filtroEstado === 'todos' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFiltroEstado('todos')}
            style={filtroEstado === 'todos' ? { backgroundColor: tema.primario } : {}}
          >
            Todos
          </Button>
          <Button
            variant={filtroEstado === 'activos' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFiltroEstado('activos')}
            style={filtroEstado === 'activos' ? { backgroundColor: tema.exito } : {}}
          >
            Activos
          </Button>
          <Button
            variant={filtroEstado === 'inactivos' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFiltroEstado('inactivos')}
            style={filtroEstado === 'inactivos' ? { backgroundColor: tema.error } : {}}
          >
            Inactivos
          </Button>
        </div>
      </div>

      {/* Lista de GAPs */}
      <div className="space-y-4">
        {gaps.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <MapPin className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay GAPs registrados</h3>
              <p className="text-gray-500 mb-4">
                {usuario?.rol === 'pastor_principal' 
                  ? 'Comience creando el primer GAP del sistema.'
                  : 'No tiene GAPs asignados a su custodia.'}
              </p>
              {tienePermiso('crearGAP') && onNuevo && (
                <Button 
                  onClick={onNuevo}
                  style={{ backgroundColor: tema.primario }}
                  className="text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Crear GAP
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          gaps.map((gap) => (
            <Card 
              key={gap.id} 
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => { setGapDetalle(gap); onVerGAP?.(gap); }}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg">{gap.codigo}</h3>
                      <Badge 
                        variant="outline"
                        className={gap.activo 
                          ? 'bg-green-100 text-green-700 border-green-300' 
                          : 'bg-gray-100 text-gray-700 border-gray-300'
                        }
                      >
                        {gap.activo ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="w-4 h-4" style={{ color: tema.primario }} />
                        <span>{gap.barrio}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4" style={{ color: tema.primario }} />
                        <span>{gap.diaReunion}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="w-4 h-4" style={{ color: tema.primario }} />
                        <span>{formatearHora12(gap.horaReunion)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Users className="w-4 h-4" style={{ color: tema.primario }} />
                        <span>{gap.miembros.length + 2} miembros</span>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-500">Líder:</span>
                        <span className="font-medium">{gap.liderGapNombre}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-500">Timoteo:</span>
                        <span className="font-medium">{gap.timoteoNombre}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-500">Pastor:</span>
                        <span className="font-medium">{gap.pastorNombre}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-500">Líder Mentor:</span>
                        <span className="font-medium">{gap.liderMentorNombre}</span>
                      </div>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setGapDetalle(gap); onVerGAP?.(gap); }}>
                        Ver detalles
                      </DropdownMenuItem>
                      {tienePermiso('editarGAP') && (
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEditarGAP?.(gap); }}>
                          Editar GAP
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Dialogo de detalle del GAP */}
      <Dialog open={!!gapDetalle} onOpenChange={(open) => !open && setGapDetalle(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto border border-white/10 text-white bg-[var(--color-card-glass)] backdrop-blur-md">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between text-xl font-bold border-b border-white/10 pb-3 text-white">
              <div className="flex items-center gap-2">
                <MapPin className="w-6 h-6 text-emerald-400" />
                <span>Detalles del Grupo {gapDetalle?.codigo}</span>
              </div>
              <Badge className={gapDetalle?.activo ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-white/10 text-white/60 border border-white/5"}>
                {gapDetalle?.activo ? "Activo" : "Inactivo"}
              </Badge>
            </DialogTitle>
          </DialogHeader>
          
          {gapDetalle && (
            <div className="space-y-6 pt-4">
              {/* Grid de Información de Reunión */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/5">
                  <p className="text-[10px] text-white/40 uppercase tracking-wider font-semibold">Día de Reunión</p>
                  <p className="text-sm font-semibold text-white mt-1">{gapDetalle.diaReunion}</p>
                </div>
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/5">
                  <p className="text-[10px] text-white/40 uppercase tracking-wider font-semibold">Hora de Reunión</p>
                  <p className="text-sm font-semibold text-white mt-1">{formatearHora12(gapDetalle.horaReunion)}</p>
                </div>
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/5">
                  <p className="text-[10px] text-white/40 uppercase tracking-wider font-semibold">Frecuencia</p>
                  <p className="text-sm font-semibold text-white mt-1">{gapDetalle.frecuencia}</p>
                </div>
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/5">
                  <p className="text-[10px] text-white/40 uppercase tracking-wider font-semibold">Modalidad</p>
                  <p className="text-sm font-semibold text-white mt-1">{gapDetalle.modalidad}</p>
                </div>
              </div>

              {/* Ubicación y Dirección */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-3">
                <h4 className="text-xs font-bold text-white/80 uppercase tracking-wider">Ubicación y Contacto</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-white/70">
                  <div className="flex items-center gap-2.5">
                    <MapPin className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span><strong>Dirección:</strong> {gapDetalle.direccion}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <MapPin className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span><strong>Barrio:</strong> {gapDetalle.barrio} ({gapDetalle.departamento})</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Users className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span><strong>Lugar de reunión:</strong> {gapDetalle.ubicacionReunion}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Clock className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span><strong>Creado el:</strong> {gapDetalle.fechaCreacion}</span>
                  </div>
                </div>
              </div>

              {/* Liderazgo a Cargo */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                <h4 className="text-xs font-bold text-white/80 uppercase tracking-wider mb-3">Liderazgo a Cargo</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.05] flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">L</div>
                    <div>
                      <p className="text-[10px] text-white/40 uppercase tracking-wider">Líder del GAP</p>
                      <p className="text-sm font-semibold text-white">{gapDetalle.liderGapNombre}</p>
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.05] flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">T</div>
                    <div>
                      <p className="text-[10px] text-white/40 uppercase tracking-wider">Timoteo</p>
                      <p className="text-sm font-semibold text-white">{gapDetalle.timoteoNombre}</p>
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.05] flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">P</div>
                    <div>
                      <p className="text-[10px] text-white/40 uppercase tracking-wider">Pastor Asignado</p>
                      <p className="text-sm font-semibold text-white">{gapDetalle.pastorNombre}</p>
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.05] flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">M</div>
                    <div>
                      <p className="text-[10px] text-white/40 uppercase tracking-wider">Líder Mentor</p>
                      <p className="text-sm font-semibold text-white">{gapDetalle.liderMentorNombre}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Integrantes / Miembros */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-white/80 uppercase tracking-wider">Integrantes del Grupo ({gapDetalle.miembros.length})</h4>
                  <span className="text-[10px] text-white/40">Máximo 10 miembros</span>
                </div>
                {gapDetalle.miembros.length === 0 ? (
                  <div className="text-center py-6 rounded-xl bg-white/5 border border-white/5 text-white/50 text-sm">
                    No hay miembros registrados en este grupo.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
                    {gapDetalle.miembros.map((miembro, index) => (
                      <div key={miembro.id || index} className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-emerald-600/30 text-emerald-400 flex items-center justify-center font-bold text-xs">
                            {miembro.nombres.charAt(0)}{miembro.apellidos.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-white">{miembro.nombres} {miembro.apellidos}</p>
                            <p className="text-[10px] text-white/40">{miembro.telefono} • {miembro.barrio}</p>
                          </div>
                        </div>
                        <div className="flex gap-1.5 flex-wrap">
                          {miembro.esMiembroIBC && (
                            <Badge className="bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px]">IBC</Badge>
                          )}
                          {miembro.esBautizado && (
                            <Badge className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[10px]">Bautizado</Badge>
                          )}
                          {miembro.escuelaFormacion === 'Graduado' && (
                            <Badge className="bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[10px]">EFC</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ListaGAPs;
