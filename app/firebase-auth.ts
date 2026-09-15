import {env} from '@/lib/runtime';
import {cookies} from 'next/headers';
import {getChatGPTUser, type ChatGPTUser} from './chatgpt-auth';
import {sameOrigin} from './auth-policy';

export function chatgptAvailable(){return !(env as typeof env & {HAVEN_NODE_RUNTIME?:boolean}).HAVEN_NODE_RUNTIME;}
export const SESSION_COOKIE = 'haven_session';
export function firebaseConfig() {
  const config = env as typeof env & {FIREBASE_API_KEY?: string; FIREBASE_PROJECT_ID?: string};
  return {apiKey: config.FIREBASE_API_KEY || process.env.FIREBASE_API_KEY || '', projectId: config.FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID || ''};
}
export function firebaseEnabled() { const c=firebaseConfig(); return Boolean(c.apiKey && c.projectId); }

export async function firebaseRequest(method: string, body: object) {
  const {apiKey} = firebaseConfig();
  const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:${method}?key=${encodeURIComponent(apiKey)}`, {
    method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(body),
    signal: AbortSignal.timeout(10000), cache: 'no-store',
  });
  const data = await response.json() as any;
  return {ok:response.ok, data};
}

export async function getUser(request?: Request): Promise<ChatGPTUser | null> {
  if (request && !['GET','HEAD'].includes(request.method) && !sameOrigin(request)) return null;
  // Keep existing Sites identities until the owner activates Firebase.
  if (!firebaseEnabled()) return chatgptAvailable()?getChatGPTUser():null;
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const {ok,data} = await firebaseRequest('lookup', {idToken:token});
    const user = data.users?.[0];
    if (!ok || !user || user.disabled) return null;
    // Lookup validates the token with Google; also bind it to this app's project.
    const claims = JSON.parse(atob(token.split('.')[1].replace(/-/g,'+').replace(/_/g,'/')));
    const {projectId} = firebaseConfig();
    if (claims.aud !== projectId || claims.iss !== `https://securetoken.google.com/${projectId}` || claims.exp <= Date.now()/1000 || claims.sub !== user.localId) return null;
    return {userId:`firebase:${user.localId}`, email:user.email || '', displayName:user.displayName || user.email || 'Haven member', fullName:user.displayName || null};
  } catch { return null; }
}
