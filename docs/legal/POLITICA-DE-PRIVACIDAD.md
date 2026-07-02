# Política de Privacidad — Portia

> ⚠️ **BORRADOR generado por IA. No es asesoría legal ni un documento vigente.** Debe ser
> revisado y aprobado por un abogado antes de publicarse. Los campos entre `[corchetes]` son
> datos que los fundadores deben completar. Ver [`README.md`](README.md).

**Última actualización del borrador:** 30 de junio de 2026
**Versión:** 0.1 (borrador, sin revisión legal)

---

## 1. Quiénes somos y a quién aplica esta política

Portia es un software de gestión de conserjería operado por **[razón social / RUT de la empresa —
COMPLETAR]** ("Portia", "nosotros"), con domicilio en **[dirección — COMPLETAR]**, Santiago, Chile.

Esta política explica cómo se tratan los datos personales dentro de Portia, en el marco de la
**Ley N° 21.719** sobre protección de datos personales de Chile.

**Distinción de roles importante:**
- El **edificio o la administradora** que contrata Portia es el **responsable** de los datos: es
  quien decide registrar visitas, encomiendas y novedades, y para qué fin.
- **Portia es el encargado** del tratamiento: procesa esos datos por cuenta y según las
  instrucciones del responsable. Portia no usa los datos de los residentes/visitantes para fines
  propios.

Si usted es un visitante o residente de un edificio que usa Portia y quiere ejercer sus derechos
sobre sus datos, su primer punto de contacto es **la administración del edificio** (el
responsable). Portia colabora con el responsable para atender esas solicitudes.

## 2. Qué datos tratamos

| Categoría | Datos | De quién |
|---|---|---|
| Identificación de visitantes | Nombre, RUT | Visitantes registrados en portería |
| Destino de la visita | Departamento / oficina, motivo | Visitantes y residentes |
| Encomiendas | Nombre del destinatario, departamento, remitente | Residentes |
| Imágenes | Fotos asociadas a novedades y encomiendas | Puede incluir personas, objetos, patentes |
| Registros de actividad | Fecha y hora de entrada/salida, novedades del turno | Visitantes, residentes, conserjes |
| Cuentas de usuario | Nombre, correo electrónico | Conserjes y administradores |

Portia **no** recolecta deliberadamente datos sensibles (salud, origen étnico, afiliación
política, etc.). El responsable (edificio) debe evitar registrar ese tipo de información en los
campos de texto libre.

## 3. Para qué usamos los datos (finalidad)

- **Control de acceso del edificio:** registrar quién entra, a qué hora y a qué departamento.
- **Trazabilidad de encomiendas:** saber qué paquetes llegaron y a quién se entregaron.
- **Bitácora operativa (novedades):** dejar constancia de incidentes y avisos entre turnos.
- **Operación de las cuentas** de conserjes y administradores.

No se usan los datos para publicidad, ni se venden ni se ceden a terceros con fines comerciales.

## 4. Base de licitud del tratamiento

El tratamiento se funda en **[a definir con el abogado — típicamente: ejecución del contrato de
prestación de servicios de portería + interés legítimo del edificio en la seguridad de sus
residentes, y/o consentimiento del titular]**. En el caso de las visitas, Portia exige un
**consentimiento explícito** registrado antes de guardar el dato (casilla de consentimiento
obligatoria).

## 5. Cuánto tiempo guardamos los datos (retención)

| Dato | Plazo de retención | Mecanismo |
|---|---|---|
| Visitas (nombre, RUT, destino) | 30 días | Borrado automático diario (`cleanup_old_visitas`) |
| Encomiendas | **[propuesta: 90 días desde la entrega — A CONFIRMAR]** | Pendiente de implementar |
| Novedades | **[propuesta: 90 días — A CONFIRMAR]** | Pendiente de implementar |
| Fotos | Mientras exista el registro que las referencia; huérfanas se borran a los 7 días | Bucket privado + limpieza automática |
| Cuentas de usuario | Mientras la cuenta esté activa | Baja lógica al desactivar |

Ver el detalle técnico en [`../data/data-retention.md`](../data/data-retention.md).

## 6. Dónde se almacenan los datos (transferencia internacional)

Los datos se almacenan en la infraestructura de **Supabase**, en la región de **São Paulo,
Brasil**. Esto constituye una **transferencia internacional de datos** fuera de Chile.

> **Nota para revisión legal:** la Ley 21.719 regula las transferencias internacionales. El
> abogado debe confirmar qué garantías o cláusulas se requieren, y si esta política debe declarar
> explícitamente el país de almacenamiento y la base que habilita la transferencia. Considerar
> evaluar una región de almacenamiento dentro de Chile si la ley lo exige.

## 7. Derechos de los titulares (Ley 21.719)

Toda persona cuyos datos estén en Portia tiene derecho a:

- **Acceso:** saber qué datos suyos se almacenan.
- **Rectificación:** corregir un dato erróneo o desactualizado.
- **Supresión (cancelación):** pedir que se eliminen sus datos cuando ya no sean necesarios.
- **Oposición:** oponerse a un tratamiento determinado.
- **Bloqueo:** suspender temporalmente el tratamiento mientras se resuelve una solicitud.
- **Portabilidad:** **[confirmar alcance con el abogado]**.

**Cómo ejercerlos:** la solicitud se dirige a la administración del edificio (responsable), que
la canaliza a Portia. Contacto de Portia para soporte de estas solicitudes:
**[correo de privacidad — ej. privacidad@portia.cl — COMPLETAR]**. El procedimiento operativo
interno está en [`../data/data-retention.md`](../data/data-retention.md) sección 4.

Plazo de respuesta: **[el que fije la ley / el abogado]**.

## 8. Seguridad

Portia aplica, entre otras medidas:
- Aislamiento de datos por edificio mediante Row Level Security en la base de datos.
- Almacenamiento de fotos en un bucket privado, accesible solo con URLs firmadas temporales.
- Cifrado en tránsito (HTTPS/TLS) y en reposo (provisto por la infraestructura).
- Control de acceso por roles (conserje / administrador) validado en el servidor.

Detalle en [`../../SECURITY.md`](../../SECURITY.md) y [`../security/threat-model.md`](../security/threat-model.md).

## 9. Cambios a esta política

Esta política puede actualizarse. La versión vigente y su fecha estarán siempre disponibles en
**[URL — COMPLETAR]**.

## 10. Contacto

Para consultas sobre privacidad: **[correo — COMPLETAR]**.
Responsable de cumplimiento de datos en Portia: **[nombre — pendiente, ver decisión D4 en
docs/founders.md]**.
