const { Client } = require("discord.js");
const voiceprivate = require("../Schemas/voice-schema");

module.exports = {
  /**
   *
   * @param {Client} client
   */
  async checkExpirePrivates(client) {
    setInterval(() => {
      voiceprivate.find(
        {
          date: { $lt: new Date().getTime() },
        },
        async (err, data) => {
          data.forEach(async (m) => {
            const channel = client.guilds.cache
              .get("974946487047962714")
              .channels.cache.get(m.voiceID);
            voiceprivate.deleteOne({ voiceID: m.voiceID });
            channel?.delete("24h expire").catch(() => {});
          });
        }
      );
    }, 30000);
  },
};
