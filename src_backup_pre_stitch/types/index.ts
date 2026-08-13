// ============================================
// TIPOS DEL SISTEMA GRUPO AMIGOS IBC
// ============================================

// Roles del sistema con jerarquía
export type RolUsuario = 
  | 'pastor_principal'
  | 'administrador'
  | 'pastor'
  | 'lider_mentor'
  | 'lider_gap'
  | 'timoteo'
  | 'facilitador';

// Tipo de documento
export type TipoDocumento = 'CC' | 'TI' | 'CE' | 'Pasaporte';

// Estado civil
export type EstadoCivil = 'Casado' | 'Soltero' | 'Union Libre' | 'Viudo';

// Sexo
export type Sexo = 'Masculino' | 'Femenino';

// Módulo EFC
export type ModuloEFC = 'Discipulado' | 'Panorama Bíblico' | 'Fundamentos de Fe' | 'Guerra Espiritual' | 'Liderazgo Estratégico' | 'Ninguno';

// Franja Generacional
export type FranjaGeneracional = 'Timothy Kids' | 'Nexus' | 'Adic' | 'Keepers';

// Área de Servidores
export type AreaServidores = 'Staff' | 'CAS';

// Área de Flamas de Fuego
export type AreaFlamasFuego = 'Danza' | 'Alabanza' | 'Músicos';

// Ministerios disponibles
export type Ministerio = 
  | 'Franja Generacional'
  | 'Forjados'
  | 'Mujer Real'
  | 'Kairos'
  | 'Años Dorados'
  | 'Servidores'
  | 'Intercesión'
  | 'Flamas de Fuego'
  | 'Conexión'
  | 'Comunicaciones'
  | 'Escuela de Formación Cristiana (EFC)'
  | 'Protocolo';

// Frecuencia de reunión GAP
export type FrecuenciaReunion = 'Semanal' | 'Quincenal' | 'Mensual';

// Modalidad de reunión GAP
export type ModalidadReunion = 'Presencial' | 'Virtual' | 'Mixta';

// Ubicación de reunión GAP
export type UbicacionReunion = 'Casa' | 'Iglesia';

// Prioridad de escalamiento
export type PrioridadEscalamiento = 'Normal' | 'Importante' | 'Urgente';

// Estado de escalamiento
export type EstadoEscalamiento = 'Abierto' | 'En Tratamiento' | 'Cerrado' | 'Escalado';

// Clasificación de problema en escalamiento
export type ClasificacionProblema = 'Doctrinal' | 'Moral' | 'Relacional';

// Escala de evaluación
export type EscalaEvaluacion = 'Espiritual' | 'Muy buena' | 'Buena' | 'Regular' | 'Mala' | 'Muy Mala';

// ============================================
// INTERFACES PRINCIPALES
// ============================================

export interface Usuario {
  id: string;
  correo: string;
  nombre: string;
  apellidos: string;
  rol: RolUsuario;
  activo: boolean;
  claveTemporal: string;
  fechaRegistro: string;
  ultimoAcceso?: string;
  fotoPerfil?: string;
  
  // Información personal
  tipoDocumento: TipoDocumento;
  numeroDocumento: string;
  fechaNacimiento: string;
  sexo: Sexo;
  estadoCivil: EstadoCivil;
  telefono: string;
  numeroWhatsApp?: string;
  direccion: string;
  barrio: string;
  departamento: string;
  profesion: string;
  
  // Información ministerial
  esMiembroIBC: boolean;
  esBautizado: boolean;
  escuelaFormacion: 'Graduado' | 'Cursando' | 'No';
  moduloEFC?: ModuloEFC;
  ministerios: Ministerio[];
  franjaGeneracional?: string;
  areaServidores?: string;
  areaFlamasFuego?: string;
  
  // Jerarquía
  pastorId?: string;
  liderMentorId?: string;
  liderGapId?: string;
  gapId?: string;
}

export interface GAP {
  id: string;
  numero: number;
  codigo: string; // GAP-1, GAP-2, etc.
  
  // Líderes
  liderGapId: string;
  liderGapNombre: string;
  timoteoId: string;
  timoteoNombre: string;
  
  // Responsables
  pastorId: string;
  pastorNombre: string;
  liderMentorId: string;
  liderMentorNombre: string;
  
  // Ubicación
  zonaId?: string;
  direccion: string;
  barrio: string;
  departamento: string;
  ubicacionReunion: UbicacionReunion;
  
  // Miembros (máximo 10 + 2 coordinadores = 12)
  miembros: MiembroGAP[];
  
  // Información de reunión
  diaReunion: string;
  horaReunion: string;
  frecuencia: FrecuenciaReunion;
  modalidad: ModalidadReunion;
  activo: boolean;
  fechaCreacion: string;
  
  // Información de reunión confirmada
  reunionConfirmada?: boolean;
  fechaReunionConfirmada?: string;
  anfitrion?: string;
}

export interface MiembroGAP {
  id: string;
  nombres: string;
  apellidos: string;
  tipoDocumento: TipoDocumento;
  numeroDocumento: string;
  fechaNacimiento: string;
  sexo: Sexo;
  estadoCivil: EstadoCivil;
  telefono: string;
  numeroWhatsApp?: string;
  correo?: string;
  direccion: string;
  barrio: string;
  departamento: string;
  profesion: string;
  foto?: string;
  
  // Ministerial
  esMiembroIBC: boolean;
  esBautizado: boolean;
  escuelaFormacion: 'Graduado' | 'Cursando' | 'No';
  moduloEFC?: ModuloEFC;
  ministerios: Ministerio[];
  franjaGeneracional?: string;
  areaServidores?: string;
  areaFlamasFuego?: string;
  
  // Referencia al GAP
  gapId: string;
  fechaRegistro: string;
}

export interface Zona {
  id: string;
  nombre: string;
  descripcion: string;
  barrios: string[];
  latitud?: number;
  longitud?: number;
  gapsAsignados: string[];
  densidadPoblacional?: number;
  activa: boolean;
}

export interface Escalamiento {
  id: string;
  titulo: string;
  descripcion: string;
  clasificacion: ClasificacionProblema;
  prioridad: PrioridadEscalamiento;
  estado: EstadoEscalamiento;
  evaluacion?: EscalaEvaluacion;
  
  // Quién creó el caso
  creadorId: string;
  creadorNombre: string;
  creadorRol: RolUsuario;
  
  // Quién debe atender
  asignadoAId?: string;
  asignadoANombre?: string;
  asignadoARol?: RolUsuario;
  
  // Jerarquía para filtrado
  gapId?: string;
  liderMentorId?: string;
  pastorId?: string;
  
  // Fechas
  fechaCreacion: string;
  fechaLimite?: string;
  fechaCierre?: string;
  
  // Seguimiento
  respuestas: RespuestaEscalamiento[];
  
  // Para escalamiento
  escaladoA?: string;
  motivoEscalamiento?: string;
}

export interface RespuestaEscalamiento {
  id: string;
  escalamientoId: string;
  usuarioId: string;
  usuarioNombre: string;
  usuarioRol: RolUsuario;
  mensaje: string;
  fecha: string;
  accion: 'Comentario' | 'En Tratamiento' | 'Cerrado' | 'Escalado';
}

export interface Mensaje {
  id: string;
  remitenteId: string;
  remitenteNombre: string;
  remitenteRol: RolUsuario;
  destinatarios: string[]; // IDs de usuarios
  destinatariosRoles?: RolUsuario[]; // Para mensajes masivos por rol
  asunto: string;
  contenido: string;
  fechaEnvio: string;
  esMasivo: boolean;
  leidoPor: string[];
  tipoEnvio?: 'Sistema' | 'WhatsApp' | 'Correo';
}

export interface Notificacion {
  id: string;
  usuarioId: string;
  titulo: string;
  mensaje: string;
  tipo: 'info' | 'success' | 'warning' | 'error';
  fecha: string;
  leida: boolean;
  enlace?: string;
}

export interface ReporteGAP {
  id: string;
  gapId: string;
  gapNombre: string;
  periodo: string;
  fechaGeneracion: string;
  generadoPor: string;
  
  // Indicadores
  asistenciaPromedio: number;
  nuevosMiembros: number;
  bajas: number;
  bautizos: number;
  graduadosEFC: number;
  
  // Escalamientos
  escalamientosAbiertos: number;
  escalamientosCerrados: number;
  
  // Evaluación
  evaluacionMentor?: string;
  recomendaciones?: string;
}

export interface TemaConfiguracion {
  primario: string;
  secundario: string;
  fondo: string;
  texto: string;
  exito: string;
  advertencia: string;
  error: string;
  info: string;
  oscuro?: boolean;
}

// Configuración del sistema para administrador
export interface ConfiguracionSistema {
  loginBackgroundImage: string;
  loginLogo: string;
  loginTitulo: string;
  nombreIglesia: string;
  tema: TemaConfiguracion;
}

// Solicitud de reset de contraseña
export interface SolicitudResetPassword {
  id: string;
  usuarioId: string;
  usuarioNombre: string;
  usuarioCorreo: string;
  fechaSolicitud: string;
  estado: 'Pendiente' | 'Procesada';
  procesadaPor?: string;
  fechaProcesamiento?: string;
}

// ============================================
// PERMISOS POR ROL
// ============================================

export interface PermisosRol {
  rol: RolUsuario;
  
  // Usuarios
  crearUsuario: boolean;
  editarUsuario: boolean;
  eliminarUsuario: boolean;
  verUsuarios: boolean;
  
  // GAPs
  crearGAP: boolean;
  editarGAP: boolean;
  eliminarGAP: boolean;
  verGAPs: boolean;
  
  // Miembros
  crearMiembro: boolean;
  editarMiembro: boolean;
  eliminarMiembro: boolean;
  verMiembros: boolean;
  
  // Escalamientos
  crearEscalamiento: boolean;
  atenderEscalamiento: boolean;
  verEscalamientos: boolean;
  escalarCaso: boolean;
  
  // Zonas
  crearZona: boolean;
  editarZona: boolean;
  verZonas: boolean;
  
  // Reportes
  verReportes: boolean;
  generarReporte: boolean;
  
  // Mensajes
  enviarMensaje: boolean;
  enviarMensajeMasivo: boolean;
  
  // Configuración
  cambiarTema: boolean;
  configurarSistema: boolean;
  resetPassword: boolean;
  
  // Herramientas técnicas (solo administrador)
  verLogs: boolean;
  mantenimientoSistema: boolean;
  gestionPermisos: boolean;
  respaldos: boolean;
}

// ============================================
// ESTADÍSTICAS
// ============================================

export interface EstadisticasDashboard {
  totalUsuarios: number;
  totalGAPs: number;
  totalMiembros: number;
  totalZonas: number;
  
  // Escalamientos
  escalamientosAbiertos: number;
  escalamientosUrgentes: number;
  escalamientosCerradosMes: number;
  
  // Miembros
  miembrosNuevosMes: number;
  bautizosMes: number;
  graduadosEFC: number;
  
  // Asistencia
  asistenciaPromedio: number;
  gruposActivos: number;
  gruposInactivos: number;
}

// ============================================
// CALENDARIO DE EVENTOS
// ============================================

export type TipoEvento = 'Reunion' | 'Evento' | 'Cumpleaños' | 'Actividad' | 'ReunionGAP';
export type PrioridadEvento = 'Alta' | 'Media' | 'Baja';

export interface EventoCalendario {
  id: string;
  titulo: string;
  descripcion: string;
  tipo: TipoEvento;
  fecha: string;
  hora?: string;
  ubicacion?: string;
  gapId?: string;
  creadorId: string;
  creadorNombre: string;
  creadorRol: RolUsuario;
  prioridad: PrioridadEvento;
  // Visibilidad del evento
  visibleParaTodos: boolean;
  visibleParaRoles?: RolUsuario[];
  visibleParaGAPs?: string[];
  // Recordatorio
  recordatorioEnviado: boolean;
  fechaRecordatorio?: string;
  // Estado
  activo: boolean;
  fechaCreacion: string;
}

// ============================================
// REGISTRO DE ASISTENCIA
// ============================================

export interface AsistenciaMiembro {
  miembroId: string;
  presente: boolean;
}

export interface RegistroAsistencia {
  id: string;
  gapId: string;
  fecha: string;
  asistencias: AsistenciaMiembro[];
  totalAsistentes: number;
  nuevosMiembros: number;
  visitantes: number;
  observaciones?: string;
  registradoPor: string;
  registradoPorNombre: string;
  fechaRegistro: string;
}

// ============================================
// MÓDULO ENSEÑANZA
// ============================================

export type TipoMaterial = 'PDF' | 'Video' | 'Audio' | 'Imagen' | 'Documento';

export interface MaterialEnsenanza {
  id: string;
  titulo: string;
  descripcion: string;
  tipo: TipoMaterial;
  url: string;
  subidoPor: string;
  subidoPorNombre: string;
  fechaSubida: string;
  paraFrecuencia: 'Semanal' | 'Quincenal' | 'Ambas';
  activo: boolean;
}

// ============================================
// PETICIONES DE ORACIÓN
// ============================================

export interface PeticionOracion {
  id: string;
  titulo: string;
  descripcion: string;
  creadorId: string;
  creadorNombre: string;
  creadorRol: RolUsuario;
  gapId?: string;
  pastorId: string;
  fechaCreacion: string;
  oracionRecibida: boolean;
  fechaOracionRecibida?: string;
  comentarios?: string;
}

// ============================================
// REGISTRO DE ASISTENCIA
// ============================================

export interface AsistenciaReunion {
  id: string;
  gapId: string;
  gapCodigo: string;
  fecha: string;
  tema: string;
  enseñanza: string;
  miembrosPresentes: string[];
  invitados: Invitado[];
  totalAsistentes: number;
  evidenciaFotografica?: string[];
  registradoPor: string;
  registradoPorNombre: string;
  fechaRegistro: string;
}

export interface Invitado {
  id: string;
  nombres: string;
  apellidos: string;
  telefono?: string;
  asistio: boolean;
}

// ============================================
// VIDEOLLAMADAS
// ============================================

export interface SalaVideollamada {
  id: string;
  gapId: string;
  gapCodigo: string;
  iniciadaPor: string;
  iniciadaPorNombre: string;
  iniciadaPorRol: RolUsuario;
  fechaInicio: string;
  activa: boolean;
  participantes: ParticipanteVideollamada[];
  urlSala: string;
}

export interface ParticipanteVideollamada {
  usuarioId: string;
  nombre: string;
  rol: RolUsuario;
  fechaUnion: string;
  activo: boolean;
}

// ============================================
// SISTEMA DE CUESTIONARIOS
// ============================================

export type TipoPregunta = 
  | 'texto_libre'
  | 'opcion_multiple'
  | 'seleccion_unica'
  | 'escala_calificacion'
  | 'verdadero_falso'
  | 'seleccion_multiple'
  | 'fecha'
  | 'numero'
  | 'email'
  | 'telefono'
  | 'archivo'
  | 'tabla_dinamica'
  | 'desplegable'
  | 'casillas';

export interface OpcionRespuesta {
  id: string;
  texto: string;
  valor?: string | number;
  orden: number;
  subOpciones?: OpcionRespuesta[];
}

export interface PreguntaCuestionario {
  id: string;
  titulo: string;
  descripcion?: string;
  tipo: TipoPregunta;
  opciones: OpcionRespuesta[];
  requerida: boolean;
  orden: number;
  escalaMin?: number;
  escalaMax?: number;
  etiquetaMin?: string;
  etiquetaMax?: string;
  placeholder?: string;
  maxCaracteres?: number;
  filasTabla?: string[];
  columnasTabla?: string[];
}

export interface Cuestionario {
  id: string;
  titulo: string;
  descripcion: string;
  instrucciones?: string;
  preguntas: PreguntaCuestionario[];
  activo: boolean;
  creadoPor: string;
  creadoPorNombre: string;
  fechaCreacion: string;
  fechaModificacion: string;
  permitirMultiplesRespuestas: boolean;
  requerirAutenticacion: boolean;
  fechaInicio?: string;
  fechaFin?: string;
  asignadoARoles?: RolUsuario[];
  asignadoAUsuarios?: string[];
  asignadoAGAPs?: string[];
}

export interface RespuestaPregunta {
  preguntaId: string;
  valor: string | string[] | number | boolean | Record<string, string>;
}

export interface RespuestaCuestionario {
  id: string;
  cuestionarioId: string;
  usuarioId?: string;
  usuarioNombre?: string;
  usuarioRol?: RolUsuario;
  respuestas: RespuestaPregunta[];
  fechaRespuesta: string;
}
