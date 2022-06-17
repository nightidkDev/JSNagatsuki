const Canvas = require("canvas");
const { Client } = require("discord.js");
const BannerInfo = require("../Schemas/BannerInfo");

module.exports = {
  /**
   *
   * @param {Client} client
   */
  async editBanner(client) {
    setInterval(async () => {
      const guild = client.guilds.cache.get("974946487047962714");
      const voiceMembersCount = guild.members.cache
        .filter((m) => m.voice.channel && !m.user.bot)
        .map((m) => m).length;
      const membersCount = guild.memberCount;
      let bannerInfo = await BannerInfo.findOne({});
      const messagesCount = bannerInfo.messages;

      Canvas.registerFont(`${process.cwd()}/Fonts/proxima_nova.ttf`, {
        family: "Proxima Nova",
        style: "bold",
      });
      const canvas = Canvas.createCanvas(960, 540);
      const ctx = canvas.getContext("2d");

      const banner = await Canvas.loadImage(
        `${process.cwd()}/Images/Banner/xi_banner.png`
      );
      ctx.drawImage(banner, 0, 0, canvas.width, canvas.height);

      ctx.font = "bold 36px Proxima Nova";
      ctx.fillStyle = "#71926B";

      ctx.fillText(voiceMembersCount, 177, 351);
      ctx.fillText(membersCount, 177, 415);
      ctx.fillText(messagesCount, 177, 476);

      guild.edit({ banner: canvas.toBuffer() }).catch(() => {});
    }, 30000);
  },
};
