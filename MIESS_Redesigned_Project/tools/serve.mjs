import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
const project=fileURLToPath(new URL('..',import.meta.url));
const root=resolve(project,process.argv.includes('--dist')?'dist':'.');
const portIndex=process.argv.indexOf('--port');const port=portIndex<0?5173:Number(process.argv[portIndex+1]);
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json','.webp':'image/webp','.png':'image/png','.ico':'image/x-icon','.svg':'image/svg+xml','.txt':'text/plain; charset=utf-8'};
http.createServer(async(req,res)=>{
  try{let path=decodeURIComponent(new URL(req.url,'http://localhost').pathname);let file=resolve(root,'.'+path);if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);return res.end('Forbidden')};if((await stat(file)).isDirectory())file=resolve(file,'index.html');const bytes=await readFile(file);res.writeHead(200,{'Content-Type':types[extname(file)]||'application/octet-stream','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(bytes)}catch{res.writeHead(404,{'Content-Type':'text/plain'});res.end('Not found')}
}).listen(port,'127.0.0.1',()=>console.log(`MIESS preview: http://localhost:${port} (${root})`));
