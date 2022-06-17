const {
  Client,
  CommandInteraction,
  MessageEmbed,
  MessageActionRow,
  MessageSelectMenu,
  MessageButton,
} = require("discord.js");
const { COLOR } = require("../../config.json");

module.exports = {
  name: "event",
  description: "Управление ивентами",
  permission: "ADMINISTRATOR",
  options: [
    {
      name: "admin",
      description: "Управление ивентёрами.",
      type: "SUB_COMMAND",
    },
    {
      name: "manage",
      description: "Управление ивентёрами.",
      type: "SUB_COMMAND",
    },
  ],
  /**
   *
   * @param {CommandInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    const Embed = new MessageEmbed()
      .setTimestamp()
      .setColor(COLOR)
      .setFooter({
        text: interaction.member.displayName,
        iconURL: interaction.member.displayAvatarURL({ dynamic: true }),
      });

    const EventManagerAdmin = new MessageActionRow().addComponents(
      new MessageButton()
        .setCustomId("eventAdmin_EditTemplates")
        .setStyle("SECONDARY")
        .setEmoji("<:xi_one:985857614443315212>"),
      new MessageButton()
        .setCustomId("eventAdmin_EventMembersActions")
        .setStyle("SECONDARY")
        .setEmoji("<:xi_two:985857612488802325>")
    );

    const EventManager = new MessageActionRow().addComponents(
      new MessageButton()
        .setCustomId("event_ViewEvents")
        .setStyle("SECONDARY")
        .setEmoji("<:xi_one:985857614443315212>"),
      new MessageButton()
        .setCustomId("event_CreateEvent")
        .setStyle("SECONDARY")
        .setEmoji("<:xi_two:985857612488802325> "),
      new MessageButton()
        .setCustomId("event_EventActions")
        .setStyle("SECONDARY")
        .setEmoji("<:xi_three:985857610773311538>")
    );

    switch (interaction.options.getSubcommand()) {
      case "admin":
        {
          if (
            !interaction.member.roles.cache
              .map((r) => r.id)
              .includes("975443241237360690") &&
            !interaction.member.permissions.has("ADMINISTRATOR")
          )
            return interaction.reply({
              ephemeral: true,
              embeds: [
                Embed.setDescription(
                  "У Вас недостаточно прав для выполнения этой команды."
                ),
              ],
            });
          interaction.reply({
            embeds: [
              Embed.setAuthor({
                name: "Мастер управления ивентами (права администратора)",
              }).setDescription(
                "Добро пожаловать в мастер управления ивентами с правами администратора. Выберете, пожалуйста, опцию, с которой вы хотите работать.\n\n1. Управление шаблонами ивентов\n2. Управление ивентёрами (добавление/удаление)"
              ),
            ],
            components: [EventManagerAdmin],
          });
        }
        break;
      case "manage":
        {
          interaction.reply({
            embeds: [
              Embed.setAuthor({
                name: "Мастер управления ивентами",
              }).setDescription(
                "Добро пожаловать в мастер управления ивентами. Выберете, пожалуйста, опцию, с которой вы хотите работать.\n\n1. Посмотр текущих ивентов\n2. Создание ивента\n3. Управление своим текущим ивентом"
              ),
            ],
            components: [EventManager],
          });
        }
        break;
    }
  },
};
