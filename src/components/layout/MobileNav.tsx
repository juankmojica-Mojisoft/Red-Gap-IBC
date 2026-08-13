import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  Home, 
  Users, 
  MapPin, 
  TrendingUp, 
  MessageSquare, 
  BarChart3,
  Settings,
  Menu,
  ClipboardCheck,
  Calendar,
  BookOpen,
  Video,
  UserPlus,
  Crown
} from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

interface MobileNavProps {
  vistaActual: string;
  onNavegar: (vista: string) => void;
}

const MobileNav: React.FC<MobileNavProps> = ({ vistaActual, onNavegar }) => {
  const { usuario, tienePermiso } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  if (!usuario) return null;

  const esTimoteo = usuario?.rol === 'timoteo';
  const esAdmin = usuario?.rol === 'administrador';
  const esLider = usuario?.rol === 'lider_gap';
  const esLiderMentor = usuario?.rol === 'lider_mentor';
  const esPastor = usuario?.rol === 'pastor';
  const esPastorPrincipal = usuario?.rol === 'pastor_principal';

  // Menú principal para Timoteo (personalizado)
  const menuTimoteoPrincipal = [
    { id: 'dashboard', label: 'Inicio', icon: Home },
    { id: 'asistencia', label: 'Asistencia', icon: ClipboardCheck },
    { id: 'calendario', label: 'Eventos', icon: Calendar },
    { id: 'mensajes', label: 'Chat', icon: MessageSquare },
  ];

  // Menú extendido para Timoteo
  const menuTimoteoExtendido = [
    { id: 'miembros', label: 'Miembros', icon: Users },
    { id: 'ensenanza', label: 'Material', icon: BookOpen },
    { id: 'videollamada', label: 'Video', icon: Video },
    { id: 'configuracion', label: 'Config', icon: Settings },
  ];

  // Menú extendido para Líder (con Agregar Integrante)
  const menuLiderExtendido = [
    { id: 'agregar-integrante', label: 'Agregar', icon: UserPlus },
    { id: 'asistencia', label: 'Asistencia', icon: ClipboardCheck },
    { id: 'miembros', label: 'Integrantes', icon: Users },
    { id: 'escalamientos', label: 'Casos', icon: TrendingUp },
    { id: 'peticiones-oracion', label: 'Oración', icon: MessageSquare },
    { id: 'calendario', label: 'Calendario', icon: Calendar },
    { id: 'ensenanza', label: 'Material', icon: BookOpen },
    { id: 'videollamada', label: 'Video', icon: Video },
    { id: 'configuracion', label: 'Config', icon: Settings },
  ];

  // Menú extendido para Líder Mentor
  const menuLiderMentorExtendido = [
    { id: 'agregar-integrante', label: 'Agregar', icon: UserPlus },
    { id: 'crear-usuario', label: 'Crear Rol', icon: Crown },
    { id: 'miembros', label: 'Integrantes', icon: Users },
    { id: 'supervision', label: 'Supervisar', icon: BarChart3 },
    { id: 'gaps', label: 'GAPs', icon: MapPin },
    { id: 'escalamientos', label: 'Casos', icon: TrendingUp },
    { id: 'peticiones-oracion', label: 'Oración', icon: MessageSquare },
    { id: 'calendario', label: 'Calendario', icon: Calendar },
    { id: 'ensenanza', label: 'Material', icon: BookOpen },
    { id: 'videollamada', label: 'Video', icon: Video },
    { id: 'configuracion', label: 'Config', icon: Settings },
  ];

  // Menú extendido para Pastor
  const menuPastorExtendido = [
    { id: 'ver-integrantes', label: 'Integrantes', icon: Users },
    { id: 'red-gap', label: 'Mi Red', icon: BarChart3 },
    { id: 'crear-usuario', label: 'Crear Rol', icon: Crown },
    { id: 'gaps', label: 'GAPs', icon: MapPin },
    { id: 'escalamientos', label: 'Casos', icon: TrendingUp },
    { id: 'peticiones-pastor', label: 'Oración', icon: MessageSquare },
    { id: 'calendario', label: 'Calendario', icon: Calendar },
    { id: 'ensenanza-pastor', label: 'Material', icon: BookOpen },
    { id: 'videollamada', label: 'Video', icon: Video },
    { id: 'reportes', label: 'Reportes', icon: BarChart3 },
    { id: 'configuracion', label: 'Config', icon: Settings },
  ];

  // Menú extendido para Pastor Principal
  const menuPastorPrincipalExtendido = [
    { id: 'integrantes-pastor-principal', label: 'Liderazgo', icon: Users },
    { id: 'red-gap', label: 'Red Global', icon: BarChart3 },
    { id: 'crear-usuario', label: 'Crear Rol', icon: Crown },
    { id: 'gaps', label: 'GAPs', icon: MapPin },
    { id: 'escalamientos', label: 'Casos', icon: TrendingUp },
    { id: 'peticiones-pastor', label: 'Oración', icon: MessageSquare },
    { id: 'calendario', label: 'Calendario', icon: Calendar },
    { id: 'ensenanza-pastor', label: 'Material', icon: BookOpen },
    { id: 'videollamada-pastor-principal', label: 'Video', icon: Video },
    { id: 'reportes-pastor-principal', label: 'Reportes', icon: BarChart3 },
    { id: 'configuracion', label: 'Config', icon: Settings },
  ];

  // Menú principal estándar (máximo 4 items visibles)
  const menuPrincipal = [
    { id: 'dashboard', label: 'Inicio', icon: Home },
    { id: 'gaps', label: 'GAPs', icon: MapPin, permiso: 'verGAPs' },
    { id: 'escalamientos', label: 'Casos', icon: TrendingUp, permiso: 'verEscalamientos' },
    { id: 'mensajes', label: 'Chat', icon: MessageSquare, permiso: 'enviarMensaje' },
  ];

  // Menú extendido estándar (en el drawer)
  const menuExtendido = [
    { id: 'usuarios', label: 'Usuarios', icon: Users, permiso: 'verUsuarios' },
    { id: 'miembros', label: 'Miembros', icon: Users, permiso: 'verMiembros' },
    { id: 'asistencia', label: 'Asistencia', icon: ClipboardCheck, permiso: 'crearMiembro' },
    { id: 'calendario', label: 'Calendario', icon: Calendar, permiso: 'verReportes' },
    { id: 'ensenanza', label: 'Material', icon: BookOpen, permiso: 'verReportes' },
    { id: 'videollamada', label: 'Video', icon: Video, permiso: 'verGAPs' },
    { id: 'reportes', label: 'Reportes', icon: BarChart3, permiso: 'verReportes' },
    { id: 'configuracion', label: 'Config', icon: Settings, permiso: 'cambiarTema' },
  ];

  // Menú para administrador
  const menuAdmin = [
    { id: 'dashboard', label: 'Inicio', icon: Home },
    { id: 'admin-config', label: 'Sistema', icon: Settings, permiso: 'configurarSistema' },
  ];

  // Seleccionar menú según rol
  let itemsPrincipal;
  let itemsExtendido;

  if (esAdmin) {
    itemsPrincipal = menuAdmin;
    itemsExtendido = [];
  } else if (esTimoteo) {
    itemsPrincipal = menuTimoteoPrincipal;
    itemsExtendido = menuTimoteoExtendido;
  } else if (esPastorPrincipal) {
    itemsPrincipal = menuPrincipal.filter(item => {
      if (!item.permiso) return true;
      return tienePermiso(item.permiso);
    });
    itemsExtendido = menuPastorPrincipalExtendido;
  } else if (esPastor) {
    itemsPrincipal = menuPrincipal.filter(item => {
      if (!item.permiso) return true;
      return tienePermiso(item.permiso);
    });
    itemsExtendido = menuPastorExtendido;
  } else if (esLiderMentor) {
    itemsPrincipal = menuPrincipal.filter(item => {
      if (!item.permiso) return true;
      return tienePermiso(item.permiso);
    });
    itemsExtendido = menuLiderMentorExtendido;
  } else if (esLider) {
    itemsPrincipal = menuPrincipal.filter(item => {
      if (!item.permiso) return true;
      return tienePermiso(item.permiso);
    });
    itemsExtendido = menuLiderExtendido;
  } else {
    itemsPrincipal = menuPrincipal.filter(item => {
      if (!item.permiso) return true;
      return tienePermiso(item.permiso);
    });
    itemsExtendido = menuExtendido.filter(item => {
      if (!item.permiso) return true;
      return tienePermiso(item.permiso);
    });
  }

  const handleNavigate = (vista: string) => {
    onNavegar(vista);
    setMenuOpen(false);
  };

  return (
    <>
      {/* Navegación Principal Bottom Bar (Stitch Professional Blue) */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center pt-2 pb-safe px-4 glass-panel border-t border-outline-variant/30 lg:hidden bg-surface/90">
          {itemsPrincipal.map((item) => {
            const Icon = item.icon;
            const isActive = vistaActual === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onNavegar(item.id)}
                className={cn(
                  'flex flex-col items-center justify-center transition-colors py-2',
                  isActive ? 'text-primary scale-110 transition-all' : 'text-on-surface-variant hover:text-primary'
                )}
                style={isActive ? { WebkitTapHighlightColor: 'transparent' } : {}}
              >
                <Icon className="w-6 h-6 mb-1" />
                <span className="text-label-sm font-label-sm mt-0.5">
                  {item.label}
                </span>
              </button>
            );
          })}

          {/* Botón Menú Extendido (Sheet) */}
          {!esAdmin && itemsExtendido.length > 0 && (
            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
              <SheetTrigger asChild>
                <button
                  className={cn(
                    'flex flex-col items-center justify-center transition-colors py-2',
                    menuOpen ? 'text-primary scale-110 transition-all' : 'text-on-surface-variant hover:text-primary'
                  )}
                  style={menuOpen ? { WebkitTapHighlightColor: 'transparent' } : {}}
                >
                  <Menu className="w-6 h-6 mb-1" />
                  <span className="text-label-sm font-label-sm mt-0.5">
                    Más
                  </span>
                </button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[80vh] bg-surface rounded-t-[24px] border-t border-outline-variant/30">
                <SheetHeader className="pb-4 border-b border-outline-variant/30 text-left">
                  <SheetTitle className="text-headline-md font-bold text-on-surface flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary-container/10 flex items-center justify-center border border-primary-container/20">
                      <Menu className="w-5 h-5 text-primary" />
                    </div>
                    Menú Completo
                  </SheetTitle>
                </SheetHeader>
                
                <div className="grid grid-cols-3 gap-4 pt-6 overflow-y-auto pb-8 custom-scrollbar">
                  {itemsExtendido.map((item) => {
                    const Icon = item.icon;
                    const isActive = vistaActual === item.id;
                    
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleNavigate(item.id)}
                        className={cn(
                          'flex flex-col items-center justify-center p-3 rounded-[16px] transition-all shadow-sm border',
                          isActive 
                            ? 'bg-primary-container/10 border-primary-container/30' 
                            : 'bg-surface border-outline-variant/30 hover:bg-surface-variant'
                        )}
                      >
                        <div className={cn(
                          'w-10 h-10 rounded-full flex items-center justify-center mb-2',
                          isActive ? 'bg-primary-container text-on-primary-container' : 'bg-surface-variant text-on-surface-variant'
                        )}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className={cn(
                          "text-label-sm text-center",
                          isActive ? "text-primary font-bold" : "text-on-surface font-medium"
                        )}>
                          {item.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </SheetContent>
            </Sheet>
          )}
      </nav>
    </>
  );
};

export default MobileNav;
