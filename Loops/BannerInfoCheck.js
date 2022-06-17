const { Client, MessageEmbed } = require("discord.js");
const { COLOR } = require("../config.json");
const BannerInfo = require("../Schemas/BannerInfo");

module.exports = {
  /**
   *
   * @param {Client} client
   */
  async bannerInfoCheck(client) {
    setInterval(() => {
      BannerInfo.find(
        {
          date: { $lt: new Date().getTime() },
        },
        async (err, data) => {
          data.forEach(async (m) => {
            await BannerInfo.updateOne(
              {},
              {
                $inc: {
                  date: 86400000,
                },
                $set: {
                  messages: 0,
                },
              }
            );
          });
        }
      );
    }, 1000);
  },
};
