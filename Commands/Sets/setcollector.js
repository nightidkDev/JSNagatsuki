const {
  Client,
  CommandInteraction,
  MessageEmbed,
  MessageActionRow,
  MessageButton,
} = require("discord.js");
const SetCollectorDB = require("../../Schemas/SetCollectorDB");

module.exports = {
  name: "collector",
  description: "Управление наборами.",
  permission: "ADMINISTRATOR",
  options: [
    {
      name: "start",
      description: "Начать набор.",
      type: "SUB_COMMAND",
      options: [
        {
          name: "type",
          description: "Тип набора",
          type: "STRING",
          required: true,
          choices: [
            {
              name: "Ивентёры",
              value: "event",
            },
            {
              name: "Стафф",
              value: "staff",
            },
          ],
        },
      ],
    },
    {
      name: "end",
      description: "Закончить набор.",
      type: "SUB_COMMAND",
      options: [
        {
          name: "type",
          description: "Тип набора",
          type: "STRING",
          required: true,
          choices: [
            {
              name: "Ивентёры",
              value: "event",
            },
            {
              name: "Стафф",
              value: "staff",
            },
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
    //const channel = interaction.guild.channels.cache.get("978690015871774810");
    const channel = interaction.channel;
    const type = interaction.options.getString("type");
    //console.log(type);
    //console.log(interaction.options.getSubcommand());

    let doc = await SetCollectorDB.findOne({ type: type });

    switch (interaction.options.getSubcommand()) {
      case "start":
        {
          if (!doc) {
            const Embed = new MessageEmbed();
            const EmbedImage = new MessageEmbed();
            if (type == "event") {
              EmbedImage.setImage(
                "https://cdn.discordapp.com/attachments/874936029180747786/980503014706118766/Frame_246.png"
              );
              EmbedImage.setColor(0x2f3136);
              Embed.setColor(0x2f3136);
              Embed.setDescription(
                "Привет, Самурай. Мы ищем толковых neko-ивентёров\nдля нашей Neko no rīdā.\n\nЕсли ты силён духом и полон решимости, то заполняй\nсвиток добровольца. \n\nВ случае одобрения заявки, мы пошлём к Вам гонца.\n\n**Требования для рассмотрения:**\n\n・Активность, стрессоустойчивость, адекватность;\n・Знание и соблюдение правил бакуфу;\n・Возрастное ограничение 16+;\n・Проводить 2-3 ивента в неделю. \n\n> Мы ищем дружелюбных, ответственных и\n> коммуникабельных котиков,которые любят играть в\n> настольные игры, заводить новые знакомства и хотят классно провести время.\n\n**・Просим всех желающих заполнить анкету.**"
              );
              Embed.setTitle("Набор ивентёров.");
              Embed.setImage(
                "https://cdn.discordapp.com/attachments/874936029180747786/980504628380725258/Frame_247.png"
              );
              const Row = new MessageActionRow().addComponents(
                new MessageButton()
                  .setCustomId(`collector-${type}`)
                  .setLabel("Подать заявку")
                  .setStyle("SUCCESS")
              );
              const msg = channel.send({
                embeds: [EmbedImage, Embed],
                components: [Row],
              });

              await SetCollectorDB.create({
                messageID: msg.id,
                channelID: interaction.channel.id,
                type: type,
                operate: true,
              });

              interaction.reply({
                ephemeral: true,
                content: "Набор ивентёров создан и начат.",
              });
              channel
                .send({
                  content: "<@&978967734446596160> начат набор ивентёров!",
                })
                .then((m) => {
                  setTimeout(() => {
                    m.delete();
                  }, 3600000);
                });
            } else {
              EmbedImage.setImage(
                "https://cdn.discordapp.com/attachments/874936029180747786/980433477893767168/Frame_244.png"
              );
              EmbedImage.setColor(0x2f3136);
              Embed.setColor(0x2f3136);
              Embed.setDescription(
                "*> Здравствуй, Ронин. У каждого свой путь, и если твой привёл\n> к воротам дворца Сёгуната, мы примем тебя в наши ряды.*\n\n*> Мы нуждаемся в храбрых и ответственных помощниках.\n> Если ты честный, трудолюбивый и хочешь  работать на\n> благо сервера, оставь свою заявку и жди нашего ответа.\n> Будешь добросовестно исполнять свои обязанности и\n> Сёгун будет щедро платить тебе. Удачи в наборе!*"
              );
              Embed.setTitle("Набор в модерацию.");
              Embed.setImage(
                "https://cdn.discordapp.com/attachments/874936029180747786/980446947263516692/Frame_245.png"
              );

              const Row = new MessageActionRow().addComponents(
                new MessageButton()
                  .setCustomId(`collector-${type}`)
                  .setLabel("Подать заявку (ПК версия)")
                  .setStyle("SUCCESS"),
                new MessageButton()
                  .setCustomId(`mobilecollector-${type}`)
                  .setLabel("Подать заявку (Мобильная версия)")
                  .setStyle("PRIMARY")
              );
              const msg = channel.send({
                embeds: [EmbedImage, Embed],
                components: [Row],
              });

              await SetCollectorDB.create({
                messageID: msg.id,
                channelID: interaction.channel.id,
                type: type,
                operate: true,
              });

              interaction.reply({
                ephemeral: true,
                content: "Набор на модерацию создан и начат.",
              });
              channel
                .send({
                  content: "<@&978967734446596160> начат набор в модерацию!",
                })
                .then((m) => {
                  setTimeout(() => {
                    m.delete();
                  }, 3600000);
                });
            }
          } else if (doc.operate == true) {
            if (type == "event") {
              interaction.reply({
                ephemeral: true,
                content: "Набор ивентёров уже начат.",
              });
            } else {
              interaction.reply({
                ephemeral: true,
                content: "Набор в модерацию уже начат.",
              });
            }
          } else {
            await SetCollectorDB.updateOne(
              { type: type },
              { $set: { operate: true } }
            );
            if (type == "event") {
              interaction.reply({
                ephemeral: true,
                content: "Набор ивентёров начат.",
              });
              channel
                .send({
                  content: "<@&978967734446596160> начат набор ивентёров!",
                })
                .then((m) => {
                  setTimeout(() => {
                    m.delete();
                  }, 3600000);
                });
            } else {
              interaction.reply({
                ephemeral: true,
                content: "Набор в модерацию начат.",
              });
              channel
                .send({
                  content: "<@&978967734446596160> начат набор в модерацию!",
                })
                .then((m) => {
                  setTimeout(() => {
                    m.delete();
                  }, 3600000);
                });
            }
          }
        }
        break;
      case "end":
        {
          if (!doc)
            return interaction.reply({
              ephemeral: true,
              content: "Набор не найден.",
            });
          if (type == "event") {
            if (!doc.operate) {
              return interaction.reply({
                ephemeral: true,
                content: "Набор ивентёров уже закончен.",
              });
            }
          } else {
            if (!doc.operate) {
              return interaction.reply({
                ephemeral: true,
                content: "Набор в модерацию уже закончен.",
              });
            }
          }
          await SetCollectorDB.updateOne(
            { type: type },
            { $set: { operate: false } }
          );
          if (type == "event") {
            interaction.reply({
              ephemeral: true,
              content: "Набор ивентёров закончен.",
            });
          } else {
            interaction.reply({
              ephemeral: true,
              content: "Набор в модерацию закончен.",
            });
          }
        }
        break;
    }
  },
};
