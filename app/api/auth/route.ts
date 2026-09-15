import {chatgptAvailable, firebaseEnabled, firebaseRequest, getUser, SESSION_COOKIE} from '../../firebase-auth';
import {sameOrigin} from '../../auth-policy';
import {z} from 'zod';
export const dynamic = 'force-dynamic';
const noStore = {'Cache-Control':'no-store'};
export async function GET() {
  const user = await getUser();
  return Response.json({enabled:firebaseEnabled(), chatgptAvailable:chatgptAvailable(), user:user ? {email:user.email, displayName:user.displayName} : null}, {headers:noStore});
}
export async function POST(request: Request) {
  if (!sameOrigin(request)) return Response.json({error:'Please submit this form from Haven.'},{status:403,headers:noStore});
  const secure = new URL(request.url).protocol === 'https:' ? '; Secure' : '';
  if (Number(request.headers.get('content-length')) > 8000) return Response.json({error:'Request too large.'},{status:413,headers:noStore});
  let body: any;
  try {body=await request.json();} catch {return Response.json({error:'Invalid request.'},{status:400,headers:noStore});}
  if (body?.action === 'signout') return Response.json({ok:true},{headers:{...noStore,'Set-Cookie':`${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`}});
  if (!firebaseEnabled()) return Response.json({error:'Email sign-in is not available yet. Please use the existing sign-in option.'},{status:503,headers:noStore});
  const parsed=z.object({action:z.enum(['signin','signup','reset']),email:z.string().email().max(254),password:z.string().max(128).optional()}).safeParse(body);
  if (!parsed.success || (parsed.data.action !== 'reset' && (!parsed.data.password || (parsed.data.action === 'signup' && parsed.data.password.length < 8)))) return Response.json({error:'Enter a valid email and password. New passwords need at least 8 characters.'},{status:400,headers:noStore});
  const {action,email,password}=parsed.data;
  try {
    const {ok,data}=await firebaseRequest(action==='signin'?'signInWithPassword':action==='signup'?'signUp':'sendOobCode',action==='reset'?{requestType:'PASSWORD_RESET',email}:{email,password,returnSecureToken:true});
    if (action==='reset' && (ok || data.error?.message === 'EMAIL_NOT_FOUND')) return Response.json({message:'If an account exists for this email, a reset link is on its way.'},{headers:noStore});
    if (!ok) {
      const code=String(data.error?.message || '');
      const error=code.includes('TOO_MANY_ATTEMPTS')?'Too many attempts. Please wait a few minutes and try again.':code.includes('WEAK_PASSWORD')||code.includes('PASSWORD_DOES_NOT_MEET_REQUIREMENTS')?'Choose a stronger password that meets the account password policy.':action==='signin'?'We couldn’t sign you in. Check your email and password, then try again.':'We couldn’t complete this request. Try signing in or resetting your password.';
      return Response.json({error},{status:code.includes('TOO_MANY_ATTEMPTS')?429:400,headers:noStore});
    }
    if (typeof data.idToken !== 'string' || !/^[A-Za-z0-9_.-]+$/.test(data.idToken)) throw Error('Invalid session');
    const duration=Math.min(Number(data.expiresIn)||3600,3600);
    return Response.json({ok:true},{headers:{...noStore,'Set-Cookie':`${SESSION_COOKIE}=${data.idToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${duration}${secure}`}});
  } catch {return Response.json({error:'Sign-in is temporarily unavailable. Please try again.'},{status:503,headers:noStore});}
}
