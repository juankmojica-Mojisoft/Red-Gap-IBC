import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Mail, Lock, Church, ArrowRight, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface LoginPageProps {
  onLoginSuccess: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [correo, setCorreo] = useState('');
  const [clave, setClave] = useState('');
  const [mostrarClave, setMostrarClave] = useState(false);
  const [error, setError] = useState('');
  const [mostrarRecuperar, setMostrarRecuperar] = useState(false);
  const [correoRecuperar, setCorreoRecuperar] = useState('');
  const [mensajeRecuperar, setMensajeRecuperar] = useState('');
  const { login, cargando, configSistema, solicitarResetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!correo || !clave) {
      setError('Por favor ingrese correo y contraseña');
      return;
    }

    const exito = await login(correo, clave);
    if (exito) {
      onLoginSuccess();
    } else {
      setError('Correo o contraseña incorrectos');
    }
  };

  const handleRecuperar = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensajeRecuperar('');

    if (!correoRecuperar) {
      setMensajeRecuperar('Por favor ingrese su correo');
      return;
    }

    const exito = await solicitarResetPassword(correoRecuperar);
    if (exito) {
      setMensajeRecuperar('Solicitud enviada al administrador. Será contactado pronto.');
      setTimeout(() => {
        setMostrarRecuperar(false);
        setCorreoRecuperar('');
        setMensajeRecuperar('');
      }, 3000);
    } else {
      setMensajeRecuperar('Correo no encontrado en el sistema');
    }
  };

  return (
    <div className="login-page-container min-h-screen w-full flex items-center justify-center relative overflow-hidden">
      {/* Imagen de fondo - Configurable */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('${configSistema.loginBackgroundImage}')`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 via-blue-800/70 to-cyan-700/60" />
      </div>

      {/* Contenido del Login */}
      <div className="relative z-10 w-full max-w-md px-4">
        {/* Logo y título */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-28 h-28 rounded-full bg-white/20 backdrop-blur-sm mb-4 overflow-hidden border-2 border-white/30">
            {configSistema.loginLogo ? (
              <img 
                src={configSistema.loginLogo} 
                alt="Logo" 
                className="w-full h-full object-contain p-2"
              />
            ) : (
              <Church className="w-10 h-10 text-white" />
            )}
          </div>
          <h1 className="text-3xl font-bold text-white text-shadow-lg mb-2">
            {configSistema.loginTitulo}
          </h1>
          <p className="text-white/90 text-lg text-shadow">
            {configSistema.nombreIglesia}
          </p>
          <p className="text-white/70 text-sm mt-1">
            Sistema de Gestión GAP
          </p>
        </div>

        {/* Card de Login con Glassmorphism */}
        <div className="glass-card rounded-2xl p-8">
          <h2 className="text-2xl font-semibold text-white text-center mb-6">
            Iniciar Sesión
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Campo Correo */}
            <div className="space-y-2">
              <Label htmlFor="correo" className="text-white/90">
                Correo Electrónico
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/60" />
                <Input
                  id="correo"
                  type="email"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  placeholder="correo@ibc.org"
                  className="glass-input pl-10 h-12 rounded-lg"
                />
              </div>
            </div>

            {/* Campo Contraseña */}
            <div className="space-y-2">
              <Label htmlFor="clave" className="text-white/90">
                Contraseña
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/60" />
                <Input
                  id="clave"
                  type={mostrarClave ? 'text' : 'password'}
                  value={clave}
                  onChange={(e) => setClave(e.target.value)}
                  placeholder="••••••"
                  className="glass-input pl-10 pr-10 h-12 rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => setMostrarClave(!mostrarClave)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                >
                  {mostrarClave ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-500/20 border border-red-400/50 rounded-lg p-3 text-center">
                <p className="text-red-100 text-sm">{error}</p>
              </div>
            )}

            {/* Botón de acceso */}
            <Button
              type="submit"
              disabled={cargando}
              className="w-full h-12 text-white font-semibold rounded-lg flex items-center justify-center gap-2"
              style={{ 
                background: 'linear-gradient(135deg, var(--color-primario) 0%, var(--color-secundario) 100%)'
              }}
            >
              {cargando ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Ingresando...</span>
                </>
              ) : (
                <>
                  <span>Ingresar al Sistema</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </Button>
          </form>

          {/* Enlace olvidé contraseña */}
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setMostrarRecuperar(true)}
              className="text-white/80 hover:text-white text-sm underline underline-offset-2 transition-colors"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-white/60 text-sm">
            © 2026 {configSistema.nombreIglesia}
          </p>
          <p className="text-white/40 text-xs mt-1">
            Sistema GRUPO AMIGOS IBC v2.0
          </p>
        </div>
      </div>

      {/* Diálogo de recuperación de contraseña */}
      <Dialog open={mostrarRecuperar} onOpenChange={setMostrarRecuperar}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" style={{ color: 'var(--color-primario)' }} />
              Recuperar Contraseña
            </DialogTitle>
            <DialogDescription>
              Ingrese su correo para solicitar el restablecimiento de contraseña.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleRecuperar} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="correo-recuperar">Correo Electrónico</Label>
              <Input
                id="correo-recuperar"
                type="email"
                value={correoRecuperar}
                onChange={(e) => setCorreoRecuperar(e.target.value)}
                placeholder="correo@ibc.org"
              />
            </div>

            {mensajeRecuperar && (
              <div className={`p-3 rounded-lg text-sm ${
                mensajeRecuperar.includes('enviada') 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
              }`}>
                {mensajeRecuperar}
              </div>
            )}

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setMostrarRecuperar(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={cargando}
                className="flex-1 text-white"
                style={{ background: 'var(--color-primario)' }}
              >
                {cargando ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Solicitar'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LoginPage;
