export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      usuarios: {
        Row: {
          id: string;
          correo: string;
          nombre: string;
          apellidos: string;
          rol: string;
          activo: boolean;
          clave_temporal: string;
          fecha_registro: string;
          ultimo_acceso: string | null;
          tipo_documento: string;
          numero_documento: string;
          fecha_nacimiento: string;
          sexo: string;
          estado_civil: string;
          telefono: string;
          numero_whatsapp: string | null;
          direccion: string;
          barrio: string;
          departamento: string;
          profesion: string;
          es_miembro_ibc: boolean;
          es_bautizado: boolean;
          escuela_formacion: string;
          modulo_efc: string | null;
          ministerios: string[];
          franja_generacional: string | null;
          area_servidores: string | null;
          area_flamas_fuego: string | null;
          pastor_id: string | null;
          lider_mentor_id: string | null;
          lider_gap_id: string | null;
          gap_id: string | null;
        };
        Insert: Omit<Database['public']['Tables']['usuarios']['Row'], 'id' | 'fecha_registro'> & { id?: string; fecha_registro?: string };
        Update: Partial<Database['public']['Tables']['usuarios']['Row']>;
      };
      gaps: {
        Row: {
          id: string;
          numero: number;
          codigo: string;
          lider_gap_id: string;
          lider_gap_nombre: string;
          timoteo_id: string;
          timoteo_nombre: string;
          pastor_id: string;
          pastor_nombre: string;
          lider_mentor_id: string;
          lider_mentor_nombre: string;
          zona_id: string | null;
          direccion: string;
          barrio: string;
          departamento: string;
          ubicacion_reunion: string;
          miembros: Json;
          dia_reunion: string;
          hora_reunion: string;
          frecuencia: string;
          modalidad: string;
          activo: boolean;
          fecha_creacion: string;
          reunion_confirmada: boolean | null;
          fecha_reunion_confirmada: string | null;
          anfitrion: string | null;
        };
        Insert: Omit<Database['public']['Tables']['gaps']['Row'], 'id' | 'fecha_creacion'> & { id?: string; fecha_creacion?: string };
        Update: Partial<Database['public']['Tables']['gaps']['Row']>;
      };
      miembros_gap: {
        Row: {
          id: string;
          nombres: string;
          apellidos: string;
          tipo_documento: string;
          numero_documento: string;
          fecha_nacimiento: string;
          sexo: string;
          estado_civil: string;
          telefono: string;
          numero_whatsapp: string | null;
          correo: string | null;
          direccion: string;
          barrio: string;
          departamento: string;
          profesion: string;
          es_miembro_ibc: boolean;
          es_bautizado: boolean;
          escuela_formacion: string;
          modulo_efc: string | null;
          ministerios: string[];
          franja_generacional: string | null;
          area_servidores: string | null;
          area_flamas_fuego: string | null;
          gap_id: string;
          fecha_registro: string;
        };
        Insert: Omit<Database['public']['Tables']['miembros_gap']['Row'], 'id' | 'fecha_registro'> & { id?: string; fecha_registro?: string };
        Update: Partial<Database['public']['Tables']['miembros_gap']['Row']>;
      };
      cuestionarios: {
        Row: {
          id: string;
          titulo: string;
          descripcion: string;
          instrucciones: string | null;
          preguntas: Json;
          activo: boolean;
          creado_por: string;
          creado_por_nombre: string;
          fecha_creacion: string;
          fecha_modificacion: string;
          permitir_multiples_respuestas: boolean;
          requerir_autenticacion: boolean;
          fecha_inicio: string | null;
          fecha_fin: string | null;
          asignado_a_roles: string[] | null;
          asignado_a_usuarios: string[] | null;
          asignado_a_gaps: string[] | null;
        };
        Insert: Omit<Database['public']['Tables']['cuestionarios']['Row'], 'id' | 'fecha_creacion' | 'fecha_modificacion'> & { id?: string; fecha_creacion?: string; fecha_modificacion?: string };
        Update: Partial<Database['public']['Tables']['cuestionarios']['Row']>;
      };
      respuestas_cuestionarios: {
        Row: {
          id: string;
          cuestionario_id: string;
          usuario_id: string | null;
          usuario_nombre: string | null;
          usuario_rol: string | null;
          respuestas: Json;
          fecha_respuesta: string;
        };
        Insert: Omit<Database['public']['Tables']['respuestas_cuestionarios']['Row'], 'id' | 'fecha_respuesta'> & { id?: string; fecha_respuesta?: string };
        Update: Partial<Database['public']['Tables']['respuestas_cuestionarios']['Row']>;
      };
      escalamientos: {
        Row: {
          id: string;
          titulo: string;
          descripcion: string;
          clasificacion: string;
          prioridad: string;
          estado: string;
          evaluacion: string | null;
          creador_id: string;
          creador_nombre: string;
          creador_rol: string;
          asignado_a_id: string | null;
          asignado_a_nombre: string | null;
          asignado_a_rol: string | null;
          gap_id: string | null;
          lider_mentor_id: string | null;
          pastor_id: string | null;
          fecha_creacion: string;
          fecha_limite: string | null;
          fecha_cierre: string | null;
          respuestas: Json;
          escalado_a: string | null;
          motivo_escalamiento: string | null;
        };
        Insert: Omit<Database['public']['Tables']['escalamientos']['Row'], 'id' | 'fecha_creacion'> & { id?: string; fecha_creacion?: string };
        Update: Partial<Database['public']['Tables']['escalamientos']['Row']>;
      };
      eventos_calendario: {
        Row: {
          id: string;
          titulo: string;
          descripcion: string;
          tipo: string;
          fecha: string;
          hora: string | null;
          ubicacion: string | null;
          gap_id: string | null;
          creador_id: string;
          creador_nombre: string;
          creador_rol: string;
          prioridad: string;
          visible_para_todos: boolean;
          visible_para_roles: string[] | null;
          visible_para_gaps: string[] | null;
          recordatorio_enviado: boolean;
          fecha_recordatorio: string | null;
          activo: boolean;
          fecha_creacion: string;
        };
        Insert: Omit<Database['public']['Tables']['eventos_calendario']['Row'], 'id' | 'fecha_creacion'> & { id?: string; fecha_creacion?: string };
        Update: Partial<Database['public']['Tables']['eventos_calendario']['Row']>;
      };
    };
  };
}
