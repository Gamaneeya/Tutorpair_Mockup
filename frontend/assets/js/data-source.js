import { mockData } from '../data/mock-data.js';

/** Only this adapter needs to change when a real backend is available. */
export const DATA_MODE = 'mock'; // Switch to 'api' after implementing GET /api/bootstrap
export const API_BOOTSTRAP_URL = '/api/bootstrap';
let apiSnapshot = null;
export async function initializeData() {
  if (DATA_MODE !== 'api') return;
  const response = await fetch(API_BOOTSTRAP_URL, {credentials:'include'});
  if (!response.ok) throw new Error(`API bootstrap failed: ${response.status}`);
  apiSnapshot = await response.json();
  // The API must return the same field names as assets/data/mock-data.js.
}

const storageKey = 'tutorpair_demo_v2';
const clone = value => JSON.parse(JSON.stringify(value));

export function getData() {
  if (DATA_MODE === 'api') {
    if (!apiSnapshot) throw new Error('API not initialized. Call initializeData() first.');
    return clone(apiSnapshot);
  }
  try {
    const saved = localStorage.getItem(storageKey);
    return saved ? { ...clone(mockData), ...JSON.parse(saved) } : clone(mockData);
  } catch { return clone(mockData); }
}
export function saveData(data) {
  if (DATA_MODE !== 'mock') throw new Error('Write APIs are not connected yet. Implement POST/PATCH endpoints in the adapter.');
  localStorage.setItem(storageKey, JSON.stringify(data));
  window.dispatchEvent(new CustomEvent('tp:data-changed'));
}
export function updateData(fn) {
  const data = getData();
  const result = fn(data) || data;
  saveData(result);
  return result;
}
export function resetData() { ['tutorpair_demo_v2','tp_demo_account','tp_learning_request','tp_student_feedback'].forEach(k=>localStorage.removeItem(k)); window.location.href = '/'; }
export function getAccount() {
  try { return JSON.parse(localStorage.getItem('tp_demo_account') || 'null'); } catch { return null; }
}
export function enterDemo(role) {
  const data = getData();
  const person = data.people[role];
  if (!person) return;
  localStorage.setItem('tp_demo_account', JSON.stringify({role,name:person.name,id:person.id}));
  window.location.href = `/${role}/dashboard.html`;
}
export function logoutDemo() {localStorage.removeItem('tp_demo_account');window.location.href='/';}

/** Example future API calls:
 * getData() -> GET /api/me, GET /api/students/:id/progress, GET /api/tutors etc.
 * updateData() -> POST /api/lessons/:id/notes, POST /api/groups etc.
 * Tokens must stay server-side or use secure session cookies as appropriate.
 */
