import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  Church
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface HeaderProps {
  onVolverInicio: () => void;
  onConfiguracion: () => void;
  onNotificaciones: () => void;
  titulo?: string;
}

const Header: React.FC<HeaderProps> = ({ 
  onVolverInicio, 
  onConfiguracion, 
  onNotificaciones,
  titulo
}) => {
  const { usuario, logout, notificacionesNoLeidas, configSistema } = useAuth();
  
  if (!usuario) return null;

  const getRolLabel = (rol: string): string => {
    const labels: Record<string, string> = {
      pastor_principal: 'Pastor Principal',
      administrador: 'Administrador',
      pastor: 'Pastor',
      lider_mentor: 'Líder Mentor',
      lider_gap: 'Líder GAP',
      timoteo: 'Timoteo',
      monitor: 'Monitor',
    };
    return labels[rol] || rol;
  };

  // Icono del sistema
  const SystemIcon = () => {
    if (configSistema?.loginLogo) {
      return (
        <img 
          src={configSistema.loginLogo} 
          alt="Logo" 
          className="w-full h-full object-contain"
        />
      );
    }
    return <Church className="w-6 h-6 text-emerald-600" />;
  };

  return (
    <header className="flex justify-between items-center px-4 md:px-6 h-16 w-full fixed top-0 z-50 bg-white/85 backdrop-blur-xl border-b border-slate-200/60 shadow-sm transition-all duration-300">
      <div className="flex items-center gap-1 md:gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onVolverInicio}
          className="w-10 h-10 rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all duration-200 hover:scale-105 active:scale-95"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex items-center gap-3 ml-1">
          <div className="w-10 h-10 rounded-xl bg-white shadow-sm border border-slate-100 p-1.5 flex items-center justify-center overflow-hidden transition-transform duration-300 hover:scale-105">
             <SystemIcon />
          </div>
          <div className="flex flex-col">
            <h1 className="text-[20px] leading-tight font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-700 tracking-tight">
              {titulo || configSistema?.nombreIglesia || 'G.A.P'}
            </h1>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onNotificaciones}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-all duration-200 hover:scale-105 active:scale-95 relative"
        >
          <span className="material-symbols-outlined text-[24px]">notifications</span>
          {notificacionesNoLeidas > 0 && (
            <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center font-bold text-white shadow-sm ring-2 ring-white">
              {notificacionesNoLeidas}
            </span>
          )}
        </Button>

        {/* Menú Usuario Desktop / Mobile (Settings) */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 hover:shadow-md transition-all duration-200 hover:scale-105 active:scale-95 overflow-hidden border-2 border-transparent hover:border-slate-200 p-0"
            >
              {usuario.fotoPerfil ? (
                <img src={usuario.fotoPerfil} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-sm">
                  {usuario.nombre.charAt(0)}{usuario.apellidos?.charAt(0) || ''}
                </div>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 bg-white border-slate-200 shadow-xl rounded-xl p-1">
            <DropdownMenuLabel className="font-normal p-3">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-bold text-slate-800">{usuario.nombre} {usuario.apellidos}</p>
                <p className="text-xs text-slate-500 font-medium">{usuario.correo}</p>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold uppercase tracking-wider w-fit mt-2 border border-emerald-100">
                  {getRolLabel(usuario.rol)}
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-slate-100" />
            <DropdownMenuItem onClick={onConfiguracion} className="p-3 cursor-pointer hover:bg-slate-50 rounded-lg text-slate-700 font-medium transition-colors focus:bg-slate-50 focus:text-slate-900 mx-1 my-1">
              <span className="material-symbols-outlined mr-3 text-[20px] text-slate-500">settings</span>
              Configuración
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-slate-100" />
            <DropdownMenuItem onClick={logout} className="p-3 cursor-pointer text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg font-bold transition-colors focus:bg-red-50 focus:text-red-700 mx-1 my-1">
              <span className="material-symbols-outlined mr-3 text-[20px]">logout</span>
              Cerrar Sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};



export default Header;
