import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    // Chemin de base de l'app. A mettre a '/test/' pour un deploiement
    // dans le sous-dossier /test du FTP, ou a '/' pour la racine.
    base: env.VITE_BASE_PATH || '/',
    plugins: [react()],
    server: {
      port: 3000,
      open: true,
    },
  }
})
