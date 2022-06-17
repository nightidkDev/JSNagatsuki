const { Client, Interaction } = require("discord.js");
const usersDB = require("../../Schemas/usersDB");

module.exports = {
  name: "interactionCreate",
  /**
   *
   * @param {Interaction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    let member = interaction.member;
    if ((await usersDB.count({ userID: member.id })) === 0) {
      await usersDB.create({
        userID: member.id,
        voiceJoinAt: member.voice.channel
          ? parseInt(new Date().getTime() / 1000)
          : 0,
        voiceState: member.voice.channel !== undefined ? 1 : 0,
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
    }
  },
};
