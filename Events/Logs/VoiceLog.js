const { VoiceState, Client } = require("discord.js");
const { voiceLog } = require("../../Modules/createLog");

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

    if (!VoiceStateBefore.channel && VoiceStateAfter.channel) {
      voiceLog(client, "join", member, VoiceStateAfter.channel);
    } else if (VoiceStateBefore.channel && !VoiceStateAfter.channel) {
      voiceLog(client, "leave", member, VoiceStateBefore.channel);
    } else {
      if (VoiceStateBefore.channelId !== VoiceStateAfter.channelId) {
        voiceLog(
          client,
          "change",
          member,
          VoiceStateBefore.channel,
          VoiceStateAfter.channel
        );
      }
    }
  },
};
