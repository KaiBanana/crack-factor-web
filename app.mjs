import {predictTarget, validateComposition, balanceComposition} from './inference.mjs';
import {loadModel} from './model-loader.mjs';
const $ = id => document.getElementById(id);
const names = ['凝固区间','凝固裂纹指数','热撕裂敏感性判据','应变时效裂纹指数','γ′ 相含量（900 ℃）','M₆C 最大相含量'];
const english = ['Freezing range · RF','Solidification cracking index · SCI','Hot-tearing susceptibility criterion · HSC','Strain-age cracking index · SAC','γ′ phase fraction at 900 ℃','Maximum M₆C phase fraction'];
const keys = ['RF','SCI','HSC','SAC','gamma_comma_900','M6C_max'];
// Representative IN625 composition within Special Metals' specified ranges,
// using Fe=0 and unlisted trace elements=0 to fit the existing element inputs.
const exampleIN625 = {Cr:21.5,Co:0,Mo:9,W:0,Al:0.2,Ti:0.2,Nb:3.65,Ta:0,B:0,C:0.03,Hf:0,Zr:0};
const format = x => x === 0 ? '0' : x >= 1e6 || x < .0001 ? x.toExponential(3) : Number(x.toPrecision(5)).toString();
let model, busy = false;
function clearResults(){document.querySelectorAll('.result-value').forEach(e=>e.textContent='—');$('state').textContent='等待计算';$('warning').textContent='';}
keys.forEach((key,i)=>{const card=document.createElement('div');card.className='result';card.innerHTML=`<div class="result-label">${names[i]}</div><div class="result-english">${english[i]}</div><div class="result-value" id="result-${key}">—</div>`;$('results').append(card);});
function getValues(){
  const composition = Object.fromEntries(model.elements.filter(e=>e!=='Ni').map(e=>{
    const value=$(`input-${e}`).value;
    return [e,value.trim()===''?NaN:Number(value)];
  }));
  return balanceComposition(model.elements,composition);
}
function updateTotal(){
  clearResults();$('error').textContent='';
  try{
    const values=getValues();$('input-Ni').value=Number(values[model.elements.indexOf('Ni')].toFixed(6));
    $('total').textContent='总含量 100 wt.%';
  }catch(e){$('input-Ni').value='';$('total').textContent='总含量 —';$('error').textContent=e.message;}
}
function setExample(){model.elements.filter(e=>e!=='Ni').forEach(e=>$(`input-${e}`).value=exampleIN625[e]);updateTotal();}
function setBusy(value){
  busy=value;$('submit').disabled=value;$('example').disabled=value;
  document.querySelectorAll('#inputs input').forEach(input=>input.disabled=value);
  $('submit').textContent=value?'正在计算…':'开始计算';
  $('loading').hidden=!value;$('results').hidden=value;
  $('output').setAttribute('aria-busy',String(value));
}
$('example').addEventListener('click',setExample);
$('form').addEventListener('submit',async event=>{
  event.preventDefault();if(busy)return;clearResults();$('error').textContent='';
  try{
    const input=getValues(),outside=validateComposition(model,input);
    setBusy(true);$('state').textContent='正在计算…';
    const started=performance.now();
    const values=model.targets.map(t=>predictTarget(t,input));
    if(values.some(v=>!Number.isFinite(v)))throw new Error('计算未得到有效结果，请检查输入。');
    await new Promise(resolve=>setTimeout(resolve,Math.max(0,10000-(performance.now()-started))));
    model.targets.forEach((t,i)=>$(`result-${t.name}`).textContent=format(values[i]));
    $('state').textContent='计算完成';
    $('warning').textContent=outside.length?`${outside.join('、')} 超出训练数据范围，结果属于外推。`:'';
  }catch(e){$('error').textContent=e.message;$('state').textContent='请检查输入';}
  finally{setBusy(false);}
});
try{
  model=await loadModel();
  $('unit').textContent='wt.%';
  const displayElements=[...model.elements.filter(e=>e!=='Ni'),'Ni'];
  displayElements.forEach(e=>{
    const field=document.createElement('div');field.className='field';const [low,high]=model.ranges[e];
    field.innerHTML=`<label for="input-${e}">${e}<span>${e==='Ni'?'balance':`${format(low)}–${format(high)}`}</span></label><input id="input-${e}" name="${e}" type="number" min="0" max="100" step="any" required inputmode="decimal" value="0" ${e==='Ni'?'readonly aria-label="Ni 余量 balance"':''}>`;
    $('inputs').append(field);if(e!=='Ni')field.querySelector('input').addEventListener('input',updateTotal);
  });
  $('composition-note').textContent='成分单位为 wt.%，Ni 为余量（balance）。';
  setBusy(false);setExample();
}catch(e){$('error').textContent=`${e.message}。请刷新页面重试。`;$('submit').textContent='加载失败';}
