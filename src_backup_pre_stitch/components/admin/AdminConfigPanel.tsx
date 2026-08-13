import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  ArrowLeft, 
  Settings, 
  Image, 
  Lock, 
  CheckCircle, 
  Loader2,
  Mail,
  MessageSquare,
  RefreshCw,
  Eye,
  EyeOff,
  Users,
  FileQuestion,
  Upload,
  Church,
  Shield,
  Bell
} from 'lucide-react';
import { toast } from 'sonner';
import { clavesMock } from '@/data/mockData';


interface AdminConfigPanelProps {
  onVolver: () => void;
  onCuestionarios?: () => void;
  onGestionUsuarios?: () => void;
  defaultTab?: string;
}

const AdminConfigPanel: React.FC<AdminConfigPanelProps> = ({ 
  onVolver, 
  onCuestionarios, 
  onGestionUsuarios,
  defaultTab 
}) => {
  const { 
    configSistema, 
    actualizarConfigSistema, 
    tema, 
    solicitudesReset,
    procesarResetPassword,
    refrescarSolicitudesReset
  } = useAuth();
  
  const [activeTab, setActiveTab] = useState(defaultTab || 'login');
  const [guardando, setGuardando] = useState(false);
  const [draggingBg, setDraggingBg] = useState(false);
  const [draggingLogo, setDraggingLogo] = useState(false);

  useEffect(() => {
    if (defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [defaultTab]);

  // Configuración de Seguridad
  const [seguridadConfig, setSeguridadConfig] = useState(() => {
    const guardado = localStorage.getItem('ibc_seguridad_config');
    if (guardado) {
      try { return JSON.parse(guardado); } catch (e) { /* ignore */ }
    }
    return {
      longitudMinima: 8,
      requerirMayuscula: true,
      requerirNumero: true,
      requerirEspecial: false,
      bloqueoIntentos: 5,
      tiempoSesion: '30',
      dobleFactor: false,
      bloquearIP: true,
      duracionBloqueo: 15,
      listaBlancaIP: '',
    };
  });

  // Configuración de Notificaciones
  const [notificacionesConfig, setNotificacionesConfig] = useState(() => {
    const guardado = localStorage.getItem('ibc_notificaciones_config');
    if (guardado) {
      try { return JSON.parse(guardado); } catch (e) { /* ignore */ }
    }
    return {
      activarEmail: true,
      smtpHost: 'smtp.mojicasoft.com',
      smtpPuerto: '587',
      smtpRemitente: 'notificaciones@mojicasoft.com',
      smtpClave: '••••••••••••',
      activarWhatsApp: true,
      whatsappToken: 'EAAXX98asd7123hasd891...',
      whatsappTelefonoId: '1092837465',
      whatsappPlantilla: 'Hola {{nombre}}, bienvenido a los Grupos de Amigos con Propósito (GAP). Tu registro ha sido exitoso. Tu pastor responsable es {{pastor}}.',
      notificarEscalamientos: true,
      notificarNuevosIntegrantes: true,
      recordatorioAsistencia: true,
    };
  });
  
  // Configuración de login
  const [loginConfig, setLoginConfig] = useState({
    loginBackgroundImage: configSistema.loginBackgroundImage,
    loginLogo: configSistema.loginLogo,
    loginTitulo: configSistema.loginTitulo,
    nombreIglesia: configSistema.nombreIglesia,
  });

  const handleGuardarLogin = async () => {
    setGuardando(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    actualizarConfigSistema(loginConfig);
    setGuardando(false);
    toast.success('Configuración De Login Guardada Exitosamente');
  };

  const processBgFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('El archivo seleccionado debe ser una imagen.');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.warning('La imagen supera los 2MB. Se recomienda comprimirla para acelerar la carga del login.');
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setLoginConfig(prev => ({ ...prev, loginBackgroundImage: reader.result as string }));
        toast.success('Imagen de fondo cargada correctamente.');
      }
    };
    reader.readAsDataURL(file);
  };

  const processLogoFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('El archivo seleccionado debe ser una imagen.');
      return;
    }

    if (file.size > 500 * 1024) {
      toast.warning('El logo supera los 500KB. Se recomienda un logo liviano para evitar lentitud.');
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setLoginConfig(prev => ({ ...prev, loginLogo: reader.result as string }));
        toast.success('Logo cargado correctamente.');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processBgFile(file);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processLogoFile(file);
  };

  const handleBgDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDraggingBg(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processBgFile(file);
  };

  const handleLogoDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDraggingLogo(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processLogoFile(file);
  };

  const handleProcesarReset = async (solicitudId: string) => {
    const exito = await procesarResetPassword(solicitudId);
    if (exito) {
      toast.success('Contraseña Reseteada A "123456". Se Ha Notificado Al Usuario.');
      refrescarSolicitudesReset();
    } else {
      toast.error('Error Al Procesar La Solicitud');
    }
  };

  const imagenesFondoPredefinidas = [
    '/bg-login.jpeg',
    'https://images.unsplash.com/photo-1548625149-fc4a29cf7092?w=1920&q=80',
    'https://images.unsplash.com/photo-1519491050282-cf00c82424ae?w=1920&q=80',
    'https://images.unsplash.com/photo-1507692049790-de58290a4334?w=1920&q=80',
    'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=1920&q=80',
  ];

  const logosPredefinidos = [
    '/logo-gap.jpeg',
    'https://cdn-icons-png.flaticon.com/512/3655/3655944.png',
    'https://cdn-icons-png.flaticon.com/512/3655/3655943.png',
    '', // Sin logo (usar icono por defecto)
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto animate-fade-in pb-24 lg:pb-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" onClick={onVolver} className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Volver
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">Panel de Administración</h1>
      </div>

      {/* Herramientas principales - Tarjetas de acceso rápido */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card 
          className="cursor-pointer hover:shadow-lg transition-all border-2 hover:border-blue-300"
          onClick={onGestionUsuarios}
        >
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center">
              <Users className="w-7 h-7 text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Gestión de Usuarios</h3>
              <p className="text-sm text-gray-500">Crear, editar, eliminar y reasignar usuarios de todos los roles</p>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-lg transition-all border-2 hover:border-purple-300"
          onClick={onCuestionarios}
        >
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-purple-100 flex items-center justify-center">
              <FileQuestion className="w-7 h-7 text-purple-600" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Cuestionarios</h3>
              <p className="text-sm text-gray-500">Crear, editar y gestionar cuestionarios con múltiples tipos de preguntas</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-3 md:grid-cols-6 w-full gap-1 h-auto p-1 bg-white/5 border border-white/10 rounded-xl">
          <TabsTrigger value="login" className="flex items-center justify-center gap-2 py-2 rounded-lg data-[state=active]:bg-white/10 data-[state=active]:text-white">
            <Image className="w-4 h-4" />
            <span className="hidden sm:inline">Login</span>
          </TabsTrigger>
          <TabsTrigger value="seguridad" className="flex items-center justify-center gap-2 py-2 rounded-lg data-[state=active]:bg-white/10 data-[state=active]:text-white">
            <Shield className="w-4 h-4" />
            <span className="hidden sm:inline">Seguridad</span>
          </TabsTrigger>
          <TabsTrigger value="notificaciones" className="flex items-center justify-center gap-2 py-2 rounded-lg data-[state=active]:bg-white/10 data-[state=active]:text-white">
            <Bell className="w-4 h-4" />
            <span className="hidden sm:inline">Notificaciones</span>
          </TabsTrigger>
          <TabsTrigger value="password" className="flex items-center justify-center gap-2 py-2 rounded-lg data-[state=active]:bg-white/10 data-[state=active]:text-white">
            <Lock className="w-4 h-4" />
            <span className="hidden sm:inline">Contraseñas</span>
          </TabsTrigger>
          <TabsTrigger value="cambio-password" className="flex items-center justify-center gap-2 py-2 rounded-lg data-[state=active]:bg-white/10 data-[state=active]:text-white">
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">Mi Contraseña</span>
          </TabsTrigger>
          <TabsTrigger value="mensajes" className="flex items-center justify-center gap-2 py-2 rounded-lg data-[state=active]:bg-white/10 data-[state=active]:text-white">
            <Mail className="w-4 h-4" />
            <span className="hidden sm:inline">Mensajes</span>
          </TabsTrigger>
        </TabsList>

        {/* Configuración de Login */}
        <TabsContent value="login">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="w-5 h-5" style={{ color: tema.primario }} />
                Personalización del Login
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Imagen de fondo */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 pb-2 gap-2">
                  <Label className="text-base font-bold text-gray-800">1. Imagen de Fondo del Login</Label>
                  <span className="text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-2.5 py-0.5 rounded-full flex items-center gap-1 w-fit">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Resolución Profesional: 1920 × 1080 px (16:9)
                  </span>
                </div>
                
                {/* Predefinidos */}
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-gray-505 block text-gray-500">Fondos Predefinidos de Alta Calidad:</span>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {imagenesFondoPredefinidas.map((img, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setLoginConfig(prev => ({ ...prev, loginBackgroundImage: img }))}
                        className={`relative aspect-video rounded-lg overflow-hidden border-2 transition-all ${
                          loginConfig.loginBackgroundImage === img
                            ? 'border-blue-600 ring-2 ring-blue-100 scale-[1.02]'
                            : 'border-gray-200 hover:border-gray-300 hover:scale-[1.01]'
                        }`}
                      >
                        <img src={img} alt={`Fondo ${index + 1}`} className="w-full h-full object-cover" />
                        {loginConfig.loginBackgroundImage === img && (
                          <div className="absolute inset-0 bg-blue-600/10 flex items-center justify-center">
                            <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md">
                              <CheckCircle className="w-4 h-4" />
                            </div>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Subir Archivo */}
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-gray-505 block text-gray-500">Subir desde tu Dispositivo (Recomendado para Personalizar):</span>
                  
                  <div 
                    onDragOver={(e) => { e.preventDefault(); setDraggingBg(true); }}
                    onDragLeave={() => setDraggingBg(false)}
                    onDrop={handleBgDrop}
                    onClick={() => document.getElementById('bg-file-input')?.click()}
                    className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 relative overflow-hidden group flex flex-col items-center justify-center min-h-[160px] ${
                      draggingBg 
                        ? 'border-blue-500 bg-blue-50/50' 
                        : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50/50'
                    }`}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      id="bg-file-input"
                      onChange={handleBgUpload}
                      className="hidden"
                    />

                    {loginConfig.loginBackgroundImage && (loginConfig.loginBackgroundImage.startsWith('data:image/') || !imagenesFondoPredefinidas.includes(loginConfig.loginBackgroundImage)) ? (
                      // Preview custom uploaded background
                      <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-gray-900">
                        <img 
                          src={loginConfig.loginBackgroundImage} 
                          alt="Fondo personalizado" 
                          className="w-full h-full object-cover opacity-60"
                        />
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 gap-2 p-4 text-center">
                          <span className="text-white text-xs font-bold bg-blue-600/80 px-3 py-1 rounded-full flex items-center gap-1.5 shadow-md">
                            <Upload className="w-3.5 h-3.5" />
                            Imagen Personalizada Activa
                          </span>
                          <p className="text-white/95 text-[11px] max-w-xs drop-shadow-sm">
                            Haz clic o arrastra otra imagen aquí para cambiar el fondo.
                          </p>
                          <div className="flex gap-2 mt-1">
                            <Button 
                              type="button" 
                              variant="outline" 
                              size="sm"
                              className="text-xs h-7 text-white border-white bg-white/10 hover:bg-white/20"
                              onClick={(e) => {
                                e.stopPropagation();
                                document.getElementById('bg-file-input')?.click();
                              }}
                            >
                              Cambiar
                            </Button>
                            <Button 
                              type="button" 
                              variant="destructive" 
                              size="sm"
                              className="text-xs h-7 text-white"
                              onClick={(e) => {
                                e.stopPropagation();
                                setLoginConfig(prev => ({ ...prev, loginBackgroundImage: imagenesFondoPredefinidas[0] }));
                                toast.info('Fondo personalizado removido. Se restauró el fondo predeterminado.');
                              }}
                            >
                              Restablecer
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      // Empty / Default state instructions
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                          <Upload className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-gray-750 text-gray-700">Arrastra tu imagen de fondo aquí o haz clic para explorar</p>
                          <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
                            Sube una fotografía de tu iglesia o paisaje. Asegúrate de que tenga una orientación horizontal y buena calidad.
                          </p>
                        </div>
                        <div className="flex flex-wrap justify-center gap-2 mt-2">
                          <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-mono border border-gray-200">Aspecto: 16:9</span>
                          <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-mono border border-gray-200">Resolución: 1920x1080 px</span>
                          <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-mono border border-gray-200">Max: 2MB</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Avanzado URL */}
                <div className="space-y-1">
                  <details className="cursor-pointer group">
                    <summary className="text-[11px] text-gray-400 hover:text-gray-650 flex items-center gap-1 select-none font-medium">
                      Opciones avanzadas (URL de imagen externa)
                    </summary>
                    <div className="pt-2">
                      <Label htmlFor="customImage" className="text-[11px] text-gray-500 mb-1 block">Si prefieres usar una imagen alojada en internet, ingresa su enlace directo aquí:</Label>
                      <Input
                        id="customImage"
                        value={loginConfig.loginBackgroundImage.startsWith('data:image') ? '' : loginConfig.loginBackgroundImage}
                        onChange={(e) => setLoginConfig(prev => ({ ...prev, loginBackgroundImage: e.target.value }))}
                        placeholder="https://ejemplo.com/imagenes/mi-fondo.jpg"
                        className="text-xs h-9 bg-white"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </details>
                </div>
              </div>

              {/* Logo del Sistema */}
              <div className="space-y-4 border-t border-gray-100 pt-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 pb-2 gap-2">
                  <Label className="text-base font-bold text-gray-800">2. Logotipo del Sistema</Label>
                  <span className="text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200/60 px-2.5 py-0.5 rounded-full flex items-center gap-1 w-fit">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                    Resolución Profesional: 512 × 512 px (1:1)
                  </span>
                </div>
                
                {/* Predefinidos */}
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-gray-505 block text-gray-500">Logos Predefinidos / Alternativos:</span>
                  <div className="grid grid-cols-4 md:grid-cols-5 gap-3">
                    {logosPredefinidos.map((logo, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setLoginConfig(prev => ({ ...prev, loginLogo: logo }))}
                        className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all bg-gray-50 flex items-center justify-center ${
                          loginConfig.loginLogo === logo
                            ? 'border-blue-600 ring-2 ring-blue-100 scale-[1.02]'
                            : 'border-gray-200 hover:border-gray-300 hover:scale-[1.01]'
                        }`}
                      >
                        {logo ? (
                          <img src={logo} alt={`Logo ${index + 1}`} className="w-full h-full object-contain p-2" />
                        ) : (
                          <div className="text-center">
                            <Image className="w-6 h-6 text-gray-400 mx-auto" />
                            <span className="text-[11px] text-gray-500 font-medium">Ninguno</span>
                          </div>
                        )}
                        {loginConfig.loginLogo === logo && (
                          <div className="absolute inset-0 bg-blue-600/10 flex items-center justify-center">
                            <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md">
                              <CheckCircle className="w-4 h-4" />
                            </div>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Subir Archivo */}
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-gray-550 block text-gray-500">Subir desde tu Dispositivo (Recomendado para Personalizar):</span>
                  
                  <div 
                    onDragOver={(e) => { e.preventDefault(); setDraggingLogo(true); }}
                    onDragLeave={() => setDraggingLogo(false)}
                    onDrop={handleLogoDrop}
                    onClick={() => document.getElementById('logo-file-input')?.click()}
                    className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 relative overflow-hidden group flex flex-col sm:flex-row items-center justify-center gap-6 min-h-[140px] ${
                      draggingLogo 
                        ? 'border-blue-500 bg-blue-50/50' 
                        : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50/50'
                    }`}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      id="logo-file-input"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />

                    {/* Left preview box */}
                    <div className="w-24 h-24 rounded-xl border border-gray-200 flex items-center justify-center bg-white overflow-hidden shadow-sm flex-shrink-0 transition-transform duration-200 group-hover:scale-105">
                      {loginConfig.loginLogo ? (
                        <img 
                          src={loginConfig.loginLogo} 
                          alt="Logo actual" 
                          className="w-full h-full object-contain p-2"
                        />
                      ) : (
                        <Image className="w-8 h-8 text-gray-400" />
                      )}
                    </div>

                    {/* Right instructions or uploaded action */}
                    <div className="flex-1 text-center sm:text-left space-y-1">
                      {loginConfig.loginLogo && (loginConfig.loginLogo.startsWith('data:image/') || !logosPredefinidos.includes(loginConfig.loginLogo)) ? (
                        <div className="space-y-2">
                          <span className="text-xs font-bold bg-blue-600 text-white px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 shadow-sm">
                            <Upload className="w-3 h-3" />
                            Logo Personalizado Activo
                          </span>
                          <p className="text-gray-705 text-gray-700 text-sm font-semibold">Haz clic o arrastra aquí para cambiar el logotipo</p>
                          <div className="flex justify-center sm:justify-start gap-2 pt-1">
                            <Button 
                              type="button" 
                              variant="outline" 
                              size="sm"
                              className="text-xs h-7 bg-white hover:bg-gray-50"
                              onClick={(e) => {
                                e.stopPropagation();
                                document.getElementById('logo-file-input')?.click();
                              }}
                            >
                              Cambiar
                            </Button>
                            <Button 
                              type="button" 
                              variant="destructive" 
                              size="sm"
                              className="text-xs h-7 text-white"
                              onClick={(e) => {
                                e.stopPropagation();
                                setLoginConfig(prev => ({ ...prev, loginLogo: logosPredefinidos[0] }));
                                toast.info('Logo personalizado removido. Se restauró el predeterminado.');
                              }}
                            >
                              Restablecer
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          <p className="font-semibold text-sm text-gray-750 text-gray-700">Arrastra tu logo aquí o haz clic para explorar</p>
                          <p className="text-xs text-gray-500 max-w-md">
                            Para obtener un resultado profesional, sube un archivo <strong>PNG con fondo transparente</strong> para que se adapte al tema del login.
                          </p>
                          <div className="flex flex-wrap justify-center sm:justify-start gap-2 pt-1">
                            <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-mono border border-gray-200">Aspecto: 1:1</span>
                            <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-mono border border-gray-200">Resolución: 512x512 px</span>
                            <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-mono border border-gray-200">Max: 500KB</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Avanzado URL */}
                <div className="space-y-1">
                  <details className="cursor-pointer group">
                    <summary className="text-[11px] text-gray-400 hover:text-gray-650 flex items-center gap-1 select-none font-medium">
                      Opciones avanzadas (URL de logo externo)
                    </summary>
                    <div className="pt-2">
                      <Label htmlFor="logoUrl" className="text-[11px] text-gray-500 mb-1 block">Si prefieres usar un logo alojado en internet, ingresa su enlace directo aquí:</Label>
                      <Input
                        id="logoUrl"
                        value={loginConfig.loginLogo && loginConfig.loginLogo.startsWith('data:image') ? '' : loginConfig.loginLogo || ''}
                        onChange={(e) => setLoginConfig(prev => ({ ...prev, loginLogo: e.target.value }))}
                        placeholder="https://ejemplo.com/imagenes/mi-logo.png"
                        className="text-xs h-9 bg-white"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </details>
                </div>
              </div>

              {/* Título */}
              <div className="space-y-2 border-t border-gray-100 pt-6">
                <Label htmlFor="titulo" className="text-sm font-semibold text-gray-700">Título del Sistema</Label>
                <Input
                  id="titulo"
                  value={loginConfig.loginTitulo}
                  onChange={(e) => setLoginConfig(prev => ({ ...prev, loginTitulo: e.target.value }))}
                  placeholder="Grupos de Amigos con Propósito (G.A.P)"
                />
              </div>

              {/* Nombre de la iglesia */}
              <div className="space-y-2">
                <Label htmlFor="nombreIglesia" className="text-sm font-semibold text-gray-700">Nombre de la Iglesia / Congregación</Label>
                <Input
                  id="nombreIglesia"
                  value={loginConfig.nombreIglesia}
                  onChange={(e) => setLoginConfig(prev => ({ ...prev, nombreIglesia: e.target.value }))}
                  placeholder="Iglesia Bautista Central"
                />
              </div>

              {/* Vista previa */}
              <div className="space-y-3 border-t border-gray-100 pt-6">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold text-gray-700">Vista Previa del Login en Tiempo Real</Label>
                  <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded border border-blue-100">Simulación del diseño final</span>
                </div>
                <div 
                  className="h-48 rounded-xl bg-cover bg-center flex flex-col items-center justify-center relative overflow-hidden shadow-inner border border-gray-200"
                  style={{ backgroundImage: `url('${loginConfig.loginBackgroundImage}')` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 via-blue-800/70 to-cyan-700/60" />
                  <div className="relative z-10 text-center px-4">
                    <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm mx-auto mb-3 overflow-hidden border border-white/30 flex items-center justify-center shadow-md">
                      {loginConfig.loginLogo ? (
                        <img 
                          src={loginConfig.loginLogo} 
                          alt="Logo" 
                          className="w-full h-full object-contain p-1.5"
                        />
                      ) : (
                        <Church className="w-7 h-7 text-white" />
                      )}
                    </div>
                    <p className="text-white font-bold text-base drop-shadow-sm truncate max-w-[320px]">{loginConfig.loginTitulo || 'Grupos de Amigos'}</p>
                    <p className="text-white/80 text-xs drop-shadow-sm truncate max-w-[320px]">{loginConfig.nombreIglesia || 'Iglesia local'}</p>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleGuardarLogin}
                disabled={guardando}
                className="w-full text-white mt-4 shadow-md transition-all hover:opacity-95 h-11"
                style={{ backgroundColor: tema.primario }}
              >
                {guardando ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Guardando Configuración...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Guardar Cambios de Personalización
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configuración de Seguridad */}
        <TabsContent value="seguridad">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Tarjeta de Requisitos de Contraseña y Expiración */}
            <Card className="bg-[#0f1d19]/80 border-white/5 backdrop-blur-md rounded-2xl shadow-xl">
              <CardHeader className="border-b border-white/5 pb-3">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-white text-base font-bold tracking-wide flex items-center gap-2">
                    Security Policies
                  </CardTitle>
                  <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    Active
                  </span>
                </div>
              </CardHeader>
              <CardContent className="pt-5 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Password Requirements */}
                  <div className="space-y-4">
                    <h4 className="text-white/80 text-xs font-bold uppercase tracking-wider">Password Requirements</h4>
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="longitudMinima" className="text-white/60 text-xs mb-1.5 block">Length</Label>
                        <Input
                          id="longitudMinima"
                          type="number"
                          min="6"
                          max="20"
                          value={seguridadConfig.longitudMinima}
                          onChange={(e) => setSeguridadConfig({...seguridadConfig, longitudMinima: parseInt(e.target.value) || 8})}
                          className="bg-[#0b1411]/90 border-white/10 text-white font-mono text-xs focus:ring-emerald-500 focus:border-emerald-500 w-full"
                        />
                      </div>

                      <div className="flex items-center justify-between py-1">
                        <span className="text-white/70 text-xs">Uppercase</span>
                        <Switch
                          checked={seguridadConfig.requerirMayuscula}
                          onCheckedChange={(checked) => setSeguridadConfig({...seguridadConfig, requerirMayuscula: checked})}
                          className="data-[state=checked]:bg-emerald-500"
                        />
                      </div>

                      <div className="flex items-center justify-between py-1">
                        <span className="text-white/70 text-xs">Lowercase</span>
                        <Switch
                          checked={seguridadConfig.requerirMayuscula} // reuse or dummy toggle
                          onCheckedChange={() => {}}
                          className="data-[state=checked]:bg-emerald-500"
                          disabled
                        />
                      </div>

                      <div className="flex items-center justify-between py-1">
                        <span className="text-white/70 text-xs">Number</span>
                        <Switch
                          checked={seguridadConfig.requerirNumero}
                          onCheckedChange={(checked) => setSeguridadConfig({...seguridadConfig, requerirNumero: checked})}
                          className="data-[state=checked]:bg-emerald-500"
                        />
                      </div>

                      <div className="flex items-center justify-between py-1">
                        <span className="text-white/70 text-xs">Symbol</span>
                        <Switch
                          checked={seguridadConfig.requerirEspecial}
                          onCheckedChange={(checked) => setSeguridadConfig({...seguridadConfig, requerirEspecial: checked})}
                          className="data-[state=checked]:bg-emerald-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Session Expiration */}
                  <div className="flex flex-col justify-between">
                    <div className="space-y-4">
                      <h4 className="text-white/80 text-xs font-bold uppercase tracking-wider">Session Expiration</h4>
                      <div>
                        <Select
                          value={seguridadConfig.tiempoSesion}
                          onValueChange={(val) => setSeguridadConfig({...seguridadConfig, tiempoSesion: val})}
                        >
                          <SelectTrigger className="bg-[#0b1411]/90 border-white/10 text-white text-xs w-full focus:ring-emerald-500 focus:border-emerald-500">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent className="bg-[#0f1d19] border-white/10 text-white">
                            <SelectItem value="15">15 mins</SelectItem>
                            <SelectItem value="30">30 mins</SelectItem>
                            <SelectItem value="60">60 mins</SelectItem>
                            <SelectItem value="120">120 mins</SelectItem>
                            <SelectItem value="0">Never</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <Button
                      onClick={async () => {
                        setGuardando(true);
                        await new Promise(resolve => setTimeout(resolve, 800));
                        localStorage.setItem('ibc_seguridad_config', JSON.stringify(seguridadConfig));
                        setGuardando(false);
                        toast.success('Security Config Updated Successfully');
                      }}
                      disabled={guardando}
                      className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold text-xs py-2 rounded-xl transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)] mt-8"
                    >
                      {guardando ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        'Update Security'
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Whitelisting e IP blocking */}
            <div className="space-y-6">
              <Card className="bg-[#0f1d19]/80 border-white/5 backdrop-blur-md rounded-2xl shadow-xl">
                <CardHeader className="border-b border-white/5 pb-3">
                  <CardTitle className="text-white text-base font-bold tracking-wide">
                    IP Whitelisting/Blocking
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-5 space-y-4">
                  <div className="flex gap-2">
                    <Input
                      id="ipInput"
                      placeholder="IPv4/IPv6, or /IPv6"
                      className="bg-[#0b1411]/90 border-white/10 text-white text-xs flex-1"
                    />
                    <Button 
                      variant="destructive" 
                      onClick={() => toast.error('IP blocked from accessing panels')}
                      className="bg-red-950/40 text-red-400 border border-red-500/20 hover:bg-red-900/40 text-xs px-3"
                    >
                      Block IPs
                    </Button>
                    <Button 
                      onClick={() => toast.success('IP whitelisted successfully')}
                      className="bg-emerald-950/40 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-900/40 text-xs px-3"
                    >
                      Allow IPs
                    </Button>
                  </div>

                  {/* Tabla de IPs */}
                  <div className="overflow-hidden border border-white/5 rounded-xl bg-[#0b1411]/50">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-white/5 bg-[#0b1411]/80 text-white/50">
                          <th className="p-3 font-medium">IPv4 IPs</th>
                          <th className="p-3 font-medium">IPv6</th>
                          <th className="p-3 font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-white/80">
                        <tr>
                          <td className="p-3">192.168.1.54</td>
                          <td className="p-3">102.10.0.1</td>
                          <td className="p-3 text-emerald-400 font-bold">Active</td>
                        </tr>
                        <tr>
                          <td className="p-3">192.168.1.58</td>
                          <td className="p-3">102.10.0.2</td>
                          <td className="p-3 text-emerald-400 font-bold">Active</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Two-Factor Authentication */}
              <Card className="bg-[#0f1d19]/80 border-white/5 backdrop-blur-md rounded-2xl shadow-xl">
                <CardContent className="p-5 flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-bold text-sm">Two-Factor Authentication</h4>
                    <p className="text-white/40 text-xs mt-1">Requires an extra verification token at login</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-white/60 text-xs font-bold">Active</span>
                    <Switch
                      checked={seguridadConfig.dobleFactor}
                      onCheckedChange={(checked) => setSeguridadConfig({...seguridadConfig, dobleFactor: checked})}
                      className="data-[state=checked]:bg-emerald-500"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Admin Activity Log */}
              <Card className="bg-[#0f1d19]/80 border-white/5 backdrop-blur-md rounded-2xl shadow-xl">
                <CardContent className="p-5">
                  <div className="flex justify-between items-center cursor-pointer" onClick={() => toast.info('Displaying full activity details')}>
                    <span className="text-white font-bold text-sm">Admin Activity Log</span>
                    <span className="text-white/30 text-xs font-bold">Details →</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Configuración de Notificaciones */}
        <TabsContent value="notificaciones">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* SMTP Configuration */}
            <Card className="bg-[#0f1d19]/80 border-white/5 backdrop-blur-md rounded-2xl shadow-xl">
              <CardHeader className="border-b border-white/5 pb-3">
                <CardTitle className="text-white text-base font-bold tracking-wide">
                  Notifications Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-5 space-y-5">
                <h4 className="text-white/80 text-xs font-bold uppercase tracking-wider">SMTP Configuration</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <Label htmlFor="smtpHost" className="text-white/60 text-xs mb-1.5 block">Host</Label>
                    <Input
                      id="smtpHost"
                      value={notificacionesConfig.smtpHost}
                      onChange={(e) => setNotificacionesConfig({...notificacionesConfig, smtpHost: e.target.value})}
                      placeholder="smtp.churchmail.org"
                      className="bg-[#0b1411]/90 border-white/10 text-white text-xs focus:ring-emerald-500 focus:border-emerald-500 w-full"
                    />
                  </div>
                  <div>
                    <Label htmlFor="smtpPuerto" className="text-white/60 text-xs mb-1.5 block">Port</Label>
                    <Input
                      id="smtpPuerto"
                      value={notificacionesConfig.smtpPuerto}
                      onChange={(e) => setNotificacionesConfig({...notificacionesConfig, smtpPuerto: e.target.value})}
                      placeholder="587"
                      className="bg-[#0b1411]/90 border-white/10 text-white text-xs focus:ring-emerald-500 focus:border-emerald-500 w-full"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="smtpRemitente" className="text-white/60 text-xs mb-1.5 block">Username</Label>
                    <Input
                      id="smtpRemitente"
                      value={notificacionesConfig.smtpRemitente}
                      onChange={(e) => setNotificacionesConfig({...notificacionesConfig, smtpRemitente: e.target.value})}
                      placeholder="username"
                      className="bg-[#0b1411]/90 border-white/10 text-white text-xs focus:ring-emerald-500 focus:border-emerald-500 w-full"
                    />
                  </div>
                  <div>
                    <Label htmlFor="smtpClave" className="text-white/60 text-xs mb-1.5 block">Password</Label>
                    <Input
                      id="smtpClave"
                      type="password"
                      value={notificacionesConfig.smtpClave}
                      onChange={(e) => setNotificacionesConfig({...notificacionesConfig, smtpClave: e.target.value})}
                      placeholder="••••••••••••"
                      className="bg-[#0b1411]/90 border-white/10 text-white text-xs focus:ring-emerald-500 focus:border-emerald-500 w-full"
                    />
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={async () => {
                    toast.info('Testing SMTP connection...');
                    await new Promise(resolve => setTimeout(resolve, 1200));
                    toast.success('Connection Successful! SMTP response: OK');
                  }}
                  className="w-full bg-[#0b1411]/80 hover:bg-[#0f1d19] text-white/80 border-white/10 text-xs h-10"
                >
                  Test Connection
                </Button>
              </CardContent>
            </Card>

            {/* WhatsApp Meta API y Plantillas */}
            <div className="space-y-6">
              {/* WhatsApp Meta API */}
              <Card className="bg-[#0f1d19]/80 border-white/5 backdrop-blur-md rounded-2xl shadow-xl">
                <CardHeader className="border-b border-white/5 pb-3">
                  <CardTitle className="text-white text-base font-bold tracking-wide">
                    WhatsApp Meta API
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-5 space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="whatsappTelefonoId" className="text-white/60 text-xs mb-1.5 block">Business Account ID</Label>
                      <Input
                        id="whatsappTelefonoId"
                        value={notificacionesConfig.whatsappTelefonoId}
                        onChange={(e) => setNotificacionesConfig({...notificacionesConfig, whatsappTelefonoId: e.target.value})}
                        placeholder="Business Account ID"
                        className="bg-[#0b1411]/90 border-white/10 text-white text-xs w-full"
                      />
                    </div>
                    <div>
                      <Label htmlFor="whatsappPhoneID" className="text-white/60 text-xs mb-1.5 block">Phone Number ID</Label>
                      <Input
                        id="whatsappPhoneID"
                        value="1092837465"
                        placeholder="Phone Number ID"
                        className="bg-[#0b1411]/90 border-white/10 text-white text-xs w-full"
                        readOnly
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="whatsappToken" className="text-white/60 text-xs mb-1.5 block">Access Token</Label>
                    <div className="flex gap-2">
                      <Input
                        id="whatsappToken"
                        value={notificacionesConfig.whatsappToken}
                        onChange={(e) => setNotificacionesConfig({...notificacionesConfig, whatsappToken: e.target.value})}
                        placeholder="Access Token"
                        className="bg-[#0b1411]/90 border-white/10 text-white text-xs flex-1"
                      />
                      <Button 
                        onClick={async () => {
                          toast.info('Connecting Meta account...');
                          await new Promise(resolve => setTimeout(resolve, 800));
                          toast.success('WhatsApp API successfully connected!');
                        }}
                        className="bg-emerald-950/40 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-900/40 text-xs"
                      >
                        Connect WhatsApp
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Notification Templates */}
              <Card className="bg-[#0f1d19]/80 border-white/5 backdrop-blur-md rounded-2xl shadow-xl">
                <CardHeader className="border-b border-white/5 pb-3">
                  <CardTitle className="text-white text-base font-bold tracking-wide">
                    Notification Templates
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-5 space-y-5">
                  <h4 className="text-white/80 text-xs font-bold uppercase tracking-wider">Welcome Email Template</h4>
                  
                  <div className="space-y-4">
                    <div>
                      <Label className="text-white/60 text-xs mb-1.5 block">Subject</Label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Welcome to our GAP Church Community!"
                          className="bg-[#0b1411]/90 border-white/10 text-white text-xs flex-1"
                        />
                        <Button 
                          onClick={() => toast.success('Template Saved Successfully')}
                          className="bg-[#0b1411]/80 hover:bg-[#0f1d19] text-white/80 border-white/10 text-xs"
                        >
                          Save Template
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label className="text-white/60 text-xs mb-1.5 block">Body</Label>
                      <Textarea
                        value={notificacionesConfig.whatsappPlantilla}
                        onChange={(e) => setNotificacionesConfig({...notificacionesConfig, whatsappPlantilla: e.target.value})}
                        rows={4}
                        className="bg-[#0b1411]/90 border-white/10 text-white text-xs w-full focus:ring-emerald-500 focus:border-emerald-500 rounded-xl"
                      />
                      <div className="flex justify-between items-center text-[10px] text-white/40 mt-1">
                        <span>Variables: {"{{nombre}}"}, {"{{pastor}}"}, {"{{gap}}"}</span>
                        <div className="flex gap-2">
                          <button className="hover:text-white" onClick={() => toast.info('Text reset')}>Reset</button>
                          <button className="hover:text-white" onClick={() => toast.info('Preview opened')}>Preview</button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={async () => {
                      setGuardando(true);
                      await new Promise(resolve => setTimeout(resolve, 800));
                      localStorage.setItem('ibc_notificaciones_config', JSON.stringify(notificacionesConfig));
                      setGuardando(false);
                      toast.success('Notification Settings Saved');
                    }}
                    disabled={guardando}
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold text-xs py-2 rounded-xl transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)] mt-4"
                  >
                    {guardando ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                        Saving Configuration...
                      </>
                    ) : (
                      'Save Notifications Settings'
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Cambio de Contraseña Personal */}
        <TabsContent value="cambio-password">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5" style={{ color: tema.primario }} />
                Cambiar Mi Contraseña
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <CambioPasswordForm />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Solicitudes de Reset de Contraseña */}
        <TabsContent value="password">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5" style={{ color: tema.primario }} />
                Solicitudes de Reset de Contraseña
              </CardTitle>
            </CardHeader>
            <CardContent>
              {solicitudesReset.filter(s => s.estado === 'Pendiente').length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <RefreshCw className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                  <p className="text-gray-500">No hay solicitudes pendientes</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {solicitudesReset
                    .filter(s => s.estado === 'Pendiente')
                    .map((solicitud) => (
                      <div key={solicitud.id} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{solicitud.usuarioNombre}</p>
                            <p className="text-sm text-gray-500">{solicitud.usuarioCorreo}</p>
                            <p className="text-xs text-gray-400">
                              Solicitado: {new Date(solicitud.fechaSolicitud).toLocaleDateString('es-ES')}
                            </p>
                          </div>
                          <Button
                            onClick={() => handleProcesarReset(solicitud.id)}
                            className="text-white"
                            style={{ backgroundColor: tema.primario }}
                          >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Resetear a "123456"
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              )}

              {/* Historial de solicitudes procesadas */}
              {solicitudesReset.filter(s => s.estado === 'Procesada').length > 0 && (
                <div className="mt-6">
                  <h4 className="font-medium text-gray-700 mb-3">Historial de Solicitudes Procesadas</h4>
                  <div className="space-y-2">
                    {solicitudesReset
                      .filter(s => s.estado === 'Procesada')
                      .map((solicitud) => (
                        <div key={solicitud.id} className="p-3 bg-green-50 rounded-lg border border-green-200">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-sm">{solicitud.usuarioNombre}</p>
                              <p className="text-xs text-gray-500">{solicitud.usuarioCorreo}</p>
                            </div>
                            <span className="text-xs text-green-600 font-medium">
                              Procesada: {solicitud.fechaProcesamiento && new Date(solicitud.fechaProcesamiento).toLocaleDateString('es-ES')}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Envío de Mensajes Masivos */}
        <TabsContent value="mensajes">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" style={{ color: tema.primario }} />
                Envío de Mensajes Masivos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-700">
                  <strong>Nota:</strong> Esta función permite enviar mensajes masivos a través de WhatsApp o correo electrónico. 
                  Asegúrese de tener los contactos actualizados.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => toast.info('Función de WhatsApp en desarrollo')}>
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                      <MessageSquare className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="font-medium text-lg">WhatsApp</h3>
                    <p className="text-sm text-gray-500 mt-1">Enviar mensajes por WhatsApp</p>
                  </CardContent>
                </Card>

                <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => toast.info('Función de Correo en desarrollo')}>
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                      <Mail className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="font-medium text-lg">Correo Electrónico</h3>
                    <p className="text-sm text-gray-500 mt-1">Enviar correos masivos</p>
                  </CardContent>
                </Card>
              </div>

              <div className="text-center text-sm text-gray-500">
                Próximamente: Integración completa con WhatsApp Business API y servicios de correo
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Componente para cambiar contraseña
const CambioPasswordForm: React.FC = () => {
  const { usuario, tema } = useAuth();
  const [formData, setFormData] = useState({
    passwordActual: '',
    passwordNueva: '',
    passwordConfirmar: '',
  });
  const [guardando, setGuardando] = useState(false);
  const [mostrarPassword, setMostrarPassword] = useState<Record<string, boolean>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.passwordNueva !== formData.passwordConfirmar) {
      toast.error('Las Contraseñas No Coinciden');
      return;
    }
    
    if (formData.passwordNueva.length < 6) {
      toast.error('La Contraseña Debe Tener Al Menos 6 Caracteres');
      return;
    }

    setGuardando(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Actualizar la contraseña en el mock
    if (usuario) {
      clavesMock[usuario.correo] = formData.passwordNueva;
    }
    
    setGuardando(false);
    toast.success('Contraseña Actualizada Exitosamente');
    setFormData({ passwordActual: '', passwordNueva: '', passwordConfirmar: '' });
  };

  const toggleMostrarPassword = (campo: string) => {
    setMostrarPassword(prev => ({ ...prev, [campo]: !prev[campo] }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="passwordActual">Contraseña Actual</Label>
        <div className="relative">
          <Input
            id="passwordActual"
            type={mostrarPassword['actual'] ? 'text' : 'password'}
            value={formData.passwordActual}
            onChange={(e) => setFormData({...formData, passwordActual: e.target.value})}
            placeholder="Ingrese Su Contraseña Actual"
            required
          />
          <button
            type="button"
            onClick={() => toggleMostrarPassword('actual')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {mostrarPassword['actual'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="passwordNueva">Nueva Contraseña</Label>
        <div className="relative">
          <Input
            id="passwordNueva"
            type={mostrarPassword['nueva'] ? 'text' : 'password'}
            value={formData.passwordNueva}
            onChange={(e) => setFormData({...formData, passwordNueva: e.target.value})}
            placeholder="Ingrese Su Nueva Contraseña"
            required
          />
          <button
            type="button"
            onClick={() => toggleMostrarPassword('nueva')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {mostrarPassword['nueva'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        <p className="text-xs text-gray-500">Mínimo 6 Caracteres</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="passwordConfirmar">Confirmar Nueva Contraseña</Label>
        <div className="relative">
          <Input
            id="passwordConfirmar"
            type={mostrarPassword['confirmar'] ? 'text' : 'password'}
            value={formData.passwordConfirmar}
            onChange={(e) => setFormData({...formData, passwordConfirmar: e.target.value})}
            placeholder="Confirme Su Nueva Contraseña"
            required
          />
          <button
            type="button"
            onClick={() => toggleMostrarPassword('confirmar')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {mostrarPassword['confirmar'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <Button
        type="submit"
        disabled={guardando}
        className="w-full text-white"
        style={{ backgroundColor: tema.primario }}
      >
        {guardando ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Guardando...
          </>
        ) : (
          <>
            <CheckCircle className="w-4 h-4 mr-2" />
            Cambiar Contraseña
          </>
        )}
      </Button>
    </form>
  );
};

export default AdminConfigPanel;
