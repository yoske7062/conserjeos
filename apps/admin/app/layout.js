import './globals.css';

export const metadata = {
  title: 'Portia Admin',
  description: 'Panel de administración — Portia',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
