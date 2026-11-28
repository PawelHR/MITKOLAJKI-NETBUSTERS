const {test,before,after,beforeEach}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {initializeTestEnvironment,assertSucceeds,assertFails}=require('@firebase/rules-unit-testing');
const {doc,collection,getDoc,getDocFromServer,getDocs,setDoc,updateDoc,deleteDoc,writeBatch,runTransaction,serverTimestamp,increment,Timestamp}=require('firebase/firestore');
let env;
const token='a'.repeat(32), id='ABCD';
const team=(uid='alice')=>({name:'Elfy',school:0,createdBy:uid,createdAt:Timestamp.now(),unlocked:{},side:{},soc:{open:true},registrationOpen:true,bonus:0,joinCode:'K7MX4P',memberCount:2});
const pub=t=>({name:t.name,school:t.school,unlocked:t.unlocked,bonus:t.bonus,updatedAt:serverTimestamp()});
const db=uid=>uid?env.authenticatedContext(uid).firestore():env.unauthenticatedContext().firestore();
// Dołączenie jak w aplikacji: członkostwo i licznik w jednym batchu.
function join(uid,code='K7MX4P',member=uid,count=1){const d=db(uid),b=writeBatch(d);b.set(doc(d,'teams',id,'members',member),{nick:uid,joinedAt:serverTimestamp(),joinCode:code});if(count)b.update(doc(d,'teams',id),{memberCount:increment(count)});return b.commit();}
function leave(uid,count=-1){const d=db(uid),b=writeBatch(d);b.delete(doc(d,'teams',id,'members',uid));if(count)b.update(doc(d,'teams',id),{memberCount:increment(count)});return b.commit();}
async function phase(value,expired=false){await env.withSecurityRulesDisabled(async c=>setDoc(doc(c.firestore(),'config/main'),{phase:value,mainEndsAt:Timestamp.fromMillis(Date.now()+(expired?-60000:3600000))}));}
before(async()=>{env=await initializeTestEnvironment({projectId:'demo-operacja-biegun',firestore:{rules:fs.readFileSync('firestore.rules','utf8')}});});
after(async()=>{await env?.cleanup();});
beforeEach(async()=>{
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async c=>{
    const d=c.firestore(),t=team();
    await Promise.all([setDoc(doc(d,'admins/org'),{role:'organizer'}),setDoc(doc(d,'teams',id),t),setDoc(doc(d,'leaderboard',id),pub(t)),
      setDoc(doc(d,'teams',id,'members','alice'),{nick:'A',joinedAt:Timestamp.now()}),
      setDoc(doc(d,'teams',id,'members','bob'),{nick:'B',joinedAt:Timestamp.now()}),
      setDoc(doc(d,'joinCodes/K7MX4P'),{teamId:id,createdAt:Timestamp.now()}),
      ...['s1','s2','s3','s4'].map(s=>setDoc(doc(d,'stationFlags',s),{value:'FLAG_'+s.toUpperCase()+'_TEST',active:true})),
      setDoc(doc(d,'invites',token),{teamId:id,expiresAt:Timestamp.fromMillis(Date.now()+3600000)})]);
  });
  await phase('main');
});
test('izolacja: drużyna i członkowie prywatni, ranking publiczny',async()=>{
  await assertSucceeds(getDoc(doc(db('alice'),'teams',id)));
  for(const who of [null,'eve']){
    await assertFails(getDoc(doc(db(who),'teams',id)));
    await assertFails(getDocs(collection(db(who),'teams',id,'members')));
    await assertSucceeds(getDocs(collection(db(who),'leaderboard')));
  }
  await assertFails(getDocs(collection(db('alice'),'teams')));
});
test('zaproszeń nie da się odczytać ani wylistować; brak PIN-ów w publicznym schemacie',async()=>{
  await assertFails(getDoc(doc(db('eve'),'invites',token)));
  await assertFails(getDocs(collection(db('org'),'invites')));
  await assertFails(setDoc(doc(db('org'),'leaderboard',id),{...pub(team()),pin:'SECRET'}));
  await assertFails(updateDoc(doc(db('org'),'teams',id),{'unlocked.s1':'SECRET'}));
  await env.withSecurityRulesDisabled(c=>updateDoc(doc(c.firestore(),'teams',id),{'unlocked.s1':'OLD-DEMO'}));
  await assertFails(setDoc(doc(db('org'),'leaderboard',id),pub({...team(),unlocked:{s1:'OLD-DEMO'}})));
});
test('starsze zaproszenie nie omija akceptacji; nowy krótki kod ma osobną ścieżkę',async()=>{
  await phase('main');
  const d=db('eve');
  await assertFails(setDoc(doc(d,'teams',id,'members','eve'),{nick:'E',joinedAt:serverTimestamp()}));
  await assertFails(setDoc(doc(d,'teams',id,'requests','eve'),{nick:'E',token:'b'.repeat(32),at:serverTimestamp()}));
  await assertSucceeds(setDoc(doc(d,'teams',id,'requests','eve'),{nick:'E',token,at:serverTimestamp()}));
  await assertFails(getDoc(doc(d,'teams',id)));
  const org=db('org'),b=writeBatch(org); b.set(doc(org,'teams',id,'members','eve'),{nick:'E',joinedAt:serverTimestamp()}); b.delete(doc(org,'teams',id,'requests','eve')); b.update(doc(org,'teams',id),{memberCount:increment(1)});
  await assertSucceeds(b.commit());
  await assertSucceeds(getDoc(doc(d,'teams',id)));
});
test('tworzenie drużyny atomowo z twórcą, krótkim kodem i publiczną projekcją',async()=>{
  await phase('main'); const d=db('new'),t={...team('new'),createdAt:serverTimestamp(),soc:{},joinCode:'NEWK23',memberCount:1};
  await assertFails(setDoc(doc(d,'teams','NEW2'),t));
  const b=writeBatch(d); b.set(doc(d,'teams','NEW2'),t); b.set(doc(d,'teams','NEW2','members','new'),{nick:'N',joinedAt:serverTimestamp()});
  b.set(doc(d,'leaderboard','NEW2'),pub(t));b.set(doc(d,'joinCodes/NEWK23'),{teamId:'NEW2',createdAt:serverTimestamp()});
  await assertSucceeds(b.commit());
});
test('zamknięta rejestracja i cofnięte członkostwo',async()=>{
  await phase('main');
  await assertSucceeds(updateDoc(doc(db('alice'),'teams',id),{registrationOpen:false}));
  await assertFails(setDoc(doc(db('eve'),'teams',id,'requests','eve'),{nick:'E',token,at:serverTimestamp()}));
  await assertSucceeds(updateDoc(doc(db('alice'),'teams',id),{registrationOpen:true}));
  const org=db('org'),b=writeBatch(org); b.set(doc(org,'teams',id,'revoked','bob'),{at:serverTimestamp()});b.delete(doc(org,'teams',id,'members','bob'));b.update(doc(org,'teams',id),{memberCount:increment(-1)});await assertSucceeds(b.commit());
  await assertFails(getDoc(doc(db('bob'),'teams',id)));
  await assertFails(setDoc(doc(db('bob'),'teams',id,'requests','bob'),{nick:'B',token,at:serverTimestamp()}));
  await assertFails(join('bob'));
});
test('uczestnik nie zmieni punktacji, uprawnień ani konfiguracji',async()=>{
  const d=db('alice');
  for(const fields of [{bonus:100},{'unlocked.s1':true},{school:1},{'soc.open':false, 'soc.mail':true}]) await assertFails(updateDoc(doc(d,'teams',id),fields));
  await assertFails(setDoc(doc(d,'leaderboard',id),pub({...team(),bonus:100})));
  await assertFails(setDoc(doc(d,'admins/alice'),{}));
  await assertFails(setDoc(doc(d,'config/main'),{phase:'main',mainEndsAt:Timestamp.now()}));
});
test('jednokrotny zapis zadania, brak cofania postępu',async()=>{
  const r=doc(db('alice'),'teams',id);
  await assertSucceeds(updateDoc(r,{'side.p1':true}));
  await assertFails(updateDoc(r,{'side.p1':true}));
  await assertFails(updateDoc(r,{side:{}}));
});
test('równoczesne transakcje z dwóch telefonów zachowują oba dowody SOC',async()=>{
  async function done(uid,key){const d=db(uid),r=doc(d,'teams',id);return runTransaction(d,async tx=>{await tx.get(r);tx.update(r,{['soc.'+key]:true});});}
  await Promise.all([done('alice','mail'),done('bob','logs')]);
  const s=await getDoc(doc(db('alice'),'teams',id)); assert.equal(s.data().soc.mail,true);assert.equal(s.data().soc.logs,true);
});
test('reakcja SOC dopiero po 4 zadaniach; uczestnik sam rozpoczyna śledztwo',async()=>{
  const r=doc(db('alice'),'teams',id);
  await assertFails(updateDoc(r,{'soc.resp':true}));
  for(const k of ['mail','idor','logs']) await assertSucceeds(updateDoc(r,{['soc.'+k]:true}));
  await assertFails(updateDoc(r,{'soc.resp':true}));
  await assertSucceeds(updateDoc(r,{'soc.triage':true}));
  await assertSucceeds(updateDoc(r,{'soc.resp':true}));
  await env.withSecurityRulesDisabled(c=>updateDoc(doc(c.firestore(),'teams',id),{soc:{}}));
  await assertFails(updateDoc(r,{'soc.mail':true}));
  await assertSucceeds(updateDoc(r,{'soc.open':true}));await assertSucceeds(updateDoc(r,{'soc.mail':true}));
});
test('nowa konsola SOC nie odbiera wcześniej potwierdzonej reakcji',async()=>{
  await env.withSecurityRulesDisabled(c=>updateDoc(doc(c.firestore(),'teams',id),{soc:{open:true,mail:true,idor:true,logs:true,resp:true}}));
  const r=doc(db('alice'),'teams',id);await assertSucceeds(updateDoc(r,{'soc.triage':true}));
  assert.equal((await getDoc(r)).data().soc.resp,true);
});
test('etapy i czas serwera blokują dopisywanie po grze',async()=>{
  for(const p of ['break','final','ended']) {await phase(p);await assertFails(updateDoc(doc(db('alice'),'teams',id),{'side.p1':true}));}
  await phase('main',true);await assertFails(updateDoc(doc(db('alice'),'teams',id),{'soc.mail':true}));
});
async function award(emergency=false,reason=''){
  const d=db('org'),t={...team(),unlocked:{s1:true}},b=writeBatch(d);
  b.update(doc(d,'teams',id),{unlocked:t.unlocked});b.set(doc(d,'leaderboard',id),pub(t));
  b.set(doc(d,'teams',id,'awards','s1'),{by:'org',at:serverTimestamp(),emergency,reason});return b.commit();
}
test('organizator: zaliczenie atomowe, audyt, brak podwójnych punktów',async()=>{
  await assertFails(updateDoc(doc(db('org'),'teams',id),{'unlocked.s1':true}));
  await assertSucceeds(award());await assertFails(award());
  const s=await getDoc(doc(db('alice'),'leaderboard',id));assert.equal(s.data().unlocked.s1,true);
});
test('awaryjne zaliczenie wymaga organizatora i uzasadnienia',async()=>{
  await phase('ended');await assertFails(award());await assertFails(award(true,''));await assertSucceeds(award(true,'Awaria czytnika NFC'));
});
test('bonus wyłącznie organizator w finale',async()=>{
  const d=db('org'),b=()=>{const x=writeBatch(d);x.update(doc(d,'teams',id),{bonus:50});x.set(doc(d,'leaderboard',id),pub({...team(),bonus:50}));return x.commit();};
  await assertFails(b());await phase('final');await assertSucceeds(b());await phase('ended');
  await assertFails(updateDoc(doc(d,'teams',id),{bonus:60}));
});
test('zaproszenie jest związane z drużyną i czasem serwera',async()=>{
  await phase('main');
  await env.withSecurityRulesDisabled(async c=>{
    const f=c.firestore(); // rules-unit-testing 3.x: jedna instancja na kontekst
    await setDoc(doc(f,'teams','EFGH'),team('other'));
    await setDoc(doc(f,'invites','f'.repeat(32)),{teamId:id,expiresAt:Timestamp.fromMillis(Date.now()-60000)});
  });
  const d=db('eve');
  await assertFails(setDoc(doc(d,'teams','EFGH','requests','eve'),{nick:'E',token,at:serverTimestamp()}));
  await assertFails(setDoc(doc(d,'teams',id,'requests','eve'),{nick:'E',token:'f'.repeat(32),at:serverTimestamp()}));
});
test('uczestnik nie może wystawić awaryjnego zaliczenia ani edytować audytu',async()=>{
  const fields={by:'alice',at:serverTimestamp(),emergency:true,reason:'Fałszywe zaliczenie'};
  await assertFails(setDoc(doc(db('alice'),'teams',id,'awards','s1'),fields));
  await assertSucceeds(award());
  await assertFails(updateDoc(doc(db('org'),'teams',id,'awards','s1'),{reason:'Zmiana historii'}));
});
test('wycofany ID nie może odziedziczyć starych członków po usunięciu',async()=>{
  const d=db('org');await assertFails(deleteDoc(doc(d,'teams',id)));
  const b=writeBatch(d);b.set(doc(d,'retiredTeams',id),{at:serverTimestamp()});b.delete(doc(d,'teams',id));b.delete(doc(d,'leaderboard',id));await assertSucceeds(b.commit());
  await phase('main');
  const n=db('new'),t={...team('new'),createdAt:serverTimestamp(),soc:{},memberCount:1},c=writeBatch(n);
  c.set(doc(n,'teams',id),t);c.set(doc(n,'teams',id,'members','new'),{nick:'N',joinedAt:serverTimestamp()});c.set(doc(n,'leaderboard',id),pub(t));
  await assertFails(c.commit());
});
test('krótki kod: natychmiastowe samodzielne dołączenie bez prowadzącego',async()=>{
  await phase('main');const d=db('eve');
  const lookup=await assertSucceeds(getDoc(doc(d,'joinCodes/K7MX4P')));assert.equal(lookup.data().teamId,id);
  await assertFails(getDoc(doc(d,'teams',id)));
  await assertSucceeds(join('eve'));
  await assertSucceeds(getDoc(doc(d,'teams',id)));
  assert.deepEqual((await getDoc(doc(d,'leaderboard',id))).data().unlocked,{});
});
test('kodów nie da się listować, pobrać bez logowania ani dopisać do publicznego rankingu',async()=>{
  await phase('main');
  for(const who of [null,'eve','org'])await assertFails(getDocs(collection(db(who),'joinCodes')));
  await assertFails(getDoc(doc(db(null),'joinCodes/K7MX4P')));
  await assertFails(setDoc(doc(db('org'),'leaderboard',id),{...pub(team()),joinCode:'K7MX4P'}));
});
test('publiczny ID i nieprawidłowy kod nie nadają członkostwa ani nie pozwalają podłączyć kogoś innego',async()=>{
  await phase('main');const d=db('eve');
  for(const code of [id,'WRNG23'])await assertFails(join('eve',code));
  await assertFails(join('eve','K7MX4P','somebody'));
});
test('zamknięta drużyna, koniec wydarzenia i blokada UID obowiązują także przy krótkim kodzie',async()=>{
  const d=db('eve'),joinEve=()=>join('eve');
  await phase('ended');await assertFails(joinEve());await assertFails(getDoc(doc(d,'joinCodes/K7MX4P')));
  await phase('main');await updateDoc(doc(db('alice'),'teams',id),{registrationOpen:false});
  await assertFails(getDoc(doc(d,'joinCodes/K7MX4P')));await assertFails(joinEve());
  await updateDoc(doc(db('alice'),'teams',id),{registrationOpen:true});
  await env.withSecurityRulesDisabled(c=>setDoc(doc(c.firestore(),'teams',id,'revoked','eve'),{at:Timestamp.now()}));
  await assertFails(joinEve());
});
test('twórca może zmienić kod; stary kod przestaje działać bez usuwania członkostw',async()=>{
  await phase('main');const d=db('alice'),b=writeBatch(d);
  b.update(doc(d,'teams',id),{joinCode:'NEXT23'});b.set(doc(d,'joinCodes/NEXT23'),{teamId:id,createdAt:serverTimestamp()});await assertSucceeds(b.commit());
  await assertFails(getDoc(doc(db('eve'),'joinCodes/K7MX4P')));
  await assertFails(join('eve'));
  await assertSucceeds(getDoc(doc(db('eve'),'joinCodes/NEXT23')));await assertSucceeds(getDoc(doc(d,'teams',id)));
  await assertFails(updateDoc(doc(db('bob'),'teams',id),{joinCode:'BADD23'}));
});
test('dwa telefony mogą dołączyć równocześnie, nie nadpisując drużyny ani innych członków',async()=>{
  await phase('main');
  await Promise.all(['eve','zoe'].map(uid=>join(uid)));
  const d=db('alice');assert.equal((await getDocs(collection(d,'teams',id,'members'))).size,4);
  const t=(await getDoc(doc(d,'teams',id))).data();assert.deepEqual(t.unlocked,{});assert.deepEqual(t.soc,{open:true});assert.equal(t.memberCount,4);
});
test('pełny stan misji nadal pozwala zapisać ostatnie zadanie i bonus',async()=>{
  const full={...team(),unlocked:{s1:true,s2:true,s3:true,s4:true},side:Object.fromEntries(Array.from({length:7},(_,i)=>['p'+(i+1),true])),soc:{open:true,mail:true,idor:true,logs:true,triage:true,resp:true}};
  await env.withSecurityRulesDisabled(async c=>{const d=c.firestore();await setDoc(doc(d,'teams',id),full);await setDoc(doc(d,'leaderboard',id),pub(full));});
  await assertSucceeds(updateDoc(doc(db('alice'),'teams',id),{'side.p8':true}));
  await phase('final');const d=db('org'),b=writeBatch(d);b.update(doc(d,'teams',id),{bonus:100});b.set(doc(d,'leaderboard',id),pub({...full,bonus:100}));await assertSucceeds(b.commit());
});
async function flagBatch(uid,station,flag){
  const d=db(uid),snapshot=await getDoc(doc(d,'teams',id)),t=snapshot.data(),next={...t,unlocked:{...t.unlocked,[station]:true}},b=writeBatch(d);
  b.update(doc(d,'teams',id),{unlocked:next.unlocked});b.set(doc(d,'leaderboard',id),pub(next));
  b.set(doc(d,'teams',id,'awards',station),{by:uid,at:serverTimestamp(),emergency:false,reason:'Flaga stacji',flag});return b.commit();
}
test('uczestnik sam zalicza lab poprawną flagą; publicznie tylko status, bez flagi',async()=>{
  await assertSucceeds(flagBatch('alice','s1','FLAG_S1_TEST'));
  const publicDoc=(await getDoc(doc(db(null),'leaderboard',id))).data();assert.deepEqual(publicDoc.unlocked,{s1:true});assert.ok(!JSON.stringify(publicDoc).includes('FLAG_'));
  assert.equal((await getDoc(doc(db('bob'),'teams',id))).data().unlocked.s1,true);
});
test('błędna flaga i flaga z innej stacji nie dają punktów; brak częściowego zapisu',async()=>{
  await assertFails(flagBatch('alice','s1','WRONG_FLAG'));await assertFails(flagBatch('alice','s2','FLAG_S1_TEST'));
  assert.deepEqual((await getDoc(doc(db(null),'leaderboard',id))).data().unlocked,{});
  assert.deepEqual((await getDoc(doc(db('alice'),'teams',id))).data().unlocked,{});
});
test('brak podwójnego zaliczenia flagą oraz zakaz edycji/usunięcia audytu',async()=>{
  await assertSucceeds(flagBatch('alice','s1','FLAG_S1_TEST'));await assertFails(flagBatch('bob','s1','FLAG_S1_TEST'));
  await assertFails(deleteDoc(doc(db('alice'),'teams',id,'awards','s1')));
});
test('poprawna flaga nie omija etapów i czasu serwera',async()=>{
  for(const p of ['break','final','ended']){await phase(p);await assertFails(flagBatch('alice','s1','FLAG_S1_TEST'));}
  await phase('main',true);await assertFails(flagBatch('alice','s1','FLAG_S1_TEST'));
});
test('flagi w bazie nie są odczytywalne ani listowalne przez klientów, także admina',async()=>{
  for(const uid of [null,'alice','eve','org']){await assertFails(getDoc(doc(db(uid),'stationFlags/s1')));await assertFails(getDocs(collection(db(uid),'stationFlags')));}
});
test('dwa telefony wpisujące tę samą flagę równocześnie przyznają tylko jedno zaliczenie',async()=>{
  // Wykonujemy prawdziwą funkcję aplikacji, nie jej testową kopię.
  const html=fs.readFileSync('public/index.html','utf8');
  const source=html.slice(html.indexOf('async function claimStation('),html.indexOf('\nfunction flagCard('));
  async function claim(uid){const context={navigator:{onLine:true},S:{db:db(uid),code:id,user:{uid}},STATIONS:[{id:'s1'}],
    doc,runTransaction,getDocFromServer,serverTimestamp,publicTeam:pub,norm:s=>s.trim().toUpperCase(),denied:e=>e.code==='permission-denied'};
    return new Function(...Object.keys(context),source+'\nreturn claimStation("s1","FLAG_S1_TEST");')(...Object.values(context));}
  await Promise.all([claim('alice'),claim('bob')]);assert.equal((await getDocs(collection(db('alice'),'teams',id,'awards'))).size,1);
  assert.deepEqual((await getDoc(doc(db(null),'leaderboard',id))).data().unlocked,{s1:true});
});
test('wyłączona flaga oraz samo utworzenie audytu bez statusu nie są zaliczeniem',async()=>{
  await env.withSecurityRulesDisabled(c=>updateDoc(doc(c.firestore(),'stationFlags/s1'),{active:false}));await assertFails(flagBatch('alice','s1','FLAG_S1_TEST'));
  await assertFails(setDoc(doc(db('alice'),'teams',id,'awards','s2'),{by:'alice',at:serverTimestamp(),emergency:false,reason:'Flaga stacji',flag:'FLAG_S2_TEST'}));
});
test('usunięte zadanie p9 nie przyjmuje nowych zaliczeń, historia nie blokuje pozostałych',async()=>{
  const r=doc(db('alice'),'teams',id);await assertFails(updateDoc(r,{'side.p9':true}));
  await env.withSecurityRulesDisabled(c=>updateDoc(doc(c.firestore(),'teams',id),{'side.p9':true}));await assertSucceeds(updateDoc(r,{'side.p8':true}));
});
test('cztery flagi różnych labów dają dokładnie cztery statusy i gotowość do finału',async()=>{
  for(const s of ['s1','s2','s3','s4'])await assertSucceeds(flagBatch('alice',s,'FLAG_'+s.toUpperCase()+'_TEST'));
  const result=(await getDoc(doc(db(null),'leaderboard',id))).data();assert.deepEqual(result.unlocked,{s1:true,s2:true,s3:true,s4:true});assert.equal(Object.keys(result.unlocked).length*100,400);
});
test('znajomość flagi nie pozwala osobie spoza drużyny wpisać zaliczenia',async()=>{
  const d=db('eve'),b=writeBatch(d),next={...team(),unlocked:{s1:true}};
  b.update(doc(d,'teams',id),{unlocked:next.unlocked});b.set(doc(d,'leaderboard',id),pub(next));
  b.set(doc(d,'teams',id,'awards','s1'),{by:'eve',at:serverTimestamp(),emergency:false,reason:'Flaga stacji',flag:'FLAG_S1_TEST'});
  await assertFails(b.commit());
});
test('limit 4 osób: piąta odrzucona, odejście zwalnia miejsce',async()=>{
  await phase('main');
  await assertSucceeds(join('eve'));await assertSucceeds(join('zoe'));
  await assertFails(join('max'));
  await assertFails(join('max','K7MX4P','max',0)); // bez licznika też nie
  await assertSucceeds(leave('zoe'));
  await assertSucceeds(join('max'));
  const d=db('alice');assert.equal((await getDocs(collection(d,'teams',id,'members'))).size,4);assert.equal((await getDoc(doc(d,'teams',id))).data().memberCount,4);
});
test('licznika członków nie da się sfałszować',async()=>{
  await phase('main');
  await assertFails(updateDoc(doc(db('eve'),'teams',id),{memberCount:increment(-1)}));
  await assertFails(updateDoc(doc(db('eve'),'teams',id),{memberCount:increment(1)}));
  await assertFails(updateDoc(doc(db('alice'),'teams',id),{memberCount:increment(-1)}));
  await assertFails(updateDoc(doc(db('alice'),'teams',id),{memberCount:0}));
  await assertFails(leave('bob',0)); // odejście bez zwolnienia miejsca
  await assertFails(join('eve','K7MX4P','eve',2));
  await assertFails(updateDoc(doc(db('org'),'teams',id),{memberCount:5}));
  await phase('main');await assertSucceeds(leave('bob'));
});
test('drużyna sprzed limitu: bez licznika nikt nie dołącza, wyjście działa, organizator ustawia licznik',async()=>{
  await phase('main');
  await env.withSecurityRulesDisabled(c=>{const {memberCount,...old}=team();return setDoc(doc(c.firestore(),'teams',id),old);});
  await assertFails(join('eve'));await assertFails(join('eve','K7MX4P','eve',0));
  await assertSucceeds(leave('bob',0));
  const org=db('org'),b=writeBatch(org);b.update(doc(org,'teams',id),{memberCount:1});b.set(doc(org,'leaderboard',id),pub(team()));await assertSucceeds(b.commit());
  await assertSucceeds(join('eve'));
});
test('bez etapu rejestracji: drużyny i osoby dochodzą w grze, przerwie i finale, nie po zakończeniu',async()=>{
  const create=(uid,tid,code)=>{const d=db(uid),t={...team(uid),createdAt:serverTimestamp(),soc:{},joinCode:code,memberCount:1},b=writeBatch(d);
    b.set(doc(d,'teams',tid),t);b.set(doc(d,'teams',tid,'members',uid),{nick:'N',joinedAt:serverTimestamp()});
    b.set(doc(d,'leaderboard',tid),pub(t));b.set(doc(d,'joinCodes',code),{teamId:tid,createdAt:serverTimestamp()});return b.commit();};
  await phase('main');await assertSucceeds(create('m1','MAN2','MANK23'));await assertSucceeds(join('eve'));
  await phase('break');await assertSucceeds(create('b1','BRK2','BRKK23'));await assertSucceeds(join('zoe'));
  await phase('final');await assertSucceeds(create('f1','FIN2','FINK23'));
  await phase('main',true);await assertSucceeds(create('x1','LAT2','LATK23')); // po terminie flag nadal można dołączyć
  await phase('ended');await assertFails(create('e1','END2','ENDK23'));
  await assertFails(setDoc(doc(db('org'),'config/main'),{phase:'registration',mainEndsAt:Timestamp.now()}));
  await assertSucceeds(setDoc(doc(db('org'),'config/main'),{phase:'main',mainEndsAt:Timestamp.now()}));
});
