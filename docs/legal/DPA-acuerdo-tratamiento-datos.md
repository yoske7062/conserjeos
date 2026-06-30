# Acuerdo de Tratamiento de Datos (DPA) — Portia

> ⚠️ **BORRADOR generado por IA. No es asesoría legal ni un documento vigente.** Debe ser
> revisado y aprobado por un abogado, y firmado por ambas partes, antes de procesar datos reales.
> Ver [`README.md`](README.md).

**Última actualización del borrador:** 30 de junio de 2026
**Versión:** 0.1 (borrador, sin revisión legal)

---

Este acuerdo regula el tratamiento de datos personales que **Portia** (el "Encargado") realiza por
cuenta del **edificio / administradora** (el "Responsable"), en el marco de la **Ley N° 21.719** y
del contrato de prestación de servicios entre ambos.

## 1. Objeto y roles

- El **Responsable** (el edificio/administradora) determina los fines y medios del tratamiento.
- El **Encargado** (Portia) trata los datos **únicamente según las instrucciones** del Responsable
  y para prestar el servicio descrito en los Términos de Servicio.

## 2. Datos y titulares afectados

| Categoría de datos | Titulares |
|---|---|
| Nombre, RUT, destino de visita | Visitantes |
| Nombre, departamento (encomiendas) | Residentes |
| Fotos asociadas a registros | Personas que aparezcan en ellas |
| Horarios de acceso, novedades | Visitantes, residentes, conserjes |
| Nombre, correo (cuentas) | Conserjes y administradores |

## 3. Obligaciones del Encargado (Portia)

- Tratar los datos solo para prestar el servicio y según instrucciones documentadas del
  Responsable.
- Aplicar medidas de seguridad técnicas y organizativas (aislamiento por edificio con RLS, fotos
  en bucket privado con URLs firmadas, cifrado en tránsito y en reposo, control de acceso por
  roles). Ver [`../../SECURITY.md`](../../SECURITY.md).
- No ceder los datos a terceros salvo subencargados necesarios para el servicio (ver sección 5).
- Asistir al Responsable en la atención de solicitudes de los titulares (acceso, rectificación,
  supresión, etc.).
- Notificar al Responsable sin demora indebida ante una brecha de seguridad que afecte datos
  personales. Ver el procedimiento en [`../security/incident-response.md`](../security/incident-response.md).
- Eliminar o devolver los datos al terminar el servicio, según instruya el Responsable.

## 4. Obligaciones del Responsable (edificio / administradora)

- Tener una base legal válida para registrar los datos de las personas.
- Informar a los titulares sobre el tratamiento (apoyándose en la Política de Privacidad).
- No registrar datos sensibles innecesarios en campos de texto libre.
- Cursar a Portia solo instrucciones lícitas.

## 5. Subencargados

Portia se apoya en proveedores de infraestructura para prestar el servicio, principalmente:

| Subencargado | Servicio | Ubicación de los datos |
|---|---|---|
| Supabase | Base de datos, autenticación, almacenamiento de fotos | São Paulo, Brasil |
| Vercel | Hospedaje del panel web de administración | **[confirmar región]** |

> **Nota para revisión legal:** el almacenamiento en Brasil es una **transferencia internacional**.
> Debe quedar declarado y cubierto por las garantías que exija la Ley 21.719.

## 6. Transferencia internacional

Los datos se almacenan fuera de Chile (Brasil). El abogado debe confirmar las garantías
aplicables y si corresponde declarar esta transferencia explícitamente al titular y/o a la
autoridad.

## 7. Duración y término

Este acuerdo rige mientras Portia trate datos por cuenta del Responsable. Al terminar, Portia
devolverá o eliminará los datos según las instrucciones del Responsable y la política de
retención ([`../data/data-retention.md`](../data/data-retention.md)).

## 8. Firmas

| | Responsable (edificio/administradora) | Encargado (Portia) |
|---|---|---|
| Nombre | | |
| Cargo | | |
| Fecha | | |
