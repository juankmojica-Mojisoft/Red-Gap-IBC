import React, { useState, useEffect } from 'react';
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
  User,
  Trash2,
  Power,
  PowerOff
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
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

interface ListaGAPsProps {
  onVolver: () => void;
  onNuevo?: () => void;
  onVerGAP?: (gap: GAP) => void;
  onEditarGAP?: (gap: GAP) => void;
}

const ListaGAPs: React.FC<ListaGAPsProps> = ({ onVolver, onNuevo, onVerGAP, onEditarGAP }) => {
  const { usuario, tienePermiso } = useAuth();
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<'todos' | 'activos' | 'inactivos' | 'eliminados'>('todos');
  const [gapDetalle, setGapDetalle] = useState<GAP | null>(null);
  
  // Nuevo estado para la eliminación
  const [gapAEliminar, setGapAEliminar] = useState<string | null>(null);

  // Inicializar estado local de GAPs con localStorage o mock
  const [gaps, setGaps] = useState<GAP[]>(() => {
    const saved = localStorage.getItem('gaps');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return gapsMock;
  });

  useEffect(() => {
    localStorage.setItem('gaps', JSON.stringify(gaps));
  }, [gaps]);

  // Filtrar GAPs según el rol del usuario y los que no están eliminados lógicamente (o eliminados hace >24h)
  const getGAPsFiltrados = () => {
    let filtrados = gaps;
    
    if (filtroEstado === 'eliminados') {
      filtrados = filtrados.filter(g => g.fechaEliminacion);
    } else {
      filtrados = filtrados.filter(g => !g.fechaEliminacion);
    }
    
    if (usuario?.rol === 'pastor') {
      filtrados = filtrados.filter(g => g.pastorId === usuario.id);
    } else if (usuario?.rol === 'lider_mentor') {
      filtrados = filtrados.filter(g => g.liderMentorId === usuario.id);
    } else if (usuario?.rol === 'lider_gap') {
      filtrados = filtrados.filter(g => g.liderGapId === usuario.id);
    }
    
    // Aplicar filtro de búsqueda
    if (busqueda) {
      filtrados = filtrados.filter(g => 
        g.codigo.toLowerCase().includes(busqueda.toLowerCase()) ||
        g.barrio.toLowerCase().includes(busqueda.toLowerCase())
      );
    }
    
    // Aplicar filtro de estado
    if (filtroEstado === 'activos') {
      filtrados = filtrados.filter(g => g.activo);
    } else if (filtroEstado === 'inactivos') {
      filtrados = filtrados.filter(g => !g.activo);
    }
    
    return filtrados;
  };

  const gapsFiltrados = getGAPsFiltrados();

  // Cambiar estado de Activo/Inactivo
  const toggleEstadoGAP = (gapId: string) => {
    const nuevosGaps = gaps.map(g => {
      if (g.id === gapId) {
        const nuevoEstado = !g.activo;
        toast.success(`El grupo ha sido ${nuevoEstado ? 'activado' : 'desactivado'}.`);
        
        // Actualizar también en el detalle si está abierto
        if (gapDetalle?.id === gapId) {
          setGapDetalle({ ...g, activo: nuevoEstado });
        }
        
        return { ...g, activo: nuevoEstado };
      }
      return g;
    });
    setGaps(nuevosGaps);
  };

  // Enviar a papelera de reciclaje (soft delete 24h)
  const handleEliminarGAP = () => {
    if (!gapAEliminar) return;

    const fechaEliminacion = new Date().toISOString();
    const nuevosGaps = gaps.map(g => {
      if (g.id === gapAEliminar) {
        return { ...g, fechaEliminacion };
      }
      return g;
    });
    
    setGaps(nuevosGaps);
    
    // Guardar el número reciclado para uso futuro
    const gapEliminado = gaps.find(g => g.id === gapAEliminar);
    if (gapEliminado) {
      // 1. Guardar el número reciclado
      const disponibles = localStorage.getItem('numerosGAPsDisponibles');
      const numeros = disponibles ? JSON.parse(disponibles) : [];
      if (!numeros.includes(gapEliminado.numero)) {
        numeros.push(gapEliminado.numero);
        // Ordenar de menor a mayor
        numeros.sort((a: number, b: number) => a - b);
        localStorage.setItem('numerosGAPsDisponibles', JSON.stringify(numeros));
      }
      
      // 2. Liberar integrantes del GAP eliminado
      const savedMiembros = localStorage.getItem('miembros');
      if (savedMiembros) {
        let miembrosGlobales = JSON.parse(savedMiembros);
        miembrosGlobales = miembrosGlobales.map((m: any) => {
          if (m.gapId === gapAEliminar) {
            return { ...m, gapId: 'sin_gap' };
          }
          return m;
        });
        localStorage.setItem('miembros', JSON.stringify(miembrosGlobales));
      }
    }

    setGapAEliminar(null);
    setGapDetalle(null);
    toast.success('El Grupo GAP ha sido movido a la papelera (24 horas).');
  };

  // Restaurar de la papelera
  const handleRestaurarGAP = (gapId: string) => {
    const nuevosGaps = gaps.map(g => {
      if (g.id === gapId) {
        const copy = { ...g };
        delete copy.fechaEliminacion;
        
        if (gapDetalle?.id === gapId) {
          setGapDetalle(copy);
        }
        return copy;
      }
      return g;
    });
    
    setGaps(nuevosGaps);
    
    // Quitar el numero de la lista de reciclados
    const gapRestaurado = gaps.find(g => g.id === gapId);
    if (gapRestaurado) {
      const disponibles = localStorage.getItem('numerosGAPsDisponibles');
      if (disponibles) {
        let numeros = JSON.parse(disponibles);
        numeros = numeros.filter((n: number) => n !== gapRestaurado.numero);
        localStorage.setItem('numerosGAPsDisponibles', JSON.stringify(numeros));
      }
    }

    toast.success('El Grupo GAP ha sido restaurado.');
  };

  return (
    <div className="space-y-6 animate-fade-in pb-20 md:pb-0">
      {/* Header y Filtros - SIN CAMBIOS SIGNIFICATIVOS */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onVolver} className="text-white hover:bg-white/10">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h2 className="text-2xl font-bold text-white">Grupos G.A.P</h2>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
            <Input 
              placeholder="Buscar por código (ej. GAP-1) o barrio..." 
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-emerald-500/50"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value as any)}
              className="px-3 py-2 rounded-md bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-emerald-500/50"
            >
              <option value="todos" className="bg-slate-900">Todos los estados</option>
              <option value="activos" className="bg-slate-900">Solo Activos</option>
              <option value="inactivos" className="bg-slate-900">Solo Inactivos</option>
              {(usuario?.rol === 'administrador' || usuario?.rol === 'pastor_principal') && (
                <option value="eliminados" className="bg-slate-900 text-rose-400">Papelera (Eliminados)</option>
              )}
            </select>
            {onNuevo && tienePermiso('crearGAP') && (
              <Button onClick={onNuevo} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Nuevo GAP</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Lista de GAPs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {gapsFiltrados.length === 0 ? (
          <div className="col-span-full py-12 text-center rounded-xl bg-white/5 border border-white/5">
            <Users className="w-12 h-12 text-white/20 mx-auto mb-3" />
            <p className="text-white/60 font-medium">No se encontraron Grupos G.A.P</p>
            {busqueda && <p className="text-white/40 text-sm mt-1">Prueba con otros términos de búsqueda</p>}
          </div>
        ) : (
          gapsFiltrados.map((gap) => (
            <Card 
              key={gap.id} 
              className="bg-white/5 border-white/10 hover:border-emerald-500/50 transition-all duration-300 cursor-pointer overflow-hidden group"
              onClick={() => {
                if (onVerGAP) {
                  onVerGAP(gap);
                } else {
                  setGapDetalle(gap);
                }
              }}
            >
              <CardContent className="p-0">
                <div className="p-4 border-b border-white/5 flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors flex items-center gap-2">
                      {gap.codigo}
                    </h3>
                    <Badge className={`mt-2 ${gap.activo ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-white/10 text-white/60 border border-white/5"}`}>
                      {gap.activo ? "Activo" : "Inactivo"}
                    </Badge>
                  </div>
                  <div className="flex flex-col items-end text-sm text-white/60 bg-white/5 p-2 rounded-lg border border-white/5">
                    <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {gap.diaReunion}</span>
                    <span className="flex items-center gap-1.5 font-medium mt-1"><Clock className="w-3.5 h-3.5" /> {formatearHora12(gap.horaReunion)}</span>
                  </div>
                </div>
                
                <div className="p-4 space-y-3 bg-black/20">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <User className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-xs text-white/40 font-medium uppercase tracking-wider">Líder del GAP</p>
                      <p className="text-sm text-white font-medium">{gap.liderGapNombre}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <MapPin className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-xs text-white/40 font-medium uppercase tracking-wider">Ubicación</p>
                      <p className="text-sm text-white font-medium line-clamp-1">{gap.barrio}</p>
                      <p className="text-xs text-white/50">{gap.modalidad}</p>
                    </div>
                  </div>
                </div>
                
                <div className="px-4 py-3 border-t border-white/5 flex justify-between items-center bg-white/[0.02]">
                  <div className="flex -space-x-2">
                    {gap.miembros.slice(0, 3).map((miembro, i) => (
                      <div key={i} className="w-7 h-7 rounded-full bg-slate-700 border-2 border-slate-900 flex items-center justify-center text-[10px] font-bold text-white" title={`${miembro.nombres} ${miembro.apellidos}`}>
                        {miembro.nombres.charAt(0)}{miembro.apellidos.charAt(0)}
                      </div>
                    ))}
                    {gap.miembros.length > 3 && (
                      <div className="w-7 h-7 rounded-full bg-white/10 border-2 border-slate-900 flex items-center justify-center text-[10px] font-bold text-white">
                        +{gap.miembros.length - 3}
                      </div>
                    )}
                    {gap.miembros.length === 0 && (
                      <span className="text-xs text-white/40">Sin miembros</span>
                    )}
                  </div>
                  
                  <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
                    {tienePermiso('editarGAP') && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-white/60 hover:text-white hover:bg-white/10 rounded-full">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 bg-slate-900 border-white/10 text-white">
                          <DropdownMenuItem onClick={() => setGapDetalle(gap)} className="hover:bg-white/10 cursor-pointer">
                            Ver Detalles
                          </DropdownMenuItem>
                          {onEditarGAP && (
                            <DropdownMenuItem onClick={() => onEditarGAP(gap)} className="hover:bg-white/10 cursor-pointer">
                              Editar GAP
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Sheet Lateral para Detalles del GAP */}
      <Sheet open={!!gapDetalle} onOpenChange={(open) => !open && setGapDetalle(null)}>
        <SheetContent className="w-full sm:max-w-md md:max-w-lg lg:max-w-xl overflow-y-auto border-l border-white/10 bg-slate-950 text-white p-0">
          {gapDetalle && (
            <div className="flex flex-col h-full">
              <SheetHeader className="p-6 border-b border-white/10 bg-slate-900/50 sticky top-0 z-10 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <SheetTitle className="flex items-center gap-2 text-2xl font-bold text-white m-0">
                    <MapPin className="w-6 h-6 text-emerald-400" />
                    <span>Grupo {gapDetalle.codigo}</span>
                  </SheetTitle>
                  <Badge className={gapDetalle.activo ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-rose-500/20 text-rose-400 border border-rose-500/30"}>
                    {gapDetalle.activo ? "Activo" : "Inactivo"}
                  </Badge>
                </div>
              </SheetHeader>
              
              <div className="p-6 space-y-8 flex-1">
                {/* Botones de Acción Rápida (Admin/Pastor Principal) */}
                {(usuario?.rol === 'administrador' || usuario?.rol === 'pastor_principal') && (
                  <div className="flex flex-wrap gap-2">
                    {gapDetalle.fechaEliminacion ? (
                      <Button 
                        onClick={() => handleRestaurarGAP(gapDetalle.id)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white w-full"
                      >
                        <Power className="w-4 h-4 mr-2" /> Restaurar de la Papelera
                      </Button>
                    ) : (
                      <>
                        <Button 
                          variant="outline" 
                          onClick={() => toggleEstadoGAP(gapDetalle.id)}
                          className={gapDetalle.activo 
                            ? "bg-white/5 border-rose-500/30 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 flex-1" 
                            : "bg-white/5 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300 flex-1"
                          }
                        >
                          {gapDetalle.activo ? (
                            <><PowerOff className="w-4 h-4 mr-2" /> Desactivar GAP</>
                          ) : (
                            <><Power className="w-4 h-4 mr-2" /> Activar GAP</>
                          )}
                        </Button>
                        <Button 
                          variant="destructive"
                          onClick={() => setGapAEliminar(gapDetalle.id)}
                          className="bg-red-600/80 hover:bg-red-600 flex-1"
                        >
                          <Trash2 className="w-4 h-4 mr-2" /> Enviar a Papelera
                        </Button>
                      </>
                    )}
                  </div>
                )}

                {/* Grid de Información de Reunión */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-white/5 border border-white/5 shadow-inner">
                    <p className="text-xs text-white/40 uppercase tracking-wider font-semibold">Día</p>
                    <p className="text-base font-semibold text-white mt-1">{gapDetalle.diaReunion}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5 border border-white/5 shadow-inner">
                    <p className="text-xs text-white/40 uppercase tracking-wider font-semibold">Hora</p>
                    <p className="text-base font-semibold text-white mt-1">{formatearHora12(gapDetalle.horaReunion)}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5 border border-white/5 shadow-inner">
                    <p className="text-xs text-white/40 uppercase tracking-wider font-semibold">Frecuencia</p>
                    <p className="text-base font-semibold text-white mt-1">{gapDetalle.frecuencia}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5 border border-white/5 shadow-inner">
                    <p className="text-xs text-white/40 uppercase tracking-wider font-semibold">Modalidad</p>
                    <p className="text-base font-semibold text-white mt-1">{gapDetalle.modalidad}</p>
                  </div>
                </div>

                {/* Ubicación y Dirección */}
                <div className="p-5 rounded-xl bg-slate-900 border border-white/10 space-y-4">
                  <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                    <MapPin className="w-4 h-4" /> Ubicación y Contacto
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-white/80">
                    <div className="space-y-1">
                      <span className="text-[10px] text-white/40 uppercase">Dirección</span>
                      <p className="font-medium text-white">{gapDetalle.direccion}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] text-white/40 uppercase">Barrio</span>
                      <p className="font-medium text-white">{gapDetalle.barrio} ({gapDetalle.departamento})</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] text-white/40 uppercase">Lugar de reunión</span>
                      <p className="font-medium text-white">{gapDetalle.ubicacionReunion}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] text-white/40 uppercase">Creado el</span>
                      <p className="font-medium text-white">{gapDetalle.fechaCreacion.split('T')[0]}</p>
                    </div>
                  </div>
                </div>

                {/* Liderazgo a Cargo */}
                <div className="p-5 rounded-xl bg-slate-900 border border-white/10 space-y-4">
                  <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                    <Users className="w-4 h-4" /> Liderazgo a Cargo
                  </h4>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="p-3 rounded-lg bg-white/5 border border-white/10 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-lg">L</div>
                      <div>
                        <p className="text-[10px] text-white/50 uppercase tracking-wider font-semibold">Líder del GAP</p>
                        <p className="text-sm font-semibold text-white">{gapDetalle.liderGapNombre}</p>
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-white/5 border border-white/10 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-lg">T</div>
                      <div>
                        <p className="text-[10px] text-white/50 uppercase tracking-wider font-semibold">Timoteo</p>
                        <p className="text-sm font-semibold text-white">{gapDetalle.timoteoNombre}</p>
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-white/5 border border-white/10 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-lg">P</div>
                      <div>
                        <p className="text-[10px] text-white/50 uppercase tracking-wider font-semibold">Pastor Asignado</p>
                        <p className="text-sm font-semibold text-white">{gapDetalle.pastorNombre}</p>
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-white/5 border border-white/10 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-lg">M</div>
                      <div>
                        <p className="text-[10px] text-white/50 uppercase tracking-wider font-semibold">Líder Mentor</p>
                        <p className="text-sm font-semibold text-white">{gapDetalle.liderMentorNombre}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Integrantes / Miembros */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                      Integrantes ({gapDetalle.miembros.length})
                    </h4>
                    <Badge variant="outline" className="text-white/60 border-white/20">Máx 10</Badge>
                  </div>
                  {gapDetalle.miembros.length === 0 ? (
                    <div className="text-center py-8 rounded-xl bg-white/5 border border-white/10 text-white/50 text-sm">
                      No hay miembros registrados en este grupo.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {gapDetalle.miembros.map((miembro, index) => (
                        <div key={miembro.id || index} className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between hover:bg-white/10 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-emerald-600/30 text-emerald-400 flex items-center justify-center font-bold text-sm shadow-inner border border-emerald-500/20">
                              {miembro.nombres.charAt(0)}{miembro.apellidos.charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-white">{miembro.nombres} {miembro.apellidos}</p>
                              <p className="text-[11px] text-emerald-400 font-medium mt-0.5">{miembro.telefono} • {miembro.barrio}</p>
                            </div>
                          </div>
                          <div className="flex gap-2 flex-wrap justify-end">
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
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Confirmación para Eliminar (Papelera) */}
      <AlertDialog open={!!gapAEliminar} onOpenChange={(open) => !open && setGapAEliminar(null)}>
        <AlertDialogContent className="bg-slate-900 border border-white/10 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-400 flex items-center gap-2">
              <Trash2 className="w-5 h-5" /> Enviar a la Papelera
            </AlertDialogTitle>
            <AlertDialogDescription className="text-white/70">
              ¿Estás seguro de eliminar este Grupo GAP? 
              <br /><br />
              El grupo será enviado a la <strong>Papelera de Reciclaje</strong> y permanecerá allí durante <strong>24 horas</strong> antes de ser borrado permanentemente. El número de este GAP quedará disponible para ser reutilizado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/10 hover:bg-white/20 text-white border-none">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleEliminarGAP}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Sí, enviar a la papelera
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ListaGAPs;
