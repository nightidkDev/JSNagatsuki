const { Message, Client } = require("discord.js");

module.exports = {
  name: "messageCreate",

  /**
   *
   * @param {Message} message
   * @param {Client} client
   */
  async execute(message, client) {
    const LIMIT = 5;
    const DIFF = 2000;
    let usersMap = client.SpamSystemUsers;
    if (message.author.bot) return;
    if (message.channel.type !== "GUILD_TEXT") return;

    if (usersMap.has(message.author.id)) {
      const userData = usersMap.get(message.author.id);
      const { lastMessage, timer } = userData;
      const difference =
        message.createdTimestamp - lastMessage.createdTimestamp;
      let msgCount = userData.msgCount;

      if (difference > DIFF) {
        clearTimeout(timer);
        userData.msgCount = 1;
        userData.lastMessage = message;
        userData.timer = setTimeout(() => {
          usersMap.delete(message.author.id);
        }, DIFF);
        usersMap.set(message.author.id, userData);
      } else {
        ++msgCount;
        if (parseInt(msgCount) >= LIMIT) {
          //   message.channel.send(
          //     `${message.author}\nПредупреждение: спам запрещён.`
          //   );
          const filtered = [];
          const messages = await message.channel.messages.fetch();
          let i = 0;
          messages.filter((m) => {
            if (m.author.id == message.author.id && LIMIT > i) {
              filtered.push(m);
              i++;
            }
          });
          await message.channel.bulkDelete(filtered, true);
          usersMap.delete(message.author.id);
        } else {
          userData.msgCount = msgCount;
          usersMap.set(message.author.id, userData);
        }
      }
    } else {
      let fn = setTimeout(() => {
        usersMap.delete(message.author.id);
      }, DIFF);
      usersMap.set(message.author.id, {
        msgCount: 1,
        lastMessage: message,
        timer: fn,
      });
    }
  },
};
