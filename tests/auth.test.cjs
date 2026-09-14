const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const ts=require('typescript');
const vm=require('node:vm');
function fixture({enabled=true,token='',reply={ok:true,data:{users:[{localId:'test-user',email:'test@example.com'}]}}}={}){
 const cache={}; const calls=[];
 const claims={aud:'haven-test',iss:'https://securetoken.google.com/haven-test',sub:'test-user',exp:Date.now()/1000+3600};
 const makeToken=(change={})=>'header.'+Buffer.from(JSON.stringify({...claims,...change})).toString('base64url')+'.signature';
 const context={Response,Request,URL,AbortSignal,atob,Date,console,process:{env:{}},fetch:async(url,options)=>{calls.push({url,body:JSON.parse(options.body)});return Response.json(reply.data,{status:reply.ok?200:400})}};
 function load(path){
  if(cache[path])return cache[path];
  if(path==='cloudflare:workers')return {env:enabled?{FIREBASE_API_KEY:'test-key',FIREBASE_PROJECT_ID:'haven-test'}:{}};
  if(path==='next/headers')return {cookies:async()=>({get:()=>token?{value:token==='valid'?makeToken():token}:undefined})};
  if(path.endsWith('chatgpt-auth'))return {getChatGPTUser:async()=>null};
  if(path==='zod')return require('zod');
  const file=path.includes('firebase-auth')?'app/firebase-auth.ts':path.includes('auth-policy')?'app/auth-policy.ts':'app/api/auth/route.ts';
  const output=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
  const exports={};vm.runInNewContext('(function(require,exports){'+output+'\n})',context)(load,exports);cache[path]=exports;return exports;
 }
 return {auth:load('firebase-auth'),route:load('route'),policy:load('auth-policy'),calls,makeToken};
}
const req=(body,origin='https://haven.test')=>new Request('https://haven.test/api/auth',{method:'POST',headers:{origin,'Content-Type':'application/json'},body:JSON.stringify(body)});
test('redirects remain on Haven',()=>{const {policy}=fixture();for(const target of ['https://evil.test','//evil.test','/\\evil.test','/signin?return_to=/signin'])assert.equal(policy.safeReturnTo(target),'/');assert.equal(policy.safeReturnTo('/saved?x=1'),'/saved?x=1')});
test('anonymous requests have no identity',async()=>assert.equal(await fixture().auth.getUser(),null));
test('verified Firebase identity is namespaced',async()=>assert.equal((await fixture({token:'valid'}).auth.getUser()).userId,'firebase:test-user'));
test('Google rejected tokens cannot authenticate',async()=>assert.equal(await fixture({token:'valid',reply:{ok:false,data:{error:{message:'INVALID_ID_TOKEN'}}}}).auth.getUser(),null));
test('expired and wrong-project tokens cannot authenticate',async()=>{const base=fixture();for(const claims of [{aud:'another-project'},{iss:'https://evil.test'},{exp:1},{sub:'other-user'}])assert.equal(await fixture({token:base.makeToken(claims)}).auth.getUser(),null)});
test('disabled users cannot authenticate',async()=>assert.equal(await fixture({token:'valid',reply:{ok:true,data:{users:[{localId:'test-user',disabled:true}]}}}).auth.getUser(),null));
test('malformed sessions fail closed',async()=>assert.equal(await fixture({token:'broken'}).auth.getUser(),null));
test('cross-origin writes and login are rejected',async()=>{const f=fixture({token:'valid'});assert.equal(await f.auth.getUser(req({},'https://evil.test')),null);assert.equal((await f.route.POST(req({},'https://evil.test'))).status,403);assert.equal(f.calls.length,0)});
test('login creates an HttpOnly secure one-hour cookie',async()=>{const f=fixture({reply:{ok:true,data:{idToken:'valid.jwt.token',expiresIn:'3600'}}});const r=await f.route.POST(req({action:'signin',email:'test@example.com',password:'test-password'}));assert.equal(r.status,200);const cookie=r.headers.get('set-cookie');for(const flag of ['HttpOnly','Secure','SameSite=Lax','Max-Age=3600'])assert.ok(cookie.includes(flag));assert.equal(r.headers.get('cache-control'),'no-store')});
test('invalid signup never reaches Firebase',async()=>{const f=fixture();const r=await f.route.POST(req({action:'signup',email:'invalid',password:'x'}));assert.equal(r.status,400);assert.equal(f.calls.length,0)});
test('password reset avoids exposing nonexistent accounts',async()=>{const f=fixture({reply:{ok:false,data:{error:{message:'EMAIL_NOT_FOUND'}}}});const r=await f.route.POST(req({action:'reset',email:'test@example.com'}));assert.equal(r.status,200);assert.match((await r.json()).message,/If an account exists/)});
test('unconfigured Firebase is explicitly unavailable',async()=>assert.equal((await fixture({enabled:false}).route.POST(req({action:'signin',email:'test@example.com',password:'test-password'}))).status,503));
test('signout expires the session cookie',async()=>assert.match((await fixture().route.POST(req({action:'signout'}))).headers.get('set-cookie'),/Max-Age=0/));
