// Generuje zaszyfrowane odpowiedzi do public/index.html (stacje 2 i 3).
// Sekretów tu nie ma: podajesz je w poleceniu, a skrypt wypisuje tylko szyfrogramy i hashe.
//
// Użycie (Node 18+):
//   node narzedzia/szyfruj-odpowiedzi.js <PIN_STACJI_2> <KOD_WEJSCIA_3> <FRAG1> <FRAG2> <FRAG3>
//
// Klucz do każdej odpowiedzi to SHA-256("biegun26|" + rozwiązanie zadania), szyfr AES-256-GCM.
// Rozwiązania (zmień tutaj, jeśli zmieniasz zadania w apce):
const SOLUTIONS = {
  vault: "vault|md5|reindeer|d2|upper",         // typ hasha | słownik | maska | wielkość liter
  mail:  "mail|att,body,link,reply,subj",       // id podejrzanych elementów maila, alfabetycznie
  idor:  "idor|1337",                           // numer listy Grincha
  logs:  "logs|03:12:03"                        // godzina linii z włamaniem
};
const c = require("crypto");
const [pin2, gate, f1, f2, f3] = process.argv.slice(2);
if (!f3) { console.error("Podaj: PIN_STACJI_2 KOD_WEJSCIA_3 FRAG1 FRAG2 FRAG3"); process.exit(1); }
const seal = (material, plain) => {
  const key = c.createHash("sha256").update("biegun26|" + material).digest();
  const iv = c.randomBytes(12);
  const ci = c.createCipheriv("aes-256-gcm", key, iv);
  const ct = Buffer.concat([ci.update(plain, "utf8"), ci.final()]);
  return Buffer.concat([iv, ct, ci.getAuthTag()]).toString("base64");
};
const hash = s => c.createHash("sha256").update(s).digest("hex");
const up = s => s.toUpperCase().replace(/\s+/g, "");
console.log("V.seal (stacja 2):        ", seal(SOLUTIONS.vault, up(pin2)));
console.log("S3_GATE_H (kod wejścia):  ", hash("gate|" + up(gate)));
console.log("seal mail (fragment 1):   ", seal(SOLUTIONS.mail, up(f1)));
console.log("seal idor (fragment 2):   ", seal(SOLUTIONS.idor, up(f2)));
console.log("seal logs (fragment 3):   ", seal(SOLUTIONS.logs, up(f3)));
console.log("\nWklej wartości do public/index.html, a PIN-y stacji 2 i 3 (fragmenty razem) do firestore.local.rules.");
console.log("Uwaga: PIN stacji 2 musi być kandydatem symulatora: słowo ze słownika reniferów + 2 cyfry, WIELKIMI.");
