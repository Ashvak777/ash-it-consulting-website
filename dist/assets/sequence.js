/* ASH IT — "Operational intelligence" scroll-scrubbed hero sequence.
   Every frame is a pure function of scroll progress (plus a slow ambient drift),
   drawn on one canvas: no video or frame images to download. */
(()=>{
const sec=document.querySelector('[data-sequence]');if(!sec)return;
const canvas=sec.querySelector('canvas'),ctx=canvas.getContext('2d');
const steps=[...sec.querySelectorAll('[data-step]')],dots=[...sec.querySelectorAll('[data-dot]')],bar=sec.querySelector('.seq-progress i');
const reduce=matchMedia('(prefers-reduced-motion: reduce)');
const TAU=Math.PI*2,clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v)),mix=(a,b,t)=>a+(b-a)*t;
const ss=(e0,e1,x)=>{const t=clamp((x-e0)/(e1-e0));return t*t*(3-2*t)};
const rng=(s=>()=>{s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296})(2020);

const TYPES={d365:['DYNAMICS 365','D','#8fb9ff'],sap:['SAP','S','#94fff0'],sp:['SHAREPOINT','Sp','#7fd6c6'],sql:['SQL SERVER','Q','#ff9fb2'],dv:['DATAVERSE','Dv','#d2b9ff'],m365:['MICROSOFT 365','M','#ffcf8f']};
const LANES=[['AUTOMATED','AUTO','#7ef0c4'],['APPROVED IN TEAMS','TEAMS','#6aa8ff'],['HUMAN REVIEW','REVIEW','#ffc46b']];
// [source, data object, outcome lane, what handled it]
const ITEMS=[['d365','Sales orders',0,'Foundry agent'],['sap','Invoices',1,'Power Automate'],['sp','Contracts',2,'Foundry agent'],['sql','Inventory',0,'Fabric data agent'],['dv','Service cases',0,'Copilot Studio'],['m365','Email requests',1,'MCP server'],['d365','Customer records',0,'Fabric data agent'],['sap','Purchase orders',1,'Power Automate'],['sp','Policies',0,'Foundry agent'],['sql','Finance data',2,'Fabric data agent'],['dv','Approvals',1,'Power Automate'],['m365','Teams requests',0,'MCP server'],['d365','Opportunities',0,'Copilot Studio'],['sap','Vendor master',2,'MCP server'],['sp','Documents',0,'Foundry agent'],['sql','Telemetry',0,'Fabric data agent'],['dv','Field reports',1,'Power Automate'],['m365','Forms',2,'Copilot Studio']];
const N=ITEMS.length,ROWS=7;
const cards=ITEMS.map(([type,label,lane,owner],i)=>({i,type,label,lane,owner,fx:rng(),fy:rng(),rot:(rng()-.5)*.5,depth:.55+rng()*.45,ph:rng()*TAU,sp:.6+rng()*.8}));
const laneOrder=[[],[],[]];cards.forEach(c=>{c.k=laneOrder[c.lane].length;laneOrder[c.lane].push(c)});
// Rows of the governed queue: the first ROWS cards; the rest are absorbed into their lane's KPI.
const chart=Array.from({length:26},(_,i)=>.25+i/25*.55+Math.sin(i*1.7)*.06+(rng()-.5)*.08);

let W=0,H=0,dpr=1,R,cw,ch,D,progress=0,shown=-1,running=false,visible=false;
function layout(){
  const r=canvas.getBoundingClientRect();W=r.width;H=r.height;dpr=Math.min(devicePixelRatio||1,2);
  canvas.width=Math.round(W*dpr);canvas.height=Math.round(H*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);
  const wide=W>900,still=document.documentElement.classList.contains('reduced');
  R=still?{x:W*.03,y:H*.04,w:W*.94,h:H*.92}:wide?{x:W*.42,y:H*.1,w:W*.48,h:H*.8}:{x:W*.04,y:H*.06,w:W*.92,h:H*.5};
  cw=clamp(Math.min(R.w*.32,R.h*.44),104,205);ch=cw*.31;
  const p=Math.max(10,R.w*.03);D={x:R.x,y:R.y,w:R.w,h:R.h,p,hh:Math.max(30,R.h*.09)};
  const inner={x:D.x+p,y:D.y+D.hh+p*.4,w:D.w-p*2,h:D.h-D.hh-p*1.4};
  const landscape=R.w>R.h*1.05;
  D.kpi=[];D.rows=[];
  if(landscape){
    const kw=inner.w*.4,kh=(inner.h*.56-p)/3;
    for(let l=0;l<3;l++)D.kpi.push({x:inner.x,y:inner.y+l*(kh+p/2),w:kw,h:kh});
    D.chart={x:inner.x,y:inner.y+3*(kh+p/2)+p*.3,w:kw,h:inner.y+inner.h-(inner.y+3*(kh+p/2)+p*.3)};
    D.queue={x:inner.x+kw+p,y:inner.y,w:inner.w-kw-p,h:inner.h};
  }else{
    const kw=(inner.w-p)/3,kh=inner.h*.24;
    for(let l=0;l<3;l++)D.kpi.push({x:inner.x+l*(kw+p/2),y:inner.y,w:kw-p/4,h:kh});
    D.chart=null;D.queue={x:inner.x,y:inner.y+kh+p*.6,w:inner.w,h:inner.h-kh-p*.6};
  }
  const rh=Math.min(D.queue.h/(ROWS+1.2),ch*.95);
  for(let k=0;k<ROWS;k++)D.rows.push({x:D.queue.x,y:D.queue.y+rh*1.1+k*rh,w:D.queue.w,h:rh*.84});
  D.rh=rh;
}

function rr(x,y,w,h,r){r=Math.min(r,w/2,h/2);ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath()}
function hexA(hex,a){const n=parseInt(hex.slice(1),16);return`rgba(${n>>16},${n>>8&255},${n&255},${a})`}
function fit(text,max){if(ctx.measureText(text).width<=max)return text;let t=text;while(t.length>1&&ctx.measureText(t+'…').width>max)t=t.slice(0,-1);return t+'…'}
const mono=s=>`500 ${s}px "DM Mono",ui-monospace,monospace`,sans=(w,s)=>`${w} ${s}px Manrope,system-ui,sans-serif`;

function cardState(c,p,t){
  const o=c.i/N*.06,a=ss(.08+o,.26+o,p),b=ss(.3+o*.5,.46+o*.5,p),k=ss(.64+o*.5,.84+o*.5,p);
  // 0: fragmented, drifting signals
  const dx=Math.sin(t*.00035*c.sp+c.ph)*W*.012,dy=Math.cos(t*.0003*c.sp+c.ph)*H*.014;
  const wide=W>900,sx=wide?W*(.3+c.fx*.68):W*(.02+c.fx*.8),sy=wide?H*(.08+c.fy*.82):H*(.04+c.fy*.6);
  let x=sx+dx,y=sy+dy,w=cw*c.depth,h=ch*c.depth,rot=c.rot,al=(.25+.6*c.depth)*(W>900?1:.4);
  // 1: drawn into orbit around the core and read
  const cx=R.x+R.w/2,cy=R.y+R.h/2,th=c.i/N*TAU+t*.00006-Math.PI/2;
  x=mix(x,cx+Math.cos(th)*R.w*.36,a);y=mix(y,cy+Math.sin(th)*R.h*.38,a);w=mix(w,cw*.95,a);h=mix(h,ch*.9,a);rot=mix(rot,0,a);al=mix(al,1,a);
  // 2: policy sorts each signal into a lane
  const step=Math.min(ch*1.15,R.h*.7/9);
  x=mix(x,R.x+R.w*(.18+c.lane*.32),b);y=mix(y,R.y+R.h*.24+c.k*step,b);
  // 3: the governed dashboard
  let tx,ty,tw,th2,ta=1;
  if(c.i<ROWS){const r=D.rows[c.i];tx=r.x+r.w/2;ty=r.y+r.h/2;tw=r.w;th2=r.h}
  else{const q=D.kpi[c.lane];tx=q.x+q.w*.78;ty=q.y+q.h/2;tw=cw*.2;th2=ch*.2;ta=0}
  x=mix(x,tx,k);y=mix(y,ty,k);w=mix(w,tw,k);h=mix(h,th2,k);al=mix(al,ta,k);
  const tag=ss(.16+c.i/N*.1,.2+c.i/N*.1,p);
  return{x,y,w,h,rot,al,tag,k};
}

function drawCard(c,s){
  if(s.al<.01)return;
  const L=LANES[c.lane],T=TYPES[c.type];
  ctx.save();ctx.globalAlpha=s.al;ctx.translate(s.x,s.y);ctx.rotate(s.rot);
  const x=-s.w/2,y=-s.h/2,w=s.w,h=s.h,row=s.k>.5;
  rr(x,y,w,h,Math.min(9,h*.24));
  ctx.fillStyle=row?'rgba(12,29,50,.92)':'rgba(16,35,59,.94)';ctx.fill();
  ctx.lineWidth=1;ctx.strokeStyle=s.tag>.01?hexA(L[2],.18+.4*s.tag*(1-s.k*.6)):'rgba(145,202,255,.2)';ctx.stroke();
  const ic=h*.56,ix=x+h*.22;
  rr(ix,-ic/2,ic,ic,ic*.24);ctx.fillStyle=hexA(T[2],.16);ctx.fill();
  ctx.fillStyle=T[2];ctx.font=sans(800,ic*(T[1].length>1?.38:.5));ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(T[1],ix+ic/2,1);
  ctx.textAlign='left';
  const ph0=Math.min(h*.5,18);ctx.font=mono(Math.max(7,ph0*.48));const tx=ix+ic+h*.22,pillW=s.tag>.01?ctx.measureText(L[1]).width+ph0*1.1:0,avail=x+w-tx-pillW-h*.3;
  if(h>26&&!row){
    ctx.fillStyle='#7f98b4';ctx.font=mono(Math.max(7,h*.18));ctx.fillText(T[0],tx,-h*.16);
    ctx.fillStyle='#e9f3ff';ctx.font=sans(700,Math.max(9,h*.24));ctx.fillText(fit(c.label,avail),tx,h*.17);
  }else{
    ctx.fillStyle='#e9f3ff';ctx.font=sans(700,Math.max(8,h*.3));const lw=Math.min(avail*.62,ctx.measureText(c.label).width);ctx.fillText(fit(c.label,avail*.62),tx,1);
    if(row&&avail>120){ctx.globalAlpha=s.al*s.k;ctx.fillStyle='#7f98b4';ctx.font=mono(Math.max(7,h*.24));ctx.fillText(c.owner.toUpperCase(),tx+Math.max(lw+14,avail*.62),1);ctx.globalAlpha=s.al}
  }
  if(s.tag>.01){
    ctx.globalAlpha=s.al*s.tag;const pw=pillW,ph=Math.min(h*.5,18),px=x+w-pw-h*.24;
    rr(px,-ph/2,pw,ph,ph/2);ctx.fillStyle=hexA(L[2],.14);ctx.fill();
    ctx.fillStyle=L[2];ctx.font=mono(Math.max(7,ph*.48));ctx.textAlign='center';ctx.fillText(L[1],px+pw/2,1);
  }
  ctx.restore();
}

const t0=performance.now();
function frame(p,t){
  ctx.clearRect(0,0,W,H);
  const intro=ss(0,1600,t-t0),zc=1+.09*(1-ss(0,.12,p))+.06*Math.sin(Math.PI*ss(.06,.4,p));
  ctx.save();ctx.translate(R.x+R.w/2,R.y+R.h/2);ctx.scale(zc,zc);ctx.translate(-(R.x+R.w/2),-(R.y+R.h/2));
  const a=ss(.08,.26,p),b=ss(.3,.48,p),k=ss(.64,.84,p),cx=R.x+R.w/2,cy=R.y+R.h/2,u=Math.min(R.w,R.h);
  // dot field
  ctx.fillStyle='rgba(122,190,255,.09)';const g=28;
  for(let x=(t*.004)%g;x<W;x+=g)for(let y=6;y<H;y+=g)ctx.fillRect(x,y,1.2,1.2);
  // core: reads, then governs
  const coreA=ss(.05,.16,p)*(1-ss(.36,.5,p));
  if(coreA>.01){
    ctx.save();ctx.globalAlpha=coreA;ctx.translate(cx,cy);
    const glow=ctx.createRadialGradient(0,0,0,0,0,u*.34);glow.addColorStop(0,'rgba(41,120,255,.34)');glow.addColorStop(1,'rgba(41,120,255,0)');ctx.fillStyle=glow;ctx.fillRect(-u*.4,-u*.4,u*.8,u*.8);
    [[.2,'#cd8a5a','BRONZE'],[.145,'#c9d3de','SILVER'],[.09,'#e8c36a','GOLD']].forEach(([r,col,lab],j)=>{ctx.beginPath();ctx.setLineDash(j===0?[1,8]:j===1?[4,7]:[]);ctx.lineDashOffset=-t*.01*(3-j);ctx.arc(0,0,u*r,0,TAU);ctx.strokeStyle=hexA(col,b<.5?.75:.25);ctx.lineWidth=1.2;ctx.stroke();if(b<.5){ctx.fillStyle=hexA(col,.9);ctx.font=mono(Math.max(7,u*.014));ctx.textAlign='center';ctx.fillText(lab,0,-u*r-7)}});
    ctx.setLineDash([]);
    if(a>0&&b<1){const ang=p*TAU*3.2-Math.PI/2,sw=ctx.createConicGradient?ctx.createConicGradient(ang-.7,0,0):null;
      if(sw){sw.addColorStop(0,'rgba(82,217,255,0)');sw.addColorStop(.11,'rgba(82,217,255,.22)');sw.addColorStop(.112,'rgba(82,217,255,0)');ctx.fillStyle=sw;ctx.beginPath();ctx.arc(0,0,u*.5,0,TAU);ctx.fill()}}
    ctx.fillStyle='#e9f3ff';ctx.font=sans(800,Math.max(13,u*.04));ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(b<.5?'FABRIC':'AI AGENTS',0,-u*.012);
    ctx.fillStyle='#8fb9ff';ctx.font=mono(Math.max(8,u*.017));ctx.fillText(b<.5?'ONELAKE':'AZURE AI FOUNDRY · MCP',0,u*.035);
    ctx.restore();
  }
  const states=cards.map(c=>cardState(c,p,t));
  // read beams from core to each signal
  const beamA=a*(1-b);
  if(beamA>.01){ctx.lineWidth=1;cards.forEach((c,i)=>{const s=states[i];ctx.strokeStyle=hexA(s.tag>.5?LANES[c.lane][2]:'#52d9ff',.22*beamA);ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(s.x,s.y);ctx.stroke()})}
  // policy lanes
  const laneA=b*(1-k);
  if(laneA>.01){ctx.save();ctx.globalAlpha=laneA;LANES.forEach((L,l)=>{const x=R.x+R.w*(.18+l*.32),cnt=laneOrder[l].length;
    ctx.fillStyle=L[2];ctx.font=mono(Math.max(8,u*.018));ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(L[0],x,R.y+R.h*.1);
    ctx.fillStyle='#7f98b4';ctx.fillText(`${cnt} ITEMS`,x,R.y+R.h*.1+Math.max(12,u*.03));
    ctx.strokeStyle=hexA(L[2],.35);ctx.beginPath();ctx.moveTo(x-cw*.45,R.y+R.h*.17);ctx.lineTo(x+cw*.45,R.y+R.h*.17);ctx.stroke()});ctx.restore()}
  // governed dashboard frame + contents (behind the rows)
  if(k>.01){
    ctx.save();ctx.globalAlpha=k;
    rr(D.x,D.y,D.w,D.h,16);ctx.fillStyle='rgba(13,31,53,.82)';ctx.fill();ctx.strokeStyle='rgba(145,202,255,.24)';ctx.stroke();
    ctx.textBaseline='middle';ctx.textAlign='left';ctx.fillStyle='#9fb5ce';ctx.font=mono(Math.max(8,u*.017));ctx.fillText('AI OPERATIONS · POWER BI',D.x+D.p,D.y+D.hh*.62);
    ctx.textAlign='right';ctx.fillStyle='#93fbd9';ctx.fillText('● LIVE',D.x+D.w-D.p,D.y+D.hh*.62);
    ctx.strokeStyle='rgba(145,202,255,.12)';ctx.beginPath();ctx.moveTo(D.x,D.y+D.hh);ctx.lineTo(D.x+D.w,D.y+D.hh);ctx.stroke();
    D.kpi.forEach((q,l)=>{const L=LANES[l];rr(q.x,q.y,q.w,q.h,10);ctx.fillStyle='rgba(7,19,34,.55)';ctx.fill();ctx.strokeStyle=hexA(L[2],.28);ctx.stroke();
      ctx.textAlign='left';ctx.fillStyle=L[2];ctx.font=mono(Math.max(7,Math.min(q.h*.15,u*.017)));ctx.fillText(L[0],q.x+q.h*.2,q.y+q.h*.28);
      ctx.fillStyle='#fff';ctx.font=sans(800,Math.max(14,Math.min(q.h*.36,q.w*.17)));ctx.fillText(Math.round(laneOrder[l].length*ss(.68,.9,p)),q.x+q.h*.2,q.y+q.h*.66)});
    const Q=D.queue;ctx.textAlign='left';ctx.fillStyle='#7f98b4';ctx.font=mono(Math.max(7,u*.015));ctx.fillText('HANDLED BY AGENTS',Q.x,Q.y+D.rh*.45);ctx.textAlign='right';ctx.fillText('OUTCOME',Q.x+Q.w-4,Q.y+D.rh*.45);
    if(D.chart){const C=D.chart,cp=ss(.76,.97,p);rr(C.x,C.y,C.w,C.h,10);ctx.fillStyle='rgba(7,19,34,.55)';ctx.fill();ctx.strokeStyle='rgba(145,202,255,.14)';ctx.stroke();
      ctx.textAlign='left';ctx.fillStyle='#7f98b4';ctx.font=mono(Math.max(7,u*.015));ctx.fillText('MANUAL EFFORT ↓',C.x+12,C.y+16);
      const px=C.x+12,pw=C.w-24,py=C.y+28,ph=C.h-40,last=Math.max(1,Math.floor(cp*(chart.length-1)));
      ctx.beginPath();for(let i=0;i<=last;i++){const X=px+i/(chart.length-1)*pw,Y=py+ph-(1-chart[i])*ph*.9;i?ctx.lineTo(X,Y):ctx.moveTo(X,Y)}
      ctx.strokeStyle='#52d9ff';ctx.lineWidth=1.6;ctx.stroke();ctx.lineTo(px+last/(chart.length-1)*pw,py+ph);ctx.lineTo(px,py+ph);ctx.closePath();ctx.fillStyle='rgba(82,217,255,.08)';ctx.fill()}
    ctx.restore();
  }
  // signals: back-to-front by depth so the fragmented field has parallax
  cards.map((c,i)=>[c,states[i]]).sort((x,y)=>x[0].depth*(1-x[1].k)-y[0].depth*(1-y[1].k)).forEach(([c,s])=>{s.al*=intro;drawCard(c,s)});
  ctx.restore();
}

function setSteps(p){
  const a=[.1,.37,.64].reduce((n,x)=>p>=x?n+1:n,0);
  if(a!==shown){shown=a;steps.forEach((el,i)=>el.classList.toggle('on',i===a));dots.forEach((d,i)=>d.classList.toggle('on',i<=a))}
  if(bar)bar.style.transform=`scaleY(${p})`;
}
function target(){const r=sec.getBoundingClientRect(),len=r.height-innerHeight;return len>0?clamp(-r.top/len):0}
function tick(t){if(!running)return;const tg=target();progress+=(tg-progress)*.22;if(Math.abs(tg-progress)<.0004)progress=tg;frame(progress,t);setSteps(progress);requestAnimationFrame(tick)}
function start(){if(running||!visible)return;running=true;requestAnimationFrame(tick)}
function still(){running=false;layout();frame(1,t0+2000)}
function init(){
  if(reduce.matches){document.documentElement.classList.add('reduced');still();return}
  layout();
  progress=target();frame(progress,performance.now());setSteps(progress);start();
}
new IntersectionObserver(([e])=>{visible=e.isIntersecting;if(visible&&!reduce.matches)start();else running=false}).observe(sec);
addEventListener('resize',()=>{layout();if(!running)frame(reduce.matches?1:progress,reduce.matches?t0+2000:performance.now())},{passive:true});
reduce.addEventListener?.('change',()=>location.reload());
document.fonts?.ready.then(()=>{if(!running)frame(reduce.matches?1:progress,reduce.matches?t0+2000:performance.now())});
init();
})();
