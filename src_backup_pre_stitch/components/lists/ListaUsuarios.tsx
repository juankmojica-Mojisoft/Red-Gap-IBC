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
  Mail,
  Phone,
  Shield,
  MoreVertical
} from 'lucide-react';
import { usuariosMock } from '@/data/mockData';
import type { Usuario, RolUsuario } from '@/types';
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

interface ListaUsuariosProps {
  onVolver: () => void;
  onNuevo?: () => void;
  onVerUsuario?: (usuario: Usuario) => void;
}

const rolLabels: Record<RolUsuario, string> = {
  pastor_principal: 'Pastor Principal',
  administrador: 'Administrador',
  pastor: 'Pastor',
  lider_mentor: 'Líder Mentor',
  lider_gap: 'Líder GAP',
  timoteo: 'Timoteo',
  facilitador: 'Facilitador',
};

const rolColors: Record<RolUsuario, string> = {
  pastor_principal: 'bg-purple-100 text-purple-700 border-purple-300',
  administrador: 'bg-gray-100 text-gray-700 border-gray-300',
  pastor: 'bg-blue-100 text-blue-700 border-blue-300',
  lider_mentor: 'bg-green-100 text-green-700 border-green-300',
  lider_gap: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  timoteo: 'bg-orange-100 text-orange-700 border-orange-300',
  facilitador: 'bg-pink-100 text-pink-700 border-pink-300',
};

const ListaUsuarios: React.FC<ListaUsuariosProps> = ({ onVolver, onNuevo, onVerUsuario }) => {
  const { usuario, tema, tienePermiso } = useAuth();
  const [busqueda, setBusqueda] = useState('');
  const [filtroRol, setFiltroRol] = useState<RolUsuario | 'todos'>('todos');
  const [filtroEstado, setFiltroEstado] = useState<'todos' | 'activos' | 'inactivos'>('todos');

  // Filtrar usuarios según el rol del usuario logueado
  const getUsuariosFiltrados = () => {
    let usuarios = usuariosMock;
    
    if (usuario?.rol === 'pastor') {
      // Pastor ve: él mismo, sus líderes mentores, sus líderes GAP, sus timoteos
      const pastorId = usuario.id;
      usuarios = usuarios.filter(u => 
        u.id === pastorId || 
        u.pastorId === pastorId ||
        (u.liderMentorId && usuariosMock.find(us => us.id === u.liderMentorId)?.pastorId === pastorId)
      );
    } else if (usuario?.rol === 'lider_mentor') {
      // Líder Mentor ve: él mismo, sus líderes GAP, sus timoteos
      const liderMentorId = usuario.id;
      usuarios = usuarios.filter(u => 
        u.id === liderMentorId || 
        u.liderMentorId === liderMentorId
      );
    } else if (usuario?.rol === 'lider_gap') {
      // Líder GAP ve: él mismo, su timoteo
      const liderGapId = usuario.id;
      usuarios = usuarios.filter(u => 
        u.id === liderGapId || 
        u.liderGapId === liderGapId
      );
    }
    
    // Aplicar filtro de búsqueda
    if (busqueda) {
      usuarios = usuarios.filter(u => 
        u.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        u.apellidos.toLowerCase().includes(busqueda.toLowerCase()) ||
        u.correo.toLowerCase().includes(busqueda.toLowerCase()) ||
        u.numeroDocumento.includes(busqueda)
      );
    }
    
    // Aplicar filtro de rol
    if (filtroRol !== 'todos') {
      usuarios = usuarios.filter(u => u.rol === filtroRol);
    }
    
    // Aplicar filtro de estado
    if (filtroEstado === 'activos') {
      usuarios = usuarios.filter(u => u.activo);
    } else if (filtroEstado === 'inactivos') {
      usuarios = usuarios.filter(u => !u.activo);
    }
    
    return usuarios;
  };

  const usuarios = getUsuariosFiltrados();
  const usuariosActivos = usuarios.filter(u => u.activo);
  const usuariosInactivos = usuarios.filter(u => !u.activo);

  // Contar por roles
  const contarPorRol = (rol: RolUsuario) => usuarios.filter(u => u.rol === rol).length;

  return (
    <div className="p-6 max-w-6xl mx-auto animate-fade-in pb-24 lg:pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onVolver} className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Volver
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Total de Usuarios</h1>
        </div>
        {tienePermiso('crearUsuario') && onNuevo && (
          <Button 
            onClick={onNuevo}
            className="text-white"
            style={{ backgroundColor: tema.primario }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Usuario
          </Button>
        )}
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold" style={{ color: tema.primario }}>{usuarios.length}</p>
            <p className="text-xs text-gray-500">Total</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold" style={{ color: tema.exito }}>{usuariosActivos.length}</p>
            <p className="text-xs text-gray-500">Activos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold" style={{ color: tema.error }}>{usuariosInactivos.length}</p>
            <p className="text-xs text-gray-500">Inactivos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold" style={{ color: tema.secundario }}>{contarPorRol('pastor')}</p>
            <p className="text-xs text-gray-500">Pastores</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Buscar por nombre, correo o documento..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filtroRol} onValueChange={(v) => setFiltroRol(v as RolUsuario | 'todos')}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Filtrar por rol" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los roles</SelectItem>
            <SelectItem value="pastor">Pastor</SelectItem>
            <SelectItem value="lider_mentor">Líder Mentor</SelectItem>
            <SelectItem value="lider_gap">Líder GAP</SelectItem>
            <SelectItem value="timoteo">Timoteo</SelectItem>
            <SelectItem value="monitor">Monitor</SelectItem>
          </SelectContent>
        </Select>
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
        </div>
      </div>

      {/* Lista de Usuarios */}
      <div className="space-y-3">
        {usuarios.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Users className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay usuarios registrados</h3>
              <p className="text-gray-500 mb-4">Comience creando el primer usuario del sistema.</p>
              {tienePermiso('crearUsuario') && onNuevo && (
                <Button 
                  onClick={onNuevo}
                  style={{ backgroundColor: tema.primario }}
                  className="text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Crear Usuario
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          usuarios.map((u) => (
            <Card 
              key={u.id} 
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => onVerUsuario?.(u)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                      style={{ backgroundColor: tema.primario }}
                    >
                      {u.nombre.charAt(0)}{u.apellidos.charAt(0)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{u.nombre} {u.apellidos}</h3>
                        <Badge 
                          variant="outline"
                          className={u.activo 
                            ? 'bg-green-100 text-green-700 border-green-300' 
                            : 'bg-gray-100 text-gray-700 border-gray-300'
                          }
                        >
                          {u.activo ? 'Activo' : 'Inactivo'}
                        </Badge>
                        <Badge variant="outline" className={rolColors[u.rol]}>
                          {rolLabels[u.rol]}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span>{u.correo}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span>{u.telefono}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Shield className="w-4 h-4 text-gray-400" />
                          <span>{u.tipoDocumento}: {u.numeroDocumento}</span>
                        </div>
                      </div>

                      {/* Información de jerarquía */}
                      {(u.pastorId || u.liderMentorId) && (
                        <div className="mt-2 pt-2 border-t text-xs text-gray-500">
                          {u.pastorId && (
                            <span className="mr-4">
                              Pastor: {usuariosMock.find(us => us.id === u.pastorId)?.nombre || 'N/A'}
                            </span>
                          )}
                          {u.liderMentorId && (
                            <span>
                              Líder Mentor: {usuariosMock.find(us => us.id === u.liderMentorId)?.nombre || 'N/A'}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onVerUsuario?.(u); }}>
                        Ver detalles
                      </DropdownMenuItem>
                      {tienePermiso('editarUsuario') && (
                        <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                          Editar usuario
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
    </div>
  );
};

export default ListaUsuarios;
