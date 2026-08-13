import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { 
  ArrowLeft, Plus, Trash2, Copy, Search, Sliders,
  FileText, ToggleLeft, ToggleRight, GripVertical,
  ChevronUp, ChevronDown, X, Save, FileQuestion, Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { TipoPregunta, PreguntaCuestionario, Cuestionario, OpcionRespuesta } from '@/types';
import { 
  getAllCuestionarios,
  crearCuestionario,
  actualizarCuestionario,
  eliminarCuestionario,
  activarCuestionario,
} from '@/services/dataService';

interface CuestionariosModuleProps {
  onVolver: () => void;
}

const TIPOS_PREGUNTA: { value: TipoPregunta; label: string }[] = [
  { value: 'texto_libre', label: 'Texto Libre' },
  { value: 'opcion_multiple', label: 'Opción Múltiple' },
  { value: 'seleccion_unica', label: 'Selección Única' },
  { value: 'desplegable', label: 'Lista Desplegable (Dropdown)' },
  { value: 'seleccion_multiple', label: 'Selección Múltiple' },
  { value: 'casillas', label: 'Casillas de Verificación' },
  { value: 'escala_calificacion', label: 'Escala de Calificación' },
  { value: 'verdadero_falso', label: 'Verdadero/Falso' },
  { value: 'fecha', label: 'Fecha' },
  { value: 'numero', label: 'Número' },
  { value: 'email', label: 'Correo Electrónico' },
  { value: 'telefono', label: 'Teléfono' },
  { value: 'tabla_dinamica', label: 'Tabla Dinámica' },
];

const TIPO_REQUIERE_OPCIONES: TipoPregunta[] = [
  'opcion_multiple', 
  'seleccion_unica', 
  'seleccion_multiple',
  'desplegable',
  'casillas'
];

const CuestionariosModule: React.FC<CuestionariosModuleProps> = ({ onVolver }) => {
  const { usuario, tema } = useAuth();
  const [vista, setVista] = useState<'lista' | 'crear' | 'editar'>('lista');
  const [cuestionarios, setCuestionarios] = useState<Cuestionario[]>([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [cuestionarioEditar, setCuestionarioEditar] = useState<Cuestionario | null>(null);

  // Form states
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [instrucciones, setInstrucciones] = useState('');
  const [preguntas, setPreguntas] = useState<PreguntaCuestionario[]>([]);
  const [activo, setActivo] = useState(true);
  const [requerirAuth, setRequerirAuth] = useState(false);
  const [permitirMultiples, setPermitirMultiples] = useState(false);

  // Search state
  const [busqueda, setBusqueda] = useState('');

  // Undo buffers
  const [cuestionarioBorrado, setCuestionarioBorrado] = useState<Cuestionario | null>(null);
  const [preguntaBorrada, setPreguntaBorrada] = useState<{ pregunta: PreguntaCuestionario; index: number } | null>(null);
  const [opcionBorrada, setOpcionBorrada] = useState<{ preguntaId: string; opcion: OpcionRespuesta; index: number } | null>(null);
  const [subOpcionBorrada, setSubOpcionBorrada] = useState<{ preguntaId: string; opcionId: string; subOpcion: OpcionRespuesta; index: number } | null>(null);

  // Sub-options expanded state
  const [opcionesExpandidas, setOpcionesExpandidas] = useState<Record<string, boolean>>({});

  // Custom Confirmation Dialog State
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    description: '',
    onConfirm: () => {},
  });

  const toggleSubOpciones = (opcionId: string) => {
    setOpcionesExpandidas(prev => ({ ...prev, [opcionId]: !prev[opcionId] }));
  };

  // Undo Handlers
  const handleDeshacerCuestionario = async () => {
    if (!cuestionarioBorrado) return;
    await crearCuestionario(cuestionarioBorrado);
    setCuestionarioBorrado(null);
    toast.success("Cuestionario restaurado");
    await cargarCuestionarios();
  };

  const handleDeshacerPregunta = () => {
    if (!preguntaBorrada) return;
    const { pregunta, index } = preguntaBorrada;
    setPreguntas(prev => {
      const copy = [...prev];
      copy.splice(index, 0, pregunta);
      return copy.map((p, i) => ({ ...p, orden: i + 1 }));
    });
    setPreguntaBorrada(null);
    toast.success("Pregunta restaurada");
  };

  const handleDeshacerOpcion = () => {
    if (!opcionBorrada) return;
    const { preguntaId, opcion, index } = opcionBorrada;
    setPreguntas(prev => prev.map(p => {
      if (p.id !== preguntaId) return p;
      const copy = [...p.opciones];
      copy.splice(index, 0, opcion);
      return { ...p, opciones: copy.map((o, i) => ({ ...o, orden: i + 1 })) };
    }));
    setOpcionBorrada(null);
    toast.success("Opción restaurada");
  };

  const handleDeshacerSubOpcion = () => {
    if (!subOpcionBorrada) return;
    const { preguntaId, opcionId, subOpcion, index } = subOpcionBorrada;
    setPreguntas(prev => prev.map(p => {
      if (p.id !== preguntaId) return p;
      return {
        ...p,
        opciones: p.opciones.map(o => {
          if (o.id !== opcionId) return o;
          const copy = [...(o.subOpciones || [])];
          copy.splice(index, 0, subOpcion);
          return { ...o, subOpciones: copy.map((so, i) => ({ ...so, orden: i + 1 })) };
        })
      };
    }));
    setSubOpcionBorrada(null);
    toast.success("Sub-opción restaurada");
  };

  // Sub-opciones handlers
  const handleAgregarSubOpcion = (preguntaId: string, opcionId: string) => {
    setPreguntas(prev => prev.map(p => {
      if (p.id !== preguntaId) return p;
      return {
        ...p,
        opciones: p.opciones.map(o => {
          if (o.id !== opcionId) return o;
          const subOpciones = o.subOpciones || [];
          return {
            ...o,
            subOpciones: [...subOpciones, { id: `so_${Date.now()}_${Math.random().toString(36).substr(2, 3)}`, texto: '', orden: subOpciones.length + 1 }]
          };
        })
      };
    }));
    setOpcionesExpandidas(prev => ({ ...prev, [opcionId]: true }));
  };

  const handleActualizarSubOpcion = (preguntaId: string, opcionId: string, subOpcionId: string, texto: string) => {
    setPreguntas(prev => prev.map(p => {
      if (p.id !== preguntaId) return p;
      return {
        ...p,
        opciones: p.opciones.map(o => {
          if (o.id !== opcionId) return o;
          return {
            ...o,
            subOpciones: (o.subOpciones || []).map(so => so.id === subOpcionId ? { ...so, texto } : so)
          };
        })
      };
    }));
  };

  const handleConfirmarEliminarSubOpcion = (preguntaId: string, opcionId: string, subOpcionId: string, index: number, textoSubOp: string) => {
    setConfirmDialog({
      isOpen: true,
      title: '¿Eliminar Sub-opción?',
      description: `Esta acción quitará la sub-opción "${textoSubOp || 'sin texto'}" permanentemente de este ministerio. ¿Desea continuar?`,
      onConfirm: () => {
        setPreguntas(prev => prev.map(p => {
          if (p.id !== preguntaId) return p;
          return {
            ...p,
            opciones: p.opciones.map(o => {
              if (o.id !== opcionId) return o;
              const subOpt = (o.subOpciones || [])[index];
              setSubOpcionBorrada({ preguntaId, opcionId, subOpcion: subOpt, index });
              return {
                ...o,
                subOpciones: (o.subOpciones || []).filter(so => so.id !== subOpcionId).map((so, i) => ({ ...so, orden: i + 1 }))
              };
            })
          };
        }));
        toast("Sub-opción eliminada", {
          action: {
            label: "Deshacer",
            onClick: () => handleDeshacerSubOpcion()
          }
        });
      }
    });
  };

  useEffect(() => {
    cargarCuestionarios();
  }, []);

  const cargarCuestionarios = async () => {
    setCargando(true);
    const data = await getAllCuestionarios();
    setCuestionarios(data);
    setCargando(false);
  };

  const resetForm = () => {
    setTitulo('');
    setDescripcion('');
    setInstrucciones('');
    setPreguntas([]);
    setActivo(true);
    setRequerirAuth(false);
    setPermitirMultiples(false);
    setCuestionarioEditar(null);
  };

  const handleNuevo = () => { 
    resetForm(); 
    setVista('crear'); 
  };

  const handleEditar = (c: Cuestionario) => {
    setTitulo(c.titulo);
    setDescripcion(c.descripcion);
    setInstrucciones(c.instrucciones || '');
    setPreguntas(c.preguntas?.map(p => ({...p})) || []);
    setActivo(c.activo);
    setRequerirAuth(c.requerirAutenticacion);
    setPermitirMultiples(c.permitirMultiplesRespuestas);
    setCuestionarioEditar(c);
    setVista('editar');
  };

  const handleEliminar = async (id: string) => {
    const c = cuestionarios.find(x => x.id === id);
    if (!c) return;
    
    setConfirmDialog({
      isOpen: true,
      title: '¿Eliminar Cuestionario?',
      description: `Esta acción desactivará y eliminará el cuestionario "${c.titulo}". Las respuestas ya registradas no se perderán pero el cuestionario ya no estará disponible. ¿Desea continuar?`,
      onConfirm: async () => {
        setCuestionarioBorrado(c);
        await eliminarCuestionario(id);
        
        toast("Cuestionario eliminado", {
          action: {
            label: "Deshacer",
            onClick: () => handleDeshacerCuestionario()
          }
        });

        if (cuestionarioEditar?.id === id) {
          resetForm();
          setVista('lista');
        }
        await cargarCuestionarios();
      }
    });
  };

  const handleToggleActivo = async (c: Cuestionario) => {
    if (c.activo) {
      await eliminarCuestionario(c.id);
      toast.success('Desactivado');
    } else {
      await activarCuestionario(c.id);
      toast.success('Activado');
    }
    await cargarCuestionarios();
    
    // Update selected questionnaire status if currently open
    if (cuestionarioEditar?.id === c.id) {
      setActivo(!c.activo);
    }
  };

  const handleGuardar = async () => {
    if (!titulo.trim()) { toast.error('El título es obligatorio'); return; }
    if (preguntas.length === 0) { toast.error('Agregue al menos una pregunta'); return; }

    setGuardando(true);
    const datos: Partial<Cuestionario> = {
      titulo: titulo.trim(),
      descripcion: descripcion.trim(),
      instrucciones: instrucciones.trim() || undefined,
      preguntas,
      activo,
      requerirAutenticacion: requerirAuth,
      permitirMultiplesRespuestas: permitirMultiples,
      creadoPor: usuario?.id || '',
      creadoPorNombre: usuario ? `${usuario.nombre} ${usuario.apellidos}` : '',
    };

    let guardadoId = cuestionarioEditar?.id || '';
    if (vista === 'editar' && cuestionarioEditar) {
      await actualizarCuestionario(cuestionarioEditar.id, datos);
      toast.success('Cuestionario actualizado');
    } else {
      const nuevo = await crearCuestionario(datos);
      if (nuevo) {
        guardadoId = nuevo.id;
        toast.success('Cuestionario creado');
      } else {
        toast.success('Cuestionario creado');
      }
    }

    setGuardando(false);
    await cargarCuestionarios();
    
    // Auto-select the saved questionnaire to keep editing
    const actualizados = await getAllCuestionarios();
    const encontrado = actualizados.find(c => c.id === guardadoId || c.titulo === datos.titulo);
    if (encontrado) {
      handleEditar(encontrado);
    } else {
      setVista('lista');
      resetForm();
    }
  };

  const handleAgregarPregunta = (tipo: TipoPregunta) => {
    const nueva: PreguntaCuestionario = {
      id: `preg_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      titulo: '',
      tipo,
      opciones: tipo === 'verdadero_falso' 
        ? [
            { id: `o_${Date.now()}_1`, texto: 'Si', valor: 1, orden: 1 },
            { id: `o_${Date.now()}_2`, texto: 'No', valor: 0, orden: 2 },
          ]
        : [],
      requerida: true,
      orden: preguntas.length + 1,
      placeholder: ['texto_libre', 'email', 'telefono'].includes(tipo) ? 'Escriba su respuesta...' : undefined,
      ...(tipo === 'escala_calificacion' ? { escalaMin: 1, escalaMax: 5, etiquetaMin: 'Muy malo', etiquetaMax: 'Excelente' } : {}),
      ...(tipo === 'texto_libre' ? { maxCaracteres: 500 } : {}),
    };
    setPreguntas(prev => [...prev, nueva]);
  };

  const handleEliminarPregunta = (id: string, index: number) => {
    const p = preguntas[index];
    setConfirmDialog({
      isOpen: true,
      title: '¿Eliminar Pregunta?',
      description: `Se eliminará la pregunta "${p.titulo || 'sin título'}" y todas sus opciones de respuesta del borrador actual. ¿Desea continuar?`,
      onConfirm: () => {
        setPreguntaBorrada({ pregunta: p, index });
        setPreguntas(prev => prev.filter(x => x.id !== id).map((x, i) => ({ ...x, orden: i + 1 })));
        toast("Pregunta eliminada", {
          action: {
            label: "Deshacer",
            onClick: () => handleDeshacerPregunta()
          }
        });
      }
    });
  };

  const handleMoverPregunta = (index: number, direccion: 'arriba' | 'abajo') => {
    if (direccion === 'arriba' && index === 0) return;
    if (direccion === 'abajo' && index >= preguntas.length - 1) return;
    const newPreguntas = [...preguntas];
    const swapIndex = direccion === 'arriba' ? index - 1 : index + 1;
    [newPreguntas[index], newPreguntas[swapIndex]] = [newPreguntas[swapIndex], newPreguntas[index]];
    setPreguntas(newPreguntas.map((p, i) => ({ ...p, orden: i + 1 })));
  };

  const updatePregunta = (id: string, campo: string, valor: unknown) => {
    setPreguntas(prev => prev.map(p => p.id === id ? { ...p, [campo]: valor } : p));
  };

  const handleAgregarOpcion = (preguntaId: string) => {
    setPreguntas(prev => prev.map(p => {
      if (p.id !== preguntaId) return p;
      return { ...p, opciones: [...p.opciones, { id: `o_${Date.now()}_${Math.random().toString(36).substr(2, 3)}`, texto: '', orden: p.opciones.length + 1 }] };
    }));
  };

  const handleEliminarOpcion = (preguntaId: string, opcionId: string, index: number, textoOpcion: string) => {
    setConfirmDialog({
      isOpen: true,
      title: '¿Eliminar Opción de Respuesta?',
      description: `Esta acción quitará la opción "${textoOpcion || 'sin texto'}" de la lista. Si tiene sub-opciones asociadas (como áreas internas), también se eliminarán. ¿Desea continuar?`,
      onConfirm: () => {
        setPreguntas(prev => prev.map(p => {
          if (p.id !== preguntaId) return p;
          const opt = p.opciones[index];
          setOpcionBorrada({ preguntaId, opcion: opt, index });
          return {
            ...p,
            opciones: p.opciones.filter(o => o.id !== opcionId).map((o, i) => ({ ...o, orden: i + 1 }))
          };
        }));
        toast("Opción eliminada", {
          action: {
            label: "Deshacer",
            onClick: () => handleDeshacerOpcion()
          }
        });
      }
    });
  };

  const handleActualizarOpcion = (preguntaId: string, opcionId: string, texto: string) => {
    setPreguntas(prev => prev.map(p => {
      if (p.id !== preguntaId) return p;
      return { ...p, opciones: p.opciones.map(o => o.id === opcionId ? { ...o, texto } : o) };
    }));
  };

  const handleDuplicar = async (c: Cuestionario) => {
    await crearCuestionario({
      ...c,
      titulo: `${c.titulo} (Copia)`,
      creadoPor: usuario?.id || '',
      creadoPorNombre: usuario ? `${usuario.nombre} ${usuario.apellidos}` : '',
      activo: false,
    });
    toast.success('Duplicado');
    await cargarCuestionarios();
  };

  // Filter questionnaires based on search box
  const cuestionariosFiltrados = cuestionarios.filter(c => 
    c.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.descripcion.toLowerCase().includes(busqueda.toLowerCase())
  );

  // Compute metrics
  const totalCuestionarios = cuestionarios.length;
  const activosCuestionarios = cuestionarios.filter(c => c.activo).length;
  const inactivosCuestionarios = totalCuestionarios - activosCuestionarios;

  const editorActivo = vista === 'crear' || vista === 'editar';

  return (
    <div className="p-6 max-w-7xl mx-auto animate-fade-in pb-24 lg:pb-6">
      {/* Header bar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onVolver}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Volver
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Cuestionarios</h1>
        </div>
        {/* Mobile-only "Nuevo" button when editor is not active */}
        {!editorActivo && (
          <Button onClick={handleNuevo} className="lg:hidden text-white font-medium" style={{ backgroundColor: tema.primario }}>
            <Plus className="w-4 h-4 mr-1" /> Nuevo
          </Button>
        )}
      </div>

      {/* Main split-pane workspace */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        
        {/* ================= LEFT SIDEBAR (List) ================= */}
        <div className={`w-full lg:w-[320px] space-y-4 shrink-0 ${editorActivo ? 'hidden lg:block' : 'block'}`}>
          <div className="bg-card shadow-sm rounded-2xl border border-white/20 p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-lg flex items-center gap-2">
                <Sliders className="w-4 h-4" style={{ color: tema.primario }} /> Cuestionarios ({cuestionarios.length})
              </h2>
              <Button onClick={handleNuevo} size="sm" className="hidden lg:flex text-white font-medium" style={{ backgroundColor: tema.primario }}>
                <Plus className="w-4 h-4 mr-1" /> Nuevo
              </Button>
            </div>

            {/* Search box */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <Input 
                value={busqueda} 
                onChange={e => setBusqueda(e.target.value)} 
                placeholder="Buscar cuestionario..." 
                className="pl-9"
              />
            </div>

            {/* List items */}
            {cargando ? (
              <div className="text-center py-8">
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" />
                <p className="mt-2 text-xs text-gray-500">Cargando...</p>
              </div>
            ) : cuestionariosFiltrados.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">
                No se encontraron cuestionarios.
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                {cuestionariosFiltrados.map(c => {
                  const esSeleccionado = cuestionarioEditar?.id === c.id;
                  return (
                    <div 
                      key={c.id} 
                      onClick={() => handleEditar(c)}
                      className={`group p-4 rounded-xl border transition-all cursor-pointer relative ${
                        esSeleccionado 
                          ? 'border-sky-500 bg-sky-50/45 dark:bg-sky-950/20 shadow-sm' 
                          : 'border-white/20 hover:border-sky-300 hover:bg-white/50 bg-white/20'
                      } ${!c.activo ? 'opacity-70' : ''}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-sm truncate">{c.titulo}</h3>
                          <p className="text-xs text-gray-400 truncate mt-0.5">{c.descripcion || 'Sin descripción'}</p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {c.activo ? (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">Activo</span>
                          ) : (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500 font-medium">Inactivo</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-gray-400 mt-3 pt-2 border-t border-gray-100/50">
                        <span>{c.preguntas?.length || 0} preguntas</span>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                          <button 
                            onClick={() => handleDuplicar(c)}
                            title="Duplicar" 
                            className="text-gray-400 hover:text-sky-600 transition-colors p-1"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => handleToggleActivo(c)}
                            title={c.activo ? "Desactivar" : "Activar"} 
                            className="text-gray-400 hover:text-green-600 transition-colors p-1"
                          >
                            {c.activo ? <ToggleRight className="w-3.5 h-3.5 text-green-600" /> : <ToggleLeft className="w-3.5 h-3.5" />}
                          </button>
                          <button 
                            onClick={() => handleEliminar(c.id)}
                            title="Eliminar" 
                            className="text-gray-400 hover:text-red-600 transition-colors p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-500" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ================= RIGHT MAIN PANEL (Editor / Empty State) ================= */}
        <div className={`flex-1 w-full space-y-6 ${editorActivo ? 'block' : 'hidden lg:block'}`}>
          
          {editorActivo ? (
            /* EDITOR FORM */
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between gap-4 lg:hidden">
                <Button variant="outline" size="sm" onClick={() => { setVista('lista'); resetForm(); }}>
                  <ArrowLeft className="w-4 h-4 mr-1" /> Volver a la Lista
                </Button>
                <h2 className="font-semibold text-lg">
                  {vista === 'editar' ? 'Editar' : 'Crear'} Cuestionario
                </h2>
              </div>

              {/* Info basica */}
              <Card className="bg-card shadow-sm border border-white/20 overflow-hidden">
                <CardHeader className="bg-white/40 dark:bg-black/10 border-b border-white/10 p-5">
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <FileText className="w-5 h-5" style={{ color: tema.primario }} /> 
                    Información del Cuestionario
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5 space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium">Título del Cuestionario *</Label>
                    <Input 
                      value={titulo} 
                      onChange={e => setTitulo(e.target.value)} 
                      placeholder="Ej: Evaluación Trimestral de Mentores" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium">Descripción</Label>
                    <Textarea 
                      value={descripcion} 
                      onChange={e => setDescripcion(e.target.value)} 
                      placeholder="Explique brevemente el propósito de esta encuesta" 
                      rows={2}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium">Instrucciones</Label>
                    <Textarea 
                      value={instrucciones} 
                      onChange={e => setInstrucciones(e.target.value)} 
                      placeholder="Instrucciones claras para los usuarios" 
                      rows={2}
                    />
                  </div>
                  <div className="flex flex-wrap gap-6 pt-2">
                    <label className="flex items-center gap-2 cursor-pointer text-sm">
                      <input 
                        type="checkbox" 
                        checked={activo} 
                        onChange={e => setActivo(e.target.checked)} 
                        className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500" 
                      />
                      <span>Cuestionario Activo</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-sm">
                      <input 
                        type="checkbox" 
                        checked={requerirAuth} 
                        onChange={e => setRequerirAuth(e.target.checked)} 
                        className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500" 
                      />
                      <span>Requerir Autenticación (Iniciar Sesión)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-sm">
                      <input 
                        type="checkbox" 
                        checked={permitirMultiples} 
                        onChange={e => setPermitirMultiples(e.target.checked)} 
                        className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500" 
                      />
                      <span>Permitir Múltiples Respuestas</span>
                    </label>
                  </div>
                </CardContent>
              </Card>

              {/* Preguntas */}
              <Card className="bg-card shadow-sm border border-white/20">
                <CardHeader className="bg-white/40 dark:bg-black/10 border-b border-white/10 p-5 flex flex-row items-center justify-between">
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <FileQuestion className="w-5 h-5" style={{ color: tema.primario }} /> 
                    Preguntas ({preguntas.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5 space-y-4">
                  {preguntas.map((pregunta, index) => (
                    <div 
                      key={pregunta.id} 
                      className="border border-white/10 rounded-2xl p-5 bg-white/40 dark:bg-black/20 backdrop-blur-sm shadow-sm transition-all hover:shadow-md"
                    >
                      <div className="flex items-start gap-3">
                        {/* Controles de orden */}
                        <div className="flex flex-col gap-1 pt-1 shrink-0">
                          <button 
                            onClick={() => handleMoverPregunta(index, 'arriba')} 
                            disabled={index === 0} 
                            className="text-gray-400 hover:text-gray-600 disabled:opacity-20 p-0.5 rounded hover:bg-gray-100/50"
                          >
                            <ChevronUp className="w-4 h-4" />
                          </button>
                          <div className="flex justify-center text-gray-300">
                            <GripVertical className="w-4 h-4" />
                          </div>
                          <button 
                            onClick={() => handleMoverPregunta(index, 'abajo')} 
                            disabled={index >= preguntas.length - 1} 
                            className="text-gray-400 hover:text-gray-600 disabled:opacity-20 p-0.5 rounded hover:bg-gray-100/50"
                          >
                            <ChevronDown className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Contenido de la pregunta */}
                        <div className="flex-1 space-y-3 min-w-0">
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className="text-xs font-medium px-2 py-0.5 rounded bg-sky-100 text-sky-700">
                              {TIPOS_PREGUNTA.find(t => t.value === pregunta.tipo)?.label || pregunta.tipo}
                            </span>
                            <label className="flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer">
                              <input 
                                type="checkbox" 
                                checked={pregunta.requerida} 
                                onChange={e => updatePregunta(pregunta.id, 'requerida', e.target.checked)} 
                                className="w-3.5 h-3.5 rounded text-sky-600 focus:ring-sky-500" 
                              /> 
                              Pregunta Obligatoria
                            </label>
                            <span className="text-xs text-gray-400 ml-auto font-medium">Pregunta #{index + 1}</span>
                          </div>

                          <div className="space-y-1">
                            <Input 
                              value={pregunta.titulo} 
                              onChange={e => updatePregunta(pregunta.id, 'titulo', e.target.value)} 
                              placeholder="Escriba la pregunta aquí..." 
                              className="font-medium bg-white/70 dark:bg-black/10"
                            />
                          </div>

                          {pregunta.placeholder !== undefined && (
                            <div className="space-y-1">
                              <Label className="text-xs text-gray-400">Texto de ayuda (placeholder)</Label>
                              <Input 
                                value={pregunta.placeholder} 
                                onChange={e => updatePregunta(pregunta.id, 'placeholder', e.target.value)} 
                                placeholder="Escriba indicaciones o sugerencias..." 
                                className="text-sm bg-white/50" 
                              />
                            </div>
                          )}

                          {/* Opciones */}
                          {TIPO_REQUIERE_OPCIONES.includes(pregunta.tipo) && (
                            <div className="space-y-2 bg-white/30 dark:bg-black/10 p-4 rounded-xl border border-white/10 mt-2">
                              <Label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Opciones de Respuesta:</Label>
                              <div className="space-y-3">
                                {pregunta.opciones.map((opcion, oIdx) => {
                                  const estaExpandida = opcionesExpandidas[opcion.id];
                                  return (
                                    <div key={opcion.id} className="space-y-2 border-b border-gray-100/30 pb-2 last:border-0 last:pb-0">
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs text-gray-400 w-4 font-medium">{oIdx + 1}.</span>
                                        <Input 
                                          value={opcion.texto} 
                                          onChange={e => handleActualizarOpcion(pregunta.id, opcion.id, e.target.value)} 
                                          placeholder={`Opción ${oIdx + 1}`} 
                                          className="text-sm bg-white/80 dark:bg-black/10 h-8 flex-1" 
                                        />
                                        
                                        {/* Toggle sub-options button */}
                                        <Button 
                                          type="button" 
                                          variant="ghost" 
                                          size="sm" 
                                          onClick={() => toggleSubOpciones(opcion.id)}
                                          className="text-xs px-2 h-8 text-sky-600 hover:text-sky-800 shrink-0"
                                        >
                                          {estaExpandida ? 'Ocultar Sub-opciones' : `Sub-opciones (${opcion.subOpciones?.length || 0})`}
                                        </Button>

                                        <button 
                                          type="button"
                                          onClick={() => handleEliminarOpcion(pregunta.id, opcion.id, oIdx, opcion.texto)} 
                                          className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 shrink-0"
                                        >
                                          <X className="w-4 h-4" />
                                        </button>
                                      </div>

                                      {/* Sub-options panel */}
                                      {estaExpandida && (
                                        <div className="ml-8 pl-4 border-l-2 border-dashed border-gray-200 dark:border-gray-800 space-y-2 py-2">
                                          <Label className="text-[10px] font-semibold text-gray-400 uppercase">Sub-opciones:</Label>
                                          <div className="space-y-2">
                                            {(opcion.subOpciones || []).map((subOp, sIdx) => (
                                              <div key={subOp.id} className="flex items-center gap-2">
                                                <span className="text-[10px] text-gray-400 w-3 font-medium">{sIdx + 1}.</span>
                                                <Input 
                                                  value={subOp.texto} 
                                                  onChange={e => handleActualizarSubOpcion(pregunta.id, opcion.id, subOp.id, e.target.value)} 
                                                  placeholder={`Sub-opción ${sIdx + 1}`} 
                                                  className="text-xs bg-white/70 dark:bg-black/10 h-7 flex-1" 
                                                />
                                                <button 
                                                  type="button"
                                                  onClick={() => handleConfirmarEliminarSubOpcion(pregunta.id, opcion.id, subOp.id, sIdx, subOp.texto)} 
                                                  className="text-red-400 hover:text-red-600 p-1 rounded hover:bg-red-50 shrink-0"
                                                >
                                                  <X className="w-3.5 h-3.5" />
                                                </button>
                                              </div>
                                            ))}
                                          </div>
                                          <Button 
                                            type="button"
                                            variant="outline" 
                                            size="sm" 
                                            onClick={() => handleAgregarSubOpcion(pregunta.id, opcion.id)} 
                                            className="text-[10px] h-6 px-2 border-dashed mt-1"
                                          >
                                            <Plus className="w-2.5 h-2.5 mr-1" /> Agregar Sub-opción
                                          </Button>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                              <Button 
                                type="button"
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleAgregarOpcion(pregunta.id)} 
                                className="text-xs mt-1 border-dashed"
                              >
                                <Plus className="w-3 h-3 mr-1" /> Agregar Opción
                              </Button>
                            </div>
                          )}

                          {/* Escala */}
                          {pregunta.tipo === 'escala_calificacion' && (
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-white/30 dark:bg-black/10 p-4 rounded-xl border border-white/10">
                              <div>
                                <Label className="text-xs">Valor Mínimo</Label>
                                <Input 
                                  type="number" 
                                  value={pregunta.escalaMin || 1} 
                                  onChange={e => updatePregunta(pregunta.id, 'escalaMin', parseInt(e.target.value))} 
                                  className="h-8 text-sm mt-1"
                                />
                              </div>
                              <div>
                                <Label className="text-xs">Valor Máximo</Label>
                                <Input 
                                  type="number" 
                                  value={pregunta.escalaMax || 5} 
                                  onChange={e => updatePregunta(pregunta.id, 'escalaMax', parseInt(e.target.value))} 
                                  className="h-8 text-sm mt-1"
                                />
                              </div>
                              <div>
                                <Label className="text-xs">Etiqueta Mínima</Label>
                                <Input 
                                  value={pregunta.etiquetaMin || ''} 
                                  onChange={e => updatePregunta(pregunta.id, 'etiquetaMin', e.target.value)} 
                                  placeholder="Ej: Bajo" 
                                  className="h-8 text-sm mt-1"
                                />
                              </div>
                              <div>
                                <Label className="text-xs">Etiqueta Máxima</Label>
                                <Input 
                                  value={pregunta.etiquetaMax || ''} 
                                  onChange={e => updatePregunta(pregunta.id, 'etiquetaMax', e.target.value)} 
                                  placeholder="Ej: Alto" 
                                  className="h-8 text-sm mt-1"
                                />
                              </div>
                            </div>
                          )}

                          {/* Tabla dinamica */}
                          {pregunta.tipo === 'tabla_dinamica' && (
                            <div className="space-y-3 bg-white/30 dark:bg-black/10 p-4 rounded-xl border border-white/10">
                              <div className="space-y-1">
                                <Label className="text-xs">Filas (Aspectos a evaluar, separadas por coma)</Label>
                                <Input 
                                  value={pregunta.filasTabla?.join(', ') || ''} 
                                  onChange={e => updatePregunta(pregunta.id, 'filasTabla', e.target.value.split(',').map(s => s.trim()).filter(Boolean))} 
                                  placeholder="Ej: Puntualidad, Respeto, Dominio de Tema" 
                                  className="text-sm"
                                />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs">Columnas (Escala o respuestas, separadas por coma)</Label>
                                <Input 
                                  value={pregunta.columnasTabla?.join(', ') || ''} 
                                  onChange={e => updatePregunta(pregunta.id, 'columnasTabla', e.target.value.split(',').map(s => s.trim()).filter(Boolean))} 
                                  placeholder="Ej: Nunca, A veces, Siempre" 
                                  className="text-sm"
                                />
                              </div>
                            </div>
                          )}

                          {/* Max caracteres */}
                          {pregunta.tipo === 'texto_libre' && (
                            <div className="w-1/3">
                              <Label className="text-xs text-gray-400">Límite de caracteres</Label>
                              <Input 
                                type="number" 
                                value={pregunta.maxCaracteres || 500} 
                                onChange={e => updatePregunta(pregunta.id, 'maxCaracteres', parseInt(e.target.value))} 
                                className="h-8 text-sm mt-1"
                              />
                            </div>
                          )}
                        </div>

                        {/* Eliminar pregunta */}
                        <button 
                          type="button"
                          onClick={() => handleEliminarPregunta(pregunta.id, index)} 
                          className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 shrink-0"
                          title="Eliminar Pregunta"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {preguntas.length === 0 && (
                    <div className="text-center py-10 bg-white/10 rounded-2xl border border-dashed border-white/20">
                      <FileQuestion className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm text-gray-500">Este cuestionario aún no tiene preguntas.</p>
                      <p className="text-xs text-gray-400 mt-1">Usa los botones de abajo para agregar una pregunta.</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Agregar preguntas */}
              <Card className="bg-card shadow-sm border border-white/20">
                <CardHeader className="bg-white/40 dark:bg-black/10 border-b border-white/10 p-5">
                  <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                    <Plus className="w-4 h-4" style={{ color: tema.primario }} />
                    Agregar Nueva Pregunta
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                    {TIPOS_PREGUNTA.map(tipo => (
                      <Button 
                        key={tipo.value} 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleAgregarPregunta(tipo.value)} 
                        className="text-xs justify-start h-8 px-2"
                      >
                        <Plus className="w-3 h-3 mr-1.5 shrink-0" />
                        <span className="truncate">{tipo.label}</span>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Botones de accion final */}
              <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline" onClick={() => { setVista('lista'); resetForm(); }}>
                  Cancelar
                </Button>
                <Button 
                  onClick={handleGuardar} 
                  disabled={guardando} 
                  className="text-white font-medium" 
                  style={{ backgroundColor: tema.primario }}
                >
                  {guardando ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Guardando...</>
                  ) : (
                    <><Save className="w-4 h-4 mr-2" /> {vista === 'editar' ? 'Guardar Cambios' : 'Crear Cuestionario'}</>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            /* EMPTY STATE (DEFAULT DASHBOARD VIEW) */
            <div className="h-full flex flex-col justify-center items-center p-8 bg-card shadow-sm rounded-2xl border border-white/20 text-center py-16 animate-fade-in">
              <FileQuestion className="w-16 h-16 text-sky-400 mb-4 animate-pulse" />
              <h2 className="text-xl font-bold mb-2">Panel de Control de Cuestionarios</h2>
              <p className="text-sm text-gray-500 max-w-md mb-8">
                Crea y edita encuestas, exámenes y formularios dinámicos para medir el crecimiento, satisfacción y opinión de los integrantes de tu red GAP.
              </p>

              {/* Metrics Grid */}
              <div className="grid grid-cols-3 gap-6 max-w-lg w-full mb-8">
                <div className="p-4 bg-white/40 dark:bg-black/10 rounded-2xl border border-white/10 animate-fade-in" style={{ animationDelay: '0.1s' }}>
                  <h4 className="text-2xl font-bold text-sky-600">{totalCuestionarios}</h4>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mt-1">Total</p>
                </div>
                <div className="p-4 bg-white/40 dark:bg-black/10 rounded-2xl border border-white/10 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                  <h4 className="text-2xl font-bold text-green-600">{activosCuestionarios}</h4>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mt-1">Activos</p>
                </div>
                <div className="p-4 bg-white/40 dark:bg-black/10 rounded-2xl border border-white/10 animate-fade-in" style={{ animationDelay: '0.3s' }}>
                  <h4 className="text-2xl font-bold text-gray-550">{inactivosCuestionarios}</h4>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mt-1">Inactivos</p>
                </div>
              </div>

              <div className="flex gap-4">
                <Button onClick={handleNuevo} className="text-white font-medium" style={{ backgroundColor: tema.primario }}>
                  <Plus className="w-4 h-4 mr-2" /> Crear Cuestionario
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Diálogo de Confirmación de Borrado */}
      <Dialog open={confirmDialog.isOpen} onOpenChange={(open) => setConfirmDialog(prev => ({ ...prev, isOpen: open }))}>
        <DialogContent className="border border-white/10 bg-[#0a1410]/95 backdrop-blur-md shadow-2xl rounded-2xl max-w-sm text-white">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-white flex items-center gap-2">
              <span className="text-red-500">⚠️</span> {confirmDialog.title}
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-400 mt-1">
              {confirmDialog.description}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 flex gap-2 justify-end sm:space-x-0">
            <Button 
              variant="outline" 
              onClick={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
              className="border-white/10 text-white hover:bg-white/5 bg-transparent text-xs h-8"
            >
              {confirmDialog.cancelText || 'Cancelar'}
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => {
                confirmDialog.onConfirm();
                setConfirmDialog(prev => ({ ...prev, isOpen: false }));
              }}
              className="bg-red-650 hover:bg-red-700 text-white border-0 font-semibold text-xs h-8"
            >
              {confirmDialog.confirmText || 'Eliminar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CuestionariosModule;
