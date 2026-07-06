import './globals.css';

export const metadata = {
  title: 'Portia — Monitor interno',
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
