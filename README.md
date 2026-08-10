# GRUPO AMIGOS IBC - Sistema de Gestión

Sistema integral de gestión para Grupos de Amistad y Propósito (GAP) de la Iglesia IBC.

![Versión](https://img.shields.io/badge/version-1.0.0-blue)
![React](https://img.shields.io/badge/React-19.2.0-61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-3178C6)
![Tailwind](https://img.shields.io/badge/Tailwind-3.4.19-06B6D4)

---

## 🚀 Inicio Rápido

### Requisitos
- Node.js 20+
- npm 10+

### Instalación

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar servidor de desarrollo
npm run dev

# 3. Abrir http://localhost:5173
```

### Construcción Producción

```bash
npm run build
```

Los archivos se generan en `dist/`.

---

## 👥 Credenciales de Acceso

| Rol | Email | Contraseña |
|-----|-------|------------|
| Pastor Principal | pastorprincipal@ibc.org | 123456 |
| Pastor | pastor1@ibc.org | 123456 |
| Líder Mentor | lidermentor1@ibc.org | 123456 |
| Líder GAP | lider1@ibc.org | 123456 |
| Timoteo | timoteo1@ibc.org | 123456 |
| Administrador | admin@ibc.org | 123456 |

---

## 📁 Estructura del Proyecto

```
src/
├── components/
│   ├── dashboard/      # Dashboards por rol
│   ├── forms/          # Formularios
│   ├── lists/          # Listados
│   ├── modules/        # Módulos funcionales
│   ├── modals/         # Modales
│   ├── layout/         # Layout components
│   ├── login/          # Login page
│   ├── admin/          # Admin panel
│   ├── common/         # Common components
│   └── ui/             # shadcn/ui components
├── context/            # React contexts
├── data/               # Mock data
├── hooks/              # Custom hooks
├── lib/                # Utilities
└── types/              # TypeScript types
```

---

## 🛠️ Scripts Disponibles

| Script | Descripción |
|--------|-------------|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Construir para producción |
| `npm run preview` | Previsualizar build |
| `npm run lint` | Ejecutar ESLint |

---

## 🎨 Características

- ✅ **7 Roles** con permisos diferenciados
- ✅ **Gestión de GAPs** completa
- ✅ **Control de Asistencia** semanal
- ✅ **Calendario de Eventos** con cumpleaños
- ✅ **Videollamadas** integradas
- ✅ **Módulo de Supervisión** para líderes
- ✅ **Material de Enseñanza** descargable
- ✅ **Peticiones de Oración**
- ✅ **Diseño Responsive** móvil-first
- ✅ **Interfaz Profesional** con glassmorphism

---

## 📦 Tecnologías

- React 19 + TypeScript
- Vite 7
- Tailwind CSS 3
- shadcn/ui
- date-fns
- Lucide React
- Recharts

---

## 📝 Notas

- Sistema con datos mock listo para integrar backend
- Diseño responsive optimizado para móviles
- Navegación inferior en dispositivos móviles
- Temas y colores personalizables

---

**Desarrollado para Iglesia IBC © 2025**
