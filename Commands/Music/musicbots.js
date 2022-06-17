const { Client, CommandInteraction, MessageEmbed } = require("discord.js");
const { COLOR } = require("../../config.json");

module.exports = {
  name: "musicbots",
  description: "Показывает свободных музыкальных ботов.",
  /**
   *
   * @param {CommandInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    const Embed = new MessageEmbed()
      .setAuthor({ name: "Музыкальные боты" })
      .setColor(COLOR)
      .setFooter({
        text: interaction.member.displayName,
        iconURL: interaction.member.displayAvatarURL({ dynamic: true }),
      })
      .setTimestamp()
      .setDescription("Все боты управляются через /music");
    musicbots = [
      ["<:xi_miku:978763696346107934>", "978747849066049597"],
      ["<:xi_reiku:978763696115449876>", "978748883100368956"],
      ["<:xi_hiku:978763695721152612>", "978750110626361374"],
    ];
    for (let i = 0; i < musicbots.length; i++) {
      const member = interaction.guild.members.cache.get(musicbots[i][1]);
      let status;
      if (member.user.client.options.presence.status == "invisible")
        status = "<:xi_offline:978761320595857428> **Отключён**";
      else if (member.voice.channel == undefined)
        status = "<:xi_free:978761320507797565> **Свободен**";
      else status = "<:xi_busy:978761320176447499> **Занят**";
      Embed.addField(
        `${musicbots[i][0]} ${member.user.username}`,
        status,
        true
      );
    }

    interaction.reply({ embeds: [Embed] });
  },
};
