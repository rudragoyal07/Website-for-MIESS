import { cp, mkdir, rm, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
const root=fileURLToPath(new URL('..',import.meta.url));
const dist=resolve(root,'dist');
await rm(dist,{recursive:true,force:true});await mkdir(dist,{recursive:true});
for(const file of ['index.html','styles.css','src','assets','favicon.ico','robots.txt'])await cp(resolve(root,file),resolve(dist,file),{recursive:true});
// A double-click preview for people who do not have Node installed.
// Production still uses the normal, editable files copied to dist/.
let preview=await readFile(resolve(root,'index.html'),'utf8');
const css=await readFile(resolve(root,'styles.css'),'utf8');
const rig=(await readFile(resolve(root,'src/assembly.js'),'utf8')).replace(/^export /gm,'');
const app=(await readFile(resolve(root,'src/main.js'),'utf8')).replace(/^import .*\n/,'');
preview=preview.replace('<link rel="stylesheet" href="./styles.css">',`<style>${css}</style>`).replace('<script type="module" src="./src/main.js"></script>','').replace('</body>',`<script>(()=>{\n${rig}\n${app}\n})();</script></body>`);
await writeFile(resolve(root,'OPEN-PREVIEW.html'),preview);
console.log('Built dist/. Copy its contents to the MIESS web root. No server-side runtime is required.');
