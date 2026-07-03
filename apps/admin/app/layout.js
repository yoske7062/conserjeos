import './globals.css';

export const metadata = {
  title: 'Portia — Tu edificio. Todo en orden.',
  description: 'Portia reemplaza el cuaderno de novedades, el registro de visitas y la planilla de encomiendas de tu conserjería por un sistema en tiempo real.',
  icons: { icon: '/logo.png' },
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
