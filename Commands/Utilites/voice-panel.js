const {
  MessageEmbed,
  MessageButton,
  MessageActionRow,
  CommandInteraction,
} = require("discord.js");

module.exports = {
  //replace this with your command handler
  name: "voice-panel",
  description: "Отправить панель войсов.",
  category: "Config",
  permission: "ADMINISTRATOR",
  slash: true,
  guildOnly: true,
  options: [
    {
      name: "channel",
      description: "Канал, в который надо отправить панель войсов.",
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
        `Управлять своим приватным домиком Вы можете через кнопки ниже.
Но, они работают только тогда, когда Вы находитесь в своём домике.

<:pedit:971829775947665418> — изменить название домика.
<:puser:971829776056729611> — установить лимит пользователей.
<:plock:971829775901548615> — закрыть/открыть домик для всех.
<:pkick:971829775888965662> — выгнать пользователя из домика.
<:pkey:971829776123834398> — выдать/забрать доступ в домик пользователю.
<:pvoice:971829775947673620> — забрать/выдать право говорить пользователю.
<:pcrown:971829775993810954> — изменить владельца домка.
<:pfavorite:971831753033539634> — стать новым владельцем домика. (работает только, если нет старого владельца)`
      )
      .setTitle("Управление домиком");

    const bt = new MessageActionRow()
      .addComponents(
        new MessageButton()
          .setCustomId("voice-editname")
          .setEmoji("<:pedit:971829775947665418>")
          .setStyle("SECONDARY")
      )
      .addComponents(
        new MessageButton()
          .setCustomId("voice-editlimit")
          .setEmoji("<:puser:971829776056729611>")
          .setStyle("SECONDARY")
      )
      .addComponents(
        new MessageButton()
          .setCustomId("voice-editlock")
          .setEmoji("<:plock:971829775901548615>")
          .setStyle("SECONDARY")
      )
      .addComponents(
        new MessageButton()
          .setCustomId("voice-kickuser")
          .setEmoji("<:pkick:971829775888965662>")
          .setStyle("SECONDARY")
      );
    const bt2 = new MessageActionRow()
      .addComponents(
        new MessageButton()
          .setCustomId("voice-editaccess")
          .setEmoji("<:pkey:971829776123834398>")
          .setStyle("SECONDARY")
      )
      .addComponents(
        new MessageButton()
          .setCustomId("voice-editvoice")
          .setEmoji("<:pvoice:971829775947673620>")
          .setStyle("SECONDARY")
      )
      .addComponents(
        new MessageButton()
          .setCustomId("voice-editowner")
          .setEmoji("<:pcrown:971829775993810954>")
          .setStyle("SECONDARY")
      )
      .addComponents(
        new MessageButton()
          .setCustomId("voice-selfowner")
          .setEmoji("<:pfavorite:971831753033539634>")
          .setStyle("SECONDARY")
      );

    interaction.reply({
      custom: true,
      content: "Панель отправлена.",
      ephemeral: true,
    });
    channel.send({ embeds: [embed], components: [bt, bt2] });
  },
};
