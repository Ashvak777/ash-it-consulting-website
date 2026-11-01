/* ASH IT — scroll-scrubbed reference architecture, matching the hero panel layer for layer:
   01 Your data → 02 Microsoft Fabric · OneLake → 03 Agents & AI → 04 Where people work,
   with security & governance across every layer. One world drawn on a canvas; scroll moves a camera along it. */
(()=>{
const sec=document.querySelector('[data-sequence]');if(!sec)return;
const canvas=sec.querySelector('canvas'),ctx=canvas.getContext('2d');
const arch=sec.querySelector('.seq-arch'),steps=[...sec.querySelectorAll('[data-step]')],dots=[...sec.querySelectorAll('[data-dot]')],bar=sec.querySelector('.seq-progress i');
const reduce=matchMedia('(prefers-reduced-motion: reduce)');
const TAU=Math.PI*2,clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v)),mix=(a,b,t)=>a+(b-a)*t;
const ss=(e0,e1,x)=>{const t=clamp((x-e0)/(e1-e0));return t*t*(3-2*t)};
const rng=(s=>()=>{s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296})(2020);
const COL={bronze:'#cd8a5a',silver:'#c9d3de',gold:'#e8c36a',cyan:'#52d9ff',blue:'#2978ff',ink:'#e9f3ff',mute:'#7f98b4',green:'#7ef0c4',teams:'#7b83eb'};
const ICON={};['sql','dynamics','sharepoint','fabric','fabric-data-factory','fabric-data-engineering','fabric-warehouse','fabric-realtime','power-bi','foundry','copilot','m365-copilot','power-automate','teams','entra','purview','defender','azure'].forEach(n=>{const im=new Image();im.onload=()=>redraw();im.src=`assets/icons/${n}.svg`;ICON[n]=im});
const hasIcon=n=>n&&ICON[n]&&ICON[n].complete&&ICON[n].naturalWidth;
const drawIcon=(n,x,y,s)=>{if(hasIcon(n))ctx.drawImage(ICON[n],x,y,s,s)};
const mono=s=>`500 ${s}px "DM Mono",ui-monospace,monospace`,sans=(w,s)=>`${w} ${s}px Manrope,system-ui,sans-serif`;

// ---- the world (units: 600 tall), laid out as the panel's four layers ----
// 01 · Your data: [label, what it holds, icon, glyph, bronze table, bronze tag, silver table]
const SRC=[['SQL SERVER','Orders','sql','▦','raw_orders','SQL','orders_clean'],['DYNAMICS 365','Customers','dynamics','D','raw_customers','D365','customers_matched'],['SHAREPOINT','Documents','sharepoint','S','raw_documents','SHAREPOINT','documents_parsed'],['APIS & FILES','Events & files','','{}','raw_events','REAL-TIME','events_validated'],['SAP / ERP','Invoices','','▤','raw_invoices','SAP','invoices_reconciled']];
const srcPos=SRC.map((_,i)=>({x:0,y:150+i*64,w:200,h:40}));
// 02 · Microsoft Fabric · OneLake
const FAB={x:250,y:0,w:760,h:600};
const FAB_TOOLS=[['fabric-data-factory','Data Factory'],['fabric-data-engineering','Lakehouse'],['fabric-warehouse','Warehouse'],['fabric-realtime','Real-Time'],['power-bi','Power BI']];
const bzPos=SRC.map((_,i)=>({x:270,y:140+i*64,w:220,h:40}));
const svPos=SRC.map((_,i)=>({x:510,y:140+i*64,w:220,h:40}));
const GOLD=[['Sales','WAREHOUSE',[0,4]],['Customer 360','SEMANTIC MODEL',[1,3]],['Knowledge','LAKEHOUSE · INDEXED',[2]]];
const gdPos=GOLD.map((_,k)=>({x:750,y:140+k*120,w:240,h:100}));
// 03 · Agents & AI
const FD={x:1080,y:40,w:400,h:520};
const AGENTS=[['foundry','AI Foundry','Agents grounded on gold'],['copilot','Copilot Studio','Agents published to Teams'],['m365-copilot','Microsoft 365 Copilot','Copilot chat on your data'],['power-automate','Power Automate','Approvals, actions & MCP tools']];
const agPos=AGENTS.map((_,r)=>({x:FD.x+16,y:110+r*98,w:FD.w-32,h:72}));
// 04 · Where people work
const PW={x:1560,y:0,w:640,h:600},TM={x:1580,y:56,w:340,h:528},DB={x:1940,y:56,w:240,h:256},CC={x:1940,y:328,w:240,h:256};
// security & governance across every layer
const GOV={x:250,y:628,w:1950,h:56},GOV_CHIPS=[['entra','Entra ID'],['purview','Purview'],['defender','Defender'],['azure','Azure Private Link']];

const goldBars=GOLD.map(()=>Array.from({length:7},()=>.3+rng()*.7)),dashBars=Array.from({length:8},()=>.25+rng()*.75);
const cards=SRC.map((s,i)=>({i,fx:rng(),fy:rng(),rot:(rng()-.5)*.5,depth:.65+rng()*.35,ph:rng()*TAU,sp:.6+rng()*.8}));

// reveal timings (scroll progress)
const revBz=i=>p=>ss(.31+i*.008,.35+i*.008,p),revSv=i=>p=>ss(.36+i*.008,.4+i*.008,p),revGd=k=>p=>ss(.41+k*.012,.45+k*.012,p);
const revAg=r=>p=>ss(.52+r*.02,.56+r*.02,p),revPW=p=>ss(.7,.76,p),revTM=p=>ss(.72,.78,p),revDB=p=>ss(.78,.82,p),revCC=p=>ss(.84,.88,p);

// connectors: [from, to, reveal(p), colour]
const right=r=>({x:r.x+r.w,y:r.y+r.h/2}),left=r=>({x:r.x,y:r.y+r.h/2});
const links=[];
SRC.forEach((_,i)=>links.push([right(srcPos[i]),left(bzPos[i]),revBz(i),COL.bronze]));
SRC.forEach((_,i)=>links.push([right(bzPos[i]),left(svPos[i]),revSv(i),COL.silver]));
GOLD.forEach(([,,from],k)=>from.forEach(i=>links.push([right(svPos[i]),left(gdPos[k]),revGd(k),COL.gold])));
[[0,0],[2,0],[0,1],[1,1],[1,2],[2,2],[0,3]].forEach(([k,r])=>links.push([right(gdPos[k]),left(agPos[r]),revAg(r),COL.gold]));
links.push([right(agPos[1]),{x:TM.x,y:TM.y+190},p=>revTM(p)*revAg(1)(p),COL.cyan]);
links.push([right(agPos[3]),{x:TM.x,y:TM.y+400},p=>revTM(p)*revAg(3)(p),COL.cyan]);
links.push([right(agPos[2]),{x:TM.x,y:TM.y+300},p=>revCC(p)*revAg(2)(p),COL.cyan]);
links.forEach(l=>l.seed=rng());

// camera keyframes: [progress, frame in world units]
const F=(x,w)=>({x,y:-20,w,h:640}),G=(x,w)=>({x,y:-20,w,h:720});
const CAM_WIDE=[[0,G(-200,600)],[.24,G(-200,600)],[.32,G(-10,1030)],[.46,G(-10,1030)],[.55,G(730,770)],[.66,G(730,770)],[.75,G(1480,740)],[1,G(1480,740)]];
const CAM_NARROW=[[0,F(-15,230)],[.28,F(-15,230)],[.31,F(258,245)],[.35,F(258,245)],[.38,F(498,245)],[.41,F(498,245)],[.44,F(738,265)],[.5,F(738,265)],[.55,F(1065,430)],[.68,F(1065,430)],[.76,F(1550,660)],[1,F(1550,660)]];

let redraw=()=>{},W=0,H=0,dpr=1,R,cam,cwPx,progress=0,shown=-1,running=false,visible=false;
function layout(){
  const r=canvas.getBoundingClientRect();W=r.width;H=r.height;dpr=Math.min(devicePixelRatio||1,2);
  canvas.width=Math.round(W*dpr);canvas.height=Math.round(H*dpr);
  const wide=W>900,still=document.documentElement.classList.contains('reduced');
  R=still?{x:W*.03,y:H*.04,w:W*.94,h:H*.92}:wide?{x:W*.39,y:H*.07,w:W*.53,h:H*.86}:{x:W*.04,y:H*.05,w:W*.92,h:H*.55};
  cam=wide||still?CAM_WIDE:CAM_NARROW;cwPx=clamp(W*.14,150,210);
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
// a panel-style chip: icon + label; glow > 0 lights it up while its step runs
function chip(x,y,icon,label,glow=0,size=12){
  ctx.font=sans(700,size);const w=ctx.measureText(label).width+(icon?40:22),h=size*2.4;
  rr(x,y,w,h,9);ctx.fillStyle=glow>.01?hexA(COL.cyan,.06+.12*glow):'rgba(255,255,255,.06)';ctx.fill();ctx.lineWidth=1;ctx.strokeStyle=glow>.01?hexA(COL.cyan,.25+.5*glow):'rgba(145,202,255,.2)';ctx.stroke();
  if(icon)drawIcon(icon,x+10,y+(h-size*1.5)/2,size*1.5);txt(label,x+(icon?34:11),y+h/2,sans(700,size),COL.ink);return w;
}
// a layer panel with the same numbering as the hero's reference architecture
function layerPanel(b,num,icon,title,a){
  ctx.globalAlpha=a;panel(b.x,b.y,b.w,b.h,18,'rgba(145,202,255,.2)','rgba(10,26,45,.72)');
  drawIcon(icon,b.x+18,b.y+17,22);txt(title,b.x+48,b.y+28,sans(800,16),COL.ink);txt(num,b.x+b.w-20,b.y+28,mono(10),COL.cyan,'right');
}

function srcCard(s){
  // base card 200×40, centred on the origin
  panel(-100,-20,200,40,9,'rgba(145,202,255,.24)');
  rr(-92,-13,26,26,7);ctx.fillStyle='rgba(255,255,255,.08)';ctx.fill();
  if(hasIcon(s[2]))drawIcon(s[2],-88,-9,18);else txt(s[3],-79,1,sans(800,s[3].length>1?11:13),COL.cyan,'center');
  txt(s[0],-56,-5,mono(9.5),COL.mute);
  ctx.font=sans(700,12.5);txt(fit(s[1],148),-56,10,sans(700,12.5),COL.ink);
}

const t0=performance.now();
function frame(p,t){
  ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,W,H);
  const intro=ss(0,1400,t-t0);
  ctx.fillStyle='rgba(122,190,255,.08)';for(let x=(t*.004)%28;x<W;x+=28)for(let y=6;y<H;y+=28)ctx.fillRect(x,y,1.2,1.2);
  const c=camAt(p);ctx.setTransform(dpr*c.s,0,0,dpr*c.s,dpr*c.ox,dpr*c.oy);ctx.textBaseline='middle';
  const srcA=ss(.12,.2,p),fabA=ss(.27,.33,p),fdA=ss(.48,.55,p),pwA=revPW(p);

  // 01 · Your data
  if(srcA>.01){ctx.globalAlpha=srcA;txt('01 · YOUR DATA',0,118,mono(10),COL.cyan);ctx.fillStyle=hexA(COL.cyan,.35);ctx.fillRect(0,128,200,1);ctx.globalAlpha=1}
  // 02 · Microsoft Fabric · OneLake, with the panel's five tools lighting up as each step runs
  if(fabA>.01){layerPanel(FAB,'02 · ONELAKE','fabric','Microsoft Fabric',fabA);
    const glow=[ss(.31,.34,p)*(1-ss(.37,.4,p)),ss(.36,.39,p)*(1-ss(.42,.45,p)),ss(.41,.44,p)*(1-ss(.5,.54,p)),.4+.4*Math.sin(t*.004),ss(.43,.46,p)*(1-ss(.5,.54,p))];
    let x=FAB.x+18;FAB_TOOLS.forEach(([ic,l],k)=>{x+=chip(x,50,ic,l,glow[k]*fabA,11.5)+8});
    [['BRONZE · RAW',270,220,COL.bronze],['SILVER · CLEANED',510,220,COL.silver],['GOLD · WAREHOUSE & POWER BI',750,240,COL.gold]].forEach(([l,x,w,col])=>{txt(l,x,108,mono(9.5),col);ctx.fillStyle=hexA(col,.4);ctx.fillRect(x,118,w,1)});
    ctx.globalAlpha=1}
  // 03 · Agents & AI
  if(fdA>.01){layerPanel(FD,'03','foundry','Agents & AI',fdA);txt('PERMISSION-AWARE · EVALUATED · LOGGED',FD.x+20,FD.y+FD.h-26,mono(9),COL.cyan);ctx.globalAlpha=1}
  // 04 · Where people work
  if(pwA>.01){layerPanel(PW,'04','teams','Where people work',pwA);ctx.globalAlpha=1}

  // security & governance across every layer
  const govA=ss(.3,.38,p);
  if(govA>.01){ctx.globalAlpha=govA;rr(GOV.x,GOV.y,GOV.w,GOV.h,14);ctx.fillStyle='rgba(82,217,255,.05)';ctx.fill();ctx.setLineDash([5,6]);ctx.strokeStyle='rgba(82,217,255,.4)';ctx.stroke();ctx.setLineDash([]);
    txt('SECURITY & GOVERNANCE ACROSS EVERY LAYER · CANADA CENTRAL · CANADA EAST',GOV.x+20,GOV.y+GOV.h/2,mono(9.5),COL.cyan);
    ctx.font=sans(700,12);const cw=GOV_CHIPS.map(([,l])=>ctx.measureText(l).width+40),gw=cw.reduce((a,b)=>a+b+8,0);
    for(let x=GOV.x+500;x+gw<GOV.x+GOV.w;x+=gw+80){let cx=x;GOV_CHIPS.forEach(([n,l])=>{cx+=chip(cx,GOV.y+13,n,l,0,12)+8})}
    ctx.globalAlpha=1}

  // pipes with data flowing through them
  links.forEach(l=>{const a=l[2](p)*intro;if(a<.01)return;const[A,B]=l,dx=(B.x-A.x)*.5;
    ctx.globalAlpha=a*.5;ctx.strokeStyle=hexA(l[3],.55);ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(A.x,A.y);ctx.bezierCurveTo(A.x+dx,A.y,B.x-dx,B.y,B.x,B.y);ctx.stroke();
    ctx.globalAlpha=a;ctx.fillStyle=l[3];for(let k=0;k<2;k++){const q=bezier(A,B,((t/2200)+l.seed+k/2)%1);ctx.beginPath();ctx.arc(q.x,q.y,2.1,0,TAU);ctx.fill()}});
  ctx.globalAlpha=1;

  // bronze → silver → gold
  bzPos.forEach((b,i)=>{const a=revBz(i)(p);if(a<.01)return;ctx.globalAlpha=a;const x=b.x-(1-a)*14,rt=SRC[i][5]==='REAL-TIME';
    panel(x,b.y,b.w,b.h,8,hexA(COL.bronze,.45),'rgba(205,138,90,.08)');ctx.fillStyle=COL.bronze;ctx.beginPath();ctx.arc(x+14,b.y+20,3,0,TAU);ctx.fill();
    txt(SRC[i][4],x+26,b.y+20,mono(12),COL.ink);txt(SRC[i][5],x+b.w-10,b.y+20,mono(9),rt?COL.cyan:COL.mute,'right')});
  svPos.forEach((v,i)=>{const a=revSv(i)(p);if(a<.01)return;ctx.globalAlpha=a;const x=v.x-(1-a)*14;
    panel(x,v.y,v.w,v.h,8,hexA(COL.silver,.4),'rgba(201,211,222,.06)');
    txt(SRC[i][6],x+14,v.y+20,mono(12),COL.ink);txt('✓',x+v.w-12,v.y+20,sans(800,12),COL.green,'right')});
  gdPos.forEach((g,k)=>{const a=revGd(k)(p);if(a<.01)return;ctx.globalAlpha=a;const x=g.x-(1-a)*14;
    panel(x,g.y,g.w,g.h,12,hexA(COL.gold,.5),'rgba(232,195,106,.07)');
    txt(GOLD[k][0],x+14,g.y+22,sans(800,15),COL.gold);txt(GOLD[k][1],x+14,g.y+40,mono(9),COL.mute);
    const gr=ss(.44+k*.012,.5+k*.012,p);goldBars[k].forEach((h,n)=>{const bh=h*30*gr;ctx.fillStyle=hexA(COL.gold,.35+n*.06);ctx.fillRect(x+14+n*30,g.y+g.h-12-bh,20,bh)})});
  ctx.globalAlpha=1;
  // agents & AI rows
  agPos.forEach((r,i)=>{const a=revAg(i)(p);if(a<.01)return;ctx.globalAlpha=a;const x=r.x-(1-a)*14;
    panel(x,r.y,r.w,r.h,12,'rgba(145,202,255,.24)');
    rr(x+14,r.y+18,36,36,10);ctx.fillStyle='rgba(255,255,255,.07)';ctx.fill();drawIcon(AGENTS[i][0],x+21,r.y+25,22);
    txt(AGENTS[i][1],x+64,r.y+28,sans(800,14),COL.ink);txt(AGENTS[i][2].toUpperCase(),x+64,r.y+48,mono(9),COL.mute);
    ctx.fillStyle=hexA(COL.green,.55+.45*Math.sin(t*.004+i));ctx.beginPath();ctx.arc(x+r.w-18,r.y+r.h/2,3.5,0,TAU);ctx.fill()});
  ctx.globalAlpha=1;

  // where people work: Teams, Dashboards, Copilot chat
  const tmA=revTM(p);
  if(tmA>.01){ctx.globalAlpha=tmA;const X=TM.x,Y=TM.y;
    panel(X,Y,TM.w,TM.h,14,'rgba(145,202,255,.26)','rgba(12,24,42,.97)');
    rr(X,Y,TM.w,30,14);ctx.fillStyle='rgba(6,14,26,.9)';ctx.fill();ctx.fillRect(X,Y+16,TM.w,14);
    ['#ff7b72','#ffc46b','#7ef0c4'].forEach((col,n)=>{ctx.fillStyle=col;ctx.beginPath();ctx.arc(X+16+n*13,Y+15,3.5,0,TAU);ctx.fill()});
    drawIcon('teams',X+TM.w/2-56,Y+7,16);txt('Teams',X+TM.w/2-34,Y+15,mono(10),COL.mute);
    const cx=X+16,cw=TM.w-32;
    txt('Operations',cx,Y+54,sans(800,14),COL.ink);ctx.font=sans(800,14);const ow=ctx.measureText('Operations').width;
    rr(cx+ow+10,Y+45,52,18,9);ctx.fillStyle=hexA(COL.cyan,.14);ctx.fill();txt('AGENT',cx+ow+36,Y+54,mono(9),COL.cyan,'center');
    ctx.fillStyle='rgba(145,202,255,.12)';ctx.fillRect(cx,Y+72,cw,1);
    const m1=ss(.77,.8,p);if(m1>.01){ctx.globalAlpha=tmA*m1;const bw=226,bx=cx+cw-bw,by=Y+88+(1-m1)*10;rr(bx,by,bw,34,12);ctx.fillStyle='rgba(41,120,255,.3)';ctx.fill();txt('Which orders are at risk this week?',bx+12,by+17,sans(600,11.5),COL.ink)}
    const m2=ss(.81,.84,p);if(m2>.01){ctx.globalAlpha=tmA*m2;const by=Y+138+(1-m2)*10;
      rr(cx,by,26,26,8);ctx.fillStyle='rgba(255,255,255,.08)';ctx.fill();drawIcon('copilot',cx+5,by+5,16);
      const bx=cx+34,bw=cw-34;ctx.font=sans(500,11.5);const lines=wrap('Two orders are late against plan. I drafted a reorder for your approval.',bw-24);
      panel(bx,by,bw,34+lines.length*16,12,'rgba(145,202,255,.18)','rgba(20,40,66,.9)');
      txt('Copilot Studio agent',bx+12,by+16,sans(800,11),COL.cyan);lines.forEach((ln,n)=>txt(ln,bx+12,by+34+n*16,sans(500,11.5),COL.ink))}
    const m3=ss(.87,.9,p);if(m3>.01){ctx.globalAlpha=tmA*m3;const bx=cx+34,bw=cw-34,by=Y+238+(1-m3)*10;
      panel(bx,by,bw,96,12,hexA(COL.green,.35),'rgba(20,40,66,.9)');
      drawIcon('power-automate',bx+12,by+10,15);txt('POWER AUTOMATE · APPROVAL',bx+32,by+18,mono(9),COL.green);txt('Approve the reorder?',bx+12,by+42,sans(700,12.5),COL.ink);
      rr(bx+12,by+60,84,24,6);ctx.fillStyle=COL.blue;ctx.fill();txt('Approve',bx+54,by+72,sans(700,11),'#fff','center');
      rr(bx+104,by+60,84,24,6);ctx.strokeStyle='rgba(145,202,255,.4)';ctx.stroke();txt('Review',bx+146,by+72,sans(700,11),COL.ink,'center')}
    ctx.globalAlpha=tmA;rr(cx,Y+TM.h-44,cw,30,9);ctx.strokeStyle='rgba(145,202,255,.2)';ctx.stroke();txt('Ask the agent…',cx+12,Y+TM.h-29,sans(500,11),COL.mute);
    ctx.globalAlpha=1}
  const dbA=revDB(p);
  if(dbA>.01){ctx.globalAlpha=dbA;const X=DB.x,Y=DB.y-(1-dbA)*10;
    panel(X,Y,DB.w,DB.h,14,hexA(COL.gold,.35),'rgba(12,24,42,.97)');
    drawIcon('power-bi',X+14,Y+14,20);txt('Dashboards',X+42,Y+24,sans(800,13.5),COL.ink);txt('POWER BI · SALES · GOLD',X+14,Y+52,mono(9),COL.gold);
    const gr=ss(.82,.88,p),n=dashBars.length,gw=(DB.w-28)/n;
    dashBars.forEach((h,i)=>{const bh=h*120*gr;ctx.fillStyle=hexA(i===5?COL.gold:COL.blue,i===5?.9:.6);ctx.fillRect(X+14+i*gw,Y+DB.h-22-bh,gw*.62,bh)});
    ctx.globalAlpha=1}
  const ccA=revCC(p);
  if(ccA>.01){ctx.globalAlpha=ccA;const X=CC.x,Y=CC.y-(1-ccA)*10;
    panel(X,Y,CC.w,CC.h,14,'rgba(145,202,255,.26)','rgba(12,24,42,.97)');
    drawIcon('m365-copilot',X+14,Y+14,20);txt('Copilot chat',X+42,Y+24,sans(800,13.5),COL.ink);
    ctx.font=sans(600,11.5);const q=wrap('Summarize Customer 360 for this account',CC.w-52);rr(X+CC.w-14-(CC.w-40),Y+46,CC.w-40,14+q.length*16,11);ctx.fillStyle='rgba(41,120,255,.3)';ctx.fill();
    q.forEach((ln,n)=>txt(ln,X+38,Y+62+n*16,sans(600,11.5),COL.ink));
    const an=ss(.88,.94,p);[1,.92,.7,.84,.5].forEach((w,n)=>{rr(X+14,Y+112+n*18,(CC.w-28)*w*an,8,4);ctx.fillStyle='rgba(145,202,255,.22)';ctx.fill()});
    ctx.globalAlpha=ccA*an;txt('SOURCES · CUSTOMER 360 · SHAREPOINT',X+14,Y+CC.h-22,mono(8.5),COL.cyan);
    ctx.globalAlpha=1}

  // fade the world behind the captions
  const wide=W>900,archShown=arch&&arch.offsetParent!==null;
  ctx.setTransform(dpr,0,0,dpr,0,0);ctx.globalCompositeOperation='destination-out';
  const g=wide?ctx.createLinearGradient(R.x-110,0,R.x-6,0):ctx.createLinearGradient(0,R.y+R.h+4,0,R.y+R.h-40);
  g.addColorStop(0,'rgba(0,0,0,1)');g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;
  wide?ctx.fillRect(0,0,R.x,H):ctx.fillRect(0,R.y+R.h-40,W,H);
  ctx.globalCompositeOperation='source-over';ctx.setTransform(dpr*c.s,0,0,dpr*c.s,dpr*c.ox,dpr*c.oy);ctx.textBaseline='middle';
  // 01 · Your data cards: out of the hero panel → lined up as the pipeline's inputs (faded once the camera leaves them)
  const leave=ss(.5,.56,p);
  cards.forEach(cd=>{const i=cd.i,o=i*.008,a=ss(.05+o,.15+o,p);
    const dx=Math.sin(t*.00035*cd.sp+cd.ph)*W*.012,dy=Math.cos(t*.0003*cd.sp+cd.ph)*H*.014;
    const sx=(wide?W*(.42+cd.fx*.46):W*(.06+cd.fx*.7))+dx,sy=(wide?H*(.12+cd.fy*.76):H*(.06+cd.fy*.55))+dy;
    const k0=cwPx*cd.depth/200/c.s,dst=srcPos[i];
    const x=mix((sx-c.ox)/c.s,dst.x+100,a),y=mix((sy-c.oy)/c.s,dst.y+20,a),k=mix(k0,1,a),rot=mix(cd.rot,0,a);
    const al=mix((.3+.6*cd.depth)*(wide?1:.45),1,a)*intro*(1-leave*.85)*(archShown?ss(.03,.09,p):1);if(al<.01)return;
    ctx.save();ctx.globalAlpha=al;ctx.translate(x,y);ctx.rotate(rot);ctx.scale(k,k);srcCard(SRC[i]);ctx.restore()});
  ctx.globalAlpha=1;
}

function setSteps(p){
  const a=[.08,.28,.48,.68].reduce((n,x)=>p>=x?n+1:n,0);
  if(a!==shown){shown=a;steps.forEach((el,i)=>el.classList.toggle('on',i===a));dots.forEach((d,i)=>d.classList.toggle('on',i<=a))}
  if(bar)bar.style.transform=`scaleY(${p})`;
  if(arch){const v=1-ss(.02,.08,p);arch.style.opacity=v;arch.style.transform=`scale(${.94+.06*v})`;arch.style.visibility=v<.01?'hidden':'visible'}
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
redraw=()=>{if(!running)frame(reduce.matches?1:progress,reduce.matches?t0+4000:performance.now())};
addEventListener('resize',()=>{layout();redraw()},{passive:true});
reduce.addEventListener?.('change',()=>location.reload());
document.fonts?.ready.then(redraw);
init();
})();
