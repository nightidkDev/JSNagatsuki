const {
  MessageEmbed,
  MessageButton,
  MessageActionRow,
  CommandInteraction,
} = require("discord.js");

module.exports = {
  //replace this with your command handler
  name: "ticket-panel",
  description: "Отправить панель тикетов.",
  category: "Config",
  permission: "ADMINISTRATOR",
  slash: true,
  guildOnly: true,
  options: [
    {
      name: "channel",
      description: "Канал, в который надо отправить панель тикетов.",
      type: "CHANNEL",
      channelTypes: [
        "GUILD_TEXT",
        "GUILD_PRIVATE_THREAD",
        "GUILD_PUBLIC_THREAD",
        "GUILD_NEWS_THREAD",
        "GUILD_NEWS",
      ],
      required: true,
    },
  ],
  /**
   *
   * @param {CommandInteraction} interaction
   */
  async execute(interaction) {
    const guild = interaction.guild;
    const channel = interaction.options.getChannel("channel");

    const embed = new MessageEmbed()
      .setColor(0x68c048)
      .setTitle("Открыть тикет")
      .setDescription(
        "__**Как создать тикет?**__\n" +
          "> Нажмите на кнопку, связанную с вашей проблемой.\n" +
          "> После оформления тикета вы сможете получить необходимую помощь.\n" +
          "> Не создавайте тикет, если вам не нужна помощь. Это повлечет за собой наказание."
      )
      .setTitle("Тикеты");

    const bt = new MessageActionRow()
      .addComponents(
        new MessageButton()
          .setCustomId("ticket-player")
          .setLabel("Жалоба на пользователя")
          .setEmoji("<:security:944350352797483059>")
          .setStyle("SUCCESS")
      )
      .addComponents(
        new MessageButton()
          .setCustomId("ticket-bug")
          .setLabel("Сообщить о баге")
          .setEmoji("<:dnd_status:923209325990801428>")
          .setStyle("SUCCESS")
      )
      .addComponents(
        new MessageButton()
          .setCustomId("ticket-feed")
          .setLabel("Отправить отзыв")
          .setEmoji("<:boost:923209020607717437>")
          .setStyle("SUCCESS")
      )
      .addComponents(
        new MessageButton()
          .setCustomId("ticket-staff")
          .setLabel("Жалоба на модератора")
          .setEmoji("<:discordstaff:923208049961869343>")
          .setStyle("DANGER")
      )
      .addComponents(
        new MessageButton()
          .setCustomId("ticket-other")
          .setLabel("Другое")
          .setEmoji("<:DiscordQuestion:923209094687522906>")
          .setStyle("SECONDARY")
      );

    interaction.reply({
      custom: true,
      content: "Панель отправлена.",
      ephemeral: true,
    });
    channel.send({ embeds: [embed], components: [bt] });
  },
};
