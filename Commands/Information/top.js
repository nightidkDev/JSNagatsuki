const { Client, MessageEmbed, CommandInteraction } = require("discord.js");
const usersDB = require("../../Schemas/usersDB");
const { COLOR } = require("../../config.json");

module.exports = {
  name: "top",
  description: "Вывод лидирующих пользователей.",
  options: [
    {
      name: "balance",
      description:
        "Вывод лидирующих пользователей по балансу (йены, монетки Неко, печати Сёгуна).",
      type: "SUB_COMMAND",
      options: [
        {
          name: "type",
          description:
            "Тип валюты, по которым необходимо вывести список лидирующих пользователей.",
          choices: [
            {
              name: "Йены",
              value: "common",
            },
            {
              name: "Монетки Неко",
              value: "event",
            },
            {
              name: "Печати Сёгуна",
              value: "donate",
            },
          ],
          type: "STRING",
          required: true,
        },
      ],
    },
    {
      name: "level",
      description: "Вывод лидирующих пользователей по уровню.",
      type: "SUB_COMMAND",
    },
    {
      name: "voice",
      description:
        "Вывод лидирующих пользователей по активу в голосовых каналах.",
      type: "SUB_COMMAND",
    },
    {
      name: "chat",
      description:
        "Вывод лидирующих пользователей по активу в текстовых каналах.",
      type: "SUB_COMMAND",
    },
  ],
  /**
   *
   * @param {CommandInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    await interaction.deferReply();
    const subCommand = interaction.options.getSubcommand();
    const typeBalance = interaction.options.getString("type");
    let doc;
    if (subCommand == "balance") {
      if (typeBalance == "common")
        doc = (await usersDB.find().sort({ "currency.common": -1 }))
          .slice(0, 10)
          .filter((el) => el.currency.common > 0);
      else if (typeBalance == "event")
        doc = (await usersDB.find().sort({ "currency.event": -1 }))
          .slice(0, 10)
          .filter((el) => el.currency.event > 0);
      else
        doc = (await usersDB.find().sort({ "currency.donate": -1 }))
          .slice(0, 10)
          .filter((el) => el.currency.donate > 0);
    } else if (subCommand == "level")
      doc = (await usersDB.find().sort({ level: -1 }))
        .slice(0, 10)
        .sort((a, b) => b.level - a.level || b.nowXP - a.nowXP)
        .filter((el) => el.level > 0);
    else if (subCommand == "voice")
      doc = (await usersDB.find().sort({ voiceTime: -1 }))
        .slice(0, 10)
        .filter((el) => el.voiceTime > 0);
    else if (subCommand == "chat")
      doc = (await usersDB.find().sort({ messages: -1 }))
        .slice(0, 10)
        .filter((el) => el.messages && el.messages > 0);
    const Embed = new MessageEmbed()
      .setTimestamp()
      .setFooter({
        text: interaction.member.displayName,
        iconURL: interaction.member.displayAvatarURL({ dynamic: true }),
      })
      .setColor(COLOR)
      .setAuthor({ name: "Список лидеров" });
    let top = "";
    for (let i = 0; i < doc.length; i++) {
      const member = interaction.guild.members.cache.get(doc[i].userID);
      top += `\`${i + 1}.\` **${
        member ? member.user.tag : "leaved from server."
      }**\n> ${
        subCommand == "level"
          ? "Уровень (опыт)"
          : subCommand == "voice"
          ? "Время в войсе"
          : subCommand == "chat"
          ? "Количество сообщений"
          : "Баланс"
      }: ${
        subCommand == "level"
          ? `${doc[i].level} (${doc[i].nowXP})`
          : subCommand == "voice"
          ? `${calculateTime(doc[i].voiceTime)}`
          : subCommand == "chat"
          ? `${doc[i].messages}`
          : `${
              typeBalance == "common"
                ? doc[i].currency.common + " <:xi_yen:976539761747566653>"
                : typeBalance == "event"
                ? doc[i].currency.event + " <:xi_neko_coin:976539858120097812>"
                : doc[i].currency.donate +
                  " <:xi_shoguns_stamp:976539488748724264>"
            }`
      }\n\n`;
    }
    Embed.setDescription(top == "" ? "Лидеры отсутствуют." : top);
    interaction.editReply({ embeds: [Embed] });
  },
};

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
function calculateTime(seconds) {
  const minutes = divmod(seconds, 60);
  const hours = divmod(minutes[0], 60);
  const days = divmod(hours[0], 24);

  return `${days[0] !== 0 ? days[0] + `дн. ` : ``}${
    days[1] !== 0 ? days[1] + `ч. ` : ``
  }${hours[1] !== 0 ? hours[1] + `м.` : ``}`;
}
