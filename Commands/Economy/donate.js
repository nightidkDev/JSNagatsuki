const {
  Client,
  MessageEmbed,
  MessageButton,
  MessageActionRow,
  CommandInteraction,
} = require("discord.js");
const { LAVATOKEN, COLOR } = require("../../config.json");
const axios = require("axios");
const { stringify } = require("querystring");
const DonateDB = require("../../Schemas/DonateDB");

module.exports = {
  name: "donate",
  description: "Пожертвование серверу.",
  options: [
    {
      name: "amount",
      description:
        "Укажите, сколько хотите пожертвовать. 1 печать - 100 рублей.",
      type: "INTEGER",
      required: true,
    },
  ],
  /**
   * @param {CommandInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    let amount = interaction.options.getInteger("amount");
    if (amount < 100)
      return interaction.reply({
        embeds: [
          new MessageEmbed()
            .setColor(0x68c048)
            .setDescription(
              "Количество не может быть отрицательным или менее 100."
            )
            .setFooter({
              text: interaction.member.displayName,
              iconURL: interaction.member.displayAvatarURL({
                dynamic: true,
                size: 512,
              }),
            })
            .setTimestamp(new Date()),
        ],
        ephemeral: true,
      });

    if (amount % 100 !== 0)
      return interaction.reply({
        embeds: [
          new MessageEmbed()
            .setColor(0x68c048)
            .setDescription(
              "Количество должно быть ровным.\nПример: 100, 200, 300..."
            )
            .setFooter({
              text: interaction.member.displayName,
              iconURL: interaction.member.displayAvatarURL({
                dynamic: true,
                size: 512,
              }),
            })
            .setTimestamp(new Date()),
        ],
        ephemeral: true,
      });
    await interaction.deferReply({});

    const config = {
      headers: {
        Authorization: LAVATOKEN,
      },
    };

    const data = {
      wallet_to: "R10134514",
      sum: amount,
      success_url: null,
      fail_url: null,
      expire: 60,
      subtract: 1,
      comment: `Пожертвование в бота Nagatsuki - ${interaction.user.tag} (${interaction.user.id})`,
      merchant_name: "XiLidex [RU COM]",
    };

    axios
      .post("https://api.lava.ru/invoice/create", stringify(data), config)
      .then(async (res) => {
        const row = new MessageActionRow();
        row.addComponents(
          new MessageButton()
            .setStyle("LINK")
            .setURL(`${res.data.url}`)
            .setLabel("Перейти к оплате")
        );
        let msg = await interaction.editReply({
          embeds: [
            new MessageEmbed()
              .setDescription(
                `Статус: Ожидание платежа\nСумма: ${amount} рублей\nКоличество: ${
                  amount / 100
                } <:xi_shoguns_stamp:976539488748724264>\nПользователь: ${
                  interaction.member
                }\n\nПлатёж обрабатывается автоматически!\nЕсли вы оплатили и в течение 30 минут вам ничего не пришло -> обратитесь к <@!252378040024301570> (night.#0666)`
              )
              .setColor(COLOR)
              .setFooter({
                text: interaction.member.nickname || interaction.user.username,
                iconURL: interaction.member.displayAvatarURL({ dynamic: true }),
              })
              .setAuthor({ name: "Донат" }),
          ],
          components: [row],
        });
        await DonateDB.create({
          member: interaction.user.id,
          time: parseInt((new Date().getTime() / 1000).toFixed(0)) + 4800,
          uid: res.data.id,
          amountRubles: amount,
          amountStamps: amount / 100,
          channelID: msg.channel.id,
          messageID: msg.id,
        });
      })
      .catch((err) => {
        interaction.editReply({ content: `Error: ${err}` });
      });
  },
};

function declension(forms, val) {
  const cases = [2, 0, 1, 1, 1, 2];
  if (val % 100 > 4 && val % 100 < 20) return forms[2];
  else {
    if (val % 10 < 5) return forms[cases[val % 10]];
    else return forms[cases[5]];
  }
}
