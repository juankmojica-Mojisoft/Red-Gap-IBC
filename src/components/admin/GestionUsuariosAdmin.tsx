import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ArrowLeft, Search, Edit3, Trash2, UserCheck, UserX, Save, X, 
  Users, RotateCcw, CheckCircle, Loader2, Mail, Phone, Shield, MapPin
} from 'lucide-react';
import { toast } from 'sonner';
import type { Usuario, RolUsuario } from '@/types';
import { usuariosMock, gapsMock, existeDocumento, existeTelefono } from '@/data/mockData';
import { 
  getAllUsuarios,
  getAllGAPs,
  actualizarUsuario,
  eliminarUsuario,
  activarUsuario,
  eliminarUsuarioPermanente,
  reasignarUsuario,
} from '@/services/dataService';

const ROLES: { value: RolUsuario; label: string }[] = [
  { value: 'pastor_principal', label: 'Pastor Principal' },
  { value: 'administrador', label: 'Administrador' },
  { value: 'pastor', label: 'Pastor' },
  { value: 'lider_mentor', label: 'Lider Mentor' },
  { value: 'lider_gap', label: 'Lider GAP' },
  { value: 'timoteo', label: 'Timoteo' },
  { value: 'facilitador', label: 'Facilitador' },
];

const GestionUsuariosAdmin: React.FC<{ onVolver: () => void }> = ({ onVolver }) => {
  const { tema } = useAuth();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [gaps, setGaps] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [filtroRol, setFiltroRol] = useState('todos');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [modalEditar, setModalEditar] = useState(false);
  const [modalReasignar, setModalReasignar] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState<Usuario | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    abierto: boolean;
    titulo: string;
    mensaje: string;
    onConfirmar: () => void | Promise<void>;
  }>({
    abierto: false,
    titulo: '',
    mensaje: '',
    onConfirmar: () => {},
  });
  const [duplicateModal, setDuplicateModal] = useState<{
    abierto: boolean;
    docDuplicado: boolean;
    telDuplicado: boolean;
    numeroDocumento: string;
    telefono: string;
  }>({
    abierto: false,
    docDuplicado: false,
    telDuplicado: false,
    numeroDocumento: '',
    telefono: '',
  });
  const [modalDocVal, setModalDocVal] = useState('');
  const [modalTelVal, setModalTelVal] = useState('');
  const [modalError, setModalError] = useState('');

  const [editForm, setEditForm] = useState({
    nombre: '', apellidos: '', correo: '', telefono: '', numeroDocumento: '',
    direccion: '', barrio: '', departamento: '', profesion: '', rol: '' as RolUsuario, activo: true,
  });
  const [reasignForm, setReasignForm] = useState({ pastorId: 'sin_pastor', liderMentorId: 'sin_mentor', gapId: 'sin_gap' });

  useEffect(() => { cargarDatos(); }, []);

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const [u, g] = await Promise.all([getAllUsuarios(), getAllGAPs()]);
      setUsuarios(u && u.length > 0 ? u : usuariosMock);
      setGaps(g && g.length > 0 ? g : gapsMock);
    } catch (e) {
      console.warn('Usando datos locales debido a error de base de datos:', e);
      setUsuarios(usuariosMock);
      setGaps(gapsMock);
    }
    setCargando(false);
  };

  const usuariosFiltrados = usuarios.filter(u => {
    const matchBusqueda = !busqueda ||
      u.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      u.apellidos.toLowerCase().includes(busqueda.toLowerCase()) ||
      u.correo.toLowerCase().includes(busqueda.toLowerCase()) ||
      u.numeroDocumento.includes(busqueda) ||
      u.telefono.includes(busqueda);
    const matchRol = filtroRol === 'todos' || u.rol === filtroRol;
    const matchEstado = filtroEstado === 'todos' || (filtroEstado === 'activos' && u.activo) || (filtroEstado === 'inactivos' && !u.activo);
    return matchBusqueda && matchRol && matchEstado;
  });

  const abrirEditar = (u: Usuario) => {
    setUsuarioEditando(u);
    setEditForm({
      nombre: u.nombre, apellidos: u.apellidos, correo: u.correo, telefono: u.telefono,
      numeroDocumento: u.numeroDocumento, direccion: u.direccion, barrio: u.barrio,
      departamento: u.departamento, profesion: u.profesion, rol: u.rol, activo: u.activo,
    });
    setModalEditar(true);
  };

  const abrirReasignar = (u: Usuario) => {
    setUsuarioEditando(u);
    setReasignForm({
      pastorId: u.pastorId || 'sin_pastor',
      liderMentorId: u.liderMentorId || 'sin_mentor',
      gapId: u.gapId || 'sin_gap'
    });
    setModalReasignar(true);
  };

  const mostrarConfirmacion = (data: typeof editForm) => {
    if (!usuarioEditando) return;
    setConfirmModal({
      abierto: true,
      titulo: '¿Confirmar Modificaciones de Usuario?',
      mensaje: `Por favor, confirme que los siguientes datos sean correctos antes de aplicar los cambios:\n\n• Nombre: ${data.nombre} ${data.apellidos}\n• Dirección: ${data.direccion}\n• Correo Electrónico: ${data.correo}\n• Documento: ${usuarioEditando.tipoDocumento} ${data.numeroDocumento}\n• Teléfono: ${data.telefono}\n• Fecha de Nacimiento: ${usuarioEditando.fechaNacimiento || 'No registrada'}\n\n¿Desea actualizar de forma permanente este usuario en la base de datos central?`,
      onConfirmar: async () => {
        setGuardando(true);
        try {
          const exito = await actualizarUsuario(usuarioEditando.id, {
            nombre: data.nombre, apellidos: data.apellidos, correo: data.correo,
            telefono: data.telefono, numeroDocumento: data.numeroDocumento,
            direccion: data.direccion, barrio: data.barrio,
            departamento: data.departamento, profesion: data.profesion,
            rol: data.rol, activo: data.activo,
          });
          if (exito) {
            toast.success('Usuario actualizado en la base de datos');
            setModalEditar(false);
          } else {
            toast.error('Error al actualizar el usuario en la base de datos.');
          }
        } catch (e) {
          console.error(e);
          toast.error('Error de red al actualizar el usuario.');
        }
        setGuardando(false);
        await cargarDatos();
      }
    });
  };

  const confirmarGuardarEdicion = () => {
    if (!usuarioEditando) return;
    
    // Validar duplicados
    const docExiste = existeDocumento(editForm.numeroDocumento, usuarioEditando.id);
    const telExiste = existeTelefono(editForm.telefono, usuarioEditando.id);

    if (docExiste || telExiste) {
      setModalDocVal(editForm.numeroDocumento);
      setModalTelVal(editForm.telefono);
      setModalError('');
      setDuplicateModal({
        abierto: true,
        docDuplicado: docExiste,
        telDuplicado: telExiste,
        numeroDocumento: editForm.numeroDocumento,
        telefono: editForm.telefono,
      });
      return;
    }

    mostrarConfirmacion(editForm);
  };

  const confirmarReasignar = () => {
    if (!usuarioEditando) return;
    const pastorIdToSave = reasignForm.pastorId === 'sin_pastor' ? '' : reasignForm.pastorId;
    const liderMentorIdToSave = reasignForm.liderMentorId === 'sin_mentor' ? '' : reasignForm.liderMentorId;
    const gapIdToSave = reasignForm.gapId === 'sin_gap' ? '' : reasignForm.gapId;

    const pastorNombre = pastorIdToSave 
      ? (usuarios.find(u => u.id === pastorIdToSave)?.nombre || 'Sin asignar') 
      : 'Sin pastor';
    const mentorNombre = liderMentorIdToSave 
      ? (usuarios.find(u => u.id === liderMentorIdToSave)?.nombre || 'Sin asignar') 
      : 'Sin mentor';
    const gapNombre = gapIdToSave 
      ? (gaps.find(g => g.id === gapIdToSave)?.codigo || 'Sin asignar') 
      : 'Sin GAP';

    setConfirmModal({
      abierto: true,
      titulo: '¿Confirmar Reasignación de Red?',
      mensaje: `Esta acción reasignará la cobertura del usuario ${usuarioEditando.nombre} ${usuarioEditando.apellidos} en la base de datos central a:\n\n- Pastor: ${pastorNombre}\n- Mentor: ${mentorNombre}\n- Grupo: ${gapNombre}\n\n¿Deseas aplicar estos cambios?`,
      onConfirmar: async () => {
        setGuardando(true);
        try {
          const exito = await reasignarUsuario(usuarioEditando.id, {
            pastorId: pastorIdToSave || undefined,
            liderMentorId: liderMentorIdToSave || undefined,
            gapId: gapIdToSave || undefined,
          });
          if (exito) {
            toast.success('Usuario reasignado en la base de datos');
            setModalReasignar(false);
          } else {
            toast.error('Error al reasignar el usuario en la base de datos.');
          }
        } catch (e) {
          console.error(e);
          toast.error('Error de red al reasignar el usuario.');
        }
        setGuardando(false);
        await cargarDatos();
      }
    });
  };

  const confirmarToggleActivo = (u: Usuario) => {
    const nuevoEstado = u.activo ? 'INACTIVO' : 'ACTIVO';
    const advertencia = u.activo 
      ? `Desactivar a este usuario impedirá que pueda iniciar sesión o registrar asistencias en la plataforma.`
      : `Activar a este usuario le devolverá el acceso inmediato a la plataforma.`;

    setConfirmModal({
      abierto: true,
      titulo: `¿Cambiar Estado a ${nuevoEstado}?`,
      mensaje: `Esta acción modificará el estado del usuario ${u.nombre} ${u.apellidos} en la base de datos a ${nuevoEstado}.\n\n${advertencia} ¿Deseas continuar?`,
      onConfirmar: async () => {
        try {
          let exito = false;
          if (u.activo) { 
            exito = await eliminarUsuario(u.id); 
            if (exito) toast.success('Usuario desactivado en la base de datos'); 
          } else { 
            exito = await activarUsuario(u.id); 
            if (exito) toast.success('Usuario activado en la base de datos'); 
          }
          if (!exito) {
            toast.error('Error al cambiar el estado del usuario en la base de datos.');
          }
        } catch (e) {
          console.error(e);
          toast.error('Error de red al cambiar el estado del usuario.');
        }
        await cargarDatos();
      }
    });
  };

  const confirmarEliminar = (u: Usuario) => {
    setConfirmModal({
      abierto: true,
      titulo: '⚠️ ¿ELIMINAR USUARIO PERMANENTEMENTE?',
      mensaje: `¡ADVERTENCIA CRÍTICA! Está a punto de eliminar permanentemente al usuario ${u.nombre} ${u.apellidos} de la base de datos. Esta operación es IRREVERSIBLE y borrará todo registro histórico asociado. ¿Realmente deseas continuar con la eliminación?`,
      onConfirmar: async () => {
        try {
          const exito = await eliminarUsuarioPermanente(u.id);
          if (exito) {
            toast.success('Usuario eliminado permanentemente de la base de datos');
          } else {
            toast.error('Error al eliminar el usuario de la base de datos.');
          }
        } catch (e) {
          console.error(e);
          toast.error('Error de red al eliminar el usuario.');
        }
        await cargarDatos();
      }
    });
  };

  const resetFiltros = () => { setBusqueda(''); setFiltroRol('todos'); setFiltroEstado('todos'); };
  const getRolLabel = (rol: RolUsuario) => ROLES.find(r => r.value === rol)?.label || rol;

  return (
    <div className="p-6 max-w-6xl mx-auto animate-fade-in pb-24 lg:pb-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" onClick={onVolver}><ArrowLeft className="w-4 h-4 mr-2" /> Volver</Button>
        <h1 className="text-2xl font-bold">Gestion de Usuarios</h1>
      </div>

      {/* Filtros */}
      <Card className="mb-6"><CardContent className="p-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[200px]">
            <Label className="text-xs mb-1 block">Buscar</Label>
            <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Nombre, correo, cedula, telefono..." className="pl-10" />
            </div>
          </div>
          <div><Label className="text-xs mb-1 block">Rol</Label>
            <Select value={filtroRol} onValueChange={setFiltroRol}><SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="todos">Todos</SelectItem>{ROLES.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div><Label className="text-xs mb-1 block">Estado</Label>
            <Select value={filtroEstado} onValueChange={setFiltroEstado}><SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="todos">Todos</SelectItem><SelectItem value="activos">Activos</SelectItem><SelectItem value="inactivos">Inactivos</SelectItem></SelectContent>
            </Select>
          </div>
          <Button variant="outline" onClick={resetFiltros}><RotateCcw className="w-4 h-4" /></Button>
        </div>
      </CardContent></Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-blue-50 rounded-lg p-3 text-center"><p className="text-2xl font-bold text-blue-700">{usuarios.length}</p><p className="text-xs text-blue-600">Total</p></div>
        <div className="bg-green-50 rounded-lg p-3 text-center"><p className="text-2xl font-bold text-green-700">{usuarios.filter(u => u.activo).length}</p><p className="text-xs text-green-600">Activos</p></div>
        <div className="bg-red-50 rounded-lg p-3 text-center"><p className="text-2xl font-bold text-red-700">{usuarios.filter(u => !u.activo).length}</p><p className="text-xs text-red-600">Inactivos</p></div>
        <div className="bg-purple-50 rounded-lg p-3 text-center"><p className="text-2xl font-bold text-purple-700">{new Set(usuarios.map(u => u.rol)).size}</p><p className="text-xs text-purple-600">Roles</p></div>
      </div>

      {cargando ? (
        <div className="text-center py-12"><Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-400" /><p className="mt-2 text-gray-500">Cargando...</p></div>
      ) : (
        <div className="space-y-3">
          {usuariosFiltrados.map(u => (
            <Card key={u.id} className={!u.activo ? 'opacity-60 bg-gray-50' : ''}><CardContent className="p-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold">{u.nombre} {u.apellidos}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${u.activo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{u.activo ? 'Activo' : 'Inactivo'}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">{getRolLabel(u.rol)}</span>
                  </div>
                  <div className="flex flex-wrap gap-x-6 gap-y-2 mt-2 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-2 min-w-0">
                      <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                      <span className="truncate max-w-[200px] sm:max-w-none">{u.correo}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                      <span>{u.telefono}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-gray-400 shrink-0" />
                      <span>{u.tipoDocumento}: {u.numeroDocumento}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                      <span>{u.barrio}, {u.departamento}</span>
                    </div>
                  </div>
                  {(u.pastorId || u.liderMentorId || u.gapId) && (
                    <div className="flex gap-3 mt-1 text-xs text-gray-400">
                      {u.pastorId && <span>Pastor: {usuarios.find(us => us.id === u.pastorId)?.nombre || 'N/A'}</span>}
                      {u.liderMentorId && <span>Mentor: {usuarios.find(us => us.id === u.liderMentorId)?.nombre || 'N/A'}</span>}
                      {u.gapId && <span>Grupo: {gaps.find(g => g.id === u.gapId)?.codigo || 'N/A'}</span>}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Button variant="outline" size="sm" onClick={() => abrirEditar(u)}><Edit3 className="w-3 h-3 mr-1" /> Editar</Button>
                  <Button variant="outline" size="sm" onClick={() => abrirReasignar(u)}><RotateCcw className="w-3 h-3 mr-1" /> Reasignar</Button>
                  <Button variant="outline" size="sm" onClick={() => confirmarToggleActivo(u)} className={u.activo ? 'text-orange-500' : 'text-green-500'}>{u.activo ? <UserX className="w-3 h-3" /> : <UserCheck className="w-3 h-3" />}</Button>
                  <Button variant="outline" size="sm" onClick={() => confirmarEliminar(u)} className="text-red-500 hover:text-red-700 hover:bg-red-50"><Trash2 className="w-3 h-3" /></Button>
                </div>
              </div>
            </CardContent></Card>
          ))}
        </div>
      )}

      {usuariosFiltrados.length === 0 && !cargando && (
        <div className="text-center py-12 bg-gray-50 rounded-lg"><Users className="w-12 h-12 mx-auto text-gray-300 mb-2" /><p className="text-gray-500">No se encontraron usuarios</p><Button variant="outline" onClick={resetFiltros} className="mt-3"><RotateCcw className="w-4 h-4 mr-2" />Limpiar</Button></div>
      )}

      {/* Modal Editar */}
      {modalEditar && usuarioEditando && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between"><h2 className="text-xl font-bold">Editar Usuario</h2><button onClick={() => setModalEditar(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button></div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Nombres</Label><Input value={editForm.nombre} onChange={e => setEditForm({...editForm, nombre: e.target.value})} /></div>
                <div className="space-y-2"><Label>Apellidos</Label><Input value={editForm.apellidos} onChange={e => setEditForm({...editForm, apellidos: e.target.value})} /></div>
                <div className="space-y-2"><Label>Correo</Label><Input value={editForm.correo} onChange={e => setEditForm({...editForm, correo: e.target.value})} /></div>
                <div className="space-y-2"><Label>Telefono</Label><Input value={editForm.telefono} onChange={e => setEditForm({...editForm, telefono: e.target.value})} /></div>
                <div className="space-y-2"><Label>Documento</Label><Input value={editForm.numeroDocumento} onChange={e => setEditForm({...editForm, numeroDocumento: e.target.value})} /></div>
                <div className="space-y-2"><Label>Rol</Label>
                  <Select value={editForm.rol} onValueChange={v => setEditForm({...editForm, rol: v as RolUsuario})}>
                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>{ROLES.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label>Direccion</Label><Input value={editForm.direccion} onChange={e => setEditForm({...editForm, direccion: e.target.value})} /></div>
                <div className="space-y-2"><Label>Barrio</Label><Input value={editForm.barrio} onChange={e => setEditForm({...editForm, barrio: e.target.value})} /></div>
                <div className="space-y-2"><Label>Departamento</Label><Input value={editForm.departamento} onChange={e => setEditForm({...editForm, departamento: e.target.value})} /></div>
                <div className="space-y-2"><Label>Profesion</Label><Input value={editForm.profesion} onChange={e => setEditForm({...editForm, profesion: e.target.value})} /></div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={editForm.activo} onChange={e => setEditForm({...editForm, activo: e.target.checked})} className="w-4 h-4" /><span>Usuario activo</span></label>
            </div>
            <div className="p-6 border-t flex justify-end gap-3">
              <Button variant="outline" onClick={() => setModalEditar(false)}>Cancelar</Button>
              <Button onClick={confirmarGuardarEdicion} disabled={guardando} className="text-white" style={{ backgroundColor: tema.primario }}>{guardando ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}Guardar</Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Reasignar */}
      {modalReasignar && usuarioEditando && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full">
            <div className="p-6 border-b flex items-center justify-between"><h2 className="text-xl font-bold">Reasignar Usuario</h2><button onClick={() => setModalReasignar(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button></div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-500">Reasignando a: <strong>{usuarioEditando.nombre} {usuarioEditando.apellidos}</strong></p>
              <div className="space-y-2"><Label>Pastor</Label>
                <Select value={reasignForm.pastorId} onValueChange={v => setReasignForm({...reasignForm, pastorId: v})}>
                  <SelectTrigger className="w-full"><SelectValue placeholder="Seleccione" /></SelectTrigger>
                  <SelectContent><SelectItem value="sin_pastor">Sin pastor</SelectItem>{usuarios.filter(u => u.rol === 'pastor' || u.rol === 'pastor_principal').map(p => <SelectItem key={p.id} value={p.id}>{p.nombre} {p.apellidos}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Lider Mentor</Label>
                <Select value={reasignForm.liderMentorId} onValueChange={v => setReasignForm({...reasignForm, liderMentorId: v})}>
                  <SelectTrigger className="w-full"><SelectValue placeholder="Seleccione" /></SelectTrigger>
                  <SelectContent><SelectItem value="sin_mentor">Sin mentor</SelectItem>{usuarios.filter(u => u.rol === 'lider_mentor').map(lm => <SelectItem key={lm.id} value={lm.id}>{lm.nombre} {lm.apellidos}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>GAP</Label>
                <Select value={reasignForm.gapId} onValueChange={v => setReasignForm({...reasignForm, gapId: v})}>
                  <SelectTrigger className="w-full"><SelectValue placeholder="Seleccione" /></SelectTrigger>
                  <SelectContent><SelectItem value="sin_gap">Sin GAP</SelectItem>{gaps.map(g => <SelectItem key={g.id} value={g.id}>{g.codigo} - {g.barrio}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="p-6 border-t flex justify-end gap-3">
              <Button variant="outline" onClick={() => setModalReasignar(false)}>Cancelar</Button>
              <Button onClick={confirmarReasignar} disabled={guardando} className="text-white" style={{ backgroundColor: tema.primario }}>{guardando ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}Reasignar</Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmación Premium */}
      {confirmModal.abierto && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-fade-in">
          <div className="bg-slate-900 border border-white/10 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-6">
            <div className="flex items-center gap-3 border-b border-white/5 pb-4">
              <span className="text-2xl">⚠️</span>
              <h2 className="text-lg font-bold text-white leading-tight">{confirmModal.titulo}</h2>
            </div>
            
            <div className="text-sm text-slate-300 whitespace-pre-line leading-relaxed">
              {confirmModal.mensaje}
            </div>

            <div className="bg-slate-950/50 border border-white/5 rounded-xl p-3 text-xs text-amber-500/80 flex items-start gap-2">
              <span className="text-sm">⚡</span>
              <p>Esta acción se sincronizará automáticamente con la base de datos Supabase en la nube y actualizará los registros locales.</p>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button 
                type="button"
                variant="outline" 
                onClick={() => setConfirmModal(prev => ({ ...prev, abierto: false }))}
                className="border-white/10 text-white hover:bg-white/10"
              >
                Cancelar
              </Button>
              <Button 
                type="button"
                onClick={async () => {
                  setConfirmModal(prev => ({ ...prev, abierto: false }));
                  await confirmModal.onConfirmar();
                }}
                className="text-white bg-amber-600 hover:bg-amber-500"
              >
                Confirmar Cambio
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Advertencia de Duplicado Premium */}
      {duplicateModal.abierto && usuarioEditando && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[110] p-4 animate-fade-in">
          <div className="bg-slate-900 border border-white/10 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-6">
            <div className="flex items-center gap-3 border-b border-white/5 pb-4">
              <span className="text-2xl text-amber-500">⚠️</span>
              <h2 className="text-lg font-bold text-white leading-tight">Datos Duplicados Detectados</h2>
            </div>
            
            <p className="text-sm text-slate-300 leading-relaxed">
              Los datos ingresados ya se encuentran registrados en el sistema. Para continuar, por favor confírmelos o corríjalos a continuación:
            </p>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="modal-doc" className="text-xs text-slate-400">Número de Documento</Label>
                <Input
                  id="modal-doc"
                  value={modalDocVal}
                  onChange={(e) => {
                    setModalDocVal(e.target.value);
                    setModalError('');
                  }}
                  className={`bg-slate-950/50 border-white/10 text-white focus:border-sky-500 ${duplicateModal.docDuplicado ? 'ring-2 ring-amber-500/50 border-amber-500' : ''}`}
                />
                {duplicateModal.docDuplicado && (
                  <p className="text-[11px] text-amber-400">⚠️ Este documento ya está en uso.</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="modal-tel" className="text-xs text-slate-400">Teléfono Celular</Label>
                <Input
                  id="modal-tel"
                  value={modalTelVal}
                  onChange={(e) => {
                    setModalTelVal(e.target.value);
                    setModalError('');
                  }}
                  className={`bg-slate-950/50 border-white/10 text-white focus:border-sky-500 ${duplicateModal.telDuplicado ? 'ring-2 ring-amber-500/50 border-amber-500' : ''}`}
                />
                {duplicateModal.telDuplicado && (
                  <p className="text-[11px] text-amber-400">⚠️ Este teléfono ya está en uso.</p>
                )}
              </div>
            </div>

            {modalError && (
              <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-2.5">
                {modalError}
              </p>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <Button 
                type="button"
                variant="outline" 
                onClick={() => setDuplicateModal(prev => ({ ...prev, abierto: false }))}
                className="border-white/10 text-white hover:bg-white/10"
              >
                Cancelar
              </Button>
              <Button 
                type="button"
                onClick={() => {
                  const docExiste = existeDocumento(modalDocVal, usuarioEditando.id);
                  const telExiste = existeTelefono(modalTelVal, usuarioEditando.id);

                  if (docExiste || telExiste) {
                    setModalError('Los datos ingresados aún están duplicados en el sistema.');
                    setDuplicateModal(prev => ({
                      ...prev,
                      docDuplicado: docExiste,
                      telDuplicado: telExiste,
                    }));
                    return;
                  }

                  setEditForm(prev => ({
                    ...prev,
                    numeroDocumento: modalDocVal,
                    telefono: modalTelVal
                  }));
                  
                  setDuplicateModal(prev => ({ ...prev, abierto: false }));

                  mostrarConfirmacion({
                    ...editForm,
                    numeroDocumento: modalDocVal,
                    telefono: modalTelVal
                  });
                }}
                className="text-white bg-amber-600 hover:bg-amber-500"
              >
                Confirmar y Revalidar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionUsuariosAdmin;
