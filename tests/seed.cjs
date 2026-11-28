// Tylko lokalny emulator. Nie łączy się z projektem produkcyjnym.
const {initializeTestEnvironment}=require('@firebase/rules-unit-testing');
const {doc,setDoc,Timestamp}=require('firebase/firestore');
(async()=>{
  const host=process.env.FIRESTORE_EMULATOR_HOST;
  if(host!=='127.0.0.1:8080')throw new Error('Ustaw FIRESTORE_EMULATOR_HOST=127.0.0.1:8080. Skrypt nigdy nie działa na produkcji.');
  const credentials={email:'org@example.test',password:'tylko-emulator-2026',returnSecureToken:true};
  let response=await fetch('http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signUp?key=demo-key',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(credentials)});
  if(!response.ok)response=await fetch('http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=demo-key',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(credentials)});
  const user=await response.json();if(!user.localId)throw new Error('Nie udało się utworzyć konta demonstracyjnego.');
  const env=await initializeTestEnvironment({projectId:'demo-operacja-biegun',firestore:{host:'127.0.0.1',port:8080}});
  const source=require('node:fs').readFileSync('public/station-flags.js');
  const {STATION_FLAGS}=await import('data:text/javascript;base64,'+source.toString('base64'));
  await env.withSecurityRulesDisabled(async c=>{
    const db=c.firestore();await setDoc(doc(db,'admins',user.localId),{role:'organizer'});
    for(const [id,value] of Object.entries(STATION_FLAGS))await setDoc(doc(db,'stationFlags',id),{value,active:true});
    await setDoc(doc(db,'config/main'),{schools:['Szkoła polarna','Szkoła zorzy','Szkoła reniferów'],phase:'registration',mainEndsAt:Timestamp.fromMillis(Date.now()+3600000),rooms:['Lab 1','Lab 2','Lab 3','Lab 4'],rotation:'25 min zadania + 5 min przejścia'});
  });
  await env.cleanup();console.log('Utworzono wyłącznie lokalną konfigurację i konto testowe. Dane logowania są w tests/seed.cjs.');
})().catch(()=>{console.error('Nie udało się przygotować emulatora. Sprawdź lokalne porty i konfigurację.');process.exitCode=1;});
