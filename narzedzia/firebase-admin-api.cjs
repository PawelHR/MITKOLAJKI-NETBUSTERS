// Narzędzia operatorskie korzystają z istniejącej sesji Firebase CLI.
// Token jest wyłącznie w pamięci. Nie zapisujemy go ani treści odpowiedzi w logach.
const path=require('node:path');
const cli=path.dirname(require.resolve('firebase-tools/package.json'));
const PROJECT='operacja-biegun';
async function session(){
  if(process.env.FIRESTORE_EMULATOR_HOST||process.env.FIREBASE_AUTH_EMULATOR_HOST)throw new Error('EMULATOR_ENV');
  const auth=require(path.join(cli,'lib/auth.js'));
  const account=auth.getProjectDefaultAccount(process.cwd())||auth.getGlobalDefaultAccount();
  if(!account)throw new Error('NO_CLI_LOGIN');
  await require(path.join(cli,'lib/requireAuth.js')).requireAuth({...account,project:PROJECT,nonInteractive:true});
  return require(path.join(cli,'lib/apiv2.js')).getAccessToken();
}
async function client(){
  const token=await session();
  return async function api(service,resource,method='GET',body){
    if(!['firestore','firebaserules','firebasehosting','identitytoolkit'].includes(service))throw new Error('SERVICE_NOT_ALLOWED');
    const response=await fetch(`https://${service}.googleapis.com/${resource}`,{
      method,headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},
      body:body===undefined?undefined:JSON.stringify(body),signal:AbortSignal.timeout(90000)
    });
    if(!response.ok)throw new Error(`API_${service}_${response.status}`);
    return response.json();
  };
}
const encodeName=name=>name.split('/').map(encodeURIComponent).join('/');
module.exports={PROJECT,client,encodeName};
