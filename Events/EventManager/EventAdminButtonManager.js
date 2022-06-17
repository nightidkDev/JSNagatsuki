const {
  Client,
  ButtonInteraction,
  MessageEmbed,
  MessageActionRow,
  MessageButton,
  MessageSelectMenu,
  GuildMember,
} = require("discord.js");
const { COLOR } = require("../../config.json");
const EventsTemplates = require("../../Schemas/EventsTemplates");

const { makeid, getTime, getAuthor } = require("../../Modules/Functions");
const { Query } = require("mongoose");
const {
  createEventManagersPage,
} = require("../../Modules/createEventManagersPage");

/*
Записки: 

1. В упралвении ивентёрами сделать статистику ивентёров (за 7 дней, 14 дней, 30 дней), а так же всю историю их ивентов.
2. Балловая система ивентёров, т.е. за каждый ивент будет определённое кол-во баллов (чем больше ивентов за месяц, тем больше X баллов, 1 ивент в месяц - 0.5x баллов, 
  2 ивента - 1x баллов, 3 ивента - 1.5x балллов, и т.д)
Баллы начисляются так же за длительность ивента: 1ч = ~60 баллов.

Штрафные баллы (минус баллы): 
  Не законченный ивент - ивентёр не завершил ивент после проведения (будет считаться как накрутка баллов временем ивента), т.е. просто так в 
    голосовом канале не посидишь, не пообщаешься, но для этого нужно будет следить за этим. (хз как) + ивентёр не сможет за 1 час до ивента создать руму и сидеть в ней, ибо 
    бот будет считать время ивента именно с начала ивента по времени, а не по дате публикации. (20 минут штрафа = ~50 баллов.)
  Жалобы на ивентёра = общее кол-во баллов ивентёра - (кол-во жалоб на ивентёра за месяц * 2) 

Первые 3 места по баллам за месяц:
1 место - 10 дней личной роли
2 место - 5 дней личной роли
3 место - 1000 йен
** БАЛЛОВАЯ СИСТЕМА ВОЗМОЖНО БУДЕТ, НО НЕ ГАРАНТИРОВАНО, ДА И РАСЦЕНКИ ЗА МЕСТА И ФОРМУЛЫ МОГУТ БЫТЬ ИЗМЕНЕНЫ **
3. /event report {ивентёр} {причина}
4. /event ban && /event unban - полноя блокировака и разблокировка на всех ивентах (по категории)

*/

module.exports = {
  name: "interactionCreate",
  /**
   *
   * @param {ButtonInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    if (!interaction.isButton()) return;
    if (!interaction.customId.startsWith("eventAdmin")) return;
    const { message, member } = interaction;
    if (message.interaction?.user.id != member.id)
      return interaction.replied
        ? await interaction
            .followUp({
              ephemeral: true,
              embeds: [
                new MessageEmbed()
                  .setTimestamp()
                  .setAuthor({ name: "Мастер управления ивентами" })
                  .setColor(COLOR)
                  .setFooter({
                    text: interaction.member.displayName,
                    iconURL: interaction.member.displayAvatarURL({
                      dynamic: true,
                    }),
                  })
                  .setDescription(
                    "Данный мастер управления ивентами не принадлежит Вам. Вызовите свой командой /event"
                  ),
              ],
            })
            .catch(() => {})
        : await interaction
            .reply({
              ephemeral: true,
              embeds: [
                new MessageEmbed()
                  .setTimestamp()
                  .setAuthor({ name: "Мастер управления ивентами" })
                  .setColor(COLOR)
                  .setFooter({
                    text: interaction.member.displayName,
                    iconURL: interaction.member.displayAvatarURL({
                      dynamic: true,
                    }),
                  })
                  .setDescription(
                    "Данный мастер управления ивентами не принадлежит Вам. Вызовите свой командой /event"
                  ),
              ],
            })
            .catch(() => {});
    const Embed = new MessageEmbed()
      .setTimestamp()
      .setColor(COLOR)
      .setFooter({
        text: interaction.member.displayName,
        iconURL: interaction.member.displayAvatarURL({ dynamic: true }),
      });
    const args = interaction.customId.split("_");
    switch (args[1]) {
      case "Home":
        {
          const EventManagerAdmin = new MessageActionRow().addComponents(
            new MessageButton()
              .setCustomId("eventAdmin_EditTemplates")
              .setStyle("SECONDARY")
              .setEmoji("<:xi_one:985857614443315212>"),
            new MessageButton()
              .setCustomId("eventAdmin_EventMembersActions")
              .setStyle("SECONDARY")
              .setEmoji("<:xi_two:985857612488802325>")
          );
          interaction.update({
            embeds: [
              Embed.setAuthor({
                name: "Мастер управления ивентами (права администратора)",
              }).setDescription(
                "Добро пожаловать в мастер управления ивентами с правами администратора. Выберете, пожалуйста, опцию, с которой вы хотите работать.\n\n1. Управление шаблонами ивентов\n2. Управление ивентёрами (добавление/удаление)"
              ),
            ],
            components: [EventManagerAdmin],
          });
        }
        break;
      case "EditTemplates":
        {
          let doc = await EventsTemplates.find({});
          let options = [];
          for (let i = 0; i < doc.length; i++) {
            options.push({
              label: doc[i].name,
              value: `templateid-${doc[i].templateID}`,
            });
          }

          const Templates = new MessageActionRow().addComponents(
            new MessageSelectMenu()
              .setCustomId("SMeventAdmin_templates")
              .addOptions(
                options.length == 0
                  ? [
                      {
                        label: "Ничего не найдено.",
                        value: "empty",
                        default: true,
                      },
                    ]
                  : options
              )
              .setDisabled(options.length == 0 ? true : false)
          );
          const TemplatesButton = new MessageActionRow().addComponents(
            new MessageButton()
              .setCustomId("eventAdmin_Templates-add")
              .setLabel(
                options.length == 25
                  ? "Достигнут лимит шаблонов"
                  : "Добавить новый шаблон"
              )
              .setStyle("SUCCESS")
              .setDisabled(options.length == 25 ? true : false),
            new MessageButton()
              .setCustomId("eventAdmin_Home")
              .setStyle("PRIMARY")
              .setLabel("Главная")
          );

          interaction.update({
            embeds: [
              Embed.setAuthor({
                name: "Мастер управления ивентами (права администратора)",
              }).setDescription(
                'Выберете, пожалуйста, шаблон, который вы хотите отредактировать/удалить или же нажмите на кнопку "Добавить новый шаблон" для создания.'
              ),
            ],
            components: [Templates, TemplatesButton],
          });
        }
        break;
      case "Templates-add":
        {
          let generatedID = makeid(5);
          await EventsTemplates.create({
            templateID: generatedID,
            author: "Не указан",
            name: "Без названия",
            date: "Не указана",
            description: "Не указано",
            image: "",
            linkRoom: "{create}",
          });
          const TemplatesEditor = new MessageActionRow().addComponents(
            new MessageButton()
              .setCustomId(`eventAdmin_TemplN_${generatedID}`)
              .setLabel("Название")
              .setStyle("PRIMARY"),
            new MessageButton()
              .setCustomId(`eventAdmin_TemplD_${generatedID}`)
              .setStyle("PRIMARY")
              .setLabel("Дата"),
            new MessageButton()
              .setCustomId(`eventAdmin_TemplA_${generatedID}`)
              .setStyle("PRIMARY")
              .setLabel("Автор"),
            new MessageButton()
              .setCustomId(`eventAdmin_TemplDP_${generatedID}`)
              .setStyle("PRIMARY")
              .setLabel("Описание")
          );
          const TemplatesEditor2 = new MessageActionRow().addComponents(
            new MessageButton()
              .setCustomId(`eventAdmin_TemplI_${generatedID}`)
              .setStyle("PRIMARY")
              .setLabel("Изображение"),
            new MessageButton()
              .setCustomId(`eventAdmin_TemplL_${generatedID}`)
              .setStyle("PRIMARY")
              .setLabel("Канал")
          );
          const TemplatesChoose = new MessageActionRow().addComponents(
            new MessageButton()
              .setCustomId(`eventAdmin_EditTemplates`)
              .setEmoji("<:incident_actioned:714221559279255583>")
              .setStyle("SUCCESS"),
            new MessageButton()
              .setCustomId(`eventAdmin_TemplC_${generatedID}`)
              .setEmoji("<:incident_unactioned:714223099645526026>")
              .setStyle("DANGER")
          );

          interaction.update({
            components: [TemplatesEditor, TemplatesEditor2, TemplatesChoose],
            embeds: [
              await getTextEditor(generatedID, Embed, interaction.member),
            ],
          });
        }
        break;
      case "TemplN":
        {
          let ID = args[2];
          let type = args.length == 4 ? args[3] : "";
          await interaction.update({
            embeds: [
              Embed.setAuthor({
                name: `${
                  type == "e" ? "Редактирование" : "Создание"
                } шаблона - Live Editor`,
              }).setDescription(`Введите название ивента.`),
            ],
            components: [],
          });
          const collector = interaction.channel.createMessageCollector({
            filter: (m) =>
              m.author.id == interaction.member.id &&
              m.channel.id == interaction.channelId,
          });
          collector.on("collect", async (m) => {
            collector.stop();
            m.delete();
            await EventsTemplates.updateOne(
              { templateID: ID },
              { $set: { name: m.content } }
            );
            const TemplatesEditor = new MessageActionRow().addComponents(
              new MessageButton()
                .setCustomId(
                  `eventAdmin_TemplN_${ID}${type == "e" ? `_${type}` : ""}`
                )
                .setLabel("Название")
                .setStyle("PRIMARY"),
              new MessageButton()
                .setCustomId(
                  `eventAdmin_TemplD_${ID}${type == "e" ? `_${type}` : ""}`
                )
                .setStyle("PRIMARY")
                .setLabel("Дата"),
              new MessageButton()
                .setCustomId(
                  `eventAdmin_TemplA_${ID}${type == "e" ? `_${type}` : ""}`
                )
                .setStyle("PRIMARY")
                .setLabel("Автор"),
              new MessageButton()
                .setCustomId(
                  `eventAdmin_TemplDP_${ID}${type == "e" ? `_${type}` : ""}`
                )
                .setStyle("PRIMARY")
                .setLabel("Описание")
            );
            const TemplatesEditor2 = new MessageActionRow().addComponents(
              new MessageButton()
                .setCustomId(
                  `eventAdmin_TemplI_${ID}${type == "e" ? `_${type}` : ""}`
                )
                .setStyle("PRIMARY")
                .setLabel("Изображение"),
              new MessageButton()
                .setCustomId(
                  `eventAdmin_TemplL_${ID}${type == "e" ? `_${type}` : ""}`
                )
                .setStyle("PRIMARY")
                .setLabel("Канал")
            );
            const TemplatesChoose = new MessageActionRow().addComponents(
              new MessageButton()
                .setCustomId(`eventAdmin_EditTemplates`)
                .setEmoji("<:incident_actioned:714221559279255583>")
                .setStyle("SUCCESS"),
              new MessageButton()
                .setCustomId(
                  `eventAdmin_TemplC_${ID}${type == "e" ? `_${type}` : ""}`
                )
                .setEmoji("<:incident_unactioned:714223099645526026>")
                .setStyle("DANGER")
            );

            interaction.message.edit({
              components: [TemplatesEditor, TemplatesEditor2, TemplatesChoose],
              embeds: [
                await getTextEditor(ID, Embed, interaction.member, type),
              ],
            });
          });
        }
        break;
      case "TemplD":
        {
          let ID = args[2];
          let type = args.length == 4 ? args[3] : "";
          await interaction.update({
            embeds: [
              Embed.setAuthor({
                name: `${
                  type == "e" ? "Редактирование" : "Создание"
                } шаблона - Live Editor`,
              }).setDescription(
                `Введите дату проведения ивента.\nSyntax: "{date:1ч}", "{date}" или "Без даты".\n\nПримеры:\n "{date}" -> ${getTime(
                  "{date}"
                )}\n"{date:1ч} -> ${getTime("{date:1ч}")}`
              ),
            ],
            components: [],
          });
          const collector = interaction.channel.createMessageCollector({
            filter: (m) =>
              m.author.id == interaction.member.id &&
              m.channel.id == interaction.channelId,
          });
          collector.on("collect", async (m) => {
            collector.stop();
            m.delete();
            await EventsTemplates.updateOne(
              { templateID: ID },
              { $set: { date: m.content } }
            );
            const TemplatesEditor = new MessageActionRow().addComponents(
              new MessageButton()
                .setCustomId(
                  `eventAdmin_TemplN_${ID}${type == "e" ? `_${type}` : ""}`
                )
                .setLabel("Название")
                .setStyle("PRIMARY"),
              new MessageButton()
                .setCustomId(
                  `eventAdmin_TemplD_${ID}${type == "e" ? `_${type}` : ""}`
                )
                .setStyle("PRIMARY")
                .setLabel("Дата"),
              new MessageButton()
                .setCustomId(
                  `eventAdmin_TemplA_${ID}${type == "e" ? `_${type}` : ""}`
                )
                .setStyle("PRIMARY")
                .setLabel("Автор"),
              new MessageButton()
                .setCustomId(
                  `eventAdmin_TemplDP_${ID}${type == "e" ? `_${type}` : ""}`
                )
                .setStyle("PRIMARY")
                .setLabel("Описание")
            );
            const TemplatesEditor2 = new MessageActionRow().addComponents(
              new MessageButton()
                .setCustomId(
                  `eventAdmin_TemplI_${ID}${type == "e" ? `_${type}` : ""}`
                )
                .setStyle("PRIMARY")
                .setLabel("Изображение"),
              new MessageButton()
                .setCustomId(
                  `eventAdmin_TemplL_${ID}${type == "e" ? `_${type}` : ""}`
                )
                .setStyle("PRIMARY")
                .setLabel("Канал")
            );
            const TemplatesChoose = new MessageActionRow().addComponents(
              new MessageButton()
                .setCustomId(`eventAdmin_EditTemplates`)
                .setEmoji("<:incident_actioned:714221559279255583>")
                .setStyle("SUCCESS"),
              new MessageButton()
                .setCustomId(
                  `eventAdmin_TemplC_${ID}${type == "e" ? `_${type}` : ""}`
                )
                .setEmoji("<:incident_unactioned:714223099645526026>")
                .setStyle("DANGER")
            );

            interaction.message.edit({
              components: [TemplatesEditor, TemplatesEditor2, TemplatesChoose],
              embeds: [
                await getTextEditor(ID, Embed, interaction.member, type),
              ],
            });
          });
        }
        break;
      case "TemplA":
        {
          let ID = args[2];
          let type = args.length == 4 ? args[3] : "";
          await interaction.update({
            embeds: [
              Embed.setAuthor({
                name: `${
                  type == "e" ? "Редактирование" : "Создание"
                } шаблона - Live Editor`,
              }).setDescription(
                `Введите автора ивента.\nSyntax: "{member}" или "Без автора".\n\nПримеры:\n "{member}" -> ${
                  (getAuthor("{member}"), interaction.member)
                }`
              ),
            ],
            components: [],
          });
          const collector = interaction.channel.createMessageCollector({
            filter: (m) =>
              m.author.id == interaction.member.id &&
              m.channel.id == interaction.channelId,
          });
          collector.on("collect", async (m) => {
            collector.stop();
            m.delete();
            await EventsTemplates.updateOne(
              { templateID: ID },
              { $set: { author: m.content } }
            );
            const TemplatesEditor = new MessageActionRow().addComponents(
              new MessageButton()
                .setCustomId(
                  `eventAdmin_TemplN_${ID}${type == "e" ? `_${type}` : ""}`
                )
                .setLabel("Название")
                .setStyle("PRIMARY"),
              new MessageButton()
                .setCustomId(
                  `eventAdmin_TemplD_${ID}${type == "e" ? `_${type}` : ""}`
                )
                .setStyle("PRIMARY")
                .setLabel("Дата"),
              new MessageButton()
                .setCustomId(
                  `eventAdmin_TemplA_${ID}${type == "e" ? `_${type}` : ""}`
                )
                .setStyle("PRIMARY")
                .setLabel("Автор"),
              new MessageButton()
                .setCustomId(
                  `eventAdmin_TemplDP_${ID}${type == "e" ? `_${type}` : ""}`
                )
                .setStyle("PRIMARY")
                .setLabel("Описание")
            );
            const TemplatesEditor2 = new MessageActionRow().addComponents(
              new MessageButton()
                .setCustomId(
                  `eventAdmin_TemplI_${ID}${type == "e" ? `_${type}` : ""}`
                )
                .setStyle("PRIMARY")
                .setLabel("Изображение"),
              new MessageButton()
                .setCustomId(
                  `eventAdmin_TemplL_${ID}${type == "e" ? `_${type}` : ""}`
                )
                .setStyle("PRIMARY")
                .setLabel("Канал")
            );
            const TemplatesChoose = new MessageActionRow().addComponents(
              new MessageButton()
                .setCustomId(`eventAdmin_EditTemplates`)
                .setEmoji("<:incident_actioned:714221559279255583>")
                .setStyle("SUCCESS"),
              new MessageButton()
                .setCustomId(
                  `eventAdmin_TemplC_${ID}${type == "e" ? `_${type}` : ""}`
                )
                .setEmoji("<:incident_unactioned:714223099645526026>")
                .setStyle("DANGER")
            );

            interaction.message.edit({
              components: [TemplatesEditor, TemplatesEditor2, TemplatesChoose],
              embeds: [
                await getTextEditor(ID, Embed, interaction.member, type),
              ],
            });
          });
        }
        break;
      case "TemplDP":
        {
          let ID = args[2];
          let type = args.length == 4 ? args[3] : "";
          await interaction.update({
            embeds: [
              Embed.setAuthor({
                name: `${
                  type == "e" ? "Редактирование" : "Создание"
                } шаблона - Live Editor`,
              }).setDescription(
                `Введите описание ивента.\nПропишите "skip" или "пропуск" для отмены действия.`
              ),
            ],
            components: [],
          });
          const collector = interaction.channel.createMessageCollector({
            filter: (m) =>
              m.author.id == interaction.member.id &&
              m.channel.id == interaction.channelId,
          });
          collector.on("collect", async (m) => {
            collector.stop();
            m.delete();
            if (
              m.content.toLowerCase() != "skip" &&
              m.content.toLowerCase() != "пропуск"
            )
              await EventsTemplates.updateOne(
                { templateID: ID },
                { $set: { description: m.content } }
              );
            const TemplatesEditor = new MessageActionRow().addComponents(
              new MessageButton()
                .setCustomId(
                  `eventAdmin_TemplN_${ID}${type == "e" ? `_${type}` : ""}`
                )
                .setLabel("Название")
                .setStyle("PRIMARY"),
              new MessageButton()
                .setCustomId(
                  `eventAdmin_TemplD_${ID}${type == "e" ? `_${type}` : ""}`
                )
                .setStyle("PRIMARY")
                .setLabel("Дата"),
              new MessageButton()
                .setCustomId(
                  `eventAdmin_TemplA_${ID}${type == "e" ? `_${type}` : ""}`
                )
                .setStyle("PRIMARY")
                .setLabel("Автор"),
              new MessageButton()
                .setCustomId(
                  `eventAdmin_TemplDP_${ID}${type == "e" ? `_${type}` : ""}`
                )
                .setStyle("PRIMARY")
                .setLabel("Описание")
            );
            const TemplatesEditor2 = new MessageActionRow().addComponents(
              new MessageButton()
                .setCustomId(
                  `eventAdmin_TemplI_${ID}${type == "e" ? `_${type}` : ""}`
                )
                .setStyle("PRIMARY")
                .setLabel("Изображение"),
              new MessageButton()
                .setCustomId(
                  `eventAdmin_TemplL_${ID}${type == "e" ? `_${type}` : ""}`
                )
                .setStyle("PRIMARY")
                .setLabel("Канал")
            );
            const TemplatesChoose = new MessageActionRow().addComponents(
              new MessageButton()
                .setCustomId(`eventAdmin_EditTemplates`)
                .setEmoji("<:incident_actioned:714221559279255583>")
                .setStyle("SUCCESS"),
              new MessageButton()
                .setCustomId(
                  `eventAdmin_TemplC_${ID}${type == "e" ? `_${type}` : ""}`
                )
                .setEmoji("<:incident_unactioned:714223099645526026>")
                .setStyle("DANGER")
            );

            interaction.message.edit({
              components: [TemplatesEditor, TemplatesEditor2, TemplatesChoose],
              embeds: [
                await getTextEditor(ID, Embed, interaction.member, type),
              ],
            });
          });
        }
        break;
      case "TemplI":
        {
          let ID = args[2];
          let type = args.length == 4 ? args[3] : "";
          await interaction.update({
            embeds: [
              Embed.setAuthor({
                name: `${
                  type == "e" ? "Редактирование" : "Создание"
                } шаблона - Live Editor`,
              }).setDescription(
                `Отправьте изображение или ссылку на него.\nПропишите "skip" или "пропуск" для отмены действия. Для удаления картинки: "удалить"`
              ),
            ],
            components: [],
          });
          const collector = interaction.channel.createMessageCollector({
            filter: (m) =>
              m.author.id == interaction.member.id &&
              m.channel.id == interaction.channelId,
          });
          collector.on("collect", async (m) => {
            collector.stop();
            m.delete();
            if (
              m.content.toLowerCase() != "skip" &&
              m.content.toLowerCase() != "пропуск" &&
              m.content.toLowerCase() != "удалить"
            ) {
              let image;
              if (m.attachments.map((a) => a).length > 0)
                image = (
                  await client.guilds.cache
                    .get("975451489722048573")
                    .channels.cache.get("986574364709388288")
                    .send({ files: [m.attachments.first()] })
                ).attachments.first().url;
              else image = m.content;
              await EventsTemplates.updateOne(
                { templateID: ID },
                { $set: { image: image } }
              );
            } else if (m.content.toLowerCase() == "удалить")
              await EventsTemplates.updateOne(
                { templateID: ID },
                { $set: { image: "" } }
              );
            const TemplatesEditor = new MessageActionRow().addComponents(
              new MessageButton()
                .setCustomId(
                  `eventAdmin_TemplN_${ID}${type == "e" ? `_${type}` : ""}`
                )
                .setLabel("Название")
                .setStyle("PRIMARY"),
              new MessageButton()
                .setCustomId(
                  `eventAdmin_TemplD_${ID}${type == "e" ? `_${type}` : ""}`
                )
                .setStyle("PRIMARY")
                .setLabel("Дата"),
              new MessageButton()
                .setCustomId(
                  `eventAdmin_TemplA_${ID}${type == "e" ? `_${type}` : ""}`
                )
                .setStyle("PRIMARY")
                .setLabel("Автор"),
              new MessageButton()
                .setCustomId(
                  `eventAdmin_TemplDP_${ID}${type == "e" ? `_${type}` : ""}`
                )
                .setStyle("PRIMARY")
                .setLabel("Описание")
            );
            const TemplatesEditor2 = new MessageActionRow().addComponents(
              new MessageButton()
                .setCustomId(
                  `eventAdmin_TemplI_${ID}${type == "e" ? `_${type}` : ""}`
                )
                .setStyle("PRIMARY")
                .setLabel("Изображение"),
              new MessageButton()
                .setCustomId(
                  `eventAdmin_TemplL_${ID}${type == "e" ? `_${type}` : ""}`
                )
                .setStyle("PRIMARY")
                .setLabel("Канал")
            );
            const TemplatesChoose = new MessageActionRow().addComponents(
              new MessageButton()
                .setCustomId(`eventAdmin_EditTemplates`)
                .setEmoji("<:incident_actioned:714221559279255583>")
                .setStyle("SUCCESS"),
              new MessageButton()
                .setCustomId(
                  `eventAdmin_TemplC_${ID}${type == "e" ? `_${type}` : ""}`
                )
                .setEmoji("<:incident_unactioned:714223099645526026>")
                .setStyle("DANGER")
            );

            interaction.message.edit({
              components: [TemplatesEditor, TemplatesEditor2, TemplatesChoose],
              embeds: [
                await getTextEditor(ID, Embed, interaction.member, type),
              ],
            });
          });
        }
        break;
      case "TemplL":
        {
          let ID = args[2];
          let type = args.length == 4 ? args[3] : "";
          await interaction.update({
            embeds: [
              Embed.setAuthor({
                name: `${
                  type == "e" ? "Редактирование" : "Создание"
                } шаблона - Live Editor`,
              }).setDescription(
                `Введите ссылку на голосовой канал ивента. \nSyntax: "{create}" или "https://discord.gg/******"\n\nПример: "{create}" - голосовой канал будет создан автоматически при публикации ивента.`
                // по желанию сделать возможность автоматическое открытие канала именно во время начала/за 10 минут до начала ивента. //
              ),
            ],
            components: [],
          });
          const collector = interaction.channel.createMessageCollector({
            filter: (m) =>
              m.author.id == interaction.member.id &&
              m.channel.id == interaction.channelId,
          });
          collector.on("collect", async (m) => {
            collector.stop();
            m.delete();
            await EventsTemplates.updateOne(
              { templateID: ID },
              { $set: { linkRoom: m.content } }
            );
            const TemplatesEditor = new MessageActionRow().addComponents(
              new MessageButton()
                .setCustomId(
                  `eventAdmin_TemplN_${ID}${type == "e" ? `_${type}` : ""}`
                )
                .setLabel("Название")
                .setStyle("PRIMARY"),
              new MessageButton()
                .setCustomId(
                  `eventAdmin_TemplD_${ID}${type == "e" ? `_${type}` : ""}`
                )
                .setStyle("PRIMARY")
                .setLabel("Дата"),
              new MessageButton()
                .setCustomId(
                  `eventAdmin_TemplA_${ID}${type == "e" ? `_${type}` : ""}`
                )
                .setStyle("PRIMARY")
                .setLabel("Автор"),
              new MessageButton()
                .setCustomId(
                  `eventAdmin_TemplDP_${ID}${type == "e" ? `_${type}` : ""}`
                )
                .setStyle("PRIMARY")
                .setLabel("Описание")
            );
            const TemplatesEditor2 = new MessageActionRow().addComponents(
              new MessageButton()
                .setCustomId(
                  `eventAdmin_TemplI_${ID}${type == "e" ? `_${type}` : ""}`
                )
                .setStyle("PRIMARY")
                .setLabel("Изображение"),
              new MessageButton()
                .setCustomId(
                  `eventAdmin_TemplL_${ID}${type == "e" ? `_${type}` : ""}`
                )
                .setStyle("PRIMARY")
                .setLabel("Канал")
            );
            const TemplatesChoose = new MessageActionRow().addComponents(
              new MessageButton()
                .setCustomId(`eventAdmin_EditTemplates`)
                .setEmoji("<:incident_actioned:714221559279255583>")
                .setStyle("SUCCESS"),
              new MessageButton()
                .setCustomId(
                  `eventAdmin_TemplC_${ID}${type == "e" ? `_${type}` : ""}`
                )
                .setEmoji("<:incident_unactioned:714223099645526026>")
                .setStyle("DANGER")
            );

            interaction.message.edit({
              components: [TemplatesEditor, TemplatesEditor2, TemplatesChoose],
              embeds: [
                await getTextEditor(ID, Embed, interaction.member, type),
              ],
            });
          });
        }
        break;
      case "TemplC":
        {
          let ID = args[2];
          await EventsTemplates.deleteOne({ templateID: ID });
          let doc = await EventsTemplates.find({});
          let options = [];
          for (let i = 0; i < doc.length; i++) {
            options.push({
              label: doc[i].name,
              value: `templateid-${doc[i].templateID}`,
            });
          }

          const Templates = new MessageActionRow().addComponents(
            new MessageSelectMenu()
              .setCustomId("SMeventAdmin_templates")
              .addOptions(
                options.length == 0
                  ? [
                      {
                        label: "Ничего не найдено.",
                        value: "empty",
                        default: true,
                      },
                    ]
                  : options
              )
              .setDisabled(options.length == 0 ? true : false)
          );
          const TemplatesButton = new MessageActionRow().addComponents(
            new MessageButton()
              .setCustomId("eventAdmin_Templates-add")
              .setLabel("Добавить новый шаблон")
              .setStyle("SUCCESS"),
            new MessageButton()
              .setCustomId("eventAdmin_Home")
              .setStyle("PRIMARY")
              .setLabel("Главная")
          );

          await interaction.update({
            embeds: [
              Embed.setAuthor({
                name: "Мастер управления ивентами (права администратора)",
              }).setDescription(
                'Выберете, пожалуйста, шаблон, который вы хотите отредактировать/удалить или же нажмите на кнопку "Добавить новый шаблон" для создания.'
              ),
            ],
            components: [Templates, TemplatesButton],
          });
          await interaction.followUp({
            ephemeral: true,
            content: "Шаблон был удалён.",
          });
        }
        break;
      case "EventMembersActions":
        {
          let eventMembersArray = [];
          let membersInRole = interaction.guild.roles.cache
            .get("975435830996906074")
            .members.map((m) => m);
          for (let i = 0; i < membersInRole.length; i++) {
            eventMembersArray.push({
              label: membersInRole[i].user.tag,
              value: `${membersInRole[i].id}`,
            });
          }
          let pages = createEventManagersPage(eventMembersArray, interaction);
          interaction.update({
            embeds: [
              Embed.setAuthor({
                name: "Мастер управления ивентами (права администратора)",
              })
                .setDescription(
                  `Ниже приведён список ивентёров, для взаимодействия выберете кого-то.\n\nДля добавления ивентёров воспользуйтесь кнопкой "Добавить ивентёра"`
                )
                .setFooter({
                  text: `${interaction.member.displayName} | Страница 1/${pages[2]}`,
                  iconURL: interaction.member.displayAvatarURL({
                    dynamic: true,
                  }),
                }),
            ],
            components: [
              pages[0],
              pages[1],
              new MessageActionRow().addComponents(
                new MessageButton()
                  .setCustomId("eventAdmin_EventMembersActions-add")
                  .setStyle("SUCCESS")
                  .setLabel("Добавить ивентёра")
              ),
              new MessageActionRow().addComponents(
                new MessageButton()
                  .setCustomId("eventAdmin_Home")
                  .setStyle("PRIMARY")
                  .setLabel("Главная")
              ),
            ],
          });
        }
        break;
      case "EventMembersActions-add":
        {
          interaction.update({
            embeds: [
              Embed.setAuthor({
                name: "Мастер управления ивентами (права администратора)",
              }).setDescription(
                "Введите ID или упоминание пользователя, которого хотите внести в список ивентёров."
              ),
            ],
            components: [],
          });
          const collector = interaction.channel.createMessageCollector({
            filter: (m) =>
              m.author.id == interaction.member.id &&
              m.channel.id == interaction.channel.id,
          });
          collector.on("collect", (m) => {
            let eventMembersArray = [];
            collector.stop();
            const member =
              m.mentions.members.map((m) => m).length > 0
                ? m.mentions.members.map((m) => m)[0]
                : m.guild.members.cache.get(m.content);
            m.delete();
            if (!member)
              interaction.followUp({
                ephemeral: true,
                embeds: [
                  Embed.setAuthor({
                    name: "Мастер управления ивентами (права администратора)",
                  }).setDescription("Пользователь не найден."),
                ],
              });
            else if (
              member.roles.cache.map((r) => r.id).includes("975435830996906074")
            )
              interaction.followUp({
                ephemeral: true,
                embeds: [
                  Embed.setAuthor({
                    name: "Мастер управления ивентами (права администратора)",
                  }).setDescription(
                    "Данный пользователь уже присутствует в ивентёрах."
                  ),
                ],
              });
            else
              interaction.followUp({
                ephemeral: true,
                embeds: [
                  Embed.setAuthor({
                    name: "Мастер управления ивентами (права администратора)",
                  }).setDescription("Пользователь был добавлен в ивентёры."),
                ],
              }) &&
                member.roles.add("975435830996906074").catch(() => {}) &&
                eventMembersArray.push({
                  label: member.user.tag,
                  value: `${member.id}`,
                });

            let membersInRole = interaction.guild.roles.cache
              .get("975435830996906074")
              .members.map((m) => m);
            for (let i = 0; i < membersInRole.length; i++) {
              eventMembersArray.push({
                label: membersInRole[i].user.tag,
                value: `${membersInRole[i].id}`,
              });
            }
            let pages = createEventManagersPage(eventMembersArray, interaction);
            interaction.message.edit({
              embeds: [
                Embed.setAuthor({
                  name: "Мастер управления ивентами (права администратора)",
                })
                  .setDescription(
                    `Ниже приведён список ивентёров, для взаимодействия выберете кого-то.\n\nДля добавления ивентёров воспользуйтесь кнопкой "Добавить ивентёра"`
                  )
                  .setFooter({
                    text: `${interaction.member.displayName} | Страница 1/${pages[2]}`,
                    iconURL: interaction.member.displayAvatarURL({
                      dynamic: true,
                    }),
                  }),
              ],
              components: [
                pages[0],
                pages[1],
                new MessageActionRow().addComponents(
                  new MessageButton()
                    .setCustomId("eventAdmin_EventMembersActions-add")
                    .setStyle("SUCCESS")
                    .setLabel("Добавить ивентёра")
                ),
                new MessageActionRow().addComponents(
                  new MessageButton()
                    .setCustomId("eventAdmin_Home")
                    .setStyle("PRIMARY")
                    .setLabel("Главная")
                ),
              ],
            });
          });
        }
        break;
    }
  },
};

/**
 *
 * @param {String} doc
 * @param {MessageEmbed} Embed
 * @param {GuildMember} member
 * @param {String} type
 * @returns
 */
async function getTextEditor(ID, Embed, member, type = "") {
  let doc = await EventsTemplates.findOne({ templateID: ID });
  return Embed.setAuthor({
    name: `${
      type == "e" ? "Редактирование" : "Создание"
    } шаблона - Live Editor`,
  })
    .setTitle(`${doc.name} <-> \`Шаблон #${doc.templateID}\``)
    .setDescription(
      `**Внимание: вся информация, что указана подобным образом \`(example)\` будет показана в публикуемом ивенте вместо того, что написано слево!**\n\nВремя проведения: ${
        doc.date
      } \`(${getTime(doc.date)})\`\nАвтор: ${doc.author} \`(${getAuthor(
        doc.author,
        member
      )})\`\nСсылка на голосовой чат ивента: ${
        doc.linkRoom == "{create}"
          ? "{create} `(будет создана автоматически)`"
          : `[Кликни!](${doc.linkRoom})`
      }\nОписание: ${doc.description}`
    )
    .setImage(
      !doc.image.startsWith("http") && !doc.image.startsWith("https")
        ? ""
        : doc.images
    );

  // создать канал cache-images для вставки изображений не только по ссылке //
}
