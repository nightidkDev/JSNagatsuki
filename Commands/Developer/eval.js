const { ContextMenuInteraction, MessageEmbed, Client } = require("discord.js");

module.exports = {
  name: "eval",
  type: "MESSAGE",
  permissions: "ADMINISTRATOR",
  /**
   * @param {ContextMenuInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    if (interaction.member.id != "252378040024301570") {
      interaction.reply({
        content: `u're not owner of this bot`,
        ephemeral: true,
      });
    }
    const message = await interaction.channel.messages.fetch(
      interaction.targetId
    );
    await interaction.deferReply({});

    let res;
    try {
      res = eval(clean(message.content, "`", "").replace("js", ""));
    } catch (err) {
      res = `Error: ${err}`;
    }

    interaction.editReply({
      embeds: [
        new MessageEmbed()
          .setTimestamp()
          .setFooter({
            text: interaction.member.displayName,
            iconURL: interaction.member.displayAvatarURL({ dynamic: true }),
          })
          .setDescription(`\`\`\`js\n${res}\`\`\``)
          .setAuthor({ name: "eval" })
          .setColor(0x2f3136),
      ],
    });
  },
};

/**
 *
 * @param {String} value
 * @param {String} char
 * @param {String} def
 */
function clean(value, char, def) {
  while (value.includes(char)) {
    value = value.replace(char, def);
  }
  return value;
}
