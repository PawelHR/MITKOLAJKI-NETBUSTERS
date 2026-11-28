// Punktacja współdzielona przez terminal, ekran i eksport (bez Firebase).
export const PHASES = { main:'Gra główna', break:'Przerwa', final:'Finał', ended:'Wydarzenie zakończone' };
export const STATION_IDS = ['s1','s2','s3','s4'];
export function stationCount(t) { return STATION_IDS.filter(id => t.unlocked?.[id] === true).length; }
export function officialPoints(t) { return stationCount(t)*100 + (Number(t.bonus)||0); }
export function buildRanking(data, schools) {
  const teams = data.map(t => ({...t,points:officialPoints(t),st:stationCount(t)}))
    .sort((a,b) => b.points-a.points || a.name.localeCompare(b.name,'pl'));
  const sch = schools.map((name,i) => {
    const ts = teams.filter(t => t.school === i && t.st > 0);
    const sum = ts.reduce((n,t) => n+t.points,0);
    return {i,name,count:ts.length,sum,avg:ts.length ? sum/ts.length : 0};
  }).sort((a,b) => b.avg-a.avg || a.name.localeCompare(b.name,'pl'));
  for (const list of [teams,sch]) list.forEach((x,i) => {
    const score = x.avg ?? x.points, prev = list[i-1];
    x.place = prev && score === (prev.avg ?? prev.points) ? prev.place : i+1;
  });
  return {teams,sch};
}
export function csvCell(value) {
  let s = String(value ?? '');
  if (/^[\s]*[=+@-]/.test(s)) s = "'"+s;
  return '"'+s.replaceAll('"','""')+'"';
}
export function resultsCsv(teams, schools) {
  return '\uFEFF'+[['Miejsce','ID','Drużyna','Szkoła','Stacje','Punkty oficjalne'],
    ...buildRanking(teams,schools).teams.map(t => [t.place,t.id,t.name,schools[t.school],t.st,t.points])]
    .map(row => row.map(csvCell).join(';')).join('\r\n');
}
