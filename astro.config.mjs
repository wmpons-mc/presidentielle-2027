import { defineConfig } from 'astro/config';
const mode = process.env.SITE_MODE ?? 'production';
if (!['production', 'demo-base', 'demo-extended'].includes(mode)) throw new Error('invalid_site_mode');
export default defineConfig({
  output: 'static',
  outDir: mode === 'production' ? './dist' : './dist-demo',
  trailingSlash: 'always',
  devToolbar: { enabled: false },
  build: { inlineStylesheets: 'never' },
});
