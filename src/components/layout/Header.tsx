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
          className="w-6 h-6 object-contain"
        />
      );
    }
    return <Church className="w-6 h-6 text-blue-600" />;
  };

  return (
    <header className="flex justify-between items-center px-margin-mobile h-16 w-full fixed top-0 z-50 glass-panel border-b border-outline-variant/30">
      <div className="flex items-center gap-sm">
        <Button
          variant="ghost"
          size="icon"
          onClick={onVolverInicio}
          className="text-on-surface-variant hover:text-primary transition-colors mr-1"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-white p-1 shadow-sm flex items-center justify-center">
             <SystemIcon />
          </div>
          <div className="flex flex-col">
            <h1 className="text-[20px] leading-[28px] font-bold text-primary tracking-tight">
              {titulo || configSistema?.nombreIglesia || 'G.A.P'}
            </h1>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={onNotificaciones}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-variant transition-colors text-on-surface relative"
        >
          <span className="material-symbols-outlined">notifications</span>
          {notificacionesNoLeidas > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-error rounded-full text-[10px] flex items-center justify-center font-bold text-on-error shadow-sm">
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
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-variant transition-colors overflow-hidden border border-outline-variant/30"
            >
              {usuario.fotoPerfil ? (
                <img src={usuario.fotoPerfil} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="font-bold text-primary">{usuario.nombre.charAt(0)}{usuario.apellidos?.charAt(0) || ''}</span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 bg-surface border-outline-variant/30 shadow-xl rounded-xl">
            <DropdownMenuLabel className="font-normal p-3">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-bold text-on-surface">{usuario.nombre} {usuario.apellidos}</p>
                <p className="text-xs text-on-surface-variant font-medium">{usuario.correo}</p>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-primary-container text-on-primary-container w-fit mt-2 font-bold uppercase tracking-wider">
                  {getRolLabel(usuario.rol)}
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-surface-variant" />
            <DropdownMenuItem onClick={onConfiguracion} className="p-3 cursor-pointer hover:bg-surface-variant transition-colors text-on-surface">
              <span className="material-symbols-outlined mr-3">settings</span>
              <span className="font-medium">Configuración</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-surface-variant" />
            <DropdownMenuItem onClick={logout} className="p-3 cursor-pointer text-error hover:bg-error-container hover:text-on-error-container transition-colors">
              <span className="material-symbols-outlined mr-3">logout</span>
              <span className="font-bold">Cerrar Sesión</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};



export default Header;
