const {
  MessageEmbed,
  Client,
  MessageActionRow,
  MessageButton,
  MessageSelectMenu,
  ButtonInteraction,
} = require("discord.js");
const EventMember = require("../Schemas/EventMember");
const { COLOR } = require("../config.json");

module.exports = {
  createEventManagersPage: createEventManagersPage,
};

/**
 *
 * @param {{}[]} eventMembers
 * @param {ButtonInteraction} interaction
 * @param {Number} page
 */
function createEventManagersPage(eventMembers, interaction, page = 0) {
  let pages = createPages(eventMembers, 25);
  const Buttons = new MessageActionRow().addComponents(
    new MessageButton()
      .setCustomId("EventEM-firstpage")
      .setStyle("SECONDARY")
      .setEmoji("")
      .setLabel("firstpage")
      .setDisabled(page == 0 ? true : false),
    new MessageButton()
      .setCustomId("EventEM-backpage")
      .setStyle("SECONDARY")
      .setEmoji("")
      .setLabel("backpage")
      .setDisabled(page == 0 ? true : false),
    new MessageButton()
      .setCustomId("EventEM-nextpage")
      .setStyle("SECONDARY")
      .setEmoji("")
      .setLabel("nextpage")
      .setDisabled(
        page == pages.length - 1 || pages.length == 0 ? true : false
      ),
    new MessageButton()
      .setCustomId("EventEM-lastpage")
      .setStyle("SECONDARY")
      .setEmoji("")
      .setLabel("lastpage")
      .setDisabled(page == pages.length - 1 || pages.length == 0 ? true : false)
  );
  const SelectMenu = new MessageActionRow().addComponents(
    new MessageSelectMenu()
      .setCustomId("EventEM-select")
      .setDisabled(pages.length == 0 ? true : false)
      .setOptions(
        pages.length > 0
          ? pages[page]
          : [
              {
                label: "Ивентёры не найдены.",
                value: "empty",
                default: true,
              },
            ]
      )
  );
  const collectorButton = interaction.channel.createMessageComponentCollector({
    componentType: "BUTTON",
    filter: (i) =>
      i.channelId == interaction.channelId &&
      interaction.user.id == i.user.id &&
      i.customId.startsWith("EventEM-"),
    time: 120000,
  });
  const collectorSelect = interaction.channel.createMessageComponentCollector({
    componentType: "SELECT_MENU",
    filter: (i) =>
      i.channelId == interaction.channelId &&
      interaction.user.id == i.user.id &&
      i.customId == "EventEM-select",
    time: 120000,
  });

  collectorButton.on("collect", (i) => {
    collectorButton.stop();
    collectorSelect.stop();
    let pageNew =
      action == "firstPage"
        ? 0
        : action == "backpage"
        ? page - 1
        : action == "nextpage"
        ? page + 1
        : pages.length - 1;
    let action = i.customId.split("-")[1];
    let pagesNew = createEventManagersPage(eventMembers, i, pageNew);
    i.update({
      embeds: [
        Embed.setAuthor({
          name: "Мастер управления ивентами (права администратора)",
        })
          .setDescription(
            `Ниже приведён список ивентёров, для взаимодействия выберете кого-то.\n\nДля добавления ивентёров воспользуйтесь кнопкой "Добавить ивентёра"`
          )
          .setFooter({
            text: `${i.member.displayName} | Страница ${pageNew + 1}/${
              pagesNew[2]
            }`,
            iconURL: i.member.displayAvatarURL({
              dynamic: true,
            }),
          }),
      ],
      components: [
        pagesNew[0],
        pagesNew[1],
        new MessageActionRow().addComponents(
          new MessageButton()
            .setCustomId("eventAdmin_EventMembersActions-add")
            .setStyle("SUCCESS")
            .setLabel("Добавить ивентёра")
        ),
        new MessageActionRow().addComponents(
          new MessageButton()
            .setCustomId("eventAdmin_Home")
            .setStyle("PRIMARY")
            .setLabel("Главная")
        ),
      ],
    });
  });

  collectorSelect.on("collect", async (i) => {
    collectorButton.stop();
    collectorSelect.stop();
    let member = i.guild.members.cache.get(i.component.options[0].value);
    let doc = await EventMember.findOne({ member: member.id });
    const Embed = new MessageEmbed()
      .setTimestamp()
      .setColor(COLOR)
      .setFooter({
        text: i.member.displayName,
        iconURL: i.member.displayAvatarURL({ dynamic: true }),
      })
      .setAuthor({
        name: "Мастер управления ивентами (права администратора)",
      })
      .setDescription("other information in development... try again later.");

    i.update({
      embeds: [Embed],
      components: [],
    }).catch(() => {});
  });

  return [SelectMenu, Buttons, pages.length];
}

/**
 *
 * @param {Array} elements
 * @param {Number} elementPerPage
 * @returns
 */
function createPages(elements, elementPerPage) {
  let arrReturn = [];
  for (let x = 0; x < elements.length; x += elementPerPage)
    arrReturn.push(elements.slice(x, x + elementPerPage));
  return arrReturn;
}
