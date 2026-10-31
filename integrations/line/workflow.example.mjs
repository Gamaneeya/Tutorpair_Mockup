/**
 * PSEUDOCODE-level integration points.
 * Plug the functions into a REAL authenticated backend + database.
 * These are NOT route handlers and don't run in the current static site.
 */
import { pushReportNotification, verifyLiffIdToken } from './line-service.mjs';

// POST /api/parents/line/connect
// Requires a real TutorPair web session; req.user is set by auth middleware.
export async function linkParentLine({ authenticatedParentId, idToken, db, fetchImpl }) {
  const parent = await db.getParentById(authenticatedParentId);
  if (!parent) throw new Error('Not an authenticated parent');
  // Verified guardianship/consent is a SEPARATE workflow; do not infer from a child ID.
  const verified = await verifyLiffIdToken({
    idToken,
    lineLoginChannelId: process.env.LINE_LOGIN_CHANNEL_ID,
    fetchImpl
  });
  await db.upsertParentLineAccount(authenticatedParentId, verified.lineUserId);
  return { connected: true }; // This does NOT guarantee the OA is not blocked.
}

// POST /api/session-notes
// Real implementation: authenticate tutor -> check assignment -> save transactionally
// -> enqueue one notification job per linked & opted-in guardian.
export async function publishTutorNote({ authenticatedTutorId, studentId, report, db }) {
  if (!authenticatedTutorId) throw new Error('Tutor authentication required');
  if (!await db.isTutorAssignedToStudent(authenticatedTutorId, studentId)) {
    throw new Error('Tutor is not authorized to report on this student');
  }
  return db.transaction(async tx => {
    const saved = await tx.insertSessionNote({
      tutorId: authenticatedTutorId, studentId, ...report
    });
    const guardians = await tx.findAuthorizedGuardiansWithLineOptIn(studentId);
    for (const guardian of guardians) {
      await tx.insertNotificationJobUnique({
        reportId: saved.id,
        parentId: guardian.parentId,
        kind: 'session_report'
      });
    }
    return saved;
  });
}

// Separate worker. Retry failures; make reportId+parentId unique to avoid duplicates.
export async function sendQueuedNotification({ job, db, fetchImpl }) {
  const linked = await db.getVerifiedLinkedParentForReport(job.parentId, job.reportId);
  if (!linked || !linked.lineOptIn || !linked.lineUserId) return { skipped: true };
  const reportUrl = `${process.env.PUBLIC_APP_ORIGIN}/parent/progress.html`;
  return pushReportNotification({
    lineUserId: linked.lineUserId,
    reportUrl,
    channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
    fetchImpl
  });
}
