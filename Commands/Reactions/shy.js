const { Client, CommandInteraction } = require("discord.js");
const {
  createTwoMembersReaction,
  createAllMemberReaction,
} = require("../../Modules/createReactions");
const { shy } = require("../../reactions.json");

module.exports = {
  name: "shy",
  description: "Смущаться из-за пользователя.",
  options: [
    {
      name: "target",
      description: "Пользователь, из-за которого вы хотите смутиться.",
      type: "USER",
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

    if (target)
      await createTwoMembersReaction(
        "смущение",
        "{self} смущается из-за {member}",
        shy,
        interaction.member,
        target,
        interaction
      );
    else
      await createAllMemberReaction(
        "смущение",
        "{self} смущается.",
        shy,
        interaction.member,
        interaction
      );
  },
};
