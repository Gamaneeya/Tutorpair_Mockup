// Browser-only file store (IndexedDB) so the demo Admin can open files a tutor attached.
// Nothing leaves this browser; a real product would use server-side storage.
const open=()=>new Promise((res,rej)=>{const r=indexedDB.open('tp_files',1);r.onupgradeneeded=()=>r.result.createObjectStore('f');r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)});
export async function saveFile(file){
 const id='f'+Date.now().toString(36)+Math.random().toString(36).slice(2,7),db=await open();
 await new Promise((res,rej)=>{const tx=db.transaction('f','readwrite');tx.objectStore('f').put(file,id);tx.oncomplete=res;tx.onerror=()=>rej(tx.error)});
 return id;
}
export async function getFile(id){
 const db=await open();
 return new Promise((res,rej)=>{const r=db.transaction('f').objectStore('f').get(id);r.onsuccess=()=>res(r.result||null);r.onerror=()=>rej(r.error)});
}
