const client = require("../../nagatsuki");
const { MessageEmbed } = require("discord.js");
const { COLOR } = require("../../config.json");

const status = (queue) =>
  `Громкость: \`${queue.volume}%\` | Повторение песни: \`${
    queue.repeatMode
      ? queue.repeatMode === 2
        ? "Вся очередь"
        : "Эта песня"
      : "Выключено"
  }\``;
client.distube
  .on("initQueue", (queue) => (queue.volume = 100))
  .on("playSong", (queue, song) => {
    queue.textChannel.send({
      embeds: [
        new MessageEmbed()
          .setColor(COLOR)
          .setTimestamp()
          .setFooter({
            text: song.member.displayName,
            iconURL: song.member.displayAvatarURL({ dyname: true }),
          })
          .setDescription(
            `<:xi_play:977517566304059392> | Начала играть песня \`${
              song.name
            }\` - \`${song.formattedDuration}\`\n\n${status(queue)}`
          ),
      ],
    });
    client.user.setPresence({
      activities: [
        {
          name: `${song.name}`,
          type: "LISTENING",
        },
      ],
      status: "online",
    });
  })
  .on("empty", (queue) => {
    client.user.setPresence({
      activities: [
        {
          name: `meow💚`,
          type: "LISTENING",
        },
      ],
      status: "online",
    });
  })
  .on("deleteQueue", (queue) => {
    client.user.setPresence({
      activities: [
        {
          name: `meow💚`,
          type: "LISTENING",
        },
      ],
      status: "online",
    });
  })
  .on("disconnect", (queue) => {
    client.user.setPresence({
      activities: [
        {
          name: `meow💚`,
          type: "LISTENING",
        },
      ],
      status: "online",
    });
  })
  .on("addSong", (queue, song) =>
    queue.textChannel.send({
      embeds: [
        new MessageEmbed()
          .setColor(COLOR)
          .setTimestamp()
          .setFooter({
            text: song.member.displayName,
            iconURL: song.member.displayAvatarURL({ dyname: true }),
          })
          .setDescription(
            `<:xi_play:977517566304059392> | Добавлена песня \`${
              song.name
            }\` - \`${song.formattedDuration}\`\n\n${status(queue)}`
          ),
      ],
    })
  )
  .on("addList", (queue, playlist) =>
    queue.textChannel.send({
      embeds: [
        new MessageEmbed()
          .setColor(COLOR)
          .setTimestamp()
          .setFooter({
            text: playlist.member.displayName,
            iconURL: playlist.member.displayAvatarURL({ dyname: true }),
          })
          .setDescription(
            `<:xi_play:977517566304059392> | Добавлен плейлист \`${
              playlist.name
            }\` - \`${playlist.songs.length} ${declension(
              ["песня", "песни", "песен"],
              playlist.songs.length
            )}\`- \`${playlist.formattedDuration}\`\n\n${status(queue)}`
          ),
      ],
    })
  )
  .on("error", (channel, e) => {
    channel.send({
      embeds: [
        new MessageEmbed()
          .setColor("RED")
          .setTitle("🛑 Обнаружена ошибка!")
          .setDescription(
            `Сообщите об этой ошибке разработчику.\nКод ошибки: ${e.toString()}`
          )
          .setThumbnail(
            "https://cdn.discordapp.com/attachments/823226730365583422/975819132094251088/Group_259.png"
          ),
      ],
    });
    console.error(e);
  })
  .on("searchNoResult", (message, query) =>
    message.channel.send({
      embeds: [
        new MessageEmbed()
          .setColor(COLOR)
          .setTimestamp()
          .setFooter({
            text: message.member.displayName,
            iconURL: message.member.displayAvatarURL({ dyname: true }),
          })
          .setDescription(
            `🚫 | По запросу ничего не найдено.\n\n${status(queue)}`
          ),
      ],
    })
  );

function declension(forms, val) {
  const cases = [2, 0, 1, 1, 1, 2];
  if (val % 100 > 4 && val % 100 < 20) return forms[2];
  else {
    if (val % 10 < 5) return forms[cases[val % 10]];
    else return forms[cases[5]];
  }
}
