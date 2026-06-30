/** @type {import('next').NextConfig} */

// Headers de seguridad defensivos. Solo los universalmente seguros — NO se
// agrega Content-Security-Policy todavía porque requiere probar cada origen
// (Supabase, Vercel, Google Fonts) para no romper la app; queda como mejora
// futura documentada en docs/security/security-review-30jun2026.md.
const securityHeaders = [
  // Anti-clickjacking: el panel no puede embeberse en un iframe ajeno.
  { key: 'X-Frame-Options', value: 'DENY' },
  // No dejar que el navegador adivine el tipo MIME (anti MIME-sniffing).
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // No filtrar la URL completa como referer a otros sitios.
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Forzar HTTPS en visitas futuras (incluye subdominios).
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  // Desactivar APIs sensibles del navegador que el panel no usa.
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
];

const nextConfig = {
  transpilePackages: ['framer-motion'],
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};

export default nextConfig;
