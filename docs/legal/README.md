# Documentos legales — Portia

> ⚠️ **BORRADORES. NO son asesoría legal ni documentos vigentes.**
>
> Los archivos de esta carpeta los redactó Claude (IA) como punto de partida, basándose en una
> lectura del producto y de la Ley 21.719 de Chile. **Tienen que ser revisados y aprobados por
> un abogado real antes de publicarse, enlazarse en la landing, o presentarse a un cliente.**
> No publicar tal cual. No tratar como vinculantes.

## Qué hay acá

| Archivo | Qué es | Estado |
|---|---|---|
| [`POLITICA-DE-PRIVACIDAD.md`](POLITICA-DE-PRIVACIDAD.md) | Borrador de política de privacidad alineada a Ley 21.719 | Borrador IA, sin revisar |
| [`TERMINOS-DE-SERVICIO.md`](TERMINOS-DE-SERVICIO.md) | Borrador de términos del SaaS B2B (contrato con la administradora) | Borrador IA, sin revisar |
| [`DPA-acuerdo-tratamiento-datos.md`](DPA-acuerdo-tratamiento-datos.md) | Borrador del anexo de tratamiento de datos (Portia = encargado, edificio = responsable) | Borrador IA, sin revisar |

## Contexto legal clave (para el abogado y para los fundadores)

1. **Relación de roles bajo Ley 21.719.** El edificio / administradora es el **responsable** del
   tratamiento (decide qué datos se recogen y para qué). Portia es el **encargado** (procesa los
   datos por cuenta del responsable). Esta distinción cambia quién responde ante el titular de
   los datos y obliga a tener un acuerdo de tratamiento (DPA) entre ambos. Ver el borrador de DPA.

2. **Transferencia internacional de datos.** Los datos viven en Supabase, región **São Paulo,
   Brasil** — fuera de Chile. La Ley 21.719 regula la transferencia internacional de datos
   personales. Esto hay que declararlo en la política de privacidad y puede requerir garantías
   adicionales. **Es un punto que el abogado debe revisar específicamente** — no es un detalle
   menor para un producto que maneja RUT y fotos de personas.

3. **Datos que maneja Portia hoy** (confirmado leyendo el schema y el código):
   - RUT de visitantes (`visitas.rut_visitante`)
   - Nombres de visitantes y destinatarios de encomiendas
   - Departamento / destino
   - Fotos de novedades y encomiendas (pueden contener personas, patentes, etc.)
   - Horarios de entrada/salida
   - Datos de los conserjes y administradores (email, nombre)

4. **Decisión de fundadores pendiente (D4 en `docs/founders.md`):** falta asignar un **owner de
   cumplimiento Ley 21.719**. Estos borradores no reemplazan esa decisión.

## Por qué importa antes del primer edificio real (T-030)

`docs/founders.md` ya marca esto como riesgo crítico: *"Ley 21.719: manejamos nombre + RUT de
visitantes sin marco legal — Alto (legal) — Sin owner"*. En el momento en que el primer edificio
real cargue datos de una persona de verdad, Portia pasa a tratar datos personales sin un marco
legal publicado. Estos borradores son el primer paso para cerrar eso, pero **el paso que cierra
el riesgo es la revisión del abogado + la firma del DPA con el edificio**, no estos archivos.
