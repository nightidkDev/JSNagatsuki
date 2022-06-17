const { Client, Message } = require("discord.js");
const { messageLog } = require("../../Modules/createLog");

module.exports = {
  name: "messageUpdate",
  /**
   *
   * @param {Message} oldMessage
   * @param {Message} newMessage
   * @param {Client} client
   */
  async execute(oldMessage, newMessage, client) {
    if (oldMessage.partial) oldMessage = await oldMessage.fetch();
    if (newMessage.partial) newMessage = await newMessage.fetch();
    if (newMessage.author.bot) return;
    if (!newMessage.guildId) return;
    if (!newMessage.member) return;
    if (newMessage.content == oldMessage.content) return;
    if (newMessage.attachments.map((a) => a).length == 0)
      messageLog(
        client,
        "change",
        oldMessage,
        newMessage,
        newMessage.member,
        newMessage.channel
      );
    else
      messageLog(
        client,
        "change",
        oldMessage,
        newMessage,
        newMessage.member,
        newMessage.channel,
        newMessage.attachments.map((a) => a)[0]
      );
  },
};
