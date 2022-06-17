const { Client, MessageEmbed, CommandInteraction } = require("discord.js");
const usersDB = require("../../Schemas/usersDB");
const { COLOR } = require("../../config.json");

module.exports = {
  name: "divorce",
  description: "Разрушить брачный союз.",

  /**
   *
   * @param {CommandInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    const Embed = new MessageEmbed()
      .setTimestamp()
      .setFooter({
        text: interaction.member.displayName,
        iconURL: interaction.member.displayAvatarURL({ dynamic: true }),
      })
      .setAuthor({ name: `Реакция: развод` })
      .setColor(COLOR);

    await interaction.deferReply();
    let doc = await usersDB.findOne({ userID: interaction.member.id });

    if (doc.family.partner == "")
      return interaction.editReply({
        embeds: [Embed.setDescription(`У тебя отсутствует брачный союз.`)],
      });

    await interaction.editReply({
      embeds: [
        Embed.setDescription(
          `Брачный союз между ${interaction.member} и <@${doc.family.partner}> был разрушен.`
        ),
      ],
    });

    await usersDB.updateOne(
      { userID: interaction.member },
      { $set: { "family.partner": "", "family.marryTime": 0 } }
    );
    await usersDB.updateOne(
      { userID: doc.family.partner },
      { $set: { "family.partner": "", "family.marryTime": 0 } }
    );

    interaction.member.roles.remove("977703472533209108").catch(() => {});
    interaction.guild.members.cache
      .get(doc.family.partner)
      ?.roles.remove("977703472533209108")
      .catch(() => {});
  },
};
