import assert from 'node:assert/strict';
import { readFile, access, mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { computeScene, DURATION, renderScene } from '../src/assembly.js';
const root=fileURLToPath(new URL('..',import.meta.url));
const distance=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
let sampledPoses=0;
for(const mobile of [false,true]){
  for(let t=0;t<=DURATION+.02;t+=.02){
    const scene=computeScene(t,mobile);assert.equal(scene.arms.length,5);
    assert.equal(scene.arms.map(a=>a.char).join(''),'MIESS');
    for(const a of scene.arms){
      for(const p of [a.wrist,a.elbow,a.position])assert(p.every(Number.isFinite),'Coordinates must be finite');
      const reach=distance(a.base,a.wrist);assert(reach<=a.lengths[0]+a.lengths[1]+1e-8,'Wrist is reachable');
      assert(Math.abs(distance(a.base,a.elbow)-a.lengths[0])<1e-6,'Upper arm must remain rigid');
      assert(Math.abs(distance(a.elbow,a.wrist)-a.lengths[1])<1e-6,'Forearm must remain rigid');
      if(t>=a.releaseAt)assert(distance(a.position,a.final)<1e-9,'Released letter must not move');
      if(t<a.releaseAt){assert(Math.abs(distance(a.grip,a.wrist)-31*a.scale)<1e-6,'Carried letter must remain attached to wrist');}
      sampledPoses++;
    }
  }
  const first=computeScene(0,mobile),last=computeScene(DURATION,mobile);
  assert(first.arms[0].position[0]<0,'M enters from left');assert(first.arms[1].position[1]<0,'I enters from top');assert(first.arms[2].position[1]>first.h,'E enters from bottom');assert(first.arms[3].position[1]<0,'S enters from top');assert(first.arms[4].position[0]>first.w,'Last S enters from right');
  for(const a of last.arms){assert.equal(a.alpha,0);assert(a.final[0]>=0&&a.final[0]+a.width*a.scale<=last.w,'Final letters fit');}
}
const html=await readFile(resolve(root,'index.html'),'utf8');
for(const id of ['home','about','events','team','gallery','contact','assembly','site-menu','contact-form','lightbox'])assert(html.includes(`id="${id}"`),`Missing ${id}`);
assert.equal((html.match(/class="event-card"/g)||[]).length,9);
assert.equal((html.match(/class="faculty-card"/g)||[]).length,2);
assert.equal((html.match(/class="team-card"/g)||[]).length,7);
assert.equal((html.match(/class="gallery-item/g)||[]).length,7);
for(const [,path] of html.matchAll(/(?:src|href)="(\.\/[^"#]+)"/g))await access(resolve(root,path));
for(const [,id] of html.matchAll(/href="#([^"#]+)"/g))assert(html.includes(`id="${id}"`),`Broken anchor ${id}`);
await mkdir(resolve(root,'verification'),{recursive:true});
for(const mobile of [false,true])for(const t of [1.3,2.9,3.5,DURATION])await writeFile(resolve(root,`verification/${mobile?'mobile':'desktop'}-${t}.svg`),renderScene(t,mobile));
console.log(`PASS: ${sampledPoses} arm poses; rigid links, reachable targets, grip attachment, release, five directions, final word bounds, all sections, 9 events, 9 people, 7 photos, local assets and anchors.`);
