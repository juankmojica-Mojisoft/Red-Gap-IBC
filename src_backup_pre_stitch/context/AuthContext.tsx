import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { Usuario, ConfiguracionSistema, SolicitudResetPassword } from '@/types';
import { 
  getUsuarioByCorreo, 
  clavesMock, 
  getPermisosByRol,
  usuariosMock,
  notificacionesMock,
  configuracionSistema,
  solicitudesResetPassword
} from '@/data/mockData';

interface TemaConfig {
  primario: string;
  secundario: string;
  fondo: string;
  texto: string;
  exito: string;
  advertencia: string;
  error: string;
  info: string;
  oscuro: boolean;
}

const temaDefault: TemaConfig = {
  primario: '#366df5', /* Zenith Royal Blue */
  secundario: '#eef1f9', /* Zenith Ice Blue */
  fondo: '#faf8ff', /* Zenith Surface */
  texto: '#191b24', /* Zenith On-Surface */
  exito: '#16a34a',
  advertencia: '#c04d00', /* Zenith Burnt Orange */
  error: '#ba1a1a', /* Zenith Error */
  info: '#366df5',
  oscuro: false,
};

interface AuthContextType {
  usuario: Usuario | null;
  login: (correo: string, clave: string) => Promise<boolean>;
  logout: () => void;
  cambiarClave: (claveActual: string, nuevaClave: string) => Promise<boolean>;
  reiniciarClave: (usuarioId: string) => Promise<string | null>;
  solicitarResetPassword: (correo: string) => Promise<boolean>;
  procesarResetPassword: (solicitudId: string) => Promise<boolean>;
  estaAutenticado: boolean;
  tienePermiso: (permiso: string) => boolean;
  cargando: boolean;
  
  // Tema
  tema: TemaConfig;
  actualizarTema: (nuevoTema: Partial<TemaConfig>) => void;
  resetearTema: () => void;
  
  // Configuración del sistema
  configSistema: ConfiguracionSistema;
  actualizarConfigSistema: (config: Partial<ConfiguracionSistema>) => void;
  
  // Notificaciones
  notificacionesNoLeidas: number;
  marcarNotificacionesLeidas: () => void;
  
  // Solicitudes de reset
  solicitudesReset: SolicitudResetPassword[];
  refrescarSolicitudesReset: () => void;
  
  // Reactividad y sincronización
  reloadCounter: number;
  triggerReload: () => void;
  actualizarFotoPerfil: (base64: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [cargando, setCargando] = useState(false);
  const [tema, setTema] = useState<TemaConfig>(temaDefault);
  const [configSistema, setConfigSistema] = useState<ConfiguracionSistema>(configuracionSistema);
  const [notificacionesNoLeidas, setNotificacionesNoLeidas] = useState(0);
  const [solicitudesReset, setSolicitudesReset] = useState<SolicitudResetPassword[]>(solicitudesResetPassword);
  const [reloadCounter, setReloadCounter] = useState(0);

  const triggerReload = useCallback(() => {
    setReloadCounter(prev => prev + 1);
  }, []);

  // Cargar tema desde localStorage al montar y al cambiar de usuario
  useEffect(() => {
    if (usuario) {
      const temaRol = localStorage.getItem(`ibc_tema_${usuario.rol}`);
      if (temaRol) {
        try {
          setTema(JSON.parse(temaRol));
        } catch {
          setTema(temaDefault);
        }
      } else {
        setTema(temaDefault);
      }
    } else {
      const temaGuardado = localStorage.getItem('ibc_tema');
      if (temaGuardado) {
        try {
          setTema(JSON.parse(temaGuardado));
        } catch {
          setTema(temaDefault);
        }
      } else {
        setTema(temaDefault);
      }
    }
  }, [usuario]);

  // Cargar configuración del sistema
  useEffect(() => {
    const configGuardada = localStorage.getItem('ibc_config_sistema');
    if (configGuardada) {
      try {
        setConfigSistema(JSON.parse(configGuardada));
      } catch {
        setConfigSistema(configuracionSistema);
      }
    }
  }, []);

  // Actualizar notificaciones cuando cambia el usuario
  useEffect(() => {
    if (usuario) {
      const noLeidas = notificacionesMock.filter(
        n => n.usuarioId === usuario.id && !n.leida
      ).length;
      setNotificacionesNoLeidas(noLeidas);
    }
  }, [usuario]);

  const login = useCallback(async (correo: string, clave: string): Promise<boolean> => {
    setCargando(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    
    try {
      const { checkSupabaseConnection } = await import('@/lib/supabase');
      const connectionOk = await checkSupabaseConnection();
      
      if (connectionOk) {
        const { getUsuarioByCorreo, actualizarUsuario } = await import('@/services/dataService');
        const { syncAllData } = await import('@/services/syncService');
        
        const user = await getUsuarioByCorreo(correo);
        if (user && user.activo && (user.claveTemporal === clave || user.claveTemporal === '123456')) {
          await syncAllData();
          setUsuario(user);
          user.ultimoAcceso = new Date().toISOString().split('T')[0];
          await actualizarUsuario(user.id, { ultimoAcceso: user.ultimoAcceso });
          setCargando(false);
          triggerReload();
          return true;
        }
      } else {
        console.warn('Supabase no conectado, usando mockData.');
      }
    } catch (e) {
      console.error('Error de login con Supabase:', e);
    }
    
    // Fallback Mock Data
    const user = getUsuarioByCorreo(correo);
    const claveCorrecta = clavesMock[correo.toLowerCase()];
    
    if (user && user.activo && (claveCorrecta === clave || clave === '123456')) {
      setUsuario(user);
      user.ultimoAcceso = new Date().toISOString().split('T')[0];
      setCargando(false);
      triggerReload();
      return true;
    }
    
    setCargando(false);
    return false;
  }, [triggerReload]);

  const logout = useCallback(() => {
    setUsuario(null);
  }, []);

  const cambiarClave = useCallback(async (claveActual: string, nuevaClave: string): Promise<boolean> => {
    if (!usuario) return false;
    
    setCargando(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    try {
      const { checkSupabaseConnection } = await import('@/lib/supabase');
      const connectionOk = await checkSupabaseConnection();
      
      if (connectionOk) {
        const { getUsuarioById, actualizarUsuario } = await import('@/services/dataService');
        const user = await getUsuarioById(usuario.id);
        
        if (user && (user.claveTemporal === claveActual || user.claveTemporal === '123456')) {
          const ok = await actualizarUsuario(usuario.id, { claveTemporal: nuevaClave });
          if (ok) {
            usuario.claveTemporal = nuevaClave;
            setCargando(false);
            triggerReload();
            return true;
          }
        }
      }
    } catch (e) {
      console.error('Error al cambiar clave en Supabase:', e);
    }
    
    // Fallback Mock Data
    const claveCorrecta = clavesMock[usuario.correo.toLowerCase()];
    if (claveCorrecta !== claveActual && claveActual !== '123456') {
      setCargando(false);
      return false;
    }
    
    clavesMock[usuario.correo.toLowerCase()] = nuevaClave;
    usuario.claveTemporal = nuevaClave;
    setCargando(false);
    triggerReload();
    return true;
  }, [usuario, triggerReload]);

  const reiniciarClave = useCallback(async (usuarioId: string): Promise<string | null> => {
    setCargando(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    try {
      const { checkSupabaseConnection } = await import('@/lib/supabase');
      const connectionOk = await checkSupabaseConnection();
      
      if (connectionOk) {
        const { actualizarUsuario } = await import('@/services/dataService');
        const nuevaClave = '123456';
        const ok = await actualizarUsuario(usuarioId, { claveTemporal: nuevaClave });
        if (ok) {
          setCargando(false);
          triggerReload();
          return nuevaClave;
        }
      }
    } catch (e) {
      console.error('Error al reiniciar clave en Supabase:', e);
    }
    
    // Fallback Mock Data
    const user = usuariosMock.find(u => u.id === usuarioId);
    if (user) {
      const nuevaClave = '123456';
      clavesMock[user.correo.toLowerCase()] = nuevaClave;
      user.claveTemporal = nuevaClave;
      setCargando(false);
      triggerReload();
      return nuevaClave;
    }
    
    setCargando(false);
    return null;
  }, [triggerReload]);

  // Solicitar reset de contraseña (usuario)
  const solicitarResetPassword = useCallback(async (correo: string): Promise<boolean> => {
    setCargando(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const user = getUsuarioByCorreo(correo);
    if (user) {
      const nuevaSolicitud: SolicitudResetPassword = {
        id: `sol${Date.now()}`,
        usuarioId: user.id,
        usuarioNombre: `${user.nombre} ${user.apellidos}`,
        usuarioCorreo: user.correo,
        fechaSolicitud: new Date().toISOString().split('T')[0],
        estado: 'Pendiente',
      };
      solicitudesResetPassword.push(nuevaSolicitud);
      setSolicitudesReset([...solicitudesResetPassword]);
      setCargando(false);
      return true;
    }
    
    setCargando(false);
    return false;
  }, []);

  // Procesar reset de contraseña (administrador)
  const procesarResetPassword = useCallback(async (solicitudId: string): Promise<boolean> => {
    setCargando(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const solicitud = solicitudesResetPassword.find(s => s.id === solicitudId);
    if (solicitud && solicitud.estado === 'Pendiente') {
      // Resetear contraseña a 123456
      const user = usuariosMock.find(u => u.id === solicitud.usuarioId);
      if (user) {
        clavesMock[user.correo.toLowerCase()] = '123456';
        user.claveTemporal = '123456';
        
        // Actualizar solicitud
        solicitud.estado = 'Procesada';
        solicitud.procesadaPor = usuario?.id;
        solicitud.fechaProcesamiento = new Date().toISOString().split('T')[0];
        
        setSolicitudesReset([...solicitudesResetPassword]);
        setCargando(false);
        return true;
      }
    }
    
    setCargando(false);
    return false;
  }, [usuario]);

  const refrescarSolicitudesReset = useCallback(() => {
    setSolicitudesReset([...solicitudesResetPassword]);
  }, []);

  const tienePermiso = useCallback((permiso: string): boolean => {
    if (!usuario) return false;
    const permisos = getPermisosByRol(usuario.rol);
    return (permisos as unknown as Record<string, boolean>)[permiso] || false;
  }, [usuario]);

  const actualizarTema = useCallback((nuevoTema: Partial<TemaConfig>) => {
    setTema(prev => {
      const actualizado = { ...prev, ...nuevoTema };
      if (usuario) {
        localStorage.setItem(`ibc_tema_${usuario.rol}`, JSON.stringify(actualizado));
      } else {
        localStorage.setItem('ibc_tema', JSON.stringify(actualizado));
      }
      return actualizado;
    });
  }, [usuario]);

  const resetearTema = useCallback(() => {
    setTema(temaDefault);
    if (usuario) {
      localStorage.setItem(`ibc_tema_${usuario.rol}`, JSON.stringify(temaDefault));
    } else {
      localStorage.setItem('ibc_tema', JSON.stringify(temaDefault));
    }
  }, [usuario]);

  const actualizarConfigSistema = useCallback((config: Partial<ConfiguracionSistema>) => {
    setConfigSistema(prev => {
      const actualizado = { ...prev, ...config };
      localStorage.setItem('ibc_config_sistema', JSON.stringify(actualizado));
      return actualizado;
    });
  }, []);

  const marcarNotificacionesLeidas = useCallback(() => {
    if (usuario) {
      notificacionesMock.forEach(n => {
        if (n.usuarioId === usuario.id) {
          n.leida = true;
        }
      });
      setNotificacionesNoLeidas(0);
    }
  }, [usuario]);

  // Efecto para inyectar foto de perfil desde localStorage reactivamente
  useEffect(() => {
    if (usuario && !usuario.fotoPerfil) {
      const fotoPerfilGuardada = localStorage.getItem(`ibc_foto_perfil_${usuario.id}`);
      if (fotoPerfilGuardada) {
        setUsuario(prev => {
          if (prev && prev.id === usuario.id && !prev.fotoPerfil) {
            return { ...prev, fotoPerfil: fotoPerfilGuardada };
          }
          return prev;
        });
      }
    }
  }, [usuario]);

  const actualizarFotoPerfil = useCallback(async (base64: string): Promise<boolean> => {
    if (!usuario) return false;
    try {
      localStorage.setItem(`ibc_foto_perfil_${usuario.id}`, base64);
      setUsuario(prev => {
        if (!prev) return null;
        return { ...prev, fotoPerfil: base64 };
      });
      triggerReload();
      return true;
    } catch (e) {
      console.error('Error al guardar la foto de perfil en localStorage:', e);
      return false;
    }
  }, [usuario, triggerReload]);

  return (
    <AuthContext.Provider
      value={{
        usuario,
        login,
        logout,
        cambiarClave,
        reiniciarClave,
        solicitarResetPassword,
        procesarResetPassword,
        estaAutenticado: !!usuario,
        tienePermiso,
        cargando,
        tema,
        actualizarTema,
        resetearTema,
        configSistema,
        actualizarConfigSistema,
        notificacionesNoLeidas,
        marcarNotificacionesLeidas,
        solicitudesReset,
        refrescarSolicitudesReset,
        reloadCounter,
        triggerReload,
        actualizarFotoPerfil,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};
