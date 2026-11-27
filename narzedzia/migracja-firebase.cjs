// Domyślnie tylko plan. Zapis wymaga --apply operacja-biegun i kompletnej kopii.
// node narzedzia/migracja-firebase.cjs <KOPIA> [--apply operacja-biegun | --verify]
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const {PROJECT,client,encodeName}=require('./firebase-admin-api.cjs');
const {STATIONS,decodeFields,encodeFields,migrateTeam,migrateConfig}=require('./migracja-model.cjs');
async function main(){
  const folder=path.resolve(process.argv[2]||''),manifest=JSON.parse(fs.readFileSync(path.join(folder,'manifest.json')));
  if(manifest.project!==PROJECT)throw new Error('WRONG_BACKUP_PROJECT');
  for(const name of ['firestore.json','auth-users.json','firestore-ruleset.json','hosting-version.json','repository.bundle']){
    const digest=crypto.createHash('sha256').update(fs.readFileSync(path.join(folder,name))).digest('hex');
    if(digest!==manifest.files[name]?.sha256)throw new Error('BACKUP_CHECKSUM_FAILED');
  }
  const backup=JSON.parse(fs.readFileSync(path.join(folder,'firestore.json'))),base=`projects/${PROJECT}/databases/(default)/documents`;
  const byName=new Map(backup.documents.map(d=>[d.name,d]));
  const teams=backup.documents.filter(d=>d.name.startsWith(base+'/teams/')&&d.name.slice(base.length+1).split('/').length===2).map(d=>({old:d,...migrateTeam(d)}));
  const members=backup.documents.filter(d=>/^teams\/[^/]+\/members\/[^/]+$/.test(d.name.slice(base.length+1)));
  const writes=[];let awards=0;
  for(const t of teams){
    writes.push({update:{name:t.old.name,fields:t.fields},currentDocument:{updateTime:t.old.updateTime}});
    const publicName=base+'/leaderboard/'+t.id,existing=byName.get(publicName);
    writes.push({update:{name:publicName,fields:t.publicFields},updateTransforms:[{fieldPath:'updatedAt',setToServerValue:'REQUEST_TIME'}],currentDocument:existing?{updateTime:existing.updateTime}:{exists:false}});
    for(const id of STATIONS.filter(id=>t.next.unlocked[id])){
      const name=t.old.name+'/awards/'+id;if(byName.has(name))continue;awards++;
      writes.push({update:{name,fields:encodeFields({by:'migration:firebase-cli',emergency:true,reason:'Migracja wcześniejszego zaliczenia; prywatna kopia wykonana przed wdrożeniem.'})},updateTransforms:[{fieldPath:'at',setToServerValue:'REQUEST_TIME'}],currentDocument:{exists:false}});
    }
  }
  const configName=base+'/config/main',oldConfig=byName.get(configName);
  writes.push({update:{name:configName,fields:migrateConfig(oldConfig,backup.readTime)},currentDocument:oldConfig?{updateTime:oldConfig.updateTime}:{exists:false}});
  if(writes.length>450)throw new Error('ATOMIC_MIGRATION_TOO_LARGE');
  const summary={project:PROJECT,teams:teams.length,preservedMembers:members.length,stationCompletions:teams.reduce((n,t)=>n+Object.keys(t.next.unlocked).length,0),newAuditRecords:awards,atomicWrites:writes.length,registrationOpen:false};
  const apply=process.argv[3]==='--apply'&&process.argv[4]===PROJECT,verify=process.argv[3]==='--verify';
  if(!apply&&!verify){console.log(JSON.stringify({mode:'plan',...summary},null,2));return;}
  const api=await client();
  if(apply){
    if(fs.existsSync(path.join(folder,'migration-result.json')))throw new Error('MIGRATION_ALREADY_RECORDED');
    const result=await api('firestore',`v1/projects/${PROJECT}/databases/(default)/documents:commit`,'POST',{writes});
    fs.writeFileSync(path.join(folder,'migration-result.json'),JSON.stringify({project:PROJECT,commitTime:result.commitTime,...summary},null,2),{flag:'wx',mode:0o600});
  }
  for(const t of teams){
    const actual=await api('firestore',`v1/${encodeName(t.old.name)}`),publicDoc=await api('firestore',`v1/${encodeName(base+'/leaderboard/'+t.id)}`);
    assert.deepEqual(decodeFields(actual.fields),t.next);
    const publicData=decodeFields(publicDoc.fields);
    assert.deepEqual(Object.keys(publicData).sort(),['name','school','unlocked','bonus','updatedAt'].sort());
    assert.deepEqual(publicData.unlocked,t.next.unlocked);assert.equal(publicData.bonus,t.next.bonus);
    assert.equal(publicData.name,t.next.name);assert.equal(publicData.school,t.next.school);
    for(const id of Object.keys(t.next.unlocked))await api('firestore',`v1/${encodeName(t.old.name+'/awards/'+id)}`);
  }
  for(const member of members){const actual=await api('firestore',`v1/${encodeName(member.name)}`);assert.deepEqual(actual.fields,member.fields);}
  const config=decodeFields((await api('firestore',`v1/${encodeName(configName)}`)).fields);
  assert.ok(['break','registration'].includes(config.phase));
  console.log(JSON.stringify({mode:apply?'applied-and-verified':'verified',...summary},null,2));
}
main().catch(error=>{console.error('Migracja zatrzymana: '+(/^[A-Z_0-9]+$/.test(error.message)?error.message:'VERIFICATION_OR_API_FAILED')+'. Zachowaj kopię i nie cofaj bezpiecznych reguł.');process.exitCode=1;});
