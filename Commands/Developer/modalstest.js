const {
  Client,
  CommandInteraction,
  Modal,
  TextInputComponent,
  MessageActionRow,
} = require("discord.js");

module.exports = {
  name: "modaltest",
  description: "Test modal command.",
  /**
   * @param {CommandInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    const modal = new Modal()
      .setCustomId("modal-customid")
      .setTitle("Test of Discord-Modals!")
      .addComponents(
        new MessageActionRow().addComponents(
          new TextInputComponent()
            .setCustomId("textinput-customid")
            .setLabel("Some text Here")
            .setStyle("SHORT")
            .setMinLength(1)
            .setPlaceholder("Write a text here")
            .setRequired(true)
        )
      );

    interaction.showModal(modal);
  },
};
