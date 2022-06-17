const {
  Client,
  ButtonInteraction,
  Modal,
  TextInputComponent,
  MessageActionRow,
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
    if (!interaction.customId.startsWith("mobilecollector")) return;
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
        .setCustomId("mobilecollect-staff")
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
            new TextInputComponent()
              .setCustomId("typemod")
              .setLabel("Где больше всего проводите время?")
              .setPlaceholder("чат/войс")
              .setMinLength(3)
              .setMaxLength(4)
              .setRequired(true)
              .setStyle("SHORT")
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
            new TextInputComponent()
              .setCustomId("stress")
              .setLabel("Ваша стрессоустойчивость от 1 до 5")
              .setMinLength(1)
              .setMaxLength(1)
              .setRequired(true)
              .setStyle("SHORT")
          )
        );
      interaction.showModal(modal);
    } else if (action == "staff2") {
      const modal = new Modal()
        .setCustomId("mobilecollect-staff2")
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
            new TextInputComponent()
              .setCustomId("tolerance")
              .setLabel("Ваша толерантность от 1 до 5")
              .setMinLength(1)
              .setMaxLength(1)
              .setRequired(true)
              .setStyle("SHORT")
          ),
          new MessageActionRow().addComponents(
            new TextInputComponent()
              .setCustomId("communication")
              .setLabel("Ваш навык общения от 1 до 5")
              .setMinLength(1)
              .setMaxLength(1)
              .setRequired(true)
              .setStyle("SHORT")
          ),
          new MessageActionRow().addComponents(
            new TextInputComponent()
              .setCustomId("collective")
              .setLabel("Умение работать в коллективе от 1 до 5")
              .setMinLength(1)
              .setMaxLength(1)
              .setRequired(true)
              .setStyle("SHORT")
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
    }
  },
};
