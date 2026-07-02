// Reglas de permisos por rol. La RLS es la barrera real en el servidor;
// esto evita que la UI intente operaciones que van a ser rechazadas
// (ej. encolar offline una tarea que el server nunca va a aceptar).

export function puedeCrearTareas(perfil) {
  return perfil?.rol === 'admin';
}
