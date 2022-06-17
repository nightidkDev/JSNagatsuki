const { MessageEmbed, CommandInteraction } = require("discord.js");
const setupSchema = require("../../Schemas/ticket-schema");
module.exports = {
  name: "tconfig",
  description: "Setup the bot.",
  category: "Config",
  slash: true,
  permission: "ADMINISTRATOR",
  guildOnly: true,
  options: [
    {
      name: "view",
      description: "Посмотреть конфиг.",
      type: "SUB_COMMAND",
    },
    {
      name: "reset",
      description: "Обнуляет конфигурацию конфига.",
      type: "SUB_COMMAND",
    },
    {
      name: "support-role",
      description: "Установить роли, которые смогут отвечать на тикеты.",
      type: "SUB_COMMAND",
      options: [
        {
          name: "action",
          description: "Укажите действие",
          type: "STRING",
          required: true,
          choices: [
            { name: "add", value: "add" },
            { name: "remove", value: "remove" },
          ],
        },
        {
          name: "role",
          description: "Укажите роль",
          type: "ROLE",
          required: true,
        },
      ],
    },
    {
      name: "support-category",
      description: "Установить категорию для тикетов.",
      type: "SUB_COMMAND",
      options: [
        {
          name: "category",
          description: "Категория, где будут создаваться тикеты.",
          type: "CHANNEL",
          channelTypes: ["GUILD_CATEGORY"],
          required: true,
        },
      ],
    },
  ],
  /**
   *
   * @param {CommandInteraction} interaction
   * @returns
   */
  async execute(interaction) {
    if (interaction.options.getSubcommand() === "support-role") {
      const action = interaction.options.getString("action");
      const role = interaction.options.getRole("role");
      const roleID = role.id;

      if (action === "add") {
        const doc = await setupSchema.findOneAndUpdate(
          {
            guildId: interaction.guild.id,
          },
          {
            $push: {
              supportId: roleID,
            },
          }
        );

        if (!doc) {
          await setupSchema.create({ guildId: interaction.guild.id });
        }
        interaction.reply({
          content: `${
            action === "add" ? `Добавлена роль ` : `Удалена роль `
          } <@&${roleID}>`,
          ephemeral: true,
        });
      } else {
        const doc = await setupSchema.findOneAndUpdate(
          {
            guildId: interaction.guild.id,
          },
          {
            $pull: {
              supportId: roleID,
            },
          }
        );

        if (!doc) {
          await setupSchema.create({ guildId: interaction.guild.id });
        }
        interaction.reply({
          content: `${
            action === "add" ? `Добавлена роль ` : `Удалена роль `
          } <@&${roleID}>`,
          ephemeral: true,
        });
      }
    } else if (interaction.options.getSubcommand() === "support-category") {
      const cat = interaction.options.getChannel("category");
      const catId = cat.id;

      const doc1 = await setupSchema.findOneAndUpdate(
        {
          guildId: interaction.guild.id,
        },
        {
          supportCatId: catId,
        }
      );
      if (!doc1) {
        await setupSchema.create({ guildId: interaction.guild.id });
      }
      interaction.reply({
        content: `Категория <#${catId}> установлена.`,
        ephemeral: true,
      });
    } else if (interaction.options.getSubcommand() === "view") {
      const doc = await setupSchema.findOne({
        guildId: interaction.guild.id,
      });
      if (!doc) {
        setupSchema.create({ guildId: interaction.guild.id });
        return interaction.reply({
          content: `Я не нашла сервер в моей базе данных, пожалуйста, попробуйте ещё раз.`,
        });
      }

      const roles = doc.supportId.map((r) => `<@&${r}>`).join(" ");

      const embed = new MessageEmbed()
        .setColor("RANDOM")
        .setTitle("Конфиг")
        .setFields(
          {
            name: `Саппорт роли`,
            value: `${roles === "" ? "Нет ролей." : roles}`,
            inline: true,
          },
          {
            name: `Саппорт категория`,
            value: `${
              doc.supportCatId ? `<#${doc.supportCatId}>` : "Не установлена."
            }`,
            inline: true,
          }
        );

      interaction.reply({ embeds: [embed] });
    } else if (interaction.options.getSubcommand() === "reset") {
      const result = await setupSchema.findOne({
        guildId: interaction.guild.id,
      });
      if (result) {
        result.delete();
        interaction.reply("Конфиг обнулён.");
      } else {
        interaction.reply(`Конфиг не найден.`);
      }
    }
  },
};
