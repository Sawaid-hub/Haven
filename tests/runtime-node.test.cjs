const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const ts=require('typescript');
function runtime(fetch,variables={CLOUDFLARE_ACCOUNT_ID:'test-account',CLOUDFLARE_API_TOKEN:'test-token',CLOUDFLARE_D1_DATABASE_ID:'test-db',CLOUDFLARE_R2_BUCKET:'test-bucket'}){
 const code=ts.transpileModule(fs.readFileSync('lib/runtime-node.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 const exports={};vm.runInNewContext('(function(exports){'+code+'\n})',{fetch,process:{env:variables},Buffer,AbortSignal})(exports);return exports.env;
}
test('database values remain bound parameters',async()=>{let request;const env=runtime(async(url,options)=>{request={url,...options};return Response.json({success:true,result:[{success:true,results:[{id:'saved'}]}]})});const id="'; DROP TABLE listings; --";assert.equal((await env.DB.prepare('SELECT id FROM listings WHERE id = ?').bind(id).first()).id,'saved');assert.deepEqual(JSON.parse(request.body),{sql:'SELECT id FROM listings WHERE id = ?',params:[id]});assert.equal(request.headers.Authorization,'Bearer test-token')});
test('database errors propagate instead of pretending to save',async()=>{const env=runtime(async()=>Response.json({success:false},{status:403}));await assert.rejects(env.DB.prepare('SELECT 1').all(),/failed/)});
test('photo adapter uploads bytes and handles missing objects',async()=>{let uploaded;const env=runtime(async(url,options)=>{if(options.method==='PUT'){uploaded=options;return Response.json({success:true})}return new Response(null,{status:404})});await env.BUCKET.put('photo-id',new Uint8Array([1,2,3]),{httpMetadata:{contentType:'image/png'}});assert.deepEqual([...uploaded.body],[1,2,3]);assert.equal(uploaded.headers['Content-Type'],'image/png');assert.equal(await env.BUCKET.get('missing'),null)});
test('unconfigured storage is unavailable',()=>{const env=runtime(()=>{throw Error('must not request')},{});assert.equal(env.DB,undefined);assert.equal(env.BUCKET,undefined);assert.equal(env.HAVEN_NODE_RUNTIME,true)});
