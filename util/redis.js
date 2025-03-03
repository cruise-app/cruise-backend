const { createClient } = require("redis");

const redisClient = createClient();

redisClient.on("error", (err) => {
  console.error("❌ Redis Error:", err);
});

const connectRedis = async () => {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
      console.log("✅ Redis Connected Successfully!");
    }
  } catch (err) {
    console.error("❌ Redis Connection Failed:", err);
  }
};

// Connect Redis before exporting
connectRedis();

module.exports = redisClient;
