const { VoiceState, GuildMember } = require("discord.js");
const voicePrivateSchema = require("../../Schemas/voice-schema");

module.exports = {
  name: "voiceStateUpdate",
  /**
   *
   * @param {VoiceState} VoiceStateBefore
   * @param {VoiceState} VoiceStateAfter
   */
  async execute(VoiceStateBefore, VoiceStateAfter) {
    let member = VoiceStateAfter.member;
    if (VoiceStateAfter.channel?.id == "975406582760374312") {
      let name =
        member.nickname == null ? member.user.username : member.nickname;
      member.guild.channels
        .create(name, {
          type: "GUILD_VOICE",
          parent: VoiceStateAfter.channel.parent,
          permissionOverwrites: [
            {
              id: member.id,
              allow: ["CONNECT", "SPEAK", "STREAM"],
              deny: ["SEND_MESSAGES", "READ_MESSAGE_HISTORY"],
            },
            {
              id: member.guild.roles.everyone.id,
              deny: ["VIEW_CHANNEL", "SEND_MESSAGES", "READ_MESSAGE_HISTORY"],
            },
            {
              id: "975303399304224829",
              allow: ["VIEW_CHANNEL"],
            },
            {
              id: "976479604959236136",
              deny: [
                "VIEW_CHANNEL",
                "CONNECT",
                "SEND_MESSAGES",
                "READ_MESSAGE_HISTORY",
              ],
            },
          ],
          reason: `Создание приватной комнаты пользователем ${member.user.tag}`,
        })
        .then((c) => {
          member.edit({ channel: c }, `Перенос владельца комнаты.`);
          voicePrivateSchema.create({
            voiceID: c.id,
            ownerID: member.id,
            date: new Date().getTime() + 86400000,
          });
        });
    }

    if (
      VoiceStateBefore.channel?.parentId == 975406530683867199 &&
      VoiceStateBefore?.channel.id != "975406582760374312"
    ) {
      if (VoiceStateBefore.channel.members.map((m) => m).length === 0)
        (await voicePrivateSchema.deleteOne({
          voiceID: VoiceStateBefore.channel.id,
        })) &&
          VoiceStateBefore.channel
            ?.delete("Пустая приватная комната.")
            .catch(() => {});
    }
  },
};
