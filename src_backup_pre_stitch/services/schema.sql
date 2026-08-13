-- 1. Habilitar extensión UUID
create extension if not exists "uuid-ossp";

-- 2. Tabla de Usuarios
create table if not exists public.usuarios (
    id text primary key,
    correo text not null unique,
    nombre text not null,
    apellidos text not null,
    rol text not null,
    activo boolean default true,
    clave_temporal text,
    fecha_registro text,
    ultimo_acceso text,
    tipo_documento text,
    numero_documento text,
    fecha_nacimiento text,
    sexo text,
    estado_civil text,
    telefono text,
    numero_whatsapp text,
    direccion text,
    barrio text,
    departamento text,
    profesion text,
    es_miembro_ibc boolean default true,
    es_bautizado boolean default false,
    escuela_formacion text,
    modulo_efc text,
    ministerios text[],
    franja_generacional text,
    area_servidores text,
    area_flamas_fuego text,
    pastor_id text,
    lider_mentor_id text,
    lider_gap_id text,
    gap_id text
);

-- 3. Tabla de GAPs
create table if not exists public.gaps (
    id text primary key,
    numero integer not null,
    codigo text not null,
    lider_gap_id text,
    lider_gap_nombre text,
    timoteo_id text,
    timoteo_nombre text,
    pastor_id text,
    pastor_nombre text,
    lider_mentor_id text,
    lider_mentor_nombre text,
    zona_id text,
    direccion text,
    barrio text,
    departamento text,
    ubicacion_reunion text,
    dia_reunion text,
    hora_reunion text,
    frecuencia text,
    modalidad text,
    activo boolean default true,
    fecha_creacion text,
    reunion_confirmada boolean default false,
    fecha_reunion_confirmada text,
    anfitrion text,
    miembros text[]
);

-- 4. Tabla de Miembros GAP
create table if not exists public.miembros_gap (
    id text primary key,
    nombres text not null,
    apellidos text not null,
    tipo_documento text,
    numero_documento text,
    fecha_nacimiento text,
    sexo text,
    estado_civil text,
    telefono text,
    numero_whatsapp text,
    correo text,
    direccion text,
    barrio text,
    departamento text,
    profesion text,
    es_miembro_ibc boolean default true,
    es_bautizado boolean default false,
    escuela_formacion text,
    modulo_efc text,
    ministerios text[],
    franja_generacional text,
    area_servidores text,
    area_flamas_fuego text,
    gap_id text,
    fecha_registro text
);

-- 5. Tabla de Cuestionarios
create table if not exists public.cuestionarios (
    id text primary key,
    titulo text not null,
    descripcion text,
    instrucciones text,
    preguntas jsonb default '[]'::jsonb,
    activo boolean default true,
    creado_por text,
    creado_por_nombre text,
    fecha_creacion text,
    fecha_modificacion text,
    permitir_multiples_respuestas boolean default false,
    requerir_autenticacion boolean default true,
    fecha_inicio text,
    fecha_fin text,
    asignado_a_roles text[],
    asignado_a_usuarios text[],
    asignado_a_gaps text[]
);

-- 6. Tabla de Respuestas de Cuestionarios
create table if not exists public.respuestas_cuestionarios (
    id serial primary key,
    cuestionario_id text not null,
    usuario_id text,
    usuario_nombre text,
    usuario_rol text,
    respuestas jsonb default '{}'::jsonb,
    fecha_respuesta text
);

-- 7. Tabla de Escalamientos
create table if not exists public.escalamientos (
    id text primary key,
    titulo text not null,
    descripcion text,
    clasificacion text,
    prioridad text,
    estado text,
    evaluacion text,
    creador_id text,
    creador_nombre text,
    creador_rol text,
    asignado_a_id text,
    asignado_a_nombre text,
    asignado_a_rol text,
    gap_id text,
    lider_mentor_id text,
    pastor_id text,
    fecha_creacion text,
    fecha_limite text,
    fecha_cierre text,
    respuestas jsonb default '[]'::jsonb,
    escalado_a text,
    motivo_escalamiento text
);

-- 8. Tabla de Eventos Calendario
create table if not exists public.eventos_calendario (
    id text primary key,
    titulo text not null,
    descripcion text,
    tipo text,
    fecha text not null,
    hora text,
    ubicacion text,
    gap_id text,
    creador_id text,
    creador_nombre text,
    creador_rol text,
    prioridad text,
    visible_para_todos boolean default true,
    visible_para_roles text[],
    visible_para_gaps text[],
    recordatorio_enviado boolean default false,
    fecha_recordatorio text,
    activo boolean default true,
    fecha_creacion text
);

-- 9. Tabla de Material de Enseñanza
create table if not exists public.materiales_ensenanza (
    id text primary key,
    titulo text not null,
    descripcion text,
    categoria text,
    url_descarga text,
    subido_por text,
    subido_por_nombre text,
    fecha_subida text,
    para_frecuencia text,
    activo boolean default true
);

-- 10. Tabla de Peticiones de Oración
create table if not exists public.peticiones_oracion (
    id text primary key,
    titulo text not null,
    descripcion text,
    creador_id text,
    creador_nombre text,
    creador_rol text,
    gap_id text,
    pastor_id text,
    fecha_creacion text,
    oracion_recibida boolean default false,
    fecha_oracion_recibida text,
    comentarios text
);

-- 11. Tabla de Asistencias
create table if not exists public.asistencias (
    id text primary key,
    gap_id text not null,
    fecha text not null,
    asistencias jsonb default '[]'::jsonb,
    total_asistentes integer default 0,
    nuevos_miembros integer default 0,
    visitantes integer default 0,
    observaciones text,
    registrado_por text,
    registrado_por_nombre text,
    fecha_registro text
);

-- 12. Tabla de Salas de Videollamada
create table if not exists public.salas_videollamada (
    id text primary key,
    gap_id text,
    gap_codigo text,
    iniciada_por text,
    iniciada_por_nombre text,
    iniciada_por_rol text,
    fecha_inicio text,
    url_sala text,
    participantes jsonb default '[]'::jsonb,
    activa boolean default true
);

-- 13. Cargar Usuarios Iniciales (Mock) para iniciar sesión
insert into public.usuarios (id, correo, nombre, apellidos, rol, activo, clave_temporal, fecha_registro, tipo_documento, numero_documento, telefono)
values 
('1', 'pastor@ibc.org', 'Carlos', 'Martínez Rodríguez', 'pastor_principal', true, '123456', '2024-01-01', 'CC', '1234567890', '3001234567'),
('2', 'admin@ibc.org', 'María', 'González López', 'administrador', true, '123456', '2024-01-15', 'CC', '2345678901', '3102345678'),
('3', 'pastor1@ibc.org', 'Pedro', 'Sánchez García', 'pastor', true, '123456', '2024-02-01', 'CC', '3456789012', '3203456789'),
('5', 'lidermentor1@ibc.org', 'Luis', 'Hernández Castro', 'lider_mentor', true, '123456', '2024-03-01', 'CC', '5678901234', '3405678901'),
('6', 'lidergap1@ibc.org', 'Juan', 'Pérez Díaz', 'lider_gap', true, '123456', '2024-03-15', 'CC', '6789012345', '3506789012'),
('7', 'timoteo1@ibc.org', 'Sofía', 'López Morales', 'timoteo', true, '123456', '2024-04-01', 'CC', '7890123456', '3607890123')
on conflict (id) do nothing;
