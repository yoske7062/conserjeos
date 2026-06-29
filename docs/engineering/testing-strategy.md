# Estrategia de pruebas — Portia

Qué pruebas son obligatorias, cómo se organizan y qué cuenta como "probado".

---

## 1. Filosofía

Las pruebas verifican comportamiento con datos reales, no comportamiento simulado que diverge de producción. **Si una prueba pasa pero la feature está rota en producción, la prueba está mal.**

---

## 2. Tipos de prueba

### Unitarias (obligatorias para lógica pura)
Validan funciones pequeñas y aisladas. Hoy cubiertas con Vitest en `apps/desktop`.

Ejemplos que **deben** tener prueba unitaria:
- Cálculo del dígito verificador del RUT (`lib/rut.js`).
- Normalización y formateo de campos.
- Validación de estados y reglas de negocio.

Regla: la lógica de negocio se extrae a un módulo y **tanto producción como la prueba importan del mismo módulo**. Nunca se duplica la lógica en el archivo de prueba.

### Integración (recomendadas)
Validan la interacción entre componentes:
- App ↔ Supabase (con un esquema de prueba real, no mocks vacíos).
- Autenticación ↔ políticas RLS.
- Sincronización offline.

### End-to-end (para flujos críticos)
Simulan el comportamiento completo del usuario: iniciar sesión → crear un registro → editarlo → cerrar sesión → verificar permisos.

---

## 3. Casos críticos (mínimo a cubrir)

Toda feature que maneje datos o permisos debe probar:
- [ ] Datos inválidos.
- [ ] Usuario no autenticado.
- [ ] Usuario autenticado sin permisos.
- [ ] Recurso inexistente.
- [ ] Operación duplicada (ej. webhook recibido dos veces).
- [ ] Fallo de red.
- [ ] Fallo de servicio externo.
- [ ] Dos operaciones concurrentes sobre el mismo registro.

---

## 4. Fixtures reales

Las pruebas de lógica de dominio usan datos representativos de los reales. Para RUT chileno: cuerpos que produzcan DV numérico **y** DV = K (ej. un RUT cuyo dígito verificador sea K), no solo casos cómodos.

Los fixtures permanentes viven en `test/fixtures-reales/` cuando aplica.

---

## 5. QA manual antes de cada deploy

- [ ] El flujo principal funciona (sin crashes, sin estados en blanco).
- [ ] Los estados de carga aparecen y se resuelven.
- [ ] Los errores se manejan con gracia.
- [ ] Los datos persisten tras recargar.
- [ ] Funciona offline (donde aplica).
- [ ] No hay errores en consola del renderer.
- [ ] **Sentido de negocio:** inspeccioné 20+ entradas reales en cada listado significativo y confirmé que pertenecen ahí (no hay personas naturales en una lista de empresas, ni entradas contables donde debería haber clientes). Una suite que dice "227 distribuidores correctos" no equivale a un humano confirmando que ninguno se llama JUAN PEREZ.

---

## 6. Cómo correr

```bash
cd apps/desktop
npm test          # Vitest, una pasada
npm test -- --watch
```

CI corre las pruebas en cada Pull Request (`.github/workflows/ci.yml`). Un PR no se mergea con pruebas en rojo. **No se desactivan pruebas ni lint para aprobar un cambio.**
