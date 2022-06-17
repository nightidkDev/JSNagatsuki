const {
  Client,
  Interaction,
  MessageEmbed,
  MessageActionRow,
  MessageButton,
} = require("discord.js");
const { LAVATOKEN } = require("../../config.json");
const axios = require("axios");
const { stringify } = require("querystring");

const setupSchema = require("../../Schemas/ticket-schema");

module.exports = {
  name: "interactionCreate",
  /**
   * @param {Interaction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    if (interaction.isCommand() || interaction.isContextMenu()) {
      const command = client.commands.get(interaction.commandName);
      if (!command)
        return (
          interaction.reply({
            embeds: [
              new MessageEmbed()
                .setColor("RED")
                .setDescription(
                  "⛔ An error occured while running this command."
                ),
            ],
          }) && client.commands.delete(interaction.commandName)
        );

      console.log(
        `${interaction.member.user.tag} used /${interaction.commandName}`
      );
      command.execute(interaction, client).catch((err) => {
        console.log(`При выполнении произошла ошибка: ${err}`);
        if (interaction.replied || interaction.deferred)
          interaction.editReply({
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
        else
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
        throw err;
      });
    } else if (interaction.isButton()) {
      // if (interaction.customId.startsWith("check-pay")) {
      //   member = interaction.guild.members.cache.get(interaction.customId.split("|")[2]);
      //   if (member.id !== interaction.user.id) return interaction.reply({ ephemeral: true })
      //   id = interaction.customId.split("|")[1];
      //   const config = {
      //     headers: {
      //       Authorization: LAVATOKEN,
      //     },
      //   };
      //   const data = {
      //     id: id,
      //   };

      //   msg = await interaction.channel.messages.fetch(interaction.message.id);
      //   await interaction.deferReply({ ephemeral: true });

      //   axios
      //     .post("https://api.lava.ru/invoice/info", stringify(data), config)
      //     .then((res) => {
      //       console.log(res.data);
      //       const row = new MessageActionRow();
      //       row.addComponents(
      //         new MessageButton()
      //           .setCustomId(`check-pay|${id}|$`)
      //           .setLabel("Check payment")
      //           .setStyle("SUCCESS")
      //       );
      //       msg.edit({
      //         content: `Статус: ${
      //           res.data.invoice.status == "pending"
      //             ? "Ожидание платежа"
      //             : res.data.invoice.status == "success"
      //             ? "Выполнен"
      //             : "Отклонён"
      //         }\nСсылка: https://acquiring.lava.ru/invoice/${
      //           res.data.invoice.id
      //         }`,
      //         components: [row],
      //       });
      //       interaction.editReply({ content: "Проверяю..." });
      //     })
      //     .catch((err) => {
      //       console.log(err);
      //       msg.edit({ content: `Error: ${err}`, components: [] });
      //       interaction.editReply({ content: "Проверяю..." });
      //     });
      //} else
      if (interaction.customId.startsWith("ticket")) {
        let action = interaction.customId.split("-")[1];
        if (action === "other") {
          const guild = interaction.guild;
          const user = interaction.user;
          const check = guild.channels.cache.find(
            (c) => c.topic === `${user.id}`
          );
          const doc = await setupSchema.findOne({
            guildId: interaction.guild.id,
          });
          const supportRolesId = doc.supportId;
          const catId = doc.supportCatId;
          const staff = doc.supportId.map((r) => `<@&${r}>`);

          if (!check) {
            const permissionOverwrites = [
              {
                id: interaction.user.id,
                allow: [
                  "SEND_MESSAGES",
                  "VIEW_CHANNEL",
                  "ADD_REACTIONS",
                  "EMBED_LINKS",
                  "ATTACH_FILES",
                ],
              },
              {
                id: interaction.guild.roles.everyone,
                deny: ["VIEW_CHANNEL"],
              },
              {
                id: "710867891070697492",
                allow: [
                  "SEND_MESSAGES",
                  "VIEW_CHANNEL",
                  "MANAGE_MESSAGES",
                  "MANAGE_CHANNELS",
                ],
              },
            ];
            supportRolesId.forEach((r) => {
              permissionOverwrites.push({
                id: r,
                allow: [
                  "SEND_MESSAGES",
                  "VIEW_CHANNEL",
                  "MANAGE_MESSAGES",
                  "MANAGE_CHANNELS",
                ],
              });
            });
            const x = interaction.guild.channels
              .create(`${interaction.user.tag}`, {
                permissionOverwrites: permissionOverwrites,
                type: "text",
                parent: catId,
                topic: interaction.user.id,
              })
              .then(async (channel) => {
                channel.send({
                  content: `Добро пожаловать, <@${interaction.user.id}>. ${staff}`,
                  embeds: [embed],
                  components: [del],
                });
              })
              .then(
                interaction.reply({
                  content: `Тикет создан.`,
                  ephemeral: true,
                })
              );

            const embed = new MessageEmbed()
              .setTitle("Тикет | ДРУГОЕ")
              .setDescription(
                "Здравствуйте.\nПерсонал ответит вам в ближайшее время. А пока расскажите нам о своей причине создания тикета."
              )
              .setFooter({
                text: "Только стафф может закрыть тикеты.",
              })
              .setColor(0x68c048)
              .setTimestamp();

            const del = new MessageActionRow()
              .addComponents(
                new MessageButton()
                  .setCustomId("ticket-lock")
                  .setLabel("🔒 Закрыть тикет")
                  .setStyle("SECONDARY")
              )
              .addComponents(
                new MessageButton()
                  .setCustomId("ticket-unlock")
                  .setLabel("🔓 Открыть тикет")
                  .setStyle("SUCCESS")
              );
          } else {
            interaction.reply({
              custom: true,
              content: "У вас уже открыт один тикет.",
              ephemeral: true,
            });
          }
        } else if (action === "player") {
          const guild = interaction.guild;
          const user = interaction.user;
          const check = guild.channels.cache.find(
            (c) => c.topic === `${user.id}`
          );
          const doc = await setupSchema.findOne({
            guildId: interaction.guild.id,
          });
          const supportRolesId = doc.supportId;
          const catId = doc.supportCatId;
          const staff = doc.supportId.map((r) => `<@&${r}>`);

          if (!check) {
            const permissionOverwrites = [
              {
                id: interaction.user.id,
                allow: [
                  "SEND_MESSAGES",
                  "VIEW_CHANNEL",
                  "ADD_REACTIONS",
                  "EMBED_LINKS",
                  "ATTACH_FILES",
                ],
              },
              {
                id: interaction.guild.roles.everyone,
                deny: ["VIEW_CHANNEL"],
              },
              {
                id: "710867891070697492",
                allow: [
                  "SEND_MESSAGES",
                  "VIEW_CHANNEL",
                  "MANAGE_MESSAGES",
                  "MANAGE_CHANNELS",
                ],
              },
            ];
            supportRolesId.forEach((r) => {
              permissionOverwrites.push({
                id: r,
                allow: [
                  "SEND_MESSAGES",
                  "VIEW_CHANNEL",
                  "MANAGE_MESSAGES",
                  "MANAGE_CHANNELS",
                ],
              });
            });
            const x = interaction.guild.channels
              .create(`${interaction.user.tag}`, {
                permissionOverwrites: permissionOverwrites,
                type: "text",
                parent: catId,
                topic: interaction.user.id,
              })
              .then(async (channel) => {
                channel.send({
                  content: `Добро пожаловать, <@${interaction.user.id}> | ${staff}`,
                  embeds: [embed],
                  components: [del],
                });
              })
              .then(
                interaction.reply({
                  content: `Тикет создан.`,
                  ephemeral: true,
                })
              );

            const embed = new MessageEmbed()
              .setTitle("Тикет | ЖАЛОБА НА ПОЛЬЗОВАТЕЛЯ")
              .setDescription(
                "Здравствуйте.\nПерсонал ответит вам в ближайшее время. А пока расскажите нам о своей проблеме\n\n**Шаблон отчета:**\n```**Нарушитель:**\n**Причина:**\n**Доказательство: **\n**Другие примечания:**```"
              )
              .setFooter({
                text: "Только стафф может закрыть тикеты.",
              })
              .setColor(0x68c048)
              .setTimestamp();

            const del = new MessageActionRow()
              .addComponents(
                new MessageButton()
                  .setCustomId("ticket-lock")
                  .setLabel("🔒 Закрыть тикет")
                  .setStyle("SECONDARY")
              )
              .addComponents(
                new MessageButton()
                  .setCustomId("ticket-unlock")
                  .setLabel("🔓 Открыть тикет")
                  .setStyle("SUCCESS")
              );
          } else {
            interaction.reply({
              custom: true,
              content: "У вас уже открыт один тикет.",
              ephemeral: true,
            });
          }
        } else if (action === "staff") {
          const doc = await setupSchema.findOne({
            guildId: interaction.guild.id,
          });
          const guild = interaction.guild;
          const user = interaction.user;
          const check = guild.channels.cache.find(
            (c) => c.topic === `${user.id}`
          );
          const catId = doc.supportCatId;

          if (!check) {
            const permissionOverwrites = [
              {
                id: interaction.user.id,
                allow: [
                  "SEND_MESSAGES",
                  "VIEW_CHANNEL",
                  "ADD_REACTIONS",
                  "EMBED_LINKS",
                  "ATTACH_FILES",
                ],
              },
              {
                id: interaction.guild.roles.everyone,
                deny: ["VIEW_CHANNEL"],
              },
              {
                id: "710867891070697492",
                allow: [
                  "SEND_MESSAGES",
                  "VIEW_CHANNEL",
                  "MANAGE_MESSAGES",
                  "MANAGE_CHANNELS",
                ],
              },
            ];
            const x = interaction.guild.channels
              .create(`${interaction.user.tag}`, {
                permissionOverwrites: permissionOverwrites,
                type: "text",
                parent: catId,
                topic: interaction.user.id,
              })
              .then(async (channel) => {
                channel.send({
                  content: `Добро пожаловать, <@${interaction.user.id}>`,
                  embeds: [embed],
                  components: [del],
                });
              })
              .then(
                interaction.reply({
                  content: `Тикет создан.`,
                  ephemeral: true,
                })
              );

            const embed = new MessageEmbed()
              .setTitle("Тикет | ЖАЛОБА НА МОДЕРАТОРА")
              .setDescription(
                "Здравствуйте.\nПерсонал ответит вам в ближайшее время. А пока расскажите нам о своей проблеме\n\n**Шаблон отчета:**\n```**Нарушитель:**\n**Причина:**\n**Доказательство: **\n**Другие примечания:**```"
              )
              .setFooter({
                text: "Только стафф может закрыть тикеты.",
              })
              .setColor(0x68c048)
              .setTimestamp();

            const del = new MessageActionRow()
              .addComponents(
                new MessageButton()
                  .setCustomId("ticket-lock")
                  .setLabel("🔒 Закрыть тикет")
                  .setStyle("SECONDARY")
              )
              .addComponents(
                new MessageButton()
                  .setCustomId("ticket-unlock")
                  .setLabel("🔓 Открыть тикет")
                  .setStyle("SUCCESS")
              );
          } else {
            interaction.reply({
              custom: true,
              content: "У вас уже открыт один тикет.",
              ephemeral: true,
            });
          }
        } else if (action === "bug") {
          const guild = interaction.guild;
          const user = interaction.user;
          const check = guild.channels.cache.find(
            (c) => c.topic === `${user.id}`
          );
          const doc = await setupSchema.findOne({
            guildId: interaction.guild.id,
          });
          const supportRolesId = doc.supportId;
          const catId = doc.supportCatId;
          const staff = doc.supportId.map((r) => `<@&${r}>`);

          if (!check) {
            const permissionOverwrites = [
              {
                id: interaction.user.id,
                allow: [
                  "SEND_MESSAGES",
                  "VIEW_CHANNEL",
                  "ADD_REACTIONS",
                  "EMBED_LINKS",
                  "ATTACH_FILES",
                ],
              },
              {
                id: interaction.guild.roles.everyone,
                deny: ["VIEW_CHANNEL"],
              },
              {
                id: "710867891070697492",
                allow: [
                  "SEND_MESSAGES",
                  "VIEW_CHANNEL",
                  "MANAGE_MESSAGES",
                  "MANAGE_CHANNELS",
                ],
              },
            ];
            supportRolesId.forEach((r) => {
              permissionOverwrites.push({
                id: r,
                allow: [
                  "SEND_MESSAGES",
                  "VIEW_CHANNEL",
                  "MANAGE_MESSAGES",
                  "MANAGE_CHANNELS",
                ],
              });
            });
            const x = interaction.guild.channels
              .create(`${interaction.user.tag}`, {
                permissionOverwrites: permissionOverwrites,
                type: "text",
                parent: catId,
                topic: interaction.user.id,
              })
              .then(async (channel) => {
                channel.send({
                  content: `Добро пожаловать, <@${interaction.user.id}> | ${staff}`,
                  embeds: [embed],
                  components: [del],
                });
              })
              .then(
                interaction.reply({
                  content: `Тикет создан.`,
                  ephemeral: true,
                })
              );

            const embed = new MessageEmbed()
              .setTitle("Тикет | БАГ")
              .setDescription(
                "Здравствуйте.\nПерсонал ответит вам в ближайшее время. А пока расскажите нам о своей проблеме\n\n**Шаблон отчета:**\n```**Баг:**\n**Как вы его обнаружили:**\n* *Доказательство:**\n**Другие примечания:**```"
              )
              .setFooter({
                text: "Только персонал поддержки может удалять тикеты | Баги должны быть воспроизводимыми",
              })
              .setColor(0x68c048)
              .setTimestamp();

            const del = new MessageActionRow()
              .addComponents(
                new MessageButton()
                  .setCustomId("ticket-lock")
                  .setLabel("🔒 Закрыть тикет")
                  .setStyle("SECONDARY")
              )
              .addComponents(
                new MessageButton()
                  .setCustomId("ticket-unlock")
                  .setLabel("🔓 Открыть тикет")
                  .setStyle("SUCCESS")
              );
          } else {
            interaction.reply({
              custom: true,
              content: "У вас уже открыт один тикет.",
              ephemeral: true,
            });
          }
        } else if (action === "feed") {
          const guild = interaction.guild;
          const user = interaction.user;
          const check = guild.channels.cache.find(
            (c) => c.topic === `${user.id}`
          );
          const doc = await setupSchema.findOne({
            guildId: interaction.guild.id,
          });
          const supportRolesId = doc.supportId;
          const catId = doc.supportCatId;
          const staff = doc.supportId.map((r) => `<@&${r}>`);

          if (!check) {
            const permissionOverwrites = [
              {
                id: interaction.user.id,
                allow: [
                  "SEND_MESSAGES",
                  "VIEW_CHANNEL",
                  "ADD_REACTIONS",
                  "EMBED_LINKS",
                  "ATTACH_FILES",
                ],
              },
              {
                id: interaction.guild.roles.everyone,
                deny: ["VIEW_CHANNEL"],
              },
              {
                id: "710867891070697492",
                allow: [
                  "SEND_MESSAGES",
                  "VIEW_CHANNEL",
                  "MANAGE_MESSAGES",
                  "MANAGE_CHANNELS",
                ],
              },
            ];
            supportRolesId.forEach((r) => {
              permissionOverwrites.push({
                id: r,
                allow: [
                  "SEND_MESSAGES",
                  "VIEW_CHANNEL",
                  "MANAGE_MESSAGES",
                  "MANAGE_CHANNELS",
                ],
              });
            });
            const x = interaction.guild.channels
              .create(`${interaction.user.tag}`, {
                permissionOverwrites: permissionOverwrites,
                type: "text",
                parent: catId,
                topic: interaction.user.id,
              })
              .then(async (channel) => {
                channel.send({
                  content: `Добро пожаловать, <@${interaction.user.id}> | ${staff}`,
                  embeds: [embed],
                  components: [del],
                });
              })
              .then(
                interaction.reply({
                  content: `Тикет создан.`,
                  ephemeral: true,
                })
              );

            const embed = new MessageEmbed()
              .setTitle("Тикет | ОТЗЫВ")
              .setDescription(
                "Здравствуйте.\nПерсонал ответит вам в ближайшее время. А пока расскажите нам о своей(своём) проблеме/пожелании/идее/отзыве."
              )
              .setFooter({
                text: "Только стафф может закрыть тикеты.",
              })
              .setColor(0x68c048)
              .setTimestamp();

            const del = new MessageActionRow()
              .addComponents(
                new MessageButton()
                  .setCustomId("ticket-lock")
                  .setLabel("🔒 Закрыть тикет")
                  .setStyle("SECONDARY")
              )
              .addComponents(
                new MessageButton()
                  .setCustomId("ticket-unlock")
                  .setLabel("🔓 Открыть тикет")
                  .setStyle("SUCCESS")
              );
          } else {
            interaction.reply({
              custom: true,
              content: "У вас уже открыт один тикет.",
              ephemeral: true,
            });
          }
        } else if (action === "lock") {
          if (interaction.member.permissions.has("MANAGE_MESSAGES")) {
            const thread = interaction.channel;
            const userThread = thread.topic;

            thread.permissionOverwrites.edit(userThread, {
              VIEW_CHANNEL: false,
            });
            interaction.reply({
              custom: true,
              content: `Тикет закрыт.`,
              ephemeral: true,
            });
          } else
            interaction.reply({
              custom: true,
              content: "Вы не можете этого сделать.",
              ephemeral: true,
            });
        } else if (action === "unlock") {
          if (interaction.member.permissions.has("MANAGE_MESSAGES")) {
            const thread = interaction.channel;
            const userThread = thread.topic;

            thread.permissionOverwrites.edit(userThread, {
              VIEW_CHANNEL: true,
            });
            interaction.reply({
              custom: true,
              content: `Тикет открыт.`,
              ephemeral: true,
            });
          } else
            interaction.reply({
              custom: true,
              content: "Вы не можете этого сделать.",
              ephemeral: true,
            });
        }
      }
    } else if (interaction.isSelectMenu()) {
    }
  },
};
