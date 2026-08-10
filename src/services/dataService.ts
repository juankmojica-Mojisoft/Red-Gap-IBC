import { supabase } from '@/lib/supabase';
import type { 
  Usuario, RolUsuario, GAP, MiembroGAP, Cuestionario, 
  RespuestaCuestionario, Escalamiento, EventoCalendario,
  TipoPregunta, PreguntaCuestionario, RegistroAsistencia,
  PeticionOracion, MaterialEnsenanza, SalaVideollamada
} from '@/types';
import {
  cuestionariosMock,
  crearCuestionario as crearCuestionarioMock,
  actualizarCuestionario as actualizarCuestionarioMock,
  eliminarCuestionario as eliminarCuestionarioMock,
  activarCuestionario as activarCuestionarioMock,
  guardarRespuestaCuestionario as guardarRespuestaCuestionarioMock,
  getRespuestasByCuestionario as getRespuestasByCuestionarioMock,
  usuariosMock,
  gapsMock,
  miembrosMock,
  crearUsuario as crearUsuarioMock,
  editarUsuario as editarUsuarioMock,
  crearGAP as crearGAPMock,
  editarGAPData as editarGAPDataMock,
  crearMiembro as crearMiembroMock,
  editarMiembroData as editarMiembroDataMock
} from '@/data/mockData';

// Helper para queries con tipado flexible
type DbRecord = Record<string, unknown>;

const fromTable = (table: string) => supabase.from(table as any);

// ============================================
// USUARIOS
// ============================================

export const getAllUsuarios = async (): Promise<Usuario[]> => {
  try {
    const { data, error } = await fromTable('usuarios').select('*').order('fecha_registro', { ascending: false });
    if (error || !data || data.length === 0) {
      console.warn('Error or no data in getAllUsuarios, checking if table is empty...');
      if (!error && data && data.length === 0) {
        console.log('Seeding usuarios table from mockData...');
        for (const u of usuariosMock) {
          const dbData = toDbUsuario(u);
          await fromTable('usuarios').insert([dbData as any]);
        }
        return usuariosMock;
      }
      return usuariosMock;
    }
    const mapped = ((data as DbRecord[]) || []).map(fromDbUsuario);
    usuariosMock.splice(0, usuariosMock.length, ...mapped);
    return mapped;
  } catch (err) {
    console.error('Exception in getAllUsuarios:', err);
    return usuariosMock;
  }
};

export const getUsuarioByCorreo = async (correo: string): Promise<Usuario | null> => {
  const { data, error } = await fromTable('usuarios').select('*').ilike('correo', correo).single();
  if (error || !data) return null;
  return fromDbUsuario(data as DbRecord);
};

export const getUsuarioById = async (id: string): Promise<Usuario | null> => {
  const { data, error } = await fromTable('usuarios').select('*').eq('id', id).single();
  if (error || !data) return null;
  return fromDbUsuario(data as DbRecord);
};

export const crearUsuario = async (usuarioData: Partial<Usuario>): Promise<Usuario | null> => {
  let localResult: Usuario | null = null;
  try {
    localResult = crearUsuarioMock(usuarioData as any);
    if (localResult && usuarioData.fotoPerfil) {
      localResult.fotoPerfil = usuarioData.fotoPerfil;
    }
  } catch (e) {
    console.warn('Error running crearUsuarioMock:', e);
  }

  const generatedId = localResult?.id || `u${Date.now()}`;
  if (usuarioData.fotoPerfil) {
    localStorage.setItem(`ibc_foto_perfil_${generatedId}`, usuarioData.fotoPerfil);
  }

  try {
    const dbData = toDbUsuario({ 
      ...usuarioData, 
      id: generatedId,
      activo: true, 
      fechaRegistro: new Date().toISOString().split('T')[0] 
    } as Usuario);
    const { data, error } = await fromTable('usuarios').insert([dbData as any]).select().single();
    if (error) { 
      console.error('Error creating user in Supabase, using mock:', error); 
      return localResult; 
    }
    const synced = data ? fromDbUsuario(data as DbRecord) : null;
    if (synced && localResult) {
      const idx = usuariosMock.findIndex(us => us.id === localResult!.id);
      if (idx !== -1) {
        if (usuarioData.fotoPerfil) {
          synced.fotoPerfil = usuarioData.fotoPerfil;
        }
        usuariosMock[idx] = synced;
      }
    }
    return synced || localResult;
  } catch (err) {
    console.error('Exception creating user in Supabase, using mock:', err);
    return localResult;
  }
};

export const actualizarUsuario = async (id: string, datos: Partial<Usuario>): Promise<boolean> => {
  try {
    editarUsuarioMock(id, datos);
  } catch (e) {
    console.warn('Error running editarUsuarioMock:', e);
  }

  if (datos.fotoPerfil !== undefined) {
    if (datos.fotoPerfil) {
      localStorage.setItem(`ibc_foto_perfil_${id}`, datos.fotoPerfil);
    } else {
      localStorage.removeItem(`ibc_foto_perfil_${id}`);
    }
  }

  const dbData = toDbUsuarioPartial(datos);
  const { error } = await fromTable('usuarios').update(dbData as any).eq('id', id);
  if (error) { 
    console.error('Error actualizarUsuario:', error); 
    return false; 
  }
  return true;
};

export const eliminarUsuario = async (id: string): Promise<boolean> => {
  try {
    editarUsuarioMock(id, { activo: false });
  } catch (e) {
    console.warn('Error running editarUsuarioMock:', e);
  }

  const { error } = await fromTable('usuarios').update({ activo: false } as any).eq('id', id);
  if (error) { console.error('Error eliminarUsuario:', error); return false; }
  return true;
};

export const activarUsuario = async (id: string): Promise<boolean> => {
  try {
    editarUsuarioMock(id, { activo: true });
  } catch (e) {
    console.warn('Error running editarUsuarioMock:', e);
  }

  const { error } = await fromTable('usuarios').update({ activo: true } as any).eq('id', id);
  if (error) { console.error('Error activarUsuario:', error); return false; }
  return true;
};

export const eliminarUsuarioPermanente = async (id: string): Promise<boolean> => {
  const idx = usuariosMock.findIndex(us => us.id === id);
  if (idx !== -1) {
    usuariosMock.splice(idx, 1);
  }

  const { error } = await fromTable('usuarios').delete().eq('id', id);
  if (error) { console.error('Error eliminarUsuarioPermanente:', error); return false; }
  return true;
};

export const reasignarUsuario = async (id: string, asignacion: { pastorId?: string; liderMentorId?: string; liderGapId?: string; gapId?: string }): Promise<boolean> => {
  const idx = usuariosMock.findIndex(us => us.id === id);
  if (idx !== -1) {
    usuariosMock[idx] = {
      ...usuariosMock[idx],
      pastorId: asignacion.pastorId !== undefined ? (asignacion.pastorId || undefined) : usuariosMock[idx].pastorId,
      liderMentorId: asignacion.liderMentorId !== undefined ? (asignacion.liderMentorId || undefined) : usuariosMock[idx].liderMentorId,
      liderGapId: asignacion.liderGapId !== undefined ? (asignacion.liderGapId || undefined) : usuariosMock[idx].liderGapId,
      gapId: asignacion.gapId !== undefined ? (asignacion.gapId || undefined) : usuariosMock[idx].gapId,
    };
  }

  const update: Record<string, string | null> = {};
  if (asignacion.pastorId !== undefined) update.pastor_id = asignacion.pastorId || null;
  if (asignacion.liderMentorId !== undefined) update.lider_mentor_id = asignacion.liderMentorId || null;
  if (asignacion.liderGapId !== undefined) update.lider_gap_id = asignacion.liderGapId || null;
  if (asignacion.gapId !== undefined) update.gap_id = asignacion.gapId || null;
  const { error } = await fromTable('usuarios').update(update as any).eq('id', id);
  if (error) { console.error('Error reasignarUsuario:', error); return false; }
  return true;
};

export const getUsuariosByRol = async (rol: string): Promise<Usuario[]> => {
  const { data, error } = await fromTable('usuarios').select('*').eq('rol', rol).eq('activo', true);
  if (error) return [];
  return ((data as DbRecord[]) || []).map(fromDbUsuario);
};

// ============================================
// GAPs
// ============================================

export const getAllGAPs = async (): Promise<GAP[]> => {
  try {
    const { data, error } = await fromTable('gaps').select('*').order('numero');
    if (error || !data || data.length === 0) {
      console.warn('Error or no data in getAllGAPs, checking if table is empty...');
      if (!error && data && data.length === 0) {
        console.log('Seeding gaps table from mockData...');
        for (const g of gapsMock) {
          const dbData = toDbGAP(g);
          await fromTable('gaps').insert([dbData as any]);
        }
        return gapsMock;
      }
      return gapsMock;
    }
    const mapped = ((data as DbRecord[]) || []).map(fromDbGAP);
    gapsMock.splice(0, gapsMock.length, ...mapped);
    return mapped;
  } catch (err) {
    console.error('Exception in getAllGAPs:', err);
    return gapsMock;
  }
};

export const getGAPById = async (id: string): Promise<GAP | null> => {
  const { data, error } = await fromTable('gaps').select('*').eq('id', id).single();
  if (error || !data) return null;
  return fromDbGAP(data as DbRecord);
};

export const crearGAP = async (gapData: Partial<GAP>): Promise<GAP | null> => {
  let localResult: GAP | null = null;
  try {
    localResult = crearGAPMock(gapData as any);
  } catch (e) {
    console.warn('Error running crearGAPMock:', e);
  }

  try {
    const { data: maxData } = await fromTable('gaps').select('numero').order('numero', { ascending: false }).limit(1);
    const maxNum = (maxData as any)?.[0]?.numero || 0;
    const nuevoNumero = maxNum + 1;
    const dbData = toDbGAP({
      ...gapData,
      id: localResult?.id || `gap${nuevoNumero}`,
      numero: nuevoNumero,
      codigo: `GAP-${nuevoNumero}`,
      fechaCreacion: new Date().toISOString().split('T')[0],
      activo: true,
    } as GAP);
    const { data, error } = await fromTable('gaps').insert([dbData as any]).select().single();
    if (error) { 
      console.error('Error creating GAP in Supabase, using mock:', error); 
      return localResult; 
    }
    const synced = data ? fromDbGAP(data as DbRecord) : null;
    if (synced && localResult) {
      const idx = gapsMock.findIndex(g => g.id === localResult!.id);
      if (idx !== -1) gapsMock[idx] = synced;
    }
    return synced || localResult;
  } catch (err) {
    console.error('Exception creating GAP in Supabase, using mock:', err);
    return localResult;
  }
};

export const actualizarGAP = async (id: string, datos: Partial<GAP>): Promise<boolean> => {
  try {
    editarGAPDataMock(id, datos);
  } catch (e) {
    console.warn('Error running editarGAPDataMock:', e);
  }

  const dbData = toDbGAPPartial(datos);
  const { error } = await fromTable('gaps').update(dbData as any).eq('id', id);
  if (error) { 
    console.error('Error actualizarGAP:', error); 
    return false; 
  }
  return true;
};

export const eliminarGAP = async (id: string): Promise<boolean> => {
  try {
    editarGAPDataMock(id, { activo: false });
  } catch (e) {
    console.warn('Error running editarGAPDataMock:', e);
  }

  const { error } = await fromTable('gaps').update({ activo: false } as any).eq('id', id);
  if (error) { console.error('Error eliminarGAP:', error); return false; }
  return true;
};

export const activarGAP = async (id: string): Promise<boolean> => {
  try {
    editarGAPDataMock(id, { activo: true });
  } catch (e) {
    console.warn('Error running editarGAPDataMock:', e);
  }

  const { error } = await fromTable('gaps').update({ activo: true } as any).eq('id', id);
  if (error) { console.error('Error activarGAP:', error); return false; }
  return true;
};

// ============================================
// MIEMBROS
// ============================================

export const getAllMiembros = async (): Promise<MiembroGAP[]> => {
  try {
    const { data, error } = await fromTable('miembros_gap').select('*');
    if (error || !data || data.length === 0) {
      console.warn('Error or no data in getAllMiembros, checking if table is empty...');
      if (!error && data && data.length === 0) {
        console.log('Seeding miembros table from mockData...');
        for (const m of miembrosMock) {
          const dbData = toDbMiembro(m);
          await fromTable('miembros_gap').insert([dbData as any]);
        }
        return miembrosMock;
      }
      return miembrosMock;
    }
    const mapped = ((data as DbRecord[]) || []).map(fromDbMiembro);
    miembrosMock.splice(0, miembrosMock.length, ...mapped);
    return mapped;
  } catch (err) {
    console.error('Exception in getAllMiembros:', err);
    return miembrosMock;
  }
};

export const getMiembrosByGAP = async (gapId: string): Promise<MiembroGAP[]> => {
  const { data, error } = await fromTable('miembros_gap').select('*').eq('gap_id', gapId);
  if (error) return [];
  return ((data as DbRecord[]) || []).map(fromDbMiembro);
};

export const crearMiembro = async (miembroData: Partial<MiembroGAP>): Promise<MiembroGAP | null> => {
  let localResult: MiembroGAP | null = null;
  try {
    localResult = crearMiembroMock(miembroData as any);
  } catch (e) {
    console.warn('Error running crearMiembroMock:', e);
  }

  try {
    const dbData = toDbMiembro({ 
      ...miembroData, 
      id: localResult?.id || `m${Date.now()}`,
      fechaRegistro: new Date().toISOString().split('T')[0] 
    } as MiembroGAP);
    const { data, error } = await fromTable('miembros_gap').insert([dbData as any]).select().single();
    if (error) { 
      console.error('Error creating member in Supabase, using mock:', error); 
      return localResult; 
    }
    const synced = data ? fromDbMiembro(data as DbRecord) : null;
    if (synced && localResult) {
      const idx = miembrosMock.findIndex(m => m.id === localResult!.id);
      if (idx !== -1) miembrosMock[idx] = synced;
    }
    return synced || localResult;
  } catch (err) {
    console.error('Exception creating member in Supabase, using mock:', err);
    return localResult;
  }
};

export const actualizarMiembro = async (id: string, datos: Partial<MiembroGAP>): Promise<boolean> => {
  try {
    editarMiembroDataMock(id, datos);
  } catch (e) {
    console.warn('Error running editarMiembroDataMock:', e);
  }

  const dbData = toDbMiembroPartial(datos);
  const { error } = await fromTable('miembros_gap').update(dbData as any).eq('id', id);
  if (error) { 
    console.error('Error actualizarMiembro:', error); 
    return false; 
  }
  return true;
};

export const eliminarMiembro = async (id: string): Promise<boolean> => {
  try {
    const index = miembrosMock.findIndex(m => m.id === id);
    if (index >= 0) {
      miembrosMock.splice(index, 1);
    }
  } catch (e) {
    console.warn('Error running mock delete:', e);
  }

  const { error } = await fromTable('miembros_gap').delete().eq('id', id);
  if (error) { console.error('Error eliminarMiembro:', error); return false; }
  return true;
};

// ============================================
// CUESTIONARIOS
// ============================================

export const getAllCuestionarios = async (): Promise<Cuestionario[]> => {
  try {
    const { data, error } = await fromTable('cuestionarios').select('*').order('fecha_creacion', { ascending: false });
    if (error || !data || data.length === 0) {
      console.warn('Error or no data in getAllCuestionarios, falling back to mockData:', error);
      return cuestionariosMock;
    }
    const mapped = ((data as DbRecord[]) || []).map(fromDbCuestionario);
    
    // Auto-seed check: if the database doesn't have cuest3, seed it from mock
    const tieneCrearGap = mapped.some(c => c.id === 'cuest3');
    if (!tieneCrearGap) {
      const gapCuestionario = cuestionariosMock.find(c => c.id === 'cuest3');
      if (gapCuestionario) {
        console.log('Seeding Crear GAP questionnaire to Supabase...');
        try {
          const dbData = toDbCuestionario(gapCuestionario);
          await fromTable('cuestionarios').insert([dbData as any]);
          mapped.push(gapCuestionario);
        } catch (dbErr) {
          console.error('Error seeding Crear GAP questionnaire:', dbErr);
        }
      }
    }

    // Auto-seed check: if the database doesn't have cuest4, or if cuest4 doesn't have subOpciones in its 19th question, or if Franja Generacional is missing, we seed/overwrite it from mock
    const cuest4Db = mapped.find(c => c.id === 'cuest4');
    const tieneNuevoIntegrante = !!cuest4Db;
    const tieneSubOpciones = cuest4Db?.preguntas?.find(p => p.id === 'pin19')?.opciones?.some(o => o.subOpciones && o.subOpciones.length > 0);
    const tieneFranjaGen = cuest4Db?.preguntas?.find(p => p.id === 'pin19')?.opciones?.some(o => o.id === 'mn11');
    
    if (!tieneNuevoIntegrante || !tieneSubOpciones || !tieneFranjaGen) {
      const integranteCuestionario = cuestionariosMock.find(c => c.id === 'cuest4');
      if (integranteCuestionario) {
        console.log('Seeding or updating Nuevo Integrante questionnaire to Supabase with subOpciones...');
        try {
          const dbData = toDbCuestionario(integranteCuestionario);
          if (tieneNuevoIntegrante) {
            await fromTable('cuestionarios').update(dbData as any).eq('id', 'cuest4');
            const idx = mapped.findIndex(c => c.id === 'cuest4');
            if (idx >= 0) mapped[idx] = integranteCuestionario;
          } else {
            await fromTable('cuestionarios').insert([dbData as any]);
            mapped.push(integranteCuestionario);
          }
        } catch (dbErr) {
          console.error('Error seeding/updating Nuevo Integrante questionnaire:', dbErr);
        }
      }
    }
    
    cuestionariosMock.splice(0, cuestionariosMock.length, ...mapped);
    return mapped;
  } catch (err) {
    console.error('Exception in getAllCuestionarios, falling back to mock:', err);
    return cuestionariosMock;
  }
};

export const getCuestionarioById = async (id: string): Promise<Cuestionario | null> => {
  try {
    const { data, error } = await fromTable('cuestionarios').select('*').eq('id', id).single();
    if (error || !data) {
      const mockResult = cuestionariosMock.find(c => c.id === id);
      return mockResult || null;
    }
    return fromDbCuestionario(data as DbRecord);
  } catch (err) {
    const mockResult = cuestionariosMock.find(c => c.id === id);
    return mockResult || null;
  }
};

export const crearCuestionario = async (cuestionarioData: Partial<Cuestionario>): Promise<Cuestionario | null> => {
  const mockResult = crearCuestionarioMock(cuestionarioData as any);
  
  try {
    const dbData = toDbCuestionario(mockResult);
    const { data, error } = await fromTable('cuestionarios').insert([dbData as any]).select().single();
    if (error) {
      console.error('Error creating questionnaire in Supabase, using mockData:', error);
      return mockResult;
    }
    return data ? fromDbCuestionario(data as DbRecord) : mockResult;
  } catch (err) {
    console.error('Exception in crearCuestionario, using mockData:', err);
    return mockResult;
  }
};

export const actualizarCuestionario = async (id: string, datos: Partial<Cuestionario>): Promise<boolean> => {
  const mockSuccess = actualizarCuestionarioMock(id, datos);
  
  try {
    const dbData = toDbCuestionarioPartial(datos);
    dbData.fecha_modificacion = new Date().toISOString().split('T')[0];
    const { error } = await fromTable('cuestionarios').update(dbData as any).eq('id', id);
    if (error) {
      console.error('Error updating questionnaire in Supabase, mock update status is:', mockSuccess, error);
      return mockSuccess;
    }
    return true;
  } catch (err) {
    console.error('Exception in actualizarCuestionario, using mock status:', err);
    return mockSuccess;
  }
};

export const eliminarCuestionario = async (id: string): Promise<boolean> => {
  const mockSuccess = eliminarCuestionarioMock(id);
  try {
    const { error } = await fromTable('cuestionarios').update({ activo: false } as any).eq('id', id);
    if (error) {
      console.error('Error deleting questionnaire in Supabase:', error);
      return mockSuccess;
    }
    return true;
  } catch (err) {
    console.error('Exception in eliminarCuestionario:', err);
    return mockSuccess;
  }
};

export const activarCuestionario = async (id: string): Promise<boolean> => {
  const mockSuccess = activarCuestionarioMock(id);
  try {
    const { error } = await fromTable('cuestionarios').update({ activo: true } as any).eq('id', id);
    if (error) {
      console.error('Error activating questionnaire in Supabase:', error);
      return mockSuccess;
    }
    return true;
  } catch (err) {
    console.error('Exception in activarCuestionario:', err);
    return mockSuccess;
  }
};

export const guardarRespuestaCuestionario = async (respuesta: Partial<RespuestaCuestionario>): Promise<boolean> => {
  try {
    guardarRespuestaCuestionarioMock(respuesta as any);
  } catch (err) {
    console.error('Error writing answer to mockData:', err);
  }

  try {
    const dbData = {
      cuestionario_id: respuesta.cuestionarioId,
      usuario_id: respuesta.usuarioId || null,
      usuario_nombre: respuesta.usuarioNombre || null,
      usuario_rol: respuesta.usuarioRol || null,
      respuestas: respuesta.respuestas as any,
      fecha_respuesta: new Date().toISOString(),
    };
    const { error } = await fromTable('respuestas_cuestionarios').insert([dbData as any]);
    if (error) {
      console.error('Error saving answer to Supabase:', error);
      return true;
    }
    return true;
  } catch (err) {
    console.error('Exception in guardarRespuestaCuestionario:', err);
    return true;
  }
};

export const getRespuestasByCuestionario = async (cuestionarioId: string): Promise<RespuestaCuestionario[]> => {
  try {
    const { data, error } = await fromTable('respuestas_cuestionarios').select('*').eq('cuestionario_id', cuestionarioId);
    if (error || !data || data.length === 0) {
      return getRespuestasByCuestionarioMock(cuestionarioId);
    }
    return ((data as DbRecord[]) || []).map(fromDbRespuesta);
  } catch (err) {
    return getRespuestasByCuestionarioMock(cuestionarioId);
  }
};

// ============================================
// ESCALAMIENTOS
// ============================================

export const getAllEscalamientos = async (): Promise<Escalamiento[]> => {
  const { data, error } = await fromTable('escalamientos').select('*').order('fecha_creacion', { ascending: false });
  if (error) { console.error('Error getAllEscalamientos:', error); return []; }
  return ((data as DbRecord[]) || []).map(fromDbEscalamiento);
};

export const crearEscalamiento = async (escData: Partial<Escalamiento>): Promise<Escalamiento | null> => {
  const dbData = toDbEscalamiento({ ...escData, fechaCreacion: new Date().toISOString().split('T')[0] } as Escalamiento);
  const { data, error } = await fromTable('escalamientos').insert([dbData as any]).select().single();
  if (error) { console.error('Error crearEscalamiento:', error); return null; }
  return data ? fromDbEscalamiento(data as DbRecord) : null;
};

export const actualizarEscalamiento = async (id: string, datos: Partial<Escalamiento>): Promise<boolean> => {
  const dbData = toDbEscalamientoPartial(datos);
  const { error } = await fromTable('escalamientos').update(dbData as any).eq('id', id);
  if (error) { console.error('Error actualizarEscalamiento:', error); return false; }
  return true;
};

// ============================================
// EVENTOS CALENDARIO
// ============================================

export const getAllEventos = async (): Promise<EventoCalendario[]> => {
  const { data, error } = await fromTable('eventos_calendario').select('*').eq('activo', true);
  if (error) { console.error('Error getAllEventos:', error); return []; }
  return ((data as DbRecord[]) || []).map(fromDbEvento);
};

export const crearEvento = async (eventoData: Partial<EventoCalendario>): Promise<EventoCalendario | null> => {
  const dbData = toDbEvento({ ...eventoData, fechaCreacion: new Date().toISOString().split('T')[0], activo: true } as EventoCalendario);
  const { data, error } = await fromTable('eventos_calendario').insert([dbData as any]).select().single();
  if (error) { console.error('Error crearEvento:', error); return null; }
  return data ? fromDbEvento(data as DbRecord) : null;
};

// ============================================
// ESTADISTICAS
// ============================================

export const getEstadisticas = async () => {
  const { count: totalUsuarios } = await fromTable('usuarios').select('*', { count: 'exact', head: true });
  const { count: totalGAPs } = await fromTable('gaps').select('*', { count: 'exact', head: true });
  const { count: totalMiembros } = await fromTable('miembros_gap').select('*', { count: 'exact', head: true });
  const { count: escalamientosAbiertos } = await fromTable('escalamientos').select('*', { count: 'exact', head: true }).eq('estado', 'Abierto');
  
  return {
    totalUsuarios: totalUsuarios || 0,
    totalGAPs: totalGAPs || 0,
    totalMiembros: totalMiembros || 0,
    totalZonas: 0,
    escalamientosAbiertos: escalamientosAbiertos || 0,
    escalamientosUrgentes: 0,
    escalamientosCerradosMes: 0,
    miembrosNuevosMes: 0,
    bautizosMes: 0,
    graduadosEFC: 0,
    asistenciaPromedio: 0,
    gruposActivos: totalGAPs || 0,
    gruposInactivos: 0,
  };
};

// ============================================
// HELPERS - DB <-> App
// ============================================

function fromDbUsuario(db: DbRecord): Usuario {
  const id = db.id as string;
  const fotoPerfil = localStorage.getItem(`ibc_foto_perfil_${id}`) || undefined;
  return {
    id,
    correo: db.correo as string,
    nombre: db.nombre as string,
    apellidos: db.apellidos as string,
    rol: db.rol as RolUsuario,
    activo: db.activo as boolean,
    claveTemporal: db.clave_temporal as string,
    fechaRegistro: db.fecha_registro as string,
    ultimoAcceso: db.ultimo_acceso as string | undefined,
    fotoPerfil,
    tipoDocumento: db.tipo_documento as any,
    numeroDocumento: db.numero_documento as string,
    fechaNacimiento: db.fecha_nacimiento as string,
    sexo: db.sexo as any,
    estadoCivil: db.estado_civil as any,
    telefono: db.telefono as string,
    numeroWhatsApp: db.numero_whatsapp as string | undefined,
    direccion: db.direccion as string,
    barrio: db.barrio as string,
    departamento: db.departamento as string,
    profesion: db.profesion as string,
    esMiembroIBC: db.es_miembro_ibc as boolean,
    esBautizado: db.es_bautizado as boolean,
    escuelaFormacion: db.escuela_formacion as any,
    moduloEFC: db.modulo_efc as any,
    ministerios: (db.ministerios as any[]) || [],
    franjaGeneracional: db.franja_generacional as any,
    areaServidores: db.area_servidores as any,
    areaFlamasFuego: db.area_flamas_fuego as any,
    pastorId: db.pastor_id as string | undefined,
    liderMentorId: db.lider_mentor_id as string | undefined,
    liderGapId: db.lider_gap_id as string | undefined,
    gapId: db.gap_id as string | undefined,
  };
}

function toDbUsuario(u: Usuario): DbRecord {
  return {
    id: u.id, correo: u.correo, email: u.correo, nombre: u.nombre, apellidos: u.apellidos,
    rol: u.rol, activo: u.activo, clave_temporal: u.claveTemporal,
    fecha_registro: u.fechaRegistro, ultimo_acceso: u.ultimoAcceso,
    tipo_documento: u.tipoDocumento, numero_documento: u.numeroDocumento,
    fecha_nacimiento: u.fechaNacimiento, sexo: u.sexo, estado_civil: u.estadoCivil,
    telefono: u.telefono, tiene_whatsapp: !!u.numeroWhatsApp,
    direccion: u.direccion, barrio: u.barrio, departamento: u.departamento,
    profesion: u.profesion, es_miembro_ibc: u.esMiembroIBC, es_bautizado: u.esBautizado,
    escuela_formacion: u.escuelaFormacion, modulo_efc: u.moduloEFC,
    ministerios: u.ministerios, franja_generacional: u.franjaGeneracional,
    area_servidores: u.areaServidores, area_flamas_fuego: u.areaFlamasFuego,
    pastor_id: u.pastorId, lider_mentor_id: u.liderMentorId,
    lider_gap_id: u.liderGapId, gap_id: u.gapId,
  };
}

function toDbUsuarioPartial(u: Partial<Usuario>): DbRecord {
  const result: DbRecord = {};
  if (u.correo !== undefined) { result.correo = u.correo; result.email = u.correo; }
  if (u.nombre !== undefined) result.nombre = u.nombre;
  if (u.apellidos !== undefined) result.apellidos = u.apellidos;
  if (u.rol !== undefined) result.rol = u.rol;
  if (u.activo !== undefined) result.activo = u.activo;
  if (u.claveTemporal !== undefined) result.clave_temporal = u.claveTemporal;
  if (u.fechaRegistro !== undefined) result.fecha_registro = u.fechaRegistro;
  if (u.ultimoAcceso !== undefined) result.ultimo_acceso = u.ultimoAcceso;
  if (u.tipoDocumento !== undefined) result.tipo_documento = u.tipoDocumento;
  if (u.numeroDocumento !== undefined) result.numero_documento = u.numeroDocumento;
  if (u.fechaNacimiento !== undefined) result.fecha_nacimiento = u.fechaNacimiento;
  if (u.sexo !== undefined) result.sexo = u.sexo;
  if (u.estadoCivil !== undefined) result.estado_civil = u.estadoCivil;
  if (u.telefono !== undefined) result.telefono = u.telefono;
  if (u.numeroWhatsApp !== undefined) result.tiene_whatsapp = !!u.numeroWhatsApp;
  if (u.direccion !== undefined) result.direccion = u.direccion;
  if (u.barrio !== undefined) result.barrio = u.barrio;
  if (u.departamento !== undefined) result.departamento = u.departamento;
  if (u.profesion !== undefined) result.profesion = u.profesion;
  if (u.esMiembroIBC !== undefined) result.es_miembro_ibc = u.esMiembroIBC;
  if (u.esBautizado !== undefined) result.es_bautizado = u.esBautizado;
  if (u.escuelaFormacion !== undefined) result.escuela_formacion = u.escuelaFormacion;
  if (u.moduloEFC !== undefined) result.modulo_efc = u.moduloEFC;
  if (u.ministerios !== undefined) result.ministerios = u.ministerios;
  if (u.franjaGeneracional !== undefined) result.franja_generacional = u.franjaGeneracional;
  if (u.areaServidores !== undefined) result.area_servidores = u.areaServidores;
  if (u.areaFlamasFuego !== undefined) result.area_flamas_fuego = u.areaFlamasFuego;
  if (u.pastorId !== undefined) result.pastor_id = u.pastorId;
  if (u.liderMentorId !== undefined) result.lider_mentor_id = u.liderMentorId;
  if (u.liderGapId !== undefined) result.lider_gap_id = u.liderGapId;
  if (u.gapId !== undefined) result.gap_id = u.gapId;
  return result;
}

function fromDbGAP(db: DbRecord): GAP {
  return {
    id: db.id as string, numero: db.numero as number, codigo: db.codigo as string,
    liderGapId: db.lider_gap_id as string, liderGapNombre: (db.lider_gap_nombre as string) || 'Líder Desconocido',
    timoteoId: db.timoteo_id as string, timoteoNombre: (db.timoteo_nombre as string) || 'Timoteo Desconocido',
    pastorId: db.pastor_id as string, pastorNombre: (db.pastor_nombre as string) || 'Pastor Desconocido',
    liderMentorId: db.lider_mentor_id as string, liderMentorNombre: (db.lider_mentor_nombre as string) || 'Líder Mentor Desconocido',
    zonaId: db.zona_id as string | undefined, direccion: db.direccion as string,
    barrio: db.barrio as string, departamento: db.departamento as string,
    ubicacionReunion: db.ubicacion_reunion as any,
    miembros: ((db.miembros as any[]) || []),
    diaReunion: db.dia_reunion as string, horaReunion: db.hora_reunion as string,
    frecuencia: db.frecuencia as any, modalidad: db.modalidad as any,
    activo: db.activo as boolean, fechaCreacion: db.fecha_creacion as string,
    reunionConfirmada: (db.reunion_confirmada as boolean | undefined) || false,
    fechaReunionConfirmada: db.fecha_reunion_confirmada as string | undefined,
    anfitrion: db.anfitrion as string | undefined,
  };
}

function toDbGAP(g: GAP): DbRecord {
  return {
    id: g.id, numero: g.numero, codigo: g.codigo, nombre: '',
    lider_gap_id: g.liderGapId, timoteo_id: g.timoteoId, pastor_id: g.pastorId, lider_mentor_id: g.liderMentorId,
    zona_id: g.zonaId, direccion: g.direccion, barrio: g.barrio, departamento: g.departamento,
    ubicacion_reunion: g.ubicacionReunion, dia_reunion: g.diaReunion, hora_reunion: g.horaReunion,
    frecuencia: g.frecuencia, modalidad: g.modalidad, activo: g.activo, fecha_creacion: g.fechaCreacion,
  };
}

function toDbGAPPartial(g: Partial<GAP>): DbRecord {
  const result: DbRecord = {};
  if (g.numero !== undefined) result.numero = g.numero;
  if (g.codigo !== undefined) result.codigo = g.codigo;
  if (g.liderGapId !== undefined) result.lider_gap_id = g.liderGapId;
  if (g.timoteoId !== undefined) result.timoteo_id = g.timoteoId;
  if (g.pastorId !== undefined) result.pastor_id = g.pastorId;
  if (g.liderMentorId !== undefined) result.lider_mentor_id = g.liderMentorId;
  if (g.zonaId !== undefined) result.zona_id = g.zonaId;
  if (g.direccion !== undefined) result.direccion = g.direccion;
  if (g.barrio !== undefined) result.barrio = g.barrio;
  if (g.departamento !== undefined) result.departamento = g.departamento;
  if (g.ubicacionReunion !== undefined) result.ubicacion_reunion = g.ubicacionReunion;
  if (g.diaReunion !== undefined) result.dia_reunion = g.diaReunion;
  if (g.horaReunion !== undefined) result.hora_reunion = g.horaReunion;
  if (g.frecuencia !== undefined) result.frecuencia = g.frecuencia;
  if (g.modalidad !== undefined) result.modalidad = g.modalidad;
  if (g.activo !== undefined) result.activo = g.activo;
  if (g.fechaCreacion !== undefined) result.fecha_creacion = g.fechaCreacion;
  return result;
}

function fromDbMiembro(db: DbRecord): MiembroGAP {
  return {
    id: db.id as string, nombres: db.nombres as string, apellidos: db.apellidos as string,
    tipoDocumento: db.tipo_documento as any, numeroDocumento: db.numero_documento as string,
    fechaNacimiento: db.fecha_nacimiento as string, sexo: db.sexo as any,
    estadoCivil: db.estado_civil as any, telefono: db.telefono as string,
    numeroWhatsApp: db.tiene_whatsapp ? (db.telefono as string) : undefined,
    correo: db.correo as string | undefined, direccion: db.direccion as string,
    barrio: db.barrio as string, departamento: db.departamento as string,
    profesion: db.profesion as string, esMiembroIBC: db.es_miembro_ibc as boolean,
    esBautizado: db.es_bautizado as boolean, escuelaFormacion: db.escuela_formacion as any,
    moduloEFC: db.modulo_efc as any, ministerios: (db.ministerios as any[]) || [],
    franjaGeneracional: (db.franja_generacional as any) || 'Adultos',
    areaServidores: db.area_servidores as any, areaFlamasFuego: db.area_flamas_fuego as any,
    gapId: db.gap_id as string, fechaRegistro: db.fecha_registro as string,
    foto: db.foto as string | undefined,
  };
}

function toDbMiembro(m: MiembroGAP): DbRecord {
  return {
    id: m.id, nombres: m.nombres, apellidos: m.apellidos,
    tipo_documento: m.tipoDocumento, numero_documento: m.numeroDocumento,
    fecha_nacimiento: m.fechaNacimiento, sexo: m.sexo, estado_civil: m.estadoCivil,
    telefono: m.telefono, tiene_whatsapp: !!m.numeroWhatsApp, correo: m.correo,
    direccion: m.direccion, barrio: m.barrio, departamento: m.departamento,
    profesion: m.profesion, es_miembro_ibc: m.esMiembroIBC, es_bautizado: m.esBautizado,
    escuela_formacion: m.escuelaFormacion, modulo_efc: m.moduloEFC,
    ministerios: m.ministerios, gap_id: m.gapId, fecha_registro: m.fechaRegistro,
  };
}

function toDbMiembroPartial(m: Partial<MiembroGAP>): DbRecord {
  const result: DbRecord = {};
  if (m.nombres !== undefined) result.nombres = m.nombres;
  if (m.apellidos !== undefined) result.apellidos = m.apellidos;
  if (m.tipoDocumento !== undefined) result.tipo_documento = m.tipoDocumento;
  if (m.numeroDocumento !== undefined) result.numero_documento = m.numeroDocumento;
  if (m.fechaNacimiento !== undefined) result.fecha_nacimiento = m.fechaNacimiento;
  if (m.sexo !== undefined) result.sexo = m.sexo;
  if (m.estadoCivil !== undefined) result.estado_civil = m.estadoCivil;
  if (m.telefono !== undefined) result.telefono = m.telefono;
  if (m.numeroWhatsApp !== undefined) result.tiene_whatsapp = !!m.numeroWhatsApp;
  if (m.correo !== undefined) result.correo = m.correo;
  if (m.direccion !== undefined) result.direccion = m.direccion;
  if (m.barrio !== undefined) result.barrio = m.barrio;
  if (m.departamento !== undefined) result.departamento = m.departamento;
  if (m.profesion !== undefined) result.profesion = m.profesion;
  if (m.esMiembroIBC !== undefined) result.esMiembroIBC = m.esMiembroIBC;
  if (m.esBautizado !== undefined) result.esBautizado = m.esBautizado;
  if (m.escuelaFormacion !== undefined) result.escuela_formacion = m.escuelaFormacion;
  if (m.moduloEFC !== undefined) result.modulo_efc = m.moduloEFC;
  if (m.ministerios !== undefined) result.ministerios = m.ministerios;
  if (m.gapId !== undefined) result.gap_id = m.gapId;
  if (m.fechaRegistro !== undefined) result.fecha_registro = m.fechaRegistro;
  return result;
}

function fromDbCuestionario(db: DbRecord): Cuestionario {
  return {
    id: db.id as string, titulo: db.titulo as string, descripcion: db.descripcion as string,
    instrucciones: db.instrucciones as string | undefined,
    preguntas: ((db.preguntas as any[]) || []).map((p: any) => ({ ...p, tipo: p.tipo as TipoPregunta })) as PreguntaCuestionario[],
    activo: db.activo as boolean, creadoPor: db.creado_por as string,
    creadoPorNombre: db.creado_por_nombre as string,
    fechaCreacion: db.fecha_creacion as string, fechaModificacion: db.fecha_modificacion as string,
    permitirMultiplesRespuestas: db.permitir_multiples_respuestas as boolean,
    requerirAutenticacion: db.requerir_autenticacion as boolean,
    fechaInicio: db.fecha_inicio as string | undefined,
    fechaFin: db.fecha_fin as string | undefined,
    asignadoARoles: db.asignado_a_roles as any,
    asignadoAUsuarios: db.asignado_a_usuarios as string[] | undefined,
    asignadoAGAPs: db.asignado_a_gaps as string[] | undefined,
  };
}

function toDbCuestionario(c: Cuestionario): DbRecord {
  return {
    id: c.id, titulo: c.titulo, descripcion: c.descripcion,
    instrucciones: c.instrucciones, preguntas: c.preguntas as any,
    activo: c.activo, creado_por: c.creadoPor, creado_por_nombre: c.creadoPorNombre,
    fecha_creacion: c.fechaCreacion, fecha_modificacion: c.fechaModificacion,
    permitir_multiples_respuestas: c.permitirMultiplesRespuestas,
    requerir_autenticacion: c.requerirAutenticacion,
    fecha_inicio: c.fechaInicio, fecha_fin: c.fechaFin,
    asignado_a_roles: c.asignadoARoles, asignado_a_usuarios: c.asignadoAUsuarios,
    asignado_a_gaps: c.asignadoAGAPs,
  };
}

function toDbCuestionarioPartial(c: Partial<Cuestionario>): DbRecord {
  const result: DbRecord = {};
  if (c.titulo !== undefined) result.titulo = c.titulo;
  if (c.descripcion !== undefined) result.descripcion = c.descripcion;
  if (c.instrucciones !== undefined) result.instrucciones = c.instrucciones;
  if (c.preguntas !== undefined) result.preguntas = c.preguntas as any;
  if (c.activo !== undefined) result.activo = c.activo;
  if (c.permitirMultiplesRespuestas !== undefined) result.permitir_multiples_respuestas = c.permitirMultiplesRespuestas;
  if (c.requerirAutenticacion !== undefined) result.requerir_autenticacion = c.requerirAutenticacion;
  if (c.fechaModificacion !== undefined) result.fecha_modificacion = c.fechaModificacion;
  return result;
}

function fromDbRespuesta(db: DbRecord): RespuestaCuestionario {
  return {
    id: db.id as string, cuestionarioId: db.cuestionario_id as string,
    usuarioId: db.usuario_id as string | undefined,
    usuarioNombre: db.usuario_nombre as string | undefined,
    usuarioRol: db.usuario_rol as any,
    respuestas: db.respuestas as any,
    fechaRespuesta: db.fecha_respuesta as string,
  };
}

function fromDbEscalamiento(db: DbRecord): Escalamiento {
  return {
    id: db.id as string, titulo: db.titulo as string, descripcion: db.descripcion as string,
    clasificacion: db.clasificacion as any, prioridad: db.prioridad as any,
    estado: db.estado as any, evaluacion: db.evaluacion as any,
    creadorId: db.creador_id as string, creadorNombre: db.creador_nombre as string,
    creadorRol: db.creador_rol as any, asignadoAId: db.asignado_a_id as string | undefined,
    asignadoANombre: db.asignado_a_nombre as string | undefined,
    asignadoARol: db.asignado_a_rol as any,
    gapId: db.gap_id as string | undefined,
    liderMentorId: db.lider_mentor_id as string | undefined,
    pastorId: db.pastor_id as string | undefined,
    fechaCreacion: db.fecha_creacion as string,
    fechaLimite: db.fecha_limite as string | undefined,
    fechaCierre: db.fecha_cierre as string | undefined,
    respuestas: (db.respuestas as any[]) || [],
    escaladoA: db.escalado_a as string | undefined,
    motivoEscalamiento: db.motivo_escalamiento as string | undefined,
  };
}

function toDbEscalamiento(e: Escalamiento): DbRecord {
  return {
    id: e.id, titulo: e.titulo, descripcion: e.descripcion,
    clasificacion: e.clasificacion, prioridad: e.prioridad, estado: e.estado,
    evaluacion: e.evaluacion, creador_id: e.creadorId, creador_nombre: e.creadorNombre,
    creador_rol: e.creadorRol, asignado_a_id: e.asignadoAId,
    asignado_a_nombre: e.asignadoANombre, asignado_a_rol: e.asignadoARol,
    gap_id: e.gapId, lider_mentor_id: e.liderMentorId, pastor_id: e.pastorId,
    fecha_creacion: e.fechaCreacion, fecha_limite: e.fechaLimite,
    fecha_cierre: e.fechaCierre, respuestas: e.respuestas,
    escalado_a: e.escaladoA, motivo_escalamiento: e.motivoEscalamiento,
  };
}

function toDbEscalamientoPartial(e: Partial<Escalamiento>): DbRecord {
  const result: DbRecord = {};
  if (e.estado !== undefined) result.estado = e.estado;
  if (e.asignadoAId !== undefined) result.asignado_a_id = e.asignadoAId;
  if (e.asignadoANombre !== undefined) result.asignado_a_nombre = e.asignadoANombre;
  if (e.asignadoARol !== undefined) result.asignado_a_rol = e.asignadoARol;
  if (e.fechaCierre !== undefined) result.fecha_cierre = e.fechaCierre;
  if (e.respuestas !== undefined) result.respuestas = e.respuestas;
  return result;
}

function fromDbEvento(db: DbRecord): EventoCalendario {
  return {
    id: db.id as string, titulo: db.titulo as string, descripcion: db.descripcion as string,
    tipo: (db.tipo as any) || 'Reunión', fecha: db.fecha as string, hora: db.hora as string | undefined,
    ubicacion: (db.ubicacion as string | undefined) || '', gapId: db.gap_id as string | undefined,
    creadorId: db.creado_por as string, creadorNombre: '',
    creadorRol: db.rol_creador as any, prioridad: db.prioridad as any,
    visibleParaTodos: (db.visible_para_todos as boolean) || true,
    visibleParaRoles: db.visible_para_roles as any,
    visibleParaGAPs: db.visible_para_gaps as string[] | undefined,
    recordatorioEnviado: false,
    fechaRecordatorio: undefined,
    activo: db.activo as boolean, fechaCreacion: db.created_at as string,
  };
}

function toDbEvento(e: EventoCalendario): DbRecord {
  return {
    id: e.id, titulo: e.titulo, descripcion: e.descripcion,
    fecha: e.fecha, hora: e.hora, creado_por: e.creadorId, rol_creador: e.creadorRol,
    prioridad: e.prioridad, activo: e.activo,
  };
}

// ============================================
// ASISTENCIAS
// ============================================

export const getAllAsistencias = async (): Promise<RegistroAsistencia[]> => {
  const { data, error } = await fromTable('asistencias').select('*');
  if (error) { console.error('Error getAllAsistencias:', error); return []; }
  return ((data as DbRecord[]) || []).map(fromDbAsistencia);
};

export const crearAsistencia = async (asistenciaData: Partial<RegistroAsistencia>): Promise<RegistroAsistencia | null> => {
  const dbData = toDbAsistencia({ ...asistenciaData, fechaRegistro: new Date().toISOString().split('T')[0] } as RegistroAsistencia);
  const { data, error } = await fromTable('asistencias').insert([dbData as any]).select().single();
  if (error) { console.error('Error crearAsistencia:', error); return null; }
  return data ? fromDbAsistencia(data as DbRecord) : null;
};

export const actualizarAsistencia = async (id: string, datos: Partial<RegistroAsistencia>): Promise<boolean> => {
  const { error } = await fromTable('asistencias').update(toDbAsistencia(datos as RegistroAsistencia) as any).eq('id', id);
  if (error) { console.error('Error actualizarAsistencia:', error); return false; }
  return true;
};

// ============================================
// PETICIONES DE ORACIÓN
// ============================================

export const getAllPeticiones = async (): Promise<PeticionOracion[]> => {
  const { data, error } = await fromTable('peticiones_oracion').select('*').order('fecha_creacion', { ascending: false });
  if (error) { console.error('Error getAllPeticiones:', error); return []; }
  return ((data as DbRecord[]) || []).map(fromDbPeticion);
};

export const crearPeticion = async (peticionData: Partial<PeticionOracion>): Promise<PeticionOracion | null> => {
  const dbData = toDbPeticion({ ...peticionData, fechaCreacion: new Date().toISOString().split('T')[0] } as PeticionOracion);
  const { data, error } = await fromTable('peticiones_oracion').insert([dbData as any]).select().single();
  if (error) { console.error('Error crearPeticion:', error); return null; }
  return data ? fromDbPeticion(data as DbRecord) : null;
};

export const actualizarPeticion = async (id: string, datos: Partial<PeticionOracion>): Promise<boolean> => {
  const { error } = await fromTable('peticiones_oracion').update(toDbPeticion(datos as PeticionOracion) as any).eq('id', id);
  if (error) { console.error('Error actualizarPeticion:', error); return false; }
  return true;
};

// ============================================
// MATERIALES DE ENSEÑANZA
// ============================================

export const getAllMateriales = async (): Promise<MaterialEnsenanza[]> => {
  const { data, error } = await fromTable('materiales_ensenanza').select('*').eq('activo', true);
  if (error) { console.error('Error getAllMateriales:', error); return []; }
  return ((data as DbRecord[]) || []).map(fromDbMaterial);
};

export const crearMaterial = async (materialData: Partial<MaterialEnsenanza>): Promise<MaterialEnsenanza | null> => {
  const dbData = toDbMaterial({ ...materialData, fechaSubida: new Date().toISOString().split('T')[0], activo: true } as MaterialEnsenanza);
  const { data, error } = await fromTable('materiales_ensenanza').insert([dbData as any]).select().single();
  if (error) { console.error('Error crearMaterial:', error); return null; }
  return data ? fromDbMaterial(data as DbRecord) : null;
};

// ============================================
// SALAS DE VIDEOLLAMADA
// ============================================

export const getAllSalas = async (): Promise<SalaVideollamada[]> => {
  const { data, error } = await fromTable('salas_videollamada').select('*').eq('activa', true);
  if (error) { console.error('Error getAllSalas:', error); return []; }
  return ((data as DbRecord[]) || []).map(fromDbSala);
};

export const crearSala = async (salaData: Partial<SalaVideollamada>): Promise<SalaVideollamada | null> => {
  const dbData = toDbSala({ ...salaData, fechaInicio: new Date().toISOString(), activa: true } as SalaVideollamada);
  const { data, error } = await fromTable('salas_videollamada').insert([dbData as any]).select().single();
  if (error) { console.error('Error crearSala:', error); return null; }
  return data ? fromDbSala(data as DbRecord) : null;
};

// ============================================
// MAPPERS PARA NUEVAS ENTIDADES
// ============================================

function fromDbAsistencia(db: DbRecord): RegistroAsistencia {
  return {
    id: db.id as string,
    gapId: db.gap_id as string,
    fecha: db.fecha as string,
    asistencias: [],
    totalAsistentes: db.total_asistentes as number,
    nuevosMiembros: db.nuevos_miembros as number,
    visitantes: db.visitantes as number,
    observaciones: db.observaciones as string | undefined,
    registradoPor: db.registrado_por as string,
    registradoPorNombre: '',
    fechaRegistro: db.fecha_registro as string,
  };
}

function toDbAsistencia(a: RegistroAsistencia): DbRecord {
  return {
    id: a.id,
    gap_id: a.gapId,
    fecha: a.fecha,
    lider_presente: true,
    timoteo_presente: true,
    total_asistentes: a.totalAsistentes,
    nuevos_miembros: a.nuevosMiembros,
    visitantes: a.visitantes,
    observaciones: a.observaciones || null,
    registrado_por: a.registradoPor,
    fecha_registro: a.fechaRegistro,
  };
}

function fromDbPeticion(db: DbRecord): PeticionOracion {
  return {
    id: db.id as string,
    titulo: db.titulo as string,
    descripcion: db.descripcion as string,
    creadorId: db.creador_id as string,
    creadorNombre: db.creador_nombre as string,
    creadorRol: db.creador_rol as any,
    gapId: db.gap_id as string | undefined,
    pastorId: db.pastor_id as string,
    fechaCreacion: db.fecha_creacion as string,
    oracionRecibida: db.oracion_recibida as boolean,
    fechaOracionRecibida: db.fecha_oracion_recibida as string | undefined,
    comentarios: db.comentarios as string | undefined,
  };
}

function toDbPeticion(p: PeticionOracion): DbRecord {
  return {
    id: p.id,
    titulo: p.titulo,
    descripcion: p.descripcion,
    creador_id: p.creadorId,
    creador_nombre: p.creadorNombre,
    creador_rol: p.creadorRol,
    gap_id: p.gapId || null,
    pastor_id: p.pastorId,
    fecha_creacion: p.fechaCreacion,
    oracion_recibida: p.oracionRecibida,
    fecha_oracion_recibida: p.fechaOracionRecibida || null,
    comentarios: p.comentarios || null,
  };
}

function fromDbMaterial(db: DbRecord): MaterialEnsenanza {
  return {
    id: db.id as string,
    titulo: db.titulo as string,
    descripcion: db.descripcion as string,
    tipo: (db.categoria as any) || 'PDF',
    url: (db.url_descarga as string) || '',
    subidoPor: (db.subido_por as string) || 'admin',
    subidoPorNombre: (db.subido_por_nombre as string) || 'Administrador',
    fechaSubida: db.fecha_subida as string,
    paraFrecuencia: (db.para_frecuencia as any) || 'Ambas',
    activo: db.activo as boolean,
  };
}

function toDbMaterial(m: MaterialEnsenanza): DbRecord {
  return {
    id: m.id,
    titulo: m.titulo,
    descripcion: m.descripcion,
    categoria: m.tipo,
    url_descarga: m.url,
    subido_por: m.subidoPor,
    subido_por_nombre: m.subidoPorNombre,
    fecha_subida: m.fechaSubida,
    para_frecuencia: m.paraFrecuencia,
    activo: m.activo,
  };
}

function fromDbSala(db: DbRecord): SalaVideollamada {
  return {
    id: db.id as string,
    gapId: db.gap_id as string,
    gapCodigo: (db.gap_codigo as string) || `GAP-${db.gap_id}`,
    iniciadaPor: (db.iniciada_por as string) || 'admin',
    iniciadaPorNombre: (db.iniciada_por_nombre as string) || 'Administrador',
    iniciadaPorRol: (db.iniciada_por_rol as any) || 'administrador',
    fechaInicio: db.fecha_inicio as string,
    activa: db.activa as boolean,
    participantes: (db.participantes as any[]) || [],
    urlSala: (db.url_sala as string) || '',
  };
}

function toDbSala(s: SalaVideollamada): DbRecord {
  return {
    id: s.id,
    gap_id: s.gapId,
    gap_codigo: s.gapCodigo,
    iniciada_por: s.iniciadaPor,
    iniciada_por_nombre: s.iniciadaPorNombre,
    iniciada_por_rol: s.iniciadaPorRol,
    fecha_inicio: s.fechaInicio,
    activa: s.activa,
    participantes: s.participantes as any,
    url_sala: s.urlSala,
  };
}
