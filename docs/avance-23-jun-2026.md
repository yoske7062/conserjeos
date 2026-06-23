# Portia — Avance del proyecto
**Fecha:** 23 de junio de 2026
**De:** James

---

## Resumen rápido

Llegó un research de UX profundo sobre conserjerías en Chile (cómo operan, qué exige la ley, qué usan los competidores, principios de diseño para usuarios mayores). Lo usé como base para auditar el código que ya tenía Diego y para tomar decisiones concretas de arquitectura y diseño. Esto es lo que cambió.

---

## 1. Lo que NO estaba bien y se corrigió

| Problema encontrado | Por qué importaba | Qué se hizo |
|---|---|---|
| "Entrega de turno" no existía como pantalla propia — era un botón suelto dentro de Novedades | El research la marca como **el diferenciador real** frente a la competencia (ComunidadFeliz no la tiene bien resuelta) | Módulo propio: resumen visual del turno, pendientes para el siguiente turno, checklist obligatorio de "leído" al iniciar |
| Un solo verde neón para marca, botones, éxito y todo lo demás | Los ojos mayores discriminan peor el espectro azul-verde (amarilleamiento del cristalino con la edad) — además colapsaba la semántica: "todo bien" se veía igual que "alerta" | Paleta separada: marca = dorado cálido, y 5 colores de estado distintos (éxito, info, advertencia, incidente, emergencia), cada uno con ícono + texto, nunca solo color |
| Botones e inputs de Novedades/Visitas/Encomiendas por debajo de 44px / 16px | El research cita WCAG: 44px y 16px no son sugerencias, son el piso para esta población (visión ~20/40 típica a los 80 años) | Subido a 44px / 16px en toda la app operativa |
| Si fallaba la conexión, el formulario fallaba en silencio | El conserje no sabía si su registro se guardó o no | Banner de error visible en cada acción, sin perder lo que ya estaba escrito |
| Sin auditoría de ediciones (esquema no tenía cómo guardar "quién editó qué") | Si algún día se permite corregir un registro, hay que dejar rastro — no se puede borrar la evidencia | Columnas `editado_por` / `editado_at` / `valor_anterior` en las 3 tablas de evidencia |
| No existía manejo de "no tengo turno" claro | El conserje no sabía dónde partir | Pantalla **Inicio** como hub: resumen + accesos directos grandes a todo |
| El hub no era interactivo (mostraba números sin decir dónde tocar) | Para un usuario con poca destreza digital, un número sin acción asociada es confuso | Cada tarjeta del hub es un botón completo que lleva directo a la info filtrada |
| No había forma de que el administrador asignara/revisara trabajo del conserje | Pedido explícito: visibilidad y control del admin sobre lo que hace el conserje | Módulo nuevo **Tareas**: admin crea, conserje completa, marca vencidas en rojo |
| "Protocolos" del edificio era un solo cuadro de texto gigante | Poco claro, difícil de mantener, nada estructurado | Lista de protocolos individuales (título + instrucciones), igual que los contactos |
| Botón de emergencia gigante y en el camino de clic frecuente | Riesgo real de apretarlo por accidente | Achicado y movido a la barra superior, lejos del flujo de navegación diario |
| Sin tema claro | El research recomienda alternativa a modo oscuro para turnos de día / lobbies con luz | Toggle tema claro/oscuro, paleta recalculada para ambos |

---

## 2. Estado actual por módulo

- ✅ **Inicio** — hub con resumen interactivo y accesos a todo
- ✅ **Visitas** — entrada/salida, mínimo de datos (RUT y foto opcionales)
- ✅ **Encomiendas** — recibir/entregar con foto
- ✅ **Tareas** (nuevo) — admin asigna, conserje ejecuta
- ✅ **Novedades** — bitácora urgente/incidente/informativo, con autoguardado de borrador si lo interrumpen
- ✅ **Entrega de turno** — iniciar/cerrar, pendientes para el siguiente, checklist obligatorio
- ✅ **Edificio** — contactos + protocolos individuales
- ✅ **Botón de emergencia** — 1 toque, protocolos por tipo, 0 campos obligatorios
- ✅ **Indicador de conexión** — visible en todo momento
- ✅ **Tema claro/oscuro**

## 3. Lo que falta (no se ha tocado a propósito)

- **Modo offline real** (cola de sincronización) — es arquitectura grande, no se justifica sin validar primero si los edificios realmente tienen problemas de internet
- **Dashboard web del administrador** — hoy todo vive en la app de escritorio del conserje
- **Cumplimiento Ley 21.719** (protección de datos) — falta revisión legal antes de vender
- **Validación en terreno** — todo el diseño actual se basa en research documental, no en entrevistas reales a conserjes

## 4. Pendiente técnico inmediato

Hay **4 bloques de migración SQL** acumulados en `packages/supabase/schema.sql` que todavía no se han corrido en Supabase (auditoría de ediciones, pendientes de turno, ficha de edificio, tabla de tareas). Sin esto, esas funciones fallan silenciosamente — hay que correrlos en el SQL Editor antes de seguir probando con datos reales.

---

*Repo: github.com/yoske7062/conserjeos*
