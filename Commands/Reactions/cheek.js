const { Client, CommandInteraction } = require("discord.js");
const {
  createConfirmTwoMembersReaction,
  createTwoMembersReaction,
} = require("../../Modules/createReactions");
const { cheek } = require("../../reactions.json");
const usersDB = require("../../Schemas/usersDB");

module.exports = {
  name: "cheek",
  description: "Поцеловать пользователя в щёчку.",
  options: [
    {
      name: "target",
      description: "Пользователь, которого вы хотите поцеловать в щёчку.",
      type: "USER",
      required: true,
    },
  ],
  /**
   *
   * @param {CommandInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    let target = interaction.options.getMember("target");

    let doc = await usersDB.findOne({ userID: interaction.member.id });
    if (doc.family.partner === target.id) {
      await createTwoMembersReaction(
        "поцелуй в щёчку",
        "{self} целует в щёчку {member}",
        cheek,
        interaction.member,
        target,
        interaction
      );
    } else {
      await createConfirmTwoMembersReaction(
        "поцелуй в щёчку",
        "{member}, {self} вас хочет поцеловать в щёчку. Что Вы на это ответите?",
        "{self} целует в щёчку {member}",
        cheek,
        interaction.member,
        target,
        interaction
      );
    }
  },
};
