import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Mail, Lock, Flame, ArrowRight, Loader2 } from 'lucide-react';
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
      setMensajeRecuperar('Se han enviado las instrucciones a su correo.');
      setTimeout(() => setMostrarRecuperar(false), 3000);
    } else {
      setMensajeRecuperar('Error al procesar la solicitud.');
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <div 
      className={`min-h-screen w-full flex flex-col items-center relative overflow-hidden ${!configSistema?.loginBackgroundImage ? 'bg-gradient-to-b from-[#0f2d6b] via-[#1e40af] to-[#0f2d6b]' : 'bg-slate-900'}`}
    >
      {/* Capa de Imagen de Fondo Personalizada */}
      {configSistema?.loginBackgroundImage && (
        <div 
          className="absolute inset-0 w-full h-full z-0 opacity-50 bg-cover bg-center bg-no-repeat transition-all duration-700"
          style={{ backgroundImage: `url(${configSistema.loginBackgroundImage})` }}
        />
      )}
      
      {/* Gradiente sutil sobre la imagen para legibilidad */}
      {configSistema?.loginBackgroundImage && (
        <div className="absolute inset-0 w-full h-full z-0 bg-gradient-to-b from-[#0f2d6b]/90 via-[#0f2d6b]/50 to-[#0f2d6b]/90 pointer-events-none" />
      )}

      {/* Elementos decorativos de fondo (destellos sutiles) - Solo se muestran si NO hay imagen */}
      {!configSistema?.loginBackgroundImage && (
        <div className="absolute inset-0 w-full h-full z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[20%] left-[20%] w-[30%] h-[40%] rounded-full bg-blue-400 blur-[100px] mix-blend-screen opacity-20"></div>
          <div className="absolute top-[40%] right-[20%] w-[40%] h-[30%] rounded-full bg-sky-300 blur-[120px] mix-blend-screen opacity-20"></div>
        </div>
      )}

      {/* Contenedor Flex para centrar todo visualmente, dejando espacio para el footer */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md px-4 z-10 py-10">
        
        {/* Cabecera (Logo y Títulos) */}
        <div className="text-center mb-8 w-full flex flex-col items-center">
          <div className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center bg-[#1e40af]/30 backdrop-blur-sm mb-6 shadow-[0_0_20px_rgba(255,255,255,0.2)] overflow-hidden">
            {configSistema?.loginLogo ? (
              <img src={configSistema.loginLogo} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <Flame className="w-10 h-10 text-white fill-white" />
            )}
          </div>
          
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 leading-tight drop-shadow-md">
            Grupos de Amigos<br />con Propósito<br />(G.A.P)
          </h1>
          
          <h2 className="text-sm sm:text-base text-white/95 font-medium mt-3 mb-1">
            {configSistema?.nombreIglesia || 'Iglesia Bautista Central'}
          </h2>
          
          <p className="text-[10px] sm:text-xs text-white/80 font-bold uppercase tracking-[0.2em]">
            Sistema de Gestión GAP
          </p>
        </div>

        {/* Tarjeta de Login */}
        <div className="glass-card w-full p-6 sm:p-8 relative z-10">
          <h3 className="text-center text-slate-700 font-bold text-xl mb-6">
            Iniciar Sesión
          </h3>

          <form onSubmit={handleSubmit} className="space-y-5">
            
            <div className="space-y-1.5">
              <Label htmlFor="correo" className="text-slate-600 font-medium text-xs ml-1">
                Correo Electrónico
              </Label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <Input
                  id="correo"
                  type="email"
                  placeholder="admin@ejemplo.com"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  className="pl-10 bg-white border-white text-slate-800 h-11 rounded-lg focus-visible:ring-blue-600 focus-visible:border-blue-600 transition-all shadow-sm"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="clave" className="text-slate-600 font-medium text-xs ml-1">
                Contraseña
              </Label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <Input
                  id="clave"
                  type={mostrarClave ? 'text' : 'password'}
                  placeholder="••••••"
                  value={clave}
                  onChange={(e) => setClave(e.target.value)}
                  className="pl-10 pr-10 bg-white border-white text-slate-800 h-11 rounded-lg focus-visible:ring-blue-600 focus-visible:border-blue-600 transition-all shadow-sm font-sans"
                  required
                />
                <button
                  type="button"
                  onClick={() => setMostrarClave(!mostrarClave)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-blue-600 transition-colors focus:outline-none"
                >
                  {mostrarClave ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded-r-md">
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-11 rounded-lg text-sm font-bold shadow-md bg-[#0152cc] hover:bg-[#0043a8] text-white mt-2 transition-colors flex items-center justify-center group"
              disabled={cargando}
            >
              {cargando ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <>
                  Ingresar al Sistema
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>

            <div className="flex justify-center pt-2">
              <button
                type="button"
                onClick={() => setMostrarRecuperar(true)}
                className="text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Footer personalizado Mojisoft */}
      <div className="w-full text-center py-4 z-10 mt-auto">
        <p className="text-white/60 text-xs font-medium">
          Diseñado por <span className="font-bold text-white/80">Mojisoft</span> © {currentYear}. Todos los derechos reservados.
        </p>
      </div>

      {/* Modal Recuperar Contraseña */}
      <Dialog open={mostrarRecuperar} onOpenChange={setMostrarRecuperar}>
        <DialogContent className="sm:max-w-md bg-white border-none shadow-2xl rounded-2xl">
          <DialogHeader className="pt-2">
            <div className="mx-auto w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-4">
              <Mail className="h-6 w-6 text-blue-600" />
            </div>
            <DialogTitle className="text-xl text-center text-slate-800 font-bold">Recuperar Contraseña</DialogTitle>
            <DialogDescription className="text-center text-slate-500 pt-2">
              Ingresa tu correo y te enviaremos instrucciones para crear una nueva contraseña.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleRecuperar} className="space-y-4 py-4">
            <div className="space-y-2">
              <Input
                id="correoRecuperar"
                type="email"
                placeholder="usuario@ejemplo.com"
                value={correoRecuperar}
                onChange={(e) => setCorreoRecuperar(e.target.value)}
                className="bg-slate-50 border-slate-200 h-12 rounded-xl focus-visible:ring-blue-600 focus-visible:border-blue-600"
                required
              />
            </div>
            
            {mensajeRecuperar && (
              <div className={`p-3 rounded-lg text-sm font-medium ${mensajeRecuperar.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                {mensajeRecuperar}
              </div>
            )}
            
            <div className="flex justify-end space-x-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setMostrarRecuperar(false)} className="rounded-xl border-slate-200 text-slate-700 hover:bg-slate-100">
                Cancelar
              </Button>
              <Button type="submit" disabled={cargando} className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md">
                {cargando ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Enviar Enlace'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LoginPage;
