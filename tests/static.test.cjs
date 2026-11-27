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
test('piaskownica bez pochodzenia rodzica, kodów stacji i połączeń sieciowych',()=>{
  assert.ok(js.includes("sandbox:'allow-scripts'"));
  assert.ok(!js.includes("sandbox:'allow-scripts allow-same-origin'"));
  assert.ok(js.includes("connect-src \\'none\\'"));
  assert.ok(!js.includes('GAME_SEAL'));
  assert.ok(!js.includes('Test: udawaj dobrą kartę'));
  assert.ok(!js.includes('doorCfg.pin ||'));
});
test('reset obejmuje parametry, rolę, klawisze, poziom i gwiazdki',()=>{
  const reset=js.slice(js.indexOf('   function reset(){'),js.indexOf('   function finish(){'));
  for(const term of ['predkosc:4','grawitacja:0.5','klucze:0','poziom:1','keys={}','stars.clear()',"setItem('rola','elf')",'hintLvl=0'])assert.ok(reset.includes(term),term);
});
