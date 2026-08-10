import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import LoginPage from '@/components/login/LoginPage';
import Header from '@/components/layout/Header';
import MobileNav from '@/components/layout/MobileNav';
import DashboardPastorPrincipal from '@/components/dashboard/DashboardPastorPrincipal';
import DashboardMentorPastor from '@/components/dashboard/DashboardMentorPastor';
import DashboardLiderMentor from '@/components/dashboard/DashboardLiderMentor';
import DashboardLiderGAP from '@/components/dashboard/DashboardLiderGAP';
import DashboardTimoteo from '@/components/dashboard/DashboardTimoteo';
import DashboardAdmin from '@/components/dashboard/DashboardAdmin';
import CrearUsuarioForm from '@/components/forms/CrearUsuarioForm';
import GestionGAPForm from '@/components/forms/GestionGAPForm';
import EscalamientoForm from '@/components/forms/EscalamientoForm';
import AgregarIntegranteForm from '@/components/forms/AgregarIntegranteForm';
import ConfiguracionModal from '@/components/modals/ConfiguracionModal';
import AdminConfigPanel from '@/components/admin/AdminConfigPanel';
import GestionUsuariosAdmin from '@/components/admin/GestionUsuariosAdmin';
import CuestionariosModule from '@/components/modules/CuestionariosModule';
import ReportesModule from '@/components/modules/ReportesModule';
import MensajesModule from '@/components/modules/MensajesModule';
import DatosModule from '@/components/modules/DatosModule';
import CalendarioModule from '@/components/modules/CalendarioModule';
import EnsenanzaModule from '@/components/modules/EnsenanzaModule';
import PeticionesOracionModule from '@/components/modules/PeticionesOracionModule';
import AsistenciaModule from '@/components/modules/AsistenciaModule';
import VideollamadaModule from '@/components/modules/VideollamadaModule';
import ListaGAPs from '@/components/lists/ListaGAPs';
import ListaUsuarios from '@/components/lists/ListaUsuarios';
import ListaMiembros from '@/components/lists/ListaMiembros';
import SupervisionModule from '@/components/modules/SupervisionModule';
import VerIntegrantesPastorModule from '@/components/modules/VerIntegrantesPastorModule';
import RedGAPPastorModule from '@/components/modules/RedGAPPastorModule';
import EnsenanzaPastorModule from '@/components/modules/EnsenanzaPastorModule';
import PeticionesOracionPastorModule from '@/components/modules/PeticionesOracionPastorModule';
import NotificacionesModule from '@/components/modules/NotificacionesModule';
import IntegrantesPastorPrincipalModule from '@/components/modules/IntegrantesPastorPrincipalModule';
import ReportesPastorPrincipalModule from '@/components/modules/ReportesPastorPrincipalModule';
import VideollamadaPastorPrincipalModule from '@/components/modules/VideollamadaPastorPrincipalModule';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import type { GAP, MiembroGAP } from '@/types';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  Users, 
  MapPin, 
  Calendar, 
  Heart, 
  BarChart3, 
  Settings,
  Bell,
  MessageSquare
} from 'lucide-react';

type Vista = 
  | 'dashboard' 
  | 'usuarios'
  | 'crear-usuario'
  | 'gaps'
  | 'crear-gap'
  | 'miembros'
  | 'crear-miembro'
  | 'agregar-integrante'
  | 'escalamientos'
  | 'crear-escalamiento'
  | 'zonas'
  | 'mensajes'
  | 'reportes'
  | 'datos'
  | 'configuracion'
  | 'admin-config'
  | 'notificaciones'
  | 'supervision'
  | 'calendario'
  | 'ensenanza'
  | 'peticiones-oracion'
  | 'asistencia'
  | 'videollamada'
  | 'ver-integrantes'
  | 'red-gap'
  | 'ensenanza-pastor'
  | 'peticiones-pastor'
  | 'integrantes-pastor-principal'
  | 'reportes-pastor-principal'
  | 'videollamada-pastor-principal'
  | 'cuestionarios'
  | 'gestion-usuarios';

const AppContent: React.FC = () => {
  const { usuario, estaAutenticado, tema, tienePermiso, logout, notificacionesNoLeidas, marcarNotificacionesLeidas } = useAuth();
  const [vistaActual, setVistaActual] = useState<Vista>('dashboard');
  const [escalamientoVer, setEscalamientoVer] = useState<any>(null);
  const [gapEditar, setGapEditar] = useState<GAP | null>(null);
  const [miembroEditar, setMiembroEditar] = useState<MiembroGAP | null>(null);
  const [adminConfigTab, setAdminConfigTab] = useState('login');

  // Aplicar tema dinámico
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--color-primario', tema.primario);
    root.style.setProperty('--color-secundario', tema.secundario);
    root.style.setProperty('--color-fondo', tema.fondo);
    root.style.setProperty('--color-texto', tema.texto);
    root.style.setProperty('--color-exito', tema.exito);
    root.style.setProperty('--color-advertencia', tema.advertencia);
    root.style.setProperty('--color-error', tema.error);
    root.style.setProperty('--color-info', tema.info);

    const isDark = tema.oscuro !== false; // Por defecto oscuro es true

    if (isDark) {
      root.classList.add('dark-theme');
      root.classList.remove('light-theme');
    } else {
      root.classList.add('light-theme');
      root.classList.remove('dark-theme');
    }

    // Convertir color primario a variables RGBA translúcidas dinámicas
    try {
      const hex = tema.primario;
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      
      if (isDark) {
        root.style.setProperty('--color-primario-trans', `rgba(${r}, ${g}, ${b}, 0.15)`);
        root.style.setProperty('--color-primario-border', `rgba(${r}, ${g}, ${b}, 0.3)`);
        
        // Mezclar con un fondo muy oscuro para la tarjeta de vidrio
        const cardBg = `rgba(${Math.round(r * 0.05)}, ${Math.round(g * 0.05)}, ${Math.round(b * 0.05)}, 0.65)`;
        root.style.setProperty('--color-card-glass', cardBg);

        // Mezclar con un fondo muy oscuro para el gradiente de fondo
        const mainBg = `radial-gradient(circle at 50% 50%, rgba(${Math.round(r * 0.03)}, ${Math.round(g * 0.03)}, ${Math.round(b * 0.03)}, 1) 0%, #030a08 100%)`;
        root.style.setProperty('--color-main-bg', mainBg);
      } else {
        root.style.setProperty('--color-primario-trans', `rgba(${r}, ${g}, ${b}, 0.08)`);
        root.style.setProperty('--color-primario-border', `rgba(${r}, ${g}, ${b}, 0.15)`);
        
        // Vidrio claro translúcido
        root.style.setProperty('--color-card-glass', 'rgba(255, 255, 255, 0.75)');

        // Gradiente radial claro elegante
        const mainBg = `radial-gradient(circle at 50% 50%, rgba(${r}, ${g}, ${b}, 0.04) 0%, #f1f5f9 100%)`;
        root.style.setProperty('--color-main-bg', mainBg);
      }
    } catch (e) {
      console.error('Error calculating dynamic theme colors:', e);
      if (isDark) {
        root.style.setProperty('--color-primario-trans', 'rgba(143, 164, 54, 0.15)');
        root.style.setProperty('--color-primario-border', 'rgba(143, 164, 54, 0.3)');
        root.style.setProperty('--color-card-glass', 'rgba(18, 34, 26, 0.65)');
        root.style.setProperty('--color-main-bg', 'radial-gradient(circle at 50% 50%, #0c1612 0%, #030a08 100%)');
      } else {
        root.style.setProperty('--color-primario-trans', 'rgba(143, 164, 54, 0.08)');
        root.style.setProperty('--color-primario-border', 'rgba(143, 164, 54, 0.15)');
        root.style.setProperty('--color-card-glass', 'rgba(255, 255, 255, 0.75)');
        root.style.setProperty('--color-main-bg', 'radial-gradient(circle at 50% 50%, #f9fafb 0%, #f3f4f6 100%)');
      }
    }
  }, [tema]);

  const handleLoginSuccess = () => {
    setVistaActual('dashboard');
  };

  const handleVolverInicio = () => {
    setVistaActual('dashboard');
    setEscalamientoVer(null);
  };

  const handleConfiguracion = () => {
    setVistaActual('configuracion');
  };

  const handleNotificaciones = () => {
    marcarNotificacionesLeidas();
    setVistaActual('notificaciones');
  };

  const handleCuestionarios = () => {
    setVistaActual('cuestionarios');
  };

  const handleGestionUsuarios = () => {
    setVistaActual('gestion-usuarios');
  };

  const handleNavegar = (vista: string) => {
    // Verificar permisos antes de navegar
    let cleanVista = vista;
    let tab = 'login';
    if (vista.startsWith('admin-config:')) {
      const parts = vista.split(':');
      cleanVista = parts[0];
      tab = parts[1];
    }

    const permisosRequeridos: Record<string, string[]> = {
      'usuarios': ['verUsuarios'],
      'crear-usuario': ['crearUsuario'],
      'gaps': ['verGAPs'],
      'crear-gap': ['crearGAP'],
      'miembros': ['verMiembros'],
      'crear-miembro': ['crearMiembro'],
      'agregar-integrante': ['crearMiembro'],
      'escalamientos': ['verEscalamientos'],
      'crear-escalamiento': ['crearEscalamiento'],
      'zonas': ['verZonas'],
      'mensajes': ['enviarMensaje'],
      'reportes': ['verReportes'],
      'datos': ['verReportes'],
      'admin-config': ['configurarSistema'],
      'calendario': ['verReportes', 'enviarMensaje'],
      'ensenanza': ['verReportes', 'enviarMensaje'],
      'peticiones-oracion': ['crearEscalamiento'],
      'asistencia': ['crearMiembro'],
      'videollamada': ['verGAPs', 'enviarMensaje'],
      'ver-integrantes': ['verMiembros'],
      'red-gap': ['verGAPs'],
      'ensenanza-pastor': ['verReportes'],
      'peticiones-pastor': ['verEscalamientos'],
      'integrantes-pastor-principal': ['verUsuarios'],
      'reportes-pastor-principal': ['verReportes'],
      'videollamada-pastor-principal': ['verGAPs'],
      'cuestionarios': ['configurarSistema'],
      'gestion-usuarios': ['verUsuarios', 'editarUsuario'],
    };

    const permisos = permisosRequeridos[cleanVista];
    if (permisos && !permisos.some(p => tienePermiso(p))) {
      toast.error('No Tiene Permisos Para Acceder A Esta Sección');
      return;
    }

    if (cleanVista === 'admin-config') {
      setAdminConfigTab(tab);
    }

    let targetVista = cleanVista;
    if (usuario?.rol === 'pastor_principal') {
      if (cleanVista === 'reportes') {
        targetVista = 'reportes-pastor-principal';
      } else if (cleanVista === 'miembros') {
        targetVista = 'integrantes-pastor-principal';
      } else if (cleanVista === 'videollamada') {
        targetVista = 'videollamada-pastor-principal';
      }
    }

    setVistaActual(targetVista as Vista);
    setEscalamientoVer(null);
  };

  const handleExito = (mensaje: string) => {
    toast.success(mensaje);
    setVistaActual('dashboard');
    setEscalamientoVer(null);
  };

  const renderDashboard = () => {
    if (!usuario) return null;

    switch (usuario.rol) {
      case 'pastor_principal':
        return <DashboardPastorPrincipal onNavegar={handleNavegar} />;
      case 'administrador':
        return <DashboardAdmin onNavegar={handleNavegar} />;
      case 'pastor':
        return <DashboardMentorPastor onNavegar={handleNavegar} />;
      case 'lider_mentor':
        return <DashboardLiderMentor onNavegar={handleNavegar} />;
      case 'lider_gap':
        return <DashboardLiderGAP onNavegar={handleNavegar} />;
      case 'timoteo':
        return <DashboardTimoteo onNavegar={handleNavegar} />;
      case 'facilitador':
        return <DashboardLiderGAP onNavegar={handleNavegar} />;
      default:
        return <DashboardLiderGAP onNavegar={handleNavegar} />;
    }
  };

  const renderContenido = () => {
    switch (vistaActual) {
      case 'dashboard':
        return renderDashboard();
      case 'crear-usuario':
        return (
          <CrearUsuarioForm 
            onVolver={handleVolverInicio}
            onExito={() => handleExito('Usuario creado exitosamente')}
          />
        );
      case 'crear-gap':
        return (
          <GestionGAPForm 
            onVolver={() => {
              setGapEditar(null);
              setVistaActual('gaps');
            }}
            onExito={() => {
              setGapEditar(null);
              handleExito(gapEditar ? 'GAP actualizado exitosamente' : 'GAP creado exitosamente');
            }}
            gapEditar={gapEditar || undefined}
          />
        );
      case 'crear-escalamiento':
        return (
          <EscalamientoForm 
            onVolver={handleVolverInicio}
            onExito={() => handleExito('Caso creado exitosamente')}
          />
        );
      case 'escalamientos':
        return escalamientoVer ? (
          <EscalamientoForm 
            onVolver={() => setEscalamientoVer(null)}
            onExito={() => handleExito('Respuesta enviada exitosamente')}
            escalamientoEditar={escalamientoVer}
          />
        ) : (
          <ListaEscalamientos 
            onVolver={handleVolverInicio}
            onVerEscalamiento={(e: any) => setEscalamientoVer(e)}
            onNuevo={() => setVistaActual('crear-escalamiento')}
          />
        );
      case 'configuracion':
        return <ConfiguracionModal onVolver={handleVolverInicio} />;
      case 'admin-config':
        return (
          <AdminConfigPanel 
            onVolver={handleVolverInicio} 
            onCuestionarios={handleCuestionarios}
            onGestionUsuarios={handleGestionUsuarios}
            defaultTab={adminConfigTab}
          />
        );
      case 'cuestionarios':
        return <CuestionariosModule onVolver={handleVolverInicio} />;
      case 'gestion-usuarios':
        return <GestionUsuariosAdmin onVolver={handleVolverInicio} />;
      case 'reportes':
        return <ReportesModule onVolver={handleVolverInicio} />;
      case 'mensajes':
        return <MensajesModule onVolver={handleVolverInicio} />;
      case 'datos':
        return <DatosModule onVolver={handleVolverInicio} />;
      case 'calendario':
        return <CalendarioModule onVolver={handleVolverInicio} />;
      case 'ensenanza':
        return <EnsenanzaModule onVolver={handleVolverInicio} />;
      case 'peticiones-oracion':
        return <PeticionesOracionModule onVolver={handleVolverInicio} />;
      case 'asistencia':
        return <AsistenciaModule onVolver={handleVolverInicio} />;
      case 'videollamada':
        return <VideollamadaModule onVolver={handleVolverInicio} />;
      case 'usuarios':
        return (
          <ListaUsuarios 
            onVolver={handleVolverInicio}
            onNuevo={() => setVistaActual('crear-usuario')}
          />
        );
      case 'gaps':
        return (
          <ListaGAPs 
            onVolver={handleVolverInicio}
            onNuevo={() => {
              setGapEditar(null);
              setVistaActual('crear-gap');
            }}
            onEditarGAP={(gap) => {
              setGapEditar(gap);
              setVistaActual('crear-gap');
            }}
          />
        );
      case 'miembros':
        return (
          <ListaMiembros 
            onVolver={handleVolverInicio}
            onNuevo={() => {
              setMiembroEditar(null);
              setVistaActual('agregar-integrante');
            }}
            onEditarMiembro={(miembro) => {
              setMiembroEditar(miembro);
              setVistaActual('agregar-integrante');
            }}
          />
        );
      case 'agregar-integrante':
        return (
          <AgregarIntegranteForm 
            onVolver={() => {
              setMiembroEditar(null);
              setVistaActual('miembros');
            }}
            onExito={() => {
              const msg = miembroEditar ? 'Integrante actualizado exitosamente' : 'Integrante agregado exitosamente';
              setMiembroEditar(null);
              handleExito(msg);
            }}
            miembroEditar={miembroEditar || undefined}
          />
        );
      case 'supervision':
        return <SupervisionModule onVolver={handleVolverInicio} />;
      case 'ver-integrantes':
        return <VerIntegrantesPastorModule />;
      case 'red-gap':
        return <RedGAPPastorModule />;
      case 'ensenanza-pastor':
        return <EnsenanzaPastorModule />;
      case 'peticiones-pastor':
        return <PeticionesOracionPastorModule />;
      case 'notificaciones':
        return <NotificacionesModule onVolver={handleVolverInicio} />;
      case 'integrantes-pastor-principal':
        return <IntegrantesPastorPrincipalModule onVolver={handleVolverInicio} />;
      case 'reportes-pastor-principal':
        return <ReportesPastorPrincipalModule onVolver={handleVolverInicio} />;
      case 'videollamada-pastor-principal':
        return <VideollamadaPastorPrincipalModule onVolver={handleVolverInicio} />;
      case 'zonas':
        return (
          <EnConstruccion 
            titulo={vistaActual}
            onVolver={handleVolverInicio}
          />
        );
      default:
        return renderDashboard();
    }
  };

  if (!estaAutenticado) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  const sidebarItems = [
    { id: 'dashboard', label: 'Panel Principal', icon: Home },
    { id: 'miembros', label: 'Miembros', icon: Users },
    { id: 'gaps', label: 'Grupos G.A.P', icon: MapPin },
    { id: 'calendario', label: 'Eventos', icon: Calendar },
    { id: 'peticiones-oracion', label: 'Oración', icon: Heart },
    { id: 'reportes', label: 'Reportes', icon: BarChart3 },
    { id: 'configuracion', label: 'Ajustes', icon: Settings },
  ];

  const getVistaTitulo = (vista: string) => {
    switch (vista) {
      case 'dashboard': return 'Panel Principal - Inicio';
      case 'miembros': return 'Directorio de Miembros';
      case 'gaps': return 'Grupos G.A.P Activos';
      case 'calendario': return 'Próximos Eventos';
      case 'peticiones-oracion': return 'Peticiones de Oración Recientes';
      case 'reportes': return 'Reportes y Estadísticas';
      case 'configuracion': return 'Ajustes del Sistema';
      default: return 'Panel Principal G.A.P';
    }
  };

  return (
    <div className="min-h-screen premium-bg lg:flex lg:items-center lg:justify-center lg:p-8 notranslate" translate="no">
      {/* Mobile Layout */}
      <div className="lg:hidden w-full min-h-screen bg-transparent text-white">
        <Header 
          onVolverInicio={handleVolverInicio}
          onConfiguracion={handleConfiguracion}
          onNotificaciones={handleNotificaciones}
          onMensajes={() => handleNavegar('mensajes')}
        />
        <main className="pb-20">
          <ErrorBoundary>
            {renderContenido()}
          </ErrorBoundary>
        </main>
        <MobileNav vistaActual={vistaActual} onNavegar={handleNavegar} />
      </div>

      {/* Desktop Premium Layout (Glassmorphism) */}
      <div className="hidden lg:flex w-full max-w-7xl h-[90vh] glass-dashboard-panel rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
        {/* Sidebar */}
        <aside className="w-72 border-r border-white/5 flex flex-col justify-between p-6 bg-[#0c1612]/60 backdrop-blur-md">
          <div className="space-y-8">
            {/* Logo */}
            <div className="flex items-center gap-3 px-2">
              <div 
                className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg"
                style={{ background: 'linear-gradient(135deg, var(--color-primario) 0%, var(--color-secundario) 100%)' }}
              >
                <span className="text-white font-bold text-lg">†</span>
              </div>
              <div className="leading-tight">
                <h1 className="font-bold text-sm text-white tracking-wide">Iglesia Bautista</h1>
                <p className="text-[10px] text-white/50">Central | G.A.P</p>
              </div>
            </div>

            {/* Menu */}
            <nav className="space-y-1.5">
              {sidebarItems.map((item) => {
                const isActive = vistaActual === item.id;
                const Icon = item.icon;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavegar(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition-all duration-200 ${
                      isActive 
                        ? 'text-white shadow-lg' 
                        : 'text-white/60 hover:text-white hover:bg-white/5'
                    }`}
                    style={isActive ? { background: 'linear-gradient(135deg, var(--color-primario) 0%, var(--color-secundario) 100%)' } : {}}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-white/40'}`} />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* User Profile at bottom or logout */}
          <div className="pt-4 border-t border-white/5">
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-all duration-200"
            >
              <span className="text-base font-bold">←</span>
              Cerrar Sesión
            </button>
          </div>
        </aside>

        {/* Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden bg-[#0a1612]/30 backdrop-blur-sm">
          {/* Header */}
          <header className="h-20 border-b border-white/5 px-8 flex items-center justify-between bg-[#0c1612]/30">
            <div>
              <h2 className="text-sm font-semibold tracking-wide text-white/80">
                {getVistaTitulo(vistaActual)}
              </h2>
            </div>
            
            <div className="flex items-center gap-6">
              {/* Search Bar */}
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-white/30 text-xs">🔍</span>
                <input 
                  type="text" 
                  placeholder="Search" 
                  className="bg-white/5 hover:bg-white/10 focus:bg-white/10 border border-white/10 text-white placeholder-white/40 text-xs rounded-xl pl-8 pr-4 py-1.5 w-48 transition-all focus:outline-none focus:border-white/20"
                />
              </div>

              {/* Centro de Mensajes */}
              <button
                onClick={() => handleNavegar('mensajes')}
                className="relative text-white/70 hover:text-white hover:scale-105 transition-all p-1.5 rounded-xl hover:bg-white/5"
                title="Centro de Mensajes"
              >
                <MessageSquare className="w-5 h-5" />
              </button>

              {/* Notification Bell */}
              <button
                onClick={handleNotificaciones}
                className="relative text-white/70 hover:text-white hover:scale-105 transition-all p-1.5 rounded-xl hover:bg-white/5"
                title="Notificaciones"
              >
                <Bell className="w-5 h-5" />
                {notificacionesNoLeidas > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full text-[10px] flex items-center justify-center font-medium animate-pulse text-white">
                    {notificacionesNoLeidas}
                  </span>
                )}
              </button>

              {/* Profile Card */}
              <div 
                className="flex items-center gap-3 pl-4 border-l border-white/10 cursor-pointer"
                onClick={() => handleNavegar('configuracion')}
              >
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white font-bold text-xs shadow-md overflow-hidden">
                  {usuario?.fotoPerfil ? (
                    <img src={usuario.fotoPerfil} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    `${usuario?.nombre?.charAt(0)}${usuario?.apellidos?.charAt(0)}`
                  )}
                </div>
                <div className="text-left hidden xl:block">
                  <h4 className="text-xs font-bold text-white leading-none">
                    {usuario?.nombre} {usuario?.apellidos}
                  </h4>
                  <p className="text-[9px] text-white/40 font-medium mt-0.5">
                    {usuario?.rol === 'pastor_principal' ? 'Pastor Principal' :
                     usuario?.rol === 'administrador' ? 'Administrador' :
                     usuario?.rol === 'pastor' ? 'Pastor' :
                     usuario?.rol === 'lider_mentor' ? 'Líder Mentor' :
                     usuario?.rol === 'lider_gap' ? 'Líder GAP' :
                     usuario?.rol === 'timoteo' ? 'Timoteo' : usuario?.rol}
                  </p>
                </div>
              </div>
            </div>
          </header>

          {/* Scrollable content inside dashboard */}
          <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            <ErrorBoundary>
              {renderContenido()}
            </ErrorBoundary>
          </main>
        </div>
      </div>
      
      <Toaster position="top-right" richColors />
    </div>
  );
};

// Componente temporal para secciones en construcción
const EnConstruccion: React.FC<{ titulo: string; onVolver: () => void }> = ({ titulo, onVolver }) => {
  const { tema } = useAuth();
  
  return (
    <div className="p-6 max-w-2xl mx-auto animate-fade-in">
      <div className="flex items-center gap-4 mb-6">
        <button 
          onClick={onVolver}
          className="p-2 rounded-lg hover:bg-gray-100"
        >
          <span className="text-2xl">←</span>
        </button>
        <h1 className="text-2xl font-bold text-gray-900 capitalize">{titulo}</h1>
      </div>
      <div className="text-center py-16 bg-white rounded-xl shadow-sm">
        <div 
          className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ backgroundColor: `${tema.primario}20` }}
        >
          <span className="text-4xl">🚧</span>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">En Construcción</h2>
        <p className="text-gray-500">Esta sección está siendo desarrollada.</p>
        <button 
          onClick={onVolver}
          className="mt-6 px-6 py-2 rounded-lg text-white"
          style={{ backgroundColor: tema.primario }}
        >
          Volver al Inicio
        </button>
      </div>
    </div>
  );
};

// Componente lista de escalamientos
import { getEscalamientosByUsuario as getEscalamientos } from '@/data/mockData';

const ListaEscalamientos: React.FC<{ 
  onVolver: () => void; 
  onVerEscalamiento: (e: any) => void;
  onNuevo: () => void;
}> = ({ onVolver, onVerEscalamiento, onNuevo }) => {
  const { usuario, tema, tienePermiso } = useAuth();
  const escalamientos = usuario ? getEscalamientos(usuario) : [];

  const getColorPrioridad = (prioridad: string) => {
    switch (prioridad) {
      case 'Normal': return 'bg-green-100 text-green-700 border-green-300';
      case 'Importante': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'Urgente': return 'bg-red-100 text-red-700 border-red-300';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getColorEstado = (estado: string) => {
    switch (estado) {
      case 'Abierto': return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'En Tratamiento': return 'bg-purple-100 text-purple-700 border-purple-300';
      case 'Cerrado': return 'bg-gray-100 text-gray-700 border-gray-300';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getColorClasificacion = (clasificacion: string) => {
    switch (clasificacion) {
      case 'Doctrinal': return 'bg-indigo-100 text-indigo-700 border-indigo-300';
      case 'Moral': return 'bg-rose-100 text-rose-700 border-rose-300';
      case 'Relacional': return 'bg-teal-100 text-teal-700 border-teal-300';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto animate-fade-in pb-24 lg:pb-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button onClick={onVolver} className="p-2 rounded-lg hover:bg-gray-100">
            <span className="text-2xl">←</span>
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Casos de Escalamiento</h1>
        </div>
        {tienePermiso('crearEscalamiento') && (
          <Button 
            onClick={onNuevo}
            className="text-white"
            style={{ backgroundColor: tema.primario }}
          >
            + Nuevo Caso
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {escalamientos.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl">
            <p className="text-gray-500">No hay casos registrados</p>
          </div>
        ) : (
          escalamientos.map((caso: any) => (
            <div 
              key={caso.id} 
              className="p-4 bg-white rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => onVerEscalamiento(caso)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-medium">{caso.titulo}</h3>
                  <p className="text-sm text-gray-500 mt-1">{caso.creadorNombre}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`px-2 py-0.5 rounded text-xs border ${getColorClasificacion(caso.clasificacion)}`}>
                      {caso.clasificacion}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(caso.fechaCreacion).toLocaleDateString('es-ES')}
                  </p>
                </div>
                <div className="flex gap-2 flex-col items-end">
                  <span className={`px-2 py-1 rounded text-xs border ${getColorPrioridad(caso.prioridad)}`}>
                    {caso.prioridad}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs border ${getColorEstado(caso.estado)}`}>
                    {caso.estado}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-red-50/90 border border-red-200 rounded-2xl max-w-2xl mx-auto my-8 text-red-950 shadow-lg backdrop-blur-md">
          <h2 className="text-lg font-bold mb-2 flex items-center gap-2">
            <span>⚠️</span>
            Algo salió mal al cargar esta sección
          </h2>
          <p className="text-sm font-semibold mb-4 text-red-800">{this.state.error?.message}</p>
          <pre className="text-xs bg-red-100/70 p-4 rounded-xl overflow-auto max-h-40 font-mono border border-red-250">
            {this.state.error?.stack}
          </pre>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold transition-all shadow-md"
          >
            Reintentar
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
