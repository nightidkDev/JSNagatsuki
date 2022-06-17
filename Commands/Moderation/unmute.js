const { Client, MessageEmbed, CommandInteraction } = require("discord.js");
const { COLOR } = require("../../config.json");
const mutes = require("../../Schemas/mutesDB");

module.exports = {
  name: "unmute",
  description: "Вернуть пользователю доступ к текстовым и голосовым каналам.",
  options: [
    {
      name: "target",
      description: "Пользователь, которому будет возвращён доступ.",
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
      .setAuthor({ name: "Система мутов" });

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
      return interaction.reply({
        ephemeral: true,
        embeds: [
          Embed.setDescription(
            "Вы не можете снять мут владельцу сервера."
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
    if ((await mutes.count({ member: target.id })) === 0)
      return interaction.reply({
        ephemeral: true,
        embeds: [
          Embed.setDescription(
            `Пользователю уже доступны текстовым и голосовые каналы.`
          ).setFooter({
            text: interaction.member.nickname || interaction.user.name,
            iconURL: interaction.member.displayAvatarURL({ dynamic: true }),
          }),
        ],
      });

    await interaction.deferReply();

    await interaction.editReply({
      embeds: [
        Embed.setDescription(
          `Пользователю ${target} был возвращён доступ к текстовым и голосовым каналам.`
        ).setFooter({
          text: interaction.member.nickname || interaction.user.name,
          iconURL: interaction.member.displayAvatarURL({ dynamic: true }),
        }),
      ],
    });

    target
      .send({
        embeds: [
          Embed.setDescription(
            `Милостью Сёгуната вам даровано освобождение, и вы можете снова пить саке в общих войсах и чатах`
          ).setFooter({
            text: interaction.guild.name,
            iconURL: interaction.guild.iconURL({ dynamic: true }),
          }),
        ],
      })
      .catch((err) => {});
    await mutes.deleteOne({
      member: target.id,
    });
    target.roles.remove("975841029230055476");
  },
};
