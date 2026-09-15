// Server-only Cloudflare API adapter for Node hosts such as Netlify.
// Credentials are read at request time and must never use NEXT_PUBLIC_ prefixes.
function configuration() {
  const {CLOUDFLARE_ACCOUNT_ID:account, CLOUDFLARE_API_TOKEN:token,
    CLOUDFLARE_D1_DATABASE_ID:database, CLOUDFLARE_R2_BUCKET:bucket}=process.env;
  return {account,token,database,bucket};
}
function endpoint(path:string) {
  const {account,token}=configuration();
  if(!account||!token)throw new Error('Configure Cloudflare storage in the hosting environment.');
  return {url:`https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(account)}/${path}`,token};
}
async function query(sql:string,params:unknown[]) {
  const {database}=configuration();
  if(!database)throw new Error('CLOUDFLARE_D1_DATABASE_ID is missing.');
  const {url,token}=endpoint(`d1/database/${encodeURIComponent(database)}/query`);
  const r=await fetch(url,{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify({sql,params}),cache:'no-store',signal:AbortSignal.timeout(15000)});
  const body=await r.json() as any;
  if(!r.ok||!body.success||!body.result?.[0]?.success)throw new Error('Cloudflare database request failed.');
  return body.result[0];
}
function statement(sql:string,params:unknown[]=[]):any {
  return {bind:(...values:unknown[])=>statement(sql,values),all:()=>query(sql,params),run:()=>query(sql,params),first:async(column?:string)=>{const row=(await query(sql,params)).results?.[0]??null;return column&&row?row[column]:row;}};
}
function objectEndpoint(key:string){
  const {bucket}=configuration();if(!bucket)throw new Error('CLOUDFLARE_R2_BUCKET is missing.');
  return endpoint(`r2/buckets/${encodeURIComponent(bucket)}/objects/${encodeURIComponent(key)}`);
}
export const env={
  HAVEN_NODE_RUNTIME:true,
  get FIREBASE_API_KEY(){return process.env.FIREBASE_API_KEY;},
  get FIREBASE_PROJECT_ID(){return process.env.FIREBASE_PROJECT_ID;},
  get DB(){const c=configuration();return c.account&&c.token&&c.database?{prepare:statement} as unknown as D1Database:undefined;},
  get BUCKET(){const c=configuration();return c.account&&c.token&&c.bucket?{
    async put(key:string,body:Uint8Array,options?:{httpMetadata?:{contentType?:string}}){const {url,token}=objectEndpoint(key);const r=await fetch(url,{method:'PUT',headers:{Authorization:`Bearer ${token}`,'Content-Type':options?.httpMetadata?.contentType||'application/octet-stream'},body:Buffer.from(body),signal:AbortSignal.timeout(30000)});if(!r.ok)throw new Error('Photo upload failed.');},
    async get(key:string){const {url,token}=objectEndpoint(key);const r=await fetch(url,{headers:{Authorization:`Bearer ${token}`},cache:'no-store',signal:AbortSignal.timeout(15000)});if(r.status===404)return null;if(!r.ok)throw new Error('Photo request failed.');return {body:r.body,httpMetadata:{contentType:r.headers.get('content-type')}};},
  } as unknown as R2Bucket:undefined;},
};
