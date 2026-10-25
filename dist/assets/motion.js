/* ASH IT — site-wide motion layer: smooth scroll, masked headline reveals,
   scroll-linked section transitions, parallax, magnetic buttons. Off for reduced motion. */
(()=>{
const d=document,root=d.documentElement;
if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
root.classList.add('motion');
const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v)),ease=t=>1-Math.pow(1-t,3);

// Split headlines into masked words so they can rise line by line.
function split(el){
  let i=0;
  const walk=node=>[...node.childNodes].forEach(n=>{
    if(n.nodeType===3){
      const frag=d.createDocumentFragment();
      n.textContent.split(/(\s+)/).forEach(part=>{
        if(!part)return;
        if(/^\s+$/.test(part)){frag.appendChild(d.createTextNode(' '));return}
        const w=d.createElement('span'),inner=d.createElement('span');
        w.className='w';inner.className='wi';inner.style.setProperty('--i',i++);inner.textContent=part;w.appendChild(inner);frag.appendChild(w);
      });
      n.replaceWith(frag);
    }else if(n.nodeType===1&&n.tagName!=='BR')walk(n);
  });
  walk(el);el.classList.add('split');
}
d.querySelectorAll('.seq h1,.seq h2').forEach(split);
const heads=d.querySelectorAll('.section h2,.final-cta h2,.page-hero h1,.cap-row h3');
heads.forEach(h=>{split(h);h.removeAttribute('data-reveal');h.setAttribute('data-split','')});
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{rootMargin:'0px 0px -4% 0px'});
heads.forEach(h=>io.observe(h));

// Smooth, weighted scrolling (desktop wheel; touch keeps native momentum).
let lenis=null;
if(window.Lenis){lenis=new Lenis({lerp:.15,wheelMultiplier:1.1,smoothWheel:true});
  d.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{const t=d.querySelector(a.getAttribute('href'));if(t){e.preventDefault();lenis.scrollTo(t,{offset:-90})}}));}

// Scroll-linked pieces, updated in one rAF loop.
const clips=[...d.querySelectorAll('[data-clip]')],para=[...d.querySelectorAll('[data-parallax]')];
const header=d.querySelector('.header'),marquee=d.querySelector('.marquee div');
let lastY=scrollY,vh=innerHeight;
addEventListener('resize',()=>{vh=innerHeight},{passive:true});
function update(){
  const y=scrollY,dy=y-lastY;lastY=y;
  if(header){if(dy>4&&y>240)header.classList.add('tuck');else if(dy<-4||y<120)header.classList.remove('tuck')}
  clips.forEach(el=>{const r=el.getBoundingClientRect();if(r.top>vh||r.bottom<0)return;
    const e=ease(clamp((vh-r.top)/(vh*.45))),ins=(1-e)*Math.min(innerWidth*.045,56),rad=(1-e)*34;
    el.style.clipPath=`inset(${ins*.5}px ${ins}px 0 ${ins}px round ${rad}px)`});
  para.forEach(el=>{const r=el.getBoundingClientRect();if(r.top>vh*1.2||r.bottom<-vh*.2)return;
    const off=(r.top+r.height/2-vh/2)*parseFloat(el.dataset.parallax);el.style.transform=`translate3d(0,${off.toFixed(1)}px,0)`});
  if(marquee&&lenis){const a=marquee.getAnimations?.()[0];if(a)a.playbackRate=1+Math.min(Math.abs(lenis.velocity)/6,5)}
}
function raf(t){lenis?.raf(t);update();requestAnimationFrame(raf)}
requestAnimationFrame(raf);

// Magnetic buttons.
if(matchMedia('(pointer:fine)').matches)d.querySelectorAll('.button,.nav-cta').forEach(b=>{
  b.addEventListener('pointermove',e=>{const r=b.getBoundingClientRect();b.style.transform=`translate(${(e.clientX-r.left-r.width/2)*.22}px,${(e.clientY-r.top-r.height/2)*.3}px)`});
  b.addEventListener('pointerleave',()=>{b.style.transform=''});
});
})();
