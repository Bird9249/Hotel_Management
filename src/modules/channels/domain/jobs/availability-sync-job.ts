const DEFAULT_CRON = "*/5 * * * *";
const DEFAULT_INTERVAL_MS = 5 * 60_000;

type SyncJobHandle = {
  stop: () => void;
};

let syncJob: SyncJobHandle | null = null;

function getCronSchedule() {
  if (process.env.CHANNEL_SYNC_CRON?.trim()) {
    return process.env.CHANNEL_SYNC_CRON.trim();
  }

  const intervalMs = Number.parseInt(
    process.env.CHANNEL_SYNC_INTERVAL_MS ?? String(DEFAULT_INTERVAL_MS),
    10,
  );
  if (!Number.isFinite(intervalMs) || intervalMs <= 0) {
    return DEFAULT_CRON;
  }

  const minutes = Math.max(1, Math.round(intervalMs / 60_000));

  if (minutes === 1) return "* * * * *";
  if (minutes >= 60) return "0 * * * *";

  return `*/${minutes} * * * *`;
}

function getIntervalMsFromSchedule(schedule: string) {
  const parsed = Number.parseInt(
    process.env.CHANNEL_SYNC_INTERVAL_MS ?? String(DEFAULT_INTERVAL_MS),
    10,
  );
  if (Number.isFinite(parsed) && parsed > 0) return parsed;

  const stepMatch = schedule.match(/^\*\/(\d+) \* \* \* \*$/);
  if (stepMatch) return Number(stepMatch[1]) * 60_000;

  return DEFAULT_INTERVAL_MS;
}

async function runChannelAvailabilitySync() {
  const { db } = await import("@/server/platform/db/client");
  const { syncAllActiveChannelsService } = await import(
    "../service/sync-channel-availability"
  );
  await syncAllActiveChannelsService(db);
}

async function runChannelAvailabilitySyncSafely() {
  try {
    await runChannelAvailabilitySync();
  } catch (error) {
    console.error("[channel-sync] scheduled sync failed", error);
  }
}

function registerInProcessCron(
  schedule: string,
  handler: () => Promise<void>,
): SyncJobHandle | null {
  const bun = globalThis.Bun;
  if (typeof bun?.cron !== "function") return null;

  try {
    const job = bun.cron(schedule, handler);
    if (job && typeof job.stop === "function") {
      return job;
    }
  } catch {
    return null;
  }

  return null;
}

function registerParseBasedCron(
  schedule: string,
  handler: () => Promise<void>,
): SyncJobHandle | null {
  const bun = globalThis.Bun;
  if (typeof bun?.cron?.parse !== "function") return null;

  let stopped = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let running = false;

  const queueNext = () => {
    if (stopped) return;

    const next = bun.cron.parse(schedule);
    if (!next) {
      console.error(`[channel-sync] invalid cron schedule: ${schedule}`);
      return;
    }

    const delay = Math.max(0, next.getTime() - Date.now());
    timer = setTimeout(() => {
      void (async () => {
        if (stopped || running) return;
        running = true;
        try {
          await handler();
        } finally {
          running = false;
          queueNext();
        }
      })();
    }, delay);
  };

  queueNext();

  return {
    stop() {
      stopped = true;
      if (timer) clearTimeout(timer);
    },
  };
}

function registerIntervalFallback(
  intervalMs: number,
  handler: () => Promise<void>,
): SyncJobHandle {
  let running = false;
  const timer = setInterval(() => {
    if (running) return;
    running = true;
    void handler().finally(() => {
      running = false;
    });
  }, intervalMs);

  return {
    stop() {
      clearInterval(timer);
    },
  };
}

export function startChannelAvailabilitySyncJob() {
  if (process.env.CHANNEL_SYNC_ENABLED === "false") return null;

  const schedule = getCronSchedule();
  const handler = runChannelAvailabilitySyncSafely;

  const inProcess = registerInProcessCron(schedule, handler);
  if (inProcess) {
    syncJob = inProcess;
    console.info(`[channel-sync] registered Bun.cron schedule: ${schedule}`);
  } else {
    const parseBased = registerParseBasedCron(schedule, handler);
    if (parseBased) {
      syncJob = parseBased;
      console.info(
        `[channel-sync] Bun.cron callback unavailable; using Bun.cron.parse fallback: ${schedule}`,
      );
    } else {
      const intervalMs = getIntervalMsFromSchedule(schedule);
      syncJob = registerIntervalFallback(intervalMs, handler);
      console.info(
        `[channel-sync] cron API unavailable; using interval fallback (${intervalMs}ms)`,
      );
    }
  }

  void runChannelAvailabilitySyncSafely();

  return syncJob;
}

export function stopChannelAvailabilitySyncJob() {
  syncJob?.stop();
  syncJob = null;
}
