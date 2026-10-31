/**
 * LINE integration handoff for TutorPair (Node.js 18+).
 * This is a reusable server-side adapter, NOT wired to the current static demo.
 * Never import this into frontend/* or publish LINE secrets to the browser.
 */
const PUSH_URL = 'https://api.line.me/v2/bot/message/push';
const ID_VERIFY_URL = 'https://api.line.me/oauth2/v2.1/verify';
const LINE_UID = /^U[0-9a-f]{32}$/;

export function buildReportNotification({ reportUrl }) {
  if (typeof reportUrl !== 'string' || !/^https:\/\/[^\s]+$/.test(reportUrl)) {
    throw new TypeError('reportUrl must be an HTTPS URL');
  }
  return {
    type: 'flex',
    altText: 'TutorPair: มีรายงานหลังเรียนใหม่',
    contents: {
      type: 'bubble',
      size: 'mega',
      header: {
        type: 'box', layout: 'vertical', backgroundColor: '#EDEBFF',
        contents: [{ type: 'text', text: 'TutorPair', size: 'md', weight: 'bold', color: '#4A429F' }]
      },
      body: {
        type: 'box', layout: 'vertical', spacing: 'md',
        contents: [
          { type: 'text', text: 'มีรายงานหลังเรียนใหม่', weight: 'bold', size: 'lg', wrap: true },
          { type: 'text', text: 'ติวเตอร์บันทึกความคืบหน้าและการบ้านเรียบร้อยแล้ว กดเพื่อดูรายละเอียดในบัญชีผู้ปกครอง', size: 'sm', color: '#555555', wrap: true }
        ]
      },
      footer: {
        type: 'box', layout: 'vertical',
        contents: [{ type: 'button', style: 'primary', color: '#6255B8',
          action: { type: 'uri', label: 'ดูรายงาน', uri: reportUrl } }]
      }
    }
  };
}

export async function pushReportNotification({ lineUserId, reportUrl, channelAccessToken, fetchImpl = fetch }) {
  if (!LINE_UID.test(lineUserId || '')) throw new TypeError('Invalid LINE user ID');
  if (!channelAccessToken) throw new Error('Missing server-side LINE_CHANNEL_ACCESS_TOKEN');
  const response = await fetchImpl(PUSH_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${channelAccessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ to: lineUserId, messages: [buildReportNotification({reportUrl})] })
  });
  if (!response.ok) {
    throw new Error(`LINE push failed: HTTP ${response.status}`);
  }
  return { accepted: true, status: response.status };
}

/**
 * Verify LIFF ID tokens on your server. Never accept a userId merely sent
 * as JSON from the browser; obtain the authenticated 'sub' from LINE instead.
 * LINE Login and Messaging API channels must be under the same provider.
 */
export async function verifyLiffIdToken({ idToken, lineLoginChannelId, fetchImpl = fetch }) {
  if (!idToken || !lineLoginChannelId) throw new Error('Missing ID token or LINE Login channel ID');
  const body = new URLSearchParams({ id_token: idToken, client_id: lineLoginChannelId });
  const response = await fetchImpl(ID_VERIFY_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body
  });
  if (!response.ok) throw new Error(`LINE ID token verification failed: HTTP ${response.status}`);
  const payload = await response.json();
  if (!LINE_UID.test(payload?.sub || '')) throw new Error('Invalid verified LINE user ID');
  if (payload.aud !== lineLoginChannelId) throw new Error('Unexpected LINE Login audience');
  return { lineUserId: payload.sub };
}
