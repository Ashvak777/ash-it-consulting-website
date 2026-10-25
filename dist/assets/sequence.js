/* ASH IT — scroll-scrubbed pipeline: sources → Fabric (bronze/silver/gold) → Azure AI Foundry → Teams.
   One world drawn on a canvas; scroll moves a camera along it. No video or frame images to download. */
(()=>{
const sec=document.querySelector('[data-sequence]');if(!sec)return;
const canvas=sec.querySelector('canvas'),ctx=canvas.getContext('2d');
const steps=[...sec.querySelectorAll('[data-step]')],dots=[...sec.querySelectorAll('[data-dot]')],bar=sec.querySelector('.seq-progress i');
const reduce=matchMedia('(prefers-reduced-motion: reduce)');
const TAU=Math.PI*2,clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v)),mix=(a,b,t)=>a+(b-a)*t;
const ss=(e0,e1,x)=>{const t=clamp((x-e0)/(e1-e0));return t*t*(3-2*t)};
const rng=(s=>()=>{s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296})(2020);
const COL={bronze:'#cd8a5a',silver:'#c9d3de',gold:'#e8c36a',cyan:'#52d9ff',blue:'#2978ff',ink:'#e9f3ff',mute:'#7f98b4',green:'#7ef0c4',teams:'#7b83eb'};
const mono=s=>`500 ${s}px "DM Mono",ui-monospace,monospace`,sans=(w,s)=>`${w} ${s}px Manrope,system-ui,sans-serif`;

// ---- the world (units: 600 tall) ----
const SRC=[['CSV','Sales extract','#a6f3b5','≡','raw_sales'],['FLAT FILE','ERP export','#ffcf8f','▤','raw_erp'],['EVENT STREAM','IoT sensors','#ff9fb2','≋','raw_iot'],['REST API','CRM records','#94fff0','{}','raw_crm'],['SQL SERVER','Orders DB','#8fb9ff','▦','raw_orders'],['DYNAMICS 365','Customers','#8fb9ff','D','raw_customers'],['SHAREPOINT','Documents','#7fd6c6','S','raw_docs'],['EXCEL','Budgets','#a6f3b5','X','raw_budgets'],['OUTLOOK','Email requests','#8fb9ff','@','raw_email'],['SAP','Invoices','#94fff0','S','raw_invoices'],['PARQUET','App logs','#d2b9ff','◫','raw_logs'],['JSON','Web events','#ffd36b','{}','raw_web']];
const SILVER=[['orders_clean','deduplicated',[0,1,4]],['customers_clean','matched',[3,5]],['events_clean','validated',[2,10,11]],['invoices_clean','reconciled',[9]],['documents_parsed','extracted',[6,8]],['budgets_clean','typed',[7]]];
const GOLD=[['Sales',[0,1]],['Customer 360',[1,2]],['Finance',[3,5]],['Operations',[2,4]]];
const FOUNDRY=[['MODELS',[['GPT model','deployed'],['Forecasting','trained on gold'],['Anomaly detection','real-time']]],['KNOWLEDGE',[['AI Search index','RAG']]],['AGENTS',[['Fabric data agent','answers from gold'],['Foundry agent','plans and acts']]],['TOOLS',[['MCP server','ERP · CRM'],['Power Automate','runs workflows']]]];
const FAB={x:250,y:0,w:760,h:600},FD={x:1080,y:10,w:400,h:580},TM={x:1560,y:30,w:560,h:540};
const srcPos=SRC.map((_,i)=>({x:0,y:21+i*47,w:200,h:40}));
const bzPos=SRC.map((_,i)=>({x:270,y:96+i*41,w:220,h:34}));
const svPos=SILVER.map((_,j)=>({x:510,y:136+j*68,w:220,h:54}));
const gdPos=GOLD.map((_,k)=>({x:750,y:116+k*112,w:220,h:96}));
const fdRows=[];{let y=FD.y+64;FOUNDRY.forEach(([g,rows])=>{fdRows.push({head:g,y});y+=22;rows.forEach(r=>{fdRows.push({name:r[0],sub:r[1],x:FD.x+10,y,w:FD.w-20,h:36});y+=42});y+=8})}
const fdIdx=n=>fdRows.find(r=>r.name===n);
const goldBars=GOLD.map(()=>Array.from({length:7},()=>.3+rng()*.7)),teamBars=Array.from({length:7},()=>.25+rng()*.75);
const cards=SRC.map((s,i)=>({i,fx:rng(),fy:rng(),rot:(rng()-.5)*.5,depth:.6+rng()*.4,ph:rng()*TAU,sp:.6+rng()*.8}));

// connectors: [from, to, reveal(p), colour]
const right=r=>({x:r.x+r.w,y:r.y+r.h/2}),left=r=>({x:r.x,y:r.y+r.h/2});
const revBz=i=>p=>ss(.17+i*.004,.21+i*.004,p),revSv=j=>p=>ss(.24+j*.008,.28+j*.008,p),revGd=k=>p=>ss(.3+k*.01,.34+k*.01,p);
const fdOrder=fdRows.filter(r=>r.name),revFd=n=>p=>{const r=fdOrder.indexOf(fdIdx(n));return ss(.46+r*.012,.5+r*.012,p)};
const revTeams=p=>ss(.66,.74,p);
const links=[];
SRC.forEach((_,i)=>links.push([right(srcPos[i]),left(bzPos[i]),revBz(i),COL.bronze]));
SILVER.forEach(([,,from],j)=>from.forEach(i=>links.push([right(bzPos[i]),left(svPos[j]),revSv(j),COL.silver])));
GOLD.forEach(([,from],k)=>from.forEach(j=>links.push([right(svPos[j]),left(gdPos[k]),revGd(k),COL.gold])));
[['Fabric data agent',[0,1,2,3]],['Forecasting',[0,3]],['AI Search index',[1]],['Anomaly detection',[3]]].forEach(([n,ks])=>ks.forEach(k=>links.push([right(gdPos[k]),left(fdIdx(n)),revFd(n),COL.gold])));
[['Fabric data agent',0],['Foundry agent',90],['Power Automate',200]].forEach(([n,dy])=>links.push([right(fdIdx(n)),{x:TM.x,y:TM.y+180+dy},p=>revTeams(p)*revFd(n)(p),COL.cyan]));
links.forEach(l=>l.seed=rng());

// camera keyframes: [progress, frame in world units]
const F=(x,w)=>({x,y:-20,w,h:640});
const CAM_WIDE=[[0,F(-10,1030)],[.37,F(-10,1030)],[.47,F(720,790)],[.64,F(720,790)],[.74,F(1400,740)],[1,F(1400,740)]];
const CAM_NARROW=[[0,F(-15,230)],[.22,F(-15,230)],[.25,F(255,250)],[.27,F(255,250)],[.3,F(495,250)],[.32,F(495,250)],[.35,F(735,250)],[.42,F(735,250)],[.47,F(1065,430)],[.64,F(1065,430)],[.72,F(1545,590)],[1,F(1545,590)]];

let W=0,H=0,dpr=1,R,cam,cwPx,progress=0,shown=-1,running=false,visible=false;
function layout(){
  const r=canvas.getBoundingClientRect();W=r.width;H=r.height;dpr=Math.min(devicePixelRatio||1,2);
  canvas.width=Math.round(W*dpr);canvas.height=Math.round(H*dpr);
  const wide=W>900,still=document.documentElement.classList.contains('reduced');
  R=still?{x:W*.03,y:H*.04,w:W*.94,h:H*.92}:wide?{x:W*.39,y:H*.07,w:W*.53,h:H*.86}:{x:W*.04,y:H*.05,w:W*.92,h:H*.55};
  cam=wide||still?CAM_WIDE:CAM_NARROW;cwPx=clamp(W*.13,130,190);
}
function camAt(p){
  let i=0;while(i<cam.length-2&&p>cam[i+1][0])i++;
  const[p0,a]=cam[i],[p1,b]=cam[i+1],t=ss(0,1,(p-p0)/(p1-p0||1));
  const f={x:mix(a.x,b.x,t),y:mix(a.y,b.y,t),w:mix(a.w,b.w,t),h:mix(a.h,b.h,t)};
  const s=Math.min(R.w/f.w,R.h/f.h);
  return{s,ox:R.x+(R.w-f.w*s)/2-f.x*s,oy:R.y+(R.h-f.h*s)/2-f.y*s};
}

function rr(x,y,w,h,r){r=Math.min(r,w/2,h/2);ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath()}
function hexA(hex,a){const n=parseInt(hex.slice(1),16);return`rgba(${n>>16},${n>>8&255},${n&255},${a})`}
function fit(text,max){if(ctx.measureText(text).width<=max)return text;let t=text;while(t.length>1&&ctx.measureText(t+'…').width>max)t=t.slice(0,-1);return t+'…'}
function wrap(text,max){const out=[];let line='';text.split(' ').forEach(w=>{const t=line?line+' '+w:w;if(ctx.measureText(t).width>max&&line){out.push(line);line=w}else line=t});if(line)out.push(line);return out}
function txt(s,x,y,font,color,align='left'){ctx.font=font;ctx.fillStyle=color;ctx.textAlign=align;ctx.fillText(s,x,y)}
function panel(x,y,w,h,r,stroke,fill='rgba(16,35,59,.94)'){rr(x,y,w,h,r);ctx.fillStyle=fill;ctx.fill();ctx.lineWidth=1;ctx.strokeStyle=stroke;ctx.stroke()}
function bezier(a,b,t){const dx=(b.x-a.x)*.5,u=1-t;return{x:u*u*u*a.x+3*u*u*t*(a.x+dx)+3*u*t*t*(b.x-dx)+t*t*t*b.x,y:u*u*u*a.y+3*u*u*t*a.y+3*u*t*t*b.y+t*t*t*b.y}}

function srcCard(s){
  // base card 200×40, centred on the origin
  panel(-100,-20,200,40,9,'rgba(145,202,255,.24)');
  rr(-92,-13,26,26,7);ctx.fillStyle=hexA(s[2],.16);ctx.fill();
  txt(s[3],-79,1,sans(800,s[3].length>1?11:13),s[2],'center');
  txt(s[0],-56,-5,mono(9.5),COL.mute);
  ctx.font=sans(700,12.5);txt(fit(s[1],148),-56,10,sans(700,12.5),COL.ink);
}

const t0=performance.now();
function frame(p,t){
  ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,W,H);
  const intro=ss(0,1400,t-t0);
  ctx.fillStyle='rgba(122,190,255,.08)';for(let x=(t*.004)%28;x<W;x+=28)for(let y=6;y<H;y+=28)ctx.fillRect(x,y,1.2,1.2);
  const c=camAt(p);ctx.setTransform(dpr*c.s,0,0,dpr*c.s,dpr*c.ox,dpr*c.oy);ctx.textBaseline='middle';
  const fabA=ss(.12,.2,p),fdA=ss(.42,.5,p),tmA=revTeams(p);

  // Fabric / OneLake
  if(fabA>.01){ctx.globalAlpha=fabA;panel(FAB.x,FAB.y,FAB.w,FAB.h,18,'rgba(145,202,255,.2)','rgba(10,26,45,.72)');
    txt('Microsoft Fabric',FAB.x+20,FAB.y+30,sans(800,16),COL.ink);txt('ONELAKE',FAB.x+FAB.w-20,FAB.y+30,mono(10),COL.cyan,'right');
    [['BRONZE · RAW',270,COL.bronze],['SILVER · CLEANED',510,COL.silver],['GOLD · BUSINESS-READY',750,COL.gold]].forEach(([l,x,col])=>{txt(l,x,72,mono(9.5),col);ctx.fillStyle=hexA(col,.4);ctx.fillRect(x,82,220,1)});
    ctx.globalAlpha=1}
  // Azure AI Foundry
  if(fdA>.01){ctx.globalAlpha=fdA;panel(FD.x,FD.y,FD.w,FD.h,18,'rgba(145,202,255,.2)','rgba(10,26,45,.72)');
    txt('Azure AI Foundry',FD.x+20,FD.y+30,sans(800,16),COL.ink);txt('MODELS · AGENTS',FD.x+FD.w-20,FD.y+30,mono(9.5),COL.cyan,'right');ctx.globalAlpha=1}

  // pipes with data flowing through them
  links.forEach(l=>{const a=l[2](p)*intro;if(a<.01)return;const[A,B]=l,dx=(B.x-A.x)*.5;
    ctx.globalAlpha=a*.5;ctx.strokeStyle=hexA(l[3],.55);ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(A.x,A.y);ctx.bezierCurveTo(A.x+dx,A.y,B.x-dx,B.y,B.x,B.y);ctx.stroke();
    ctx.globalAlpha=a;ctx.fillStyle=l[3];for(let k=0;k<2;k++){const q=bezier(A,B,((t/2200)+l.seed+k/2)%1);ctx.beginPath();ctx.arc(q.x,q.y,2.1,0,TAU);ctx.fill()}});
  ctx.globalAlpha=1;

  bzPos.forEach((b,i)=>{const a=revBz(i)(p);if(a<.01)return;ctx.globalAlpha=a;const x=b.x-(1-a)*14;
    panel(x,b.y,b.w,b.h,8,hexA(COL.bronze,.45),'rgba(205,138,90,.08)');ctx.fillStyle=COL.bronze;ctx.beginPath();ctx.arc(x+14,b.y+17,3,0,TAU);ctx.fill();
    txt(SRC[i][4],x+26,b.y+17,mono(12),COL.ink);txt(SRC[i][0].split(' ')[0],x+b.w-10,b.y+17,mono(9),COL.mute,'right')});
  svPos.forEach((v,j)=>{const a=revSv(j)(p);if(a<.01)return;ctx.globalAlpha=a;const x=v.x-(1-a)*14;
    panel(x,v.y,v.w,v.h,10,hexA(COL.silver,.4),'rgba(201,211,222,.06)');
    txt(SILVER[j][0],x+14,v.y+20,mono(12.5),COL.ink);txt(SILVER[j][1].toUpperCase(),x+14,v.y+38,mono(9.5),COL.mute);
    txt('✓',x+v.w-14,v.y+27,sans(800,12),COL.green,'right')});
  gdPos.forEach((g,k)=>{const a=revGd(k)(p);if(a<.01)return;ctx.globalAlpha=a;const x=g.x-(1-a)*14;
    panel(x,g.y,g.w,g.h,12,hexA(COL.gold,.5),'rgba(232,195,106,.07)');
    txt(GOLD[k][0],x+14,g.y+22,sans(800,15),COL.gold);txt('SEMANTIC MODEL',x+14,g.y+40,mono(9),COL.mute);
    const gr=ss(.33+k*.01,.4+k*.01,p);goldBars[k].forEach((h,n)=>{const bh=h*30*gr;ctx.fillStyle=hexA(COL.gold,.35+n*.06);ctx.fillRect(x+14+n*28,g.y+g.h-12-bh,18,bh)})});
  ctx.globalAlpha=1;
  fdRows.forEach(r=>{if(r.head){if(fdA<.01)return;ctx.globalAlpha=fdA;txt(r.head,FD.x+20,r.y+10,mono(9),COL.cyan);return}
    const a=revFd(r.name)(p);if(a<.01)return;ctx.globalAlpha=a;const x=r.x-(1-a)*14;
    panel(x,r.y,r.w,r.h,9,'rgba(145,202,255,.24)');
    ctx.fillStyle=hexA(COL.green,.6+.4*Math.sin(t*.004+r.y));ctx.beginPath();ctx.arc(x+16,r.y+18,3.2,0,TAU);ctx.fill();
    txt(r.name,x+30,r.y+18,sans(700,12.5),COL.ink);txt(r.sub.toUpperCase(),x+r.w-12,r.y+18,mono(9.5),COL.mute,'right')});
  ctx.globalAlpha=1;

  // Microsoft Teams
  if(tmA>.01){ctx.globalAlpha=tmA;const X=TM.x,Y=TM.y;
    panel(X,Y,TM.w,TM.h,16,'rgba(145,202,255,.26)','rgba(12,24,42,.97)');
    rr(X,Y,TM.w,34,16);ctx.fillStyle='rgba(6,14,26,.9)';ctx.fill();ctx.fillRect(X,Y+18,TM.w,16);
    ['#ff7b72','#ffc46b','#7ef0c4'].forEach((col,n)=>{ctx.fillStyle=col;ctx.beginPath();ctx.arc(X+18+n*14,Y+17,4,0,TAU);ctx.fill()});
    txt('Microsoft Teams',X+TM.w/2,Y+17,mono(10),COL.mute,'center');
    ctx.fillStyle='rgba(6,14,26,.6)';ctx.fillRect(X,Y+34,56,TM.h-50);
    [0,1,2,3].forEach(n=>{rr(X+14,Y+52+n*44,28,28,7);ctx.fillStyle=n===1?hexA(COL.teams,.85):'rgba(145,202,255,.12)';ctx.fill()});
    const cx=X+76,cw=TM.w-96;
    txt('Operations',cx,Y+60,sans(800,15),COL.ink);
    ctx.font=sans(800,15);const ow=ctx.measureText('Operations').width;rr(cx+ow+10,Y+51,64,18,9);ctx.fillStyle=hexA(COL.cyan,.14);ctx.fill();txt('AI AGENT',cx+ow+42,Y+60,mono(9.5),COL.cyan,'center');
    ['Chat','Report','Files'].forEach((tb,n)=>{txt(tb,cx+n*60,Y+88,sans(n?600:800,11.5),n?COL.mute:COL.ink);if(!n){ctx.fillStyle=COL.teams;ctx.fillRect(cx,Y+98,30,2)}});
    ctx.fillStyle='rgba(145,202,255,.12)';ctx.fillRect(cx,Y+104,cw,1);
    const m1=ss(.72,.76,p);if(m1>.01){ctx.globalAlpha=tmA*m1;const bw=258,bx=cx+cw-bw,by=Y+120+(1-m1)*10;rr(bx,by,bw,36,12);ctx.fillStyle='rgba(41,120,255,.3)';ctx.fill();txt('Which orders are at risk this week?',bx+14,by+18,sans(600,12),COL.ink)}
    const m2=ss(.77,.81,p);if(m2>.01){ctx.globalAlpha=tmA*m2;const by=Y+172+(1-m2)*10;
      ctx.fillStyle=hexA(COL.cyan,.18);ctx.beginPath();ctx.arc(cx+14,by+14,14,0,TAU);ctx.fill();txt('AI',cx+14,by+14,sans(800,10),COL.cyan,'center');
      const bx=cx+36,bw=cw-60;panel(bx,by,bw,176,12,'rgba(145,202,255,.18)','rgba(20,40,66,.9)');
      txt('Fabric data agent',bx+14,by+18,sans(800,11.5),COL.cyan);
      ctx.font=sans(500,12);wrap('Here are this week’s at-risk orders from the gold Sales table.',bw-28).forEach((ln,n)=>txt(ln,bx+14,by+38+n*16,sans(500,12),COL.ink));
      const chA=ss(.81,.86,p);ctx.globalAlpha=tmA*m2*Math.max(.15,chA);
      panel(bx+14,by+70,bw-28,94,9,'rgba(232,195,106,.3)','rgba(7,19,34,.7)');txt('POWER BI · ORDERS AT RISK',bx+26,by+84,mono(9.5),COL.gold);
      const gw=(bw-60)/teamBars.length;teamBars.forEach((h,i)=>{const bh=h*52*chA;ctx.fillStyle=hexA(i===4?COL.gold:COL.blue,i===4?.9:.6);ctx.fillRect(bx+26+i*gw,by+156-bh,gw*.62,bh)})}
    const m3=ss(.87,.92,p);if(m3>.01){ctx.globalAlpha=tmA*m3;const bx=cx+36,bw=cw-60,by=Y+362+(1-m3)*10;
      panel(bx,by,bw,84,12,hexA(COL.green,.35),'rgba(20,40,66,.9)');
      txt('POWER AUTOMATE · APPROVAL',bx+14,by+18,mono(9.5),COL.green);txt('Approve the automated reorder?',bx+14,by+38,sans(700,12.5),COL.ink);
      rr(bx+14,by+52,84,22,6);ctx.fillStyle=COL.blue;ctx.fill();txt('Approve',bx+56,by+63,sans(700,11),'#fff','center');
      rr(bx+106,by+52,84,22,6);ctx.strokeStyle='rgba(145,202,255,.4)';ctx.stroke();txt('Review',bx+148,by+63,sans(700,11),COL.ink,'center')}
    ctx.globalAlpha=tmA;rr(cx,Y+TM.h-48,cw,32,9);ctx.strokeStyle='rgba(145,202,255,.2)';ctx.stroke();txt('Ask the agent…',cx+14,Y+TM.h-32,sans(500,11.5),COL.mute);
    ctx.globalAlpha=1}

  // fade the world behind the captions
  const wide=W>900;
  ctx.setTransform(dpr,0,0,dpr,0,0);ctx.globalCompositeOperation='destination-out';
  const g=wide?ctx.createLinearGradient(R.x-110,0,R.x-6,0):ctx.createLinearGradient(0,R.y+R.h+4,0,R.y+R.h-40);
  g.addColorStop(0,'rgba(0,0,0,1)');g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;
  wide?ctx.fillRect(0,0,R.x,H):ctx.fillRect(0,R.y+R.h-40,W,H);
  ctx.globalCompositeOperation='source-over';ctx.setTransform(dpr*c.s,0,0,dpr*c.s,dpr*c.ox,dpr*c.oy);ctx.textBaseline='middle';
  // source cards: scattered data → lined up as the pipeline's inputs (faded once the camera leaves them)
  const leave=ss(.38,.45,p);
  cards.forEach(cd=>{const i=cd.i,o=i*.004,a=ss(.06+o,.2+o,p);
    const dx=Math.sin(t*.00035*cd.sp+cd.ph)*W*.012,dy=Math.cos(t*.0003*cd.sp+cd.ph)*H*.014;
    const sx=(wide?W*(.3+cd.fx*.66):W*(.04+cd.fx*.78))+dx,sy=(wide?H*(.08+cd.fy*.82):H*(.05+cd.fy*.58))+dy;
    const k0=cwPx*cd.depth/200/c.s,dst=srcPos[i];
    const x=mix((sx-c.ox)/c.s,dst.x+100,a),y=mix((sy-c.oy)/c.s,dst.y+20,a),k=mix(k0,1,a),rot=mix(cd.rot,0,a);
    const al=mix((.3+.6*cd.depth)*(wide?1:.45),1,a)*intro*(1-leave*.85);if(al<.01)return;
    ctx.save();ctx.globalAlpha=al;ctx.translate(x,y);ctx.rotate(rot);ctx.scale(k,k);srcCard(SRC[i]);ctx.restore()});
  ctx.globalAlpha=1;
}

function setSteps(p){
  const a=[.1,.37,.64].reduce((n,x)=>p>=x?n+1:n,0);
  if(a!==shown){shown=a;steps.forEach((el,i)=>el.classList.toggle('on',i===a));dots.forEach((d,i)=>d.classList.toggle('on',i<=a))}
  if(bar)bar.style.transform=`scaleY(${p})`;
}
function target(){const r=sec.getBoundingClientRect(),len=r.height-innerHeight;return len>0?clamp(-r.top/len):0}
function tick(t){if(!running)return;const tg=target();progress+=(tg-progress)*.22;if(Math.abs(tg-progress)<.0004)progress=tg;frame(progress,t);setSteps(progress);requestAnimationFrame(tick)}
function start(){if(running||!visible)return;running=true;requestAnimationFrame(tick)}
function still(){running=false;layout();frame(1,t0+4000)}
function init(){
  if(reduce.matches){document.documentElement.classList.add('reduced');still();return}
  layout();progress=target();frame(progress,performance.now());setSteps(progress);start();
}
new IntersectionObserver(([e])=>{visible=e.isIntersecting;if(visible&&!reduce.matches)start();else running=false}).observe(sec);
const redraw=()=>{if(!running)frame(reduce.matches?1:progress,reduce.matches?t0+4000:performance.now())};
addEventListener('resize',()=>{layout();redraw()},{passive:true});
reduce.addEventListener?.('change',()=>location.reload());
document.fonts?.ready.then(redraw);
init();
})();
