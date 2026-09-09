import { createServer } from 'node:http';
import { readFileSync, statSync } from 'node:fs';
import { resolve, extname, sep } from 'node:path';
const root=resolve('dist-demo');
createServer((request,response)=>{
  try {
    const pathname=decodeURIComponent(new URL(request.url ?? '/', 'http://localhost').pathname);
    let path=resolve(root,'.'+pathname);
    if (!path.startsWith(root+sep) && path !== root) {response.writeHead(403).end();return;}
    if (statSync(path).isDirectory()) path=resolve(path,'index.html');
    const types:Record<string,string>={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8'};
    response.writeHead(200,{'Content-Type':types[extname(path)] ?? 'application/octet-stream'}).end(readFileSync(path));
  } catch {response.writeHead(404,{'Content-Type':'text/html; charset=utf-8'}).end(readFileSync(resolve(root,'404.html')));}
}).listen(4173,'127.0.0.1');
