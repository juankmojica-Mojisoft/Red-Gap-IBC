import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  ArrowLeft, 
  Users, 
  MapPin, 
  Calendar, 
  Clock, 
  Plus, 
  Trash2, 
  CheckCircle, 
  Loader2,
  UserPlus,
  Repeat,
  Video,
  Home
} from 'lucide-react';
import { toast } from 'sonner';
import type { 
  MiembroGAP, 
  FrecuenciaReunion, 
  ModalidadReunion, 
  UbicacionReunion,
  TipoDocumento, 
  Sexo, 
  EstadoCivil, 
  Ministerio, 
  ModuloEFC, 
  OpcionRespuesta
} from '@/types';
import { usuariosMock, gapsMock } from '@/data/mockData';
import { crearGAP, actualizarGAP, getCuestionarioById } from '@/services/dataService';

interface GestionGAPFormProps {
  onVolver: () => void;
  onExito: () => void;
  gapEditar?: typeof gapsMock[0];
}

const GestionGAPForm: React.FC<GestionGAPFormProps> = ({ onVolver, onExito, gapEditar }) => {
  const { usuario, tema } = useAuth();
  const [paso, setPaso] = useState(1);
  const [guardado, setGuardado] = useState(false);
  const [guardandoForm, setGuardandoForm] = useState(false);
  const [mostrarFormMiembro, setMostrarFormMiembro] = useState(false);
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
  
  // Leer gaps guardados
  const getGapsGuardados = () => {
    const saved = localStorage.getItem('gaps');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return gapsMock;
  };
  
  const getNumerosReciclados = (): number[] => {
    const guardados = localStorage.getItem('numerosGAPsDisponibles');
    if (guardados) {
      try { return JSON.parse(guardados); } catch (e) {}
    }
    return [];
  };

  const [numerosReciclados, setNumerosReciclados] = useState<number[]>(getNumerosReciclados());
  
  // Generar número GAP automáticamente
  const generarNumeroGAP = () => {
    const rec = getNumerosReciclados();
    if (rec.length > 0) return rec[0]; // Sugerir el menor reciclado
    
    const gapsGuardados = getGapsGuardados();
    const maxNumero = gapsGuardados.reduce((max: number, gap: any) => gap.numero > max ? gap.numero : max, 0);
    return maxNumero + 1;
  };
  
  const initNumero = gapEditar?.numero || generarNumeroGAP();

  const [formData, setFormData] = useState({
    numero: initNumero,
    codigo: gapEditar?.codigo || `GAP-${initNumero}`,
    liderGapId: gapEditar?.liderGapId || '',
    timoteoId: gapEditar?.timoteoId || '',
    pastorId: gapEditar?.pastorId || usuario?.id || '',
    liderMentorId: gapEditar?.liderMentorId || '',
    zonaId: gapEditar?.zonaId || '',
    direccion: gapEditar?.direccion || '',
    barrio: gapEditar?.barrio || '',
    departamento: gapEditar?.departamento || 'Antioquia',
    diaReunion: gapEditar?.diaReunion || 'Martes',
    horaReunion: gapEditar?.horaReunion || '19:00',
    frecuencia: gapEditar?.frecuencia || 'Semanal' as FrecuenciaReunion,
    modalidad: gapEditar?.modalidad || 'Presencial' as ModalidadReunion,
    ubicacionReunion: gapEditar?.ubicacionReunion || 'Casa' as UbicacionReunion,
  });

  const [miembros, setMiembros] = useState<MiembroGAP[]>(gapEditar?.miembros || []);
  const [nuevoMiembro, setNuevoMiembro] = useState<Partial<MiembroGAP>>({
    tipoDocumento: 'CC',
    estadoCivil: 'Soltero',
    sexo: 'Masculino',
    esMiembroIBC: false,
    esBautizado: false,
    escuelaFormacion: 'No',
    ministerios: [],
    foto: '',
  });

  const tiposDocumento: { value: TipoDocumento; label: string }[] = [
    { value: 'CC', label: 'Cédula de Ciudadanía' },
    { value: 'TI', label: 'Tarjeta de Identidad' },
    { value: 'CE', label: 'Cédula de Extranjería' },
    { value: 'Pasaporte', label: 'Pasaporte' },
  ];

  const generos: { value: Sexo; label: string }[] = [
    { value: 'Masculino', label: 'Masculino' },
    { value: 'Femenino', label: 'Femenino' },
  ];

  const estadosCivil: { value: EstadoCivil; label: string }[] = [
    { value: 'Soltero', label: 'Soltero(a)' },
    { value: 'Casado', label: 'Casado(a)' },
    { value: 'Viudo', label: 'Viudo(a)' },
    { value: 'Union Libre', label: 'Unión Libre' },
  ];

  const modulosEFC: { value: ModuloEFC; label: string }[] = [
    { value: 'Discipulado', label: 'Discipulado' },
    { value: 'Panorama Bíblico', label: 'Panorama Bíblico' },
    { value: 'Fundamentos de Fe', label: 'Fundamentos de Fe' },
    { value: 'Guerra Espiritual', label: 'Guerra Espiritual' },
    { value: 'Liderazgo Estratégico', label: 'Liderazgo Estratégico' },
  ];

  const [opcionesMinisterios, setOpcionesMinisterios] = useState<OpcionRespuesta[]>([]);

  useEffect(() => {
    const loadCuestionario = async () => {
      try {
        const cuestionario = await getCuestionarioById('cuest4');
        if (cuestionario) {
          const qPin19 = cuestionario.preguntas.find(p => p.id === 'pin19' || p.titulo.toLowerCase().includes('ministerio'));
          if (qPin19 && qPin19.opciones.length > 0) {
            const sorted = [...qPin19.opciones].sort((a, b) => a.orden - b.orden);
            setOpcionesMinisterios(sorted);
            return;
          }
        }
      } catch (err) {
        console.warn('Error al cargar cuestionario, usando fallback:', err);
      }
      
      setOpcionesMinisterios([
        { 
          id: 'mn11', 
          texto: 'Franja Generacional', 
          orden: 1,
          subOpciones: [
            { id: 'sub_g1', texto: 'Timothy Kids', orden: 1 },
            { id: 'sub_g2', texto: 'Nexus', orden: 2 },
            { id: 'sub_g3', texto: 'Adic', orden: 3 },
            { id: 'sub_g4', texto: 'Keepers', orden: 4 }
          ]
        },
        { id: 'mn1', texto: 'Forjados', orden: 2 },
        { id: 'mn2', texto: 'Mujer Real', orden: 3 },
        { id: 'mn3', texto: 'Kairos', orden: 4 },
        { id: 'mn4', texto: 'Años Dorados', orden: 5 },
        { 
          id: 'mn5', 
          texto: 'Servidores', 
          orden: 6,
          subOpciones: [
            { id: 'sub_s1', texto: 'Staff', orden: 1 },
            { id: 'sub_s2', texto: 'CAS', orden: 2 }
          ]
        },
        { id: 'mn6', texto: 'Intercesión', orden: 7 },
        { 
          id: 'mn7', 
          texto: 'Flamas de Fuego', 
          orden: 8,
          subOpciones: [
            { id: 'sub_f1', texto: 'Danza', orden: 1 },
            { id: 'sub_f2', texto: 'Alabanza', orden: 2 },
            { id: 'sub_f3', texto: 'Músicos', orden: 3 }
          ]
        },
        { id: 'mn8', texto: 'Conexión', orden: 9 },
        { id: 'mn9', texto: 'Comunicaciones', orden: 10 },
        { id: 'mn10', texto: 'Protocolo', orden: 11 },
      ]);
    };
    
    loadCuestionario();
  }, []);

  const getSubOpcionFieldName = (textoOpcion: string) => {
    if (textoOpcion === 'Servidores') return 'areaServidores';
    if (textoOpcion === 'Flamas de Fuego') return 'areaFlamasFuego';
    if (textoOpcion === 'Franja Generacional') return 'franjaGeneracional';
    return null;
  };

  const toggleSubOpcionString = (currentVal: string | undefined, targetVal: string) => {
    const arrayValores = currentVal ? currentVal.split(',').map(s => s.trim()).filter(Boolean) : [];
    if (arrayValores.includes(targetVal)) {
      const filtered = arrayValores.filter(val => val !== targetVal);
      return filtered.length > 0 ? filtered.join(', ') : undefined;
    } else {
      return [...arrayValores, targetVal].join(', ');
    }
  };

  const toggleMinisterio = (ministerioText: string) => {
    setNuevoMiembro(prev => {
      const ministerios = prev.ministerios?.includes(ministerioText as Ministerio)
        ? prev.ministerios.filter(m => m !== ministerioText)
        : [...(prev.ministerios || []), ministerioText as Ministerio];
      
      const field = getSubOpcionFieldName(ministerioText);
      const update: any = { ministerios };
      if (field && !ministerios.includes(ministerioText as Ministerio)) {
        update[field] = undefined;
      }
      return { ...prev, ...update };
    });
  };

  const handleNuevoMiembroChange = (field: string, value: any) => {
    setNuevoMiembro(prev => ({ ...prev, [field]: value }));
  };

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('El archivo seleccionado debe ser una imagen');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('La imagen debe pesar menos de 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        handleNuevoMiembroChange('foto', reader.result);
        toast.success('Foto cargada exitosamente');
      }
    };
    reader.onerror = () => {
      toast.error('Error al leer el archivo');
    };
    reader.readAsDataURL(file);
  };

  const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  const frecuencias: { value: FrecuenciaReunion; label: string }[] = [
    { value: 'Semanal', label: 'Semanal' },
    { value: 'Quincenal', label: 'Quincenal' },
    { value: 'Mensual', label: 'Mensual' },
  ];
  const modalidades: { value: ModalidadReunion; label: string }[] = [
    { value: 'Presencial', label: 'Presencial' },
    { value: 'Virtual', label: 'Virtual' },
    { value: 'Mixta', label: 'Mixta' },
  ];
  const ubicaciones: { value: UbicacionReunion; label: string; icon: React.ReactNode }[] = [
    { value: 'Casa', label: 'Casa', icon: <Home className="w-4 h-4" /> },
    { value: 'Iglesia', label: 'Iglesia', icon: <Users className="w-4 h-4" /> },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ 
      ...prev, 
      [name]: value,
      // Autocompletar dirección si selecciona Iglesia
      ...(name === 'ubicacionReunion' && value === 'Iglesia' && {
        direccion: 'Iglesia Bautista Central De Barranquilla Cra 44 Con Calle 47'
      })
    }));
  };

  const agregarMiembro = () => {
    if (nuevoMiembro.nombres && nuevoMiembro.apellidos) {
      const miembro: MiembroGAP = {
        id: `m${Date.now()}`,
        nombres: nuevoMiembro.nombres || '',
        apellidos: nuevoMiembro.apellidos || '',
        tipoDocumento: nuevoMiembro.tipoDocumento || 'CC',
        numeroDocumento: nuevoMiembro.numeroDocumento || '',
        fechaNacimiento: nuevoMiembro.fechaNacimiento || '',
        sexo: nuevoMiembro.sexo || 'Masculino',
        estadoCivil: nuevoMiembro.estadoCivil || 'Soltero',
        telefono: nuevoMiembro.telefono || '',
        numeroWhatsApp: nuevoMiembro.numeroWhatsApp,
        correo: nuevoMiembro.correo,
        direccion: nuevoMiembro.direccion || '',
        barrio: nuevoMiembro.barrio || '',
        departamento: nuevoMiembro.departamento || '',
        profesion: nuevoMiembro.profesion || '',
        esMiembroIBC: nuevoMiembro.esMiembroIBC || false,
        esBautizado: nuevoMiembro.esBautizado || false,
        escuelaFormacion: nuevoMiembro.escuelaFormacion || 'No',
        moduloEFC: nuevoMiembro.moduloEFC,
        ministerios: nuevoMiembro.ministerios || [],
        franjaGeneracional: nuevoMiembro.franjaGeneracional,
        areaServidores: nuevoMiembro.areaServidores,
        areaFlamasFuego: nuevoMiembro.areaFlamasFuego,
        gapId: 'temp',
        fechaRegistro: new Date().toISOString().split('T')[0],
        foto: nuevoMiembro.foto || undefined,
      };
      setMiembros([...miembros, miembro]);
      setNuevoMiembro({
        tipoDocumento: 'CC',
        estadoCivil: 'Soltero',
        sexo: 'Masculino',
        esMiembroIBC: false,
        esBautizado: false,
        escuelaFormacion: 'No',
        ministerios: [],
        foto: '',
      });
      setMostrarFormMiembro(false);
    }
  };

  const eliminarMiembro = (id: string) => {
    setMiembros(miembros.filter(m => m.id !== id));
  };

  const handleAgregarMiembroClick = () => {
    if (!nuevoMiembro.nombres?.trim()) {
      toast.error('El nombre es obligatorio');
      return;
    }
    if (!nuevoMiembro.apellidos?.trim()) {
      toast.error('El apellido es obligatorio');
      return;
    }
    if (!nuevoMiembro.numeroDocumento?.trim()) {
      toast.error('El número de documento es obligatorio');
      return;
    }
    if (!nuevoMiembro.telefono?.trim()) {
      toast.error('El número de teléfono celular es obligatorio');
      return;
    }
    if (!nuevoMiembro.direccion?.trim()) {
      toast.error('La dirección es obligatoria');
      return;
    }
    if (!nuevoMiembro.barrio?.trim()) {
      toast.error('El barrio es obligatorio');
      return;
    }
    if (!nuevoMiembro.departamento?.trim()) {
      toast.error('El departamento es obligatorio');
      return;
    }

    setConfirmModal({
      abierto: true,
      titulo: '⚠️ ¿Confirmar Registro de Integrante?',
      mensaje: `Por favor, confirme que los siguientes datos sean correctos antes de agregar al integrante:\n\n• Nombre: ${nuevoMiembro.nombres} ${nuevoMiembro.apellidos}\n• Dirección: ${nuevoMiembro.direccion}\n• Correo Electrónico: ${nuevoMiembro.correo || 'No especificado'}\n• Documento: ${nuevoMiembro.tipoDocumento} ${nuevoMiembro.numeroDocumento}\n• Fecha de Nacimiento: ${nuevoMiembro.fechaNacimiento || 'No especificada'}\n\n¿Desea agregar este integrante al listado local del GAP?`,
      onConfirmar: () => {
        agregarMiembro();
      }
    });
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    setConfirmModal({
      abierto: true,
      titulo: gapEditar ? '¿Confirmar Modificación de GAP?' : '¿Confirmar Creación de GAP?',
      mensaje: gapEditar
        ? `Esta acción actualizará de forma permanente los detalles de cobertura y asignación de ${formData.codigo} en la base de datos central. ¿Deseas aplicar los cambios?`
        : `Esta acción registrará a un nuevo Grupo de Amigos con Propósito (GAP) bajo el código ${formData.codigo} en la base de datos central. ¿Deseas continuar?`,
      onConfirmar: async () => {
        setGuardandoForm(true);
        
        const lider = usuariosMock.find(u => u.id === formData.liderGapId);
        const timoteo = usuariosMock.find(u => u.id === formData.timoteoId);
        const pastor = usuariosMock.find(u => u.id === formData.pastorId);
        const liderMentor = usuariosMock.find(u => u.id === formData.liderMentorId);

        const gapData = {
          numero: formData.numero,
          codigo: formData.codigo,
          liderGapId: formData.liderGapId,
          liderGapNombre: lider ? `${lider.nombre} ${lider.apellidos}` : '',
          timoteoId: formData.timoteoId,
          timoteoNombre: timoteo ? `${timoteo.nombre} ${timoteo.apellidos}` : '',
          pastorId: formData.pastorId,
          pastorNombre: pastor ? `${pastor.nombre} ${pastor.apellidos}` : '',
          liderMentorId: formData.liderMentorId,
          liderMentorNombre: liderMentor ? `${liderMentor.nombre} ${liderMentor.apellidos}` : '',
          direccion: formData.direccion,
          barrio: formData.barrio,
          departamento: formData.departamento,
          ubicacionReunion: formData.ubicacionReunion,
          miembros: miembros,
          diaReunion: formData.diaReunion,
          horaReunion: formData.horaReunion,
          frecuencia: formData.frecuencia,
          modalidad: formData.modalidad,
          activo: gapEditar ? gapEditar.activo : true,
        };

        let exito = false;
        if (gapEditar) {
          exito = await actualizarGAP(gapEditar.id, gapData);
          if (exito) {
            toast.success('GAP actualizado exitosamente');
          } else {
            toast.error('Error al actualizar el GAP en la base de datos');
            setGuardandoForm(false);
            return;
          }
        } else {
          const resultado = await crearGAP(gapData);
          if (resultado) {
            exito = true;
            toast.success('GAP creado exitosamente');
            
            // Si usamos un número reciclado, removerlo de los disponibles
            if (numerosReciclados.includes(formData.numero)) {
              const nuevosReciclados = numerosReciclados.filter(n => n !== formData.numero);
              localStorage.setItem('numerosGAPsDisponibles', JSON.stringify(nuevosReciclados));
              setNumerosReciclados(nuevosReciclados);
            }
          } else {
            toast.error('Error al guardar el GAP en la base de datos');
            setGuardandoForm(false);
            return;
          }
        }

        await new Promise(resolve => setTimeout(resolve, 800));
        setGuardandoForm(false);
        setGuardado(true);
        setTimeout(() => {
          onExito();
        }, 2000);
      }
    });
  };
  const validarPaso1 = () => {
    return formData.liderGapId && formData.timoteoId;
  };

  const validarPaso2 = () => {
    return formData.direccion && formData.diaReunion && formData.horaReunion && formData.ubicacionReunion;
  };

  // Filtrar líderes GAP disponibles
  const lideresGAP = usuariosMock.filter(u => u.rol === 'lider_gap');
  const timoteos = usuariosMock.filter(u => u.rol === 'timoteo');
  const pastores = usuariosMock.filter(u => u.rol === 'pastor');
  const lideresMentor = usuariosMock.filter(u => u.rol === 'lider_mentor');

  if (guardado) {
    return (
      <div className="p-6 max-w-2xl mx-auto animate-fade-in">
        <Card className="text-center py-12">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ backgroundColor: `${tema.exito}20` }}>
            <CheckCircle className="w-10 h-10" style={{ color: tema.exito }} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {gapEditar ? '¡GAP Actualizado!' : '¡GAP Creado!'}
          </h2>
          <p className="text-gray-600 mb-4">
            El Grupo <strong>{formData.codigo}</strong> Ha Sido {gapEditar ? 'Actualizado' : 'Creado'} Exitosamente.
          </p>
          <div className="bg-blue-50 rounded-lg p-4 mx-6 mb-4">
            <p className="text-sm text-blue-700">
              <strong>Frecuencia:</strong> {formData.frecuencia} | <strong>Modalidad:</strong> {formData.modalidad}
            </p>
          </div>
          <p className="text-sm text-gray-500">
            Total de miembros registrados: {miembros.length}
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto animate-fade-in pb-24 lg:pb-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" onClick={onVolver} className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Volver
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">
          {gapEditar ? 'Editar GAP' : 'Crear GAP'}
        </h1>
      </div>

      {/* Indicador de pasos */}
      <div className="flex items-center justify-center mb-6">
        <div className="flex items-center gap-2">
          {[1, 2, 3].map((p) => (
            <React.Fragment key={p}>
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                style={{ backgroundColor: paso >= p ? tema.primario : '#e5e7eb' }}
              >
                {p}
              </div>
              {p < 3 && (
                <div 
                  className="w-12 h-1 rounded" 
                  style={{ backgroundColor: paso > p ? tema.primario : '#e5e7eb' }} 
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Paso 1: Información del GAP */}
        {paso === 1 && (
          <Card className="animate-slide-up">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" style={{ color: tema.primario }} />
                Información del Grupo GAP
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Código De GAP</Label>
                  {!gapEditar && numerosReciclados.length > 0 && (
                    <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      Números reciclados disponibles
                    </span>
                  )}
                </div>
                
                {gapEditar ? (
                  <Input value={formData.codigo} disabled className="bg-gray-100 font-mono text-lg" />
                ) : numerosReciclados.length > 0 ? (
                  <div className="flex gap-3">
                    <Select
                      value={formData.numero.toString()}
                      onValueChange={(val) => {
                        const num = parseInt(val);
                        setFormData(prev => ({
                          ...prev,
                          numero: num,
                          codigo: `GAP-${num}`
                        }));
                      }}
                    >
                      <SelectTrigger className="font-mono text-lg h-11">
                        <SelectValue placeholder="Selecciona un número..." />
                      </SelectTrigger>
                      <SelectContent>
                        {numerosReciclados.map(num => (
                          <SelectItem key={num} value={num.toString()}>GAP-{num} (Reciclado)</SelectItem>
                        ))}
                        {/* Option for standard new number */}
                        {(() => {
                          const max = getGapsGuardados().reduce((m: number, g: any) => g.numero > m ? g.numero : m, 0);
                          const next = max + 1;
                          if (!numerosReciclados.includes(next)) {
                            return <SelectItem value={next.toString()}>GAP-{next} (Nuevo)</SelectItem>;
                          }
                          return null;
                        })()}
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <Input value={formData.codigo} disabled className="bg-gray-100 font-mono text-lg" />
                )}
                <p className="text-xs text-gray-500">
                  {gapEditar ? "Código actual del GAP" : 
                   numerosReciclados.length > 0 ? "Puedes reusar un número de un GAP eliminado o crear uno nuevo" : 
                   "Código Asignado Automáticamente"}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="liderGapId">Líder GAP *</Label>
                  <Select 
                    value={formData.liderGapId} 
                    onValueChange={(value) => handleSelectChange('liderGapId', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione un líder" />
                    </SelectTrigger>
                    <SelectContent>
                      {lideresGAP.map(l => (
                        <SelectItem key={l.id} value={l.id}>{l.nombre} {l.apellidos}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timoteoId">Timoteo *</Label>
                  <Select 
                    value={formData.timoteoId} 
                    onValueChange={(value) => handleSelectChange('timoteoId', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione un timoteo" />
                    </SelectTrigger>
                    <SelectContent>
                      {timoteos.map(t => (
                        <SelectItem key={t.id} value={t.id}>{t.nombre} {t.apellidos}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {(usuario?.rol === 'pastor_principal' || usuario?.rol === 'administrador') && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="pastorId">Pastor Responsable</Label>
                    <Select 
                      value={formData.pastorId} 
                      onValueChange={(value) => handleSelectChange('pastorId', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione un pastor" />
                      </SelectTrigger>
                      <SelectContent>
                        {pastores.map(p => (
                          <SelectItem key={p.id} value={p.id}>{p.nombre} {p.apellidos}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="liderMentorId">Líder Mentor Responsable</Label>
                    <Select 
                      value={formData.liderMentorId} 
                      onValueChange={(value) => handleSelectChange('liderMentorId', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione un líder mentor" />
                      </SelectTrigger>
                      <SelectContent>
                        {lideresMentor.map(lm => (
                          <SelectItem key={lm.id} value={lm.id}>{lm.nombre} {lm.apellidos}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <Button
                  type="button"
                  onClick={() => setPaso(2)}
                  disabled={!validarPaso1()}
                  className="text-white"
                  style={{ backgroundColor: tema.primario }}
                >
                  Siguiente
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Paso 2: Ubicación, Horario y Modalidad */}
        {paso === 2 && (
          <Card className="animate-slide-up">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" style={{ color: tema.primario }} />
                Ubicación, Horario y Modalidad
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Ubicación de reunión */}
              <div className="space-y-2">
                <Label>Ubicación de la Reunión *</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {ubicaciones.map((ub) => (
                    <button
                      key={ub.value}
                      type="button"
                      onClick={() => handleSelectChange('ubicacionReunion', ub.value)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                        formData.ubicacionReunion === ub.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {ub.icon}
                      <span className="text-sm font-medium">{ub.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="direccion">Dirección de Reunión *</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="direccion"
                    name="direccion"
                    value={formData.direccion}
                    onChange={handleChange}
                    placeholder="Ej: Calle 123 #45-67"
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="barrio">Barrio</Label>
                  <Input
                    id="barrio"
                    name="barrio"
                    value={formData.barrio}
                    onChange={handleChange}
                    placeholder="Ej: El Poblado"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="departamento">Departamento</Label>
                  <Input
                    id="departamento"
                    name="departamento"
                    value={formData.departamento}
                    onChange={handleChange}
                    placeholder="Ej: Antioquia"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="diaReunion">Día de Reunión *</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Select 
                      value={formData.diaReunion} 
                      onValueChange={(value) => handleSelectChange('diaReunion', value)}
                    >
                      <SelectTrigger className="pl-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {diasSemana.map(dia => (
                          <SelectItem key={dia} value={dia}>{dia}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="horaReunion">Hora de Reunión *</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="horaReunion"
                      name="horaReunion"
                      type="time"
                      value={formData.horaReunion}
                      onChange={handleChange}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="frecuencia">Frecuencia *</Label>
                  <div className="relative">
                    <Repeat className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Select 
                      value={formData.frecuencia} 
                      onValueChange={(value) => handleSelectChange('frecuencia', value as FrecuenciaReunion)}
                    >
                      <SelectTrigger className="pl-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {frecuencias.map(f => (
                          <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Modalidad */}
              <div className="space-y-2">
                <Label>Modalidad de Reunión *</Label>
                <div className="grid grid-cols-3 gap-3">
                  {modalidades.map((mod) => (
                    <button
                      key={mod.value}
                      type="button"
                      onClick={() => handleSelectChange('modalidad', mod.value)}
                      className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all ${
                        formData.modalidad === mod.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Video className="w-4 h-4" />
                      <span className="text-sm font-medium">{mod.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={() => setPaso(1)}>
                  Anterior
                </Button>
                <Button
                  type="button"
                  onClick={() => setPaso(3)}
                  disabled={!validarPaso2()}
                  className="text-white"
                  style={{ backgroundColor: tema.primario }}
                >
                  Siguiente
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Paso 3: Miembros */}
        {paso === 3 && (
          <Card className="animate-slide-up">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="w-5 h-5" style={{ color: tema.primario }} />
                Miembros del GAP
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Lista de miembros */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Miembros Registrados ({miembros.length}/10)</Label>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      setNuevoMiembro({
                        tipoDocumento: 'CC',
                        estadoCivil: 'Soltero',
                        sexo: 'Masculino',
                        esMiembroIBC: false,
                        esBautizado: false,
                        escuelaFormacion: 'No',
                        ministerios: [],
                        barrio: formData.barrio,
                        departamento: formData.departamento,
                        foto: '',
                      });
                      setMostrarFormMiembro(true);
                    }}
                    disabled={miembros.length >= 10}
                    className="text-white"
                    style={{ backgroundColor: tema.primario }}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Agregar Miembro
                  </Button>
                </div>

                {miembros.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <Users className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                    <p className="text-gray-500">No hay miembros registrados</p>
                    <p className="text-sm text-gray-400">Máximo 10 miembros por GAP</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
                    {miembros.map((miembro, index) => (
                      <div key={miembro.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                            style={{ backgroundColor: tema.primario }}
                          >
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium">{miembro.nombres} {miembro.apellidos}</p>
                            <p className="text-sm text-gray-500">{miembro.telefono}</p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => eliminarMiembro(miembro.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Formulario para agregar miembro completo */}
              {mostrarFormMiembro && (
                <div className="border border-dashed border-gray-300 dark:border-white/10 rounded-2xl p-4 sm:p-6 bg-slate-50 dark:bg-slate-900/50 space-y-6 animate-fade-in text-left">
                  <div className="flex items-center justify-between border-b pb-3 border-gray-200 dark:border-white/5">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                      <UserPlus className="w-5 h-5" style={{ color: tema.primario }} />
                      Registro de Nuevo Integrante (Ficha Completa)
                    </h3>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setMostrarFormMiembro(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      Cancelar
                    </Button>
                  </div>

                  {/* 1. Información Personal */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-semibold uppercase tracking-wider text-gray-500">
                        1. Información Personal
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex flex-col md:flex-row gap-6 items-center md:items-start pb-4 border-b border-gray-100 dark:border-white/5">
                        {/* Selector de Foto Opcional */}
                        <div className="flex flex-col items-center gap-2">
                          <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Foto del Integrante (Opcional)</Label>
                          <div className="relative group w-28 h-28 rounded-full overflow-hidden border-2 border-dashed border-gray-300 dark:border-white/10 hover:border-sky-500 transition-colors flex items-center justify-center bg-gray-50 dark:bg-black/20">
                            {nuevoMiembro.foto ? (
                              <img src={nuevoMiembro.foto} alt="Vista previa" className="w-full h-full object-cover" />
                            ) : (
                              <div className="flex flex-col items-center justify-center text-gray-400 p-2 text-center">
                                <span className="text-3xl">👤</span>
                                <span className="text-[10px] mt-1">Subir Foto</span>
                              </div>
                            )}
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleFotoChange}
                              className="absolute inset-0 opacity-0 cursor-pointer"
                              title="Seleccionar foto"
                            />
                          </div>
                          {nuevoMiembro.foto && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleNuevoMiembroChange('foto', '')}
                              className="text-red-500 hover:text-red-700 h-7 px-2 text-xs"
                            >
                              Eliminar foto
                            </Button>
                          )}
                          <span className="text-[9px] text-gray-400 text-center max-w-[140px]">Máx. 2MB, formato imagen</span>
                        </div>

                        {/* Nombres y Apellidos */}
                        <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Nombres <span className="text-red-500">*</span></Label>
                            <Input
                              placeholder="Ingresa el nombre"
                              value={nuevoMiembro.nombres || ''}
                              onChange={(e) => handleNuevoMiembroChange('nombres', e.target.value)}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Apellidos <span className="text-red-500">*</span></Label>
                            <Input
                              placeholder="Ingresa el apellido"
                              value={nuevoMiembro.apellidos || ''}
                              onChange={(e) => handleNuevoMiembroChange('apellidos', e.target.value)}
                              required
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Documento de Identidad <span className="text-red-500">*</span></Label>
                          <Select
                            value={nuevoMiembro.tipoDocumento}
                            onValueChange={(value) => handleNuevoMiembroChange('tipoDocumento', value as TipoDocumento)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {tiposDocumento.map((tipo) => (
                                <SelectItem key={tipo.value} value={tipo.value}>{tipo.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Número de Documento <span className="text-red-500">*</span></Label>
                          <Input
                            placeholder="Ingresa el número de documento"
                            value={nuevoMiembro.numeroDocumento || ''}
                            onChange={(e) => handleNuevoMiembroChange('numeroDocumento', e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Correo Electrónico</Label>
                          <Input
                            type="email"
                            placeholder="ejemplo@correo.com"
                            value={nuevoMiembro.correo || ''}
                            onChange={(e) => handleNuevoMiembroChange('correo', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Fecha de Nacimiento</Label>
                          <Input
                            type="date"
                            value={nuevoMiembro.fechaNacimiento || ''}
                            onChange={(e) => handleNuevoMiembroChange('fechaNacimiento', e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Género <span className="text-red-500">*</span></Label>
                          <Select
                            value={nuevoMiembro.sexo}
                            onValueChange={(value) => handleNuevoMiembroChange('sexo', value as Sexo)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {generos.map((genero) => (
                                <SelectItem key={genero.value} value={genero.value}>{genero.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Estado Civil <span className="text-red-500">*</span></Label>
                          <Select
                            value={nuevoMiembro.estadoCivil}
                            onValueChange={(value) => handleNuevoMiembroChange('estadoCivil', value as EstadoCivil)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {estadosCivil.map((estado) => (
                                <SelectItem key={estado.value} value={estado.value}>{estado.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* 2. Información de Contacto */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-semibold uppercase tracking-wider text-gray-500">
                        2. Información de Contacto
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Teléfono Celular <span className="text-red-500">*</span></Label>
                          <Input
                            type="tel"
                            placeholder="300 123 4567"
                            value={nuevoMiembro.telefono || ''}
                            onChange={(e) => handleNuevoMiembroChange('telefono', e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Número con WhatsApp</Label>
                          <Input
                            type="tel"
                            placeholder="300 123 4567"
                            value={nuevoMiembro.numeroWhatsApp || ''}
                            onChange={(e) => handleNuevoMiembroChange('numeroWhatsApp', e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Dirección <span className="text-red-500">*</span></Label>
                        <Input
                          placeholder="Calle 123 #45-67"
                          value={nuevoMiembro.direccion || ''}
                          onChange={(e) => handleNuevoMiembroChange('direccion', e.target.value)}
                          required
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>Barrio <span className="text-red-500">*</span></Label>
                          <Input
                            placeholder="Nombre del barrio"
                            value={nuevoMiembro.barrio || ''}
                            onChange={(e) => handleNuevoMiembroChange('barrio', e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Departamento <span className="text-red-500">*</span></Label>
                          <Input
                            placeholder="Ej: Antioquia"
                            value={nuevoMiembro.departamento || ''}
                            onChange={(e) => handleNuevoMiembroChange('departamento', e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Profesión u Oficio</Label>
                          <Input
                            placeholder="Ej: Ingeniero"
                            value={nuevoMiembro.profesion || ''}
                            onChange={(e) => handleNuevoMiembroChange('profesion', e.target.value)}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* 3. Información Ministerial */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-semibold uppercase tracking-wider text-gray-500">
                        3. Información Ministerial
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex items-center gap-4">
                        <Label className="font-medium">¿Es Miembro de la IBC?</Label>
                        <div className="flex items-center gap-4">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="m-esMiembroIBC"
                              checked={nuevoMiembro.esMiembroIBC === true}
                              onChange={() => handleNuevoMiembroChange('esMiembroIBC', true)}
                              className="w-4 h-4"
                            />
                            <span>Sí</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="m-esMiembroIBC"
                              checked={nuevoMiembro.esMiembroIBC === false}
                              onChange={() => handleNuevoMiembroChange('esMiembroIBC', false)}
                              className="w-4 h-4"
                            />
                            <span>No</span>
                          </label>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <Label className="font-medium">¿Bautizado?</Label>
                        <div className="flex items-center gap-4">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="m-esBautizado"
                              checked={nuevoMiembro.esBautizado === true}
                              onChange={() => handleNuevoMiembroChange('esBautizado', true)}
                              className="w-4 h-4"
                            />
                            <span>Sí</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="m-esBautizado"
                              checked={nuevoMiembro.esBautizado === false}
                              onChange={() => handleNuevoMiembroChange('esBautizado', false)}
                              className="w-4 h-4"
                            />
                            <span>No</span>
                          </label>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>EFC (Escuela de Formación Cristiana)</Label>
                          <Select
                            value={nuevoMiembro.escuelaFormacion}
                            onValueChange={(value) => handleNuevoMiembroChange('escuelaFormacion', value as 'No' | 'Graduado' | 'Cursando')}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="No">NO</SelectItem>
                              <SelectItem value="Graduado">Graduado</SelectItem>
                              <SelectItem value="Cursando">Cursando</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {nuevoMiembro.escuelaFormacion === 'Cursando' && (
                          <div className="space-y-2">
                            <Label>Módulo que está cursando</Label>
                            <Select
                              value={nuevoMiembro.moduloEFC || ''}
                              onValueChange={(value) => handleNuevoMiembroChange('moduloEFC', value as ModuloEFC)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Selecciona el módulo" />
                              </SelectTrigger>
                              <SelectContent>
                                {modulosEFC.map((modulo) => (
                                  <SelectItem key={modulo.value} value={modulo.value}>{modulo.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* 4. Ministerios */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-semibold uppercase tracking-wider text-gray-500">
                        4. Ministerios (Seleccione de cuál forma parte)
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {opcionesMinisterios.map((opcion) => (
                          <div key={opcion.id} className="flex items-start gap-2">
                            <Checkbox
                              id={`m-ministerio-${opcion.texto}`}
                              checked={nuevoMiembro.ministerios?.includes(opcion.texto as Ministerio) || false}
                              onCheckedChange={() => toggleMinisterio(opcion.texto)}
                            />
                            <Label 
                              htmlFor={`m-ministerio-${opcion.texto}`}
                              className="text-sm cursor-pointer leading-tight"
                            >
                              {opcion.texto}
                            </Label>
                          </div>
                        ))}
                      </div>

                      {/* Sub-opciones */}
                      {opcionesMinisterios
                        .filter(opcion => nuevoMiembro.ministerios?.includes(opcion.texto as Ministerio) && opcion.subOpciones && opcion.subOpciones.length > 0)
                        .map(opcion => {
                          const fieldName = getSubOpcionFieldName(opcion.texto);
                          if (!fieldName) return null;
                          const valorActual = (nuevoMiembro as any)[fieldName];
                          
                          return (
                            <div key={`m-sub-panel-${opcion.id}`} className="mt-4 p-4 bg-gray-100 dark:bg-black/25 rounded-lg border border-gray-200/10">
                              <Label className="font-semibold text-xs text-gray-400 uppercase tracking-wider block mb-2">
                                {opcion.texto} - Sub-áreas / opciones:
                              </Label>
                              <div className="flex flex-wrap gap-3 mt-2">
                                {opcion.subOpciones?.map((subOp) => {
                                  const arrayValores = valorActual ? (valorActual as string).split(',').map(s => s.trim()).filter(Boolean) : [];
                                  const isChecked = arrayValores.includes(subOp.texto);
                                  
                                  return (
                                    <label 
                                      key={subOp.id} 
                                      className={`flex items-center gap-2 cursor-pointer px-3 py-1.5 rounded-lg border transition-all duration-200 ${
                                        isChecked
                                          ? 'bg-sky-50 dark:bg-sky-950/20 border-sky-500 text-sky-700 dark:text-sky-300 font-semibold'
                                          : 'bg-white dark:bg-black/10 border-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-50'
                                      }`}
                                    >
                                      <input
                                        type="checkbox"
                                        name={`m-sub-opt-${opcion.id}`}
                                        value={subOp.texto}
                                        checked={isChecked}
                                        onChange={() => {
                                          const newVal = toggleSubOpcionString(valorActual, subOp.texto);
                                          handleNuevoMiembroChange(fieldName, newVal);
                                        }}
                                        className="w-4 h-4 text-sky-600 focus:ring-sky-500 rounded border-gray-300"
                                      />
                                      <span className="text-xs">
                                        {subOp.texto === 'Timothy Kids' ? 'Timothy Kids (5 a 9 años)' :
                                         subOp.texto === 'Nexus' ? 'Nexus (10 a 12 años)' :
                                         subOp.texto === 'Adic' ? 'Adic (13 a 17 años)' :
                                         subOp.texto === 'Keepers' ? 'Keepers (18+)' : subOp.texto}
                                      </span>
                                    </label>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                    </CardContent>
                  </Card>

                  {/* Acciones */}
                  <div className="flex gap-3 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => setMostrarFormMiembro(false)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="button"
                      className="flex-1 text-white bg-green-600 hover:bg-green-500"
                      onClick={handleAgregarMiembroClick}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Agregar al GAP
                    </Button>
                  </div>
                </div>
              )}

              <div className="flex justify-between pt-4">
                <Button type="button" variant="outline" onClick={() => setPaso(2)}>
                  Anterior
                </Button>
                <Button
                  type="submit"
                  disabled={guardandoForm}
                  className="text-white"
                  style={{ backgroundColor: tema.primario }}
                >
                  {guardandoForm ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      {gapEditar ? 'Actualizar GAP' : 'Crear GAP'}
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </form>

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
              <p>Esta acción modificará los registros en la base de datos Supabase en la nube y actualizará los listados locales.</p>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button 
                variant="outline" 
                onClick={() => setConfirmModal(prev => ({ ...prev, abierto: false }))}
                className="border-white/10 text-white hover:bg-white/10"
              >
                Cancelar
              </Button>
              <Button 
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
    </div>
  );
};

export default GestionGAPForm;
