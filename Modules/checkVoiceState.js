const { Client } = require("discord.js");
const usersDB = require("../Schemas/usersDB");

module.exports = {
  /**
   *
   * @param {Client} client
   */
  checkVoiceState: async function checkVoiceState(client) {
    let voiceChannels = client.guilds.cache
      .get("974946487047962714")
      .channels.cache.filter(
        (c) =>
          (c.type === "GUILD_VOICE" || c.type === "GUILD_STAGE_VOICE") &&
          c.members.map((m) => m).length > 0
      )
      .map((c) => c);

    for (let i = 0; i < voiceChannels.length; i++) {
      voiceChannels[0].members.forEach(async (m) => {
        let doc = await usersDB.findOne({ userID: m.id });
        if (!doc)
          await usersDB.create({
            userID: m.id,
            voiceJoinAt: parseInt(new Date().getTime() / 1000),
            voiceState: 1,
            voiceTime: 0,
            warns: [],
            currency: { event: 0, donate: 0, common: 0 },
            level: 1,
            nowXP: 0,
            needXP: 5665,
            family: { partner: "", marryTime: 0, childrens: [] },
            clan: 0,
            inventory: [],
          });
        else {
          if (doc.voiceJoinAt === 0)
            await usersDB.updateOne(
              { userID: m.id },
              {
                $set: {
                  voiceState: 1,
                  voiceJoinAt: parseInt(new Date().getTime() / 1000),
                },
              }
            );
          else
            await usersDB.updateOne(
              { userID: m.id },
              {
                $set: {
                  voiceState: 1,
                },
              }
            );
        }
      });
    }
  },
};
