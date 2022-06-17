const { Client, MessageEmbed } = require("discord.js");
const mutes = require("../Schemas/mutesDB");
const { COLOR } = require("../config.json");

module.exports = {
  /**
   *
   * @param {Client} client
   */
  async mutes(client) {
    setInterval(() => {
      mutes.find(
        { time: { $lt: parseInt((new Date().getTime() / 1000).toFixed(0)) } },
        async (err, data) => {
          data.forEach(async (m) => {
            const member = client.guilds.cache
              .get("974946487047962714")
              .members.cache.get(m.member);
            await mutes.deleteOne({ member: m.member });
            const Embed = new MessageEmbed()
              .setColor(COLOR)
              .setTimestamp()
              .setAuthor({ name: "Система мутов" });
            if (member)
              member.roles.remove("975841029230055476") &&
                member
                  .send({
                    embeds: [
                      Embed.setDescription(
                        `Милостью Сёгуната вам даровано освобождение, и вы можете снова пить саке в общих войсах и чатах`
                      ).setFooter({
                        text: member.guild.name,
                        iconURL: member.guild.iconURL({ dynamic: true }),
                      }),
                    ],
                  })
                  .catch((err) => {});
          });
        }
      );
    }, 1000);
  },
};
