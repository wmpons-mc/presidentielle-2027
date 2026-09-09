import { spawnSync } from 'node:child_process';
// Keep project commands local and avoid optional telemetry/config writes.
const result = spawnSync(process.execPath,['node_modules/astro/bin/astro.mjs',...process.argv.slice(2)],{
  stdio:'inherit',env:{...process.env,ASTRO_TELEMETRY_DISABLED:'1'},
});
if(result.error) throw result.error;
process.exitCode=result.status ?? 1;
