const { Client, CommandInteraction } = require("discord.js");
const {
  createTwoMembersReaction,
  createAllMemberReaction,
} = require("../../Modules/createReactions");
const { facepalm } = require("../../reactions.json");

module.exports = {
  name: "facepalm",
  description: "ударить себя по лицу",
  options: [
    {
      name: "target",
      description:
        "Пользователь, из-за которого вы хотите ударить себя по лицу.",
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
        "фейспалм",
        "{self} ударяет себя по лицу из-за {member}",
        facepalm,
        interaction.member,
        target,
        interaction
      );
    else
      await createAllMemberReaction(
        "фейспалм",
        "{self} ударяет себя по лицу.",
        facepalm,
        interaction.member,
        interaction
      );
  },
};
