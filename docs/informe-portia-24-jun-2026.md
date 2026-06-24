# Informe de producto — Portia
**Fecha:** 24 de junio de 2026  
**Versión:** Stage 2 completo + Stage 3 en progreso  
**Repositorio:** https://github.com/yoske7062/conserjeos

---

## 1. Qué es Portia

Portia es una aplicación de escritorio para conserjes de edificios residenciales. Reemplaza el libro físico de novedades, el registro manual de visitas y el control de encomiendas por un sistema digital en tiempo real.

**Tagline:** *"Tu edificio. Todo en orden."*

Es un producto SaaS B2B: se comercializa a administradoras de edificios, que la distribuyen a sus conserjes.

---

## 2. Problema que resuelve

Las consejerías de edificios en Chile operan mayoritariamente con cuadernos físicos. Esto genera:

- **Pérdida de información** al cambiar de turno (cuaderno ilegible, páginas arrancadas)
- **Sin trazabilidad** de quién atendió a quién y cuándo
- **Sin alertas** cuando hay una novedad urgente (accidente, robo, corte de suministro)
- **Responsabilidad difusa** ante reclamos: "no quedó registrado"
- **Aislamiento del administrador**: no puede ver lo que pasa en tiempo real

---

## 3. Usuarios

| Rol | Dispositivo | Qué hace en Portia |
|---|---|---|
| **Conserje** | App escritorio (Mac/Windows) | Registra novedades, visitas, encomiendas, tareas y entrega de turno |
| **Administrador** | Panel web (próximo) | Ve historial, crea tareas, gestiona conserjes y edificios |

---

## 4. Módulos actuales (app de escritorio)

### 4.1 Inicio
Hub interactivo con métricas del turno activo: visitas en el edificio, encomiendas pendientes, tareas y novedades urgentes. Navegación rápida a cada módulo con un clic.

### 4.2 Visitas
- Registro de entrada con nombre, RUT (opcional), departamento destino y motivo
- Tarjetas de visitas activas (personas que están en el edificio ahora)
- Registro de salida con cálculo automático de duración
- Historial del día en tabla

### 4.3 Encomiendas
- Registro de paquetes recibidos con foto adjunta
- Tabs "Pendientes" e "Historial"
- Marcado de entrega al residente con timestamp
- Indicador de cantidad pendiente en la cabecera

### 4.4 Tareas
- El administrador asigna tareas con prioridad (baja / normal / alta) y fecha de vencimiento
- El conserje las ve en su turno y las marca como completadas
- Las tareas vencidas se destacan visualmente

### 4.5 Novedades (Libro digital)
- Tipos: **Urgente**, **Incidente**, **Informativo** — con colores y criterios claros
- Fotos adjuntas como evidencia
- Actualización en tiempo real vía Supabase Realtime (WebSocket)
- Filtros por tipo de novedad
- Borrador automático: si el conserje cierra la app a mitad de una novedad, se recupera al volver
- Notificación nativa de escritorio al registrar una novedad urgente (otro conserje del edificio)

### 4.6 Entrega de turno
- Iniciar / cerrar turno con resumen automático
- Al cerrar, el conserje puede dejar pendientes en texto libre
- El conserje entrante ve un popup bloqueante hasta que confirma haber leído los pendientes
- Auditoría completa: editado_por, editado_at, valor_anterior en novedades, visitas y encomiendas

### 4.7 Ficha del Edificio
- Contactos importantes: administrador, electricista, gasista, etc.
- Protocolos de emergencia personalizados por edificio
- Útil para reemplazos que no conocen la comunidad

### 4.8 Ayuda
- Guía de inicio rápido (4 pasos)
- Descripción expandible de cada módulo con instrucciones de uso
- Preguntas frecuentes (modo offline, notificaciones, privacidad, auditoría)
- Información de soporte

---

## 5. Funcionalidades transversales

### Modo offline con cola de sincronización
Si el conserje pierde conexión, puede seguir registrando visitas, encomiendas y novedades (sin foto). Los registros se guardan en una cola local (localStorage) y se sincronizan automáticamente al reconectar. El TopBar muestra cuántas operaciones están pendientes.

### Notificaciones nativas de escritorio
Al registrar una novedad urgente desde otro dispositivo del mismo edificio, el conserje recibe una notificación nativa (macOS / Windows). Al hacer clic navega directamente al módulo Novedades.

### Indicador online/offline
TopBar permanente con estado de conexión en tiempo real.

### Botón de emergencia
Acceso rápido desde el TopBar para registrar una novedad urgente con un solo clic.

### Animaciones
Transiciones fluidas entre módulos (`page-enter`), modales con spring animation, FAB con pulso periódico, cards con hover lift.

### Accesibilidad para adultos mayores
- Paleta con contraste validado (WCAG AA)
- Tamaño mínimo de botones: 44px
- Fuente mínima: 16px
- Separación mínima entre controles: 8px
- Sin colores como único diferenciador (siempre acompañados de icono o texto)

### Tema claro / oscuro
Toggle en el sidebar, persiste en localStorage.

---

## 6. Stack técnico

| Capa | Tecnología |
|---|---|
| App de escritorio | Electron 35 + React 19 + Vite 6 |
| UI | Inline styles + CSS variables + Tailwind (solo clases base) |
| Backend | Supabase (PostgreSQL + Auth + Realtime + Storage) |
| Monorepo | Turborepo — `apps/desktop`, `packages/supabase` |
| CI/CD | GitHub Actions — genera DMG (Mac arm64 + x64) y NSIS (Windows x64) en cada tag `v*` |
| Base de datos | 7 tablas: edificios, perfiles, turnos, novedades, visitas, encomiendas, tareas |
| Seguridad | RLS en todas las tablas, JWT con auto-refresh, helpers `mi_edificio_id()` / `mi_rol()` |

---

## 7. Base de datos

```
edificios       → tenant principal (nombre, dirección, contactos, protocolos)
perfiles        → usuarios (conserje / admin) vinculados a un edificio
turnos          → turnos activos e histórico, con pendientes y reconocimiento
novedades       → libro de novedades con auditoría de ediciones
visitas         → entrada/salida de visitantes con auditoría
encomiendas     → paquetes recibidos y entregados con auditoría
tareas          → asignadas por admin, completadas por conserje
```

Todas con Row Level Security activado — cada usuario solo accede a datos de su edificio.

---

## 8. Estado de desarrollo

### Stage 1 — Completo ✅
Auth, turno básico, novedades/visitas/encomiendas, diseño base, CI/CD.

### Stage 2 — Completo ✅
Módulo Inicio, Entrega de turno con pendientes, Tareas, Ficha del Edificio, EmergenciaButton, animaciones, accesibilidad, toggle de tema, auditoría de ediciones, paleta accesible para adultos mayores.

### Stage 3 — En progreso 🔄
| Item | Estado |
|---|---|
| Notificaciones nativas urgentes | ✅ Implementado |
| Modo offline + cola de sync | ✅ Implementado |
| Módulo Ayuda / Tutorial | ✅ Implementado |
| Panel web del administrador | ⏳ Pendiente |
| Cumplimiento Ley 21.719 (privacidad) | ⏳ Pendiente |
| Onboarding de nuevos edificios | ⏳ Pendiente |
| Validación en terreno | ⏳ Pendiente |

---

## 9. Roadmap Stage 3 — Panel web del administrador

El administrador necesita una interfaz separada (web, no Electron) para:

- Ver todos los turnos activos e histórico
- Ver novedades, visitas y encomiendas de su edificio en tiempo real
- Crear y asignar tareas a conserjes
- Gestionar perfiles de conserjes (crear, desactivar)
- Ver métricas: promedio de visitas por día, encomiendas pendientes, tareas completadas

**Stack propuesto:** Next.js 15 + mismo proyecto Supabase + deploy en Vercel.

---

## 10. Modelo de negocio

**SaaS B2B mensual** — se cobra a la administradora de edificios, no al conserje.

| Plan | Target | Incluye |
|---|---|---|
| Trial | Prueba gratuita | 1 edificio, funciones básicas, 30 días |
| Basic | Edificios medianos | 1 edificio, historial 90 días, soporte por correo |
| Pro | Edificios grandes / múltiples | Varios edificios, historial completo, panel admin, soporte prioritario |

---

*Documento generado el 24 de junio de 2026. Para más información contactar al equipo de desarrollo.*
