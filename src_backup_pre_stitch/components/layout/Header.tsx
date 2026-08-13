import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  Church, 
  Settings, 
  Bell, 
  LogOut, 
  ChevronDown,
  Menu,
  MessageSquare
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

interface HeaderProps {
  onVolverInicio: () => void;
  onConfiguracion: () => void;
  onNotificaciones: () => void;
  onMensajes?: () => void;
  titulo?: string;
  subtitulo?: string;
}

const Header: React.FC<HeaderProps> = ({ 
  onVolverInicio, 
  onConfiguracion, 
  onNotificaciones,
  onMensajes,
  titulo,
  subtitulo 
}) => {
  const { usuario, logout, notificacionesNoLeidas, configSistema } = useAuth();
  const [menuAbierto, setMenuAbierto] = useState(false);
  
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
    <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Izquierda: Logo y botón volver */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={onVolverInicio}
              className="text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            
            <div className="flex flex-col">
              <h1 className="text-lg font-bold text-slate-800 tracking-tight flex items-center gap-2">
                <SystemIcon />
                {titulo || configSistema?.nombreIglesia || 'Sistema GAP'}
              </h1>
              {subtitulo && (
                <span className="text-xs font-medium text-slate-500">{subtitulo}</span>
              )}
            </div>
          </div>

          {/* Derecha: Acciones y Usuario */}
          <div className="flex items-center gap-1 sm:gap-2">
            
            {onMensajes && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onMensajes}
                className="text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                title="Centro de Mensajes"
              >
                <MessageSquare className="w-5 h-5" />
              </Button>
            )}

            {/* Notificaciones */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onNotificaciones}
              className="relative text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
            >
              <Bell className="w-5 h-5" />
              {notificacionesNoLeidas > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center font-bold text-white shadow-sm border border-white">
                  {notificacionesNoLeidas}
                </span>
              )}
            </Button>

            {/* Menú Usuario Desktop */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 px-2 hover:bg-slate-50 transition-colors ml-1"
                >
                  <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold overflow-hidden border border-blue-200">
                    {usuario.fotoPerfil ? (
                      <img src={usuario.fotoPerfil} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      `${usuario.nombre.charAt(0)}${usuario.apellidos?.charAt(0) || ''}`
                    )}
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 bg-white border-slate-200 shadow-xl rounded-xl">
                <DropdownMenuLabel className="font-normal p-3">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-bold text-slate-800">{usuario.nombre} {usuario.apellidos}</p>
                    <p className="text-xs text-slate-500 font-medium">{usuario.correo}</p>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-100 w-fit mt-2 font-bold uppercase tracking-wider">
                      {getRolLabel(usuario.rol)}
                    </span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-slate-100" />
                <DropdownMenuItem onClick={onConfiguracion} className="p-2 cursor-pointer hover:bg-slate-50">
                  <Settings className="w-4 h-4 mr-3 text-slate-500" />
                  <span className="font-medium text-slate-700">Configuración</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-slate-100" />
                <DropdownMenuItem onClick={logout} className="p-2 cursor-pointer text-red-600 hover:bg-red-50 hover:text-red-700 focus:bg-red-50">
                  <LogOut className="w-4 h-4 mr-3" />
                  <span className="font-bold">Cerrar Sesión</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Menú móvil completo */}
            <Sheet open={menuAbierto} onOpenChange={setMenuAbierto}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors ml-1"
                >
                  <Menu className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 bg-white border-l border-slate-200">
                <SheetHeader className="text-left">
                  <SheetTitle className="flex items-center gap-2 text-slate-800 border-b border-slate-100 pb-4">
                    <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center border border-blue-100">
                      <SystemIcon />
                    </div>
                    Menú Principal
                  </SheetTitle>
                </SheetHeader>
                
                <div className="mt-6 space-y-4">
                  {/* Info usuario */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-700 text-lg font-bold overflow-hidden shadow-sm">
                        {usuario.fotoPerfil ? (
                          <img src={usuario.fotoPerfil} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          `${usuario.nombre.charAt(0)}${usuario.apellidos?.charAt(0) || ''}`
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-800 truncate">{usuario.nombre} {usuario.apellidos}</p>
                        <p className="text-xs font-medium text-slate-500 truncate">{usuario.correo}</p>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200 mt-1 inline-block font-bold">
                          {getRolLabel(usuario.rol)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Opciones */}
                  <nav className="space-y-1">
                    <MobileMenuItem 
                      icon={ArrowLeft} 
                      label="Volver al Inicio" 
                      onClick={() => { onVolverInicio(); setMenuAbierto(false); }} 
                    />
                    <MobileMenuItem 
                      icon={Settings} 
                      label="Configuración" 
                      onClick={() => { onConfiguracion(); setMenuAbierto(false); }} 
                    />
                    <MobileMenuItem 
                      icon={Bell} 
                      label="Notificaciones" 
                      onClick={() => { onNotificaciones(); setMenuAbierto(false); }} 
                      badge={notificacionesNoLeidas} 
                    />
                  </nav>

                  {/* Cerrar sesión */}
                  <div className="pt-4 border-t border-slate-100 mt-auto">
                    <Button 
                      variant="destructive" 
                      className="w-full rounded-xl font-bold bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 border-none shadow-none"
                      onClick={() => { logout(); setMenuAbierto(false); }}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Cerrar Sesión
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};

interface MobileMenuItemProps {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  badge?: number;
}

const MobileMenuItem: React.FC<MobileMenuItemProps> = ({ icon: Icon, label, onClick, badge }) => (
  <button
    onClick={onClick}
    className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-blue-50 text-slate-700 hover:text-blue-700 transition-all font-medium group"
  >
    <div className="flex items-center gap-3">
      <Icon className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors" />
      <span>{label}</span>
    </div>
    {badge !== undefined && badge > 0 && (
      <Badge className="bg-red-500 text-white border-none text-[10px] px-1.5 min-w-[20px] flex justify-center">{badge}</Badge>
    )}
  </button>
);

export default Header;
