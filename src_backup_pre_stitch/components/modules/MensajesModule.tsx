import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Send, Search, ArrowLeft, 
  MoreVertical, CheckCheck, Smile, Trash, 
  CornerUpRight, Plus, X, MessageSquare, AlertCircle
} from 'lucide-react';
import { getAllUsuarios } from '@/services/dataService';
import { mensajesMock, usuariosMock } from '@/data/mockData';
import type { Usuario, Mensaje } from '@/types';

interface MensajesModuleProps {
  onVolver: () => void;
}

const EMOJIS = [
  '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '😉', 
  '😌', '😍', '🥰', '😘', '😋', '😛', '😜', '🤪', '😎', '🤩', '🥳', '😏',
  '👍', '👎', '👊', '✊', '🤛', '🤜', '✌️', '🤟', '🤘', '👌', '👈', '👉',
  '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '💔', '❣️', '💕', '💞',
  '🌟', '⭐', '✨', '⚡', '💥', '🎉', '🎊', '🎈', '🔥', '👏', '🙏', '🙌'
];

const formatRol = (rol: string): string => {
  switch (rol) {
    case 'pastor_principal': return 'Pastor Principal';
    case 'administrador': return 'Administrador';
    case 'pastor': return 'Pastor';
    case 'lider_mentor': return 'Mentor';
    case 'lider_gap': return 'Líder GAP';
    case 'timoteo': return 'Timoteo';
    case 'facilitador': return 'Facilitador';
    default: return rol;
  }
};

const getAvatarColor = (rol: string): string => {
  switch (rol) {
    case 'pastor_principal': return '#ef4444'; // Rojo
    case 'administrador': return '#a855f7'; // Púrpura
    case 'pastor': return '#3b82f6'; // Azul
    case 'lider_mentor': return '#0d9488'; // Teal
    case 'lider_gap': return '#f59e0b'; // Ámbar
    default: return '#6b7280'; // Gris
  }
};

const MensajesModule: React.FC<MensajesModuleProps> = ({ onVolver }) => {
  const { usuario, tema } = useAuth();
  
  const [usuarios, setUsuarios] = useState<Usuario[]>(usuariosMock);
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [activeContactoId, setActiveContactoId] = useState<string | null>(null);
  
  const [mensajeTexto, setMensajeTexto] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [mostrarEmojis, setMostrarEmojis] = useState(false);
  
  // Modales y menús
  const [mostrarNuevoChatModal, setMostrarNuevoChatModal] = useState(false);
  const [busquedaNuevoChat, setBusquedaNuevoChat] = useState('');
  const [mostrarChatMovil, setMostrarChatMovil] = useState(false);
  const [mostrarHeaderMenu, setMostrarHeaderMenu] = useState(false);
  
  // Acciones en mensajes
  const [mensajeAReenviar, setMensajeAReenviar] = useState<Mensaje | null>(null);
  const [buscarContactoFwd, setBuscarContactoFwd] = useState('');
  const [mensajeAEliminar, setMensajeAEliminar] = useState<string | null>(null);
  const [confirmarVaciar, setConfirmarVaciar] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Cargar usuarios de la DB o Mock
  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const u = await getAllUsuarios();
        if (u && u.length > 0) {
          setUsuarios(u);
        }
      } catch (e) {
        console.error('Error cargando usuarios:', e);
      }
    };
    fetchUsuarios();
  }, []);

  // Cargar mensajes de localStorage
  useEffect(() => {
    const localMsgs = localStorage.getItem('ibc_mensajes');
    if (localMsgs) {
      try {
        setMensajes(JSON.parse(localMsgs));
      } catch (e) {
        setMensajes(mensajesMock);
      }
    } else {
      localStorage.setItem('ibc_mensajes', JSON.stringify(mensajesMock));
      setMensajes(mensajesMock);
    }
  }, []);

  // Desplazar al final al recibir o enviar mensajes
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Filtrado de contactos permitidos según jerarquía
  const contactosPermitidos = useMemo(() => {
    if (!usuario) return [];
    const rol = usuario.rol;
    
    // Regla 1: Administrador y Pastor Principal pueden escribir a todos
    if (rol === 'administrador' || rol === 'pastor_principal') {
      return usuarios.filter(u => u.id !== usuario.id);
    }

    return usuarios.filter(u => {
      if (u.id === usuario.id) return false;

      // Pastor Principal siempre es accesible por todos
      if (u.rol === 'pastor_principal') return true;

      // Regla 2: Pastor
      if (rol === 'pastor') {
        // Mentores de su red
        if (u.rol === 'lider_mentor' && u.pastorId === usuario.id) return true;
        // Líderes de su red
        if ((u.rol === 'lider_gap' || u.rol === 'timoteo' || u.rol === 'facilitador') && u.pastorId === usuario.id) return true;
        // Otros pastores
        if (u.rol === 'pastor') return true;
        return false;
      }

      // Regla 3: Mentor
      if (rol === 'lider_mentor') {
        // Su Pastor supervisor
        if (u.rol === 'pastor' && usuario.pastorId === u.id) return true;
        // Líderes a su cargo o de su misma red general
        if ((u.rol === 'lider_gap' || u.rol === 'timoteo' || u.rol === 'facilitador') && 
            (u.liderMentorId === usuario.id || (usuario.pastorId && u.pastorId === usuario.pastorId))) return true;
        // Otros mentores en su red
        if (u.rol === 'lider_mentor' && usuario.pastorId && u.pastorId === usuario.pastorId) return true;
        return false;
      }

      // Regla 4: Líder / Timoteo / Facilitador
      if (rol === 'lider_gap' || rol === 'timoteo' || rol === 'facilitador') {
        // Su Mentor supervisor
        if (u.rol === 'lider_mentor' && usuario.liderMentorId === u.id) return true;
        // Su Pastor supervisor
        if (u.rol === 'pastor' && usuario.pastorId === u.id) return true;
        // Otros líderes en su misma red
        if ((u.rol === 'lider_gap' || u.rol === 'timoteo' || u.rol === 'facilitador') && 
            ((usuario.liderMentorId && u.liderMentorId === usuario.liderMentorId) || 
             (usuario.pastorId && u.pastorId === usuario.pastorId))) return true;
        return false;
      }

      return false;
    });
  }, [usuario, usuarios]);

  // Conversaciones activas ordenadas por fecha de último mensaje
  const conversacionesActivas = useMemo(() => {
    if (!usuario) return [];
    
    const grupos: Record<string, Mensaje[]> = {};
    mensajes.forEach(msg => {
      const esRemi = msg.remitenteId === usuario.id;
      const esDesti = msg.destinatarios.includes(usuario.id);
      
      if (esRemi || esDesti) {
        const otroId = esRemi ? msg.destinatarios[0] : msg.remitenteId;
        if (!grupos[otroId]) grupos[otroId] = [];
        grupos[otroId].push(msg);
      }
    });

    return Object.keys(grupos).map(otroId => {
      const cont = usuarios.find(u => u.id === otroId);
      const msgs = grupos[otroId].sort((a, b) => new Date(a.fechaEnvio).getTime() - new Date(b.fechaEnvio).getTime());
      const ultimo = msgs[msgs.length - 1];
      const noLeidos = msgs.filter(m => m.remitenteId === otroId && !m.leidoPor.includes(usuario.id)).length;

      return {
        contactoId: otroId,
        contacto: cont || {
          id: otroId,
          nombre: 'Usuario',
          apellidos: 'Inactivo',
          rol: 'lider_gap',
          correo: '',
          activo: false
        } as unknown as Usuario,
        ultimoMensaje: ultimo,
        noLeidos,
        mensajes: msgs
      };
    }).sort((a, b) => new Date(b.ultimoMensaje.fechaEnvio).getTime() - new Date(a.ultimoMensaje.fechaEnvio).getTime());
  }, [mensajes, usuarios, usuario]);

  // Conversaciones activas filtradas por el buscador
  const conversacionesFiltradas = useMemo(() => {
    return conversacionesActivas.filter(c => {
      const nombreCompleto = `${c.contacto.nombre} ${c.contacto.apellidos}`.toLowerCase();
      return nombreCompleto.includes(busqueda.toLowerCase());
    });
  }, [conversacionesActivas, busqueda]);

  // Contacto actualmente seleccionado
  const contactoActivo = useMemo(() => {
    return usuarios.find(u => u.id === activeContactoId) || null;
  }, [activeContactoId, usuarios]);

  // Mensajes de la conversación activa
  const mensajesChatActivo = useMemo(() => {
    if (!usuario || !activeContactoId) return [];
    return mensajes.filter(msg => 
      (msg.remitenteId === usuario.id && msg.destinatarios.includes(activeContactoId)) ||
      (msg.remitenteId === activeContactoId && msg.destinatarios.includes(usuario.id))
    ).sort((a, b) => new Date(a.fechaEnvio).getTime() - new Date(b.fechaEnvio).getTime());
  }, [mensajes, usuario, activeContactoId]);

  // Desplazar abajo cuando se abre el chat o llegan mensajes
  useEffect(() => {
    if (activeContactoId) {
      scrollToBottom();
    }
  }, [activeContactoId, mensajesChatActivo]);

  // Marcar mensajes como leídos al abrir el chat
  useEffect(() => {
    if (!usuario || !activeContactoId) return;

    const tieneNoLeidos = mensajes.some(m => 
      m.remitenteId === activeContactoId && 
      m.destinatarios.includes(usuario.id) && 
      !m.leidoPor.includes(usuario.id)
    );

    if (tieneNoLeidos) {
      const actualizados = mensajes.map(m => {
        if (m.remitenteId === activeContactoId && m.destinatarios.includes(usuario.id) && !m.leidoPor.includes(usuario.id)) {
          return { ...m, leidoPor: [...m.leidoPor, usuario.id] };
        }
        return m;
      });
      setMensajes(actualizados);
      localStorage.setItem('ibc_mensajes', JSON.stringify(actualizados));
    }
  }, [activeContactoId, mensajes, usuario]);

  // Funciones de acción
  const handleEnviar = (texto: string) => {
    if (!usuario || !activeContactoId || !texto.trim()) return;

    const nuevoMsg: Mensaje = {
      id: `msg_${Date.now()}`,
      remitenteId: usuario.id,
      remitenteNombre: `${usuario.nombre} ${usuario.apellidos}`,
      remitenteRol: usuario.rol,
      destinatarios: [activeContactoId],
      asunto: 'Mensaje directo',
      contenido: texto.trim(),
      fechaEnvio: new Date().toISOString(),
      esMasivo: false,
      leidoPor: [usuario.id],
      tipoEnvio: 'Sistema'
    };

    const nuevos = [...mensajes, nuevoMsg];
    setMensajes(nuevos);
    localStorage.setItem('ibc_mensajes', JSON.stringify(nuevos));
    setMensajeTexto('');
    setMostrarEmojis(false);
  };

  const handleEliminarMsgConfirmar = () => {
    if (!mensajeAEliminar) return;
    const nuevos = mensajes.filter(m => m.id !== mensajeAEliminar);
    setMensajes(nuevos);
    localStorage.setItem('ibc_mensajes', JSON.stringify(nuevos));
    setMensajeAEliminar(null);
  };

  const handleVaciarChatConfirmar = () => {
    if (!usuario || !activeContactoId) return;
    const nuevos = mensajes.filter(msg => {
      const esDeEstaConver = 
        (msg.remitenteId === usuario.id && msg.destinatarios.includes(activeContactoId)) ||
        (msg.remitenteId === activeContactoId && msg.destinatarios.includes(usuario.id));
      return !esDeEstaConver;
    });
    setMensajes(nuevos);
    localStorage.setItem('ibc_mensajes', JSON.stringify(nuevos));
    setConfirmarVaciar(false);
    setMostrarHeaderMenu(false);
  };

  const handleReenviarMsgConfirmar = (destinatarioId: string) => {
    if (!usuario || !mensajeAReenviar) return;

    const nuevoMsg: Mensaje = {
      id: `msg_fwd_${Date.now()}`,
      remitenteId: usuario.id,
      remitenteNombre: `${usuario.nombre} ${usuario.apellidos}`,
      remitenteRol: usuario.rol,
      destinatarios: [destinatarioId],
      asunto: 'Mensaje reenviado',
      contenido: mensajeAReenviar.contenido,
      fechaEnvio: new Date().toISOString(),
      esMasivo: false,
      leidoPor: [usuario.id],
      tipoEnvio: 'Sistema'
    };

    const nuevos = [...mensajes, nuevoMsg];
    setMensajes(nuevos);
    localStorage.setItem('ibc_mensajes', JSON.stringify(nuevos));
    
    // Cambiar al chat del destinatario reenviado
    setActiveContactoId(destinatarioId);
    setMostrarChatMovil(true);
    setMensajeAReenviar(null);
  };

  const insertarEmoji = (emoji: string) => {
    setMensajeTexto(prev => prev + emoji);
  };

  // Filtrar contactos del nuevo chat
  const contactosNuevoChatFiltrados = useMemo(() => {
    return contactosPermitidos.filter(c => {
      const nombreCompleto = `${c.nombre} ${c.apellidos}`.toLowerCase();
      return nombreCompleto.includes(busquedaNuevoChat.toLowerCase());
    });
  }, [contactosPermitidos, busquedaNuevoChat]);

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] max-w-6xl mx-auto p-4 animate-fade-in relative">
      {/* Header del Módulo */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onVolver} className="hover:bg-black/5 dark:hover:bg-white/5">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold">Mensajería Red GAP</h1>
        </div>
      </div>

      <div className="flex flex-1 gap-4 overflow-hidden relative">
        
        {/* LISTA DE CONVERSACIONES (Sidebar) */}
        <div className={`${mostrarChatMovil ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-80 bg-white/50 backdrop-blur-sm rounded-2xl border border-white/20 p-4 transition-all shadow-md`}>
          <div className="flex items-center justify-between gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input 
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar chat..." 
                className="pl-10 bg-white/50 border-none h-10 rounded-xl" 
              />
            </div>
            <Button 
              size="icon" 
              onClick={() => setMostrarNuevoChatModal(true)} 
              className="rounded-xl shadow-lg transition-transform hover:scale-105 shrink-0"
              style={{ backgroundColor: tema.primario }}
            >
              <Plus className="w-5 h-5 text-white" />
            </Button>
          </div>
          
          <div className="space-y-2 overflow-y-auto flex-1 pr-1">
            {conversacionesFiltradas.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-center text-gray-400 p-4">
                <MessageSquare className="w-10 h-10 mb-2 opacity-50" />
                <p className="text-sm font-medium">No hay conversaciones</p>
                <p className="text-xs mt-1">Haz clic en + para iniciar una</p>
              </div>
            ) : (
              conversacionesFiltradas.map((c) => (
                <div 
                  key={c.contactoId} 
                  onClick={() => {
                    setActiveContactoId(c.contactoId);
                    setMostrarChatMovil(true);
                  }}
                  className={`p-3 rounded-xl cursor-pointer transition-all flex gap-3 ${
                    activeContactoId === c.contactoId 
                      ? 'bg-white/80 dark:bg-slate-800/80 shadow-md ring-1 ring-black/5' 
                      : 'hover:bg-white/50 hover:shadow-sm'
                  }`}
                >
                  <div 
                    className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold relative shrink-0"
                    style={{ backgroundColor: getAvatarColor(c.contacto.rol) }}
                  >
                    {c.contacto.fotoPerfil ? (
                      <img src={c.contacto.fotoPerfil} alt="Perfil" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      c.contacto.nombre.charAt(0) + (c.contacto.apellidos ? c.contacto.apellidos.charAt(0) : '')
                    )}
                    {c.noLeidos > 0 && (
                      <span className="absolute -top-1 -right-1 bg-green-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold ring-2 ring-white">
                        {c.noLeidos}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <p className="font-semibold text-sm truncate text-gray-800 dark:text-gray-200">
                        {c.contacto.nombre} {c.contacto.apellidos}
                      </p>
                      <span className="text-[10px] text-gray-400 shrink-0">
                        {new Date(c.ultimoMensaje.fechaEnvio).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-xs text-gray-500 truncate pr-2 flex-1">
                        {c.ultimoMensaje.contenido}
                      </p>
                      <span className="text-[9px] bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded text-gray-500 dark:text-gray-300 font-medium shrink-0">
                        {formatRol(c.contacto.rol)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ÁREA DE CHAT PRINCIPAL */}
        <div className={`${mostrarChatMovil ? 'flex' : 'hidden md:flex'} flex-1 flex-col bg-white/40 backdrop-blur-md rounded-2xl border border-white/30 overflow-hidden shadow-xl relative`}>
          
          {contactoActivo ? (
            <>
              {/* Header del Chat */}
              <div className="p-4 border-b border-white/20 flex items-center justify-between bg-white/20 z-10">
                <div className="flex items-center gap-3 min-w-0">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setMostrarChatMovil(false)} 
                    className="md:hidden text-gray-500 hover:bg-black/5"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </Button>
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shrink-0"
                    style={{ backgroundColor: getAvatarColor(contactoActivo.rol) }}
                  >
                    {contactoActivo.fotoPerfil ? (
                      <img src={contactoActivo.fotoPerfil} alt="Perfil" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      contactoActivo.nombre.charAt(0) + (contactoActivo.apellidos ? contactoActivo.apellidos.charAt(0) : '')
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-sm truncate text-gray-800 dark:text-gray-100">
                      {contactoActivo.nombre} {contactoActivo.apellidos}
                    </p>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] bg-slate-200/50 px-1.5 py-0.5 rounded text-gray-600 dark:text-gray-300 font-semibold">
                        {formatRol(contactoActivo.rol)}
                      </span>
                      <span className="text-[10px] text-green-600 font-medium flex items-center gap-1">
                        ● En línea
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="relative">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setMostrarHeaderMenu(!mostrarHeaderMenu)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <MoreVertical className="w-5 h-5" />
                  </Button>
                  {mostrarHeaderMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg py-1 z-30 animate-fade-in">
                      <button 
                        onClick={() => {
                          setConfirmarVaciar(true);
                          setMostrarHeaderMenu(false);
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-2 font-medium"
                      >
                        <Trash className="w-4 h-4" />
                        Vaciar conversación
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Mensajes del Chat */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {mensajesChatActivo.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center text-gray-400">
                    <MessageSquare className="w-12 h-12 mb-2 opacity-30" />
                    <p className="text-sm font-medium">No hay mensajes anteriores</p>
                    <p className="text-xs mt-1">Escribe un mensaje para comenzar la conversación.</p>
                  </div>
                ) : (
                  mensajesChatActivo.map((msg) => {
                    const esMio = msg.remitenteId === usuario?.id;
                    return (
                      <div key={msg.id} className={`flex group ${esMio ? 'justify-end' : 'justify-start'}`}>
                        
                        {/* Acciones del mensaje al pasar el cursor (Reenviar/Eliminar) */}
                        <div className={`flex items-center gap-1.5 mx-2 opacity-0 group-hover:opacity-100 transition-opacity ${esMio ? 'order-first' : 'order-last'}`}>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            title="Reenviar"
                            onClick={() => setMensajeAReenviar(msg)}
                            className="w-7 h-7 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500"
                          >
                            <CornerUpRight className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            title="Eliminar"
                            onClick={() => setMensajeAEliminar(msg.id)}
                            className="w-7 h-7 rounded-full hover:bg-red-50 dark:hover:bg-red-950/30 text-red-500"
                          >
                            <Trash className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className={`max-w-[70%] p-3.5 rounded-2xl shadow-sm relative ${
                          esMio 
                            ? 'bg-gradient-to-br text-white rounded-tr-none' 
                            : 'bg-white/80 dark:bg-slate-800/80 text-gray-800 dark:text-gray-100 rounded-tl-none border border-white/50 dark:border-slate-700/50'
                        }`}
                        style={esMio ? { background: `linear-gradient(135deg, ${tema.primario} 0%, ${tema.secundario} 100%)` } : {}}>
                          <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.contenido}</p>
                          <div className="flex items-center justify-end gap-1 mt-1.5 select-none">
                            <span className={`text-[9px] ${esMio ? 'text-white/70' : 'text-gray-400'}`}>
                              {new Date(msg.fechaEnvio).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {esMio && <CheckCheck className="w-3 h-3 text-white/70" />}
                          </div>
                        </div>

                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input y Selector de Emojis */}
              <div className="p-4 bg-white/30 border-t border-white/20 relative">
                {mostrarEmojis && (
                  <div className="absolute bottom-20 left-4 p-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-72 max-h-56 overflow-y-auto grid grid-cols-7 gap-2.5 z-20 animate-fade-in">
                    {EMOJIS.map(emoji => (
                      <button 
                        key={emoji} 
                        onClick={() => insertarEmoji(emoji)}
                        className="text-xl p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-transform hover:scale-110"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
                
                <div className="flex gap-2 items-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setMostrarEmojis(!mostrarEmojis)}
                    className={`rounded-xl text-gray-500 shrink-0 ${mostrarEmojis ? 'bg-slate-200/50 text-sky-500' : ''}`}
                  >
                    <Smile className="w-5 h-5" />
                  </Button>
                  
                  <Input 
                    value={mensajeTexto}
                    onChange={(e) => setMensajeTexto(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleEnviar(mensajeTexto);
                      }
                    }}
                    placeholder="Escribe un mensaje..." 
                    className="glass-input flex-1 border-none focus-visible:ring-1 bg-white/60 dark:bg-slate-800/60"
                    style={{ '--ring': tema.primario } as React.CSSProperties}
                  />
                  
                  <Button 
                    onClick={() => handleEnviar(mensajeTexto)}
                    disabled={!mensajeTexto.trim()}
                    className="rounded-xl shadow-lg shrink-0 transition-transform active:scale-95"
                    style={{ backgroundColor: tema.primario }}
                  >
                    <Send className="w-4 h-4 text-white" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-400 p-8">
              <MessageSquare className="w-16 h-16 mb-4 opacity-20" />
              <h3 className="text-lg font-bold text-gray-700 dark:text-gray-300">Mensajería Red GAP</h3>
              <p className="text-sm max-w-sm mt-2 text-gray-500">
                Selecciona una conversación del menú izquierdo o inicia una nueva para coordinar los GAPs.
              </p>
            </div>
          )}

        </div>

      </div>

      {/* MODAL: NUEVO CHAT (SELECTOR DE CONTACTOS PERMITIDOS) */}
      {mostrarNuevoChatModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 w-full max-w-md max-h-[80vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-100 dark:border-slate-850 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-800 dark:text-white">Nuevo mensaje</h2>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => {
                  setMostrarNuevoChatModal(false);
                  setBusquedaNuevoChat('');
                }}
                className="rounded-full"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="p-3 border-b border-slate-100 dark:border-slate-850">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input 
                  value={busquedaNuevoChat}
                  onChange={(e) => setBusquedaNuevoChat(e.target.value)}
                  placeholder="Buscar líder, mentor o pastor..." 
                  className="pl-10 bg-slate-50 dark:bg-slate-800 border-none h-9 rounded-lg"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {contactosNuevoChatFiltrados.length === 0 ? (
                <p className="text-center text-xs text-gray-400 py-8">No se encontraron contactos permitidos</p>
              ) : (
                contactosNuevoChatFiltrados.map(c => (
                  <div 
                    key={c.id}
                    onClick={() => {
                      setActiveContactoId(c.id);
                      setMostrarNuevoChatModal(false);
                      setBusquedaNuevoChat('');
                      setMostrarChatMovil(true);
                    }}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                  >
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shrink-0 text-sm"
                      style={{ backgroundColor: getAvatarColor(c.rol) }}
                    >
                      {c.fotoPerfil ? (
                        <img src={c.fotoPerfil} alt="Perfil" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        c.nombre.charAt(0) + (c.apellidos ? c.apellidos.charAt(0) : '')
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate text-gray-800 dark:text-gray-100">
                        {c.nombre} {c.apellidos}
                      </p>
                      <span className="text-[10px] bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded text-gray-500 dark:text-gray-300 font-semibold">
                        {formatRol(c.rol)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: REENVIAR MENSAJE */}
      {mensajeAReenviar && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 w-full max-w-md max-h-[70vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-100 dark:border-slate-850 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-gray-800 dark:text-white">Reenviar mensaje</h2>
                <p className="text-[11px] text-gray-400 mt-0.5 line-clamp-1 italic">"{mensajeAReenviar.contenido}"</p>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setMensajeAReenviar(null)}
                className="rounded-full"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="p-3 border-b border-slate-100 dark:border-slate-850">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input 
                  value={buscarContactoFwd}
                  onChange={(e) => setBuscarContactoFwd(e.target.value)}
                  placeholder="Buscar destinatario..." 
                  className="pl-10 bg-slate-50 dark:bg-slate-800 border-none h-9 rounded-lg"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {contactosPermitidos
                .filter(c => `${c.nombre} ${c.apellidos}`.toLowerCase().includes(buscarContactoFwd.toLowerCase()))
                .length === 0 ? (
                  <p className="text-center text-xs text-gray-400 py-8">No hay contactos disponibles</p>
                ) : (
                  contactosPermitidos
                    .filter(c => `${c.nombre} ${c.apellidos}`.toLowerCase().includes(buscarContactoFwd.toLowerCase()))
                    .map(c => (
                      <div 
                        key={c.id}
                        className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div 
                            className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold shrink-0 text-xs"
                            style={{ backgroundColor: getAvatarColor(c.rol) }}
                          >
                            {c.fotoPerfil ? (
                              <img src={c.fotoPerfil} alt="Perfil" className="w-full h-full rounded-full object-cover" />
                            ) : (
                              c.nombre.charAt(0) + (c.apellidos ? c.apellidos.charAt(0) : '')
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold truncate text-gray-800 dark:text-gray-100">
                              {c.nombre} {c.apellidos}
                            </p>
                            <span className="text-[9px] bg-slate-100 dark:bg-slate-700 px-1 py-0.2 rounded text-gray-500 dark:text-gray-400">
                              {formatRol(c.rol)}
                            </span>
                          </div>
                        </div>
                        <Button 
                          size="sm" 
                          onClick={() => handleReenviarMsgConfirmar(c.id)}
                          className="text-[11px] h-8 rounded-lg font-semibold"
                          style={{ backgroundColor: tema.primario }}
                        >
                          Reenviar
                        </Button>
                      </div>
                    ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMACIÓN: ELIMINAR MENSAJE */}
      {mensajeAEliminar && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 w-full max-w-xs text-center shadow-2xl">
            <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-gray-800 dark:text-white">¿Eliminar este mensaje?</h3>
            <p className="text-xs text-gray-400 mt-1">Esta acción lo borrará permanentemente de tu chat.</p>
            <div className="flex gap-2.5 mt-4 justify-center">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setMensajeAEliminar(null)}
                className="text-xs h-9 rounded-lg"
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleEliminarMsgConfirmar}
                className="text-xs h-9 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold"
              >
                Eliminar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMACIÓN: VACIAR CHAT */}
      {confirmarVaciar && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 w-full max-w-sm text-center shadow-2xl">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
            <h3 className="text-base font-bold text-gray-800 dark:text-white">¿Vaciar toda la conversación?</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 px-2">
              Se eliminarán permanentemente todos los mensajes con <strong>{contactoActivo?.nombre} {contactoActivo?.apellidos}</strong>. Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-2.5 mt-5 justify-center">
              <Button 
                variant="outline" 
                onClick={() => setConfirmarVaciar(false)}
                className="rounded-xl px-4"
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleVaciarChatConfirmar}
                className="rounded-xl px-4 bg-red-600 hover:bg-red-700 text-white font-semibold"
              >
                Vaciar
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default MensajesModule;

