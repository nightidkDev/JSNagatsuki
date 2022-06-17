const { Client, CommandInteraction } = require("discord.js");
const {
  createTwoMembersReaction,
  createAllMemberReaction,
} = require("../../Modules/createReactions");
const { hug } = require("../../reactions.json");

module.exports = {
  name: "hug",
  description: "Обнять пользователя",
  options: [
    {
      name: "target",
      description: "Пользователь, которого вы хотите обнять.",
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
        "обнять",
        "{self} обнимает {member}",
        hug,
        interaction.member,
        target,
        interaction
      );
    else
      await createAllMemberReaction(
        "обнять",
        "{self} обнимает всех.",
        hug,
        interaction.member,
        interaction
      );
  },
};
