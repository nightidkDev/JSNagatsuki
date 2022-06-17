const {
  Client,
  MessageEmbed,
  CommandInteraction,
  MessageAttachment,
} = require("discord.js");
const usersDB = require("../../Schemas/usersDB");
const { COLOR } = require("../../config.json");
const Canvas = require("canvas");
const { request } = require("undici");

module.exports = {
  name: "minfo",
  description: "Посмотреть свой семейный профиль.",

  /**
   *
   * @param {CommandInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    let doc = await usersDB.findOne({ userID: interaction.member.id });
    if (doc.family.partner === "")
      return interaction.reply({
        embeds: [
          new MessageEmbed()
            .setColor("RED")
            .setTitle("🛑 Обнаружена ошибка!")
            .setThumbnail(
              "https://cdn.discordapp.com/attachments/823226730365583422/975819132094251088/Group_259.png"
            )
            .setDescription(`Вы не состоите в брачном союзе.`),
        ],
        ephemeral: true,
      });
    let target = await interaction.guild.members
      .fetch(doc.family.partner)
      .catch((err) => {
        console.log(`${interaction.user.tag} - ${err}`);
      });
    if (!target)
      return interaction.reply({
        embeds: [
          new MessageEmbed()
            .setColor("RED")
            .setTitle("🛑 Обнаружена ошибка!")
            .setThumbnail(
              "https://cdn.discordapp.com/attachments/823226730365583422/975819132094251088/Group_259.png"
            )
            .setDescription(
              `Мне не удалось найти пользователя из вашего брачного союза на сервере.\nПохоже, он/она покинул(-а) его.`
            ),
        ],
        ephemeral: true,
      });
    await interaction.deferReply();
    Canvas.registerFont(`${process.cwd()}/Fonts/proxima_nova.ttf`, {
      family: "Proxima Nova",
      style: "bold",
    });
    const canvas = Canvas.createCanvas(1517, 822);
    const ctx = canvas.getContext("2d");

    const background = await Canvas.loadImage(
      `${process.cwd()}/Images/MInfo/profile.png`
    );
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

    const body1 = (
      await request(interaction.member.displayAvatarURL({ format: "jpg" }))
    ).body;
    const avatarMember = new Canvas.Image();
    avatarMember.src = Buffer.from(await body1.arrayBuffer());

    const avatarMemberCropped = new Canvas.Image();
    avatarMemberCropped.src = cropImage(avatarMember);

    ctx.drawImage(avatarMemberCropped, 82, 136, 198, 198);

    let body2 = (await request(target.displayAvatarURL({ format: "jpg" })))
      .body;
    const avatarTarget = new Canvas.Image();
    avatarTarget.src = Buffer.from(await body2.arrayBuffer());

    const avatarTargetCropped = new Canvas.Image();
    avatarTargetCropped.src = cropImage(avatarTarget);

    ctx.drawImage(avatarTargetCropped, 1248, 136, 198, 198);

    const stroke = await Canvas.loadImage(
      `${process.cwd()}/Images/MInfo/stroke.png`
    );
    ctx.drawImage(stroke, 82, 136, stroke.width, stroke.height);
    ctx.drawImage(stroke, 1248, 136, stroke.width, stroke.height);

    ctx.font = "bold 47px Proxima Nova";
    ctx.fillStyle = "#6B504E";
    ctx.fillText(`${interaction.user.tag}`, 307, 584);
    ctx.fillText(`${target.user.tag}`, 307, 684);

    let date = getDateFromTimeStamp(doc.family.marryTime);
    ctx.fillText(`${date[0]}`, 631, 327);
    ctx.fillText(`${date[1]}`, 675, 451);

    const attachment = new MessageAttachment(
      canvas.toBuffer(),
      `minfo-${interaction.member.id}_${target.id}.png`
    );

    const Embed = new MessageEmbed()
      .setAuthor({
        name: `Семейный профиль • ${interaction.user.tag} и ${target.user.tag}`,
      })
      .setColor(COLOR)
      .setTimestamp()
      .setFooter({
        text: interaction.member.displayName,
        iconURL: interaction.member.displayAvatarURL({ dynamic: true }),
      })
      .setImage(`attachment://minfo-${interaction.member.id}_${target.id}.png`);

    await interaction.editReply({
      embeds: [Embed],
      files: [attachment],
    });
  },
};

/**
 *
 * @param {Canvas.Image} Image
 * @returns {Canvas.Buffer}
 */
function cropImage(Image) {
  const canvas = Canvas.createCanvas(Image.width, Image.height);
  const ctx = canvas.getContext("2d");

  ctx.beginPath();

  ctx.arc(
    Image.width / 2,
    Image.height / 2,
    Image.width / 2 - 2,
    0,
    Math.PI * 2
  );

  ctx.closePath();

  ctx.clip();

  ctx.drawImage(Image, 0, 0, Image.width, Image.height);

  return canvas.toBuffer();
}

/**
 *
 * @param {Number} x
 * @param {Number} y
 * @returns {[Number, Number]}
 */
const divmod = (x, y) => [Math.floor(x / y), x % y];

/**
 *
 * @param {Number} timestamp
 * @returns {[String, String]}
 */
function getDateFromTimeStamp(timestamp) {
  let date = new Date(timestamp * 1000);

  let stringDate = `${date.getDate()}.${
    (date.getMonth() + 1).toString().length == 1
      ? "0" + (date.getMonth() + 1)
      : date.getMonth() + 1
  }.${date.getFullYear()}`;

  let time = parseInt(new Date().getTime() / 1000) - timestamp;
  const minutes = divmod(time, 60);
  const hours = divmod(minutes[0], 60);
  const days = divmod(hours[0], 24);
  let timeoutDate = `${parseInt(days)} ${declension(
    ["день", "дня", "дней"],
    parseInt(days)
  )}`;

  return [stringDate, timeoutDate];
}

/**
 *
 * @param {any[]} forms
 * @param {Number} val
 * @returns {any}
 */
function declension(forms, val) {
  const cases = [2, 0, 1, 1, 1, 2];
  if (val % 100 > 4 && val % 100 < 20) return forms[2];
  else {
    if (val % 10 < 5) return forms[cases[val % 10]];
    else return forms[cases[5]];
  }
}
