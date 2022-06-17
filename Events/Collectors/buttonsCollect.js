const {
  Client,
  ButtonInteraction,
  Modal,
  TextInputComponent,
  MessageActionRow,
  MessageSelectMenu,
  MessageEmbed,
} = require("discord.js");
const SetCollectorDB = require("../../Schemas/SetCollectorDB");
const { COLOR } = require("../../config.json");

module.exports = {
  name: "interactionCreate",
  /**
   *
   * @param {ButtonInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    if (!interaction.isButton()) return;
    if (!interaction.customId.startsWith("collector")) return;
    let action = interaction.customId.split("-")[1];
    let doc = await SetCollectorDB.findOne({
      type:
        action == "staff2" ? "staff" : action == "event2" ? "event" : action,
    });
    if (!doc.operate) {
      return interaction.reply({
        ephemeral: true,
        embeds: [
          new MessageEmbed()
            .setColor(COLOR)
            .setDescription("Набор сейчас не производится."),
        ],
      });
    }
    if (action == "staff") {
      const modal = new Modal()
        .setCustomId("collect-staff")
        .setTitle("Набор в модерацию")
        .addComponents(
          new MessageActionRow().addComponents(
            new TextInputComponent()
              .setCustomId("age")
              .setLabel("Ваш возраст:")
              .setMinLength(2)
              .setMaxLength(2)
              .setRequired(true)
              .setStyle("SHORT")
          ),
          new MessageActionRow().addComponents(
            new TextInputComponent()
              .setCustomId("clock")
              .setLabel("Ваш часовой пояс:")
              .setPlaceholder("Пример: (МСК+4)")
              .setMinLength(2)
              .setRequired(true)
              .setStyle("SHORT")
          ),
          new MessageActionRow().addComponents(
            new MessageSelectMenu()
              .setCustomId("typemod")
              .setPlaceholder("Где больше всего проводите время?")
              .addOptions([
                {
                  label: "Текстовые каналы",
                  value: "chat",
                },
                {
                  label: "Голосовые каналы",
                  value: "voice",
                },
              ])
          ),
          new MessageActionRow().addComponents(
            new TextInputComponent()
              .setCustomId("timeforserver")
              .setLabel("Сколько времени готовы уделять серверу?")
              .setMinLength(1)
              .setRequired(true)
              .setStyle("SHORT")
          ),
          new MessageActionRow().addComponents(
            new MessageSelectMenu()
              .setCustomId("stress")
              .setPlaceholder("Ваша стрессоустойчивость от 1 до 5")
              .addOptions([
                {
                  label: "1",
                  value: "1",
                },
                {
                  label: "2",
                  value: "2",
                },
                {
                  label: "3",
                  value: "3",
                },
                {
                  label: "4",
                  value: "4",
                },
                {
                  label: "5",
                  value: "5",
                },
              ])
          )
        );
      interaction.showModal(modal);
    } else if (action == "staff2") {
      const modal = new Modal()
        .setCustomId("collect-staff2")
        .setTitle("Набор в модерацию - часть 2")
        .addComponents(
          new MessageActionRow().addComponents(
            new TextInputComponent()
              .setCustomId("key")
              .setLabel("Ключ")
              .setRequired(true)
              .setStyle("PARAGRAPH")
          ),
          new MessageActionRow().addComponents(
            new MessageSelectMenu()
              .setCustomId("tolerance")
              .setPlaceholder("Ваша толерантность от 1 до 5")
              .addOptions([
                {
                  label: "1",
                  value: "1",
                },
                {
                  label: "2",
                  value: "2",
                },
                {
                  label: "3",
                  value: "3",
                },
                {
                  label: "4",
                  value: "4",
                },
                {
                  label: "5",
                  value: "5",
                },
              ])
          ),
          new MessageActionRow().addComponents(
            new MessageSelectMenu()
              .setCustomId("communication")
              .setPlaceholder("Ваш навык общения от 1 до 5")
              .addOptions([
                {
                  label: "1",
                  value: "1",
                },
                {
                  label: "2",
                  value: "2",
                },
                {
                  label: "3",
                  value: "3",
                },
                {
                  label: "4",
                  value: "4",
                },
                {
                  label: "5",
                  value: "5",
                },
              ])
          ),
          new MessageActionRow().addComponents(
            new MessageSelectMenu()
              .setCustomId("collective")
              .setPlaceholder("Умение работать в коллективе от 1 до 5")
              .addOptions([
                {
                  label: "1",
                  value: "1",
                },
                {
                  label: "2",
                  value: "2",
                },
                {
                  label: "3",
                  value: "3",
                },
                {
                  label: "4",
                  value: "4",
                },
                {
                  label: "5",
                  value: "5",
                },
              ])
          ),
          new MessageActionRow().addComponents(
            new TextInputComponent()
              .setCustomId("reason")
              .setLabel("Почему вы хотите стать модератором?")
              .setMinLength(15)
              .setRequired(true)
              .setStyle("PARAGRAPH")
          )
        );
      interaction.showModal(modal);
    } else if (action == "event") {
      const modal = new Modal()
        .setCustomId("collector-event")
        .setTitle("Набор ивентёров")
        .addComponents(
          new MessageActionRow().addComponents(
            new TextInputComponent()
              .setCustomId("age")
              .setLabel("Ваш возраст:")
              .setMaxLength(2)
              .setMinLength(2)
              .setRequired(true)
              .setStyle("SHORT")
          ),
          new MessageActionRow().addComponents(
            new TextInputComponent()
              .setCustomId("clock")
              .setLabel("Ваш часовой пояс по МСК")
              .setPlaceholder("Пример: (МСК+4)")
              .setRequired(true)
              .setStyle("SHORT")
          ),
          new MessageActionRow().addComponents(
            new TextInputComponent()
              .setCustomId("expirience")
              .setLabel("Имеется ли опыт проведения ивентов?")
              .setRequired(true)
              .setStyle("PARAGRAPH")
          )
        );
      interaction.showModal(modal);
    }
  },
};
