import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, UserPlus, Mail, Users, Shield, CheckCircle, Loader2, Phone, MapPin, BookOpen, AlertCircle } from 'lucide-react';
import type { TipoDocumento, EstadoCivil, Ministerio, RolUsuario, Sexo, ModuloEFC, FranjaGeneracional, AreaServidores, AreaFlamasFuego } from '@/types';
import { ministeriosLista, areaFlamasFuegoLista, usuariosMock, existeDocumento, existeCorreo, existeTelefono } from '@/data/mockData';
import { crearUsuario } from '@/services/dataService';

interface CrearUsuarioFormProps {
  onVolver: () => void;
  onExito: () => void;
}

const CrearUsuarioForm: React.FC<CrearUsuarioFormProps> = ({ onVolver, onExito }) => {
  const { usuario, cargando, tema } = useAuth();
  const [paso, setPaso] = useState(1);
  const [creado, setCreado] = useState(false);
  const [errores, setErrores] = useState<Record<string, string>>({});
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
  
  const [formData, setFormData] = useState({
    // Información de usuario
    correo: '',
    claveTemporal: '123456',
    rol: '' as RolUsuario | '',
    fotoPerfil: '',
    
    // Información personal
    nombres: '',
    apellidos: '',
    tipoDocumento: 'CC' as TipoDocumento,
    numeroDocumento: '',
    fechaNacimiento: '',
    sexo: '' as Sexo | '',
    estadoCivil: 'Soltero' as EstadoCivil,
    telefono: '',
    numeroWhatsApp: '',
    direccion: '',
    barrio: '',
    departamento: '',
    profesion: '',
    
    // Información ministerial
    esMiembroIBC: false,
    esBautizado: false,
    escuelaFormacion: 'No' as 'Graduado' | 'Cursando' | 'No',
    moduloEFC: 'Ninguno' as ModuloEFC,
    ministerios: [] as Ministerio[],
    franjaGeneracional: '' as FranjaGeneracional | '',
    areaServidores: '' as AreaServidores | '',
    areaFlamasFuego: '' as AreaFlamasFuego | '',
    
    // Jerarquía
    pastorId: '',
    liderMentorId: '',
  });

  const rolesDisponibles = () => {
    const roles: { value: RolUsuario; label: string }[] = [];
    
    // ADMINISTRADOR y PASTOR PRINCIPAL pueden crear TODOS los roles
    if (usuario?.rol === 'administrador' || usuario?.rol === 'pastor_principal') {
      roles.push(
        { value: 'pastor_principal', label: '⭐ Pastor Principal' },
        { value: 'pastor', label: 'Pastor' },
        { value: 'administrador', label: 'Administrador' },
        { value: 'lider_mentor', label: 'Líder Mentor' },
        { value: 'lider_gap', label: 'Líder GAP' },
        { value: 'timoteo', label: 'Timoteo' },
        { value: 'facilitador', label: 'Facilitador' }
      );
      return roles;
    }
    
    if (usuario?.rol === 'pastor') {
      roles.push(
        { value: 'lider_mentor', label: 'Líder Mentor' },
        { value: 'lider_gap', label: 'Líder GAP' },
        { value: 'timoteo', label: 'Timoteo' }
      );
    }
    if (usuario?.rol === 'lider_mentor') {
      roles.push(
        { value: 'lider_gap', label: 'Líder GAP' },
        { value: 'timoteo', label: 'Timoteo' }
      );
    }
    if (usuario?.rol === 'lider_gap') {
      roles.push({ value: 'timoteo', label: 'Timoteo' });
    }
    
    return roles;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
    // Limpiar error del campo
    if (errores[name]) {
      setErrores(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errores[name]) {
      setErrores(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrores(prev => ({ ...prev, fotoPerfil: 'Por favor seleccione un archivo de imagen válido' }));
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setErrores(prev => ({ ...prev, fotoPerfil: 'La imagen es muy pesada (máximo 2MB)' }));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setFormData(prev => ({ ...prev, fotoPerfil: reader.result as string }));
      if (errores.fotoPerfil) {
        setErrores(prev => ({ ...prev, fotoPerfil: '' }));
      }
    };
    reader.onerror = () => {
      setErrores(prev => ({ ...prev, fotoPerfil: 'Error al leer el archivo' }));
    };
    reader.readAsDataURL(file);
  };

  const toggleSubOpcionString = (currentVal: string | undefined, targetVal: string) => {
    const arrayValores = currentVal ? currentVal.split(',').map(s => s.trim()).filter(Boolean) : [];
    if (arrayValores.includes(targetVal)) {
      const filtered = arrayValores.filter(val => val !== targetVal);
      return filtered.length > 0 ? filtered.join(', ') : '';
    } else {
      return [...arrayValores, targetVal].join(', ');
    }
  };

  const toggleMinisterio = (ministerio: Ministerio) => {
    setFormData(prev => ({
      ...prev,
      ministerios: prev.ministerios.includes(ministerio)
        ? prev.ministerios.filter(m => m !== ministerio)
        : [...prev.ministerios, ministerio]
    }));
  };

  const mostrarConfirmacion = (data: typeof formData) => {
    setConfirmModal({
      abierto: true,
      titulo: '⚠️ ¿Confirmar Creación de Usuario?',
      mensaje: `Está a punto de registrar al usuario en la base de datos central con el rol de "${rolesDisponibles().find(r => r.value === data.rol)?.label || data.rol}".\n\nPor favor, confirme que los siguientes datos sean correctos antes de guardar:\n\n• Nombre: ${data.nombres} ${data.apellidos}\n• Dirección: ${data.direccion}\n• Correo Electrónico: ${data.correo}\n• Documento: ${data.tipoDocumento} ${data.numeroDocumento}\n• Teléfono: ${data.telefono}\n• Fecha de Nacimiento: ${data.fechaNacimiento}\n\n¿Desea continuar?`,
      onConfirmar: async () => {
        try {
          const resultado = await crearUsuario({
            correo: data.correo,
            nombre: data.nombres,
            apellidos: data.apellidos,
            rol: data.rol as RolUsuario,
            claveTemporal: data.claveTemporal,
            tipoDocumento: data.tipoDocumento,
            numeroDocumento: data.numeroDocumento,
            fechaNacimiento: data.fechaNacimiento,
            sexo: data.sexo as Sexo,
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
            franjaGeneracional: data.franjaGeneracional || undefined,
            areaServidores: data.areaServidores || undefined,
            areaFlamasFuego: data.areaFlamasFuego || undefined,
            pastorId: data.pastorId || undefined,
            liderMentorId: data.liderMentorId || undefined,
            fotoPerfil: data.fotoPerfil || undefined,
          });
          
          if (resultado) {
            setCreado(true);
            setTimeout(() => {
              onExito();
            }, 2000);
          } else {
            setErrores({ general: 'Error al registrar el usuario en la base de datos central.' });
          }
        } catch (error) {
          setErrores({ general: 'Error de red al crear el usuario. Intente nuevamente.' });
        }
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar duplicados antes de crear
    const docExiste = existeDocumento(formData.numeroDocumento);
    const telExiste = existeTelefono(formData.telefono);
    const correoExiste = existeCorreo(formData.correo);

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

    if (correoExiste) {
      setErrores({ correo: 'Este correo electrónico ya está registrado' });
      return;
    }
    
    mostrarConfirmacion(formData);
  };

  const validarPaso1 = () => {
    return formData.correo && formData.rol && formData.nombres && formData.apellidos;
  };

  const validarPaso2 = () => {
    return formData.numeroDocumento && formData.fechaNacimiento && formData.sexo && 
           formData.telefono && formData.direccion;
  };

  if (creado) {
    return (
      <div className="p-6 max-w-2xl mx-auto animate-fade-in">
        <Card className="text-center py-12">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ backgroundColor: `${tema.exito}20` }}>
            <CheckCircle className="w-10 h-10" style={{ color: tema.exito }} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Usuario Creado!</h2>
          <p className="text-gray-600 mb-4">
            El usuario <strong>{formData.nombres} {formData.apellidos}</strong> ha sido creado exitosamente.
          </p>
          <div className="bg-blue-50 rounded-lg p-4 mx-6 mb-6">
            <p className="text-sm text-blue-700">
              <strong>Correo:</strong> {formData.correo}
            </p>
            <p className="text-sm text-blue-700">
              <strong>Contraseña temporal:</strong> {formData.claveTemporal}
            </p>
          </div>
          <p className="text-sm text-gray-500">
            Se ha enviado un correo de notificación con las credenciales de acceso.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto animate-fade-in pb-24 lg:pb-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" onClick={onVolver} className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Volver
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">Crear Usuario</h1>
      </div>

      {/* Indicador de pasos */}
      <div className="flex items-center justify-center mb-6">
        <div className="flex items-center gap-2">
          <div 
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
            style={{ backgroundColor: paso >= 1 ? tema.primario : '#e5e7eb' }}
          >
            1
          </div>
          <div className="w-12 h-1 rounded" style={{ backgroundColor: paso >= 2 ? tema.primario : '#e5e7eb' }} />
          <div 
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
            style={{ backgroundColor: paso >= 2 ? tema.primario : '#e5e7eb' }}
          >
            2
          </div>
          <div className="w-12 h-1 rounded" style={{ backgroundColor: paso >= 3 ? tema.primario : '#e5e7eb' }} />
          <div 
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
            style={{ backgroundColor: paso >= 3 ? tema.primario : '#e5e7eb' }}
          >
            3
          </div>
        </div>
      </div>

      {/* Errores generales */}
      {Object.keys(errores).length > 0 && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className="font-medium text-red-700">Por favor corrija los siguientes errores:</span>
          </div>
          <ul className="list-disc list-inside text-sm text-red-600">
            {Object.values(errores).map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Paso 1: Información de Usuario */}
        {paso === 1 && (
          <Card className="animate-slide-up">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="w-5 h-5" style={{ color: tema.primario }} />
                Información de Usuario
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col md:flex-row gap-6 items-center md:items-start pb-4 border-b border-gray-100 dark:border-white/5">
                {/* Selector de Foto Opcional */}
                <div className="flex flex-col items-center gap-2 shrink-0">
                  <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Foto de Perfil (Opcional)</Label>
                  <div className="relative group w-28 h-28 rounded-full overflow-hidden border-2 border-dashed border-gray-300 dark:border-white/10 hover:border-sky-500 transition-colors flex items-center justify-center bg-gray-50 dark:bg-black/20">
                    {formData.fotoPerfil ? (
                      <img src={formData.fotoPerfil} alt="Vista previa" className="w-full h-full object-cover" />
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
                  {formData.fotoPerfil && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setFormData(prev => ({ ...prev, fotoPerfil: '' }))}
                      className="text-red-500 hover:text-red-700 h-7 px-2 text-xs"
                    >
                      Eliminar foto
                    </Button>
                  )}
                  <span className="text-[9px] text-gray-400 text-center max-w-[140px]">Máx. 2MB, formato imagen</span>
                </div>

                <div className="flex-1 w-full space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="correo">Correo Electrónico *</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          id="correo"
                          name="correo"
                          type="email"
                          value={formData.correo}
                          onChange={handleChange}
                          placeholder="usuario@ibc.org"
                          className={`pl-10 ${errores.correo ? 'border-red-500' : ''}`}
                          required
                        />
                      </div>
                      {errores.correo && <p className="text-xs text-red-500">{errores.correo}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="rol">Rol *</Label>
                      <div className="relative">
                        <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
                        <Select 
                          value={formData.rol} 
                          onValueChange={(value) => handleSelectChange('rol', value)}
                        >
                          <SelectTrigger className="pl-10 w-full">
                            <SelectValue placeholder="Seleccione un rol" />
                          </SelectTrigger>
                          <SelectContent>
                            {rolesDisponibles().map(rol => (
                              <SelectItem key={rol.value} value={rol.value}>{rol.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nombres">Nombres *</Label>
                      <div className="relative">
                        <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          id="nombres"
                          name="nombres"
                          value={formData.nombres}
                          onChange={handleChange}
                          placeholder="Ej: Juan Carlos"
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="apellidos">Apellidos *</Label>
                      <Input
                        id="apellidos"
                        name="apellidos"
                        value={formData.apellidos}
                        onChange={handleChange}
                        placeholder="Ej: Pérez García"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-blue-700">
                  <strong>Contraseña temporal:</strong> Se generará automáticamente "123456" 
                  que el usuario deberá cambiar en su primer acceso.
                </p>
              </div>

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

        {/* Paso 2: Información Personal */}
        {paso === 2 && (
          <Card className="animate-slide-up">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" style={{ color: tema.primario }} />
                Información Personal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tipoDocumento">Tipo de Documento</Label>
                  <Select 
                    value={formData.tipoDocumento} 
                    onValueChange={(value) => handleSelectChange('tipoDocumento', value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CC">Cédula de Ciudadanía (CC)</SelectItem>
                      <SelectItem value="TI">Tarjeta de Identidad (TI)</SelectItem>
                      <SelectItem value="CE">Cédula de Extranjería (CE)</SelectItem>
                      <SelectItem value="Pasaporte">Pasaporte</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="numeroDocumento">Número de Documento *</Label>
                  <Input
                    id="numeroDocumento"
                    name="numeroDocumento"
                    value={formData.numeroDocumento}
                    onChange={handleChange}
                    placeholder="Ej: 1234567890"
                    className={errores.numeroDocumento ? 'border-red-500' : ''}
                    required
                  />
                  {errores.numeroDocumento && <p className="text-xs text-red-500">{errores.numeroDocumento}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fechaNacimiento">Fecha de Nacimiento *</Label>
                  <Input
                    id="fechaNacimiento"
                    name="fechaNacimiento"
                    type="date"
                    value={formData.fechaNacimiento}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sexo">Género *</Label>
                  <Select 
                    value={formData.sexo} 
                    onValueChange={(value) => handleSelectChange('sexo', value as Sexo)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seleccione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Masculino">Masculino</SelectItem>
                      <SelectItem value="Femenino">Femenino</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="estadoCivil">Estado Civil</Label>
                  <Select 
                    value={formData.estadoCivil} 
                    onValueChange={(value) => handleSelectChange('estadoCivil', value as EstadoCivil)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Soltero">Soltero(a)</SelectItem>
                      <SelectItem value="Casado">Casado(a)</SelectItem>
                      <SelectItem value="Union Libre">Unión Libre</SelectItem>
                      <SelectItem value="Viudo">Viudo(a)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefono">Teléfono Celular *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="telefono"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleChange}
                      placeholder="Ej: 3001234567"
                      className={`pl-10 ${errores.telefono ? 'border-red-500' : ''}`}
                      required
                    />
                  </div>
                  {errores.telefono && <p className="text-xs text-red-500">{errores.telefono}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="numeroWhatsApp">Número De Teléfono Con WhatsApp</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="numeroWhatsApp"
                    name="numeroWhatsApp"
                    value={formData.numeroWhatsApp}
                    onChange={handleChange}
                    placeholder="Ej: +573001234567 (Formato Internacional)"
                    className="pl-10"
                  />
                </div>
                <p className="text-xs text-gray-500">Campo Opcional. Debe Aceptar Formato De Número Internacional.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="direccion">Dirección *</Label>
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

              <div className="space-y-2">
                <Label htmlFor="profesion">Profesión u Oficio</Label>
                <Input
                  id="profesion"
                  name="profesion"
                  value={formData.profesion}
                  onChange={handleChange}
                  placeholder="Ej: Ingeniero"
                />
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

        {/* Paso 3: Información Ministerial */}
        {paso === 3 && (
          <Card className="animate-slide-up">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" style={{ color: tema.primario }} />
                Información Ministerial
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>¿Es Miembro de la IBC?</Label>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="esMiembroIBC"
                        checked={formData.esMiembroIBC === true}
                        onChange={() => setFormData(prev => ({ ...prev, esMiembroIBC: true }))}
                        className="w-4 h-4"
                      />
                      <span>Sí</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="esMiembroIBC"
                        checked={formData.esMiembroIBC === false}
                        onChange={() => setFormData(prev => ({ ...prev, esMiembroIBC: false }))}
                        className="w-4 h-4"
                      />
                      <span>No</span>
                    </label>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>¿Bautizado?</Label>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="esBautizado"
                        checked={formData.esBautizado === true}
                        onChange={() => setFormData(prev => ({ ...prev, esBautizado: true }))}
                        className="w-4 h-4"
                      />
                      <span>Sí</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="esBautizado"
                        checked={formData.esBautizado === false}
                        onChange={() => setFormData(prev => ({ ...prev, esBautizado: false }))}
                        className="w-4 h-4"
                      />
                      <span>No</span>
                    </label>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="escuelaFormacion">EFC (Escuela de Formación Cristiana)</Label>
                  <Select 
                    value={formData.escuelaFormacion} 
                    onValueChange={(value) => handleSelectChange('escuelaFormacion', value)}
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
              </div>

              {/* Módulo EFC (solo si está cursando - obligatorio) */}
              {formData.escuelaFormacion === 'Cursando' && (
                <div className="space-y-2">
                  <Label htmlFor="moduloEFC">Módulo EFC *</Label>
                  <Select 
                    value={formData.moduloEFC} 
                    onValueChange={(value) => handleSelectChange('moduloEFC', value as ModuloEFC)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seleccione El Módulo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Discipulado">Discipulado</SelectItem>
                      <SelectItem value="Panorama Bíblico">Panorama Bíblico</SelectItem>
                      <SelectItem value="Fundamentos de Fe">Fundamentos De Fe</SelectItem>
                      <SelectItem value="Guerra Espiritual">Guerra Espiritual</SelectItem>
                      <SelectItem value="Liderazgo Estratégico">Liderazgo Estratégico</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label>Ministerios (Seleccione el ministerio del cual forma parte)</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-64 overflow-y-auto custom-scrollbar p-2 border rounded-lg">
                  {ministeriosLista.map((ministerio) => (
                    <div key={ministerio} className="flex items-start space-x-2">
                      <Checkbox
                        id={`min-${ministerio}`}
                        checked={formData.ministerios.includes(ministerio)}
                        onCheckedChange={() => toggleMinisterio(ministerio)}
                      />
                      <Label htmlFor={`min-${ministerio}`} className="font-normal text-sm leading-tight cursor-pointer">
                        {ministerio}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Franja Generacional (si selecciona el ministerio de Franja Generacional) */}
              {formData.ministerios.includes('Franja Generacional') && (
                <div className="space-y-2">
                  <Label htmlFor="franjaGeneracional">Franja Generacional - Seleccione las sub-áreas / opciones:</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {[
                      { value: 'Timothy Kids', label: 'Timothy Kids (5 a 9 años)' },
                      { value: 'Nexus', label: 'Nexus (10 a 12 años)' },
                      { value: 'Adic', label: 'Adic (13 a 17 años)' },
                      { value: 'Keepers', label: 'Keepers (18+)' },
                    ].map((franja) => {
                      const arrayValores = formData.franjaGeneracional ? formData.franjaGeneracional.split(',').map(s => s.trim()).filter(Boolean) : [];
                      const isChecked = arrayValores.includes(franja.value);
                      return (
                        <label key={franja.value} className={`flex items-center gap-2 cursor-pointer p-2 rounded-lg transition-colors ${isChecked ? 'bg-sky-50 dark:bg-sky-950/20 text-sky-700 dark:text-sky-300 font-semibold' : 'bg-gray-50 hover:bg-gray-100'}`}>
                          <input
                            type="checkbox"
                            name="franjaGeneracional"
                            value={franja.value}
                            checked={isChecked}
                            onChange={() => {
                              const newVal = toggleSubOpcionString(formData.franjaGeneracional || undefined, franja.value);
                              handleSelectChange('franjaGeneracional', newVal);
                            }}
                            className="w-4 h-4 text-sky-600 focus:ring-sky-500 rounded border-gray-300"
                          />
                          <span className="text-sm">{franja.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Área de Servidores */}
              {formData.ministerios.includes('Servidores') && (
                <div className="space-y-2">
                  <Label>Área de Servidores - Seleccione las sub-áreas / opciones:</Label>
                  <div className="flex gap-4">
                    {['Staff', 'CAS'].map((area) => {
                      const arrayValores = formData.areaServidores ? formData.areaServidores.split(',').map(s => s.trim()).filter(Boolean) : [];
                      const isChecked = arrayValores.includes(area);
                      return (
                        <label key={area} className={`flex items-center gap-2 cursor-pointer p-2 rounded-lg transition-colors ${isChecked ? 'bg-sky-50 dark:bg-sky-950/20 text-sky-700 dark:text-sky-300 font-semibold' : 'bg-gray-50 hover:bg-gray-100'}`}>
                          <input
                            type="checkbox"
                            name="areaServidores"
                            value={area}
                            checked={isChecked}
                            onChange={() => {
                              const newVal = toggleSubOpcionString(formData.areaServidores || undefined, area);
                              handleSelectChange('areaServidores', newVal);
                            }}
                            className="w-4 h-4 text-sky-600 focus:ring-sky-500 rounded border-gray-300"
                          />
                          <span className="text-sm">{area}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Área de Flamas de Fuego */}
              {formData.ministerios.includes('Flamas de Fuego') && (
                <div className="space-y-2">
                  <Label>Área de Flamas de Fuego - Seleccione las sub-áreas / opciones:</Label>
                  <div className="flex gap-4">
                    {areaFlamasFuegoLista.map((area) => {
                      const arrayValores = formData.areaFlamasFuego ? formData.areaFlamasFuego.split(',').map(s => s.trim()).filter(Boolean) : [];
                      const isChecked = arrayValores.includes(area);
                      return (
                        <label key={area} className={`flex items-center gap-2 cursor-pointer p-2 rounded-lg transition-colors ${isChecked ? 'bg-sky-50 dark:bg-sky-950/20 text-sky-700 dark:text-sky-300 font-semibold' : 'bg-gray-50 hover:bg-gray-100'}`}>
                          <input
                            type="checkbox"
                            name="areaFlamasFuego"
                            value={area}
                            checked={isChecked}
                            onChange={() => {
                              const newVal = toggleSubOpcionString(formData.areaFlamasFuego || undefined, area);
                              handleSelectChange('areaFlamasFuego', newVal);
                            }}
                            className="w-4 h-4 text-sky-600 focus:ring-sky-500 rounded border-gray-300"
                          />
                          <span className="text-sm">{area}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Jerarquía - mostrar según el rol seleccionado */}
              {(formData.rol === 'lider_gap' || formData.rol === 'timoteo' || formData.rol === 'facilitador') && (
                <div className="space-y-4 pt-4 border-t">
                  <h4 className="font-medium text-gray-700">Asignación De Custodio</h4>
                  
                  <div className="space-y-2">
                    <Label htmlFor="pastorId">Pastor Responsable</Label>
                    <Select 
                      value={formData.pastorId} 
                      onValueChange={(value) => handleSelectChange('pastorId', value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Seleccione Un Pastor" />
                      </SelectTrigger>
                      <SelectContent>
                        {usuariosMock.filter(u => u.rol === 'pastor' || u.rol === 'pastor_principal').map(p => (
                          <SelectItem key={p.id} value={p.id}>{p.nombre} {p.apellidos}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {(formData.rol === 'lider_gap' || formData.rol === 'timoteo') && (
                    <div className="space-y-2">
                      <Label htmlFor="liderMentorId">Líder Mentor Responsable</Label>
                      <Select 
                        value={formData.liderMentorId} 
                        onValueChange={(value) => handleSelectChange('liderMentorId', value)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Seleccione Un Líder Mentor" />
                        </SelectTrigger>
                        <SelectContent>
                          {usuariosMock.filter(u => u.rol === 'lider_mentor').map(lm => (
                            <SelectItem key={lm.id} value={lm.id}>{lm.nombre} {lm.apellidos}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-between pt-4">
                <Button type="button" variant="outline" onClick={() => setPaso(2)}>
                  Anterior
                </Button>
                <Button
                  type="submit"
                  disabled={cargando}
                  className="text-white"
                  style={{ backgroundColor: tema.primario }}
                >
                  {cargando ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creando...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Crear Usuario
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
              <p>Esta acción creará un nuevo registro en la base de datos Supabase en la nube y actualizará los listados locales.</p>
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
                Confirmar Registro
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
                  const docExiste = existeDocumento(modalDocVal);
                  const telExiste = existeTelefono(modalTelVal);

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

export default CrearUsuarioForm;
