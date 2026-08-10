import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Settings, 
  Users, 
  Lock, 
  Palette, 
  Image,
  Server,
  Activity,
  Database,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Download,
  Trash2,
  Cpu,
  HardDrive,
  Wifi,
  Zap,
  FileText,
  Terminal,
  FileQuestion,
  UserCog
} from 'lucide-react';
import { toast } from 'sonner';
import { usuariosMock } from '@/data/mockData';

interface DashboardAdminProps {
  onNavegar: (vista: string) => void;
}

// Logs simulados del sistema
const logsSistema = [
  { id: 1, fecha: '2026-03-08 14:32:15', nivel: 'info', mensaje: 'Usuario pastor@ibc.org inició sesión', modulo: 'Auth' },
  { id: 2, fecha: '2026-03-08 14:28:03', nivel: 'info', mensaje: 'GAP-2 actualizado correctamente', modulo: 'GAP' },
  { id: 3, fecha: '2026-03-08 14:15:22', nivel: 'warning', mensaje: 'Intento de acceso fallido desde IP 192.168.1.45', modulo: 'Security' },
  { id: 4, fecha: '2026-03-08 13:45:10', nivel: 'info', mensaje: 'Nuevo miembro registrado en GAP-1', modulo: 'Miembros' },
  { id: 5, fecha: '2026-03-08 12:30:00', nivel: 'error', mensaje: 'Error de conexión a base de datos (resuelto)', modulo: 'Database' },
  { id: 6, fecha: '2026-03-08 11:15:45', nivel: 'info', mensaje: 'Backup automático completado', modulo: 'Backup' },
  { id: 7, fecha: '2026-03-08 10:22:18', nivel: 'info', mensaje: 'Usuario admin@ibc.org cambió configuración del tema', modulo: 'Config' },
  { id: 8, fecha: '2026-03-08 09:45:33', nivel: 'warning', mensaje: 'Solicitud de reset de contraseña recibida', modulo: 'Auth' },
];

// Estado del sistema
const estadoSistema = {
  servidor: 'Operativo',
  baseDatos: 'Conectada',
  almacenamiento: '45%',
  memoria: '62%',
  cpu: '23%',
  ultimoBackup: '2026-03-08 03:00:00',
  version: '2.0.1',
  uptime: '15 días, 4 horas',
};

const DashboardAdmin: React.FC<DashboardAdminProps> = ({ onNavegar }) => {
  const { tema, solicitudesReset, procesarResetPassword, refrescarSolicitudesReset } = useAuth();
  const [activeTab, setActiveTab] = useState('resumen');
  const [limpiando, setLimpiando] = useState(false);
  const [ultimoBackup, setUltimoBackup] = useState(estadoSistema.ultimoBackup);
  const [cpu, setCpu] = useState(23);
  const [memoria, setMemoria] = useState(62);
  const [almacenamiento] = useState(45);

  useEffect(() => {
    const timer = setInterval(() => {
      setCpu(Math.floor(Math.random() * 15) + 15); // fluctuates 15-30%
      setMemoria(Math.floor(Math.random() * 5) + 60); // fluctuates 60-65%
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const getColorNivel = (nivel: string) => {
    switch (nivel) {
      case 'error': return 'bg-red-100 text-red-700 border-red-300';
      case 'warning': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'info': return 'bg-blue-100 text-blue-700 border-blue-300';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getIconoModulo = (modulo: string) => {
    switch (modulo) {
      case 'Auth': return <Lock className="w-4 h-4" />;
      case 'GAP': return <Users className="w-4 h-4" />;
      case 'Security': return <Shield className="w-4 h-4" />;
      case 'Database': return <Database className="w-4 h-4" />;
      case 'Backup': return <Download className="w-4 h-4" />;
      case 'Config': return <Settings className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const handleLimpiarCache = async () => {
    setLimpiando(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setLimpiando(false);
    toast.success('Caché del sistema limpiado exitosamente');
  };

  const handleForzarBackup = async () => {
    toast.info('Iniciando backup manual de la base de datos Supabase...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    setUltimoBackup(formattedDate);
    toast.success('¡Backup completado exitosamente en Supabase!');
  };

  const solicitudesPendientes = solicitudesReset.filter(s => s.estado === 'Pendiente');

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto animate-fade-in pb-24 lg:pb-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${tema.primario}20` }}
          >
            <Server className="w-6 h-6" style={{ color: tema.primario }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Panel de Administración Técnica</h1>
            <p className="text-gray-500">Gestión y mantenimiento del sistema G.A.P</p>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="resumen" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            <span className="hidden sm:inline">Resumen</span>
          </TabsTrigger>
          <TabsTrigger value="configuracion" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">Configuración</span>
          </TabsTrigger>
          <TabsTrigger value="logs" className="flex items-center gap-2">
            <Terminal className="w-4 h-4" />
            <span className="hidden sm:inline">Logs</span>
          </TabsTrigger>
          <TabsTrigger value="mantenimiento" className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">Mantenimiento</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab Resumen */}
        <TabsContent value="resumen" className="space-y-6">
          {/* Estado del Sistema */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="w-5 h-5" style={{ color: tema.primario }} />
                Estado del Sistema
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-sm text-gray-600">Servidor</span>
                  </div>
                  <p className="text-lg font-bold text-green-700">{estadoSistema.servidor}</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Database className="w-5 h-5 text-green-600" />
                    <span className="text-sm text-gray-600">Base de Datos</span>
                  </div>
                  <p className="text-lg font-bold text-green-700">{estadoSistema.baseDatos}</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-5 h-5 text-blue-600" />
                    <span className="text-sm text-gray-600">Uptime</span>
                  </div>
                  <p className="text-lg font-bold text-blue-700">{estadoSistema.uptime}</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-5 h-5 text-purple-600" />
                    <span className="text-sm text-gray-600">Versión</span>
                  </div>
                  <p className="text-lg font-bold text-purple-700">{estadoSistema.version}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recursos */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-5 h-5 text-blue-500" />
                    <span className="text-sm text-gray-600">CPU</span>
                  </div>
                  <span className="text-lg font-bold">{cpu}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all"
                    style={{ width: `${cpu}%` }}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-purple-500" />
                    <span className="text-sm text-gray-600">Memoria</span>
                  </div>
                  <span className="text-lg font-bold">{memoria}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-500 h-2 rounded-full transition-all"
                    style={{ width: `${memoria}%` }}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <HardDrive className="w-5 h-5 text-green-500" />
                    <span className="text-sm text-gray-600">Almacenamiento</span>
                  </div>
                  <span className="text-lg font-bold">{almacenamiento}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all"
                    style={{ width: `${almacenamiento}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Alertas y Notificaciones */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Lock className="w-5 h-5" style={{ color: tema.primario }} />
                  Solicitudes de Reset de Contraseña
                  {solicitudesPendientes.length > 0 && (
                    <Badge className="bg-red-500 text-white">{solicitudesPendientes.length}</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {solicitudesPendientes.length === 0 ? (
                  <div className="text-center py-6 text-gray-500">
                    <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
                    <p className="text-sm">No hay solicitudes pendientes</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {solicitudesPendientes.map((sol) => (
                      <div key={sol.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                        <div>
                          <p className="font-medium text-sm">{sol.usuarioNombre}</p>
                          <p className="text-xs text-gray-500">{sol.usuarioCorreo}</p>
                        </div>
                        <Button 
                          size="sm"
                          className="text-white"
                          style={{ backgroundColor: tema.primario }}
                          onClick={async () => {
                            const exito = await procesarResetPassword(sol.id);
                            if (exito) {
                              toast.success(`Contraseña de ${sol.usuarioNombre} reseteada a "123456"`);
                              refrescarSolicitudesReset();
                            } else {
                              toast.error('Error al procesar la solicitud');
                            }
                          }}
                        >
                          Resetear
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Download className="w-5 h-5" style={{ color: tema.primario }} />
                  Último Backup
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div>
                    <p className="font-medium text-green-700">Backup Automático</p>
                    <p className="text-sm text-gray-600">{ultimoBackup}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
                <Button 
                  variant="outline" 
                  className="w-full mt-3"
                  onClick={handleForzarBackup}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Forzar Backup Ahora
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab Configuración */}
        <TabsContent value="configuracion" className="space-y-6">
          {/* Nuevas Herramientas de Gestión */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-600" />
              HERRAMIENTAS DE GESTIÓN - MODO DIOS
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Card className="cursor-pointer hover:shadow-lg transition-all border-2 border-blue-200 hover:border-blue-400" onClick={() => onNavegar('gestion-usuarios')}>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <UserCog className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Gestión de Usuarios</h4>
                    <p className="text-xs text-gray-500">Crear, editar, eliminar y reasignar todos los roles</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="cursor-pointer hover:shadow-lg transition-all border-2 border-purple-200 hover:border-purple-400" onClick={() => onNavegar('cuestionarios')}>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                    <FileQuestion className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Cuestionarios</h4>
                    <p className="text-xs text-gray-500">Crear encuestas con múltiples tipos de preguntas</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onNavegar('admin-config')}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Image className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">Personalizar Login</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Cambiar imagen de fondo, título y logo del login
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onNavegar('admin-config')}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                    <Palette className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">Colores del Sistema</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Personalizar paleta de colores y tema visual
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onNavegar('admin-config:seguridad')}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                    <Shield className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">Seguridad</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Configurar políticas de seguridad y acceso
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onNavegar('admin-config:notificaciones')}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center">
                    <Wifi className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">Notificaciones</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Configurar canales de notificación (Email, WhatsApp)
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab Logs */}
        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Terminal className="w-5 h-5" style={{ color: tema.primario }} />
                  Logs del Sistema
                </CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => toast.info('Exportando logs...')}>
                    <Download className="w-4 h-4 mr-2" />
                    Exportar
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => toast.info('Logs limpiados')}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Limpiar
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-2">
                  {logsSistema.map((log) => (
                    <div key={log.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg font-mono text-sm">
                      <span className="text-gray-400 whitespace-nowrap">{log.fecha}</span>
                      <Badge variant="outline" className={getColorNivel(log.nivel)}>
                        {log.nivel.toUpperCase()}
                      </Badge>
                      <span className="text-gray-500 flex items-center gap-1">
                        {getIconoModulo(log.modulo)}
                        {log.modulo}
                      </span>
                      <span className="flex-1">{log.mensaje}</span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Mantenimiento */}
        <TabsContent value="mantenimiento" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RefreshCw className="w-5 h-5" style={{ color: tema.primario }} />
                  Limpieza del Sistema
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-500">
                  Limpia la caché y archivos temporales del sistema para mejorar el rendimiento.
                </p>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={handleLimpiarCache}
                  disabled={limpiando}
                >
                  {limpiando ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Limpiando...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Limpiar Caché
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" style={{ color: tema.primario }} />
                  Base de Datos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-500">
                  Realiza mantenimiento y optimización de la base de datos.
                </p>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => toast.info('Optimización iniciada')}
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Optimizar
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={handleForzarBackup}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Backup
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" style={{ color: tema.primario }} />
                  Información del Sistema
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-500">Versión</span>
                    <span className="font-medium">{estadoSistema.version}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-500">Entorno</span>
                    <span className="font-medium">Producción</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-500">Último Reinicio</span>
                    <span className="font-medium">{estadoSistema.uptime}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-500">Total Usuarios</span>
                    <span className="font-medium">{usuariosMock.length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="w-5 h-5" />
                  Zona de Peligro
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-500">
                  Acciones que pueden afectar el funcionamiento del sistema.
                </p>
                <Button 
                  variant="destructive" 
                  className="w-full"
                  onClick={() => toast.error('Función deshabilitada en producción')}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reiniciar Sistema
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DashboardAdmin;
