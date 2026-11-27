// Smoke test tylko odczytowy; opcjonalne otwarcie etapu wymaga jawnego projektu.
// node narzedzia/sprawdz-produkcje.cjs [--open-registration operacja-biegun]
const fs=require('node:fs'),crypto=require('node:crypto');
const {PROJECT,client,encodeName}=require('./firebase-admin-api.cjs');
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
async function main(){
  const origin=`https://${PROJECT}.web.app`;
  const initResponse=await fetch(origin+'/__/firebase/init.json');if(!initResponse.ok)throw new Error('INIT_UNAVAILABLE');
  const init=await initResponse.json();if(init.projectId!==PROJECT||!init.apiKey)throw new Error('WRONG_HOSTING_PROJECT');
  for(const name of ['index.html','core.js','sw.js']){
    const response=await fetch(origin+'/'+name,{headers:{'Cache-Control':'no-cache'}});
    if(!response.ok||hash(Buffer.from(await response.arrayBuffer()))!==hash(fs.readFileSync('public/'+name)))throw new Error('HOSTING_CONTENT_MISMATCH');
  }
  const base=`projects/${PROJECT}/databases/(default)/documents`;
  const get=async resource=>fetch(`https://firestore.googleapis.com/v1/${resource}?key=${encodeURIComponent(init.apiKey)}`);
  const ranking=await get(base+'/leaderboard');if(ranking.status!==200)throw new Error('PUBLIC_RANKING_UNAVAILABLE');
  const data=await ranking.json(),documents=data.documents||[];
  for(const d of documents){
    const keys=Object.keys(d.fields||{}).sort();if(keys.join('|')!==['name','school','unlocked','bonus','updatedAt'].sort().join('|'))throw new Error('PUBLIC_SCHEMA_FAILED');
    for(const value of Object.values(d.fields.unlocked.mapValue.fields||{}))if(value.booleanValue!==true||Object.keys(value).length!==1)throw new Error('PUBLIC_SECRET_OR_STATUS_FAILED');
  }
  const id=documents[0]?.name.split('/').pop()||'ABCD';
  for(const resource of [base+'/teams',base+'/teams/'+id,base+'/teams/'+id+'/members',base+'/invites',base+'/invites/'+'0'.repeat(32),base+'/config/ranking']){
    if((await get(resource)).status!==403)throw new Error('PRIVATE_ACCESS_NOT_DENIED');
  }
  const configResponse=await get(base+'/config/main');if(configResponse.status!==200)throw new Error('PUBLIC_CONFIG_UNAVAILABLE');
  const config=await configResponse.json();let phase=config.fields.phase.stringValue;
  if(process.argv[2]==='--open-registration'&&process.argv[3]===PROJECT){
    if(phase!=='break')throw new Error('EVENT_PHASE_CHANGED');
    const api=await client();
    await api('firestore',`v1/projects/${PROJECT}/databases/(default)/documents:commit`,'POST',{writes:[{
      update:{name:base+'/config/main',fields:{phase:{stringValue:'registration'}}},updateMask:{fieldPaths:['phase']},currentDocument:{updateTime:config.updateTime}
    }]});
    const response=await get(encodeName(base+'/config/main'));const result=await response.json();phase=result.fields?.phase?.stringValue;
    if(phase!=='registration')throw new Error('REGISTRATION_NOT_CONFIRMED');
  }
  console.log(JSON.stringify({project:PROJECT,url:origin,hostingMatchesLocal:true,publicRankingDocuments:documents.length,privateAccessDenied:true,phase},null,2));
}
main().catch(error=>{console.error('Weryfikacja produkcji: '+(/^[A-Z_0-9]+$/.test(error.message)?error.message:'REQUEST_FAILED'));process.exitCode=1;});
