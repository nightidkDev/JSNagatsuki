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
const DonateSponsorDB = require("../../Schemas/DonateSponsorDB");
const Sponsors = require("../../Schemas/Sponsors");

module.exports = {
  name: "sponsor",
  description: "Приобрести спонсорскую роль.",
  /**
   * @param {CommandInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    let amount = 2500;

    let sponsor = await Sponsors.findOne({ member: interaction.member.id });

    if (sponsor)
      return interaction.reply({
        ephemeral: true,
        content: `У вас уже есть приобретённая подписка. Она действует до: <t:${sponsor.time}>`,
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
      comment: `Приобретение спонсорской роли | Nagatsuki - ${interaction.user.tag} (${interaction.user.id})`,
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
                `Статус: Ожидание платежа\nСумма: ${amount} рублей\nПокупка: Спонсорская роль\nПользователь: ${interaction.member}\n\nПлатёж обрабатывается автоматически!\nЕсли вы оплатили и в течение 30 минут вам ничего не пришло -> обратитесь к <@!252378040024301570> (night.#0666)`
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
        await DonateSponsorDB.create({
          member: interaction.user.id,
          time: parseInt((new Date().getTime() / 1000).toFixed(0)) + 4800,
          uid: res.data.id,
          amountRubles: amount,

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
