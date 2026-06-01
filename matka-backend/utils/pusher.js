import Pusher from "pusher";

let pusherInstance = null;

const hasRequiredEnv = process.env.PUSHER_APP_ID && 
                       process.env.PUSHER_KEY && 
                       process.env.PUSHER_SECRET && 
                       process.env.PUSHER_CLUSTER;

if (hasRequiredEnv) {
  try {
    pusherInstance = new Pusher({
      appId: process.env.PUSHER_APP_ID,
      key: process.env.PUSHER_KEY,
      secret: process.env.PUSHER_SECRET,
      cluster: process.env.PUSHER_CLUSTER,
      useTLS: true
    });
    console.log("✅ Pusher Initialized Successfully");
  } catch (error) {
    console.error("❌ Pusher initialization error:", error);
    pusherInstance = createMockPusher();
  }
} else {
  console.warn("⚠️ Pusher disabled. Missing env vars: PUSHER_APP_ID, PUSHER_KEY, PUSHER_SECRET, or PUSHER_CLUSTER");
  pusherInstance = createMockPusher();
}

function createMockPusher() {
  return {
    trigger: async (channel, event, data) => {
      console.log(`[Pusher Mock] Triggered event "${event}" on channel "${channel}"`);
      return true;
    }
  };
}

export const pusher = pusherInstance;