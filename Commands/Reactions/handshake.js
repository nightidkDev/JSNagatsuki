const { Client, CommandInteraction } = require("discord.js");
const {
  createTwoMembersReaction,
  createAllMemberReaction,
} = require("../../Modules/createReactions");
const { handshake } = require("../../reactions.json");

module.exports = {
  name: "handshake",
  description: "пожать руку пользователю",
  options: [
    {
      name: "target",
      description: "Пользователь, которому вы хотите пожать руку.",
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
        "пожать руку",
        "{self} жмёт руку {member}",
        handshake,
        interaction.member,
        target,
        interaction
      );
    else
      await createAllMemberReaction(
        "пожать руку",
        "{self} жмёт руку всем.",
        handshake,
        interaction.member,
        interaction
      );
  },
};
