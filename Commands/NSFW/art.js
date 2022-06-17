const { Client, CommandInteraction } = require("discord.js");
const { COLOR } = require("../../config.json");
const axios = require("axios");
const { stringify } = require("querystring");

module.exports = {
  name: "art",
  description: "18+ аниме арты для Квартала Красных Фонарей.",
  permission: "ADMINISTRATOR",
  options: [
    {
      name: "query",
      description: "Запрос аниме арта.",
      type: "STRING",
      required: false,
    },
  ],
  /**
   *
   * @param {CommandInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    let query = interaction.options.getMember("query") | "";

    const config = {
      proxy: {
        host: "51.222.124.242",
        port: 3128,
      },
      timeout: 10000,
    };

    axios
      .get(`https://gelbooru.com/index.php?page=dapi&q=index&json=1`, config)
      .then(async (res) => {
        console.log(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  },
};

function formatTags(txt) {
  return txt.replace(/,/g, " ");
}
