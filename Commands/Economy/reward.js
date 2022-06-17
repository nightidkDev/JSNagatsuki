const { Client, CommandInteraction, MessageEmbed } = require("discord.js");
const { COLOR } = require("../../config.json");
const usersDB = require("../../Schemas/usersDB");

module.exports = {
  name: "reward",
  description: "Выдать пользователю монетки Неко за участие/победу в ивенте.",
  permission: "ADMINISTRATOR",
  options: [
    {
      name: "target",
      description: "Пользователь, которому надо выдать монетки Неко.",
      type: "USER",
      required: true,
    },
    {
      name: "amount",
      description: "Количество монеток Неко, которое необходимо выдать.",
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
    await interaction.deferReply({ ephemeral: true });
    let target = interaction.options.getMember("target");
    let amount = interaction.options.getInteger("amount");

    const Embed = new MessageEmbed()
      .setColor(COLOR)
      .setTimestamp()
      .setAuthor({ name: "Выдача монеток Неко" });

    if (amount <= 0) return await interaction.editReply({ embeds: [Embed] });
    await usersDB.updateOne(
      { userID: target.id },
      { $inc: { "currency.event": amount } }
    );

    await target
      .send({
        embeds: [
          Embed.setDescription(
            `За участие/победу в ивенте Neko no rida дарит вам ${amount} <:xi_neko_coin:976539858120097812>`
          ),
        ],
      })
      .catch((err) => {});

    await interaction.editReply({
      embeds: [
        Embed.setDescription(
          `Пользователю ${target} выдано ${amount} <:xi_neko_coin:976539858120097812>`
        ).setFooter({
          text: interaction.member.nickname || interaction.user.name,
          iconURL: interaction.member.displayAvatarURL({ dynamic: true }),
        }),
      ],
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
