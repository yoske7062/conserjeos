import './globals.css';

export const metadata = {
  title: 'Portia — Tu edificio. Todo en orden.',
  description: 'Portia reemplaza el cuaderno de novedades, el registro de visitas y la planilla de encomiendas de tu conserjería por un sistema en tiempo real.',
  icons: { icon: '/logo.png' },
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block"
          rel="stylesheet"
          precedence="default"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
