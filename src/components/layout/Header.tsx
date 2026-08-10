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
  const { usuario, logout, notificacionesNoLeidas, tema, configSistema } = useAuth();
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

  const getRolBadgeColor = (rol: string): string => {
    const colors: Record<string, string> = {
      pastor_principal: '#ef4444',
      administrador: '#6b7280',
      pastor: '#8b5cf6',
      lider_mentor: '#6366f1',
      lider_gap: '#3b82f6',
      timoteo: '#22c55e',
      monitor: '#eab308',
    };
    return colors[rol] || '#6b7280';
  };

  // Icono del sistema (configurable desde administrador)
  const SystemIcon = () => {
    if (configSistema?.loginLogo) {
      return (
        <img 
          src={configSistema.loginLogo} 
          alt="Logo" 
          className="w-5 h-5 object-contain"
        />
      );
    }
    return <Church className="w-5 h-5 text-white" />;
  };

  return (
    <header 
      className="text-white shadow-lg sticky top-0 z-50"
      style={{ background: `linear-gradient(135deg, ${tema.primario} 0%, ${tema.secundario} 100%)` }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Izquierda: Logo y botón volver */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={onVolverInicio}
              className="text-white/90 hover:text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            
            <div className="hidden md:flex items-center gap-3 border-l border-white/20 pl-3">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center overflow-hidden">
                <SystemIcon />
              </div>
              <div>
                <h1 className="font-semibold text-base leading-tight">
                  {configSistema?.loginTitulo || titulo || 'GRUPO AMIGOS IBC'}
                </h1>
                <p className="text-white/70 text-xs">
                  {subtitulo || getRolLabel(usuario.rol)}
                </p>
              </div>
            </div>
          </div>

          {/* Centro: Título móvil */}
          <div className="md:hidden flex items-center gap-2">
            <div className="w-6 h-6 flex items-center justify-center overflow-hidden">
              <SystemIcon />
            </div>
            <span className="font-semibold text-sm truncate max-w-[120px]">
              {configSistema?.loginTitulo || 'GRUPO AMIGOS'}
            </span>
          </div>

          {/* Derecha: Acciones */}
          <div className="flex items-center gap-1">
            {/* Mensajes */}
            {onMensajes && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onMensajes}
                className="relative text-white/90 hover:text-white hover:bg-white/10"
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
              className="relative text-white/90 hover:text-white hover:bg-white/10"
            >
              <Bell className="w-5 h-5" />
              {notificacionesNoLeidas > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 rounded-full text-[10px] flex items-center justify-center font-medium animate-pulse">
                  {notificacionesNoLeidas}
                </span>
              )}
            </Button>

            {/* Menú Usuario */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 text-white/90 hover:text-white hover:bg-white/10 px-2"
                >
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold overflow-hidden"
                    style={{ backgroundColor: 'rgba(255,255,255,0.25)' }}
                  >
                    {usuario.fotoPerfil ? (
                      <img src={usuario.fotoPerfil} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      `${usuario.nombre.charAt(0)}${usuario.apellidos?.charAt(0)}`
                    )}
                  </div>
                  <ChevronDown className="w-4 h-4 hidden sm:block" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{usuario.nombre} {usuario.apellidos}</p>
                    <p className="text-xs text-gray-500">{usuario.correo}</p>
                    <span 
                      className="text-[10px] px-2 py-0.5 rounded-full text-white w-fit mt-1"
                      style={{ backgroundColor: getRolBadgeColor(usuario.rol) }}
                    >
                      {getRolLabel(usuario.rol)}
                    </span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onConfiguracion}>
                  <Settings className="w-4 h-4 mr-2" />
                  Configuración
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-red-600">
                  <LogOut className="w-4 h-4 mr-2" />
                  Cerrar Sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Menú móvil completo */}
            <Sheet open={menuAbierto} onOpenChange={setMenuAbierto}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden text-white/90 hover:text-white hover:bg-white/10"
                >
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden"
                      style={{ background: `linear-gradient(135deg, ${tema.primario} 0%, ${tema.secundario} 100%)` }}
                    >
                      <SystemIcon />
                    </div>
                    Menú Principal
                  </SheetTitle>
                </SheetHeader>
                
                <div className="mt-6 space-y-4">
                  {/* Info usuario */}
                  <div className="p-4 rounded-xl" style={{ backgroundColor: `${tema.primario}10` }}>
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold overflow-hidden animate-fade-in"
                        style={{ background: `linear-gradient(135deg, ${tema.primario} 0%, ${tema.secundario} 100%)` }}
                      >
                        {usuario.fotoPerfil ? (
                          <img src={usuario.fotoPerfil} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          `${usuario.nombre.charAt(0)}${usuario.apellidos?.charAt(0)}`
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{usuario.nombre} {usuario.apellidos}</p>
                        <p className="text-sm text-gray-500 truncate">{usuario.correo}</p>
                        <span 
                          className="text-[10px] px-2 py-0.5 rounded-full text-white mt-1 inline-block"
                          style={{ backgroundColor: getRolBadgeColor(usuario.rol) }}
                        >
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
                  <div className="pt-4 border-t">
                    <Button 
                      variant="destructive" 
                      className="w-full"
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
    className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-100 transition-colors"
  >
    <div className="flex items-center gap-3">
      <Icon className="w-5 h-5 text-gray-600" />
      <span className="font-medium">{label}</span>
    </div>
    {badge !== undefined && badge > 0 && (
      <Badge variant="destructive" className="text-xs">{badge}</Badge>
    )}
  </button>
);

export default Header;
