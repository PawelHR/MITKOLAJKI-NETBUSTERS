const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const html=fs.readFileSync('public/index.html','utf8');
const js=html.match(/<script type="module">([\s\S]*?)<\/script>/)[1];
test('składnia aplikacji i service workera',()=>{
  assert.doesNotThrow(()=>new vm.Script(js.replace(/^import .*$/gm,'')));
  assert.doesNotThrow(()=>new vm.Script(fs.readFileSync('public/sw.js','utf8')));
});
test('lokalne i wdrażane reguły są identyczne',()=>{
  assert.equal(fs.readFileSync('firestore.rules','utf8'),fs.readFileSync('firestore.local.rules','utf8'));
});
test('piaskownica bez pochodzenia rodzica i połączeń sieciowych; tylko flaga ćwiczenia',()=>{
  assert.ok(js.includes("sandbox:'allow-scripts'"));
  assert.ok(!js.includes("sandbox:'allow-scripts allow-same-origin'"));
  assert.ok(js.includes("connect-src \\'none\\'"));
  assert.ok(!js.includes('GAME_SEAL'));
  assert.ok(!js.includes('Test: udawaj dobrą kartę'));
  assert.ok(!js.includes('doorCfg.pin ||'));
  assert.ok(js.includes("flagCard('s1')"));
  assert.ok(!js.includes('sideClickFix'));
  assert.ok(!js.includes('Piaskownica bez Firebase i sesji organizatora.'));
  assert.ok(!js.includes('Terminal (poza piaskownicą)'));
});
test('reset obejmuje parametry, rolę, klawisze, poziom i gwiazdki',()=>{
  const reset=js.slice(js.indexOf('   function reset(){'),js.indexOf('   function finish(){'));
  for(const term of ['predkosc:4','grawitacja:0.5','klucze:0','poziom:1','keys={}','stars.clear()',"setItem('rola','elf')",'hintLvl=0'])assert.ok(reset.includes(term),term);
});
test('jedna wersja Firebase SDK: aplikacja, service worker i testy',()=>{
  const versions=new Set([...html.matchAll(/gstatic\.com\/firebasejs\/([\d.]+)\//g)].map(m=>m[1]));
  assert.equal(versions.size,1);const [v]=versions;
  assert.ok(fs.readFileSync('public/sw.js','utf8').includes(`/firebasejs/${v}/`));
  assert.equal(JSON.parse(fs.readFileSync('package.json','utf8')).devDependencies.firebase,v);
});
test('limit drużyny spójny w aplikacji i regułach; etap zmieniany osobno',()=>{
  assert.ok(js.includes('const TEAM_MAX = 4;'));
  assert.ok(fs.readFileSync('firestore.rules','utf8').includes('d.memberCount <= 4'));
  assert.ok(js.includes('memberCount:increment(1)')&&js.includes('memberCount:increment(-1)'));
  assert.ok(!js.includes('endTime'));
  assert.ok(!/rotation|rotacj/i.test(js),'bez wyświetlania i konfiguracji rotacji');
  const settings=js.slice(js.indexOf('const fields={'),js.indexOf('const settings ='));
  assert.ok(!settings.includes('phase'));
  assert.ok(js.includes("'Tak, zmień etap'"));
});
