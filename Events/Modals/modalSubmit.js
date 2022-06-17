const { MessageEmbed, ModalSubmitInteraction } = require("discord.js");

module.exports = {
  name: "interactionCreate",
  /**
   * @param {ModalSubmitInteraction} modal
   */
  async execute(modal) {
    if (!modal.isModalSubmit()) return;
    await modal.deferReply({ ephemeral: true });
    if (modal.customId === "modal-customid") {
      let text = modal.fields.getTextInputValue("textinput-customid");
      let member = modal.member;
      modal.editReply({
        embeds: [
          new MessageEmbed()
            .setColor(0x68c048)
            .setDescription(`Введённый текст: ${text}\nАвтор: ${member}`),
        ],
      });
    }
  },
};
