// Pełna, prywatna kopia przed wdrożeniem. Tylko odczyty Firebase, bez Blaze.
// node narzedzia/kopia-firebase.cjs <NOWY_KATALOG_POZA_REPO>
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const {execFileSync}=require('node:child_process');
const {PROJECT,client,encodeName}=require('./firebase-admin-api.cjs');
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
async function main(){
  if(!process.argv[2])throw new Error('OUTPUT_REQUIRED');
  const out=path.resolve(process.argv[2]),root=path.resolve(__dirname,'..');
  if(out===root||out.startsWith(root+path.sep))throw new Error('BACKUP_MUST_BE_OUTSIDE_REPOSITORY');
  fs.mkdirSync(out,{recursive:true,mode:0o700});
  if(fs.readdirSync(out).length)throw new Error('OUTPUT_NOT_EMPTY');
  const api=await client(),files={},manifest={project:PROJECT,createdAt:new Date().toISOString(),files};
  const save=(name,value)=>{
    const bytes=Buffer.isBuffer(value)?value:Buffer.from(typeof value==='string'?value:JSON.stringify(value,null,2));
    const target=path.join(out,name);fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,bytes,{flag:'wx',mode:0o600});files[name]={sha256:sha(bytes),bytes:bytes.length};
  };
  // Historia, stan roboczy oraz index — niczego nie resetujemy ani nie commitujemy.
  execFileSync('git',['bundle','create',path.join(out,'repository.bundle'),'--all'],{cwd:root,stdio:'pipe'});
  const bundle=fs.readFileSync(path.join(out,'repository.bundle'));files['repository.bundle']={sha256:sha(bundle),bytes:bundle.length};
  save('working-tree.patch',execFileSync('git',['diff','--binary','HEAD'],{cwd:root}));
  save('staged.patch',execFileSync('git',['diff','--cached','--binary'],{cwd:root}));
  const sourceFiles=execFileSync('git',['ls-files','-z','--cached','--others','--exclude-standard'],{cwd:root}).toString().split('\0').filter(Boolean);
  if(fs.existsSync(path.join(root,'SEKRETY.md')))sourceFiles.push('SEKRETY.md');
  for(const name of new Set(sourceFiles))if(fs.statSync(path.join(root,name)).isFile())save('source/'+name,fs.readFileSync(path.join(root,name)));
  // Spójny readTime obejmuje całą bazę, łącznie z podkolekcjami osieroconych dokumentów.
  const base=`projects/${PROJECT}/databases/(default)/documents`,readTime=new Date(Date.now()-2000).toISOString();
  const documents=[],missingParents=[],collections={};let inspected=0;
  async function walk(parent){
    let pageToken;
    do{
      const result=await api('firestore',`v1/${encodeName(parent)}:listCollectionIds`,'POST',{pageSize:100,readTime,...(pageToken?{pageToken}:{})});
      for(const collection of result.collectionIds||[]){
        let nextPageToken;const collectionPath=parent+'/'+collection;collections[collectionPath]=0;
        do{
          const params=new URLSearchParams({pageSize:'300',showMissing:'true',readTime,...(nextPageToken?{pageToken:nextPageToken}:{})});
          const result=await api('firestore',`v1/${encodeName(collectionPath)}?${params}`);
          for(const document of result.documents||[]){
            if(++inspected>10000)throw new Error('BACKUP_DOCUMENT_LIMIT');
            if(document.createTime){documents.push(document);collections[collectionPath]++;}else missingParents.push(document.name);
            await walk(document.name);
          }
          nextPageToken=result.nextPageToken;
        }while(nextPageToken);
      }
      pageToken=result.nextPageToken;
    }while(pageToken);
  }
  await walk(base);save('firestore.json',{project:PROJECT,readTime,documents,missingParents,collections});
  const release=await api('firebaserules',`v1/projects/${PROJECT}/releases/cloud.firestore`);
  save('firestore-release.json',release);save('firestore-ruleset.json',await api('firebaserules',`v1/${release.rulesetName}`));
  const releases=await api('firebasehosting',`v1beta1/sites/${PROJECT}/releases?pageSize=5`);save('hosting-releases.json',releases);
  const active=(releases.releases||[]).find(r=>r.version?.name);if(!active)throw new Error('NO_HOSTING_RELEASE');
  const version=await api('firebasehosting',`v1beta1/${active.version.name}`);save('hosting-version.json',version);
  let pageToken;const hosted=[];
  do{
    const params=new URLSearchParams({pageSize:'1000',...(pageToken?{pageToken}:{})});
    const response=await api('firebasehosting',`v1beta1/${active.version.name}/files?${params}`);
    for(const file of response.files||[]){
      const filePath=file.path.startsWith('/')?file.path:'/'+file.path;
      if(filePath.includes('..')||filePath.includes('\\'))throw new Error('INVALID_HOSTING_PATH');
      const response=await fetch(`https://${PROJECT}.web.app${filePath}`,{signal:AbortSignal.timeout(90000)});
      if(!response.ok)throw new Error('HOSTING_DOWNLOAD_FAILED');
      save('hosting'+filePath,Buffer.from(await response.arrayBuffer()));hosted.push(file);
    }
    pageToken=response.nextPageToken;
  }while(pageToken);
  save('hosting-files.json',hosted);
  const users=[];let nextPageToken;
  do{
    const params=new URLSearchParams({maxResults:'1000',...(nextPageToken?{nextPageToken}:{})});
    const response=await api('identitytoolkit',`v1/projects/${PROJECT}/accounts:batchGet?${params}`);
    users.push(...(response.users||[]));nextPageToken=response.nextPageToken;
  }while(nextPageToken);
  save('auth-users.json',{project:PROJECT,users});
  manifest.counts={documents:documents.length,missingParents:missingParents.length,hostingFiles:hosted.length,authUsers:users.length};
  // Minimalny raport bez treści dokumentów, kodów, e-maili i danych kont.
  manifest.topLevelCollections=Object.fromEntries(Object.entries(collections).filter(([p])=>p.slice(base.length+1).split('/').length===1).map(([p,n])=>[p.slice(base.length+1),n]));
  manifest.hostingVersion=active.version.name;manifest.readTime=readTime;
  for(const [name,meta]of Object.entries(files))if(sha(fs.readFileSync(path.join(out,name)))!==meta.sha256)throw new Error('CHECKSUM_MISMATCH');
  fs.writeFileSync(path.join(out,'manifest.json'),JSON.stringify(manifest,null,2),{flag:'wx',mode:0o600});
  console.log(JSON.stringify({backup:out,verified:true,counts:manifest.counts,collections:manifest.topLevelCollections},null,2));
}
main().catch(error=>{console.error('Kopia nie została ukończona: '+(/^[A-Z_0-9]+$/.test(error.message)?error.message:'BACKUP_FAILED')+'. Nie wdrażaj bez kompletnej kopii.');process.exitCode=1;});
