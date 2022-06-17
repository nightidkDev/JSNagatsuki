const {
  ContextMenuInteraction,
  MessageEmbed,
  Modal,
  TextInputComponent,
  MessageActionRow,
} = require("discord.js");

module.exports = {
  name: "BAN",
  type: "USER",
  permissions: "ADMINISTRATOR",
  /**
   * @param {ContextMenuInteraction} interaction
   */
  async execute(interaction) {
    const target = await interaction.guild.members.fetch(interaction.targetId);
    let model = new Modal()
      .setCustomId(`ban-user|${target.user.id}`)
      .setTitle(`Бан пользователя ${target.user.tag}`)
      .addComponents(
        new MessageActionRow().addComponents(
          new TextInputComponent()
            .setCustomId(`ban-user-reason`)
            .setLabel("Причина бана")
            .setPlaceholder("Плохой человек...")
            .setRequired(true)
            .setStyle("PARAGRAPH")
            .setMinLength(1)
            .setMaxLength(300)
        )
      );
    interaction.showModal(model);
  },
};
