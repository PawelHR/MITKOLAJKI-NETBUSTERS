// Mały DOM testowy bez dodatkowych bibliotek. Wykonuje prawdziwe funkcje widoków.
const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
class Element {
  constructor(tag){this.tagName=tag.toUpperCase();this.nodeType=1;this.children=[];this.attrs={};this.events={};this.style={};}
  setAttribute(k,v){this.attrs[k]=v;if(k==='value')this.value=v;}
  get disabled(){return 'disabled' in this.attrs;}
  get textContent(){return this.children.map(c=>c.textContent).join('');}
  set textContent(t){this.replaceChildren(t);}
  append(...nodes){for(const n of nodes)this.children.push(n?.nodeType?n:{nodeType:3,textContent:String(n)});}
  prepend(...nodes){const old=this.children;this.children=[];this.append(...nodes,...old);}
  replaceChildren(...nodes){this.children=[];this.append(...nodes);}
  addEventListener(type,fn){this.events[type]=fn;}
  async click(){if(!this.disabled)return this.events.click?.({target:this,currentTarget:this});}
  scrollIntoView(){}
  toString(){return '[object HTMLElement]';}
}
function harness(){
  const app=new Element('div'),network=new Element('div'),storage=new Map();
  const context=vm.createContext({
    document:{createElement:tag=>new Element(tag),createTextNode:text=>({nodeType:3,textContent:text}),getElementById:id=>id==='app'?app:network},
    localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)},
    window:{addEventListener(){}},location:{hash:''},navigator:{onLine:true},console,crypto:require('node:crypto').webcrypto,atob,TextEncoder,TextDecoder,
    PHASES:{},officialPoints:()=>0,stationCount:()=>0,setTimeout,clearTimeout,setInterval,clearInterval,
  });
  const html=fs.readFileSync('public/index.html','utf8');
  const js=html.match(/<script type="module">([\s\S]*?)<\/script>/)[1].replace(/^import .*$/gm,'').replace(/\nboot\(\);\s*$/,'');
  vm.runInContext(js,context);
  vm.runInContext('globalThis.saved=[];saveProgress=async path=>{saved.push(path)}',context);
  const all=el=>[el,...(el.children||[]).flatMap(all)];
  const click=async text=>{const b=all(app).find(x=>x.tagName==='BUTTON'&&x.textContent.includes(text));assert.ok(b,'Przycisk: '+text);assert.equal(b.disabled,false,'Aktywny: '+text);await b.click();};
  const clean=()=>{assert.ok(!app.textContent.includes('[object'));assert.ok(!app.textContent.includes('null'));};
  return {app,context,click,clean,elements:()=>all(app),run:code=>vm.runInContext(code,context)};
}
test('Grand Scam Auto VI: flagi → infostealer → wszystkie zabezpieczenia → odznaka',async()=>{
  const h=harness();h.run('sideVice("p8")');h.clean();
  for(const text of ['Domena gta6','Plik GTA_','Instrukcja: wyłącz','Oceń zagrożenie','Infostealer:']){await h.click(text);h.clean();}
  for(const text of ['Przejdź na czyste','Unieważnij wszystkie','Zmień unikalne','Sprawdź e-mail']){await h.click(text);h.clean();}
  await h.click('Zakończ misję');assert.ok(h.app.textContent.includes('MISSION PASSED – RESPECT +'));assert.ok(h.app.textContent.includes('Vice City Defender'));
  assert.deepEqual(Array.from(h.context.saved),['side.p8']);h.clean();
});
test('ClickFix: zła decyzja daje lekcję, poprawa dopiero zapisuje edukacyjny wynik',async()=>{
  const h=harness();h.run('sideClickFix("p9")');await h.click('Nie jestem robotem');await h.click('Wykonaj instrukcję');
  assert.equal(h.context.saved.length,0);assert.ok(h.app.textContent.includes('Niczego nie uruchomiliśmy'));
  await h.click('Popraw decyzję');assert.deepEqual(Array.from(h.context.saved),['side.p9']);h.clean();
});
test('agent: wykrycie, minimalne uprawnienia, blokada i człowiek wymagane łącznie',async()=>{
  const h=harness();h.run('agentSecurity("p6",app)');h.clean();
  for(const text of ['AGENCIE:','Ogranicz uprawnienia','Zablokuj nieautoryzowaną','Wymagaj zatwierdzenia']){await h.click(text);h.clean();assert.equal(h.context.saved.length,0);}
  await h.click('Uruchom bezpieczny plan');assert.deepEqual(Array.from(h.context.saved),['side.p6']);h.clean();
});
test('SOC: hub ukrywa kod do ukończenia reakcji i blokuje pominięcie dowodów',()=>{
  const h=harness();h.run('S.code="ABCD";S.team={soc:{open:true}};S3={open:true,mail:true,idor:true,logs:true};renderS3Hub()');
  assert.ok(!h.app.textContent.includes('SOC-READY'));assert.ok(!h.app.textContent.includes('5. Reakcja'));assert.ok(h.app.textContent.includes('4. Konsola SOC'));
  h.run('S3.triage=true;renderS3Hub()');assert.ok(h.app.textContent.includes('5. Reakcja'));
  h.run('S3.resp=true;renderS3Hub()');assert.ok(h.app.textContent.includes('SOC-READY'));
  h.run('S3={open:true,mail:true};renderS3Resp()');assert.ok(!h.app.textContent.includes('Sprawdź kolejność'));
});
test('czwarta konsola SOC: korelacja i priorytet, reakcja pozostaje osobno',async()=>{
  const h=harness();h.run('S3={open:true};renderS3Soc()');h.clean();
  await h.click('Zatwierdź analizę');assert.equal(h.context.saved.length,0);
  await h.click('03:12:03');await h.click('03:12:41');
  h.elements().find(e=>e.attrs?.id==='soc-priority').value='high';
  await h.click('Zatwierdź analizę');
  assert.deepEqual(Array.from(h.context.saved),['soc.triage']);assert.ok(h.app.textContent.includes('osobnym etapie 5'));
  assert.ok(!h.app.textContent.includes('SOC-READY'));h.clean();
});
test('odpowiedź skarbca jest spójnym publicznym rekwizytem, nie sekretem',async()=>{
  const h=harness();const demo=await h.run('openSeal("vault|md5|reindeer|d2|upper",V.seal)');
  assert.equal(demo,'RENIFER06');assert.equal(require('node:crypto').createHash('md5').update(demo).digest('hex'),h.run('V.hash'));
  assert.ok(h.run('V.dicts.find(x=>x.id==="reindeer").words.includes("RENIFER")'));
});
