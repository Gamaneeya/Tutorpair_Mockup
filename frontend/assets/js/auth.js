// Browser-only account simulator for the TutorPair MVP. Never use this for production authentication.
// Password verifiers in localStorage can be replaced by anyone with access to the browser.
const ACCOUNTS_KEY='tp_demo_accounts_v1';
const SESSION_KEY='tp_demo_session_v1';
const ROLES=['student','tutor','parent'];
const ITERATIONS=120000;
const getAccounts=()=>{try{const a=JSON.parse(localStorage.getItem(ACCOUNTS_KEY)||'[]');return Array.isArray(a)?a:[]}catch{return []}};
const saveAccounts=a=>localStorage.setItem(ACCOUNTS_KEY,JSON.stringify(a));
const normEmail=v=>String(v||'').trim().toLowerCase();
const bytesToHex=buf=>Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,'0')).join('');
const hexToBytes=hex=>new Uint8Array(hex.match(/../g).map(x=>Number.parseInt(x,16)));
async function deriveDemoVerifier(password,salt){
 const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(password),'PBKDF2',false,['deriveBits']);
 const bytes=await crypto.subtle.deriveBits({name:'PBKDF2',salt:hexToBytes(salt),iterations:ITERATIONS,hash:'SHA-256'},key,256);
 return bytesToHex(bytes);
}
export function getAuthSession(){
 try{
  const s=JSON.parse(sessionStorage.getItem(SESSION_KEY)||'null');
  if(!s||!['demo','account'].includes(s.type))return null;
  if(s.type==='account'){
   const account=getAccounts().find(a=>a.id===s.accountId);
   return account?{type:'account',accountId:account.id,role:account.role,name:account.name,email:account.email}:null;
  }
  return {type:'demo'};
 }catch{return null}
}
export function beginDemoSession(){sessionStorage.setItem(SESSION_KEY,JSON.stringify({type:'demo'}));}
export function logout(){sessionStorage.removeItem(SESSION_KEY);}
export async function registerDemoAccount({name,email,password,role}){
 name=String(name||'').trim();email=normEmail(email);
 if(!ROLES.includes(role))throw Error('Choose Student, Tutor or Parent.');
 if(name.length<2||name.length>80)throw Error('Enter a name between 2 and 80 characters.');
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))throw Error('Enter a valid email address.');
 if(String(password).length<8)throw Error('Your demo password needs at least 8 characters.');
 const all=getAccounts();
 if(all.some(a=>a.email===email))throw Error('This email is already registered. Please log in instead.');
 const salt=bytesToHex(crypto.getRandomValues(new Uint8Array(16)));
 const verifier=await deriveDemoVerifier(password,salt);
 const account={id:'user-'+crypto.randomUUID(),name,email,role,salt,verifier,createdAt:new Date().toISOString()};
 all.push(account);saveAccounts(all);
 sessionStorage.setItem(SESSION_KEY,JSON.stringify({type:'account',accountId:account.id}));
 return {id:account.id,name,email,role};
}
export async function loginDemoAccount({email,password}){
 const account=getAccounts().find(a=>a.email===normEmail(email));
 if(!account)throw Error('Email or demo password is incorrect.');
 const verifier=await deriveDemoVerifier(password,account.salt);
 if(verifier!==account.verifier)throw Error('Email or demo password is incorrect.');
 sessionStorage.setItem(SESSION_KEY,JSON.stringify({type:'account',accountId:account.id}));
 return {id:account.id,name:account.name,email:account.email,role:account.role};
}
