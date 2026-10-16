import {balanceComposition, predictTarget} from './inference.mjs';
import {referenceAlloys} from './reference-alloys.mjs';

const specs = [
  {title:'凝固区间 × SAC', x:'SAC × 10³', y:'凝固区间 RF (℃)', xi:0, yi:1, xm:1000},
  {title:'γ′ 相含量 × SAC', x:'SAC × 10³', y:'γ′ 相含量 (900 ℃)', xi:0, yi:2, xm:1000},
  {title:'合金元素组合', x:'Al (wt.%)', y:'0.5W + 0.3Nb + 0.15Ta (wt.%)', xi:3, yi:4, xm:1},
  {title:'凝固区间 × γ′ 相含量', x:'γ′ 相含量 (900 ℃)', y:'凝固区间 RF (℃)', xi:2, yi:1, xm:1}
];
const fmt = v => Number(v.toPrecision(4)).toString();
const nice = v => {const step=Math.pow(10,Math.floor(Math.log10(Math.max(v,1e-9))));const n=v/step;return (n<=1?1:n<=1.5?1.5:n<=2?2:n<=2.5?2.5:n<=5?5:10)*step;};
const q = (values,p) => {const a=values.filter(Number.isFinite).sort((x,y)=>x-y);return a[Math.floor((a.length-1)*p)]??0;};
const rowFor = (alloy,model) => {
  const input=balanceComposition(model.elements,Object.fromEntries(model.elements.filter(e=>e!=='Ni').map(e=>[e,alloy.composition[e]??0])));
  const pred=Object.fromEntries(model.targets.map(t=>[t.name,predictTarget(t,input)]));
  return {name:alloy.name,row:[pred.SAC,pred.RF,pred.gamma_comma_900,alloy.composition.Al??0,
    .5*(alloy.composition.W??0)+.3*(alloy.composition.Nb??0)+.15*(alloy.composition.Ta??0)]};
};

export async function initCharts(model){
  const chartData=await (await fetch('./chart-data.json')).json();
  const background=chartData.points;
  const references=referenceAlloys.map(a=>rowFor(a,model));
  const base=specs.map(s=>({
    x:s.xi===2?1:nice(Math.max(q(background.map(r=>r[s.xi]*s.xm),.85),...references.map(a=>a.row[s.xi]*s.xm))*1.06),
    y:s.yi===2?1:nice(Math.max(q(background.map(r=>r[s.yi]),.85),...references.map(a=>a.row[s.yi]))*1.06)
  }));
  const host=document.getElementById('charts');
  host.querySelector('.chart-loading')?.remove();
  const cards=specs.map((spec,i)=>{
    const card=document.createElement('section');card.className='chart-card';
    card.innerHTML=`<h3>${spec.title}</h3><div class="chart-frame"><canvas role="img" aria-label="${spec.title}，灰色为已有热力学计算，黑点为参考合金，红点为本次计算"></canvas><div class="chart-tooltip" hidden></div></div><p class="chart-axis-x">${spec.x}</p>`;
    host.append(card);
    return {canvas:card.querySelector('canvas'),tooltip:card.querySelector('.chart-tooltip'),frame:card.querySelector('.chart-frame'),spec,base:base[i]};
  });
  let current=null;
  function render(){
    cards.forEach(({canvas,tooltip,frame,spec,base})=>{
      const width=frame.clientWidth,height=Math.max(265,Math.round(width*.74));
      canvas.style.width=`${width}px`;canvas.style.height=`${height}px`;
      const dpr=window.devicePixelRatio||1;canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);
      const ctx=canvas.getContext('2d');ctx.scale(dpr,dpr);
      const p={left:52,right:15,top:15,bottom:32},w=width-p.left-p.right,h=height-p.top-p.bottom;
      const cx=r=>r[spec.xi]==null?null:r[spec.xi]*spec.xm, cy=r=>r[spec.yi];
      const xmax=current?nice(Math.max(base.x,cx(current.row)*1.08)):base.x;
      const ymax=current?nice(Math.max(base.y,cy(current.row)*1.08)):base.y;
      const X=v=>p.left+w*v/xmax,Y=v=>p.top+h*(1-v/ymax);
      ctx.fillStyle='#fff';ctx.fillRect(0,0,width,height);
      ctx.font='11px system-ui';ctx.textBaseline='middle';
      for(let j=0;j<=4;j++){
        const vx=xmax*j/4,vy=ymax*j/4;
        ctx.strokeStyle='#edf0f2';ctx.lineWidth=1;
        ctx.beginPath();ctx.moveTo(X(vx),p.top);ctx.lineTo(X(vx),p.top+h);ctx.moveTo(p.left,Y(vy));ctx.lineTo(p.left+w,Y(vy));ctx.stroke();
        ctx.fillStyle='#75828a';ctx.textAlign='center';ctx.fillText(fmt(vx),X(vx),height-16);
        ctx.textAlign='right';ctx.fillText(fmt(vy),p.left-7,Y(vy));
      }
      ctx.strokeStyle='#9aa7ae';ctx.strokeRect(p.left,p.top,w,h);
      ctx.save();ctx.beginPath();ctx.rect(p.left,p.top,w,h);ctx.clip();
      ctx.fillStyle='rgba(116,125,133,.20)';
      for(const row of background){const x=cx(row),y=cy(row);if(x==null||y==null||x<0||y<0||x>xmax||y>ymax)continue;
        ctx.beginPath();ctx.arc(X(x),Y(y),1.45,0,Math.PI*2);ctx.fill();}
      ctx.restore();
      const placed=[];const markers=[];
      for(const ref of references){
        const x=X(cx(ref.row)),y=Y(cy(ref.row));if(x<p.left||x>p.left+w||y<p.top||y>p.top+h)continue;
        ctx.fillStyle='#233745';ctx.beginPath();ctx.arc(x,y,4.2,0,Math.PI*2);ctx.fill();
        markers.push({x,y,name:ref.name,row:ref.row});
        ctx.font='10px system-ui';const tw=ctx.measureText(ref.name).width+8;
        const opts=[[x+7,y-9],[x+7,y+13],[x-tw-7,y-9],[x-tw-7,y+13],[x+7,y-22],[x-tw-7,y+24]];
        const spot=opts.find(([tx,ty])=>tx>p.left+2&&tx+tw<width-2&&ty>p.top+5&&ty<height-p.bottom-2&&placed.every(b=>tx>b.x+b.w||tx+tw<b.x||ty>b.y+13||ty+13<b.y));
        if(spot){const [tx,ty]=spot;placed.push({x:tx,y:ty-6,w:tw});ctx.fillStyle='#273a46';ctx.textAlign='left';ctx.fillText(ref.name,tx,ty);}
      }
      if(current){const x=X(cx(current.row)),y=Y(cy(current.row));
        ctx.fillStyle='#d83c3c';ctx.strokeStyle='#fff';ctx.lineWidth=2.5;ctx.beginPath();ctx.arc(x,y,7,0,Math.PI*2);ctx.fill();ctx.stroke();
        markers.push({x,y,name:'本次合金',row:current.row});
      }
      ctx.save();ctx.translate(14,p.top+h/2);ctx.rotate(-Math.PI/2);ctx.fillStyle='#536570';ctx.textAlign='center';ctx.font='10px system-ui';ctx.fillText(spec.y,0,0);ctx.restore();
      canvas.onmousemove=e=>{const rect=canvas.getBoundingClientRect(),mx=e.clientX-rect.left,my=e.clientY-rect.top;
        const hit=markers.find(m=>Math.hypot(m.x-mx,m.y-my)<12);
        if(!hit){tooltip.hidden=true;return;}
        tooltip.textContent=`${hit.name} · ${spec.x}: ${fmt(cx(hit.row))} · ${spec.y}: ${fmt(cy(hit.row))}`;
        tooltip.style.left=`${Math.min(mx+12,width-210)}px`;tooltip.style.top=`${Math.max(4,my-34)}px`;tooltip.hidden=false;};
      canvas.onmouseleave=()=>tooltip.hidden=true;
    });
  }
  new ResizeObserver(render).observe(host);
  render();
  return row=>{current=row?{row}:null;render();};
}
