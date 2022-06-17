const { CommandInteraction, MessageEmbed, Client } = require("discord.js");

module.exports = {
  name: "clear",
  description:
    "Удаляет определённое количество сообщений в канале или от определённого пользователя.",
  permission: "ADMINISTRATOR",
  options: [
    {
      name: "amount",
      description: "Укажите количество сообщений, которое надо удалить.",
      type: "INTEGER",
      required: true,
    },
    {
      name: "target",
      description: "Укажите пользователя, от которого надо удалить сообщения.",
      type: "USER",
      required: false,
    },
  ],
  /**
   * @param {CommandInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    const { channel, options } = interaction;

    const amount = options.getInteger("amount");
    const target = options.getMember("target");

    const messages = await channel.messages.fetch();

    const Response = new MessageEmbed()
      .setColor(0x68c048)
      .setFooter({
        text: interaction.member.nickname,
        iconURL: interaction.member.displayAvatarURL({
          dynamic: true,
          size: 512,
        }),
      })
      .setTimestamp(new Date());

    if (target) {
      let i = 0;
      const filtered = [];
      messages.filter((m) => {
        if (m.author.id == target.id && amount > i) {
          filtered.push(m);
          i++;
        }
      });

      await channel.bulkDelete(filtered, true).then((messages) => {
        Response.setDescription(
          `🧹 Очищено ${messages.size} ${
            messages.size == 1
              ? "сообщение"
              : [3, 4, 5].includes(messages.size)
              ? "сообщения"
              : "сообщений"
          } от ${target}.`
        );
        interaction
          .reply({ embeds: [Response], fetchReply: true })
          .then((m) => {
            setTimeout(() => {
              m.delete();
            }, 5000);
          });
      });
    } else {
      await channel.bulkDelete(amount, true).then((messages) => {
        Response.setDescription(
          `🧹 Очищено ${messages.size} ${
            messages.size == 1
              ? "сообщение"
              : [3, 4, 5].includes(messages.size)
              ? "сообщения"
              : "сообщений"
          }.`
        );
        interaction
          .reply({ embeds: [Response], fetchReply: true })
          .then((m) => {
            setTimeout(() => {
              m.delete();
            }, 5000);
          });
      });
    }
  },
};
