// Cache wyłącznie publicznych treści i bibliotek. Nigdy Auth ani Firestore.
const CACHE='biegun-public-v2';
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(c=>c.addAll(['/','/core.js']))));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('biegun-public-')&&k!==CACHE).map(k=>caches.delete(k))))));
self.addEventListener('fetch',event=>{
  const url=new URL(event.request.url);
  const local=url.origin===self.location.origin && ['/','/index.html','/core.js','/__/firebase/init.json'].includes(url.pathname);
  const library=url.hostname==='www.gstatic.com'&&url.pathname.startsWith('/firebasejs/10.12.2/');
  if(event.request.method!=='GET'||(!local&&!library))return;
  event.respondWith(fetch(event.request).then(response=>{
    if(response.ok){const copy=response.clone();event.waitUntil(caches.open(CACHE).then(c=>c.put(event.request,copy)));}
    return response;
  }).catch(async()=>{const cached=await caches.match(event.request);if(cached)return cached;return Response.error();}));
});
