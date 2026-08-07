import NotificationJob from "../../models/notificationJob.model.js";
import { sendEmail } from "../../utils/email.js";
import { buildNotification } from "./notifications.templates.js";

const RETRY_MINUTES = [1, 2, 5, 10, 30];

export async function processNotificationJobs() {
  const jobs = await NotificationJob.find({
    status: "pending",
    next_retry_at: { $lte: new Date() },
  }).limit(20);

  for (const job of jobs) {
    try {
      const template = buildNotification(job.type, job.payload);
      await sendEmail({
        to: job.recipient,
        subject: template.title,
        html: `<h2>${template.title}</h2>
              <p>${template.message}</p>
        `,
      });
      job.status = "sent";
      job.sent_at = new Date();
      await job.save();
    } catch (err) {
      job.attempts++;
      job.last_error = err.message;
      if (job.attempts >= job.max_attempts) job.status = "failed";
      else {
        const delay =
          RETRY_MINUTES[Math.min(job.attempts - 1, RETRY_MINUTES.length - 1)];
        job.next_retry_at = new Date(Date.now() + delay * 60000);
      }
      await job.save();
    }
  }
}
