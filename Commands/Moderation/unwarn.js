const { Client, CommandInteraction, MessageEmbed } = require("discord.js");
const usersDB = require("../../Schemas/usersDB");
const mutesDB = require("../../Schemas/mutesDB");
const { COLOR } = require("../../config.json");

module.exports = {
  name: "unwarn",
  description: "Снятие предупреждения у пользователя.",
  options: [
    {
      name: "target",
      description: "Пользователь, у которого надо снять предупреждение.",
      type: "USER",
      required: true,
    },
  ],
  /**
   *
   * @param {CommandInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    let target = interaction.options.getMember("target");

    const Embed = new MessageEmbed()
      .setColor(COLOR)
      .setTimestamp()
      .setAuthor({ name: "Система предупреждений" });

    if (target.id === interaction.user.id)
      return interaction.reply({
        ephemeral: true,
        embeds: [
          Embed.setDescription("Вы не можете указать себя.").setFooter({
            text: interaction.member.nickname || interaction.user.name,
            iconURL: interaction.member.displayAvatarURL({ dynamic: true }),
          }),
        ],
      });
    if (target.id === interaction.guild.ownerId)
      return interaction.editReply({
        embeds: [
          Embed.setDescription(
            "Вы не можете снять предупреждение у владельца сервера."
          ).setFooter({
            text: interaction.member.nickname || interaction.user.name,
            iconURL: interaction.member.displayAvatarURL({ dynamic: true }),
          }),
        ],
      });
    if (
      target.roles.highest.position >=
        interaction.member.roles.highest.position &&
      interaction.guild.ownerId !== interaction.user.id
    )
      return interaction.reply({
        ephemeral: true,
        embeds: [
          Embed.setDescription(
            "Данный пользователь стоит на одной или выше Вас по роли."
          ).setFooter({
            text: interaction.member.nickname || interaction.user.name,
            iconURL: interaction.member.displayAvatarURL({ dynamic: true }),
          }),
        ],
      });
    await interaction.deferReply();
    let doc = await usersDB.findOne({ userID: target.id });
    doc.warns.pop();
    doc.warnsHistory.pop();
    await doc.save();

    await target
      .send({
        embeds: [
          Embed.setDescription(
            `Член Сёгуната, который выдал вам Рицу, совершил ошибку и задумывается о Харакири. Теперь у Вас ${doc.warns.length}/3 Рицу.`
          ),
        ],
      })
      .catch((err) => {});
    await interaction.editReply({
      embeds: [
        Embed.setDescription(
          `Член Сёгуната, который выдал вам Рицу, совершил ошибку и задумывается о Харакири. Теперь у пользователя ${target} ${doc.warns.length}/3 Рицу.`
        ).setFooter({
          text: interaction.member.nickname || interaction.user.name,
          iconURL: interaction.member.displayAvatarURL({ dynamic: true }),
        }),
      ],
    });
  },
};
