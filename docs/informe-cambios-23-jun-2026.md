# Mini-informe — Cambios del 23 de junio de 2026

## Qué hice

Tomé el research de UX sobre conserjerías chilenas que llegó y lo usé para auditar el código existente, encontrar dónde no calzaba con lo que pedía el research, y ejecutar los cambios priorizados (crítico → importante → conveniente).

## Por qué lo hice así

1. **Diagnóstico antes de codear.** El research traía evidencia real (normativa chilena, competidores, principios de UX para adultos mayores). Antes de tocar código, comparé eso contra lo que ya estaba construido para encontrar las brechas reales, no las que yo suponía.

2. **Prioricé lo que bloquea o genera deuda cara.** El esquema de base de datos y el sistema de colores son caros de cambiar después de que hay datos reales y más pantallas construidas encima. Por eso fueron lo primero, antes que cosas más visibles pero más baratas de arreglar después.

3. **El usuario final del conserje manda el criterio de diseño.** Cuando se pidió revisar la paleta de colores, no cambié el verde por gusto — investigué qué dice la evidencia sobre percepción de color en adultos mayores (amarilleamiento del cristalino, sensibilidad al contraste) antes de elegir el dorado como reemplazo. Mismo criterio para el tamaño de botones, la estructura de navegación y el rediseño del botón de emergencia.

4. **Construí lo que faltaba, no lo que sonaba bien.** El módulo de Tareas no estaba en el plan original, pero surgió como necesidad real: el administrador no tenía forma de asignar o revisar trabajo del conserje. Lo agregué con su propia tabla y permisos (admin crea, conserje ejecuta) en vez de forzarlo dentro de otro módulo existente.

5. **Verifiqué en vivo, no solo en el código.** Cada tanda de cambios la probé corriendo la app real (login, clicks, inserts a Supabase) antes de darla por terminada, para no entregar algo que se ve bien en el editor pero falla al usarlo.

## Qué no hice y por qué

- **No toqué el modo offline.** Es una decisión de arquitectura grande y cara de revertir. El research mismo dice que hay que validar en terreno si los edificios realmente tienen problemas de internet antes de construir una cola de sincronización completa.
- **No inventé cumplimiento legal.** La Ley 21.719 de protección de datos requiere revisión de un abogado — dejé identificado el riesgo pero no tomé decisiones legales por mi cuenta.
- **No agregué módulos fuera de alcance.** El research marca explícitamente "no ahora" para vehículos, llaves o reconocimiento facial, aunque hubiera sido fácil sumarlos — la etapa actual exige profundidad en pocos módulos, no más superficie.

## Pendiente que requiere acción de Diego (o tuya)

- Correr 4 bloques de migración SQL en Supabase (están al final de `schema.sql`, marcados con comentarios).
- Decidir si quieren validar en terreno antes de seguir construyendo (el research lo recomienda fuerte).
