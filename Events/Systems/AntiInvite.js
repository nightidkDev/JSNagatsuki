const { Message, Client } = require("discord.js");

module.exports = {
  name: "messageCreate",

  /**
   *
   * @param {Message} message
   * @param {Client} client
   */
  async execute(message, client) {
    const { content, member, channel } = message;
    if (channel.type === "DM") return;
    if (member.permissions.has("ADMINISTRATOR")) return;
    if (!/^(http|https):\/\/[^ "]+$/.test(content)) return;

    const invite = client
      .fetchInvite(content)
      .then((invite) => {
        if (
          invite.guild.id === "974946487047962714" ||
          invite.guild.id === "604083589570625555"
        )
          return;
        else {
          message.delete();
          member.ban({
            reason: `AntiInvite System - Link in #${channel.name}`,
          });
        }
      })
      .catch((err) => {});
  },
};
