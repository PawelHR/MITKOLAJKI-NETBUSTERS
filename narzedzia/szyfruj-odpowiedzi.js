// WYŁĄCZNIE rekwizyt edukacyjny symulatora, nigdy PIN ani uprawnienie.
// Publiczny materiał klucza umożliwia odszyfrowanie każdemu. AES tego nie zmienia.
// Uruchom: node narzedzia/szyfruj-odpowiedzi.js
// Brak argumentów z sekretami (nie trafiają do historii powłoki ani logów).
const c = require('node:crypto');
if (process.argv.length !== 2) {
  console.error('Nie podawaj sekretów. Skrypt obsługuje wyłącznie wbudowany rekwizyt demonstracyjny.');
  process.exit(1);
}
const demo = ['RENIFER','06'].join(''); // jawna odpowiedź zadania, nie kod zaliczenia
const key = c.createHash('sha256').update('biegun26|vault|md5|reindeer|d2|upper').digest();
const iv = c.randomBytes(12);
const cipher = c.createCipheriv('aes-256-gcm',key,iv);
const ct = Buffer.concat([cipher.update(demo,'utf8'),cipher.final()]);
console.log(JSON.stringify({hash:c.createHash('md5').update(demo).digest('hex'),seal:Buffer.concat([iv,ct,cipher.getAuthTag()]).toString('base64')},null,2));
