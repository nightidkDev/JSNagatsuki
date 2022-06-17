const {
  Client,
  ButtonInteraction,
  MessageEmbed,
  MessageActionRow,
  MessageButton,
} = require("discord.js");

const voicePrivateSchema = require("../../Schemas/voice-schema");

module.exports = {
  name: "interactionCreate",
  /**
   * @param {ButtonInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    if (!interaction.isButton()) return;
    if (interaction.customId.startsWith("voice")) {
      const action = interaction.customId.split("-")[1];
      if (!action.startsWith("voiceOn") && !action.startsWith("voiceOff"))
        await interaction.deferReply({ ephemeral: true, fetchReply: true });
      else await interaction.deferUpdate({ fetchReply: true });
      if (interaction.member.voice.channel == undefined)
        return interaction.editReply({
          embeds: [
            new MessageEmbed({
              color: 0x68c048,
              description: "Вы не находитесь в голосовом канале.",
              timestamp: new Date(),
              footer: {
                text: interaction.user.username,
                iconURL: interaction.user.avatarURL({
                  dynamic: true,
                  size: 512,
                }),
              },
            }),
          ],
        });
      if (interaction.member.voice.channel.parent?.id != "975406530683867199")
        return interaction.editReply({
          embeds: [
            new MessageEmbed({
              color: 0x68c048,
              description: "Вы не находитесь в категории домиков.",
              timestamp: new Date(),
              footer: {
                text: interaction.user.username,
                iconURL: interaction.user.avatarURL({
                  dynamic: true,
                  size: 512,
                }),
              },
            }),
          ],
        });
      let data = await voicePrivateSchema.findOne({
        voiceID: interaction.member.voice.channel.id,
      });
      if (data.ownerID !== interaction.user.id && action !== "selfowner")
        return interaction.editReply({
          embeds: [
            new MessageEmbed({
              color: 0x68c048,
              description: "Вы не являетесь владельцем данного домика.",
              timestamp: new Date(),
              footer: {
                text: interaction.user.username,
                iconURL: interaction.user.avatarURL({
                  dynamic: true,
                  size: 512,
                }),
              },
            }),
          ],
        });
      else if (data.ownerID === interaction.user.id && action === "selfowner")
        return interaction.editReply({
          embeds: [
            new MessageEmbed({
              color: 0x68c048,
              description: "Вы уже являетесь владельцем данного домика.",
              timestamp: new Date(),
              footer: {
                text: interaction.user.username,
                iconURL: interaction.user.avatarURL({
                  dynamic: true,
                  size: 512,
                }),
              },
            }),
          ],
        });
      const channelpanel = interaction.guild.channels.cache.get(
        interaction.channel.id
      );
      if (action === "editname") {
        interaction.editReply({
          embeds: [
            new MessageEmbed({
              color: 0x68c048,
              description: "Введите новое название домика.",
              timestamp: new Date(),
              footer: {
                text: interaction.user.username,
                iconURL: interaction.user.avatarURL({
                  dynamic: true,
                  size: 512,
                }),
              },
            }),
          ],
        });
        channelpanel.permissionOverwrites.create(interaction.user, {
          SEND_MESSAGES: true,
        });
        let answer = null;
        const collector = interaction.channel.createMessageCollector({
          filter: (m) =>
            m.author.id === interaction.user.id &&
            m.channel.id === interaction.channel.id,
          time: 30000,
        });
        collector.on("collect", (m) => {
          answer = m.content;
          interaction.member.voice.channel.edit({ name: m.content });
          m.delete();
          collector.stop();
        });
        collector.on("end", () => {
          channelpanel.permissionOverwrites.delete(interaction.user);
          if (answer === null)
            return interaction.editReply({
              embeds: [
                new MessageEmbed({
                  color: 0x68c048,
                  description: "Время для ввода нового названия вышло.",
                  timestamp: new Date(),
                  footer: {
                    text: interaction.user.username,
                    iconURL: interaction.user.avatarURL({
                      dynamic: true,
                      size: 512,
                    }),
                  },
                }),
              ],
            });
          else
            return interaction.editReply({
              embeds: [
                new MessageEmbed({
                  color: 0x68c048,
                  description: "Название установлено.",
                  timestamp: new Date(),
                  footer: {
                    text: interaction.user.username,
                    iconURL: interaction.user.avatarURL({
                      dynamic: true,
                      size: 512,
                    }),
                  },
                }),
              ],
            });
        });
      } else if (action === "editlimit") {
        interaction.editReply({
          embeds: [
            new MessageEmbed({
              color: 0x68c048,
              description: "Введите новое ограничение людей в домике.",
              timestamp: new Date(),
              footer: {
                text: interaction.user.username,
                iconURL: interaction.user.avatarURL({
                  dynamic: true,
                  size: 512,
                }),
              },
            }),
          ],
        });
        channelpanel.permissionOverwrites.create(interaction.user, {
          SEND_MESSAGES: true,
        });
        let answer = null;
        let error = false;
        const collector = interaction.channel.createMessageCollector({
          filter: (m) =>
            m.author.id === interaction.user.id &&
            m.channel.id === interaction.channel.id,
          time: 30000,
        });
        collector.on("collect", (m) => {
          answer = m.content;
          m.delete();
          if (!/^[0-9]/g.test(answer)) error = true;
          else {
            if (parseInt(answer) < 0 || parseInt(answer) > 99) error = true;
            else
              interaction.member.voice.channel.edit({
                userLimit: parseInt(answer),
              });
          }
          collector.stop();
        });
        collector.on("end", () => {
          channelpanel.permissionOverwrites.delete(interaction.user);
          if (error)
            return interaction.editReply({
              embeds: [
                new MessageEmbed({
                  color: 0x68c048,
                  description:
                    "Значение может состоять только из чисел и быть в диапазоне от 0 до 99.",
                  timestamp: new Date(),
                  footer: {
                    text: interaction.user.username,
                    iconURL: interaction.user.avatarURL({
                      dynamic: true,
                      size: 512,
                    }),
                  },
                }),
              ],
            });
          else if (answer === null)
            return interaction.editReply({
              embeds: [
                new MessageEmbed({
                  color: 0x68c048,
                  description: "Время для ввода нового количества вышло.",
                  timestamp: new Date(),
                  footer: {
                    text: interaction.user.username,
                    iconURL: interaction.user.avatarURL({
                      dynamic: true,
                      size: 512,
                    }),
                  },
                }),
              ],
            });
          else
            return interaction.editReply({
              embeds: [
                new MessageEmbed({
                  color: 0x68c048,
                  description: "Количество установлено.",
                  timestamp: new Date(),
                  footer: {
                    text: interaction.user.username,
                    iconURL: interaction.user.avatarURL({
                      dynamic: true,
                      size: 512,
                    }),
                  },
                }),
              ],
            });
        });
      } else if (action === "editlock") {
        if (
          interaction.member.voice.channel
            .permissionsFor(interaction.guild.roles.everyone)
            .has("CONNECT") === true
        ) {
          interaction.member.voice.channel.permissionOverwrites.edit(
            interaction.guild.roles.everyone,
            { CONNECT: false }
          );
          interaction.editReply({
            embeds: [
              new MessageEmbed({
                color: 0x68c048,
                description: "Домик закрыт для всех.",
                timestamp: new Date(),
                footer: {
                  text: interaction.user.username,
                  iconURL: interaction.user.avatarURL({
                    dynamic: true,
                    size: 512,
                  }),
                },
              }),
            ],
          });
        } else {
          interaction.member.voice.channel.permissionOverwrites.edit(
            interaction.guild.roles.everyone,
            { CONNECT: null }
          );
          interaction.editReply({
            embeds: [
              new MessageEmbed({
                color: 0x68c048,
                description: "Домик открыт для всех.",
                timestamp: new Date(),
                footer: {
                  text: interaction.user.username,
                  iconURL: interaction.user.avatarURL({
                    dynamic: true,
                    size: 512,
                  }),
                },
              }),
            ],
          });
        }
      } else if (action === "kickuser") {
        interaction.editReply({
          embeds: [
            new MessageEmbed({
              color: 0x68c048,
              description: "Введите упоминание или ID пользователя.",
              timestamp: new Date(),
              footer: {
                text: interaction.user.username,
                iconURL: interaction.user.avatarURL({
                  dynamic: true,
                  size: 512,
                }),
              },
            }),
          ],
        });
        channelpanel.permissionOverwrites.create(interaction.user, {
          SEND_MESSAGES: true,
        });
        let answer = null;
        let error = false;
        let errorMember = false;
        const collector = interaction.channel.createMessageCollector({
          filter: (m) =>
            m.author.id === interaction.user.id &&
            m.channel.id === interaction.channel.id,
          time: 30000,
        });
        collector.on("collect", (m) => {
          let memberMention = null;
          if (m.mentions.members.map((m) => m).length === 0) {
            let memberFromId = interaction.guild.members.cache.get(m.content);
            if (memberFromId === undefined) error = true;
            else memberMention = memberFromId;
          } else memberMention = m.mentions.members.map((m) => m)[0];
          if (!error) {
            if (memberMention.voice.channel == undefined) errorMember = true;
            else if (
              memberMention.voice.channel.id !==
              interaction.member.voice.channel.id
            )
              errorMember = true;
            else if (memberMention.id === interaction.user.id)
              errorMember = true;
            else
              answer =
                true &&
                memberMention.edit({ channel: null }) &&
                interaction.editReply({
                  embeds: [
                    new MessageEmbed({
                      color: 0x68c048,
                      description: `Пользователь ${memberMention} был выгнан из вашего домика.`,
                      timestamp: new Date(),
                      footer: {
                        text: interaction.user.username,
                        iconURL: interaction.user.avatarURL({
                          dynamic: true,
                          size: 512,
                        }),
                      },
                    }),
                  ],
                });
          }
          m.delete();
          collector.stop();
        });
        collector.on("end", () => {
          channelpanel.permissionOverwrites.delete(interaction.user);
          if (error)
            return interaction.editReply({
              embeds: [
                new MessageEmbed({
                  color: 0x68c048,
                  description: "Пользователь не найден.",
                  timestamp: new Date(),
                  footer: {
                    text: interaction.user.username,
                    iconURL: interaction.user.avatarURL({
                      dynamic: true,
                      size: 512,
                    }),
                  },
                }),
              ],
            });
          else if (errorMember)
            return interaction.editReply({
              embeds: [
                new MessageEmbed({
                  color: 0x68c048,
                  description:
                    "Пользователь не находится в вашем домике.\nНу или же Вы слишком умны, и решили выгнать себя c:",
                  timestamp: new Date(),
                  footer: {
                    text: interaction.user.username,
                    iconURL: interaction.user.avatarURL({
                      dynamic: true,
                      size: 512,
                    }),
                  },
                }),
              ],
            });
          else if (answer === null)
            return interaction.editReply({
              embeds: [
                new MessageEmbed({
                  color: 0x68c048,
                  description: "Время для ввода нового названия вышло.",
                  timestamp: new Date(),
                  footer: {
                    text: interaction.user.username,
                    iconURL: interaction.user.avatarURL({
                      dynamic: true,
                      size: 512,
                    }),
                  },
                }),
              ],
            });
        });
      } else if (action === "editaccess") {
        interaction.editReply({
          embeds: [
            new MessageEmbed({
              color: 0x68c048,
              description: "Введите упоминание или ID пользователя.",
              timestamp: new Date(),
              footer: {
                text: interaction.user.username,
                iconURL: interaction.user.avatarURL({
                  dynamic: true,
                  size: 512,
                }),
              },
            }),
          ],
        });
        channelpanel.permissionOverwrites.create(interaction.user, {
          SEND_MESSAGES: true,
        });
        let answer = null;
        let error = false;
        let errorMember = false;
        const collector = interaction.channel.createMessageCollector({
          filter: (m) =>
            m.author.id === interaction.user.id &&
            m.channel.id === interaction.channel.id,
          time: 30000,
        });
        collector.on("collect", (m) => {
          let memberMention = null;
          if (m.mentions.members.map((m) => m).length === 0) {
            let memberFromId = interaction.guild.members.cache.get(m.content);
            if (memberFromId === undefined) error = true;
            else memberMention = memberFromId;
          } else memberMention = m.mentions.members.map((m) => m)[0];
          if (!error) {
            if (memberMention.id === interaction.user.id) errorMember = true;
            else {
              answer = true;
              if (
                interaction.member.voice.channel
                  .permissionsFor(memberMention)
                  .has("CONNECT") === true
              ) {
                interaction.member.voice.channel.permissionOverwrites.edit(
                  memberMention,
                  { CONNECT: false }
                );
                if (
                  memberMention.voice.channel?.id ==
                  interaction.member.voice.channel.id
                ) {
                  memberMention.edit({ channel: null });
                  interaction.editReply({
                    embeds: [
                      new MessageEmbed({
                        color: 0x68c048,
                        description: `Пользователь ${memberMention} был выгнан и заблокирован в вашем домике.`,
                        timestamp: new Date(),
                        footer: {
                          text: interaction.user.username,
                          iconURL: interaction.user.avatarURL({
                            dynamic: true,
                            size: 512,
                          }),
                        },
                      }),
                    ],
                  });
                } else {
                  interaction.editReply({
                    embeds: [
                      new MessageEmbed({
                        color: 0x68c048,
                        description: `Пользователь ${memberMention} был заблокирован в вашем домике.`,
                        timestamp: new Date(),
                        footer: {
                          text: interaction.user.username,
                          iconURL: interaction.user.avatarURL({
                            dynamic: true,
                            size: 512,
                          }),
                        },
                      }),
                    ],
                  });
                }
              } else
                interaction.member.voice.channel.permissionOverwrites.edit(
                  memberMention,
                  { CONNECT: true }
                ) &&
                  interaction.editReply({
                    embeds: [
                      new MessageEmbed({
                        color: 0x68c048,
                        description: `Пользователю ${memberMention} был выдан доступ к вашему домику.`,
                        timestamp: new Date(),
                        footer: {
                          text: interaction.user.username,
                          iconURL: interaction.user.avatarURL({
                            dynamic: true,
                            size: 512,
                          }),
                        },
                      }),
                    ],
                  });
            }
          }
          m.delete();
          collector.stop();
        });
        collector.on("end", () => {
          channelpanel.permissionOverwrites.delete(interaction.user);
          if (error)
            return interaction.editReply({
              embeds: [
                new MessageEmbed({
                  color: 0x68c048,
                  description: "Пользователь не найден.",
                  timestamp: new Date(),
                  footer: {
                    text: interaction.user.username,
                    iconURL: interaction.user.avatarURL({
                      dynamic: true,
                      size: 512,
                    }),
                  },
                }),
              ],
            });
          else if (errorMember)
            return interaction.editReply({
              embeds: [
                new MessageEmbed({
                  color: 0x68c048,
                  description:
                    "Вы слишком умны, и решили заблокировать себя, а так нельзя c:",
                  timestamp: new Date(),
                  footer: {
                    text: interaction.user.username,
                    iconURL: interaction.user.avatarURL({
                      dynamic: true,
                      size: 512,
                    }),
                  },
                }),
              ],
            });
          else if (answer === null)
            return interaction.editReply({
              embeds: [
                new MessageEmbed({
                  color: 0x68c048,
                  description: "Время для ввода нового названия вышло.",
                  timestamp: new Date(),
                  footer: {
                    text: interaction.user.username,
                    iconURL: interaction.user.avatarURL({
                      dynamic: true,
                      size: 512,
                    }),
                  },
                }),
              ],
            });
        });
      } else if (action === "editvoice") {
        interaction.editReply({
          embeds: [
            new MessageEmbed({
              color: 0x68c048,
              description: "Введите упоминание или ID пользователя.",
              timestamp: new Date(),
              footer: {
                text: interaction.user.username,
                iconURL: interaction.user.avatarURL({
                  dynamic: true,
                  size: 512,
                }),
              },
            }),
          ],
        });
        channelpanel.permissionOverwrites.create(interaction.user, {
          SEND_MESSAGES: true,
        });
        let answer = null;
        let error = false;
        let errorMember = false;
        const collector = interaction.channel.createMessageCollector({
          filter: (m) =>
            m.author.id === interaction.user.id &&
            m.channel.id === interaction.channel.id,
          time: 30000,
        });
        collector.on("collect", (m) => {
          let memberMention = null;
          if (m.mentions.members.map((m) => m).length === 0) {
            let memberFromId = interaction.guild.members.cache.get(m.content);
            if (memberFromId === undefined) error = true;
            else memberMention = memberFromId;
          } else memberMention = m.mentions.members.map((m) => m)[0];
          if (!error) {
            if (memberMention.id === interaction.user.id) errorMember = true;
            else {
              answer = true;
              const voiceEdit = new MessageActionRow().addComponents(
                new MessageButton()
                  .setLabel("Включить")
                  .setCustomId(`voice-voiceOn|${memberMention.id}`)
                  .setStyle("SUCCESS"),
                new MessageButton()
                  .setLabel("Выключить")
                  .setCustomId(`voice-voiceOff|${memberMention.id}`)
                  .setStyle("DANGER")
              );
              if (
                interaction.member.voice.channel
                  .permissionsFor(memberMention, false)
                  .has("SPEAK") === true
              ) {
                if (
                  memberMention.voice.channel?.id ==
                  interaction.member.voice.channel.id
                ) {
                  interaction.editReply({
                    embeds: [
                      new MessageEmbed({
                        color: 0x68c048,
                        author: {
                          name: "Настройки голоса",
                        },
                        description: `Пользователь: ${memberMention}\nСтатус: вкл.`,
                        timestamp: new Date(),
                        footer: {
                          text: interaction.user.username,
                          iconURL: interaction.user.avatarURL({
                            dynamic: true,
                            size: 512,
                          }),
                        },
                      }),
                    ],
                    components: [voiceEdit],
                  });
                } else {
                  interaction.editReply({
                    embeds: [
                      new MessageEmbed({
                        color: 0x68c048,
                        description: `Пользователь не находится в вашем голосовом канале.`,
                        timestamp: new Date(),
                        footer: {
                          text: interaction.user.username,
                          iconURL: interaction.user.avatarURL({
                            dynamic: true,
                            size: 512,
                          }),
                        },
                      }),
                    ],
                  });
                }
              } else {
                interaction.editReply({
                  embeds: [
                    new MessageEmbed({
                      color: 0x68c048,
                      author: {
                        name: "Настройки голоса",
                      },
                      description: `Пользователь: ${memberMention}\nСтатус: выкл.`,
                      timestamp: new Date(),
                      footer: {
                        text: interaction.user.username,
                        iconURL: interaction.user.avatarURL({
                          dynamic: true,
                          size: 512,
                        }),
                      },
                    }),
                  ],
                  components: [voiceEdit],
                });
              }
            }
          }
          m.delete();
          collector.stop();
        });
        collector.on("end", () => {
          channelpanel.permissionOverwrites.delete(interaction.user);
          if (error)
            return interaction.editReply({
              embeds: [
                new MessageEmbed({
                  color: 0x68c048,
                  description: "Пользователь не найден.",
                  timestamp: new Date(),
                  footer: {
                    text: interaction.user.username,
                    iconURL: interaction.user.avatarURL({
                      dynamic: true,
                      size: 512,
                    }),
                  },
                }),
              ],
            });
          else if (errorMember)
            return interaction.editReply({
              embeds: [
                new MessageEmbed({
                  color: 0x68c048,
                  description:
                    "Вы слишком умны, и решили заблокировать себя, а так нельзя c:",
                  timestamp: new Date(),
                  footer: {
                    text: interaction.user.username,
                    iconURL: interaction.user.avatarURL({
                      dynamic: true,
                      size: 512,
                    }),
                  },
                }),
              ],
            });
          else if (answer === null)
            return interaction.editReply({
              embeds: [
                new MessageEmbed({
                  color: 0x68c048,
                  description: "Время для ввода пользователя вышло.",
                  timestamp: new Date(),
                  footer: {
                    text: interaction.user.username,
                    iconURL: interaction.user.avatarURL({
                      dynamic: true,
                      size: 512,
                    }),
                  },
                }),
              ],
            });
        });
      } else if (
        action.startsWith("voiceOn") ||
        action.startsWith("voiceOff")
      ) {
        let actionType = action.split("|")[0];
        let member = interaction.guild.members.cache.get(action.split("|")[1]);
        if (member.voice.channel?.id != interaction.member.voice.channel?.id)
          return interaction.followUp({
            embeds: [
              new MessageEmbed()
                .setColor(0x68c048)
                .setDescription(
                  `${member} больше не находится в вашем голосовом канале.\nИли же Вы покинули свой домик.`
                )
                .setTimestamp(),
            ],
            components: [],
          });
        if (actionType === "voiceOn")
          await interaction.member.voice.channel.permissionOverwrites.edit(
            member,
            {
              SPEAK: true,
            }
          );
        else
          await interaction.member.voice.channel.permissionOverwrites.edit(
            member,
            {
              SPEAK: false,
            }
          );
        member.edit(
          { channel: interaction.member.voice.channel },
          `Изменён статус голоса в ${interaction.member.voice.channel.name}`
        );

        interaction.editReply({
          embeds: [
            new MessageEmbed({
              color: 0x68c048,
              author: {
                name: "Настройки голоса",
              },
              description: `Пользователь: ${member}\nСтатус: ${
                interaction.member.voice.channel
                  .permissionsFor(member, true)
                  .has("SPEAK") === true
                  ? "вкл."
                  : "выкл."
              }`,
              timestamp: new Date(),
              footer: {
                text: interaction.user.username,
                iconURL: interaction.user.avatarURL({
                  dynamic: true,
                  size: 512,
                }),
              },
            }),
          ],
        });
      } else if (action === "editowner") {
        interaction.editReply({
          embeds: [
            new MessageEmbed({
              color: 0x68c048,
              description: "Введите упоминание или ID пользователя.",
              timestamp: new Date(),
              footer: {
                text: interaction.user.username,
                iconURL: interaction.user.avatarURL({
                  dynamic: true,
                  size: 512,
                }),
              },
            }),
          ],
        });
        channelpanel.permissionOverwrites.create(interaction.user, {
          SEND_MESSAGES: true,
        });
        let answer = null;
        let error = false;
        let errorMember = false;
        const collector = interaction.channel.createMessageCollector({
          filter: (m) =>
            m.author.id === interaction.user.id &&
            m.channel.id === interaction.channel.id,
          time: 30000,
        });
        collector.on("collect", async (m) => {
          let memberMention = null;
          if (m.mentions.members.map((m) => m).length === 0) {
            let memberFromId = interaction.guild.members.cache.get(m.content);
            if (memberFromId === undefined) error = true;
            else memberMention = memberFromId;
          } else memberMention = m.mentions.members.map((m) => m)[0];
          if (!error) {
            if (memberMention.id === interaction.user.id) errorMember = true;
            else {
              answer = true;
              if (
                memberMention.voice.channel?.id ==
                interaction.member.voice.channel.id
              ) {
                await voicePrivateSchema.updateOne(
                  { voiceID: interaction.member.voice.channel.id },
                  { $set: { ownerID: memberMention.id } }
                );
                interaction.editReply({
                  embeds: [
                    new MessageEmbed({
                      color: 0x68c048,
                      description: `Успех! Теперь пользователь ${memberMention} является владельцем этого домика.`,
                      timestamp: new Date(),
                      footer: {
                        text: interaction.user.username,
                        iconURL: interaction.user.avatarURL({
                          dynamic: true,
                          size: 512,
                        }),
                      },
                    }),
                  ],
                });
              } else {
                interaction.editReply({
                  embeds: [
                    new MessageEmbed({
                      color: 0x68c048,
                      description: `Пользователь не находится в вашем голосовом канале.`,
                      timestamp: new Date(),
                      footer: {
                        text: interaction.user.username,
                        iconURL: interaction.user.avatarURL({
                          dynamic: true,
                          size: 512,
                        }),
                      },
                    }),
                  ],
                });
              }
            }
          }
          m.delete();
          collector.stop();
        });
        collector.on("end", () => {
          channelpanel.permissionOverwrites.delete(interaction.user);
          if (error)
            return interaction.editReply({
              embeds: [
                new MessageEmbed({
                  color: 0x68c048,
                  description: "Пользователь не найден.",
                  timestamp: new Date(),
                  footer: {
                    text: interaction.user.username,
                    iconURL: interaction.user.avatarURL({
                      dynamic: true,
                      size: 512,
                    }),
                  },
                }),
              ],
            });
          else if (errorMember)
            return interaction.editReply({
              embeds: [
                new MessageEmbed({
                  color: 0x68c048,
                  description:
                    "Вы слишком умны, и решили выдать себе же права на домик, а так нельзя c:",
                  timestamp: new Date(),
                  footer: {
                    text: interaction.user.username,
                    iconURL: interaction.user.avatarURL({
                      dynamic: true,
                      size: 512,
                    }),
                  },
                }),
              ],
            });
          else if (answer === null)
            return interaction.editReply({
              embeds: [
                new MessageEmbed({
                  color: 0x68c048,
                  description: "Время для ввода пользователя вышло.",
                  timestamp: new Date(),
                  footer: {
                    text: interaction.user.username,
                    iconURL: interaction.user.avatarURL({
                      dynamic: true,
                      size: 512,
                    }),
                  },
                }),
              ],
            });
        });
      } else if (action === "selfowner") {
        let ownerPrivate = interaction.guild.members.cache.get(data.ownerID);
        if (
          ownerPrivate.voice.channel?.id === interaction.member.voice.channel.id
        )
          return interaction.editReply({
            embeds: [
              new MessageEmbed({
                color: 0x68c048,
                description: `Увы, но владелец этого домика находится тут...`,
                timestamp: new Date(),
                footer: {
                  text: interaction.user.username,
                  iconURL: interaction.user.avatarURL({
                    dynamic: true,
                    size: 512,
                  }),
                },
              }),
            ],
          });
        await voicePrivateSchema.updateOne(
          { voiceID: interaction.member.voice.channel.id },
          { $set: { ownerID: interaction.user.id } }
        );
        interaction.editReply({
          embeds: [
            new MessageEmbed({
              color: 0x68c048,
              description: `Успех! Теперь Вы являетесь владельцем этого домика.`,
              timestamp: new Date(),
              footer: {
                text: interaction.user.username,
                iconURL: interaction.user.avatarURL({
                  dynamic: true,
                  size: 512,
                }),
              },
            }),
          ],
        });
      }
    }
  },
};
