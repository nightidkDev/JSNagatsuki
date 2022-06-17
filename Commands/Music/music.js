const { CommandInteraction, MessageEmbed, Client } = require("discord.js");
const { COLOR } = require("../../config.json");

module.exports = {
  name: "music",
  description: "Музыкальная система.",
  permission: "ADMINISTRATOR",
  options: [
    {
      name: "play",
      description: "Поиск музыки.",
      type: "SUB_COMMAND",
      options: [
        {
          name: "query",
          description: "Укажите название или ссылку на песню.",
          type: "STRING",
          required: true,
        },
      ],
    },
    {
      name: "volume",
      description: "Укажите громкость музыки.",
      type: "SUB_COMMAND",
      options: [
        {
          name: "percent",
          description: "Укажите громкость музыки. 10 = 10%.",
          type: "INTEGER",
          required: true,
        },
      ],
    },
    {
      name: "settings",
      description: "Настройки музыки.",
      type: "SUB_COMMAND",
      options: [
        {
          name: "options",
          description: "Выберете настройку.",
          type: "STRING",
          required: true,
          choices: [
            { name: "#️⃣ Очередь", value: "queue" },
            { name: "⏭ Пропустить", value: "skip" },
            { name: "⏸ Пауза", value: "pause" },
            { name: "▶ Продолжить", value: "resume" },
            { name: "⏹ Остановить", value: "stop" },
            { name: "🔀 Перемешать очередь", value: "shuffle" },
            { name: "🔁 Изменить статус повторения", value: "RepeatMode" },
          ],
        },
      ],
    },
  ],
  /**
   *
   * @param {CommandInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    const { options, member, guild, channel } = interaction;
    const VoiceChannel = member.voice.channel;

    if (!VoiceChannel)
      return interaction.reply({
        content:
          "Вы должны быть в голосовом канале, чтобы использовать музыкальные команды.",
        ephemeral: true,
      });

    if (
      guild.me.voice.channelId &&
      VoiceChannel.id !== guild.me.voice.channelId
    )
      return interaction.reply({
        content: `Я уже играю музыку в <#${guild.me.voice.channelId}>`,
        ephemeral: true,
      });

    try {
      switch (options.getSubcommand()) {
        case "play": {
          const queue = await client.distube.getQueue(VoiceChannel);
          client.distube.play(VoiceChannel, options.getString("query"), {
            textChannel: channel,
            member: member,
          });
          return interaction.reply({
            content: "🔎 Поиск песни...",
            ephemeral: true,
          });
        }
        case "volume": {
          const Volume = options.getInteger("percent");
          if (Volume > 100 || Volume < 1)
            return interaction.reply({
              content: "Громкость должна быть в диапазоне от 1 до 100.",
            });

          client.distube.setVolume(VoiceChannel, Volume);

          return interaction.reply({
            content: `Громкость была установлена на \`${Volume}%\``,
            ephemeral: true,
          });
        }
        case "settings": {
          const queue = await client.distube.getQueue(VoiceChannel);

          if (!queue)
            return interaction.reply({
              content: `⛔ Очередь в данном канале не найдена.`,
              ephemeral: true,
            });

          switch (options.getString("options")) {
            case "skip":
              await queue.skip(VoiceChannel);
              return interaction.reply({
                embeds: [
                  new MessageEmbed()
                    .setColor(COLOR)
                    .setTimestamp()
                    .setFooter({
                      text: member.displayName,
                      iconURL: member.displayAvatarURL({ dyname: true }),
                    })
                    .setDescription(
                      `<:xi_skip:977518489755590657> | Песня пропущена.`
                    ),
                ],
              });

            case "stop":
              await queue.stop(VoiceChannel);
              return interaction.reply({
                content: "⏹ Музыка была остановлена.",
              });
            case "pause":
              await queue.pause(VoiceChannel);
              return interaction.reply({
                content: "⏸ Музыка была поставлена на паузу.",
              });
            case "resume":
              await queue.resume(VoiceChannel);
              return interaction.reply({
                content: "▶ Музыка была снова играет.",
              });
            case "shuffle":
              await queue.shuffle(VoiceChannel);
              return interaction.reply({
                content: "🔀 Очередь была перемешена.",
              });
            case "RepeatMode":
              let mode = await client.distube.setRepeatMode(queue);
              mode = mode
                ? mode === 2
                  ? "Вся очередь"
                  : "Эта песня"
                : "Выключено";
              return interaction.reply({
                content: `🔁 Режим повторения установлен на \`${mode}\``,
              });
            case "queue":
              return interaction
                .reply({
                  embeds: [
                    new MessageEmbed()
                      .setColor(COLOR)
                      .setTimestamp()
                      .setFooter({
                        text: member.displayName,
                        iconURL: member.displayAvatarURL({ dynamic: true }),
                      })
                      .setDescription(
                        `${queue.songs.map(
                          (song, id) =>
                            `\n**${id + 1}**. ${song.name} - \`${
                              song.formattedDuration
                            }\``
                        )})`
                      ),
                  ],
                })
                .catch((err) => {
                  console.log(err);
                  interaction.reply({
                    embeds: [
                      new MessageEmbed()
                        .setColor("RED")
                        .setTitle("🛑 Обнаружена ошибка!")
                        .setDescription(
                          `Сообщите об этой ошибке разработчику.\nКод ошибки: ${err}`
                        )
                        .setThumbnail(
                          "https://cdn.discordapp.com/attachments/823226730365583422/975819132094251088/Group_259.png"
                        ),
                    ],
                    ephemeral: true,
                  });
                });
          }
        }
      }
    } catch (err) {
      return interaction.reply({
        embeds: [
          new MessageEmbed()
            .setColor("RED")
            .setTitle("🛑 Обнаружена ошибка!")
            .setDescription(
              `Сообщите об этой ошибке разработчику.\nКод ошибки: ${err}`
            )
            .setThumbnail(
              "https://cdn.discordapp.com/attachments/823226730365583422/975819132094251088/Group_259.png"
            ),
        ],
        ephemeral: true,
      });
    }
  },
};
