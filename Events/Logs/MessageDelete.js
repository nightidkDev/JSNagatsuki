const { Client, Message } = require("discord.js");
const { messageLog } = require("../../Modules/createLog");

module.exports = {
  name: "messageDelete",
  /**
   *
   * @param {Message} message
   * @param {Client} client
   */
  async execute(message, client) {
    if (message.partial) return;
    if (message.author.bot) return;
    if (!message.guildId) return;
    if (!message.member) return;
    if (message.attachments.map((a) => a).length == 0)
      messageLog(
        client,
        "delete",
        null,
        message,
        message.member,
        message.channel
      );
    else
      messageLog(
        client,
        "delete",
        null,
        message,
        message.member,
        message.channel,
        message.attachments.map((a) => a)[0]
      );
  },
};
