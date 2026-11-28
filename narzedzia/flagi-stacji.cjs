// Konfiguracja flag ćwiczeń, bez kasowania lub zmieniania drużyn i wyników.
// Domyślnie plan; <KOPIA> --apply operacja-biegun lub <KOPIA> --verify.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {PROJECT,client,encodeName}=require('./firebase-admin-api.cjs');
async function main(){
  const dir=path.resolve(process.argv[2]||''),manifest=JSON.parse(fs.readFileSync(path.join(dir,'manifest.json')));
  const bytes=fs.readFileSync(path.join(dir,'firestore.json'));
  if(manifest.project!==PROJECT||crypto.createHash('sha256').update(bytes).digest('hex')!==manifest.files['firestore.json']?.sha256)throw new Error('INVALID_BACKUP');
  const source=fs.readFileSync('public/station-flags.js'),{STATION_FLAGS}=await import('data:text/javascript;base64,'+source.toString('base64'));
  const ids=['s1','s2','s3','s4'];if(Object.keys(STATION_FLAGS).sort().join()!==ids.join()||ids.some(id=>!/^[A-Z0-9_-]{4,40}$/.test(STATION_FLAGS[id])))throw new Error('INVALID_FLAGS');
  if(process.argv[3]!=='--verify'&&!(process.argv[3]==='--apply'&&process.argv[4]===PROJECT)){
    console.log(JSON.stringify({mode:'plan',project:PROJECT,flags:ids.length,changesTeams:false,changesPhase:false},null,2));return;
  }
  const api=await client(),base=`projects/${PROJECT}/databases/(default)/documents`,backup=JSON.parse(bytes);
  if(process.argv[3]==='--apply'){
    const target=path.join(dir,'station-flags-setup.json');if(fs.existsSync(target))throw new Error('ALREADY_RECORDED');
    const writes=ids.map(id=>{const name=base+'/stationFlags/'+id,old=backup.documents.find(d=>d.name===name);return {
      update:{name,fields:{value:{stringValue:STATION_FLAGS[id]},active:{booleanValue:true}}},updateTransforms:[{fieldPath:'updatedAt',setToServerValue:'REQUEST_TIME'}],currentDocument:old?{updateTime:old.updateTime}:{exists:false}
    };});
    const result=await api('firestore',`v1/projects/${PROJECT}/databases/(default)/documents:commit`,'POST',{writes});
    fs.writeFileSync(target,JSON.stringify({project:PROJECT,commitTime:result.commitTime,flags:ids.length,sourceSha256:crypto.createHash('sha256').update(source).digest('hex')},null,2),{flag:'wx',mode:0o600});
  }
  for(const id of ids){const d=await api('firestore',`v1/${encodeName(base+'/stationFlags/'+id)}`);if(d.fields.active?.booleanValue!==true||d.fields.value?.stringValue!==STATION_FLAGS[id])throw new Error('FLAG_CONFIG_MISMATCH');}
  console.log(JSON.stringify({mode:'verified',project:PROJECT,flags:ids.length,changesTeams:false,changesPhase:false},null,2));
}
main().catch(error=>{console.error('Konfiguracja flag: '+(/^[A-Z_0-9]+$/.test(error.message)?error.message:'API_OR_VERIFICATION_FAILED'));process.exitCode=1;});
