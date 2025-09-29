import { defineConfig } from 'vite';
import angular from '@analogjs/vite-plugin-angular';

export default defineConfig({
  plugins: [angular()],
  server: {
    // allowedHosts: [
    //   'kora-production-d70b.up.railway.app', // 👈 ton domaine Railway
    // ],
      allowedHosts: ['*']

  },
});
