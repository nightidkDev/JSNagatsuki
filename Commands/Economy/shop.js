const { Client, MessageEmbed, CommandInteraction } = require("discord.js");
const { COLOR } = require("../../config.json");
const ShopDB = require("../../Schemas/ShopDB");
const { createAS } = require("../../Modules/createShopPages");
const shopCategories = require("../../ShopCategories.json");

module.exports = {
  name: "shop",
  description: "Магазин",
  permission: "ADMINISTRATOR",
  options: [
    {
      name: "yen",
      description: "Магазин за йены",
      type: "SUB_COMMAND",
    },
    {
      name: "neko",
      description: "Магазин за монетки Неко",
      type: "SUB_COMMAND",
    },
    {
      name: "stamps",
      description: "Магазин за печати Сёгуна",
      type: "SUB_COMMAND",
    },
  ],
  /**
   *
   * @param {CommandInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    await interaction.deferReply({ ephemeral: true });
    let doc = shopCategories[interaction.options.getSubcommand()];
    console.log(shopCategories);
    console.log(doc);

    let shopInit = createAS(1, doc, interaction.member, "categories");

    interaction.editReply({
      embeds: [shopInit[0]],
      components: shopInit[1],
    });
  },
};
