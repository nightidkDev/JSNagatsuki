const {
  Client,
  MessageEmbed,
  MessageActionRow,
  MessageButton,
  MessageSelectMenu,
  SelectMenuInteraction,
} = require("discord.js");
const { COLOR } = require("../../config.json");
const { getTime, getAuthor } = require("../../Modules/Functions");
const EventsTemplates = require("../../Schemas/EventsTemplates");

module.exports = {
  name: "interactionCreate",
  /**
   *
   * @param {SelectMenuInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    if (!interaction.isSelectMenu()) return;
    if (!interaction.customId.startsWith("SMeventAdmin")) return;
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
      case "templates":
        {
          const option = interaction.component.options[0];
          const ID = option.value.split("-")[1];
          const TemplatesEditor = new MessageActionRow().addComponents(
            new MessageButton()
              .setCustomId(`eventAdmin_TemplN_${ID}_e`)
              .setLabel("Название")
              .setStyle("PRIMARY"),
            new MessageButton()
              .setCustomId(`eventAdmin_TemplD_${ID}_e`)
              .setStyle("PRIMARY")
              .setLabel("Дата"),
            new MessageButton()
              .setCustomId(`eventAdmin_TemplA_${ID}_e`)
              .setStyle("PRIMARY")
              .setLabel("Автор"),
            new MessageButton()
              .setCustomId(`eventAdmin_TemplDP_${ID}_e`)
              .setStyle("PRIMARY")
              .setLabel("Описание")
          );
          const TemplatesEditor2 = new MessageActionRow().addComponents(
            new MessageButton()
              .setCustomId(`eventAdmin_TemplI_${ID}_e`)
              .setStyle("PRIMARY")
              .setLabel("Изображение"),
            new MessageButton()
              .setCustomId(`eventAdmin_TemplL_${ID}_e`)
              .setStyle("PRIMARY")
              .setLabel("Канал")
          );
          const TemplatesChoose = new MessageActionRow().addComponents(
            new MessageButton()
              .setCustomId(`eventAdmin_EditTemplates`)
              .setEmoji("<:incident_actioned:714221559279255583>")
              .setStyle("SUCCESS"),
            new MessageButton()
              .setCustomId(`eventAdmin_TemplC_${ID}`)
              .setEmoji("<:incident_unactioned:714223099645526026>")
              .setStyle("DANGER")
          );

          interaction.update({
            components: [TemplatesEditor, TemplatesEditor2, TemplatesChoose],
            embeds: [await getTextEditor(ID, Embed, interaction.member)],
          });
        }
        break;
    }
  },
};

/**
 *
 * @param {String} doc
 * @param {MessageEmbed} Embed
 * @returns
 */
async function getTextEditor(ID, Embed, member) {
  let doc = await EventsTemplates.findOne({ templateID: ID });
  return Embed.setAuthor({
    name: "Редактирование шаблона - Live Editor",
  })
    .setTitle(`${doc.name} <-> \`Шаблон #${doc.templateID}\``)
    .setDescription(
      `**Внимание: вся информация, что указана подобным образом \`(example)\` будет показана в публикуемом ивенте вместо того, что написано слево!**\n\nВремя проведения: ${
        doc.date
      } \`(${getTime(doc.date)})\`\nАвтор: ${doc.author} \`(${getAuthor(
        doc.author,
        member
      )})\`\nСсылка на голосовой чат ивента: ${
        doc.linkRoom == "{create}"
          ? "{create} `(будет создана автоматически)`"
          : `[Кликни!](${doc.linkRoom})`
      }\nОписание: ${doc.description}`
    )
    .setImage(
      !doc.image.startsWith("http") && !doc.image.startsWith("https")
        ? ""
        : doc.images
    );

  // создать канал cache-images для вставки изображений не только по ссылке //
}
