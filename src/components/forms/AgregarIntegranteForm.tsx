import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, UserPlus, CheckCircle, BookOpen, Church, Users } from 'lucide-react';
import { toast } from 'sonner';
import { getGAPByLider, existeDocumento, existeTelefono } from '@/data/mockData';
import { getCuestionarioById, crearMiembro, actualizarMiembro } from '@/services/dataService';
import type { TipoDocumento, Sexo, EstadoCivil, Ministerio, ModuloEFC, FranjaGeneracional, AreaServidores, AreaFlamasFuego, OpcionRespuesta } from '@/types';

interface AgregarIntegranteFormProps {
  onVolver: () => void;
  onExito?: () => void;
  miembroEditar?: any;
}

const AgregarIntegranteForm: React.FC<AgregarIntegranteFormProps> = ({ onVolver, onExito, miembroEditar }) => {
  const { usuario, tema } = useAuth();
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
  const esSoloLecturaDatosBasicos = !!miembroEditar && usuario?.rol !== 'administrador' && usuario?.rol !== 'pastor_principal';
  
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
  
  const miGAP = usuario ? getGAPByLider(usuario.id) : null;
  
  const [formData, setFormData] = useState({
    // Información Personal
    nombres: miembroEditar?.nombres || '',
    apellidos: miembroEditar?.apellidos || '',
    tipoDocumento: (miembroEditar?.tipoDocumento as TipoDocumento) || 'CC',
    numeroDocumento: miembroEditar?.numeroDocumento || '',
    correo: miembroEditar?.correo || '',
    fechaNacimiento: miembroEditar?.fechaNacimiento || '',
    sexo: (miembroEditar?.sexo as Sexo) || 'Masculino',
    estadoCivil: (miembroEditar?.estadoCivil as EstadoCivil) || 'Soltero',
    foto: miembroEditar?.foto || '',
    
    // Información de Contacto
    telefono: miembroEditar?.telefono || '',
    numeroWhatsApp: miembroEditar?.numeroWhatsApp || '',
    direccion: miembroEditar?.direccion || '',
    barrio: miembroEditar?.barrio || miGAP?.barrio || '',
    departamento: miembroEditar?.departamento || miGAP?.departamento || '',
    profesion: miembroEditar?.profesion || '',
    
    // Información Ministerial
    esMiembroIBC: miembroEditar?.esMiembroIBC || false,
    esBautizado: miembroEditar?.esBautizado || false,
    escuelaFormacion: (miembroEditar?.escuelaFormacion as 'No' | 'Graduado' | 'Cursando') || 'No',
    moduloEFC: miembroEditar?.moduloEFC as ModuloEFC | undefined,
    ministerios: (miembroEditar?.ministerios as Ministerio[]) || [] as Ministerio[],
    franjaGeneracional: miembroEditar?.franjaGeneracional as FranjaGeneracional | undefined,
    areaServidores: miembroEditar?.areaServidores as AreaServidores | undefined,
    areaFlamasFuego: miembroEditar?.areaFlamasFuego as AreaFlamasFuego | undefined,
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
      const cuestionario = await getCuestionarioById('cuest4');
      if (cuestionario) {
        const qPin19 = cuestionario.preguntas.find(p => p.id === 'pin19' || p.titulo.toLowerCase().includes('ministerio'));
        if (qPin19 && qPin19.opciones.length > 0) {
          const sorted = [...qPin19.opciones].sort((a, b) => a.orden - b.orden);
          setOpcionesMinisterios(sorted);
          return;
        }
      }
      
      // Fallback
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

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
        handleChange('foto', reader.result);
        toast.success('Foto cargada exitosamente');
      }
    };
    reader.onerror = () => {
      toast.error('Error al leer el archivo');
    };
    reader.readAsDataURL(file);
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
    setFormData(prev => {
      const ministerios = prev.ministerios.includes(ministerioText as Ministerio)
        ? prev.ministerios.filter(m => m !== ministerioText)
        : [...prev.ministerios, ministerioText as Ministerio];
      
      const field = getSubOpcionFieldName(ministerioText);
      const update: any = { ministerios };
      if (field && !ministerios.includes(ministerioText as Ministerio)) {
        update[field] = undefined;
      }
      return { ...prev, ...update };
    });
  };

  const mostrarConfirmacion = (data: typeof formData) => {
    setConfirmModal({
      abierto: true,
      titulo: miembroEditar ? '¿Confirmar Edición de Integrante?' : '¿Confirmar Registro de Integrante?',
      mensaje: `Por favor, confirme que los siguientes datos sean correctos antes de guardar:\n\n• Nombre: ${data.nombres} ${data.apellidos}\n• Dirección: ${data.direccion}\n• Correo Electrónico: ${data.correo || 'No especificado'}\n• Documento: ${data.tipoDocumento} ${data.numeroDocumento}\n• Teléfono: ${data.telefono}\n• Fecha de Nacimiento: ${data.fechaNacimiento || 'No especificada'}\n\n¿Desea guardar esta información en la base de datos central?`,
      onConfirmar: async () => {
        setGuardando(true);
        await new Promise(resolve => setTimeout(resolve, 800));
        
        if (miembroEditar) {
          const exito = await actualizarMiembro(miembroEditar.id, {
            nombres: data.nombres,
            apellidos: data.apellidos,
            tipoDocumento: data.tipoDocumento,
            numeroDocumento: data.numeroDocumento,
            correo: data.correo || undefined,
            fechaNacimiento: data.fechaNacimiento || undefined,
            sexo: data.sexo,
            estadoCivil: data.estadoCivil,
            telefono: data.telefono,
            numeroWhatsApp: data.numeroWhatsApp || undefined,
            direccion: data.direccion,
            barrio: data.barrio,
            departamento: data.departamento,
            profesion: data.profesion,
            esMiembroIBC: data.esMiembroIBC,
            esBautizado: data.esBautizado,
            escuelaFormacion: data.escuelaFormacion,
            moduloEFC: data.moduloEFC,
            ministerios: data.ministerios,
            franjaGeneracional: data.franjaGeneracional,
            areaServidores: data.areaServidores,
            areaFlamasFuego: data.areaFlamasFuego,
            foto: data.foto || undefined,
          });
          if (exito) {
            toast.success('Integrante actualizado exitosamente');
          } else {
            toast.error('Error al actualizar el integrante en la base de datos');
            setGuardando(false);
            return;
          }
        } else {
          const resultado = await crearMiembro({
            nombres: data.nombres,
            apellidos: data.apellidos,
            tipoDocumento: data.tipoDocumento,
            numeroDocumento: data.numeroDocumento,
            correo: data.correo || undefined,
            fechaNacimiento: data.fechaNacimiento || new Date().toISOString().split('T')[0],
            sexo: data.sexo,
            estadoCivil: data.estadoCivil,
            telefono: data.telefono,
            numeroWhatsApp: data.numeroWhatsApp || undefined,
            direccion: data.direccion,
            barrio: data.barrio,
            departamento: data.departamento,
            profesion: data.profesion,
            esMiembroIBC: data.esMiembroIBC,
            esBautizado: data.esBautizado,
            escuelaFormacion: data.escuelaFormacion,
            moduloEFC: data.moduloEFC,
            ministerios: data.ministerios,
            franjaGeneracional: data.franjaGeneracional,
            areaServidores: data.areaServidores,
            areaFlamasFuego: data.areaFlamasFuego,
            gapId: miGAP!.id,
            foto: data.foto || undefined,
          });
          if (resultado) {
            toast.success('Integrante agregado exitosamente');
          } else {
            toast.error('Error al guardar el integrante en la base de datos');
            setGuardando(false);
            return;
          }
        }
        
        setGuardando(false);
        if (onExito) {
          onExito();
        } else {
          onVolver();
        }
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!miGAP && !miembroEditar) {
      toast.error('No tienes un GAP asignado');
      return;
    }
    
    // Validaciones
    if (!formData.nombres.trim()) {
      toast.error('El nombre es obligatorio');
      return;
    }
    if (!formData.apellidos.trim()) {
      toast.error('El apellido es obligatorio');
      return;
    }
    if (!formData.numeroDocumento.trim()) {
      toast.error('El número de documento es obligatorio');
      return;
    }
    if (!formData.telefono.trim()) {
      toast.error('El número de teléfono celular es obligatorio');
      return;
    }
    if (!formData.direccion.trim()) {
      toast.error('La dirección es obligatoria');
      return;
    }
    if (!formData.barrio.trim()) {
      toast.error('El barrio es obligatorio');
      return;
    }
    if (!formData.departamento.trim()) {
      toast.error('El departamento es obligatorio');
      return;
    }

    // Comprobar duplicados
    const docExiste = existeDocumento(formData.numeroDocumento, miembroEditar?.id);
    const telExiste = existeTelefono(formData.telefono, miembroEditar?.id);

    if (docExiste || telExiste) {
      setModalDocVal(formData.numeroDocumento);
      setModalTelVal(formData.telefono);
      setModalError('');
      setDuplicateModal({
        abierto: true,
        docDuplicado: docExiste,
        telDuplicado: telExiste,
        numeroDocumento: formData.numeroDocumento,
        telefono: formData.telefono,
      });
      return;
    }
    
    mostrarConfirmacion(formData);
  };

  const mostrarModuloEFC = formData.escuelaFormacion === 'Cursando';

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto animate-fade-in pb-24 lg:pb-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" onClick={onVolver} className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Volver
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">{miembroEditar ? 'Editar Integrante' : 'Agregar Nuevo Integrante'}</h1>
      </div>
      
      {!miGAP && (
        <Card className="border-orange-200 bg-orange-50 mb-6">
          <CardContent className="p-4">
            <p className="text-orange-700">
              No tienes un GAP asignado. Contacta a tu líder mentor para que te asigne un GAP.
            </p>
          </CardContent>
        </Card>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información Personal */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <UserPlus className="w-5 h-5" style={{ color: tema.primario }} />
              Información Personal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col md:flex-row gap-6 items-center md:items-start pb-4 border-b border-gray-100 dark:border-white/5">
              {/* Selector de Foto Opcional */}
              <div className="flex flex-col items-center gap-2">
                <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Foto del Integrante (Opcional)</Label>
                <div className="relative group w-28 h-28 rounded-full overflow-hidden border-2 border-dashed border-gray-300 dark:border-white/10 hover:border-sky-500 transition-colors flex items-center justify-center bg-gray-50 dark:bg-black/20">
                  {formData.foto ? (
                    <img src={formData.foto} alt="Vista previa" className="w-full h-full object-cover" />
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
                {formData.foto && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleChange('foto', '')}
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
                  <Label htmlFor="nombres">Nombre <span className="text-red-500">*</span></Label>
                  <Input
                    id="nombres"
                    value={formData.nombres}
                    onChange={(e) => handleChange('nombres', e.target.value)}
                    placeholder="Ingresa el nombre"
                    required
                    disabled={esSoloLecturaDatosBasicos}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apellidos">Apellido <span className="text-red-500">*</span></Label>
                  <Input
                    id="apellidos"
                    value={formData.apellidos}
                    onChange={(e) => handleChange('apellidos', e.target.value)}
                    placeholder="Ingresa el apellido"
                    required
                    disabled={esSoloLecturaDatosBasicos}
                  />
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tipoDocumento">Documento de Identidad <span className="text-red-500">*</span></Label>
                <Select
                  value={formData.tipoDocumento}
                  onValueChange={(value) => handleChange('tipoDocumento', value as TipoDocumento)}
                  disabled={esSoloLecturaDatosBasicos}
                >
                  <SelectTrigger className="w-full">
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
                <Label htmlFor="numeroDocumento">Número de Documento <span className="text-red-500">*</span></Label>
                <Input
                  id="numeroDocumento"
                  value={formData.numeroDocumento}
                  onChange={(e) => handleChange('numeroDocumento', e.target.value)}
                  placeholder="Ingresa el número de documento"
                  required
                  disabled={esSoloLecturaDatosBasicos}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="correo">Correo Electrónico</Label>
                <Input
                  id="correo"
                  type="email"
                  value={formData.correo}
                  onChange={(e) => handleChange('correo', e.target.value)}
                  placeholder="ejemplo@correo.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fechaNacimiento">Fecha de Nacimiento</Label>
                <Input
                  id="fechaNacimiento"
                  type="date"
                  value={formData.fechaNacimiento}
                  onChange={(e) => handleChange('fechaNacimiento', e.target.value)}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sexo">Género <span className="text-red-500">*</span></Label>
                <Select
                  value={formData.sexo}
                  onValueChange={(value) => handleChange('sexo', value as Sexo)}
                >
                  <SelectTrigger className="w-full">
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
                <Label htmlFor="estadoCivil">Estado Civil <span className="text-red-500">*</span></Label>
                <Select
                  value={formData.estadoCivil}
                  onValueChange={(value) => handleChange('estadoCivil', value as EstadoCivil)}
                >
                  <SelectTrigger className="w-full">
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
        
        {/* Información de Contacto */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="w-5 h-5" style={{ color: tema.primario }} />
              Información de Contacto
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="telefono">Número de Teléfono Celular <span className="text-red-500">*</span></Label>
                <Input
                  id="telefono"
                  type="tel"
                  value={formData.telefono}
                  onChange={(e) => handleChange('telefono', e.target.value)}
                  placeholder="300 123 4567"
                  required
                  disabled={esSoloLecturaDatosBasicos}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="numeroWhatsApp">Número de Teléfono con WhatsApp</Label>
                <Input
                  id="numeroWhatsApp"
                  type="tel"
                  value={formData.numeroWhatsApp}
                  onChange={(e) => handleChange('numeroWhatsApp', e.target.value)}
                  placeholder="300 123 4567"
                  disabled={esSoloLecturaDatosBasicos}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="direccion">Dirección <span className="text-red-500">*</span></Label>
              <Input
                id="direccion"
                value={formData.direccion}
                onChange={(e) => handleChange('direccion', e.target.value)}
                placeholder="Calle 123 # 45-67, Apartamento 101"
                required
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="barrio">Barrio <span className="text-red-500">*</span></Label>
                <Input
                  id="barrio"
                  value={formData.barrio}
                  onChange={(e) => handleChange('barrio', e.target.value)}
                  placeholder="Nombre del barrio"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="departamento">Departamento <span className="text-red-500">*</span></Label>
                <Input
                  id="departamento"
                  value={formData.departamento}
                  onChange={(e) => handleChange('departamento', e.target.value)}
                  placeholder="Ej: Antioquia"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="profesion">Profesión u Oficio</Label>
                <Input
                  id="profesion"
                  value={formData.profesion}
                  onChange={(e) => handleChange('profesion', e.target.value)}
                  placeholder="Ej: Ingeniero, Doctor, Estudiante"
                />
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Información Ministerial */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Church className="w-5 h-5" style={{ color: tema.primario }} />
              Información Ministerial
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Es Miembro IBC */}
            <div className="flex items-center gap-4">
              <Label className="font-medium">¿Es Miembro de la IBC?</Label>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="esMiembroIBC"
                    checked={formData.esMiembroIBC === true}
                    onChange={() => handleChange('esMiembroIBC', true)}
                    className="w-4 h-4"
                  />
                  <span>Sí</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="esMiembroIBC"
                    checked={formData.esMiembroIBC === false}
                    onChange={() => handleChange('esMiembroIBC', false)}
                    className="w-4 h-4"
                  />
                  <span>No</span>
                </label>
              </div>
            </div>
            
            {/* Es Bautizado */}
            <div className="flex items-center gap-4">
              <Label className="font-medium">¿Bautizado?</Label>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="esBautizado"
                    checked={formData.esBautizado === true}
                    onChange={() => handleChange('esBautizado', true)}
                    className="w-4 h-4"
                  />
                  <span>Sí</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="esBautizado"
                    checked={formData.esBautizado === false}
                    onChange={() => handleChange('esBautizado', false)}
                    className="w-4 h-4"
                  />
                  <span>No</span>
                </label>
              </div>
            </div>
            
            {/* EFC */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>EFC (Escuela de Formación Cristiana)</Label>
                <Select
                  value={formData.escuelaFormacion}
                  onValueChange={(value) => handleChange('escuelaFormacion', value as 'No' | 'Graduado' | 'Cursando')}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="No">NO</SelectItem>
                    <SelectItem value="Graduado">Graduado</SelectItem>
                    <SelectItem value="Cursando">Cursando</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Módulo EFC (solo si está cursando) */}
              {mostrarModuloEFC && (
                <div className="space-y-2">
                  <Label>Módulo que está cursando</Label>
                  <Select
                    value={formData.moduloEFC || ''}
                    onValueChange={(value) => handleChange('moduloEFC', value as ModuloEFC)}
                  >
                    <SelectTrigger className="w-full">
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
        
        {/* Ministerios */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BookOpen className="w-5 h-5" style={{ color: tema.primario }} />
              Ministerios (Seleccione el ministerio del cual forma parte)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {opcionesMinisterios.map((opcion) => (
                <div key={opcion.id} className="flex items-start gap-2">
                  <Checkbox
                    id={`ministerio-${opcion.texto}`}
                    checked={formData.ministerios.includes(opcion.texto as Ministerio)}
                    onCheckedChange={() => toggleMinisterio(opcion.texto)}
                  />
                  <Label 
                    htmlFor={`ministerio-${opcion.texto}`}
                    className="text-sm cursor-pointer leading-tight"
                  >
                    {opcion.texto}
                  </Label>
                </div>
              ))}
            </div>
            
            {/* Opciones de Ministerios con Sub-opciones */}
            {opcionesMinisterios
              .filter(opcion => formData.ministerios.includes(opcion.texto as Ministerio) && opcion.subOpciones && opcion.subOpciones.length > 0)
              .map(opcion => {
                const fieldName = getSubOpcionFieldName(opcion.texto);
                if (!fieldName) return null;
                const valorActual = (formData as any)[fieldName];
                
                return (
                  <div key={`sub-panel-${opcion.id}`} className="mt-4 p-4 bg-gray-50 dark:bg-black/25 rounded-lg border border-gray-100/10 animate-fade-in">
                    <Label className="font-semibold text-xs text-gray-400 uppercase tracking-wider block mb-2">
                      {opcion.texto} - Seleccione las sub-áreas / opciones:
                    </Label>
                    <div className="flex flex-wrap gap-4 mt-2">
                      {opcion.subOpciones?.map((subOp) => {
                        const arrayValores = valorActual ? (valorActual as string).split(',').map(s => s.trim()).filter(Boolean) : [];
                        const isChecked = arrayValores.includes(subOp.texto);
                        
                        return (
                          <label 
                            key={subOp.id} 
                            className={`flex items-center gap-2 cursor-pointer px-4 py-2 rounded-xl border transition-all duration-200 ${
                              isChecked
                                ? 'bg-sky-50 dark:bg-sky-950/20 border-sky-500 text-sky-700 dark:text-sky-300 font-semibold shadow-sm'
                                : 'bg-white dark:bg-black/10 border-white/10 text-gray-600 dark:text-gray-400 hover:bg-gray-50 hover:border-gray-300 dark:hover:bg-white/5'
                            }`}
                          >
                            <input
                              type="checkbox"
                              name={`sub-opt-${opcion.id}`}
                              value={subOp.texto}
                              checked={isChecked}
                              onChange={() => {
                                const newVal = toggleSubOpcionString(valorActual, subOp.texto);
                                handleChange(fieldName, newVal);
                              }}
                              className="w-4 h-4 text-sky-600 focus:ring-sky-500 rounded border-gray-300"
                            />
                            <span className="text-sm">
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
        
        {/* Información del GAP */}
        {miGAP && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">GAP Asignado</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="font-semibold">{miGAP.codigo} - {miGAP.barrio}</p>
                <p className="text-sm text-gray-500">{miGAP.departamento}</p>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onVolver}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            className="flex-1 text-white"
            style={{ backgroundColor: tema.primario }}
            disabled={guardando || (!miGAP && !miembroEditar)}
          >
            {guardando ? (
              'Guardando...'
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                {miembroEditar ? 'Guardar Cambios' : 'Agregar Integrante'}
              </>
            )}
          </Button>
        </div>
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
      {duplicateModal.abierto && (
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
                  const docExiste = existeDocumento(modalDocVal, miembroEditar?.id);
                  const telExiste = existeTelefono(modalTelVal, miembroEditar?.id);

                  if (docExiste || telExiste) {
                    setModalError('Los datos ingresados aún están duplicados en el sistema.');
                    setDuplicateModal(prev => ({
                      ...prev,
                      docDuplicado: docExiste,
                      telDuplicado: telExiste,
                    }));
                    return;
                  }

                  setFormData(prev => ({
                    ...prev,
                    numeroDocumento: modalDocVal,
                    telefono: modalTelVal
                  }));
                  
                  setDuplicateModal(prev => ({ ...prev, abierto: false }));

                  mostrarConfirmacion({
                    ...formData,
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

export default AgregarIntegranteForm;
