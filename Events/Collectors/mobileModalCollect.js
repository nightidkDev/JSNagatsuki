const {
  Client,
  ModalSubmitInteraction,
  Modal,
  MessageActionRow,
  MessageSelectMenu,
  TextInputComponent,
  MessageButton,
  MessageEmbed,
} = require("discord.js");
const { COLOR } = require("../../config.json");

module.exports = {
  name: "interactionCreate",
  /**
   *
   * @param {ModalSubmitInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    //console.log(interaction.fields);
    if (!interaction.isModalSubmit()) return;
    if (!interaction.customId.startsWith("mobilecollect")) return;
    let action = interaction.customId.split("-")[1];
    await interaction.deferReply({ ephemeral: true });
    if (action == "staff") {
      const age = interaction.components[0].components[0].value;
      const clock = interaction.components[1].components[0].value;
      const typemod = interaction.components[2].components[0].value;
      const timeforserver = interaction.components[3].components[0].value;
      const stress = interaction.components[4].components[0].value;
      const Row = new MessageActionRow().addComponents(
        new MessageButton()
          .setCustomId(`mobilecollector-staff2`)
          .setLabel("Начать вторую часть заявки")
          .setStyle("SUCCESS")
      );
      let settings = `${age}=${clock}=${typemod}=${timeforserver}=${stress}`;
      const buff = Buffer.from(settings, "utf-8");
      const base64 = buff.toString("base64");
      interaction.editReply({
        ephemeral: true,
        content: `Первая часть заявки заполнена.\nДля продолжения вам необходим ключ. \nКлюч: ${base64}`,
        components: [Row],
      });
    } else if (action == "staff2") {
      const buff = Buffer.from(
        interaction.components[0].components[0].value,
        "base64"
      );
      const utf8 = buff.toString("utf-8");

      const staff1 = utf8.split("=");
      if (staff1.length < 5) {
        return interaction.editReply({
          ephemeral: true,
          content: "Ключ введён неправильно.",
        });
      }
      const age = staff1[0];
      const clock = staff1[1];
      const typemod = staff1[2];
      const timeforserver = staff1[3];
      const stress = staff1[4];
      const tolerance = interaction.components[1].components[0].value;
      const communication = interaction.components[2].components[0].value;
      const collective = interaction.components[3].components[0].value;
      const reason = interaction.components[4].components[0].value;
      interaction.editReply({ ephemeral: true, content: "Заявка подана!" });
      interaction.guild.channels.cache
        .get("979701882098434088")
        .send({
          embeds: [
            new MessageEmbed()
              .setTimestamp()
              .setDescription(
                `Пользователь: ${interaction.member}\nВозраст: ${age}\nЧасовой пояс: ${clock}\nТип модерации: ${typemod}\nВремя для сервера: ${timeforserver}\nСтрессоустойчивость: ${stress}\nТолерантность: ${tolerance}\nНавык общения: ${communication}\nУмение работать в коллективе: ${collective}\nПричина заявки: ${reason}`
              )
              .setColor(COLOR),
          ],
        })
        .catch((err) => {
          console.log(
            `Пользователь: ${interaction.member}\nВозраст: ${age}\nЧасовой пояс: ${clock}\nТип модерации: ${typemod}\nВремя для сервера: ${timeforserver}\nСтрессоустойчивость: ${stress}\nТолерантность: ${tolerance}\nНавык общения: ${communication}\nУмение работать в коллективе: ${collective}\nПричина заявки: ${reason}`
          );
        });
    }
  },
};
