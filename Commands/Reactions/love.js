const { Client, CommandInteraction } = require("discord.js");
const {
  createTwoMembersReaction,
  createAllMemberReaction,
} = require("../../Modules/createReactions");
const { love } = require("../../reactions.json");

module.exports = {
  name: "love",
  description: "Признаться в любви пользователю.",
  options: [
    {
      name: "target",
      description: "Пользователь, которому вы хотите признаться в любви.",
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
        "признание в любви",
        "{self} признаётся в любви {member}",
        love,
        interaction.member,
        target,
        interaction
      );
    else
      await createAllMemberReaction(
        "признание в любви",
        "{self} признаётся в любви всем.",
        love,
        interaction.member,
        interaction
      );
  },
};
