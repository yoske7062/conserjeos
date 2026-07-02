// Clasificación de encomiendas según lo que realmente llega a una conserjería en Chile.
// `urgente: true` = no puede esperar en bodega (perecible o que el cliente espera al tiro).
export const TIPOS_ENCOMIENDA = [
  { id: 'paquete',      label: 'Paquete',      ejemplo: 'Falabella, Amazon, Mercado Libre, Correos de Chile', icono: 'inventory_2',  urgente: false },
  { id: 'comida',       label: 'Comida',       ejemplo: 'Rappi, Uber Eats, PedidosYa, DiDi Food',              icono: 'lunch_dining', urgente: true },
  { id: 'supermercado', label: 'Supermercado', ejemplo: 'Jumbo, Líder, Unimarc, Rappi Turbo',                  icono: 'shopping_cart', urgente: true },
  { id: 'otro',         label: 'Otro',         ejemplo: '',                                                     icono: 'category',     urgente: false },
];

export function tipoInfo(id) {
  return TIPOS_ENCOMIENDA.find(t => t.id === id) ?? TIPOS_ENCOMIENDA[TIPOS_ENCOMIENDA.length - 1];
}
