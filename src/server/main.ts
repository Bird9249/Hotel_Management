import { startChannelAvailabilitySyncJob } from "@/modules/channels/domain/jobs/availability-sync-job";
import { createServer } from "./platform/http/server";

const app = createServer();
startChannelAvailabilitySyncJob();

// auth.api.createUser({
//   body: {
//     email: "admin@admin.com",
//     password: "123456",
//     name: "Admin",
//     role: "admin",
//   },
// });

export default app;
