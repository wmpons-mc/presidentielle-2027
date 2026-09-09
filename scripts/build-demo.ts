import { spawnSync } from 'node:child_process';
const mode = process.argv[2] ?? 'demo-extended';
if (!['demo-base','demo-extended'].includes(mode)) throw new Error('Expected demo-base or demo-extended');
await import('./prepare-site-fixtures.ts');
const result = spawnSync(process.execPath,['node_modules/astro/bin/astro.mjs','build'],{stdio:'inherit',env:{...process.env,SITE_MODE:mode,ASTRO_TELEMETRY_DISABLED:'1'}});
if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
