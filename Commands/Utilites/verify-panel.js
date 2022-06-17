const {
  MessageEmbed,
  MessageButton,
  MessageActionRow,
  CommandInteraction,
} = require("discord.js");
const { COLOR } = require("../../config.json");

module.exports = {
  //replace this with your command handler
  name: "verify-panel",
  description: "Отправить панель войсов.",
  /**
   *
   * @param {CommandInteraction} interaction
   */
  async execute(interaction) {
    interaction.channel.send({
      embeds: [
        new MessageEmbed()
          .setDescription(
            "Стой на месте, путник. Ты входишь на территорию, где правят честь и порядок. Назови свое имя! ...Кхм, хорошо. Забудь все идеалы, которыми ты жил до этого. Ознакомься с законами Системы Бакуфу, <#975299970041258054>, и прими их как истинную правду. Всемогущий Сегун дарует тебе титул <@&975303399304224829> и указывает тебе путь истинный! Будь верен нам, и волей императора ты обретешь власть и уважение. Развивай свой ум, будь человечным и прояви храбрость. Kōun o!(Удачи!) "
          )
          .setAuthor({ name: "Верификация" })
          .setColor(COLOR),
      ],
      components: [
        new MessageActionRow().addComponents(
          new MessageButton()
            .setCustomId("verify")
            .setEmoji("<:xi_ok:977293672255217755>")
            .setStyle("SUCCESS"),
          new MessageButton()
            .setCustomId("count-verify")
            .setLabel("0 ронинов")
            .setStyle("SECONDARY")
            .setDisabled(true)
        ),
      ],
    });
    interaction.reply({
      ephemeral: true,
      content: "Верификационная панель отправлена.",
    });
  },
};
