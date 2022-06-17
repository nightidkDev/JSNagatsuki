const { VoiceState, Client } = require("discord.js");
const usersDB = require("../../Schemas/usersDB");

module.exports = {
  name: "voiceStateUpdate",
  /**
   *
   * @param {VoiceState} VoiceStateBefore
   * @param {VoiceState} VoiceStateAfter
   * @param {Client} client
   */
  async execute(VoiceStateBefore, VoiceStateAfter, client) {
    let member = VoiceStateBefore.member || VoiceStateAfter.member;
    let doc = await usersDB.findOne({ userID: member.id });
    if (!doc)
      await usersDB.create({
        userID: member.id,
        voiceJoinAt: member.voice.channel
          ? parseInt(new Date().getTime() / 1000)
          : 0,
        voiceState: member.voice.channel ? 1 : 0,
        voiceTime: 0,
        warns: [],
        currency: { event: 0, donate: 0, common: 0 },
        level: 1,
        nowXP: 0,
        needXP: 5665,
        family: { partner: "", marryTime: 0, childrens: [] },
        clan: 0,
        inventory: [],
        stats: {
          chat: { "7d": [], "14d": [], "30d": [] },
          voice: { "7d": [], "14d": [], "30d": [] },
        },
      });

    if (!VoiceStateBefore.channel && VoiceStateAfter.channel) {
      await usersDB.updateOne(
        { userID: member.id },
        { voiceJoinAt: parseInt(new Date().getTime() / 1000), voiceState: 1 }
      );
    } else if (VoiceStateBefore.channel && !VoiceStateAfter.channel) {
      await usersDB.updateOne({ userID: member.id }, { voiceState: 0 });
    } else {
      if (VoiceStateBefore.channelId !== VoiceStateAfter.channelId) {
        await usersDB.updateOne(
          { userID: member.id },
          { voiceJoinAt: parseInt(new Date().getTime() / 1000), voiceState: 1 }
        );
      }
    }
  },
};
