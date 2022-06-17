const { Client, CommandInteraction, MessageEmbed } = require("discord.js");
const usersDB = require("../../Schemas/usersDB");
const { COLOR } = require("../../config.json");

module.exports = {
  name: "balance",
  description: "Посмотреть баланс.",
  options: [
    {
      name: "target",
      description: "Пользователь, у которого вы хотите посмотреть баланс.",
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

    if (
      (await usersDB.count({ userID: target.id })) === 0 &&
      target.id !== interaction.member.id
    ) {
      await usersDB.create({
        userID: target.id,
        voiceJoinAt: 0,
        voiceTime: 0,
        warns: [],
        currency: { event: 0, donate: 0, common: 0 },
        level: 1,
        nowXP: 0,
        needXP: 0, // change
        family: { partner: "", marryTime: 0, childrens: [] },
        clan: 0,
        inventory: [],
      });
    }

    let doc = await usersDB.findOne({ userID: target.id });

    const Embed = new MessageEmbed()
      .setTimestamp()
      .setFooter({
        text: interaction.member.nickname || interaction.user.username,
        iconURL: interaction.member.displayAvatarURL({ dynamic: true }),
      })
      .setColor(COLOR)
      .setAuthor({ name: `Баланс • ${target.user.tag}` })
      .addFields(
        {
          name: "<:xi_yen:976539761747566653> Йены",
          value: `\`\`\`${doc.currency.common.toFixed(2)}\`\`\``,
          inline: false,
        },
        {
          name: "<:xi_neko_coin:976539858120097812> Монетки Неко",
          value: `\`\`\`${doc.currency.event}\`\`\``,
          inline: false,
        },
        {
          name: "<:xi_shoguns_stamp:976539488748724264> Печати Сёгуна",
          value: `\`\`\`${doc.currency.donate}\`\`\``,
          inline: false,
        }
      )
      .setThumbnail(target.displayAvatarURL({ dynamic: true }));
    interaction.editReply({ embeds: [Embed] });
  },
};
