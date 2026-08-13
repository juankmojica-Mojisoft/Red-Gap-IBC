import { 
  getAllUsuarios, getAllGAPs, getAllMiembros, getAllEscalamientos, 
  getAllEventos, getAllCuestionarios, getRespuestasByCuestionario,
  getAllAsistencias, getAllPeticiones, getAllMateriales, getAllSalas
} from './dataService';

import {
  usuariosMock, gapsMock, miembrosMock, escalamientosMock,
  eventosCalendarioMock, cuestionariosMock, respuestasCuestionariosMock,
  asistenciasMock, peticionesOracionMock, materialEnsenanzaMock,
  salasVideollamadaMock
} from '@/data/mockData';

import type { RespuestaCuestionario } from '@/types';

export const syncAllData = async (): Promise<boolean> => {
  try {
    console.log('Iniciando sincronización completa con Supabase...');
    
    // 1. Usuarios
    const usuarios = await getAllUsuarios();
    if (usuarios && usuarios.length > 0) {
      usuariosMock.splice(0, usuariosMock.length, ...usuarios);
    }
    
    // 2. GAPs
    const gaps = await getAllGAPs();
    if (gaps && gaps.length > 0) {
      gapsMock.splice(0, gapsMock.length, ...gaps);
    }
    
    // 3. Miembros GAP
    const miembros = await getAllMiembros();
    if (miembros && miembros.length > 0) {
      miembrosMock.splice(0, miembrosMock.length, ...miembros);
    }
    
    // 4. Escalamientos
    const escalamientos = await getAllEscalamientos();
    if (escalamientos && escalamientos.length > 0) {
      escalamientosMock.splice(0, escalamientosMock.length, ...escalamientos);
    }
    
    // 5. Eventos Calendario
    const eventos = await getAllEventos();
    if (eventos && eventos.length > 0) {
      eventosCalendarioMock.splice(0, eventosCalendarioMock.length, ...eventos);
    }
    
    // 6. Cuestionarios
    const cuestionarios = await getAllCuestionarios();
    if (cuestionarios && cuestionarios.length > 0) {
      cuestionariosMock.splice(0, cuestionariosMock.length, ...cuestionarios);
      
      // Respuestas para cada cuestionario
      const todasRespuestas: RespuestaCuestionario[] = [];
      for (const c of cuestionarios) {
        const respuestas = await getRespuestasByCuestionario(c.id);
        if (respuestas) todasRespuestas.push(...respuestas);
      }
      if (todasRespuestas.length > 0) {
        respuestasCuestionariosMock.splice(0, respuestasCuestionariosMock.length, ...todasRespuestas);
      }
    }
    
    // 7. Asistencias
    const asistencias = await getAllAsistencias();
    if (asistencias && asistencias.length > 0) {
      asistenciasMock.splice(0, asistenciasMock.length, ...asistencias);
    }
    
    // 8. Peticiones de Oración
    const peticiones = await getAllPeticiones();
    if (peticiones && peticiones.length > 0) {
      peticionesOracionMock.splice(0, peticionesOracionMock.length, ...peticiones);
    }
    
    // 9. Materiales de Enseñanza
    const materiales = await getAllMateriales();
    if (materiales && materiales.length > 0) {
      materialEnsenanzaMock.splice(0, materialEnsenanzaMock.length, ...materiales);
    }
    
    // 10. Salas de Videollamada
    const salas = await getAllSalas();
    if (salas && salas.length > 0) {
      salasVideollamadaMock.splice(0, salasVideollamadaMock.length, ...salas);
    }
    
    console.log('Sincronización completada exitosamente.');
    return true;
  } catch (error) {
    console.error('Error durante la sincronización de datos:', error);
    return false;
  }
};
