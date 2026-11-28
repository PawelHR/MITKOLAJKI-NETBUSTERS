// Rekwizyty symulatorów. Odzyskane hasło jest flagą labu 2; PIN SIEM zalicza zadanie 4 stacji 3.
// Nie jest to hasło do prawdziwego konta ani silne zabezpieczenie przed kopiowaniem.
// Publiczny materiał klucza umożliwia odszyfrowanie każdemu. AES tego nie zmienia.
// Uruchom: node narzedzia/szyfruj-odpowiedzi.js
// Brak argumentów z sekretami (nie trafiają do historii powłoki ani logów).
const c = require('node:crypto');
if (process.argv.length !== 2) {
  console.error('Nie podawaj sekretów. Skrypt obsługuje wyłącznie wbudowany rekwizyt demonstracyjny.');
  process.exit(1);
}
const demo = ['RENIFER','06'].join(''); // jawna odpowiedź i flaga zadania; nie sekret konta
const key = c.createHash('sha256').update('biegun26|vault|md5|reindeer|d2|upper').digest();
const iv = c.randomBytes(12);
const cipher = c.createCipheriv('aes-256-gcm',key,iv);
const ct = Buffer.concat([cipher.update(demo,'utf8'),cipher.final()]);
const seal=(material,text)=>{const k=c.createHash('sha256').update('biegun26|'+material).digest(),v=c.randomBytes(12),x=c.createCipheriv('aes-256-gcm',k,v);
  return Buffer.concat([v,x.update(text,'utf8'),x.final(),x.getAuthTag()]).toString('base64');};
const sha=s=>c.createHash('sha256').update(s).digest('hex');
// Stacja 3: PIN z symulatora SIEM. Jawny rekwizyt ćwiczenia, odszyfrowany poprawnym zgłoszeniem incydentu.
const siemPin=['481','927'].join('');
const siem={alerts:'a4,a5,a6',ip:'185.220.101.7',user:'admin',time:'03:12:03',session:'S-7731',priority:'high'};
console.log(JSON.stringify({
  vault:{hash:c.createHash('md5').update(demo).digest('hex'),seal:Buffer.concat([iv,ct,cipher.getAuthTag()]).toString('base64')},
  siem:{seal:seal('siem|'+Object.values(siem).join('|'),siemPin),pinHash:sha('siem-pin|'+siemPin),
    hints:Object.fromEntries(Object.entries(siem).map(([k,v])=>[k,sha(k+'|'+v)]))}
},null,2));
