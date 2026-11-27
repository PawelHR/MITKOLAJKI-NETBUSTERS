// Czysty model migracji: brak sieci i brak efektów ubocznych.
const STATIONS=['s1','s2','s3','s4'];
const SIDE=['p1','p2','p3','p4','p5','p6','p7','p8','p9'];
const SOC=['open','mail','idor','logs','triage','resp'];
function decode(v){
  if('stringValue'in v)return v.stringValue;
  if('integerValue'in v)return Number(v.integerValue);
  if('doubleValue'in v)return v.doubleValue;
  if('booleanValue'in v)return v.booleanValue;
  if('timestampValue'in v)return new Date(v.timestampValue);
  if('arrayValue'in v)return (v.arrayValue.values||[]).map(decode);
  if('mapValue'in v)return decodeFields(v.mapValue.fields||{});
  if('nullValue'in v)return null;
  throw new Error('UNSUPPORTED_FIELD_TYPE');
}
function decodeFields(fields){return Object.fromEntries(Object.entries(fields||{}).map(([k,v])=>[k,decode(v)]));}
function encode(v){
  if(v instanceof Date)return {timestampValue:v.toISOString()};
  if(typeof v==='string')return {stringValue:v};
  if(typeof v==='boolean')return {booleanValue:v};
  if(typeof v==='number'&&Number.isInteger(v))return {integerValue:String(v)};
  if(Array.isArray(v))return {arrayValue:{values:v.map(encode)}};
  if(v&&typeof v==='object')return {mapValue:{fields:encodeFields(v)}};
  throw new Error('UNSUPPORTED_OUTPUT_TYPE');
}
function encodeFields(data){return Object.fromEntries(Object.entries(data).map(([k,v])=>[k,encode(v)]));}
function normalize(flags,ids,legacy=false){
  return Object.fromEntries(ids.filter(id=>flags?.[id]===true||(legacy&&typeof flags?.[id]==='string'&&flags[id].length>0)).map(id=>[id,true]));
}
function migrateTeam(document){
  const old=decodeFields(document.fields),id=document.name.split('/').pop();
  if(!/^[A-Z2-9]{4}$/.test(id)||typeof old.name!=='string'||old.name.length<2||old.name.length>28||![0,1,2].includes(old.school))throw new Error('INVALID_LEGACY_TEAM');
  if(typeof old.createdBy!=='string'||!old.createdBy)throw new Error('MISSING_TEAM_CREATOR');
  const bonus=old.bonus??0;if(!Number.isInteger(bonus)||bonus<0||bonus>100)throw new Error('BONUS_REQUIRES_MANUAL_REVIEW');
  const next={name:old.name,school:old.school,createdBy:old.createdBy,createdAt:old.createdAt||new Date(document.createTime),
    unlocked:normalize(old.unlocked,STATIONS,true),side:normalize(old.side,SIDE,true),soc:normalize(old.soc,SOC),registrationOpen:false,bonus};
  const fields=encodeFields(next);
  if(document.fields?.createdAt?.timestampValue)fields.createdAt=document.fields.createdAt;
  return {id,next,fields,publicFields:encodeFields({name:next.name,school:next.school,unlocked:next.unlocked,bonus:next.bonus})};
}
function migrateConfig(document,readTime){
  const old=decodeFields(document?.fields);
  const schools=old.schools||['Szkoła 1','Szkoła 2','Szkoła 3'];
  if(!Array.isArray(schools)||schools.length!==3||schools.some(s=>typeof s!=='string'||!s||s.length>40))throw new Error('SCHOOLS_REQUIRE_MANUAL_REVIEW');
  return encodeFields({schools,endTime:typeof old.endTime==='string'?old.endTime:'11:25',phase:'break',
    mainEndsAt:old.mainEndsAt instanceof Date?old.mainEndsAt:new Date(readTime),
    rooms:Array.isArray(old.rooms)&&old.rooms.length===4?old.rooms:['Sala 1','Sala 2','Sala 3','Sala 4'],
    rotation:typeof old.rotation==='string'?old.rotation:'09:25 → 09:55 → 10:25 → 10:55 · 25 min + 5 min przejścia',
    central:typeof old.central==='string'?old.central:'Centrala: odzyskajcie cztery fragmenty. Liczy się współpraca.',finalStatus:'waiting'});
}
module.exports={STATIONS,SIDE,SOC,decodeFields,encodeFields,migrateTeam,migrateConfig};
