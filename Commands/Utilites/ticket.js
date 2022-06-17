const {
  MessageEmbed,
  MessageActionRow,
  MessageButton,
  CommandInteraction,
  Guild,
} = require("discord.js");
const createTranscript = require("discord-html-transcripts");
const setupSchema = require("../../Schemas/ticket-schema");

module.exports = {
  //replace this with your command handler
  name: "ticket",
  description:
    "Управление тикетами (можно иметь несколько тикетов с 1 открытым пользователем)",
  category: "Moderation",
  slash: true,
  permission: "MANAGE_MESSAGES",
  guildOnly: true,
  options: [
    {
      name: "create",
      description: "Создать тикет с определенным пользователем.",
      type: "SUB_COMMAND",
      options: [
        {
          name: "user",
          description: "Пользователь для создания заявки.",
          type: "USER",
          required: true,
        },
        {
          name: "private",
          description: "Спрятан ли билет от персонала или нет.",
          type: "BOOLEAN",
          required: true,
        },
      ],
    },
    {
      name: "delete",
      description: "Удалить тикет с определенным пользователем.",
      type: "SUB_COMMAND",
      options: [
        {
          name: "user",
          description: "Пользователь тикета для удаления.",
          type: "USER",
          required: true,
        },
        {
          name: "reason",
          description: "Причина, по которой вы удаляете этот тикет.",
          type: "STRING",
          required: false,
        },
      ],
    },
    {
      name: "add",
      description: "Добавить пользователя в тикет.",
      type: "SUB_COMMAND",
      options: [
        {
          name: "user",
          description: "Пользователь, которого нужно добавить в тикет.",
          type: "USER",
          required: true,
        },
        {
          name: "ticket",
          description: "Тикет для добавления пользователя.",
          required: true,
          type: "CHANNEL",
          channelTypes: ["GUILD_TEXT"],
        },
      ],
    },
    {
      name: "remove",
      description: "Удалить пользователя из тикета.",
      type: "SUB_COMMAND",
      options: [
        {
          name: "user",
          description: "Пользователь, которого нужно удалить из тикета.",
          type: "USER",
          required: true,
        },
        {
          name: "ticket",
          description: "Тикет для удаления пользователя.",
          required: true,
          type: "CHANNEL",
          channelTypes: ["GUILD_TEXT"],
        },
      ],
    },
  ],

  /**
   *
   * @param {CommandInteraction} interaction
   * @param {Guild} guild
   */
  async execute(interaction, guild) {
    try {
      const action = interaction.options.getSubcommand("ticket");
      const user = interaction.options.getUser("user");
      var ticket =
        interaction.options.getChannel("ticket") ||
        guild.channels.cache.find((channel) => channel.topic === user.id);
      const private = interaction.options.getBoolean("private");
      const staff = interaction.user.id;
      const doc = await setupSchema.findOne({ guildId: interaction.guild.id });
      const supportRolesId = doc.supportId;

      if (action === "create") {
        if (private === false) {
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
            {
              id: user.id,
              allow: [
                "SEND_MESSAGES",
                "VIEW_CHANNEL",
                "ADD_REACTIONS",
                "EMBED_LINKS",
                "ATTACH_FILES",
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
          interaction.guild.channels
            .create(`${user.tag}`, {
              permissionOverwrites: permissionOverwrites,
              type: "text",
              parent: doc.supportCatId,
              topic: user.id,
            })
            .then(async (channel) => {
              channel.send({
                content: `Добро пожаловать, <@${user.id}> | <@${staff}>`,
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
            .setTitle("Ticket | FORCED")
            .setDescription(
              "Здравствуйте.\nДанный тикет был вызван персоналом, он скоро с вами свяжется."
            )
            .setColor(0x68c048)
            .setFooter({
              text: "Только персонал может закрывать тикеты.",
            })
            .setTimestamp();

          const del = new MessageActionRow()
            .addComponents(
              new MessageButton()
                .setCustomId("lock")
                .setLabel("🔒 Закрыть тикет.")
                .setStyle("SECONDARY")
            )
            .addComponents(
              new MessageButton()
                .setCustomId("unlock")
                .setLabel("🔓 Открыть тикет.")
                .setStyle("SUCCESS")
            );
        } else {
          interaction.guild.channels
            .create(`${user.tag}`, {
              permissionOverwrites: [
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
                  id: user.id,
                  allow: [
                    "SEND_MESSAGES",
                    "VIEW_CHANNEL",
                    "ADD_REACTIONS",
                    "EMBED_LINKS",
                    "ATTACH_FILES",
                  ],
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
              ],
              type: "text",
              parent: doc.supportCatId,
              topic: user.id,
            })
            .then(async (channel) => {
              channel.send({
                content: `Добро пожаловать, <@${user.id}> | <@${staff}>`,
                embeds: [embed],
                components: [del],
              });
            })
            .then(
              interaction.reply({
                content: `Created ticket`,
                ephemeral: true,
              })
            );

          const embed = new MessageEmbed()
            .setTitle("Ticket | FORCED")
            .setDescription(
              "Здравствуйте.\nДанный тикет был вызван персоналом, он скоро с вами свяжется."
            )
            .setFooter({
              text: "Только персонал может закрывать тикеты.",
            })
            .setColor(0x68c048)
            .setTimestamp();

          const del = new MessageActionRow()
            .addComponents(
              new MessageButton()
                .setCustomId("lock")
                .setLabel("🔒 Закрыть тикет")
                .setStyle("SECONDARY")
            )
            .addComponents(
              new MessageButton()
                .setCustomId("unlock")
                .setLabel("🔓 Открыть тикет")
                .setStyle("SUCCESS")
            );
        }
      } else if (action === "delete") {
        const reason = interaction.options.getString("reason");

        if (ticket) {
          interaction.reply({
            custom: true,
            content: "Тикет удалён.",
            ephemeral: true,
          });
          const embedClose = new MessageEmbed()
            .setTitle("Лог тикета.")
            .setFields(
              {
                name: "Автор тикета",
                value: `<@${ticket.topic}>`,
                inline: true,
              },
              { name: "Закрыт пользователем", value: `${interaction.user}` },
              { name: "Причина", value: `${reason ? reason : "Не указана."}` }
            )
            .setColor(0x68c048);
          const transcript = await createTranscript.createTranscript(ticket, {
            limit: -1,
            returnBuffer: false,
            fileName: `ticket-${ticket.name}.html`,
          });
          const logChannel = await interaction.guild.channels.cache.find(
            (c) => c.id === "975360051726385152"
          );
          if (!logChannel) {
            const ch = await interaction.guild.channels.create(
              `ticket-logs`,
              { id: interaction.guild.roles.everyone, deny: ["VIEW_CHANNEL"] },
              {
                id: "710867891070697492",
                allow: [
                  "SEND_MESSAGES",
                  "VIEW_CHANNEL",
                  "MANAGE_MESSAGES",
                  "MANAGE_CHANNELS",
                ],
              }
            );
            ch.send({ embeds: [embedClose], files: [transcript] });
            ticket.delete();
          } else {
            logChannel.send({ embeds: [embedClose], files: [transcript] });
            ticket.delete();
          }
        } else {
          interaction.reply({
            custom: true,
            content: "Не удалось найти тикет с этим пользователем.",
            ephemeral: true,
          });
        }
      } else if (action === "add") {
        if (!/^[0-9]{18}/g.test(ticket.topic))
          return {
            custom: true,
            content: "Это не действительный тикет.",
            ephemeral: true,
          };
        ticket.permissionOverwrites.create(user, {
          VIEW_CHANNEL: true,
          SEND_MESSAGES: true,
          ADD_REACTIONS: true,
          EMBED_LINKS: true,
          ATTACH_FILES: true,
        });
        interaction.reply({
          custom: true,
          content: `Пользователь <@${user.id}> добавлен в ${ticket}`,
          ephemeral: true,
        });
      } else if (action === "remove") {
        if (!/^[0-9]{18}/g.test(ticket.topic))
          return {
            custom: true,
            content: "Это не действительный тикет.",
            ephemeral: true,
          };

        ticket.permissionOverwrites.delete(user.id);
        interaction.reply({
          custom: true,
          content: `Пользователь <@${user.id}> был удалён из ${ticket}`,
          ephemeral: true,
        });
      }
    } catch (err) {
      console.log(err);
    }
  },
};
