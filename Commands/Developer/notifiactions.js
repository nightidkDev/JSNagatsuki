const {
  Client,
  MessageEmbed,
  CommandInteraction,
  MessageActionRow,
  MessageButton,
  WebhookClient,
} = require("discord.js");

module.exports = {
  name: "notify",
  description: "Вызвать панель уведомлений",
  /**
   *
   * @param {CommandInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    const Embed = new MessageEmbed({
      color: 3092790,
      title: "Выберите тематики по которым вы хотите получать\nуведомления.",
      description:
        "・<:_event:980014305263116308> - Уведомления об ивентах сервера\n・<:_film:980015906170216448> - Уведомления о показе фильмов\n・<:_staff:980016671123185684> - Уведомления о наборах персонала сервера\n・<:_gift:980017430069923860> - Уведомления о розыграшах на сервере",
      color: 3092790,
      image: {
        url: "https://cdn.discordapp.com/attachments/874936029180747786/980020494269042698/Frame_243.png",
      },
    });
    const Embed2 = new MessageEmbed()
      .setImage(
        "https://cdn.discordapp.com/attachments/874936029180747786/980009847078653972/Frame_241.png"
      )
      .setColor(3092790);
    const row = new MessageActionRow().addComponents(
      new MessageButton()
        .setCustomId("notify-event")
        .setStyle("SECONDARY")
        .setEmoji("<:_event:980014305263116308>"),
      new MessageButton()
        .setCustomId("notify-film")
        .setStyle("SECONDARY")
        .setEmoji("<:_film:980015906170216448>"),
      new MessageButton()
        .setCustomId("notify-staff")
        .setStyle("SECONDARY")
        .setEmoji("<:_staff:980016671123185684>"),
      new MessageButton()
        .setCustomId("notify-gift")
        .setStyle("SECONDARY")
        .setEmoji("<:_gift:980017430069923860>")
    );

    // const webhookClient = new WebhookClient({
    //   url: "https://ptb.discord.com/api/webhooks/980021245947023420/ZMIoiErerBM-c1UiPSzO5DgfwpLIOLioegs5CPrkZSPHJyh-i-k0jS539LKcuxeaWWBh",
    // });

    interaction.reply({ ephemeral: true, content: "Отправлено." });
    interaction.channel.send({ embeds: [Embed2, Embed], components: [row] });
  },
};
