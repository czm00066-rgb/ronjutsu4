import { S4_QUESTIONS } from './questions_s4.js';
const $ = (q, el=document) => el.querySelector(q);
const $$ = (q, el=document) => [...el.querySelectorAll(q)];
function charCount(str){ return [...(str||'')].length; }
function joinAnswer(lines){ return lines.map(s => (s||'').trimEnd()).join('\n'); }
async function copyToClipboard(text){
  try{ await navigator.clipboard.writeText(text); toast('コピーしました'); }
  catch(e){
    const ta=document.createElement('textarea'); ta.value=text; document.body.appendChild(ta);
    ta.select(); document.execCommand('copy'); ta.remove(); toast('コピーしました');
  }
}
let toastTimer=null;
function toast(msg){
  let el=$('#toast');
  if(!el){
    el=document.createElement('div'); el.id='toast';
    el.style.position='fixed'; el.style.left='50%'; el.style.bottom='20px';
    el.style.transform='translateX(-50%)';
    el.style.background='rgba(0,0,0,.75)';
    el.style.border='1px solid rgba(122,167,255,.5)';
    el.style.color='#fff'; el.style.padding='10px 14px';
    el.style.borderRadius='999px'; el.style.zIndex='9999';
    el.style.fontWeight='800'; el.style.backdropFilter='blur(10px)';
    document.body.appendChild(el);
  }
  el.textContent=msg; el.style.display='block';
  clearTimeout(toastTimer); toastTimer=setTimeout(()=>{ el.style.display='none'; },1100);
}

const LINE_LABELS = [
  "① 受容",
  "② 自己理解 ～ 自分を整理する",
  "③ 仕事理解 ～ 仕事を整理する",
  "④ 自分軸で仕事を評価 ～ 自分と仕事のマッチング検討",
  "⑤ 比較検討 ～ 選択肢を具体的に比べる",
  "⑥ 主体的意思決定 ～ 自分で決める"
];

const LINE_PLACEHOLDERS = [
  "〇〇について受容的・共感的に受け止め信頼関係を維持する。",
  "その上で〇〇を整理し自己理解を促す。",
  "〇〇を確認し仕事理解を促す。",
  "〇〇（自己理解）と、〇〇（仕事理解）を、照らし合わせて、〇〇が可能か具体的に比較検討を促す／照合する／すり合わせる／適合性を検討する",
  "Ａ案と、Ｂ案を比較し、判断軸の明確化を促す。",
  "最終的に相談者自身が納得できる目標を設定し主体的に取り組めるよう支援する。"
];

/* tabs */
const tabBtns=$$('.tab');
tabBtns.forEach(btn=>btn.addEventListener('click',()=>{
  tabBtns.forEach(b=>b.classList.remove('active')); btn.classList.add('active');
  const id=btn.dataset.tab; $$('.panel').forEach(p=>p.classList.remove('active'));
  $('#'+id).classList.add('active');
}));
/* input builder */
function buildSixInputs(container,onUpdate){
  container.innerHTML='';
  const arr=[];
  for(let i=0;i<6;i++){
    const box=document.createElement('div');
    box.className='lineinput';
    box.innerHTML=`<div class="linehead"><div class="lno">${i+1}行目</div><div class="lbl">${LINE_LABELS[i]}</div><div class="count"><span data-count>0</span> 文字</div></div>
                   <textarea spellcheck="false" autocapitalize="off" autocomplete="off" placeholder="${LINE_PLACEHOLDERS[i]}"></textarea>`;
    const ta=$('textarea',box); const c=$('[data-count]',box);
    ta.addEventListener('input',()=>{ c.textContent=String(charCount(ta.value)); onUpdate(); });
    container.appendChild(box); arr.push({ta,c});
  }
  return arr;
}
function updateTotal(arr,outEl){
  outEl.textContent=String(arr.reduce((s,x)=>s+charCount(x.ta.value),0));
}
/* practice */
const caseSelect=$('#caseSelect');
const caseEl=$('#caseText');
const modelCard=$('#modelCard');
const modelText=$('#modelText');
const toggleModelBtn=$('#toggleModelBtn');
const copyModelBtn=$('#copyModelBtn');
const clearAnswerBtn=$('#clearAnswerBtn');
const copyAnswerBtn=$('#copyAnswerBtn');
const totalCountEl=$('#totalCount');
const inputsWrap=$('#inputs');

let pIndex=0; let pModelShown=false;
let pInputs=buildSixInputs(inputsWrap,()=>updateTotal(pInputs,totalCountEl));

S4_QUESTIONS.forEach((q,idx)=>{
  const opt=document.createElement('option');
  opt.value=String(idx);
  opt.textContent=`${q.id}｜${q.theme}`;
  caseSelect.appendChild(opt);
});

function loadPractice(i){
  pIndex=i;
  const q=S4_QUESTIONS[pIndex];
  caseEl.textContent=q.case;
  pModelShown=false; modelCard.style.display='none';
  toggleModelBtn.textContent='模範を表示';
  modelText.textContent=q.model.map((l,ii)=>`${ii+1}行目：${l}`).join('\n');
  pInputs.forEach(x=>{ x.ta.value=''; x.c.textContent='0'; });
  updateTotal(pInputs,totalCountEl);
}
caseSelect.addEventListener('change',()=>loadPractice(parseInt(caseSelect.value,10)));

const prevCaseBtn = $('#prevCaseBtn');
const nextCaseBtn = $('#nextCaseBtn');
if (prevCaseBtn && nextCaseBtn){
  prevCaseBtn.addEventListener('click',()=>{
    const cur = parseInt(caseSelect.value,10) || 0;
    const nxt = (cur - 1 + S4_QUESTIONS.length) % S4_QUESTIONS.length;
    caseSelect.value = String(nxt);
    loadPractice(nxt);
  });
  nextCaseBtn.addEventListener('click',()=>{
    const cur = parseInt(caseSelect.value,10) || 0;
    const nxt = (cur + 1) % S4_QUESTIONS.length;
    caseSelect.value = String(nxt);
    loadPractice(nxt);
  });
}

toggleModelBtn.addEventListener('click',()=>{
  pModelShown=!pModelShown;
  modelCard.style.display=pModelShown?'block':'none';
  toggleModelBtn.textContent=pModelShown?'模範をクリア':'模範を表示';
});
copyModelBtn.addEventListener('click',()=>copyToClipboard(joinAnswer(S4_QUESTIONS[pIndex].model)));
clearAnswerBtn.addEventListener('click',()=>{
  pInputs.forEach(x=>{ x.ta.value=''; x.c.textContent='0'; });
  updateTotal(pInputs,totalCountEl);
});
copyAnswerBtn.addEventListener('click',()=>copyToClipboard(joinAnswer(pInputs.map(x=>x.ta.value))));
loadPractice(0);

/* speed10 */
const sProg=$('#sProg');
const sId=$('#sId');
const sCase=$('#sCase');
const sInputsWrap=$('#sInputs');
const sTotal=$('#sTotal');
const sNextBtn=$('#nextBtn');
const sClearBtn=$('#sClearBtn');
const sCopyBtn=$('#sCopyBtn');
const sToggleModelBtn=$('#sToggleModelBtn');
const sModelCard=$('#sModelCard');
const sModelText=$('#sModelText');

let sOrder=[]; let sPos=0; let sModelShown=false;
let sInputs=buildSixInputs(sInputsWrap,()=>updateTotal(sInputs,sTotal));

function shuffle(arr){ const a=arr.slice(); for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }
function resetSpeed10(){
  const idxs=[...Array(S4_QUESTIONS.length)].map((_,i)=>i);
  sOrder=shuffle(idxs).slice(0,10);
  sPos=0;
  loadSpeedItem();
}
function loadSpeedItem(){
  const idx=sOrder[sPos];
  const q=S4_QUESTIONS[idx];
  sProg.textContent=String(sPos+1);
  sId.textContent=`${q.id}｜${q.theme}`;
  sCase.textContent=q.case;
  sModelShown=false; sModelCard.style.display='none';
  sToggleModelBtn.textContent='模範を表示';
  sModelText.textContent=q.model.map((l,ii)=>`${ii+1}行目：${l}`).join('\n');
  sInputs.forEach(x=>{ x.ta.value=''; x.c.textContent='0'; });
  updateTotal(sInputs,sTotal);
}
sNextBtn.addEventListener('click',()=>{
  if(sPos<9){ sPos+=1; loadSpeedItem(); }
  else{ toast('10問完了！シャッフルして再スタート'); resetSpeed10(); }
});
sClearBtn.addEventListener('click',()=>{
  sInputs.forEach(x=>{ x.ta.value=''; x.c.textContent='0'; });
  updateTotal(sInputs,sTotal);
});
sCopyBtn.addEventListener('click',()=>copyToClipboard(joinAnswer(sInputs.map(x=>x.ta.value))));
sToggleModelBtn.addEventListener('click',()=>{
  sModelShown=!sModelShown;
  sModelCard.style.display=sModelShown?'block':'none';
  sToggleModelBtn.textContent=sModelShown?'模範をクリア':'模範を表示';
});
resetSpeed10();
