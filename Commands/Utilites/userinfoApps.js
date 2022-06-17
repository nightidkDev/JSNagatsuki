const { ContextMenuInteraction, MessageEmbed } = require("discord.js");
const usersDB = require("../../Schemas/usersDB");

module.exports = {
  name: "USERINFO",
  type: "USER",
  permissions: "ADMINISTRATOR",
  /**
   * @param {ContextMenuInteraction} interaction
   */
  async execute(interaction) {
    const target = await interaction.guild.members.fetch(interaction.targetId);
    let doc = await usersDB.findOne({ userID: target.id });

    const Response = new MessageEmbed()
      .setColor(0x68c048)
      .setAuthor({
        name: target.user.tag,
        iconURL: target.user.avatarURL({ dynamic: true, size: 512 }),
      })
      .setTimestamp(new Date())
      .setThumbnail(target.user.avatarURL({ dynamic: true, size: 512 }))
      .addFields([
        { name: "ID", value: `${target.user.id}` },
        {
          name: "Никнейм",
          value: `${
            target.nickname == null ? "Не установлен" : `${target.nickname}`
          }`,
        },
        {
          name: "Роли",
          value: `${
            target.roles.cache
              .map((r) => r)
              .sort((r1, r2) => {
                return r2.position - r1.position;
              })
              .join(" ")
              .replace("@everyone", "") || "Нет ролей"
          }`,
        },
        {
          name: "Вошёл на сервер",
          value: `<t:${parseInt(
            target.joinedTimestamp / 1000
          )}> - <t:${parseInt(target.joinedTimestamp / 1000)}:R>`,
        },
        {
          name: "Аккаунт создан",
          value: `<t:${parseInt(target.user.createdAt / 1000)}> - <t:${parseInt(
            target.user.createdAt / 1000
          )}:R>`,
        },
        {
          name: "Статус голосового канала",
          value: `${
            !target.voice.channel
              ? `<:no_voice:980418487535153152> Не находится в голосовом канале.`
              : `<:voice:980418487149297755> <#${target.voice.channelId}> - ${
                  !target.voice.selfMute && !target.voice.mute
                    ? `<:micro:980417734670188634>`
                    : target.voice.mute
                    ? `<:server_mute:980417734665981992>`
                    : `<:self_mute:980417734670176307>`
                } ${
                  !target.voice.selfDeaf && !target.voice.deaf
                    ? `<:heads:980417734682738698>`
                    : target.voice.deaf
                    ? `<:server_deaf:980417734653399050>`
                    : `<:self_deaf:980417734498193439>`
                } ${
                  target.voice.streaming
                    ? `\nСтрим: <:live_1:980429933283262524><:live_2:980429971690512394><:live_3:980430007799283713>`
                    : ``
                }`
          }`,
        },
        {
          name: "Статистика",
          value: `> **Чат**: ${
            !doc.stats || doc.stats?.chat["7d"].length == 0
              ? "\n`Похоже, активность не найдена.`"
              : `\n**Самый активный канал за 30 дней** \n<#${
                  getMostChannel(doc.stats.chat["30d"]).id
                }> - \`${
                  getMostChannel(doc.stats.chat["30d"]).count
                } ${declension(
                  ["сообщение", "сообщения", "сообщений"],
                  getMostChannel(doc.stats.chat["30d"]).count
                )}\`\n\n**7 дней**: \`${getCount(
                  doc.stats.chat["7d"]
                )} ${declension(
                  ["сообщение", "сообщения", "сообщений"],
                  getCount(doc.stats.chat["7d"])
                )}\`\n**14 дней**: \`${getCount(
                  doc.stats.chat["14d"]
                )} ${declension(
                  ["сообщение", "сообщения", "сообщений"],
                  getCount(doc.stats.chat["14d"])
                )}\`\n**30 дней**: \`${getCount(
                  doc.stats.chat["30d"]
                )} ${declension(
                  ["сообщение", "сообщения", "сообщений"],
                  getCount(doc.stats.chat["30d"])
                )}\``
          }\n\n> **Войс**: ${
            !doc.stats || doc.stats?.voice["7d"].length == 0
              ? "\n`Похоже, активность не найдена.`"
              : `\n**Самый активный канал за 30 дней** \n<#${
                  getMostChannel(doc.stats.voice["30d"]).id
                }> - \`${calculateTimeMute(
                  getMostChannel(doc.stats.voice["30d"]).count
                )}\`\n\n**7 дней**: \`${calculateTimeMute(
                  getCount(doc.stats.voice["7d"])
                )}\`\n**14 дней**: \`${calculateTimeMute(
                  getCount(doc.stats.voice["14d"])
                )}\`\n**30 дней**: \`${calculateTimeMute(
                  getCount(doc.stats.voice["30d"])
                )}\``
          }`,
        },
      ]);

    interaction.reply({ embeds: [Response], ephemeral: true }).catch((err) => {
      console.log(err) &&
        interaction.editReply({
          embeds: [
            new MessageEmbed()
              .setColor("RED")
              .setTitle("🛑 Обнаружена ошибка!")
              .setDescription(
                `Сообщите об этой ошибке разработчику.\nКод ошибки: ${err}`
              )
              .setThumbnail(
                "https://cdn.discordapp.com/attachments/823226730365583422/975819132094251088/Group_259.png"
              ),
          ],
        });
    });
  },
};

/**
 *
 * @param {Object[]} array
 */
function getCount(array) {
  let i = 0;
  array.forEach((el) => {
    i += el.count;
  });
  return i;
}

/**
 *
 * @param {Object[]} array
 */
function getMostChannel(array) {
  let i = {
    id: "",
    count: 0,
  };
  array.forEach((el) => {
    el.channels.forEach((c) => {
      if (c.count >= i.count) {
        i = c;
      }
    });
  });
  return getMostChannelSub(i, array);
}

/**
 *
 * @param {Object} element
 * @param {Object[]} array
 */
function getMostChannelSub(element, array) {
  let i = {
    id: element.id,
    count: 0,
  };
  array.forEach((el) => {
    el.channels.forEach((c) => {
      if (c.id == element.id) {
        i.count += c.count;
      }
    });
  });
  return i;
}

/**
 *
 * @param {any[]} forms
 * @param {Number} val
 * @returns {any}
 */
function declension(forms, val) {
  const cases = [2, 0, 1, 1, 1, 2];
  if (val % 100 > 4 && val % 100 < 20) return forms[2];
  else {
    if (val % 10 < 5) return forms[cases[val % 10]];
    else return forms[cases[5]];
  }
}

const divmod = (x, y) => [Math.floor(x / y), x % y];
function calculateTimeMute(seconds) {
  const minutes = divmod(seconds, 60);
  const hours = divmod(minutes[0], 60);
  const days = divmod(hours[0], 24);

  return `${days[0] !== 0 ? days[0] + `дн. ` : ``}${
    days[1] !== 0 ? days[1] + `ч. ` : ``
  }${hours[1] !== 0 ? hours[1] + `м.` : ``}`;
}
