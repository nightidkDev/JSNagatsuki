const { Client, MessageEmbed, CommandInteraction } = require("discord.js");
const { COLOR } = require("../../config.json");
const mutes = require("../../Schemas/mutesDB");

module.exports = {
  name: "mute",
  description:
    "Забрать у пользователя доступ к текстовым и голосовым каналам на определённое время.",
  options: [
    {
      name: "target",
      description: "Пользователь, у которого будет забран доступ.",
      type: "USER",
      required: true,
    },
    {
      name: "time",
      description:
        "Время, на которое будет забран доступ. Пример: 10ч30м - 10 часов 30 минут.",
      type: "STRING",
      required: true,
    },
    {
      name: "reason",
      description: "Причина, по которой будет забран доступ.",
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
    let target = interaction.options.getMember("target");
    let time = interaction.options.getString("time");
    let reason = interaction.options.getString("reason") || "Скрытая причина.";

    const Embed = new MessageEmbed()
      .setColor(COLOR)
      .setTimestamp()
      .setAuthor({ name: "Система мутов" });

    if (target.id === interaction.user.id)
      return interaction.reply({
        ephemeral: true,
        embeds: [
          Embed.setDescription("Вы не можете указать себя.").setFooter({
            text: interaction.member.nickname || interaction.user.name,
            iconURL: interaction.member.displayAvatarURL({ dynamic: true }),
          }),
        ],
      });
    if (target.id === interaction.guild.ownerId)
      return interaction.reply({
        ephemeral: true,
        embeds: [
          Embed.setDescription(
            "Вы не можете выдать мут владельцу сервера."
          ).setFooter({
            text: interaction.member.nickname || interaction.user.name,
            iconURL: interaction.member.displayAvatarURL({ dynamic: true }),
          }),
        ],
      });
    if (
      target.roles.highest.position >=
        interaction.member.roles.highest.position &&
      interaction.guild.ownerId !== interaction.user.id
    )
      return interaction.reply({
        ephemeral: true,
        embeds: [
          Embed.setDescription(
            "Данный пользователь стоит на одной или выше Вас по роли."
          ).setFooter({
            text: interaction.member.nickname || interaction.user.name,
            iconURL: interaction.member.displayAvatarURL({ dynamic: true }),
          }),
        ],
      });
    if ((await mutes.count({ member: target.id })) !== 0) {
      mutes.findOne({ member: target.id }, (err, data) => {
        if (data)
          interaction.reply({
            ephemeral: true,
            embeds: [
              Embed.setDescription(
                `Пользователь уже отстранён от общения с народом ещё на **${calculateTimeMute(
                  data.time - parseInt((new Date().getTime() / 1000).toFixed(0))
                )}** с причиной **${data.reason}**`
              ).setFooter({
                text: interaction.member.nickname || interaction.user.name,
                iconURL: interaction.member.displayAvatarURL({ dynamic: true }),
              }),
            ],
          });
      });
      return;
    }

    await interaction.deferReply();

    const convert_time = {
      с: 1,
      м: 60,
      ч: 3600,
      д: 86400,
    };

    let timemute = 0;

    const regMute = new RegExp("[0-9]+[ДдЧчМмСс]", "g");
    const regNumber = new RegExp("[0-9]+", "g");
    let foundtime = [...time.matchAll(regMute)];
    for (let match of foundtime) {
      const matchValue = match[0];
      const textValue = (
        (matchValue || "s")[(matchValue?.length || 1) - 1] || "c"
      ).toLowerCase();
      timemute +=
        parseInt((matchValue?.match(regNumber) || ["1"])[0] || "1") *
        convert_time[textValue];
    }

    if (timemute <= 0)
      return interaction.editReply({
        embeds: [
          Embed.setDescription(
            "Время либо не указано, либо в нём содержится ошибка."
          ).setFooter({
            text: interaction.member.nickname || interaction.user.name,
            iconURL: interaction.member.displayAvatarURL({ dynamic: true }),
          }),
        ],
      });

    await interaction.editReply({
      embeds: [
        Embed.setDescription(
          `Сегунат выносит вердикт: пользователь ${target} отстраняется от общения с народом на **${calculateTimeMute(
            timemute
          )}** по причине: **${reason}**`
        ).setFooter({
          text: interaction.member.nickname || interaction.user.name,
          iconURL: interaction.member.displayAvatarURL({ dynamic: true }),
        }),
      ],
    });
    await target
      .send({
        embeds: [
          Embed.setDescription(
            `Сегунат выносит вердикт: вы отстраняетесь от общения с народом на **${calculateTimeMute(
              timemute
            )}** по причине: **${reason}**`
          ).setFooter({
            text: interaction.guild.name,
            iconURL: interaction.guild.iconURL({ dynamic: true }),
          }),
        ],
      })
      .catch((err) => {});
    await mutes.create({
      member: target.id,
      time: parseInt((new Date().getTime() / 1000).toFixed(0)) + timemute,
      mod: interaction.user.id,
      reason: reason,
    });
    target.roles.add("975841029230055476");
  },
};

const divmod = (x, y) => [Math.floor(x / y), x % y];
function calculateTimeMute(seconds) {
  const minutes = divmod(seconds, 60);
  const hours = divmod(minutes[0], 60);
  const days = divmod(hours[0], 24);

  return `${
    days[0] !== 0
      ? days[0] + ` ${declension(["день", "дня", "дней"], days[0])} `
      : ``
  }${
    days[1] !== 0
      ? days[1] + ` ${declension(["час", "часа", "часов"], days[1])} `
      : ``
  }${
    hours[1] !== 0
      ? hours[1] + ` ${declension(["минуту", "минуты", "минут"], hours[1])} `
      : ``
  }${
    minutes[1] !== 0
      ? minutes[1] +
        ` ${declension(["секунду", "секунды", "секунд"], minutes[1])} `
      : ``
  }`;
}
function declension(forms, val) {
  const cases = [2, 0, 1, 1, 1, 2];
  if (val % 100 > 4 && val % 100 < 20) return forms[2];
  else {
    if (val % 10 < 5) return forms[cases[val % 10]];
    else return forms[cases[5]];
  }
}
