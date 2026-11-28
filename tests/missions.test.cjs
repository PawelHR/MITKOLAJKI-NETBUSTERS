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
  const flags=vm.runInNewContext(fs.readFileSync('public/station-flags.js','utf8').replace(/^export /gm,'')+'\nSTATION_FLAGS;');
  const context=vm.createContext({
    document:{createElement:tag=>new Element(tag),createTextNode:text=>({nodeType:3,textContent:text}),getElementById:id=>id==='app'?app:network},
    localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)},
    window:{addEventListener(){}},location:{hash:''},navigator:{onLine:true},console,crypto:require('node:crypto').webcrypto,atob,TextEncoder,TextDecoder,
    STATION_FLAGS:flags,PHASES:{},officialPoints:()=>0,stationCount:()=>0,setTimeout,clearTimeout,setInterval,clearInterval,
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
test('usunięto ClickFix, w grze jest 8 zadań pobocznych i 210 pkt edukacyjnych',()=>{
  const h=harness();assert.equal(h.run('typeof sideClickFix'),'undefined');
  assert.equal(h.run('SIDE.length'),8);assert.equal(h.run('SIDE.reduce((n,s)=>n+s.max,0)'),210);
  assert.equal(h.run('SIDE.some(s=>s.id==="p9")'),false);
});
test('agent: wykrycie, minimalne uprawnienia, blokada i człowiek wymagane łącznie',async()=>{
  const h=harness();h.run('agentSecurity("p6",app)');h.clean();
  for(const text of ['AGENCIE:','Ogranicz uprawnienia','Zablokuj nieautoryzowaną','Wymagaj zatwierdzenia']){await h.click(text);h.clean();assert.equal(h.context.saved.length,0);}
  await h.click('Uruchom bezpieczny plan');assert.deepEqual(Array.from(h.context.saved),['side.p6']);h.clean();
});
test('SOC: hub ukrywa kod do ukończenia reakcji i blokuje pominięcie dowodów',()=>{
  const h=harness();h.run('S.code="ABCD";S.team={soc:{open:true}};S3={open:true,mail:true,idor:true,logs:true};renderS3Hub()');
  const flag=h.run('STATION_FLAGS.s3');assert.ok(!h.app.textContent.includes(flag));assert.ok(!h.app.textContent.includes('5. Reakcja'));assert.ok(h.app.textContent.includes('4. North Pole SIEM'));
  h.run('S3.triage=true;renderS3Hub()');assert.ok(h.app.textContent.includes('5. Reakcja'));
  h.run('S3.resp=true;renderS3Hub()');assert.ok(h.app.textContent.includes(flag));assert.ok(h.app.textContent.includes('Wpisz flagę w labie 3'));
  h.run('S3={open:true,mail:true};renderS3Resp()');assert.ok(!h.app.textContent.includes('Sprawdź kolejność'));
});
const submit=async(h,text)=>{const f=h.elements().find(e=>e.tagName==='FORM'&&e.textContent.includes(text));assert.ok(f,'Formularz: '+text);await f.events.submit({preventDefault(){}});};
test('SIEM: zapytania pole:wartość, wykluczenia i błędne pole',()=>{
  const h=harness();
  assert.equal(h.run('siemSearch("user:admin result:FAIL").length'),418);
  assert.equal(h.run('siemSearch("result:FAIL -ip:185.*").length'),4);
  assert.equal(h.run('siemSearch("user:admin result:OK action:LOGIN")[0].time'),'03:12:03');
  assert.equal(h.run('siemSearch("session:S-7731").length'),5);
  assert.ok(h.run('siemSearch("object:list*").some(e=>e.user==="backup_elf")'),'kopia zapasowa jest dystraktorem');
  assert.throws(()=>h.run('siemSearch("haslo:x")'),/Nieznane pole/);
  assert.equal(h.run('SIEM.alerts.length'),7);
});
test('SIEM: złe zgłoszenie bez PIN-u, poprawne daje PIN akceptowany przez telefon',async()=>{
  const h=harness();h.run('siemReset()');h.clean();
  assert.ok(h.app.textContent.includes('NORTH POLE SIEM'));
  h.run('["a4","a5","a6","a2"].forEach(id=>SV.picked.add(id));Object.assign(SV.form,{ip:"185.220.101.7",user:"admin",time:"03:12:03",session:"S-7731",priority:"high"})');
  await submit(h,'Zgłoszenie incydentu');assert.equal(h.run('SV.pin'),null);assert.ok(h.app.textContent.includes('1 z 6'));
  h.run('SV.picked.delete("a2")');await submit(h,'Zgłoszenie incydentu');
  const pin=h.run('SV.pin');assert.match(pin,/^\d{6}$/);assert.ok(h.app.textContent.includes(pin));h.clean();
  h.run('S3={open:true,mail:true,idor:true,logs:true};renderS3Soc()');
  const input=()=>h.elements().find(e=>e.attrs?.id==='siem-pin');
  input().value='000000';await submit(h,'PIN incydentu');assert.equal(h.context.saved.length,0);
  input().value=pin.slice(0,3)+' '+pin.slice(3);await submit(h,'PIN incydentu');
  assert.deepEqual(Array.from(h.context.saved),['soc.triage']);assert.ok(h.app.textContent.includes('etapie 5'));
  assert.ok(!h.app.textContent.includes(h.run('STATION_FLAGS.s3')));h.clean();
});
test('odpowiedź skarbca jest spójnym publicznym rekwizytem, nie sekretem',async()=>{
  const h=harness();const demo=await h.run('openSeal("vault|md5|reindeer|d2|upper",V.seal)');
  assert.equal(demo,'RENIFER06');assert.equal(require('node:crypto').createHash('md5').update(demo).digest('hex'),h.run('V.hash'));
  assert.equal(demo,h.run('STATION_FLAGS.s2'));
  assert.ok(h.run('V.dicts.find(x=>x.id==="reindeer").words.includes("RENIFER")'));
});
test('lab ma formularz flagi bez obowiązkowej akceptacji prowadzącego',()=>{
  const h=harness();h.run('S.team={unlocked:{}};S.code="ABCD";S.config={phase:"main",mainEndsAt:{toMillis:()=>Date.now()+60000}};renderStation(STATIONS[0])');
  assert.ok(h.app.textContent.includes('Zalicz lab flagą'));assert.ok(h.app.textContent.includes('Nie trzeba czekać na prowadzącego'));
  assert.ok(h.elements().some(e=>e.attrs?.id==='station-flag'));assert.ok(!h.app.textContent.includes(h.run('STATION_FLAGS.s1')));
});
test('wyścig flag: odmowa nie jest sukcesem bez potwierdzenia z serwera',async()=>{
  const h=harness();Object.assign(h.context,{doc:()=>({}),runTransaction:async()=>{throw {code:'permission-denied'};}});
  h.run('S.code="ABCD";S.user={uid:"alice"}');
  let reads=0;
  h.context.getDocFromServer=async()=>{reads++;return {id:'ABCD',exists:()=>true,data:()=>({unlocked:{}})};};
  await assert.rejects(h.run('claimStation("s1","WRONG")'),e=>e.code==='permission-denied');assert.equal(reads,1);
  h.context.getDocFromServer=async()=>{throw {code:'unavailable'};};
  await assert.rejects(h.run('claimStation("s1","FLAG")'),e=>e.code==='unavailable');
  h.context.getDocFromServer=async()=>({id:'ABCD',exists:()=>true,data:()=>({unlocked:{s1:true}})});
  await h.run('claimStation("s1","FLAG")');assert.equal(h.run('S.team.unlocked.s1'),true);
  h.context.navigator.onLine=false;await assert.rejects(h.run('claimStation("s1","FLAG")'),e=>e.message==='offline');
});
test('czytnik pokazuje flagę labu 4 tylko po zgodnym UID (atrapa Web NFC)',async()=>{
  const h=harness();let reader;
  class Reader{constructor(){reader=this;}async scan(){}}
  Object.assign(h.context,{NDEFReader:Reader,AbortController,setTimeout:()=>1,clearTimeout:()=>{}});h.context.window.NDEFReader=Reader;
  h.run('ls.set("ob_door",JSON.stringify({uid:"AABBCC"}));renderDoor()');
  const flag=h.run('STATION_FLAGS.s4');assert.ok(!h.app.textContent.includes(flag));
  await h.click('Uruchom czytnik');reader.onreading({serialNumber:'11:22:33'});assert.ok(!h.app.textContent.includes(flag));
  reader.onreading({serialNumber:'AA:BB:CC'});assert.ok(h.app.textContent.includes(flag));assert.ok(h.app.textContent.includes('DOSTĘP PRZYZNANY'));
  assert.equal(h.context.saved.length,0);h.clean();
});
test('interfejs dołączania: jeden krótki kod, brak zaproszenia i ekranu akceptacji',()=>{
  const h=harness();h.run('S.config={phase:"registration"};renderJoin()');
  assert.ok(h.app.textContent.includes('Kod drużyny (6 znaków)'));assert.ok(h.app.textContent.includes('od razu dołączasz'));
  assert.ok(!h.app.textContent.includes('Oczekiwanie na prowadzącego'));assert.ok(!h.app.textContent.includes('Sekretne zaproszenie'));
  assert.equal(h.elements().find(e=>e.attrs?.id==='j-code').attrs.maxlength,'12');
});
test('skarbiec: sól różnicuje hashe tego samego hasła, bcrypt opisany jako starsza alternatywa',async()=>{
  const h=harness();const card=h.run('vaultSaltCard()');await new Promise(r=>setTimeout(r,50));
  const cells=[];const walk=e=>{if(e.tagName==='TD')cells.push(e.textContent);(e.children||[]).forEach(walk);};walk(card);
  assert.equal(cells[1],cells[5],'bez soli identyczne');assert.notEqual(cells[3],cells[7],'z solą różne');
  const html=require('node:fs').readFileSync('public/index.html','utf8');
  assert.ok(html.includes('nie jest funkcją pamięciożerną tego rodzaju co Argon2id'));assert.ok(!html.includes('„pamięciożerną”: bcrypt'));
});
test('skarbiec: projekt zabezpieczeń — tylko passkey wytrzymuje wszystkie ataki',async()=>{
  const h=harness();const card=h.run('globalThis.c=vaultDesignCard();app.replaceChildren(c);c');
  const scores={};
  for(const name of ['Samo hasło','Hasło + kod SMS','Hasło + aplikacja','Passkey']){await h.click(name);scores[name]=h.app.textContent.match(/wytrzymane ataki: (\d)\/5/)[1];}
  assert.deepEqual(scores,{'Samo hasło':'0','Hasło + kod SMS':'3','Hasło + aplikacja':'4','Passkey':'5'});
  await h.click('Porównaj wszystkie');assert.ok(h.app.textContent.includes('SIM swap'));h.clean();
});
