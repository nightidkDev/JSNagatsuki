const { Client, CommandInteraction } = require("discord.js");
const {
  createTwoMembersReaction,
  createAllMemberReaction,
} = require("../../Modules/createReactions");
const { bow } = require("../../reactions.json");

module.exports = {
  name: "bow",
  description: "Проявить уважение.",
  options: [
    {
      name: "target",
      description: "Пользователь, которого вы уважаете.",
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
        "проявление уважения",
        "{self} проявляет уважение к {member}",
        bow,
        interaction.member,
        target,
        interaction
      );
    else
      await createAllMemberReaction(
        "проявление уважения",
        "{self} проявляет уважение ко всем.",
        bow,
        interaction.member,
        interaction
      );
  },
};
