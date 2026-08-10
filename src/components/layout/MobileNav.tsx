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
  const { usuario, tienePermiso, tema } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  if (!usuario) return null;

  const esTimoteo = usuario?.rol === 'timoteo';
  const esAdmin = usuario?.rol === 'administrador';
  const esLider = usuario?.rol === 'lider_gap';
  const esLiderMentor = usuario?.rol === 'lider_mentor';
  const esPastor = usuario?.rol === 'pastor';

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
      {/* Navegación Principal */}
      <nav className="mobile-menu lg:hidden">
        <div className="flex justify-around items-center">
          {itemsPrincipal.map((item) => {
            const Icon = item.icon;
            const isActive = vistaActual === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onNavegar(item.id)}
                className={cn(
                  'mobile-menu-item flex flex-col items-center justify-center py-2 px-2',
                  isActive && 'text-primary'
                )}
                style={{ color: isActive ? tema.primario : undefined }}
              >
                <div className={cn(
                  'p-1.5 rounded-xl transition-all',
                  isActive && 'bg-primary/10'
                )}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-medium mt-0.5">{item.label}</span>
              </button>
            );
          })}

          {/* Botón Menú Extendido */}
          {!esAdmin && itemsExtendido.length > 0 && (
            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
              <SheetTrigger asChild>
                <button
                  className={cn(
                    'mobile-menu-item flex flex-col items-center justify-center py-2 px-2',
                    menuOpen && 'text-primary'
                  )}
                  style={{ color: menuOpen ? tema.primario : undefined }}
                >
                  <div className={cn(
                    'p-1.5 rounded-xl transition-all',
                    menuOpen && 'bg-primary/10'
                  )}>
                    <Menu className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-medium mt-0.5">Más</span>
                </button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-auto max-h-[70vh]">
                <SheetHeader>
                  <SheetTitle className="text-left flex items-center gap-2">
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${tema.primario}15` }}
                    >
                      <Menu className="w-4 h-4" style={{ color: tema.primario }} />
                    </div>
                    Más Opciones
                  </SheetTitle>
                </SheetHeader>
                <div className="grid grid-cols-3 gap-3 mt-6">
                  {itemsExtendido.map((item) => {
                    const Icon = item.icon;
                    const isActive = vistaActual === item.id;
                    
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleNavigate(item.id)}
                        className={cn(
                          'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all',
                          isActive 
                            ? 'border-primary bg-primary/5' 
                            : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                        )}
                        style={{ 
                          borderColor: isActive ? tema.primario : undefined,
                          backgroundColor: isActive ? `${tema.primario}10` : undefined
                        }}
                      >
                        <div 
                          className="w-10 h-10 rounded-xl flex items-center justify-center"
                          style={{ backgroundColor: isActive ? `${tema.primario}20` : '#f3f4f6' }}
                        >
                          <Icon 
                            className="w-5 h-5" 
                            style={{ color: isActive ? tema.primario : '#6b7280' }} 
                          />
                        </div>
                        <span className={cn(
                          'text-xs font-medium',
                          isActive ? 'text-primary' : 'text-gray-600'
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
        </div>
      </nav>
    </>
  );
};

export default MobileNav;
