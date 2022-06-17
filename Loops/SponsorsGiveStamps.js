const { Client, MessageEmbed } = require("discord.js");
const { COLOR } = require("../config.json");
const Sponsors = require("../Schemas/Sponsors");
const usersDB = require("../Schemas/usersDB");

module.exports = {
  /**
   *
   * @param {Client} client
   */
  async sponsorsGive(client) {
    setInterval(() => {
      Sponsors.find(
        {
          timeGive: { $lt: parseInt((new Date().getTime() / 1000).toFixed(0)) },
        },
        async (err, data) => {
          data.forEach(async (m) => {
            await usersDB.updateOne(
              { userID: m.member },
              { $inc: { "currency.donate": 1 } }
            );
            await Sponsors.updateOne(
              { member: m.member },
              { $inc: { timeGive: 86400 } }
            );
          });
        }
      );
    }, 1000);
  },
};
