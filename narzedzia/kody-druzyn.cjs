// Uzupełnienie istniejących drużyn krótkimi kodami, po wykonaniu nowej kopii.
// Domyślnie plan. Zapis: <KOPIA> --apply operacja-biegun [--open-existing].
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const {PROJECT,client,encodeName}=require('./firebase-admin-api.cjs');
const {encodeFields}=require('./migracja-model.cjs');
const ALPH='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const randomCode=()=>[...crypto.randomBytes(6)].map(b=>ALPH[b&31]).join('');
async function main(){
  const dir=path.resolve(process.argv[2]||''),manifest=JSON.parse(fs.readFileSync(path.join(dir,'manifest.json')));
  const bytes=fs.readFileSync(path.join(dir,'firestore.json'));
  if(manifest.project!==PROJECT||crypto.createHash('sha256').update(bytes).digest('hex')!==manifest.files['firestore.json']?.sha256)throw new Error('INVALID_BACKUP');
  const backup=JSON.parse(bytes),base=`projects/${PROJECT}/databases/(default)/documents`,taken=new Set();
  const teams=backup.documents.filter(d=>/^teams\/[^/]+$/.test(d.name.slice(base.length+1)));
  const members=backup.documents.filter(d=>/^teams\/[^/]+\/members\/[^/]+$/.test(d.name.slice(base.length+1)));
  const publicDocs=backup.documents.filter(d=>/^leaderboard\/[^/]+$/.test(d.name.slice(base.length+1)));
  const open=process.argv.includes('--open-existing'),writes=[],codes=[];
  for(const t of teams){
    if(t.fields.joinCode?.stringValue){taken.add(t.fields.joinCode.stringValue);continue;}
    let code;do{code=randomCode();}while(taken.has(code));taken.add(code);
    const id=t.name.split('/').pop();codes.push({teamId:id,code});
    writes.push({update:{name:t.name,fields:{joinCode:{stringValue:code},...(open?{registrationOpen:{booleanValue:true}}:{})}},updateMask:{fieldPaths:['joinCode',...(open?['registrationOpen']:[])]},currentDocument:{updateTime:t.updateTime}});
    writes.push({update:{name:base+'/joinCodes/'+code,fields:encodeFields({teamId:id})},updateTransforms:[{fieldPath:'createdAt',setToServerValue:'REQUEST_TIME'}],currentDocument:{exists:false}});
  }
  const summary={project:PROJECT,teams:teams.length,newCodes:codes.length,existingMemberships:members.length,opensExisting:open,atomicWrites:writes.length};
  if(process.argv[3]!=='--apply'||process.argv[4]!==PROJECT){console.log(JSON.stringify({mode:'plan',...summary},null,2));return;}
  if(!writes.length||writes.length>450)throw new Error('NO_CHANGES_OR_TOO_MANY_WRITES');
  const record=path.join(dir,'join-codes-migration.json');if(fs.existsSync(record))throw new Error('MIGRATION_ALREADY_RECORDED');
  const api=await client();
  const config=await api('firestore',`v1/${encodeName(base+'/config/main')}`);if(config.fields.phase?.stringValue!=='registration')throw new Error('REGISTRATION_REQUIRED');
  const current=await api('firestore',`v1/${encodeName(base+'/teams')}?pageSize=300`);
  if((current.documents||[]).some(d=>!teams.some(t=>t.name===d.name)&&!d.fields?.joinCode?.stringValue))throw new Error('NEW_TEAM_REQUIRES_FRESH_BACKUP');
  const result=await api('firestore',`v1/projects/${PROJECT}/databases/(default)/documents:commit`,'POST',{writes});
  fs.writeFileSync(record,JSON.stringify({...summary,codes,commitTime:result.commitTime},null,2),{flag:'wx',mode:0o600});
  for(const t of teams){
    const actual=await api('firestore',`v1/${encodeName(t.name)}`),code=codes.find(c=>c.teamId===t.name.split('/').pop())?.code;
    if(code){
      assert.equal(actual.fields.joinCode.stringValue,code);
      const expected={...t.fields,joinCode:{stringValue:code},...(open?{registrationOpen:{booleanValue:true}}:{})};assert.deepEqual(actual.fields,expected);
      const lookup=await api('firestore',`v1/${encodeName(base+'/joinCodes/'+code)}`);assert.equal(lookup.fields.teamId.stringValue,t.name.split('/').pop());
    }
  }
  for(const d of [...members,...publicDocs])assert.deepEqual((await api('firestore',`v1/${encodeName(d.name)}`)).fields,d.fields);
  console.log(JSON.stringify({mode:'applied-and-verified',...summary,publicResultsUnchanged:true,membershipsUnchanged:true},null,2));
}
main().catch(error=>{console.error('Aktualizacja kodów zatrzymana: '+(/^[A-Z_0-9]+$/.test(error.message)?error.message:'API_OR_VERIFICATION_FAILED'));process.exitCode=1;});
