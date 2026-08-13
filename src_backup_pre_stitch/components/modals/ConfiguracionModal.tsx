import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Palette, RotateCcw, Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

interface ConfiguracionModalProps {
  onVolver: () => void;
}

const ConfiguracionModal: React.FC<ConfiguracionModalProps> = ({ onVolver }) => {
  const { tema, actualizarTema, resetearTema, usuario, cambiarClave, actualizarFotoPerfil } = useAuth();
  
  // Estado para cambio de contraseña
  const [passwordForm, setPasswordForm] = useState({
    actual: '',
    nueva: '',
    confirmar: ''
  });
  const [mostrarPassword, setMostrarPassword] = useState({
    actual: false,
    nueva: false,
    confirmar: false
  });
  const [cambiandoPassword, setCambiandoPassword] = useState(false);

  const coloresPredefinidos = [
    { nombre: 'Azul Cielo (Claro)', primario: '#0ea5e9', secundario: '#0d9488' },
    { nombre: 'Verde Esperanza', primario: '#15803d', secundario: '#22c55e' },
    { nombre: 'Púrpura Real', primario: '#7c3aed', secundario: '#a855f7' },
    { nombre: 'Naranja Fuego', primario: '#ea580c', secundario: '#f97316' },
    { nombre: 'Rojo Pasión', primario: '#dc2626', secundario: '#ef4444' },
    { nombre: 'Turquesa', primario: '#0d9488', secundario: '#14b8a6' },
  ];

  const aplicarTema = (primario: string, secundario: string) => {
    actualizarTema({ primario, secundario });
  };

  const handleCambiarPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordForm.nueva !== passwordForm.confirmar) {
      toast.error('Las contraseñas no coinciden');
      return;
    }
    
    if (passwordForm.nueva.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    
    setCambiandoPassword(true);
    
    const exito = await cambiarClave(passwordForm.actual, passwordForm.nueva);
    
    if (exito) {
      toast.success('Contraseña cambiada exitosamente');
      setPasswordForm({ actual: '', nueva: '', confirmar: '' });
    } else {
      toast.error('La contraseña actual es incorrecta');
    }
    
    setCambiandoPassword(false);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto animate-fade-in pb-24 lg:pb-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" onClick={onVolver} className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Volver
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
      </div>

      <Tabs defaultValue="apariencia" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:w-auto">
          <TabsTrigger value="apariencia" className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Apariencia
          </TabsTrigger>
          <TabsTrigger value="seguridad" className="flex items-center gap-2">
            <Lock className="w-4 h-4" />
            Seguridad
          </TabsTrigger>
        </TabsList>

        {/* Pestaña de Apariencia */}
        <TabsContent value="apariencia" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" style={{ color: tema.primario }} />
                Personalizar Colores
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Vista previa */}
              <div 
                className="p-6 rounded-xl text-white"
                style={{ background: `linear-gradient(135deg, ${tema.primario} 0%, ${tema.secundario} 100%)` }}
              >
                <h3 className="text-lg font-semibold mb-2">Vista Previa</h3>
                <p className="text-white/80">Así se verá el encabezado de la aplicación</p>
              </div>

              {/* Temas predefinidos */}
              <div>
                <Label className="text-base font-medium mb-3 block">Temas Predefinidos</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {coloresPredefinidos.map((color) => (
                    <button
                      key={color.nombre}
                      onClick={() => aplicarTema(color.primario, color.secundario)}
                      className="p-3 rounded-lg border-2 hover:border-gray-400 transition-colors text-left"
                      style={{ 
                        borderColor: tema.primario === color.primario ? color.primario : 'transparent'
                      }}
                    >
                      <div 
                        className="h-8 rounded-md mb-2"
                        style={{ background: `linear-gradient(135deg, ${color.primario} 0%, ${color.secundario} 100%)` }}
                      />
                      <span className="text-sm font-medium">{color.nombre}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Colores personalizados */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="color-primario">Color Primario</Label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      id="color-primario"
                      value={tema.primario}
                      onChange={(e) => actualizarTema({ primario: e.target.value })}
                      className="w-12 h-10 rounded cursor-pointer"
                    />
                    <Input
                      value={tema.primario}
                      onChange={(e) => actualizarTema({ primario: e.target.value })}
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="color-secundario">Color Secundario</Label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      id="color-secundario"
                      value={tema.secundario}
                      onChange={(e) => actualizarTema({ secundario: e.target.value })}
                      className="w-12 h-10 rounded cursor-pointer"
                    />
                    <Input
                      value={tema.secundario}
                      onChange={(e) => actualizarTema({ secundario: e.target.value })}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              {/* Modo Oscuro */}
              <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl">
                <div className="space-y-0.5">
                  <Label className="text-sm font-semibold">Modo Oscuro</Label>
                  <p className="text-xs opacity-60">
                    Alterna entre el diseño de vidrio oscuro y el diseño claro de alta legibilidad.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => actualizarTema({ oscuro: tema.oscuro === false ? true : false })}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    tema.oscuro !== false ? 'bg-[#8fa436]' : 'bg-gray-300 dark:bg-zinc-800'
                  }`}
                  style={tema.oscuro !== false ? { backgroundColor: tema.primario } : {}}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      tema.oscuro !== false ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Botón resetear */}
              <Button
                variant="outline"
                onClick={resetearTema}
                className="w-full flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Restaurar Colores Predeterminados
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pestaña de Seguridad */}
        <TabsContent value="seguridad" className="space-y-6">
          {/* Información de la cuenta */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5" style={{ color: tema.primario }} />
                Información de la Cuenta
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Carga de Foto de Perfil */}
              <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-white/5">
                <div className="relative">
                  {usuario?.fotoPerfil ? (
                    <img 
                      src={usuario.fotoPerfil} 
                      alt="Avatar" 
                      className="w-20 h-20 rounded-full object-cover border-2 border-white/10 shadow-lg"
                    />
                  ) : (
                    <div 
                      className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold border-2 border-white/10 shadow-lg"
                      style={{ background: `linear-gradient(135deg, ${tema.primario} 0%, ${tema.secundario} 100%)` }}
                    >
                      {usuario?.nombre?.charAt(0)}{usuario?.apellidos?.charAt(0)}
                    </div>
                  )}
                </div>
                
                <div className="space-y-2 text-center sm:text-left flex-1">
                  <h4 className="text-sm font-semibold">Foto de Perfil</h4>
                  <p className="text-xs opacity-60">
                    Sube una foto desde tu dispositivo. Formatos admitidos: JPG, PNG. Máximo 1MB.
                  </p>
                  <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                    <label 
                      htmlFor="foto-perfil-upload"
                      className="px-4 py-2 rounded-lg text-xs font-semibold text-white cursor-pointer transition-all hover:opacity-90 inline-block"
                      style={{ backgroundColor: tema.primario }}
                    >
                      Seleccionar Foto
                    </label>
                    <input 
                      type="file"
                      id="foto-perfil-upload"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (file.size > 1024 * 1024) {
                            toast.error('La imagen supera el límite de 1MB');
                            return;
                          }
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            const base64 = reader.result as string;
                            actualizarFotoPerfil(base64).then((exito) => {
                              if (exito) {
                                toast.success('Foto de perfil actualizada correctamente');
                              } else {
                                toast.error('Error al actualizar la foto de perfil');
                              }
                            });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                    {usuario?.fotoPerfil && (
                      <Button
                        variant="outline"
                        className="text-xs py-2 h-auto text-rose-400 border-white/5 hover:bg-rose-500/10 hover:text-rose-300"
                        onClick={() => {
                          actualizarFotoPerfil('').then((exito) => {
                            if (exito) {
                              toast.success('Foto de perfil eliminada');
                            }
                          });
                        }}
                      >
                        Eliminar Foto
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-500">Nombre</Label>
                  <p className="font-medium">{usuario?.nombre} {usuario?.apellidos}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Correo</Label>
                  <p className="font-medium">{usuario?.correo}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Rol</Label>
                  <p className="font-medium">{usuario?.rol}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Documento</Label>
                  <p className="font-medium">{usuario?.tipoDocumento} {usuario?.numeroDocumento}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cambiar Contraseña */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5" style={{ color: tema.primario }} />
                Cambiar Contraseña
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCambiarPassword} className="space-y-4">
                {/* Contraseña actual */}
                <div className="space-y-2">
                  <Label htmlFor="password-actual">Contraseña Actual</Label>
                  <div className="relative">
                    <Input
                      id="password-actual"
                      type={mostrarPassword.actual ? 'text' : 'password'}
                      value={passwordForm.actual}
                      onChange={(e) => setPasswordForm({ ...passwordForm, actual: e.target.value })}
                      placeholder="Ingresa tu contraseña actual"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setMostrarPassword({ ...mostrarPassword, actual: !mostrarPassword.actual })}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {mostrarPassword.actual ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Nueva contraseña */}
                <div className="space-y-2">
                  <Label htmlFor="password-nueva">Nueva Contraseña</Label>
                  <div className="relative">
                    <Input
                      id="password-nueva"
                      type={mostrarPassword.nueva ? 'text' : 'password'}
                      value={passwordForm.nueva}
                      onChange={(e) => setPasswordForm({ ...passwordForm, nueva: e.target.value })}
                      placeholder="Mínimo 6 caracteres"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setMostrarPassword({ ...mostrarPassword, nueva: !mostrarPassword.nueva })}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {mostrarPassword.nueva ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirmar contraseña */}
                <div className="space-y-2">
                  <Label htmlFor="password-confirmar">Confirmar Nueva Contraseña</Label>
                  <div className="relative">
                    <Input
                      id="password-confirmar"
                      type={mostrarPassword.confirmar ? 'text' : 'password'}
                      value={passwordForm.confirmar}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmar: e.target.value })}
                      placeholder="Repite la nueva contraseña"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setMostrarPassword({ ...mostrarPassword, confirmar: !mostrarPassword.confirmar })}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {mostrarPassword.confirmar ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full text-white"
                  style={{ backgroundColor: tema.primario }}
                  disabled={cambiandoPassword}
                >
                  {cambiandoPassword ? (
                    'Cambiando...'
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Cambiar Contraseña
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ConfiguracionModal;
