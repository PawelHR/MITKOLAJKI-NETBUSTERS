import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const source=await readFile(new URL('../public/core.js',import.meta.url),'utf8');
const {officialPoints,buildRanking,resultsCsv}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
test('punkty edukacyjne i tekstowe stare PIN-y nie punktują',()=>{
  assert.equal(officialPoints({unlocked:{s1:true,s2:'STARY'},side:{p1:true},bonus:10}),110);
});
test('średnia bez premiowania liczby drużyn, wspólne miejsca i precyzja',()=>{
  const teams=[{id:'1',name:'A',school:0,unlocked:{s1:true}},{id:'2',name:'B',school:1,unlocked:{s1:true}},{id:'3',name:'C',school:1,unlocked:{s1:true}},{id:'4',name:'D',school:0,unlocked:{}}];
  const {sch}=buildRanking(teams,['X','Y','Z']);assert.equal(sch[0].avg,100);assert.equal(sch[1].avg,100);assert.equal(sch[0].place,sch[1].place);assert.equal(sch[0].count,1);
});
test('CSV UTF-8, średniki, cytowanie i ochrona przed formułami',()=>{
  const csv=resultsCsv([{id:'A',name:'=2+2;"',school:0,unlocked:{s1:true}}],['Łódź']);assert.ok(csv.startsWith('\uFEFF'));assert.ok(csv.includes('"\'=2+2;"""'));assert.ok(csv.includes('Łódź'));
});
