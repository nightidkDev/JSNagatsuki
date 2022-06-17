const { Client, CommandInteraction, MessageEmbed } = require("discord.js");
const usersDB = require("../../Schemas/usersDB");
const mutesDB = require("../../Schemas/mutesDB");
const { COLOR } = require("../../config.json");

module.exports = {
  name: "warn",
  description: "Выдача предупреждения пользователю.",
  options: [
    {
      name: "target",
      description: "Пользователь, которому надо выдать предупреждение.",
      type: "USER",
      required: true,
    },
    {
      name: "reason",
      description: "Причина, по которой надо выдать предупреждение.",
      type: "STRING",
      required: false,
    },
  ],
  /**
   *
   * @param {CommandInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    let target = interaction.options.getMember("target");
    let reason = interaction.options.getString("reason") || "Скрытая причина.";

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
            "Вы не можете выдать предупреждение владельцу сервера."
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
    doc.warns.push({
      warnTime: parseInt((new Date().getTime() / 1000).toFixed(0)),
      mod: interaction.user.id,
      reason: reason,
    });
    doc.warnsHistory.push({
      warnTime: parseInt((new Date().getTime() / 1000).toFixed(0)),
      mod: interaction.user.id,
      reason: reason,
    });
    await doc.save();

    if (
      doc.warnsHistory.length === 3 ||
      doc.warnsHistory.length === 6 ||
      doc.warnsHistory.length >= 9
    ) {
      if ((await mutesDB.count({ member: target.id })) !== 0) {
        let mute = await mutesDB.findOneAndUpdate(
          { member: target.id },
          {
            $inc: {
              time:
                doc.warnsHistory.length === 3
                  ? 43200
                  : doc.warnsHistory.length === 6
                  ? 86400
                  : 172800,
            },
          }
        );
        mute.reason += " + Системный мут (3/3 предупреждений)";
        await mute.save();
      } else {
        await mutesDB.create({
          member: target.id,
          time:
            parseInt((new Date().getTime() / 1000).toFixed(0)) +
            (doc.warnsHistory.length === 3
              ? 43200
              : doc.warnsHistory.length === 6
              ? 86400
              : 172800),
          mod: interaction.user.id,
          reason: "Системный мут (3/3 предупреждений)",
        });
      }
      target.roles.add("975841029230055476");
      await target
        .send({
          embeds: [
            Embed.setDescription(
              `За нарушение закона правовой Системы Бакуфу вы получаете 3/3 Рицу по причине "**${reason}**" и отправляетесь в Тюрьму Абасири на ${
                doc.warnsHistory.length === 3
                  ? "12 часов"
                  : doc.warnsHistory.length === 6
                  ? "24 часа"
                  : "48 часов"
              }.`
            ),
          ],
        })
        .catch((err) => {});
      await interaction.editReply({
        embeds: [
          Embed.setDescription(
            `За нарушение закона правовой Системы Бакуфу пользователь ${target} получает 3/3 Рицу по причине "**${reason}**" и отправляется в Тюрьму Абасири на ${
              doc.warnsHistory.length === 3
                ? "12 часов"
                : doc.warnsHistory.length === 6
                ? "24 часа"
                : "48 часов"
            }.`
          ).setFooter({
            text: interaction.member.nickname || interaction.user.name,
            iconURL: interaction.member.displayAvatarURL({ dynamic: true }),
          }),
        ],
      });
      doc.warns = [];
      await doc.save();
      if (doc.warns.length === 3) target.roles.add("975840829103038464");
      else if (doc.warns.length === 6)
        target.roles.remove("975840829103038464") &&
          target.roles.add("975841019851603968");
      else
        target.roles.remove("975841019851603968") &&
          target.roles.add("975841081038110760");
    } else {
      await target
        .send({
          embeds: [
            Embed.setDescription(
              `За нарушение закона правовой Системы Бакуфу вы получаете ${doc.warns.length}/3 Рицу по причине: **${reason}**`
            ),
          ],
        })
        .catch((err) => {});
      await interaction.editReply({
        embeds: [
          Embed.setDescription(
            `За нарушение закона правовой Системы Бакуфу пользователь ${target} получает ${doc.warns.length}/3 Рицу по причине: **${reason}**`
          ).setFooter({
            text: interaction.member.nickname || interaction.user.name,
            iconURL: interaction.member.displayAvatarURL({ dynamic: true }),
          }),
        ],
      });
    }
  },
};
