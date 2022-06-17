const { CommandInteraction, Client, MessageEmbed } = require("discord.js");
const usersDB = require("../../Schemas/usersDB");
const { COLOR } = require("../../config.json");

module.exports = {
  name: "change",
  description: "Обмен печатей Сёгуна на йены.",
  options: [
    {
      name: "amount",
      description: "Сумма печатей Сёгуна, которые Вы хотите обменять.",
      type: "INTEGER",
      required: true,
    },
  ],
  /**
   *
   * @param {CommandInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    const { member, options } = interaction;
    const amount = options.getInteger("amount");

    let doc = await usersDB.findOne({ userID: member.id });

    await interaction.deferReply({ ephemeral: true });

    if (amount <= 0)
      return interaction.editReply({
        embeds: [
          new MessageEmbed()
            .setColor(COLOR)
            .setFooter({
              text: member.displayName,
              iconURL: member.displayAvatarURL({ dynamic: true }),
            })
            .setDescription(
              `Количество не должно быть отрицательным или равным нулю.`
            )
            .setAuthor({ name: "Обмен валюты" }),
        ],
      });

    if (amount > doc.currency.donate)
      return interaction.editReply({
        embeds: [
          new MessageEmbed()
            .setColor(COLOR)
            .setFooter({
              text: member.displayName,
              iconURL: member.displayAvatarURL({ dynamic: true }),
            })
            .setDescription(
              `У вас недостаточно печатей, чтобы обменять такую сумму.\nВаш баланс: ${doc.currency.donate} <:xi_shoguns_stamp:976539488748724264>`
            )
            .setAuthor({ name: "Обмен валюты" }),
        ],
      });

    interaction.editReply({
      embeds: [
        new MessageEmbed()
          .setColor(COLOR)
          .setFooter({
            text: member.displayName,
            iconURL: member.displayAvatarURL({ dynamic: true }),
          })
          .setDescription(
            `${amount} <:xi_shoguns_stamp:976539488748724264> переведены в ${
              amount * 1000
            } <:xi_yen:976539761747566653>`
          )
          .setAuthor({ name: "Обмен валюты" }),
      ],
    });

    await usersDB.updateOne(
      { userID: member.id },
      {
        $inc: { "currency.donate": -amount },
        $set: {
          "currency.common": parseFloat(
            (doc.currency.common + amount * 1000).toFixed(2)
          ),
        },
      }
    );
  },
};
