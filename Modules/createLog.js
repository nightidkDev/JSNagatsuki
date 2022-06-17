const {
  MessageEmbed,
  GuildMember,
  VoiceChannel,
  MessageAttachment,
  TextChannel,
  Client,
  Message,
} = require("discord.js");
const { COLOR } = require("../config.json");

messageLogChannel = "979680875853803541";
voiceLogChannel = "979682851085750322";

module.exports = {
  /**
   * Message Log Builder
   * @param {Client} client
   * @param {String} type
   * @param {Message} oldmessage
   * @param {Message} message
   * @param {GuildMember} author
   * @param {TextChannel} channel
   * @param {MessageAttachment} image
   */
  messageLog: function messageLog(
    client,
    type,
    oldmessage,
    message,
    author,
    channel,
    image = undefined
  ) {
    const Embed = new MessageEmbed()
      .setTimestamp()
      .setColor(COLOR)
      .setFooter({
        text: `${author.displayName} | ID: ${author.id}`,
        iconURL: author.displayAvatarURL({ dynamic: true }),
      });
    if (type === "delete") {
      Embed.setAuthor({ name: "Сообщение удалено" });
      Embed.setDescription(`\`\`\`\n${message.content}\n\`\`\``);
      Embed.addFields([
        { name: "Пользователь", value: `${author}`, inline: true },
        { name: "Канал", value: `${channel}`, inline: true },
        {
          name: "Дата сообщения",
          value: `${getDate(message.createdAt)}`,
          inline: true,
        },
      ]);
      if (image) {
        Embed.setImage(`attachment://${image.name}`);
        getChannel(client, "messages").send({
          embeds: [Embed],
          files: [image],
        });
      } else {
        getChannel(client, "messages").send({
          embeds: [Embed],
        });
      }
    } else if (type === "change") {
      Embed.setAuthor({ name: "Сообщение изменено" });
      Embed.addFields([
        { name: "`Старое сообщение`", value: `${oldmessage}`, inline: false },
        { name: "`Новое сообщение`", value: `${message}`, inline: false },
        { name: "Канал", value: `${channel}`, inline: true },
        {
          name: "Дата сообщения",
          value: `${getDate(message.createdAt)}`,
          inline: true,
        },
        {
          name: "Дата изменения",
          value: `${getDate(new Date())}`,
          inline: true,
        },
      ]);
      if (image) {
        Embed.setImage(`attachment://${image.name}`);
        getChannel(client, "messages").send({
          embeds: [Embed],
          files: [image],
        });
      } else {
        getChannel(client, "messages").send({
          embeds: [Embed],
        });
      }
    }
  },
  /**
   * Voice Log Builder
   * @param {Client} client
   * @param {String} type
   * @param {GuildMember} author
   * @param {VoiceChannel} channel
   * @param {VoiceChannel} newChannel
   */
  voiceLog: function voiceLog(
    client,
    type,
    author,
    channel,
    newChannel = undefined
  ) {
    const Embed = new MessageEmbed()
      .setTimestamp()
      .setColor(COLOR)
      .setFooter({
        text: `${author.displayName} | ID: ${author.id}`,
        iconURL: author.displayAvatarURL({ dynamic: true }),
      });
    if (type === "join") {
      Embed.setAuthor({ name: "Пользователь зашёл в голосовой канал" });
      Embed.addFields([
        { name: "Пользователь", value: `${author}`, inline: true },
        { name: "Канал", value: `${channel}`, inline: true },
      ]);
    } else if (type === "leave") {
      Embed.setAuthor({ name: "Пользователь вышел из голосового канала" });
      Embed.addFields([
        { name: "Пользователь", value: `${author}`, inline: true },
        { name: "Канал", value: `${channel}`, inline: true },
      ]);
    } else if (type === "change") {
      Embed.setAuthor({ name: "Пользователь сменил голосовой канал" });
      Embed.addFields([
        { name: "Пользователь", value: `${author}`, inline: true },
        { name: "Старый канал", value: `${channel}`, inline: true },
        { name: "Новый канал", value: `${newChannel}`, inline: true },
      ]);
    }

    getChannel(client, "voices").send({
      embeds: [Embed],
    });
  },
};

/**
 * get log channel (type: messages, voices)
 * @param {Client} client
 * @param {String} type (messages, voices)
 * @returns {TextChannel} TextChannel ? null
 */
function getChannel(client, type) {
  if (type == "messages")
    return client.guilds.cache
      .get("974946487047962714")
      .channels.cache.get(messageLogChannel);
  else if (type == "voices")
    return client.guilds.cache
      .get("974946487047962714")
      .channels.cache.get(voiceLogChannel);
  else return null;
}

/**
 *
 * @param {Date} date
 * @returns {String}
 */
function getDate(date) {
  return `${
    date.getDate().toString().length == 1
      ? "0" + date.getDate()
      : date.getDate()
  }.${
    (date.getMonth() + 1).toString().length == 1
      ? "0" + (date.getMonth() + 1)
      : date.getMonth() + 1
  }.${date.getFullYear()} ${
    date.getHours().toString().length == 1
      ? "0" + date.getHours()
      : date.getHours()
  }:${
    date.getMinutes().toString().length == 1
      ? "0" + date.getMinutes()
      : date.getMinutes()
  }:${
    date.getSeconds().toString().length == 1
      ? "0" + date.getSeconds()
      : date.getSeconds()
  }`;
}
