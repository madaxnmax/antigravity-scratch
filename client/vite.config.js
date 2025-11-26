import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        proxy: {
            '/nylas': 'http://localhost:3000',
            '/opticutter': 'http://localhost:3000',
            '/supabase': 'http://localhost:3000'
        }
    }
})
