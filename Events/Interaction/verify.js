const {
  Client,
  ButtonInteraction,
  MessageActionRow,
  MessageButton,
} = require("discord.js");

module.exports = {
  name: "interactionCreate",
  /**
   * @param {ButtonInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    if (!interaction.isButton()) return;
    if (interaction.customId === "verify") {
      interaction.member.roles.add("975303399304224829");
      let newLabel =
        parseInt(interaction.message.components[0].components[1].label) + 1;
      interaction.update({
        components: [
          new MessageActionRow().addComponents(
            new MessageButton()
              .setCustomId("verify")
              .setEmoji("<:xi_ok:977293672255217755>")
              .setStyle("SUCCESS"),
            new MessageButton()
              .setCustomId("count-verify")
              .setLabel(
                `${newLabel} ${declension(
                  ["ронин", "ронина", "ронинов"],
                  newLabel
                )}`
              )
              .setStyle("SECONDARY")
              .setDisabled(true)
          ),
        ],
      });
    }
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
