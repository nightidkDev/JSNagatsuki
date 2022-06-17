const { Client, MessageEmbed } = require("discord.js");
const donates = require("../Schemas/DonateSponsorDB");
const { COLOR } = require("../config.json");
const usersDB = require("../Schemas/usersDB");
const { LAVATOKEN } = require("../config.json");
const axios = require("axios");
const { stringify } = require("querystring");
const Sponsors = require("../Schemas/Sponsors");

module.exports = {
  /**
   *
   * @param {Client} client
   */
  async checkSponsorDonate(client) {
    setInterval(() => {
      donates.find({}, async (err, data) => {
        data.forEach(async (m) => {
          const member = client.guilds.cache
            .get("974946487047962714")
            .members.cache.get(m.member);
          const message =
            (await client.guilds.cache
              .get("974946487047962714")
              .channels.cache.get(m.channelID)
              .messages.fetch(m.messageID)
              .catch((err) => {})) || undefined;
          const config = {
            headers: {
              Authorization: LAVATOKEN,
            },
          };
          const data = {
            id: m.uid,
          };
          if (m.time <= parseInt((new Date().getTime() / 1000).toFixed(0))) {
            await donates.deleteOne({ member: m.member });
            if (message) {
              await message.edit({
                embeds: [
                  new MessageEmbed()
                    .setDescription(
                      `Статус: Отклонён.\nСумма: ${m.amountRubles} рублей\nПокупка: Спонсорская роль\nПользователь: ${member}\n\nПлатёж обрабатывается автоматически!\nЕсли вы оплатили и в течение 30 минут вам ничего не пришло -> обратитесь к <@!252378040024301570> (night.#0666)`
                    )
                    .setColor(COLOR)
                    .setFooter({
                      text: member.nickname || member.user.username,
                      iconURL: member.displayAvatarURL({
                        dynamic: true,
                      }),
                    })
                    .setAuthor({ name: "Донат" }),
                ],
                components: [],
              });
            }
            return;
          }
          axios
            .post("https://api.lava.ru/invoice/info", stringify(data), config)
            .then(async (res) => {
              if (res.data.invoice.status == "success") {
                const Embed = new MessageEmbed()
                  .setColor(COLOR)
                  .setTimestamp()
                  .setAuthor({ name: "Зачисление" });
                await Sponsors.create({
                  member: member.id,
                  time: parseInt(new Date().getTime() / 1000) + 2592000,
                  timeGive: parseInt(getDateMidNight().getTime() / 1000),
                });
                await usersDB.updateOne(
                  { userID: member.id },
                  { $inc: { "currency.donate": 1 } }
                );
                if (member) {
                  member.roles.add("977667260808306750");
                  member
                    .send({
                      embeds: [
                        Embed.setDescription(
                          `Всемогущий Сёгун проявляет свое уважение Ронину, ставшему на путь истинный. Благодарим за поддержку нашего сервера и даруем вам особую роль "Shōgun shien" . На протяжении месяца вам будут доступны журнал аудита и чат спонсоров, а так же раз в день будут начисляться Печати Сегуна в количестве 1 монеты. Вы сможете тратить донатерскую валюту в Особой лавке на эксклюзивные роли и приятные бонусы. Ваше высокое положение в чате будет отображать специальный значок роли рядом с вашим ником. Да прибудет с вами сила Тамонтэна — бога богатства и процветания. Kōun o! (Удачи!)`
                        ).setFooter({
                          text: member.guild.name,
                          iconURL: member.guild.iconURL({ dynamic: true }),
                        }),
                      ],
                    })
                    .catch((err) => {});
                }
                if (message) {
                  await message.edit({
                    embeds: [
                      new MessageEmbed()
                        .setDescription(
                          `Статус: Успешный.\nСумма: ${m.amountRubles} рублей\nПокупка: Спонсорская роль\nПользователь: ${member}\n\nПлатёж обрабатывается автоматически!\nЕсли вы оплатили и в течение 30 минут вам ничего не пришло -> обратитесь к <@!252378040024301570> (night.#0666)`
                        )
                        .setColor(COLOR)
                        .setFooter({
                          text: member.nickname || member.user.username,
                          iconURL: member.displayAvatarURL({
                            dynamic: true,
                          }),
                        })
                        .setAuthor({ name: "Донат" }),
                    ],
                    components: [],
                  });
                }
                await donates.deleteOne({ member: m.member });
              } else return;
            });
        });
      });
    }, 30000);
  },
};

function declension(forms, val) {
  const cases = [2, 0, 1, 1, 1, 2];
  if (val % 100 > 4 && val % 100 < 20) return forms[2];
  else {
    if (val % 10 < 5) return forms[cases[val % 10]];
    else return forms[cases[5]];
  }
}

function getDateMidNight() {
  let newDate = new Date().setHours(0, 0, 0, 0);
  newDate = new Date(newDate).setUTCDate(new Date().getDate() + 1);
  return new Date(newDate);
}
