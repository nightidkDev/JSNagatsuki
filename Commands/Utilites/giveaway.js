const { CommandInteraction, Client, MessageEmbed } = require("discord.js");
const { COLOR } = require("../../config.json");

module.exports = {
  name: "giveaway",
  description: "Система розыгрышей призов.",
  permission: "ADMINISTRATOR",
  options: [
    {
      name: "start",
      description: "Начать розыгрыш.",
      type: "SUB_COMMAND",
      options: [
        {
          name: "duration",
          description: "Укажите длительно этого розыгрыша. (1ч30м)",
          type: "STRING",
          required: true,
        },
        {
          name: "winners",
          description: "Укажите количество побидетелей.",
          type: "INTEGER",
          required: true,
        },
        {
          name: "prize",
          description: "Укажите название приза.",
          type: "STRING",
          required: true,
        },
        {
          name: "channel",
          description:
            "Укажите канал, в который необходимо отправить розыгрыш.",
          type: "CHANNEL",
          channelTypes: ["GUILD_TEXT"],
        },
      ],
    },
    {
      name: "actions",
      description: "Действия с розыгрышем.",
      type: "SUB_COMMAND",
      options: [
        {
          name: "options",
          description: "Выберете действие",
          type: "STRING",
          required: true,
          choices: [
            {
              name: "end",
              value: "end",
            },
            {
              name: "pause",
              value: "pause",
            },
            {
              name: "unpause",
              value: "unpause",
            },
            {
              name: "reroll",
              value: "reroll",
            },
            {
              name: "delete",
              value: "delete",
            },
          ],
        },
        {
          name: "message_id",
          description: "Укажите id сообщения с розыгрышем.",
          type: "STRING",
          required: true,
        },
      ],
    },
  ],
  /**
   *
   * @param {CommandInteraction} interaction
   * @param {Client} client
   */
  execute(interaction, client) {
    const { options } = interaction;
    const Sub = options.getSubcommand();

    const errorEmbed = new MessageEmbed()
      .setColor("RED")
      .setTitle("🛑 Обнаружена ошибка!")
      .setThumbnail(
        "https://cdn.discordapp.com/attachments/823226730365583422/975819132094251088/Group_259.png"
      );

    const successEmbed = new MessageEmbed().setColor(COLOR);

    const optionsGiveaway = {
      lastChance: {
        enabled: true,
        content: "⚠️ **ПОСЛЕДНИЙ ШАНС, ЧТОБЫ УСПЕТЬ!** ⚠️",
        threshold: 5000,
        embedColor: COLOR,
      },
      pauseOptions: {
        isPaused: true,
        content: "⚠️ **РОЗЫГРЫШ ПРИОСТАНОВЛЕН** ⚠️",
        unPauseAfter: null,
        embedColor: "#FFFF00",
        infiniteDurationText: "`NEVER`",
      },
      messages: {
        giveaway: "🎉🎉 **РОЗЫГРЫШ** 🎉🎉",
        giveawayEnded: "🎉🎉 **РОЗЫГРЫШ ОКОНЧЕН** 🎉🎉",
        drawing: "Окончание: {timestamp}",
        dropMessage: "Успейте быть первыми, нажав на реакцию!",
        inviteToParticipate: "Нажмите на `🎉`, чтобы принять участие!",
        winMessage:
          ":tada: Поздравляю, {winners}! Вы выиграли **{this.prize}**!\n{this.messageURL}",
        embedFooter: "{this.winnerCount} победитель(ей)",
        noWinner: "Розыгрыш отменен, побидетеля нет.",
        hostedBy: "Начал розыгрыш: {this.hostedBy}",
        winners: "Победитель(и):",
        endedAt: "Закончится через",
      },
      rerollOptions: {
        congrat:
          ":tada: Новый(ые) побидители: {winners}! Поздравляю, Вы выиграли **{this.prize}**!\n{this.messageURL}",
        error: "Розыгрыш отменен, побидетеля нет.",
      },
    };

    switch (Sub) {
      case "start":
        {
          const gchannel = options.getChannel("channel") || interaction.channel;
          const duration = options.getString("duration");
          const winnerCount = options.getInteger("winners");
          const prize = options.getString("prize");

          client.giveawaysManager
            .start(gchannel, {
              duration: ms(duration),
              winnerCount,
              prize,
              lastChance: optionsGiveaway.lastChance,
              pauseOptions: optionsGiveaway.pauseOptions,
              messages: optionsGiveaway.messages,
            })
            .then((gData) => {
              successEmbed.setDescription("Розыгрыш успешно начат.");
              interaction.reply({ embeds: [successEmbed], ephemeral: true });
            })
            .catch((err) => {
              errorEmbed.setDescription(
                `Сообщите об этой ошибке разработчику.\nКод ошибки: ${err}`
              );
              interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            });
        }
        break;

      case "actions":
        {
          const choice = options.getString("options");
          const message_id = options.getString("message_id");
          const giveaway = client.giveawaysManager.giveaways.find(
            (g) =>
              g.guildId === interaction.guildId && g.messageId === message_id
          );

          if (!giveaway) {
            errorEmbed.setDescription(
              `Я не смогла найти розыгрыш по ID сообщения (${message_id})...\nЕсли вы считаете, что это ошибка, то обратитесь к разработчику.`
            );
            interaction.reply({ embeds: [errorEmbed], ephemeral: true });
          }
          switch (choice) {
            case "end":
              {
                client.giveawaysManager
                  .end(message_id)
                  .then(() => {
                    successEmbed.setDescription("Розыгрыш успешно закончен.");
                    interaction.reply({
                      embeds: [successEmbed],
                      ephemeral: true,
                    });
                  })
                  .catch((err) => {
                    errorEmbed.setDescription(
                      `Сообщите об этой ошибке разработчику.\nКод ошибки: ${err}`
                    );
                    interaction.reply({
                      embeds: [errorEmbed],
                      ephemeral: true,
                    });
                  });
              }
              break;
            case "pause":
              {
                client.giveawaysManager
                  .pause(message_id)
                  .then(() => {
                    successEmbed.setDescription(
                      "Розыгрыш успешно приостановлен."
                    );
                    interaction.reply({
                      embeds: [successEmbed],
                      ephemeral: true,
                    });
                  })
                  .catch((err) => {
                    errorEmbed.setDescription(
                      `Сообщите об этой ошибке разработчику.\nКод ошибки: ${err}`
                    );
                    interaction.reply({
                      embeds: [errorEmbed],
                      ephemeral: true,
                    });
                  });
              }
              break;
            case "unpause":
              {
                client.giveawaysManager
                  .unpause(message_id)
                  .then(() => {
                    successEmbed.setDescription(
                      "Розыгрыш успешно восстановлен."
                    );
                    interaction.reply({
                      embeds: [successEmbed],
                      ephemeral: true,
                    });
                  })
                  .catch((err) => {
                    errorEmbed.setDescription(
                      `Сообщите об этой ошибке разработчику.\nКод ошибки: ${err}`
                    );
                    interaction.reply({
                      embeds: [errorEmbed],
                      ephemeral: true,
                    });
                  });
              }
              break;
            case "reroll":
              {
                client.giveawaysManager
                  .reroll(message_id, {
                    messages: optionsGiveaway.rerollOptions,
                  })
                  .then(() => {
                    successEmbed.setDescription(
                      "Розыгрыш успешно переразыгран."
                    );
                    interaction.reply({
                      embeds: [successEmbed],
                      ephemeral: true,
                    });
                  })
                  .catch((err) => {
                    errorEmbed.setDescription(
                      `Сообщите об этой ошибке разработчику.\nКод ошибки: ${err}`
                    );
                    interaction.reply({
                      embeds: [errorEmbed],
                      ephemeral: true,
                    });
                  });
              }
              break;
            case "delete":
              {
                client.giveawaysManager
                  .delete(message_id)
                  .then(() => {
                    successEmbed.setDescription("Розыгрыш успешно удалён.");
                    interaction.reply({
                      embeds: [successEmbed],
                      ephemeral: true,
                    });
                  })
                  .catch((err) => {
                    errorEmbed.setDescription(
                      `Сообщите об этой ошибке разработчику.\nКод ошибки: ${err}`
                    );
                    interaction.reply({
                      embeds: [errorEmbed],
                      ephemeral: true,
                    });
                  });
              }
              break;
          }
        }
        break;

      default: {
        console.log("Error in giveaway command.");
      }
    }
  },
};

/**
 *
 * @param {String} value
 * @returns Time in ms
 */
function ms(value) {
  const convert_time = {
    с: 1,
    s: 1,
    м: 60,
    m: 60,
    ч: 3600,
    h: 3600,
    д: 86400,
    d: 86400,
  };

  let time = 0;

  const regMute = new RegExp("[0-9]+[ДдDdЧчHHМмMmСсSs]", "g");
  const regNumber = new RegExp("[0-9]+", "g");
  let foundtime = [...value.matchAll(regMute)];
  for (let match of foundtime) {
    const matchValue = match[0];
    const textValue = (
      (matchValue || "s")[(matchValue?.length || 1) - 1] || "c"
    ).toLowerCase();
    time +=
      parseInt((matchValue?.match(regNumber) || ["1"])[0] || "1") *
      convert_time[textValue];
  }
  time *= 1000;
  return time;
}
