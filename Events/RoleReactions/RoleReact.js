const { Client, ButtonInteraction } = require("discord.js");

module.exports = {
  name: "interactionCreate",
  /**
   * @param {ButtonInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    if (!interaction.isButton()) return;
    if (!interaction.customId.startsWith("notify")) return;

    const { customId, member } = interaction;
    const EventRole = "978965760015732736";
    const GiftRole = "980083770700996673";
    const StaffRole = "978967734446596160";
    const FilmRole = "980083063356784700";

    let action = customId.split("-")[1];
    if (action == "event") {
      if (member.roles.cache.get(EventRole))
        member.roles.remove(EventRole) &&
          interaction.reply({
            ephemeral: true,
            content: `Выполнено! Забрана роль <@&${EventRole}>`,
          });
      else
        member.roles.add(EventRole) &&
          interaction.reply({
            ephemeral: true,
            content: `Выполнено! Выдана роль <@&${EventRole}>`,
          });
    } else if (action == "gift") {
      if (member.roles.cache.get(GiftRole))
        member.roles.remove(GiftRole) &&
          interaction.reply({
            ephemeral: true,
            content: `Выполнено! Забрана роль <@&${GiftRole}>`,
          });
      else
        member.roles.add(GiftRole) &&
          interaction.reply({
            ephemeral: true,
            content: `Выполнено! Выдана роль <@&${GiftRole}>`,
          });
    } else if (action == "staff") {
      if (member.roles.cache.get(StaffRole))
        member.roles.remove(StaffRole) &&
          interaction.reply({
            ephemeral: true,
            content: `Выполнено! Забрана роль <@&${StaffRole}>`,
          });
      else
        member.roles.add(StaffRole) &&
          interaction.reply({
            ephemeral: true,
            content: `Выполнено! Выдана роль <@&${StaffRole}>`,
          });
    } else if (action == "film") {
      if (member.roles.cache.get(FilmRole))
        member.roles.remove(FilmRole) &&
          interaction.reply({
            ephemeral: true,
            content: `Выполнено! Забрана роль <@&${FilmRole}>`,
          });
      else
        member.roles.add(FilmRole) &&
          interaction.reply({
            ephemeral: true,
            content: `Выполнено! Выдана роль <@&${FilmRole}>`,
          });
    }
  },
};
