import type { 
  Usuario, 
  RolUsuario, 
  PermisosRol, 
  GAP, 
  MiembroGAP, 
  Zona, 
  Escalamiento, 
  Mensaje, 
  Notificacion,
  ReporteGAP,
  Ministerio,
  ConfiguracionSistema,
  SolicitudResetPassword,
  EventoCalendario,
  MaterialEnsenanza,
  PeticionOracion,
  RegistroAsistencia,
  SalaVideollamada,
  Cuestionario,
  RespuestaCuestionario
} from '@/types';

// ============================================
// CONFIGURACIÓN DEL SISTEMA
// ============================================

export const configuracionSistema: ConfiguracionSistema = {
  loginBackgroundImage: '/bg-login.jpeg',
  loginLogo: '/logo-gap.jpeg',
  loginTitulo: 'Grupos de Amigos con Propósito (G.A.P)',
  nombreIglesia: 'Iglesia Bautista Central',
  tema: {
    primario: '#0ea5e9',
    secundario: '#0d9488',
    fondo: '#f8fafc',
    texto: '#1e293b',
    exito: '#22c55e',
    advertencia: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
  }
};

// ============================================
// PERMISOS POR ROL
// ============================================

export const permisosPorRol: Record<RolUsuario, PermisosRol> = {
  pastor_principal: {
    rol: 'pastor_principal',
    crearUsuario: true,
    editarUsuario: true,
    eliminarUsuario: true,
    verUsuarios: true,
    crearGAP: true,
    editarGAP: true,
    eliminarGAP: true,
    verGAPs: true,
    crearMiembro: true,
    editarMiembro: true,
    eliminarMiembro: true,
    verMiembros: true,
    crearEscalamiento: true,
    atenderEscalamiento: true,
    verEscalamientos: true,
    escalarCaso: true,
    crearZona: true,
    editarZona: true,
    verZonas: true,
    verReportes: true,
    generarReporte: true,
    enviarMensaje: true,
    enviarMensajeMasivo: true,
    cambiarTema: true,
    configurarSistema: false,
    resetPassword: false,
    verLogs: false,
    mantenimientoSistema: false,
    gestionPermisos: false,
    respaldos: false,
  },
  administrador: {
    rol: 'administrador',
    // MODO DIOS - El administrador tiene control TOTAL del sistema
    crearUsuario: true,        // Crear CUALQUIER rol incluyendo pastor_principal
    editarUsuario: true,       // Editar cualquier usuario
    eliminarUsuario: true,     // Eliminar cualquier usuario
    verUsuarios: true,         // Ver TODOS los usuarios
    crearGAP: true,            // Crear GAPs
    editarGAP: true,           // Editar GAPs
    eliminarGAP: true,         // Eliminar GAPs
    verGAPs: true,             // Ver todos los GAPs
    crearMiembro: true,        // Crear miembros
    editarMiembro: true,       // Editar miembros
    eliminarMiembro: true,     // Eliminar miembros
    verMiembros: true,         // Ver todos los miembros
    crearEscalamiento: true,
    atenderEscalamiento: true,
    verEscalamientos: true,    // Ver todos los escalamientos
    escalarCaso: true,
    crearZona: true,
    editarZona: true,
    verZonas: true,            // Ver todas las zonas
    verReportes: true,         // Ver todos los reportes
    generarReporte: true,
    enviarMensaje: true,       // Enviar mensajes
    enviarMensajeMasivo: true, // Mensajes masivos
    cambiarTema: true,
    configurarSistema: true,
    resetPassword: true,
    verLogs: true,
    mantenimientoSistema: true,
    gestionPermisos: true,
    respaldos: true,
  },
  pastor: {
    rol: 'pastor',
    crearUsuario: false,
    editarUsuario: false,
    eliminarUsuario: false,
    verUsuarios: false,
    crearGAP: false,
    editarGAP: false,
    eliminarGAP: false,
    verGAPs: true,
    crearMiembro: true,
    editarMiembro: true,
    eliminarMiembro: false,
    verMiembros: true,
    crearEscalamiento: true,
    atenderEscalamiento: true,
    verEscalamientos: true,
    escalarCaso: true,
    crearZona: false,
    editarZona: false,
    verZonas: true,
    verReportes: true,
    generarReporte: true,
    enviarMensaje: true,
    enviarMensajeMasivo: false,
    cambiarTema: true,
    configurarSistema: false,
    resetPassword: false,
    verLogs: false,
    mantenimientoSistema: false,
    gestionPermisos: false,
    respaldos: false,
  },
  lider_mentor: {
    rol: 'lider_mentor',
    crearUsuario: false,
    editarUsuario: false,
    eliminarUsuario: false,
    verUsuarios: false,
    crearGAP: false,
    editarGAP: false,
    eliminarGAP: false,
    verGAPs: true,
    crearMiembro: true,
    editarMiembro: true,
    eliminarMiembro: false,
    verMiembros: true,
    crearEscalamiento: true,
    atenderEscalamiento: true,
    verEscalamientos: true,
    escalarCaso: true,
    crearZona: false,
    editarZona: false,
    verZonas: false,
    verReportes: true,
    generarReporte: true,
    enviarMensaje: true,
    enviarMensajeMasivo: false,
    cambiarTema: true,
    configurarSistema: false,
    resetPassword: false,
    verLogs: false,
    mantenimientoSistema: false,
    gestionPermisos: false,
    respaldos: false,
  },
  lider_gap: {
    rol: 'lider_gap',
    crearUsuario: false,
    editarUsuario: false,
    eliminarUsuario: false,
    verUsuarios: false,
    crearGAP: false,
    editarGAP: false,
    eliminarGAP: false,
    verGAPs: false,
    crearMiembro: true,
    editarMiembro: true,
    eliminarMiembro: false,
    verMiembros: true,
    crearEscalamiento: true,
    atenderEscalamiento: true,
    verEscalamientos: true,
    escalarCaso: true,
    crearZona: false,
    editarZona: false,
    verZonas: false,
    verReportes: true,
    generarReporte: true,
    enviarMensaje: true,
    enviarMensajeMasivo: false,
    cambiarTema: true,
    configurarSistema: false,
    resetPassword: false,
    verLogs: false,
    mantenimientoSistema: false,
    gestionPermisos: false,
    respaldos: false,
  },
  timoteo: {
    rol: 'timoteo',
    crearUsuario: false,
    editarUsuario: false,
    eliminarUsuario: false,
    verUsuarios: false,
    crearGAP: false,
    editarGAP: false,
    eliminarGAP: false,
    verGAPs: false,
    crearMiembro: true,
    editarMiembro: false,
    eliminarMiembro: false,
    verMiembros: true,
    crearEscalamiento: true,
    atenderEscalamiento: false,
    verEscalamientos: false,
    escalarCaso: false,
    crearZona: false,
    editarZona: false,
    verZonas: false,
    verReportes: false,
    generarReporte: false,
    enviarMensaje: true,
    enviarMensajeMasivo: false,
    cambiarTema: true,
    configurarSistema: false,
    resetPassword: false,
    verLogs: false,
    mantenimientoSistema: false,
    gestionPermisos: false,
    respaldos: false,
  },
  facilitador: {
    rol: 'facilitador',
    crearUsuario: false,
    editarUsuario: false,
    eliminarUsuario: false,
    verUsuarios: false,
    crearGAP: false,
    editarGAP: false,
    eliminarGAP: false,
    verGAPs: false,
    crearMiembro: true,
    editarMiembro: false,
    eliminarMiembro: false,
    verMiembros: true,
    crearEscalamiento: false,
    atenderEscalamiento: false,
    verEscalamientos: false,
    escalarCaso: false,
    crearZona: false,
    editarZona: false,
    verZonas: false,
    verReportes: false,
    generarReporte: false,
    enviarMensaje: true,
    enviarMensajeMasivo: false,
    cambiarTema: true,
    configurarSistema: false,
    resetPassword: false,
    verLogs: false,
    mantenimientoSistema: false,
    gestionPermisos: false,
    respaldos: false,
  },
};

// ============================================
// USUARIOS DEL SISTEMA
// ============================================

export const usuariosMock: Usuario[] = [
  {
    id: '1',
    correo: 'pastor@ibc.org',
    nombre: 'Carlos',
    apellidos: 'Martínez Rodríguez',
    rol: 'pastor_principal',
    activo: true,
    claveTemporal: '123456',
    fechaRegistro: '2024-01-01',
    ultimoAcceso: '2026-03-01',
    tipoDocumento: 'CC',
    numeroDocumento: '1234567890',
    fechaNacimiento: '1975-05-15',
    sexo: 'Masculino',
    estadoCivil: 'Casado',
    telefono: '3001234567',
    numeroWhatsApp: '573001234567',
    direccion: 'Calle 123 #45-67',
    barrio: 'El Poblado',
    departamento: 'Antioquia',
    profesion: 'Pastor',
    esMiembroIBC: true,
    esBautizado: true,
    escuelaFormacion: 'Graduado',
    ministerios: ['Conexión', 'Escuela de Formación Cristiana (EFC)'],
  },
  {
    id: '2',
    correo: 'admin@ibc.org',
    nombre: 'María',
    apellidos: 'González López',
    rol: 'administrador',
    activo: true,
    claveTemporal: '123456',
    fechaRegistro: '2024-01-15',
    ultimoAcceso: '2026-03-01',
    tipoDocumento: 'CC',
    numeroDocumento: '2345678901',
    fechaNacimiento: '1980-08-20',
    sexo: 'Femenino',
    estadoCivil: 'Soltero',
    telefono: '3102345678',
    numeroWhatsApp: '573102345678',
    direccion: 'Carrera 45 #67-89',
    barrio: 'Laureles',
    departamento: 'Antioquia',
    profesion: 'Administradora',
    esMiembroIBC: true,
    esBautizado: true,
    escuelaFormacion: 'Graduado',
    ministerios: ['Servidores'],
    areaServidores: 'Staff',
  },
  {
    id: '3',
    correo: 'pastor1@ibc.org',
    nombre: 'Pedro',
    apellidos: 'Sánchez García',
    rol: 'pastor',
    activo: true,
    claveTemporal: '123456',
    fechaRegistro: '2024-02-01',
    ultimoAcceso: '2026-02-28',
    tipoDocumento: 'CC',
    numeroDocumento: '3456789012',
    fechaNacimiento: '1978-03-10',
    sexo: 'Masculino',
    estadoCivil: 'Casado',
    telefono: '3203456789',
    numeroWhatsApp: '573203456789',
    direccion: 'Avenida 78 #90-12',
    barrio: 'Envigado',
    departamento: 'Antioquia',
    profesion: 'Ingeniero',
    esMiembroIBC: true,
    esBautizado: true,
    escuelaFormacion: 'Graduado',
    ministerios: ['Escuela de Formación Cristiana (EFC)', 'Conexión'],
  },
  {
    id: '4',
    correo: 'pastor2@ibc.org',
    nombre: 'Ana',
    apellidos: 'Ramírez Torres',
    rol: 'pastor',
    activo: true,
    claveTemporal: '123456',
    fechaRegistro: '2024-02-15',
    ultimoAcceso: '2026-02-27',
    tipoDocumento: 'CC',
    numeroDocumento: '4567890123',
    fechaNacimiento: '1982-11-25',
    sexo: 'Femenino',
    estadoCivil: 'Casado',
    telefono: '3304567890',
    numeroWhatsApp: '573304567890',
    direccion: 'Calle 90 #12-34',
    barrio: 'Sabaneta',
    departamento: 'Antioquia',
    profesion: 'Docente',
    esMiembroIBC: true,
    esBautizado: true,
    escuelaFormacion: 'Graduado',
    ministerios: ['Mujer Real', 'Escuela de Formación Cristiana (EFC)'],
  },
  {
    id: '5',
    correo: 'lidermentor1@ibc.org',
    nombre: 'Luis',
    apellidos: 'Hernández Castro',
    rol: 'lider_mentor',
    activo: true,
    claveTemporal: '123456',
    fechaRegistro: '2024-03-01',
    ultimoAcceso: '2026-02-26',
    tipoDocumento: 'CC',
    numeroDocumento: '5678901234',
    fechaNacimiento: '1985-07-08',
    sexo: 'Masculino',
    estadoCivil: 'Casado',
    telefono: '3405678901',
    numeroWhatsApp: '573405678901',
    direccion: 'Carrera 12 #34-56',
    barrio: 'Itagüí',
    departamento: 'Antioquia',
    profesion: 'Contador',
    esMiembroIBC: true,
    esBautizado: true,
    escuelaFormacion: 'Graduado',
    ministerios: ['Forjados'],
    pastorId: '3',
  },
  {
    id: '6',
    correo: 'lidergap1@ibc.org',
    nombre: 'Juan',
    apellidos: 'Pérez Díaz',
    rol: 'lider_gap',
    activo: true,
    claveTemporal: '123456',
    fechaRegistro: '2024-03-15',
    ultimoAcceso: '2026-02-25',
    tipoDocumento: 'CC',
    numeroDocumento: '6789012345',
    fechaNacimiento: '1990-01-12',
    sexo: 'Masculino',
    estadoCivil: 'Soltero',
    telefono: '3506789012',
    numeroWhatsApp: '573506789012',
    direccion: 'Calle 34 #56-78',
    barrio: 'Bello',
    departamento: 'Antioquia',
    profesion: 'Estudiante',
    esMiembroIBC: true,
    esBautizado: true,
    escuelaFormacion: 'Cursando',
    moduloEFC: 'Fundamentos de Fe',
    ministerios: ['Forjados'],
    franjaGeneracional: 'Nexus',
    pastorId: '3',
    liderMentorId: '5',
  },
  {
    id: '7',
    correo: 'timoteo1@ibc.org',
    nombre: 'Sofía',
    apellidos: 'López Morales',
    rol: 'timoteo',
    activo: true,
    claveTemporal: '123456',
    fechaRegistro: '2024-04-01',
    ultimoAcceso: '2026-02-24',
    tipoDocumento: 'CC',
    numeroDocumento: '7890123456',
    fechaNacimiento: '1995-09-18',
    sexo: 'Femenino',
    estadoCivil: 'Soltero',
    telefono: '3607890123',
    numeroWhatsApp: '573607890123',
    direccion: 'Avenida 56 #78-90',
    barrio: 'Copacabana',
    departamento: 'Antioquia',
    profesion: 'Diseñadora',
    esMiembroIBC: true,
    esBautizado: true,
    escuelaFormacion: 'Cursando',
    moduloEFC: 'Panorama Bíblico',
    ministerios: ['Flamas de Fuego'],
    areaFlamasFuego: 'Danza',
    pastorId: '3',
    liderMentorId: '5',
    liderGapId: '6',
    gapId: 'gap1',
  },
  {
    id: '8',
    correo: 'facilitador1@ibc.org',
    nombre: 'Diego',
    apellidos: 'Torres Vargas',
    rol: 'facilitador',
    activo: true,
    claveTemporal: '123456',
    fechaRegistro: '2024-04-15',
    ultimoAcceso: '2026-02-23',
    tipoDocumento: 'CC',
    numeroDocumento: '8901234567',
    fechaNacimiento: '1988-04-22',
    sexo: 'Masculino',
    estadoCivil: 'Casado',
    telefono: '3708901234',
    numeroWhatsApp: '573708901234',
    direccion: 'Carrera 78 #90-12',
    barrio: 'La Estrella',
    departamento: 'Antioquia',
    profesion: 'Médico',
    esMiembroIBC: true,
    esBautizado: true,
    escuelaFormacion: 'Graduado',
    ministerios: ['Servidores'],
    areaServidores: 'CAS',
    pastorId: '1',
  },
];

// ============================================
// GAPs
// ============================================

export const gapsMock: GAP[] = [
  {
    id: 'gap1',
    numero: 1,
    codigo: 'GAP-1',
    liderGapId: '6',
    liderGapNombre: 'Juan Pérez Díaz',
    timoteoId: '7',
    timoteoNombre: 'Sofía López Morales',
    pastorId: '3',
    pastorNombre: 'Pedro Sánchez García',
    liderMentorId: '5',
    liderMentorNombre: 'Luis Hernández Castro',
    zonaId: 'zona1',
    direccion: 'Calle 34 #56-78',
    barrio: 'Bello',
    departamento: 'Antioquia',
    ubicacionReunion: 'Casa',
    diaReunion: 'Martes',
    horaReunion: '19:00',
    frecuencia: 'Semanal',
    modalidad: 'Presencial',
    activo: true,
    fechaCreacion: '2024-03-15',
    miembros: [],
    reunionConfirmada: true,
    fechaReunionConfirmada: '2026-03-08',
  },
  {
    id: 'gap2',
    numero: 2,
    codigo: 'GAP-2',
    liderGapId: '9',
    liderGapNombre: 'Carlos Ruiz Silva',
    timoteoId: '10',
    timoteoNombre: 'María Castro Luna',
    pastorId: '3',
    pastorNombre: 'Pedro Sánchez García',
    liderMentorId: '5',
    liderMentorNombre: 'Luis Hernández Castro',
    zonaId: 'zona1',
    direccion: 'Iglesia Bautista Central de Barranquilla Cra 44 con calle 47',
    barrio: 'Laureles',
    departamento: 'Antioquia',
    ubicacionReunion: 'Iglesia',
    diaReunion: 'Miércoles',
    horaReunion: '19:30',
    frecuencia: 'Semanal',
    modalidad: 'Presencial',
    activo: true,
    fechaCreacion: '2024-04-01',
    miembros: [],
    reunionConfirmada: true,
    fechaReunionConfirmada: '2026-03-08',
  },
  {
    id: 'gap3',
    numero: 3,
    codigo: 'GAP-3',
    liderGapId: '11',
    liderGapNombre: 'Andrea Gómez Paz',
    timoteoId: '12',
    timoteoNombre: 'Roberto Vega Sol',
    pastorId: '4',
    pastorNombre: 'Ana Ramírez Torres',
    liderMentorId: '13',
    liderMentorNombre: 'Patricia Mendoza Ríos',
    zonaId: 'zona2',
    direccion: 'Avenida 78 #90-12',
    barrio: 'Envigado',
    departamento: 'Antioquia',
    ubicacionReunion: 'Casa',
    diaReunion: 'Jueves',
    horaReunion: '20:00',
    frecuencia: 'Quincenal',
    modalidad: 'Mixta',
    activo: true,
    fechaCreacion: '2024-04-15',
    miembros: [],
    reunionConfirmada: false,
  },
];

// ============================================
// MIEMBROS DE GAP
// ============================================

export const miembrosMock: MiembroGAP[] = [
  {
    id: 'm1',
    nombres: 'José',
    apellidos: 'García López',
    tipoDocumento: 'CC',
    numeroDocumento: '9012345678',
    fechaNacimiento: '1985-06-15',
    sexo: 'Masculino',
    estadoCivil: 'Casado',
    telefono: '3809012345',
    numeroWhatsApp: '573809012345',
    correo: 'jose@email.com',
    direccion: 'Calle 12 #34-56',
    barrio: 'Bello',
    departamento: 'Antioquia',
    profesion: 'Ingeniero',
    esMiembroIBC: true,
    esBautizado: true,
    escuelaFormacion: 'Graduado',
    ministerios: ['Forjados'],
    gapId: 'gap1',
    fechaRegistro: '2024-05-01',
  },
  {
    id: 'm2',
    nombres: 'Carmen',
    apellidos: 'Rodríguez Paz',
    tipoDocumento: 'CC',
    numeroDocumento: '0123456789',
    fechaNacimiento: '1990-03-20',
    sexo: 'Femenino',
    estadoCivil: 'Soltero',
    telefono: '3900123456',
    numeroWhatsApp: '573900123456',
    correo: 'carmen@email.com',
    direccion: 'Carrera 23 #45-67',
    barrio: 'Bello',
    departamento: 'Antioquia',
    profesion: 'Docente',
    esMiembroIBC: true,
    esBautizado: true,
    escuelaFormacion: 'Cursando',
    moduloEFC: 'Panorama Bíblico',
    ministerios: ['Mujer Real'],
    gapId: 'gap1',
    fechaRegistro: '2024-05-15',
  },
  {
    id: 'm3',
    nombres: 'Miguel',
    apellidos: 'Ángel Torres',
    tipoDocumento: 'CC',
    numeroDocumento: '1122334455',
    fechaNacimiento: '1988-11-08',
    sexo: 'Masculino',
    estadoCivil: 'Casado',
    telefono: '3011122334',
    correo: 'miguel@email.com',
    direccion: 'Avenida 34 #56-78',
    barrio: 'Laureles',
    departamento: 'Antioquia',
    profesion: 'Comerciante',
    esMiembroIBC: false,
    esBautizado: false,
    escuelaFormacion: 'No',
    ministerios: [],
    gapId: 'gap2',
    fechaRegistro: '2024-06-01',
  },
];

// ============================================
// ZONAS
// ============================================

export const zonasMock: Zona[] = [
  {
    id: 'zona1',
    nombre: 'Zona Norte - Bello y Copacabana',
    descripcion: 'Zona comprendida entre los municipios de Bello y Copacabana',
    barrios: ['Bello Centro', 'Niquía', 'Fontidueño', 'Copacabana Centro'],
    latitud: 6.3333,
    longitud: -75.5667,
    gapsAsignados: ['gap1', 'gap2'],
    densidadPoblacional: 15000,
    activa: true,
  },
  {
    id: 'zona2',
    nombre: 'Zona Sur - Envigado y Sabaneta',
    descripcion: 'Zona comprendida entre los municipios de Envigado y Sabaneta',
    barrios: ['Envigado Centro', 'Las Vegas', 'Sabaneta Centro', 'Pan de Azúcar'],
    latitud: 6.1667,
    longitud: -75.5833,
    gapsAsignados: ['gap3'],
    densidadPoblacional: 12000,
    activa: true,
  },
  {
    id: 'zona3',
    nombre: 'Zona Occidente - Laureles y Estadio',
    descripcion: 'Zona comprendida entre los barrios Laureles y Estadio',
    barrios: ['Laureles', 'Estadio', 'Conquistadores', 'La Castellana'],
    latitud: 6.2500,
    longitud: -75.5833,
    gapsAsignados: [],
    densidadPoblacional: 20000,
    activa: true,
  },
];

// ============================================
// ESCALAMIENTOS
// ============================================

export const escalamientosMock: Escalamiento[] = [
  {
    id: 'esc1',
    titulo: 'Solicitud de oración por enfermedad',
    descripcion: 'Hermana Carmen requiere oración por cirugía programada',
    clasificacion: 'Relacional',
    prioridad: 'Importante',
    estado: 'Abierto',
    creadorId: '6',
    creadorNombre: 'Juan Pérez Díaz',
    creadorRol: 'lider_gap',
    gapId: 'gap1',
    liderMentorId: '5',
    pastorId: '3',
    fechaCreacion: '2026-03-01',
    fechaLimite: '2026-03-05',
    respuestas: [],
  },
  {
    id: 'esc2',
    titulo: 'Necesidad económica urgente',
    descripcion: 'Familia García requiere ayuda para pago de arriendo',
    clasificacion: 'Relacional',
    prioridad: 'Urgente',
    estado: 'En Tratamiento',
    creadorId: '7',
    creadorNombre: 'Sofía López Morales',
    creadorRol: 'timoteo',
    asignadoAId: '5',
    asignadoANombre: 'Luis Hernández Castro',
    asignadoARol: 'lider_mentor',
    gapId: 'gap1',
    liderMentorId: '5',
    pastorId: '3',
    fechaCreacion: '2026-02-28',
    fechaLimite: '2026-03-02',
    respuestas: [
      {
        id: 'resp1',
        escalamientoId: 'esc2',
        usuarioId: '5',
        usuarioNombre: 'Luis Hernández Castro',
        usuarioRol: 'lider_mentor',
        mensaje: 'Estoy revisando el caso, contactaré a la familia esta semana',
        fecha: '2026-03-01',
        accion: 'En Tratamiento',
      },
    ],
  },
  {
    id: 'esc3',
    titulo: 'Solicitud de bautismo',
    descripcion: 'Hermano Miguel Ángel desea ser bautizado',
    clasificacion: 'Doctrinal',
    prioridad: 'Normal',
    estado: 'Cerrado',
    creadorId: '6',
    creadorNombre: 'Juan Pérez Díaz',
    creadorRol: 'lider_gap',
    asignadoAId: '3',
    asignadoANombre: 'Pedro Sánchez García',
    asignadoARol: 'pastor',
    gapId: 'gap2',
    liderMentorId: '5',
    pastorId: '3',
    fechaCreacion: '2026-02-20',
    fechaCierre: '2026-02-25',
    respuestas: [
      {
        id: 'resp2',
        escalamientoId: 'esc3',
        usuarioId: '3',
        usuarioNombre: 'Pedro Sánchez García',
        usuarioRol: 'pastor',
        mensaje: 'Bautismo programado para el domingo 28 de febrero',
        fecha: '2026-02-22',
        accion: 'Cerrado',
      },
    ],
  },
  {
    id: 'esc4',
    titulo: 'Conflicto entre miembros del GAP',
    descripcion: 'Dos miembros del grupo tienen desacuerdos personales que afectan las reuniones',
    clasificacion: 'Relacional',
    prioridad: 'Urgente',
    estado: 'Abierto',
    creadorId: '6',
    creadorNombre: 'Juan Pérez Díaz',
    creadorRol: 'lider_gap',
    gapId: 'gap1',
    liderMentorId: '5',
    pastorId: '3',
    fechaCreacion: '2026-03-05',
    fechaLimite: '2026-03-10',
    respuestas: [],
  },
  {
    id: 'esc5',
    titulo: 'Duda sobre doctrina de la iglesia',
    descripcion: 'Miembro nuevo tiene preguntas sobre nuestras creencias bautistas',
    clasificacion: 'Doctrinal',
    prioridad: 'Normal',
    estado: 'En Tratamiento',
    creadorId: '7',
    creadorNombre: 'Sofía López Morales',
    creadorRol: 'timoteo',
    asignadoAId: '6',
    asignadoANombre: 'Juan Pérez Díaz',
    asignadoARol: 'lider_gap',
    gapId: 'gap1',
    liderMentorId: '5',
    pastorId: '3',
    fechaCreacion: '2026-03-02',
    respuestas: [
      {
        id: 'resp3',
        escalamientoId: 'esc5',
        usuarioId: '6',
        usuarioNombre: 'Juan Pérez Díaz',
        usuarioRol: 'lider_gap',
        mensaje: 'He agendado una reunión para este jueves para aclarar dudas',
        fecha: '2026-03-03',
        accion: 'En Tratamiento',
      },
    ],
  },
];

// ============================================
// MENSAJES
// ============================================

export const mensajesMock: Mensaje[] = [
  {
    id: 'msg1',
    remitenteId: '1',
    remitenteNombre: 'Carlos Martínez Rodríguez',
    remitenteRol: 'pastor_principal',
    destinatarios: ['2', '3', '4', '5'],
    asunto: 'Reunión de líderes - Marzo',
    contenido: 'Estimados líderes, los invito a la reunión mensual este sábado a las 9:00 AM.',
    fechaEnvio: '2026-03-01',
    esMasivo: false,
    leidoPor: ['2', '3'],
    tipoEnvio: 'Sistema',
  },
  {
    id: 'msg2',
    remitenteId: '3',
    remitenteNombre: 'Pedro Sánchez García',
    remitenteRol: 'pastor',
    destinatarios: ['5', '6', '7'],
    asunto: 'Recordatorio: Reporte mensual GAP',
    contenido: 'Por favor enviar los reportes del mes de febrero antes del 5 de marzo.',
    fechaEnvio: '2026-03-01',
    esMasivo: false,
    leidoPor: ['5'],
    tipoEnvio: 'Sistema',
  },
];

// ============================================
// NOTIFICACIONES
// ============================================

export const notificacionesMock: Notificacion[] = [
  {
    id: 'not1',
    usuarioId: '3',
    titulo: 'Nuevo escalamiento urgente',
    mensaje: 'Se ha creado un caso urgente que requiere su atención',
    tipo: 'error',
    fecha: '2026-03-01',
    leida: false,
    enlace: '/escalamientos',
  },
  {
    id: 'not2',
    usuarioId: '5',
    titulo: 'Nuevo miembro en GAP',
    mensaje: 'Se ha registrado un nuevo miembro en GAP Esperanza',
    tipo: 'success',
    fecha: '2026-02-28',
    leida: true,
    enlace: '/gaps',
  },
];

// ============================================
// REPORTES
// ============================================

export const reportesMock: ReporteGAP[] = [
  {
    id: 'rep1',
    gapId: 'gap1',
    gapNombre: 'GAP Esperanza',
    periodo: 'Febrero 2026',
    fechaGeneracion: '2026-03-01',
    generadoPor: 'Juan Pérez Díaz',
    asistenciaPromedio: 8.5,
    nuevosMiembros: 2,
    bajas: 0,
    bautizos: 1,
    graduadosEFC: 0,
    escalamientosAbiertos: 1,
    escalamientosCerrados: 2,
    evaluacionMentor: 'Excelente desarrollo del grupo',
    recomendaciones: 'Continuar con el plan de discipulado',
  },
];

// ============================================
// SOLICITUDES DE RESET DE CONTRASEÑA
// ============================================

export const solicitudesResetPassword: SolicitudResetPassword[] = [
  {
    id: 'sol1',
    usuarioId: '6',
    usuarioNombre: 'Juan Pérez Díaz',
    usuarioCorreo: 'lidergap1@ibc.org',
    fechaSolicitud: '2026-03-05',
    estado: 'Pendiente',
  },
];

// ============================================
// CLAVES DE USUARIOS
// ============================================

export const clavesMock: Record<string, string> = {
  'pastor@ibc.org': '123456',
  'admin@ibc.org': '123456',
  'pastor1@ibc.org': '123456',
  'pastor2@ibc.org': '123456',
  'lidermentor1@ibc.org': '123456',
  'lidergap1@ibc.org': '123456',
  'timoteo1@ibc.org': '123456',
  'facilitador1@ibc.org': '123456',
};

// ============================================
// LISTA DE MINISTERIOS
// ============================================

export const ministeriosLista: Ministerio[] = [
  'Franja Generacional',
  'Forjados',
  'Mujer Real',
  'Kairos',
  'Años Dorados',
  'Servidores',
  'Intercesión',
  'Flamas de Fuego',
  'Conexión',
  'Comunicaciones',
  'Escuela de Formación Cristiana (EFC)',
  'Protocolo',
];

// ============================================
// FRANJA GENERACIONAL
// ============================================

export const franjaGeneracionalLista = [
  'Timothy Kids',
  'Nexus',
  'Adic',
  'Keepers',
] as const;

// ============================================
// ÁREA DE SERVIDORES
// ============================================

export const areaServidoresLista = [
  'Staff',
  'CAS',
] as const;

// ============================================
// ÁREA DE FLAMAS DE FUEGO
// ============================================

export const areaFlamasFuegoLista = [
  'Danza',
  'Alabanza',
  'Músicos',
] as const;

// ============================================
// HELPERS
// ============================================

export const getUsuarioByCorreo = (correo: string): Usuario | undefined => {
  return usuariosMock.find(u => u.correo.toLowerCase() === correo.toLowerCase());
};

export const getUsuarioById = (id: string): Usuario | undefined => {
  return usuariosMock.find(u => u.id === id);
};

export const getGAPsByPastor = (pastorId: string): GAP[] => {
  return gapsMock.filter(g => g.pastorId === pastorId);
};

export const getGAPsByLiderMentor = (liderMentorId: string): GAP[] => {
  return gapsMock.filter(g => g.liderMentorId === liderMentorId);
};

export const getGAPByLider = (liderGapId: string): GAP | undefined => {
  return gapsMock.find(g => g.liderGapId === liderGapId);
};

export const getGAPByTimoteo = (timoteoId: string): GAP | undefined => {
  return gapsMock.find(g => g.timoteoId === timoteoId);
};

export const getMiembrosByGAP = (gapId: string): MiembroGAP[] => {
  return miembrosMock.filter(m => m.gapId === gapId);
};

export const getEscalamientosByUsuario = (usuario: Usuario): Escalamiento[] => {
  switch (usuario.rol) {
    case 'pastor_principal':
      // Solo casos urgentes llegan al Pastor Principal
      return escalamientosMock.filter(e => e.prioridad === 'Urgente');
    case 'pastor':
      return escalamientosMock.filter(e => e.pastorId === usuario.id);
    case 'lider_mentor':
      return escalamientosMock.filter(e => e.liderMentorId === usuario.id);
    case 'lider_gap':
      return escalamientosMock.filter(e => e.gapId === usuario.gapId);
    case 'timoteo':
      return escalamientosMock.filter(e => e.creadorId === usuario.id);
    default:
      return [];
  }
};

export const getPermisosByRol = (rol: RolUsuario): PermisosRol => {
  return permisosPorRol[rol];
};

export const getNotificacionesByUsuario = (usuarioId: string): Notificacion[] => {
  return notificacionesMock.filter(n => n.usuarioId === usuarioId);
};

export const getMensajesByDestinatario = (usuarioId: string): Mensaje[] => {
  return mensajesMock.filter(m => m.destinatarios.includes(usuarioId));
};

// Validación de duplicados
export const existeDocumento = (numeroDocumento: string, excluirId?: string): boolean => {
  return usuariosMock.some(u => u.numeroDocumento === numeroDocumento && u.id !== excluirId) ||
         miembrosMock.some(m => m.numeroDocumento === numeroDocumento && m.id !== excluirId);
};

export const existeCorreo = (correo: string, excluirId?: string): boolean => {
  return usuariosMock.some(u => u.correo.toLowerCase() === correo.toLowerCase() && u.id !== excluirId);
};

export const existeTelefono = (telefono: string, excluirId?: string): boolean => {
  return usuariosMock.some(u => u.telefono === telefono && u.id !== excluirId) ||
         miembrosMock.some(m => m.telefono === telefono && m.id !== excluirId);
};

// Contadores para estadísticas
export const getEstadisticas = () => {
  return {
    totalUsuarios: usuariosMock.length,
    totalGAPs: gapsMock.length,
    totalMiembros: miembrosMock.length,
    totalZonas: zonasMock.length,
    escalamientosAbiertos: escalamientosMock.filter(e => e.estado === 'Abierto').length,
    escalamientosUrgentes: escalamientosMock.filter(e => e.prioridad === 'Urgente' && e.estado !== 'Cerrado').length,
    escalamientosCerradosMes: escalamientosMock.filter(e => e.estado === 'Cerrado').length,
    miembrosNuevosMes: 3,
    bautizosMes: 1,
    graduadosEFC: 0,
    asistenciaPromedio: 8.2,
    gruposActivos: gapsMock.filter(g => g.activo).length,
    gruposInactivos: gapsMock.filter(g => !g.activo).length,
  };
};

// ============================================
// FUNCIONES DE CREACIÓN (PERSISTENCIA)
// ============================================

export const crearUsuario = (usuarioData: Omit<Usuario, 'id' | 'fechaRegistro' | 'activo' | 'ultimoAcceso'>): Usuario => {
  const nuevoId = (Math.max(...usuariosMock.map(u => parseInt(u.id))) + 1).toString();
  
  const nuevoUsuario: Usuario = {
    ...usuarioData,
    id: nuevoId,
    fechaRegistro: new Date().toISOString().split('T')[0],
    activo: true,
    ultimoAcceso: undefined,
  };
  
  usuariosMock.push(nuevoUsuario);
  clavesMock[usuarioData.correo.toLowerCase()] = usuarioData.claveTemporal;
  
  return nuevoUsuario;
};

export const crearGAP = (gapData: Omit<GAP, 'id' | 'numero' | 'codigo' | 'fechaCreacion'>): GAP => {
  const nuevoNumero = Math.max(...gapsMock.map(g => g.numero), 0) + 1;
  const nuevoId = `gap${nuevoNumero}`;
  
  const nuevoGAP: GAP = {
    ...gapData,
    id: nuevoId,
    numero: nuevoNumero,
    codigo: `GAP-${nuevoNumero}`,
    fechaCreacion: new Date().toISOString().split('T')[0],
  };
  
  gapsMock.push(nuevoGAP);
  return nuevoGAP;
};

export const crearMiembro = (miembroData: Omit<MiembroGAP, 'id' | 'fechaRegistro'>): MiembroGAP => {
  const nuevoId = `m${Math.max(...miembrosMock.map(m => parseInt(m.id.replace('m', ''))), 0) + 1}`;
  
  const nuevoMiembro: MiembroGAP = {
    ...miembroData,
    id: nuevoId,
    fechaRegistro: new Date().toISOString().split('T')[0],
  };
  
  miembrosMock.push(nuevoMiembro);
  return nuevoMiembro;
};

export const editarMiembroData = (miembroId: string, datos: Partial<MiembroGAP>): boolean => {
  const index = miembrosMock.findIndex(m => m.id === miembroId);
  if (index >= 0) {
    miembrosMock[index] = { ...miembrosMock[index], ...datos } as MiembroGAP;
    return true;
  }
  return false;
};

// Funciones para obtener usuarios según jerarquía
export const getUsuariosByPastor = (pastorId: string): Usuario[] => {
  return usuariosMock.filter(u => u.pastorId === pastorId || u.id === pastorId);
};

export const getUsuariosByLiderMentor = (liderMentorId: string): Usuario[] => {
  return usuariosMock.filter(u => u.liderMentorId === liderMentorId || u.id === liderMentorId);
};

export const getMiembrosByPastor = (pastorId: string): MiembroGAP[] => {
  const gapsDelPastor = gapsMock.filter(g => g.pastorId === pastorId).map(g => g.id);
  return miembrosMock.filter(m => gapsDelPastor.includes(m.gapId));
};

// ============================================
// CALENDARIO DE EVENTOS
// ============================================

export const eventosCalendarioMock: EventoCalendario[] = [
  {
    id: 'evt1',
    titulo: 'Reunión de Líderes GAP',
    descripcion: 'Reunión mensual de todos los líderes GAP',
    tipo: 'Reunion',
    fecha: '2026-03-20',
    hora: '19:00',
    ubicacion: 'Auditorio Principal',
    creadorId: '1',
    creadorNombre: 'Carlos Martínez Rodríguez',
    creadorRol: 'pastor_principal',
    prioridad: 'Alta',
    visibleParaTodos: true,
    recordatorioEnviado: false,
    activo: true,
    fechaCreacion: '2026-03-01',
  },
  {
    id: 'evt2',
    titulo: 'Actividad Juvenil',
    descripcion: 'Encuentro de jóvenes de todos los GAPs',
    tipo: 'Actividad',
    fecha: '2026-03-25',
    hora: '16:00',
    ubicacion: 'Parque Principal',
    creadorId: '3',
    creadorNombre: 'Pedro Sánchez García',
    creadorRol: 'pastor',
    prioridad: 'Media',
    visibleParaTodos: true,
    recordatorioEnviado: false,
    activo: true,
    fechaCreacion: '2026-03-05',
  },
  {
    id: 'evt3',
    titulo: 'Reunión GAP-1',
    descripcion: 'Reunión semanal del GAP-1',
    tipo: 'ReunionGAP',
    fecha: '2026-03-18',
    hora: '19:30',
    ubicacion: 'Casa del Líder',
    gapId: 'gap1',
    creadorId: '6',
    creadorNombre: 'Juan Pérez Díaz',
    creadorRol: 'lider_gap',
    prioridad: 'Baja',
    visibleParaTodos: false,
    visibleParaGAPs: ['gap1'],
    recordatorioEnviado: false,
    activo: true,
    fechaCreacion: '2026-03-10',
  },
];

// Función para crear evento del calendario
export const crearEventoCalendario = (eventoData: Omit<EventoCalendario, 'id' | 'fechaCreacion'>): EventoCalendario => {
  const nuevoId = `evt${eventosCalendarioMock.length + 1}`;
  
  const nuevoEvento: EventoCalendario = {
    ...eventoData,
    id: nuevoId,
    fechaCreacion: new Date().toISOString().split('T')[0],
  };
  
  eventosCalendarioMock.push(nuevoEvento);
  return nuevoEvento;
};

// ============================================
// MATERIAL DE ENSEÑANZA
// ============================================

export const materialEnsenanzaMock: MaterialEnsenanza[] = [
  {
    id: 'mat1',
    titulo: 'Lección 1: El Poder de la Oración',
    descripcion: 'Material para reunión semanal sobre oración',
    tipo: 'PDF',
    url: '/materiales/oracion-leccion1.pdf',
    subidoPor: '3',
    subidoPorNombre: 'Pedro Sánchez García',
    fechaSubida: '2026-03-01',
    paraFrecuencia: 'Semanal',
    activo: true,
  },
  {
    id: 'mat2',
    titulo: 'Video: Discipulado Básico',
    descripcion: 'Video introductorio al discipulado',
    tipo: 'Video',
    url: '/materiales/discipulado-video.mp4',
    subidoPor: '5',
    subidoPorNombre: 'Luis Hernández Castro',
    fechaSubida: '2026-02-15',
    paraFrecuencia: 'Ambas',
    activo: true,
  },
];

// ============================================
// PETICIONES DE ORACIÓN
// ============================================

export const peticionesOracionMock: PeticionOracion[] = [
  {
    id: 'pet1',
    titulo: 'Oración por sanidad',
    descripcion: 'Hermana Carmen necesita oración por su recuperación',
    creadorId: '6',
    creadorNombre: 'Juan Pérez Díaz',
    creadorRol: 'lider_gap',
    gapId: 'gap1',
    pastorId: '3',
    fechaCreacion: '2026-03-05',
    oracionRecibida: false,
  },
  {
    id: 'pet2',
    titulo: 'Provisión económica',
    descripcion: 'Familia García necesita provisión para el arriendo',
    creadorId: '7',
    creadorNombre: 'Sofía López Morales',
    creadorRol: 'timoteo',
    gapId: 'gap1',
    pastorId: '3',
    fechaCreacion: '2026-03-03',
    oracionRecibida: true,
    fechaOracionRecibida: '2026-03-04',
    comentarios: 'El pastor oró por la familia y se está gestionando ayuda',
  },
];

// ============================================
// REGISTRO DE ASISTENCIA
// ============================================

export const asistenciasMock: RegistroAsistencia[] = [
  {
    id: 'asist1',
    gapId: 'gap1',
    fecha: '2026-03-05',
    asistencias: [
      { miembroId: 'lider', presente: true },
      { miembroId: 'timoteo', presente: true },
      { miembroId: 'm1', presente: true },
      { miembroId: 'm2', presente: false },
    ],
    totalAsistentes: 3,
    nuevosMiembros: 0,
    visitantes: 1,
    observaciones: 'Buena reunión, oración por enfermos',
    registradoPor: '7',
    registradoPorNombre: 'Sofía López Morales',
    fechaRegistro: '2026-03-05',
  },
  {
    id: 'asist2',
    gapId: 'gap1',
    fecha: '2026-03-12',
    asistencias: [
      { miembroId: 'lider', presente: true },
      { miembroId: 'timoteo', presente: true },
      { miembroId: 'm1', presente: true },
      { miembroId: 'm2', presente: true },
    ],
    totalAsistentes: 4,
    nuevosMiembros: 1,
    visitantes: 0,
    observaciones: 'Nuevo miembro integrado al grupo',
    registradoPor: '7',
    registradoPorNombre: 'Sofía López Morales',
    fechaRegistro: '2026-03-12',
  },
];

// Función para crear registro de asistencia
export const crearRegistroAsistencia = (asistenciaData: Omit<RegistroAsistencia, 'id' | 'fechaRegistro'>): RegistroAsistencia => {
  const nuevoId = `asist${asistenciasMock.length + 1}`;
  
  const nuevoRegistro: RegistroAsistencia = {
    ...asistenciaData,
    id: nuevoId,
    fechaRegistro: new Date().toISOString().split('T')[0],
  };
  
  // Si ya existe un registro para esta fecha y GAP, actualizarlo
  const indexExistente = asistenciasMock.findIndex(
    a => a.gapId === asistenciaData.gapId && a.fecha === asistenciaData.fecha
  );
  
  if (indexExistente >= 0) {
    asistenciasMock[indexExistente] = nuevoRegistro;
  } else {
    asistenciasMock.push(nuevoRegistro);
  }
  
  return nuevoRegistro;
};

// ============================================
// VIDEOLLAMADAS
// ============================================

export const salasVideollamadaMock: SalaVideollamada[] = [];

// ============================================
// FUNCIONES AUXILIARES PARA NUEVOS MÓDULOS
// ============================================

export const crearMaterialEnsenanza = (materialData: Omit<MaterialEnsenanza, 'id' | 'fechaSubida'>): MaterialEnsenanza => {
  const nuevoId = `mat${materialEnsenanzaMock.length + 1}`;
  const nuevoMaterial: MaterialEnsenanza = {
    ...materialData,
    id: nuevoId,
    fechaSubida: new Date().toISOString().split('T')[0],
  };
  materialEnsenanzaMock.push(nuevoMaterial);
  return nuevoMaterial;
};

export const crearPeticionOracion = (peticionData: Omit<PeticionOracion, 'id' | 'fechaCreacion'>): PeticionOracion => {
  const nuevoId = `pet${peticionesOracionMock.length + 1}`;
  const nuevaPeticion: PeticionOracion = {
    ...peticionData,
    id: nuevoId,
    fechaCreacion: new Date().toISOString().split('T')[0],
  };
  peticionesOracionMock.push(nuevaPeticion);
  return nuevaPeticion;
};

export const marcarOracionRecibida = (peticionId: string, comentarios?: string): boolean => {
  const peticion = peticionesOracionMock.find(p => p.id === peticionId);
  if (peticion) {
    peticion.oracionRecibida = true;
    peticion.fechaOracionRecibida = new Date().toISOString().split('T')[0];
    if (comentarios) peticion.comentarios = comentarios;
    return true;
  }
  return false;
};

export const crearSalaVideollamada = (salaData: Omit<SalaVideollamada, 'id' | 'fechaInicio' | 'urlSala'>): SalaVideollamada => {
  const nuevoId = `sala${Date.now()}`;
  const urlSala = `https://meet.gap-ibc.org/${nuevoId}`;
  const nuevaSala: SalaVideollamada = {
    ...salaData,
    id: nuevoId,
    fechaInicio: new Date().toISOString(),
    urlSala,
  };
  salasVideollamadaMock.push(nuevaSala);
  return nuevaSala;
};

// ============================================
// FUNCIONES ADICIONALES PARA TIMOTEO
// ============================================

// Función para obtener asistencias por GAP
export const getAsistenciasByGAP = (gapId: string): RegistroAsistencia[] => {
  return asistenciasMock.filter(a => a.gapId === gapId);
};

// Alias para compatibilidad con componentes
export const eventosMock = eventosCalendarioMock;
export const materialesEnsenanzaMock = materialEnsenanzaMock;


// ============================================
// FUNCIONES CRUD COMPLETAS (ADMIN - MODO DIOS)
// ============================================

// Eliminar usuario
export const eliminarUsuario = (usuarioId: string): boolean => {
  const index = usuariosMock.findIndex(u => u.id === usuarioId);
  if (index >= 0) {
    const usuario = usuariosMock[index];
    usuario.activo = false;
    return true;
  }
  return false;
};

// Activar usuario
export const activarUsuario = (usuarioId: string): boolean => {
  const usuario = usuariosMock.find(u => u.id === usuarioId);
  if (usuario) {
    usuario.activo = true;
    return true;
  }
  return false;
};

// Editar usuario completo
export const editarUsuario = (usuarioId: string, datos: Partial<Usuario>): boolean => {
  const index = usuariosMock.findIndex(u => u.id === usuarioId);
  if (index >= 0) {
    usuariosMock[index] = { ...usuariosMock[index], ...datos };
    return true;
  }
  return false;
};

// Reasignar usuario a otro GAP/Pastor/Líder
export const reasignarUsuario = (
  usuarioId: string, 
  asignacion: { pastorId?: string; liderMentorId?: string; liderGapId?: string; gapId?: string }
): boolean => {
  const usuario = usuariosMock.find(u => u.id === usuarioId);
  if (usuario) {
    if (asignacion.pastorId !== undefined) usuario.pastorId = asignacion.pastorId;
    if (asignacion.liderMentorId !== undefined) usuario.liderMentorId = asignacion.liderMentorId;
    if (asignacion.liderGapId !== undefined) usuario.liderGapId = asignacion.liderGapId;
    if (asignacion.gapId !== undefined) usuario.gapId = asignacion.gapId;
    return true;
  }
  return false;
};

// Eliminar GAP permanentemente
export const eliminarGAP = (gapId: string): boolean => {
  const index = gapsMock.findIndex(g => g.id === gapId);
  if (index >= 0) {
    gapsMock[index].activo = false;
    return true;
  }
  return false;
};

// Activar GAP
export const activarGAP = (gapId: string): boolean => {
  const gap = gapsMock.find(g => g.id === gapId);
  if (gap) {
    gap.activo = true;
    return true;
  }
  return false;
};

// Editar GAP
export const editarGAPData = (gapId: string, datos: Partial<GAP>): boolean => {
  const index = gapsMock.findIndex(g => g.id === gapId);
  if (index >= 0) {
    gapsMock[index] = { ...gapsMock[index], ...datos };
    return true;
  }
  return false;
};

// Eliminar miembro
export const eliminarMiembro = (miembroId: string): boolean => {
  const index = miembrosMock.findIndex(m => m.id === miembroId);
  if (index >= 0) {
    miembrosMock.splice(index, 1);
    return true;
  }
  return false;
};

// ============================================
// SISTEMA DE CUESTIONARIOS
// ============================================

export const cuestionariosMock: Cuestionario[] = [
  {
    id: 'cuest1',
    titulo: 'Evaluación de Líderes GAP',
    descripcion: 'Cuestionario para evaluar el desempeño de los líderes de GAP trimestralmente',
    instrucciones: 'Por favor responda con honestidad. Sus respuestas son confidenciales.',
    preguntas: [
      {
        id: 'p1',
        titulo: '¿El líder asiste puntualmente a las reuniones?',
        tipo: 'escala_calificacion',
        opciones: [],
        requerida: true,
        orden: 1,
        escalaMin: 1,
        escalaMax: 5,
        etiquetaMin: 'Nunca',
        etiquetaMax: 'Siempre',
      },
      {
        id: 'p2',
        titulo: '¿Cómo evalúa el manejo del material de enseñanza?',
        tipo: 'opcion_multiple',
        opciones: [
          { id: 'o1', texto: 'Excelente', orden: 1 },
          { id: 'o2', texto: 'Bueno', orden: 2 },
          { id: 'o3', texto: 'Regular', orden: 3 },
          { id: 'o4', texto: 'Necesita mejorar', orden: 4 },
        ],
        requerida: true,
        orden: 2,
      },
      {
        id: 'p3',
        titulo: 'Observaciones adicionales',
        tipo: 'texto_libre',
        opciones: [],
        requerida: false,
        orden: 3,
        placeholder: 'Escriba sus observaciones aquí...',
        maxCaracteres: 500,
      },
    ],
    activo: true,
    creadoPor: '2',
    creadoPorNombre: 'María González López',
    fechaCreacion: '2026-03-01',
    fechaModificacion: '2026-03-01',
    permitirMultiplesRespuestas: false,
    requerirAutenticacion: true,
    asignadoARoles: ['lider_mentor', 'pastor'],
  },
  {
    id: 'cuest2',
    titulo: 'Encuesta de Satisfacción GAP',
    descripcion: 'Encuesta para conocer la satisfacción de los miembros con su grupo',
    instrucciones: 'Seleccione la opción que mejor represente su experiencia.',
    preguntas: [
      {
        id: 'p4',
        titulo: '¿Se siente acogido en su GAP?',
        tipo: 'verdadero_falso',
        opciones: [
          { id: 'o5', texto: 'Sí', valor: 1, orden: 1 },
          { id: 'o6', texto: 'No', valor: 0, orden: 2 },
        ],
        requerida: true,
        orden: 1,
      },
      {
        id: 'p5',
        titulo: '¿Qué aspectos le gustan más de su GAP?',
        tipo: 'seleccion_multiple',
        opciones: [
          { id: 'o7', texto: 'La enseñanza', orden: 1 },
          { id: 'o8', texto: 'La comunidad', orden: 2 },
          { id: 'o9', texto: 'Los eventos', orden: 3 },
          { id: 'o10', texto: 'El apoyo mutuo', orden: 4 },
          { id: 'o11', texto: 'La oración grupal', orden: 5 },
        ],
        requerida: true,
        orden: 2,
      },
    ],
    activo: true,
    creadoPor: '2',
    creadoPorNombre: 'María González López',
    fechaCreacion: '2026-03-05',
    fechaModificacion: '2026-03-05',
    permitirMultiplesRespuestas: true,
    requerirAutenticacion: false,
    asignadoAGAPs: ['gap1', 'gap2', 'gap3'],
  },
  {
    id: 'cuest3',
    titulo: 'Cuestionario de Creación de GAP',
    descripcion: 'Formulario dinámico utilizado para recopilar los datos básicos al registrar un nuevo Grupo GAP',
    instrucciones: 'Diligencie todos los campos requeridos para crear el grupo en el sistema.',
    preguntas: [
      {
        id: 'pgap1',
        titulo: 'Código De GAP',
        tipo: 'texto_libre',
        opciones: [],
        requerida: true,
        orden: 1,
        placeholder: 'Código asignado automáticamente (ej: GAP-4)',
      },
      {
        id: 'pgap2',
        titulo: 'Líder GAP',
        tipo: 'desplegable',
        opciones: [],
        requerida: true,
        orden: 2,
      },
      {
        id: 'pgap3',
        titulo: 'Timoteo',
        tipo: 'desplegable',
        opciones: [],
        requerida: true,
        orden: 3,
      },
      {
        id: 'pgap4',
        titulo: 'Pastor Responsable',
        tipo: 'desplegable',
        opciones: [],
        requerida: false,
        orden: 4,
      },
      {
        id: 'pgap5',
        titulo: 'Líder Mentor Responsable',
        tipo: 'desplegable',
        opciones: [],
        requerida: false,
        orden: 5,
      },
      {
        id: 'pgap6',
        titulo: 'Ubicación de la Reunión',
        tipo: 'opcion_multiple',
        opciones: [
          { id: 'ogap1', texto: 'Casa', orden: 1 },
          { id: 'ogap2', texto: 'Iglesia', orden: 2 },
        ],
        requerida: true,
        orden: 6,
      },
      {
        id: 'pgap7',
        titulo: 'Dirección de Reunión',
        tipo: 'texto_libre',
        opciones: [],
        requerida: true,
        orden: 7,
        placeholder: 'Ej: Calle 123 #45-67',
      },
      {
        id: 'pgap8',
        titulo: 'Día de Reunión',
        tipo: 'desplegable',
        opciones: [
          { id: 'd1', texto: 'Lunes', orden: 1 },
          { id: 'd2', texto: 'Martes', orden: 2 },
          { id: 'd3', texto: 'Miércoles', orden: 3 },
          { id: 'd4', texto: 'Jueves', orden: 4 },
          { id: 'd5', texto: 'Viernes', orden: 5 },
          { id: 'd6', texto: 'Sábado', orden: 6 },
          { id: 'd7', texto: 'Domingo', orden: 7 },
        ],
        requerida: true,
        orden: 8,
      },
      {
        id: 'pgap9',
        titulo: 'Hora de Reunión',
        tipo: 'texto_libre',
        opciones: [],
        requerida: true,
        orden: 9,
        placeholder: 'Ej: 19:00',
      },
      {
        id: 'pgap10',
        titulo: 'Frecuencia',
        tipo: 'opcion_multiple',
        opciones: [
          { id: 'fg1', texto: 'Semanal', orden: 1 },
          { id: 'fg2', texto: 'Quincenal', orden: 2 },
          { id: 'fg3', texto: 'Mensual', orden: 3 },
        ],
        requerida: true,
        orden: 10,
      },
      {
        id: 'pgap11',
        titulo: 'Modalidad',
        tipo: 'opcion_multiple',
        opciones: [
          { id: 'md1', texto: 'Presencial', orden: 1 },
          { id: 'md2', texto: 'Virtual', orden: 2 },
          { id: 'md3', texto: 'Mixta', orden: 3 },
        ],
        requerida: true,
        orden: 11,
      },
    ],
    activo: true,
    creadoPor: '2',
    creadoPorNombre: 'María González López',
    fechaCreacion: '2026-03-10',
    fechaModificacion: '2026-03-10',
    permitirMultiplesRespuestas: false,
    requerirAutenticacion: true,
    asignadoARoles: ['administrador', 'pastor_principal'],
  },
  {
    id: 'cuest4',
    titulo: 'Cuestionario de Nuevo Integrante',
    descripcion: 'Formulario dinámico utilizado para recopilar los datos personales, de contacto y eclesiásticos de un nuevo integrante de GAP',
    instrucciones: 'Por favor rellene toda la información requerida con datos válidos.',
    preguntas: [
      {
        id: 'pin1',
        titulo: 'Nombres',
        tipo: 'texto_libre',
        opciones: [],
        requerida: true,
        orden: 1,
        placeholder: 'Ingrese el nombre',
      },
      {
        id: 'pin2',
        titulo: 'Apellidos',
        tipo: 'texto_libre',
        opciones: [],
        requerida: true,
        orden: 2,
        placeholder: 'Ingrese el apellido',
      },
      {
        id: 'pin3',
        titulo: 'Documento de Identidad',
        tipo: 'opcion_multiple',
        opciones: [
          { id: 't1', texto: 'Cédula de Ciudadanía', orden: 1 },
          { id: 't2', texto: 'Tarjeta de Identidad', orden: 2 },
          { id: 't3', texto: 'Cédula de Extranjería', orden: 3 },
          { id: 't4', texto: 'Pasaporte', orden: 4 },
        ],
        requerida: true,
        orden: 3,
      },
      {
        id: 'pin4',
        titulo: 'Número de Documento',
        tipo: 'texto_libre',
        opciones: [],
        requerida: true,
        orden: 4,
        placeholder: 'Ingrese el número de documento',
      },
      {
        id: 'pin5',
        titulo: 'Correo Electrónico',
        tipo: 'email',
        opciones: [],
        requerida: false,
        orden: 5,
        placeholder: 'ejemplo@correo.com',
      },
      {
        id: 'pin6',
        titulo: 'Fecha de Nacimiento',
        tipo: 'fecha',
        opciones: [],
        requerida: false,
        orden: 6,
      },
      {
        id: 'pin7',
        titulo: 'Género',
        tipo: 'opcion_multiple',
        opciones: [
          { id: 'g1', texto: 'Masculino', orden: 1 },
          { id: 'g2', texto: 'Femenino', orden: 2 },
        ],
        requerida: true,
        orden: 7,
      },
      {
        id: 'pin8',
        titulo: 'Estado Civil',
        tipo: 'opcion_multiple',
        opciones: [
          { id: 'ec1', texto: 'Soltero(a)', orden: 1 },
          { id: 'ec2', texto: 'Casado(a)', orden: 2 },
          { id: 'ec3', texto: 'Viudo(a)', orden: 3 },
          { id: 'ec4', texto: 'Unión Libre', orden: 4 },
        ],
        requerida: true,
        orden: 8,
      },
      {
        id: 'pin9',
        titulo: 'Teléfono Celular',
        tipo: 'telefono',
        opciones: [],
        requerida: true,
        orden: 9,
        placeholder: 'Ingrese número celular',
      },
      {
        id: 'pin10',
        titulo: 'Número de WhatsApp',
        tipo: 'telefono',
        opciones: [],
        requerida: false,
        orden: 10,
      },
      {
        id: 'pin11',
        titulo: 'Dirección de Residencia',
        tipo: 'texto_libre',
        opciones: [],
        requerida: true,
        orden: 11,
        placeholder: 'Ingrese la dirección',
      },
      {
        id: 'pin12',
        titulo: 'Barrio',
        tipo: 'texto_libre',
        opciones: [],
        requerida: false,
        orden: 12,
      },
      {
        id: 'pin13',
        titulo: 'Departamento',
        tipo: 'texto_libre',
        opciones: [],
        requerida: false,
        orden: 13,
      },
      {
        id: 'pin14',
        titulo: 'Profesión / Ocupación',
        tipo: 'texto_libre',
        opciones: [],
        requerida: false,
        orden: 14,
      },
      {
        id: 'pin15',
        titulo: '¿Es miembro de la Iglesia Bautista Central (IBC)?',
        tipo: 'verdadero_falso',
        opciones: [
          { id: 'mi1', texto: 'Sí', valor: 1, orden: 1 },
          { id: 'mi2', texto: 'No', valor: 0, orden: 2 },
        ],
        requerida: true,
        orden: 15,
      },
      {
        id: 'pin16',
        titulo: '¿Es bautizado?',
        tipo: 'verdadero_falso',
        opciones: [
          { id: 'ba1', texto: 'Sí', valor: 1, orden: 1 },
          { id: 'ba2', texto: 'No', valor: 0, orden: 2 },
        ],
        requerida: true,
        orden: 16,
      },
      {
        id: 'pin17',
        titulo: 'Escuela de Formación Cristiana (EFC)',
        tipo: 'opcion_multiple',
        opciones: [
          { id: 'ef1', texto: 'No', orden: 1 },
          { id: 'ef2', texto: 'Graduado', orden: 2 },
          { id: 'ef3', texto: 'Cursando', orden: 3 },
        ],
        requerida: true,
        orden: 17,
      },
      {
        id: 'pin18',
        titulo: 'Módulo EFC Cursado / Cursando',
        tipo: 'desplegable',
        opciones: [
          { id: 'mo1', texto: 'Discipulado', orden: 1 },
          { id: 'mo2', texto: 'Panorama Bíblico', orden: 2 },
          { id: 'mo3', texto: 'Fundamentos de Fe', orden: 3 },
          { id: 'mo4', texto: 'Guerra Espiritual', orden: 4 },
          { id: 'mo5', texto: 'Liderazgo Estratégico', orden: 5 },
        ],
        requerida: false,
        orden: 18,
      },
      {
        id: 'pin19',
        titulo: 'Ministerios en los que sirve',
        tipo: 'seleccion_multiple',
        opciones: [
          { 
            id: 'mn11', 
            texto: 'Franja Generacional', 
            orden: 1,
            subOpciones: [
              { id: 'sub_g1', texto: 'Timothy Kids', orden: 1 },
              { id: 'sub_g2', texto: 'Nexus', orden: 2 },
              { id: 'sub_g3', texto: 'Adic', orden: 3 },
              { id: 'sub_g4', texto: 'Keepers', orden: 4 }
            ]
          },
          { id: 'mn1', texto: 'Forjados', orden: 2 },
          { id: 'mn2', texto: 'Mujer Real', orden: 3 },
          { id: 'mn3', texto: 'Kairos', orden: 4 },
          { id: 'mn4', texto: 'Años Dorados', orden: 5 },
          { 
            id: 'mn5', 
            texto: 'Servidores', 
            orden: 6,
            subOpciones: [
              { id: 'sub_s1', texto: 'Staff', orden: 1 },
              { id: 'sub_s2', texto: 'CAS', orden: 2 }
            ]
          },
          { id: 'mn6', texto: 'Intercesión', orden: 7 },
          { 
            id: 'mn7', 
            texto: 'Flamas de Fuego', 
            orden: 8,
            subOpciones: [
              { id: 'sub_f1', texto: 'Danza', orden: 1 },
              { id: 'sub_f2', texto: 'Alabanza', orden: 2 },
              { id: 'sub_f3', texto: 'Músicos', orden: 3 }
            ]
          },
          { id: 'mn8', texto: 'Conexión', orden: 9 },
          { id: 'mn9', texto: 'Comunicaciones', orden: 10 },
          { id: 'mn10', texto: 'Protocolo', orden: 11 },
        ],
        requerida: false,
        orden: 19,
      },
    ],
    activo: true,
    creadoPor: '2',
    creadoPorNombre: 'María González López',
    fechaCreacion: '2026-03-12',
    fechaModificacion: '2026-03-12',
    permitirMultiplesRespuestas: false,
    requerirAutenticacion: true,
    asignadoARoles: ['administrador', 'pastor_principal', 'lider_mentor', 'lider_gap'],
  },
];

export const respuestasCuestionariosMock: RespuestaCuestionario[] = [];

// CRUD Cuestionarios
export const crearCuestionario = (cuestionarioData: Omit<Cuestionario, 'id' | 'fechaCreacion' | 'fechaModificacion'>): Cuestionario => {
  const nuevoId = `cuest${cuestionariosMock.length + 1}`;
  const fechaHoy = new Date().toISOString().split('T')[0];

  const nuevoCuestionario: Cuestionario = {
    ...cuestionarioData,
    id: nuevoId,
    fechaCreacion: fechaHoy,
    fechaModificacion: fechaHoy,
  };

  cuestionariosMock.push(nuevoCuestionario);
  return nuevoCuestionario;
};

export const actualizarCuestionario = (cuestionarioId: string, datos: Partial<Cuestionario>): boolean => {
  const index = cuestionariosMock.findIndex(c => c.id === cuestionarioId);
  if (index >= 0) {
    cuestionariosMock[index] = { 
      ...cuestionariosMock[index], 
      ...datos, 
      fechaModificacion: new Date().toISOString().split('T')[0] 
    };
    return true;
  }
  return false;
};

export const eliminarCuestionario = (cuestionarioId: string): boolean => {
  const index = cuestionariosMock.findIndex(c => c.id === cuestionarioId);
  if (index >= 0) {
    cuestionariosMock[index].activo = false;
    return true;
  }
  return false;
};

export const activarCuestionario = (cuestionarioId: string): boolean => {
  const cuestionario = cuestionariosMock.find(c => c.id === cuestionarioId);
  if (cuestionario) {
    cuestionario.activo = true;
    return true;
  }
  return false;
};

export const guardarRespuestaCuestionario = (respuestaData: Omit<RespuestaCuestionario, 'id' | 'fechaRespuesta'>): RespuestaCuestionario => {
  const nuevaRespuesta: RespuestaCuestionario = {
    ...respuestaData,
    id: `resp${respuestasCuestionariosMock.length + 1}`,
    fechaRespuesta: new Date().toISOString(),
  };

  respuestasCuestionariosMock.push(nuevaRespuesta);
  return nuevaRespuesta;
};

export const getRespuestasByCuestionario = (cuestionarioId: string): RespuestaCuestionario[] => {
  return respuestasCuestionariosMock.filter(r => r.cuestionarioId === cuestionarioId);
};

// Verificar si el primer usuario es admin
export const esPrimerUsuario = (): boolean => {
  return usuariosMock.length === 0;
};
