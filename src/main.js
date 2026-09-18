import { initAssembly } from './assembly.js';

// Navigation is a disclosure, not a modal: ordinary keyboard tab order is retained.
const menu=document.querySelector('#site-menu'),toggle=document.querySelector('#menu-toggle');
menu.hidden=true;
const closeMenu=(focus=false)=>{menu.hidden=true;toggle.setAttribute('aria-expanded','false');if(focus)toggle.focus()};
toggle.addEventListener('click',()=>{const opening=menu.hidden;menu.hidden=!opening;toggle.setAttribute('aria-expanded',String(opening));if(opening)menu.querySelector('a').focus()});
document.addEventListener('click',e=>{if(!menu.hidden&&!menu.contains(e.target)&&!toggle.contains(e.target))closeMenu()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!menu.hidden)closeMenu(true)});
menu.addEventListener('focusout',()=>setTimeout(()=>{if(!menu.contains(document.activeElement)&&document.activeElement!==toggle)closeMenu()},0));
menu.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>{
  closeMenu();
  const section=document.querySelector(link.getAttribute('href'));
  if(section){section.setAttribute('tabindex','-1');section.focus({preventScroll:true});section.addEventListener('blur',()=>section.removeAttribute('tabindex'),{once:true})}
}));
const sections=[...document.querySelectorAll('main>section[id]')];
const activeObserver=new IntersectionObserver(entries=>{
  for(const e of entries)if(e.isIntersecting)menu.querySelectorAll('a').forEach(a=>{if(a.getAttribute('href')==='#'+e.target.id)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current')});
},{rootMargin:'-15% 0px -60% 0px'});sections.forEach(s=>activeObserver.observe(s));

// Opposite rotations at a 2:1 speed ratio for 20-tooth / 10-tooth gear pairs.
function gearPath(radius,teeth){let d='';for(let i=0;i<teeth*4;i++){const angle=i*2*Math.PI/(teeth*4),r=radius*([0,3].includes(i%4)?.86:1);d+=(i?'L':'M')+(Math.cos(angle)*r).toFixed(2)+' '+(Math.sin(angle)*r).toFixed(2)}return d+'Z'}
function gear(radius,teeth,small=false){return `<g class="gear-spin${small?' gear-counter':''}"><path d="${gearPath(radius,teeth)}" fill="currentColor" fill-opacity=".1" stroke="currentColor" stroke-width="1"/><circle r="${radius*.6}" fill="none" stroke="currentColor"/><circle r="${radius*.22}" fill="currentColor" fill-opacity=".12" stroke="currentColor"/>${[0,90,180,270].map(a=>`<path d="M${radius*.24} 0H${radius*.59}" transform="rotate(${a})" stroke="currentColor"/>`).join('')}</g>`}
const gearSystem=`<svg class="gear-system" viewBox="0 0 208 190" xmlns="http://www.w3.org/2000/svg"><g transform="translate(75 74)">${gear(72,20)}</g><g transform="translate(156 133)">${gear(36,10,true)}</g></svg>`;
document.querySelector('#gear-layer').innerHTML=gearSystem.repeat(4);
const pauseMotion=()=>document.body.classList.toggle('motion-paused',document.hidden);
document.addEventListener('visibilitychange',pauseMotion);pauseMotion();

// Keep every event in the HTML for no-JavaScript access.
const extraEvents=[...document.querySelectorAll('.event-card')].slice(3),more=document.querySelector('#more-events');
if(extraEvents.length){extraEvents.forEach(e=>e.hidden=true);more.hidden=false;more.addEventListener('click',()=>{const expanded=more.getAttribute('aria-expanded')==='true';extraEvents.forEach(e=>e.hidden=expanded);more.setAttribute('aria-expanded',String(!expanded));more.innerHTML=expanded?'View all 9 events <span aria-hidden="true">↓</span>':'Show fewer events <span aria-hidden="true">↑</span>';if(expanded)document.querySelector('#events').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'})})}

// Gallery uses a native dialog, which handles focus containment and Escape.
const gallery=[...document.querySelectorAll('.gallery-item')],dialog=document.querySelector('#lightbox'),photo=document.querySelector('#lightbox-image'),caption=document.querySelector('#lightbox-caption');
let photoIndex=0,previousOverflow='';
const showPhoto=i=>{photoIndex=(i+gallery.length)%gallery.length;photo.src=gallery[photoIndex].href;photo.alt=gallery[photoIndex].querySelector('img').alt;caption.textContent=`${photoIndex+1} / ${gallery.length} — ${photo.alt}`};
gallery.forEach((link,i)=>link.addEventListener('click',e=>{if(typeof dialog.showModal!=='function')return;e.preventDefault();showPhoto(i);previousOverflow=document.body.style.overflow;document.body.style.overflow='hidden';dialog.showModal()}));
document.querySelector('#lightbox-close').addEventListener('click',()=>dialog.close());
document.querySelector('#lightbox-prev').addEventListener('click',()=>showPhoto(photoIndex-1));
document.querySelector('#lightbox-next').addEventListener('click',()=>showPhoto(photoIndex+1));
dialog.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'){e.preventDefault();showPhoto(photoIndex-1)}if(e.key==='ArrowRight'){e.preventDefault();showPhoto(photoIndex+1)}});
dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close()}});
dialog.addEventListener('close',()=>{document.body.style.overflow=previousOverflow;gallery[photoIndex].focus({preventScroll:true})});

// Original EmailJS IDs were placeholders. This action honestly prepares a draft.
document.querySelector('#contact-form').addEventListener('submit',e=>{e.preventDefault();const form=e.currentTarget;if(!form.reportValidity())return;const data=new FormData(form);const name=String(data.get('name')).trim(),email=String(data.get('email')).trim(),message=String(data.get('body')).trim();if(!name||!message){document.querySelector('#contact-status').textContent='Please enter your name and a message.';return}const body=`Name: ${name}\nEmail: ${email}\n\n${message}`;window.location.href=`mailto:miess@iitr.ac.in?subject=${encodeURIComponent('MIESS enquiry from '+name)}&body=${encodeURIComponent(body)}`;document.querySelector('#contact-status').textContent='If your email app opened, review and send your draft there. Otherwise, email miess@iitr.ac.in directly. Your message has not been sent by this website.'});

// Failure in decorative animation must not hide the heading or break navigation.
try { initAssembly(); } catch(error) { const hero=document.querySelector('#home');hero.classList.remove('animation-ready');document.querySelector('#assembly').innerHTML='';console.error('MIESS assembly could not initialise:',error); }
