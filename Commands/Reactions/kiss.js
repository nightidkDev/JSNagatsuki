const { Client, CommandInteraction } = require("discord.js");
const {
  createConfirmTwoMembersReaction,
  createTwoMembersReaction,
} = require("../../Modules/createReactions");
const { kiss } = require("../../reactions.json");
const usersDB = require("../../Schemas/usersDB");

module.exports = {
  name: "kiss",
  description: "Поцеловать пользователя.",
  options: [
    {
      name: "target",
      description: "Пользователь, которого вы хотите поцеловать.",
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
        "поцелуй",
        "{self} целует {member}",
        kiss,
        interaction.member,
        target,
        interaction
      );
    } else {
      await createConfirmTwoMembersReaction(
        "поцелуй",
        "{member}, {self} вас хочет поцеловать. Что Вы на это ответите?",
        "{self} целует {member}",
        kiss,
        interaction.member,
        target,
        interaction
      );
    }
  },
};
