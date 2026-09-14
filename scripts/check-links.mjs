import assert from 'node:assert/strict';
const base=process.argv[2] || 'http://localhost:5173';
const catalog=await fetch(base+'/api/properties');
assert.equal(catalog.status,200,'Property API should be available');
const {properties}=await catalog.json();
const routes=new Set(['/', '/?mode=Buy','/?mode=Rent','/saved','/signin','/list',...properties.map(p=>'/property/'+p.id)]);
let links=0;
for(const route of routes){
 const response=await fetch(base+route);assert.equal(response.status,200,route);
 const html=await response.text();
 for(const match of html.matchAll(/href="([^"<>]+)"/g)){
  const href=match[1].replaceAll('&amp;','&');
  if(!href.startsWith('/')||href.startsWith('//')||href.startsWith('/@')||href.startsWith('/node_modules')||href.startsWith('/signin-with-chatgpt')||href.startsWith('/signout-with-chatgpt'))continue;
  const url=new URL(href,base);if(url.hash==='#about'&&url.pathname==='/'){assert.ok((await (await fetch(base)).text()).includes('id="about"'));continue;}
  if(!routes.has(url.pathname+url.search) && !url.pathname.endsWith('.css') && !url.pathname.endsWith('.js'))routes.add(url.pathname+url.search);
  links++;
 }
}
for(const path of ['/this-page-does-not-exist','/property/not-a-real-home','/property/00000000-0000-4000-8000-000000000000']){
 const r=await fetch(base+path);assert.equal(r.status,404,path);assert.match(await r.text(),/find your way home/);
}
const crossOrigin=await fetch(base+'/api/auth',{method:'POST',headers:{Origin:'https://unrelated.test','Content-Type':'application/json'},body:'{"action":"signout"}'});assert.equal(crossOrigin.status,403);
for(const path of ['/api/photos','/api/properties','/api/favorites']){
 const r=await fetch(base+path,{method:'POST',headers:{Origin:base,'Content-Type':'application/json'},body:'{}'});assert.equal(r.status,401,path);
}
console.log(`Passed: ${routes.size} routes, ${links} internal links, three custom 404 routes, authentication and cross-origin guards.`);
