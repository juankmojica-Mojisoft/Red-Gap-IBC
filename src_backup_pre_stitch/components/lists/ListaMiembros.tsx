import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Users, 
  Search, 
  Plus,
  Phone,
  MapPin,
  Droplets,
  BookOpen,
  MoreVertical,
  User,
  Church
} from 'lucide-react';
import { miembrosMock, gapsMock, getGAPsByPastor, getGAPsByLiderMentor } from '@/data/mockData';
import type { MiembroGAP } from '@/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ListaMiembrosProps {
  onVolver: () => void;
  onNuevo?: () => void;
  onEditarMiembro?: (miembro: MiembroGAP) => void;
}

const ListaMiembros: React.FC<ListaMiembrosProps> = ({ onVolver, onNuevo, onEditarMiembro }) => {
  const { usuario, tema, tienePermiso } = useAuth();
  const [busqueda, setBusqueda] = useState('');
  const [filtroGAP, setFiltroGAP] = useState<string>('todos');
  const [filtroBautizado, setFiltroBautizado] = useState<'todos' | 'bautizados' | 'no-bautizados'>('todos');
  const [miembroDetalle, setMiembroDetalle] = useState<MiembroGAP | null>(null);

  // Obtener GAPs según el rol del usuario
  const getGAPsDisponibles = () => {
    if (usuario?.rol === 'pastor_principal') {
      return gapsMock;
    } else if (usuario?.rol === 'pastor') {
      return getGAPsByPastor(usuario.id);
    } else if (usuario?.rol === 'lider_mentor') {
      return getGAPsByLiderMentor(usuario.id);
    } else if (usuario?.rol === 'lider_gap') {
      const gap = gapsMock.find(g => g.liderGapId === usuario.id);
      return gap ? [gap] : [];
    }
    return [];
  };

  const gapsDisponibles = getGAPsDisponibles();
  const gapIdsDisponibles = gapsDisponibles.map(g => g.id);

  // Filtrar miembros
  const getMiembrosFiltrados = () => {
    let miembros = miembrosMock.filter(m => gapIdsDisponibles.includes(m.gapId));
    
    // Aplicar filtro de búsqueda
    if (busqueda) {
      miembros = miembros.filter(m => 
        m.nombres.toLowerCase().includes(busqueda.toLowerCase()) ||
        m.apellidos.toLowerCase().includes(busqueda.toLowerCase()) ||
        m.numeroDocumento.includes(busqueda) ||
        m.telefono.includes(busqueda)
      );
    }
    
    // Aplicar filtro de GAP
    if (filtroGAP !== 'todos') {
      miembros = miembros.filter(m => m.gapId === filtroGAP);
    }
    
    // Aplicar filtro de bautizado
    if (filtroBautizado === 'bautizados') {
      miembros = miembros.filter(m => m.esBautizado);
    } else if (filtroBautizado === 'no-bautizados') {
      miembros = miembros.filter(m => !m.esBautizado);
    }
    
    return miembros;
  };

  const miembros = getMiembrosFiltrados();
  const miembrosBautizados = miembros.filter(m => m.esBautizado);
  const miembrosNoBautizados = miembros.filter(m => !m.esBautizado);
  const miembrosMiembroIBC = miembros.filter(m => m.esMiembroIBC);

  // Obtener nombre del GAP
  const getGAPNombre = (gapId: string) => {
    return gapsMock.find(g => g.id === gapId)?.codigo || 'GAP No Encontrado';
  };

  return (
    <div className="p-6 max-w-6xl mx-auto animate-fade-in pb-24 lg:pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onVolver} className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Volver
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Integrantes</h1>
        </div>
        {tienePermiso('crearMiembro') && onNuevo && (
          <Button 
            onClick={onNuevo}
            className="text-white"
            style={{ backgroundColor: tema.primario }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Integrante
          </Button>
        )}
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold" style={{ color: tema.primario }}>{miembros.length}</p>
            <p className="text-xs text-gray-500">Total Integrantes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold" style={{ color: tema.exito }}>{miembrosBautizados.length}</p>
            <p className="text-xs text-gray-500">Bautizados</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold" style={{ color: tema.secundario }}>{miembrosMiembroIBC.length}</p>
            <p className="text-xs text-gray-500">Miembros IBC</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold" style={{ color: tema.info }}>{miembrosNoBautizados.length}</p>
            <p className="text-xs text-gray-500">No Bautizados</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Buscar por nombre, documento o teléfono..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filtroGAP} onValueChange={setFiltroGAP}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filtrar por GAP" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los GAPs</SelectItem>
            {gapsDisponibles.map(gap => (
              <SelectItem key={gap.id} value={gap.id}>{gap.codigo}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex gap-2">
          <Button
            variant={filtroBautizado === 'todos' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFiltroBautizado('todos')}
            style={filtroBautizado === 'todos' ? { backgroundColor: tema.primario } : {}}
          >
            Todos
          </Button>
          <Button
            variant={filtroBautizado === 'bautizados' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFiltroBautizado('bautizados')}
            style={filtroBautizado === 'bautizados' ? { backgroundColor: tema.exito } : {}}
          >
            Bautizados
          </Button>
        </div>
      </div>

      {/* Lista de Miembros */}
      <div className="space-y-3">
        {miembros.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Users className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay integrantes registrados</h3>
              <p className="text-gray-500 mb-4">
                {gapsDisponibles.length === 0 
                  ? 'Primero debe crear un GAP para poder registrar integrantes.'
                  : 'Comience registrando el primer integrante de su GAP.'}
              </p>
              {tienePermiso('crearMiembro') && onNuevo && gapsDisponibles.length > 0 && (
                <Button 
                  onClick={onNuevo}
                  style={{ backgroundColor: tema.primario }}
                  className="text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Registrar Integrante
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          miembros.map((miembro) => (
            <Card 
              key={miembro.id} 
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setMiembroDetalle(miembro)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                      style={{ backgroundColor: tema.secundario }}
                    >
                      {miembro.nombres.charAt(0)}{miembro.apellidos.charAt(0)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-semibold">{miembro.nombres} {miembro.apellidos}</h3>
                        {miembro.esBautizado ? (
                          <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300">
                            <Droplets className="w-3 h-3 mr-1" />
                            Bautizado
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-300">
                            No bautizado
                          </Badge>
                        )}
                        {miembro.esMiembroIBC && (
                          <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                            <Church className="w-3 h-3 mr-1" />
                            Miembro IBC
                          </Badge>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span>{miembro.telefono}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span>{miembro.barrio}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <User className="w-4 h-4 text-gray-400" />
                          <span>{miembro.tipoDocumento}: {miembro.numeroDocumento}</span>
                        </div>
                      </div>

                      <div className="mt-2 pt-2 border-t flex flex-wrap items-center gap-3 text-xs">
                        <Badge variant="outline" style={{ borderColor: tema.primario, color: tema.primario }}>
                          {getGAPNombre(miembro.gapId)}
                        </Badge>
                        {miembro.escuelaFormacion !== 'No' && (
                          <span className="flex items-center gap-1 text-gray-500">
                            <BookOpen className="w-3 h-3" />
                            EFC: {miembro.escuelaFormacion}
                            {miembro.moduloEFC && miembro.moduloEFC !== 'Ninguno' && ` - ${miembro.moduloEFC}`}
                          </span>
                        )}
                        {miembro.ministerios.length > 0 && (
                          <span className="text-gray-500">
                            Ministerios: {miembro.ministerios.join(', ')}
                          </span>
                        )}
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
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setMiembroDetalle(miembro); }}>
                        Ver detalles
                      </DropdownMenuItem>
                      {tienePermiso('editarMiembro') && (
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEditarMiembro?.(miembro); }}>
                          Editar integrante
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

      {/* Dialogo de detalle del Integrante */}
      <Dialog open={!!miembroDetalle} onOpenChange={(open) => !open && setMiembroDetalle(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between text-xl font-bold border-b pb-3 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white">
              <div className="flex items-center gap-2">
                <User className="w-6 h-6 text-emerald-500" />
                <span>Detalles del Integrante</span>
              </div>
              <div className="flex gap-1.5">
                <Badge className={miembroDetalle?.esBautizado ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30" : "bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-white/60 border border-gray-200 dark:border-white/5"}>
                  {miembroDetalle?.esBautizado ? "Bautizado" : "No Bautizado"}
                </Badge>
                {miembroDetalle?.esMiembroIBC && (
                  <Badge className="bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30">
                    Miembro IBC
                  </Badge>
                )}
              </div>
            </DialogTitle>
          </DialogHeader>
          
          {miembroDetalle && (
            <div className="space-y-6 pt-4 text-gray-900 dark:text-white">
              {/* Encabezado con Nombre y Teléfono */}
              <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                <div 
                  className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-2xl"
                  style={{ backgroundColor: tema.secundario }}
                >
                  {miembroDetalle.nombres.charAt(0)}{miembroDetalle.apellidos.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">{miembroDetalle.nombres} {miembroDetalle.apellidos}</h3>
                  <p className="text-sm text-gray-500 dark:text-white/60">{miembroDetalle.tipoDocumento}: {miembroDetalle.numeroDocumento}</p>
                </div>
              </div>

              {/* Información Personal */}
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 space-y-3">
                <h4 className="text-xs font-bold text-gray-700 dark:text-white/80 uppercase tracking-wider">Información Personal</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <p className="text-[10px] text-gray-400 dark:text-white/40 uppercase tracking-wider font-semibold">Género</p>
                    <p className="text-sm font-semibold mt-1">{miembroDetalle.sexo}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 dark:text-white/40 uppercase tracking-wider font-semibold">Estado Civil</p>
                    <p className="text-sm font-semibold mt-1">{miembroDetalle.estadoCivil}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 dark:text-white/40 uppercase tracking-wider font-semibold">Fecha Nacimiento</p>
                    <p className="text-sm font-semibold mt-1">{miembroDetalle.fechaNacimiento || 'No registrada'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 dark:text-white/40 uppercase tracking-wider font-semibold">Profesión / Oficio</p>
                    <p className="text-sm font-semibold mt-1">{miembroDetalle.profesion || 'No registrada'}</p>
                  </div>
                </div>
              </div>

              {/* Ubicación y Contacto */}
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 space-y-3">
                <h4 className="text-xs font-bold text-gray-700 dark:text-white/80 uppercase tracking-wider">Ubicación y Contacto</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-600 dark:text-white/70">
                  <div className="flex items-center gap-2.5">
                    <Phone className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span><strong>Teléfono:</strong> {miembroDetalle.telefono}</span>
                  </div>
                  {miembroDetalle.numeroWhatsApp && (
                    <div className="flex items-center gap-2.5">
                      <Phone className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      <span><strong>WhatsApp:</strong> {miembroDetalle.numeroWhatsApp}</span>
                    </div>
                  )}
                  {miembroDetalle.correo && (
                    <div className="flex items-center gap-2.5">
                      <User className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      <span><strong>Correo:</strong> {miembroDetalle.correo}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2.5">
                    <MapPin className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span><strong>Dirección:</strong> {miembroDetalle.direccion}</span>
                  </div>
                  <div className="flex items-center gap-2.5 col-span-1 sm:col-span-2">
                    <MapPin className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span><strong>Barrio/Dpto:</strong> {miembroDetalle.barrio} ({miembroDetalle.departamento})</span>
                  </div>
                </div>
              </div>

              {/* Escuela de Formación y Ministerios */}
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-gray-700 dark:text-white/80 uppercase tracking-wider mb-2">Escuela de Formación Cristiana (EFC)</h4>
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-5 h-5 text-emerald-500" />
                    <div>
                      <p className="text-sm font-semibold">{miembroDetalle.escuelaFormacion === 'No' ? 'No Cursada / Registrada' : `Estado: ${miembroDetalle.escuelaFormacion}`}</p>
                      {miembroDetalle.moduloEFC && miembroDetalle.moduloEFC !== 'Ninguno' && (
                        <p className="text-xs text-gray-500 dark:text-white/60">Módulo: {miembroDetalle.moduloEFC}</p>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="border-t pt-3 border-gray-200 dark:border-white/10">
                  <h4 className="text-xs font-bold text-gray-700 dark:text-white/80 uppercase tracking-wider mb-2">Ministerios y Servicio</h4>
                  {miembroDetalle.ministerios.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-white/50">No forma parte de ningún ministerio activo actualmente.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {miembroDetalle.ministerios.map((min, idx) => (
                        <Badge key={idx} variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          {min}
                        </Badge>
                      ))}
                      {miembroDetalle.franjaGeneracional && (
                        <Badge variant="outline" className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                          Franja: {miembroDetalle.franjaGeneracional}
                        </Badge>
                      )}
                      {miembroDetalle.areaServidores && (
                        <Badge variant="outline" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                          Servidores: {miembroDetalle.areaServidores}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>

                <div className="border-t pt-3 border-gray-200 dark:border-white/10">
                  <h4 className="text-xs font-bold text-gray-700 dark:text-white/80 uppercase tracking-wider mb-1">GAP Perteneciente</h4>
                  <div className="flex items-center gap-2 text-sm">
                    <Church className="w-4 h-4 text-emerald-500" />
                    <span className="font-semibold">{getGAPNombre(miembroDetalle.gapId)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ListaMiembros;
