const { Client, MessageEmbed } = require("discord.js");
const usersDB = require("../Schemas/usersDB");
const { COLOR } = require("../config.json");
const ranks = require("../rolesLevel.json");

module.exports = {
  /**
   *
   * @param {Client} client
   */
  async voiceEconomy(client) {
    setInterval(() => {
      usersDB.find(
        {
          voiceJoinAt: {
            $lte: parseInt(new Date().getTime() / 1000) - 60,
          },
          voiceState: 1,
        },
        async (err, data) => {
          data.forEach(async (m) => {
            const member = client.guilds.cache
              .get("974946487047962714")
              .members.cache.get(m.userID);
            const guild = member.guild;
            //console.log(`trigger - ${member.user.tag}`);
            //console.log(
            //  parseInt(new Date().getTime() / 1000) - 60 <= m.voiceJoinAt
            //);
            if (!member.voice.channel)
              await usersDB.updateOne(
                { userID: member.id },
                { $set: { voiceState: 0 } }
              );
            else if (
              member.voice.channel.members
                .filter((m) => !m.user.bot)
                .map((m) => m).length == 1
            ) {
              //console.log(`${member.user.tag} solo farm. skip...`);
              let data = await usersDB.findOneAndUpdate(
                { userID: member.id },
                {},
                { new: true, upsert: true }
              );

              data.voiceJoinAt = parseInt(new Date().getTime() / 1000);
              //data.voiceTime += 60;

              await data.save();
            } else {
              let data = await usersDB.findOneAndUpdate(
                { userID: member.id },
                {},
                { new: true, upsert: true }
              );
              if (data.nowXP + 9 >= data.needXP) {
                data.level += 1;
                data.nowXP = data.nowXP + 9 - data.needXP;
                data.needXP = parseInt(
                  (data.level / 10) ** 2 + (data.level / 10) * 56.65 * 1000
                );
                if (Object.keys(ranks).includes(data.level.toString())) {
                  let rank = ranks[data.level.toString()];
                  member
                    .send({
                      embeds: [
                        new MessageEmbed()
                          .setTimestamp()
                          .setFooter({
                            text: guild.name,
                            iconURL: guild.iconURL({ dynamic: true }),
                          })
                          .setDescription(
                            `Опыт — вот учитель жизни вечной.\nВаш титул повышен : ${rank.name}`
                          )
                          .setColor(COLOR),
                      ],
                    })
                    .catch((err) => {});
                  member.roles.add(rank.id).catch((err) => {});
                  let index = Object.keys(ranks).indexOf(data.level.toString());
                  if (index !== 0)
                    member.roles.remove(Object.entries(ranks)[index - 1][1].id);
                }
              } else {
                data.nowXP += 9;
              }
              data.voiceJoinAt = parseInt(new Date().getTime() / 1000);
              data.voiceTime += 60;

              await data.save();

              if (!data.stats) {
                data.stats = {
                  chat: { "7d": [], "14d": [], "30d": [] },
                  voice: { "7d": [], "14d": [], "30d": [] },
                };
              }
              if (data.stats.voice["7d"].length == 0) {
                data.stats.voice["7d"].push({
                  date: new Date(new Date().setHours(0, 0, 0, 0)).getTime(),
                  channels: [{ id: member.voice.channelId, count: 60 }],
                  count: 60,
                });
              } else {
                if (
                  (new Date(new Date().setHours(0, 0, 0, 0)) -
                    new Date(
                      data.stats.voice["7d"][
                        data.stats.voice["7d"].length - 1
                      ].date
                    )) /
                    86400000 >=
                  1
                ) {
                  data.stats.voice["7d"].push({
                    date: new Date(new Date().setHours(0, 0, 0, 0)).getTime(),
                    channels: [{ id: member.voice.channelId, count: 60 }],
                    count: 60,
                  });
                } else {
                  let index = getIndex(
                    member.voice.channelId,
                    data.stats.voice["7d"][data.stats.voice["7d"].length - 1]
                      .channels
                  );

                  if (index == -1) {
                    data.stats.voice["7d"][
                      data.stats.voice["7d"].length - 1
                    ].channels.push({ id: member.voice.channelId, count: 60 });
                    data.stats.voice["7d"][
                      data.stats.voice["7d"].length - 1
                    ].count += 60;
                  } else {
                    data.stats.voice["7d"][
                      data.stats.voice["7d"].length - 1
                    ].channels[index].count += 60;
                    data.stats.voice["7d"][
                      data.stats.voice["7d"].length - 1
                    ].count += 60;
                  }
                }
              }
              if (data.stats.voice["7d"].length > 7) {
                data.stats.voice["7d"].splice(
                  0,
                  data.stats.voice["7d"].length - 7
                );
              }

              if (data.stats.voice["14d"].length == 0) {
                data.stats.voice["14d"].push({
                  date: new Date(new Date().setHours(0, 0, 0, 0)).getTime(),
                  channels: [{ id: member.voice.channelId, count: 60 }],
                  count: 60,
                });
              } else {
                if (
                  (new Date(new Date().setHours(0, 0, 0, 0)) -
                    new Date(
                      data.stats.voice["14d"][
                        data.stats.voice["14d"].length - 1
                      ].date
                    )) /
                    86400000 >=
                  1
                ) {
                  data.stats.voice["14d"].push({
                    date: new Date(new Date().setHours(0, 0, 0, 0)).getTime(),
                    channels: [{ id: member.voice.channelId, count: 60 }],
                    count: 60,
                  });
                } else {
                  let index = getIndex(
                    member.voice.channelId,
                    data.stats.voice["14d"][data.stats.voice["14d"].length - 1]
                      .channels
                  );

                  if (index == -1) {
                    data.stats.voice["14d"][
                      data.stats.voice["14d"].length - 1
                    ].channels.push({ id: member.voice.channelId, count: 60 });
                    data.stats.voice["14d"][
                      data.stats.voice["14d"].length - 1
                    ].count += 60;
                  } else {
                    data.stats.voice["14d"][
                      data.stats.voice["14d"].length - 1
                    ].channels[index].count += 60;
                    data.stats.voice["14d"][
                      data.stats.voice["14d"].length - 1
                    ].count += 60;
                  }
                }
              }
              if (data.stats.voice["14d"].length > 14) {
                data.stats.voice["14d"].splice(
                  0,
                  data.stats.voice["14d"].length - 14
                );
              }

              if (data.stats.voice["30d"].length == 0) {
                data.stats.voice["30d"].push({
                  date: new Date(new Date().setHours(0, 0, 0, 0)).getTime(),
                  channels: [{ id: member.voice.channelId, count: 60 }],
                  count: 60,
                });
              } else {
                if (
                  (new Date(new Date().setHours(0, 0, 0, 0)) -
                    new Date(
                      data.stats.voice["30d"][
                        data.stats.voice["30d"].length - 1
                      ].date
                    )) /
                    86400000 >=
                  1
                ) {
                  data.stats.voice["30d"].push({
                    date: new Date(new Date().setHours(0, 0, 0, 0)).getTime(),
                    channels: [{ id: member.voice.channelId, count: 60 }],
                    count: 60,
                  });
                } else {
                  let index = getIndex(
                    member.voice.channelId,
                    data.stats.voice["30d"][data.stats.voice["30d"].length - 1]
                      .channels
                  );

                  if (index == -1) {
                    data.stats.voice["30d"][
                      data.stats.voice["30d"].length - 1
                    ].channels.push({ id: member.voice.channelId, count: 60 });
                    data.stats.voice["30d"][
                      data.stats.voice["30d"].length - 1
                    ].count += 60;
                  } else {
                    data.stats.voice["30d"][
                      data.stats.voice["30d"].length - 1
                    ].channels[index].count += 60;
                    data.stats.voice["30d"][
                      data.stats.voice["30d"].length - 1
                    ].count += 60;
                  }
                }
              }
              if (data.stats.voice["30d"].length > 30) {
                data.stats.voice["30d"].splice(
                  0,
                  data.stats.voice["30d"].length - 30
                );
              }

              await usersDB.updateOne(
                { userID: member.id },
                {
                  $set: {
                    stats: data.stats,
                    "currency.common": parseFloat(
                      (
                        parseFloat(data.currency.common.toFixed(2)) + 0.01
                      ).toFixed(2)
                    ),
                  },
                }
              );
            }
          });
        }
      );
    }, 1000);
  },
};

/**
 *
 * @param {String} channelID
 * @param {Object[]} array
 */
function getIndex(channelID, array) {
  let i = -1;
  array.forEach((el, index) => {
    if (el.id == channelID) {
      i = index;
    }
  });
  return i;
}
