const {
  MessageActionRow,
  MessageButton,
  MessageSelectMenu,
  MessageEmbed,
  GuildMember,
} = require("discord.js");
const { COLOR } = require("../config.json");

module.exports = {
  /**
   *
   * @param {Number} page
   * @param {Array} elements
   * @param {GuildMember} member
   * @returns
   */
  createAS: function createAS(page, elements, member, type) {
    const pages = createPages(elements, 8);
    const Embed = new MessageEmbed()
      .setTimestamp()
      .setFooter({
        text: member.displayName,
        iconURL: member.displayAvatarURL({ dynamic: true }),
      })
      .setColor(COLOR);

    const Buttons = new MessageActionRow().addComponents(
      new MessageButton()
        .setCustomId("shop-firstpage")
        .setStyle("SECONDARY")
        .setEmoji("")
        .setLabel("firstpage")
        .setDisabled(page == 1 ? true : false),
      new MessageButton()
        .setCustomId("shop-backpage")
        .setStyle("SECONDARY")
        .setEmoji("")
        .setLabel("backpage")
        .setDisabled(page == 1 ? true : false),
      new MessageButton()
        .setCustomId("shop-nextpage")
        .setStyle("SECONDARY")
        .setEmoji("")
        .setLabel("nextpage")
        .setDisabled(page == pages.length || pages.length == 0 ? true : false),
      new MessageButton()
        .setCustomId("shop-lastpage")
        .setStyle("SECONDARY")
        .setEmoji("")
        .setLabel("lastpage")
        .setDisabled(page == pages.length || pages.length == 0 ? true : false)
    );
    const SelectMenu = new MessageActionRow().addComponents(
      new MessageSelectMenu()
        .setCustomId("shop-selectitem")
        .setDisabled(pages.length == 0 ? true : false)
        .setOptions(
          pages.length > 0
            ? createOptions(pages[page - 1], type)
            : [
                {
                  label: "Ничего не найдено.",
                  value: "empty",
                  default: true,
                },
              ]
        )
    );
    if (pages.length == 0) {
      Embed.setDescription("В магазине ничего не обнаружено.");
    } else {
      if (type == "items") {
        for (let x = 0; x < pages[page - 1].length; x++) {
          Embed.addField(
            `\`Название\``,
            `${pages[pages.length - 1][x].name}`,
            true
          );
          Embed.addField(`|`, `**|**`, true);
          Embed.addField(`\`Цена\``, `${pages[pages - 1][x].price}`, true);
        }
      } else {
        for (let x = 0; x < pages[page - 1].length; x++) {
          Embed.addField(
            `\`Название\``,
            `${pages[pages.length - 1][x].name}`,
            false
          );
          //Embed.addField(`|`, `**|**`, true);
          //Embed.addField(`\`Цена\``, `${pages[pages - 1][x].price}`, true);
        }
      }
    }

    return [Embed, [Buttons, SelectMenu]];
  },
};

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

/**
 *
 * @param {Array} elements
 * @returns
 */
function createOptions(elements, type) {
  let arrReturn = [];
  for (let x = 0; x < elements.length; x++)
    arrReturn.push({
      label: elements[x].name,
      value: type == "items" ? elements[x].uid : elements[x].value,
      description: elements[x].description,
    });
  return arrReturn;
}
