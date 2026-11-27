const {test}=require('node:test'),assert=require('node:assert/strict');
const {encodeFields,decodeFields,migrateTeam,migrateConfig}=require('../narzedzia/migracja-model.cjs');
const doc=(extra={})=>({name:'projects/test/databases/(default)/documents/teams/ABCD',createTime:'2026-11-01T10:00:00Z',fields:encodeFields({name:'Elfy',school:1,createdBy:'original-uid',createdAt:new Date('2026-11-01T10:00:00Z'),unlocked:{s1:'LEGACY-DEMO'},side:{p1:true,p3:'EDUCATIONAL-DEMO'},...extra})});
test('migracja zachowuje zaliczenia i twórcę, usuwa sekrety z projekcji, zamyka dołączanie',()=>{
  const t=migrateTeam(doc());assert.deepEqual(t.next.unlocked,{s1:true});assert.deepEqual(t.next.side,{p1:true,p3:true});assert.equal(t.next.createdBy,'original-uid');assert.equal(t.next.registrationOpen,false);
  assert.deepEqual(Object.keys(decodeFields(t.publicFields)).sort(),['name','school','unlocked','bonus'].sort());assert.ok(!JSON.stringify(t.fields).includes('LEGACY-DEMO'));
});
test('migracja nie kasuje istniejącej reakcji ani nie dopisuje zaliczenia nowej konsoli',()=>{
  const t=migrateTeam(doc({soc:{open:true,mail:true,idor:true,logs:true,resp:true}}));assert.equal(t.next.soc.resp,true);assert.equal(t.next.soc.triage,undefined);
});
test('nie obcina niezgodnego bonusu po cichu; nie zmienia szkoły na domyślną',()=>{
  assert.throws(()=>migrateTeam(doc({bonus:150})),/MANUAL_REVIEW/);assert.throws(()=>migrateTeam(doc({school:9})),/INVALID/);
});
test('konfiguracja migracji zachowuje szkoły i blokuje grę do decyzji organizatora',()=>{
  const fields=migrateConfig({fields:encodeFields({schools:['A','B','C'],endTime:'11:25'})},'2026-11-28T10:00:00Z');
  const c=decodeFields(fields);assert.deepEqual(c.schools,['A','B','C']);assert.equal(c.phase,'break');assert.equal(c.finalStatus,'waiting');
});
