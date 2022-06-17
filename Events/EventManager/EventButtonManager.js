const {
  Client,
  ButtonInteraction,
  MessageEmbed,
  MessageButton,
  MessageSelectMenu,
} = require("discord.js");
const { COLOR } = require("../../config.json");
const EventsLive = require("../../Schemas/EventsLive");

module.exports = {
  name: "interactionCreate",
  /**
   *
   * @param {ButtonInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    if (!interaction.isButton()) return;
    if (
      !interaction.customId.startsWith("event") &&
      !interaction.customId.startsWith("eventAdmin")
    )
      return;
    const { message, member } = interaction;
    if (message.interaction?.user.id != member.id)
      return interaction.replied
        ? await interaction
            .followUp({
              ephemeral: true,
              embeds: [
                new MessageEmbed()
                  .setTimestamp()
                  .setAuthor({ name: "Мастер управления ивентами" })
                  .setColor(COLOR)
                  .setFooter({
                    text: interaction.member.displayName,
                    iconURL: interaction.member.displayAvatarURL({
                      dynamic: true,
                    }),
                  })
                  .setDescription(
                    "Данный мастер управления ивентами не принадлежит Вам. Вызовите свой командой /event"
                  ),
              ],
            })
            .catch(() => {})
        : await interaction
            .reply({
              ephemeral: true,
              embeds: [
                new MessageEmbed()
                  .setTimestamp()
                  .setAuthor({ name: "Мастер управления ивентами" })
                  .setColor(COLOR)
                  .setFooter({
                    text: interaction.member.displayName,
                    iconURL: interaction.member.displayAvatarURL({
                      dynamic: true,
                    }),
                  })
                  .setDescription(
                    "Данный мастер управления ивентами не принадлежит Вам. Вызовите свой командой /event"
                  ),
              ],
            })
            .catch(() => {});

    const Embed = new MessageEmbed()
      .setTimestamp()
      .setColor(COLOR)
      .setFooter({
        text: interaction.member.displayName,
        iconURL: interaction.member.displayAvatarURL({ dynamic: true }),
      });
    switch (interaction.customId.split("_")[1]) {
      case "CreateEvent":
        {
          interaction.update({
            embeds: [
              Embed.setAuthor({ name: "Создание ивента - Live Editor" }),
            ],
          });
        }
        break;
    }
  },
};
