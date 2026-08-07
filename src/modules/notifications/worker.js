import { processNotificationJobs } from "./notifications.worker.js";

let processing = false;

setInterval(async () => {
  if (processing) return;
  processing = true;
  try {
    await processNotificationJobs();
  } finally {
    processing = false;
  }
}, 10000);
