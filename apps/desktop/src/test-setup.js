import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Sin esto, cada render() de un test se queda montado en el DOM del
// siguiente test dentro del mismo archivo — los queries que matchean
// elementos del layout base (no del modal) empiezan a encontrar duplicados.
afterEach(cleanup);
