const {
  Client,
  CommandInteraction,
  MessageEmbed,
  MessageAttachment,
} = require("discord.js");
const usersDB = require("../../Schemas/usersDB");
const { COLOR } = require("../../config.json");
const Canvas = require("canvas");
const { request } = require("undici");

module.exports = {
  name: "profile",
  description: "Просмотр профиля.",
  options: [
    {
      name: "target",
      description: "Пользователь, у которого вы хотите посмотреть профиль.",
      type: "USER",
      required: false,
    },
  ],
  /**
   *
   * @param {CommandInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    await interaction.deferReply();
    let target = interaction.options.getMember("target") || interaction.member;
    let doc = await usersDB.findOne({ userID: target.id });

    Canvas.registerFont(`${process.cwd()}/Fonts/proxima_nova.ttf`, {
      family: "Proxima Nova",
      style: "bold",
    });
    const canvas = Canvas.createCanvas(1517, 822);
    const ctx = canvas.getContext("2d");

    const background = await Canvas.loadImage(
      `${process.cwd()}/Images/Profile/profile.png`
    );
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

    const defaultImage = await Canvas.loadImage(
      `${process.cwd()}/Images/Profile/default.png`
    );

    ctx.drawImage(defaultImage, 0, 0, defaultImage.width, defaultImage.height);

    const stroke = await Canvas.loadImage(
      `${process.cwd()}/Images/Profile/stroke.png`
    );

    const texture = await Canvas.loadImage(
      `${process.cwd()}/Images/Profile/texture.png`
    );

    ctx.fillStyle = "#692222";

    let fillReactWidth =
      parseInt(1518 * parseInt((doc.nowXP / doc.needXP) * 100)) / 100;

    ctx.fillRect(0, 377, fillReactWidth, 81);

    ctx.drawImage(texture, 0, 377, texture.width, texture.height);

    ctx.drawImage(stroke, 53, 285, stroke.width, stroke.height);

    ctx.font = "bold 53px Proxima Nova";
    ctx.fillStyle = "#D2BDBD";

    ctx.fillText(target.user.username, 297, 435);

    ctx.font = "bold 45px Proxima Nova";
    ctx.fillStyle = "#C8C8C8";

    if (doc.level.toString().length === 1)
      ctx.fillText(doc.level.toString(), 1408, 435);
    else if (doc.level.toString().length === 2)
      ctx.fillText(doc.level.toString(), 1385, 435);
    else ctx.fillText(doc.level.toString(), 1365, 435);

    ctx.font = "bold 31px Proxima Nova";
    ctx.fillStyle = "#C8C8C8";
    ctx.fillText("ур.", 1443, 430);

    ctx.font = "bold 47px Proxima Nova";
    ctx.fillStyle = "#745A59";

    if (doc.family.partner === "") ctx.fillText("Отсутствует.", 190, 578);
    else {
      let memberFamily = interaction.guild.members.cache.get(
        doc.family.partner
      );
      if (memberFamily) ctx.fillText(`${memberFamily.user.tag}`, 190, 578);
      else ctx.fillText("Вышел с сервера.", 190, 578);
    }

    if (doc.clan === 0) ctx.fillText("Отсутствует.", 190, 684);
    else {
      ctx.fillText(`undefined.`, 190, 684);
    }

    ctx.beginPath();

    ctx.arc(162, 394, 102, 0, Math.PI * 2, true);

    ctx.closePath();

    ctx.clip();

    const { body } = await request(target.displayAvatarURL({ format: "jpg" }));
    const avatar = new Canvas.Image();
    avatar.src = Buffer.from(await body.arrayBuffer());

    ctx.drawImage(avatar, 59, 290, 218, 218);

    const attachment = new MessageAttachment(
      canvas.toBuffer(),
      `profile-${target.id}.png`
    );

    const Embed = new MessageEmbed()
      .setAuthor({
        name: `Профиль • ${target.user.tag}`,
      })
      .setColor(COLOR)
      .setTimestamp()
      .setFooter({
        text: interaction.member.displayName,
        iconURL: interaction.member.displayAvatarURL({ dynamic: true }),
      })
      .setImage(`attachment://profile-${target.id}.png`);

    await interaction.editReply({
      embeds: [Embed],
      files: [attachment],
    });
  },
};
