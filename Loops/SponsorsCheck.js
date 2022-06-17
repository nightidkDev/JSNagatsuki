const { Client, MessageEmbed } = require("discord.js");
const { COLOR } = require("../config.json");
const Sponsors = require("../Schemas/Sponsors");
const usersDB = require("../Schemas/usersDB");

module.exports = {
  /**
   *
   * @param {Client} client
   */
  async sponsorsCheck(client) {
    setInterval(() => {
      Sponsors.find(
        {
          time: { $lt: parseInt((new Date().getTime() / 1000).toFixed(0)) },
        },
        async (err, data) => {
          data.forEach(async (m) => {
            const member = client.guilds.cache
              .get("974946487047962714")
              .members.cache.get(m.member);
            await Sponsors.deleteOne({ member: m.member });
            member.roles.remove("977667260808306750").catch(() => {});
          });
        }
      );
    }, 1000);
  },
};
