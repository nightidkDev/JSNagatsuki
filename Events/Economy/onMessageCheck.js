const { Client, Message, MessageEmbed } = require("discord.js");
const usersDB = require("../../Schemas/usersDB");
const { PREFIX, COLOR, DENIED_CHANNELS } = require("../../config.json");
const ranks = require("../../rolesLevel.json");
const BannerInfo = require("../../Schemas/BannerInfo");

module.exports = {
  name: "messageCreate",
  /**
   *
   * @param {Message} message
   * @param {Client} client
   */
  async execute(message, client) {
    if (message.channel.type !== "GUILD_TEXT") return;
    const { member, guild, channel } = message;
    if (!member) return;
    if (member.user.bot) return;

    if ((await usersDB.count({ userID: member.id })) === 0) {
      await usersDB.create({
        userID: member.id,
        voiceJoinAt: member.voice.channel
          ? parseInt(new Date().getTime() / 1000)
          : 0,
        voiceState: member.voice.channel ? 1 : 0,
        voiceTime: 0,
        warns: [],
        currency: { event: 0, donate: 0, common: 0 },
        level: 1,
        nowXP: 0,
        needXP: 5665,
        family: { partner: "", marryTime: 0, childrens: [] },
        clan: 0,
        inventory: [],
        stats: {
          chat: { "7d": [], "14d": [], "30d": [] },
          voice: { "7d": [], "14d": [], "30d": [] },
        },
      });
    }
    if (DENIED_CHANNELS.includes(channel.id)) return;

    let data = await usersDB.findOneAndUpdate(
      { userID: member.id },
      {},
      { new: true, upsert: true }
    );

    if (data.nowXP + 3 >= data.needXP) {
      data.level += 1;
      data.nowXP = data.nowXP + 3 - data.needXP;
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
      data.nowXP += 3;
    }
    await data.save();

    if (!data.stats) {
      data.stats = {
        chat: { "7d": [], "14d": [], "30d": [] },
        voice: { "7d": [], "14d": [], "30d": [] },
      };
    }
    if (message.guild.systemChannel.id != message.channelId) {
      if (data.stats.chat["7d"].length == 0) {
        data.stats.chat["7d"].push({
          date: new Date(new Date().setHours(0, 0, 0, 0)).getTime(),
          channels: [{ id: message.channelId, count: 1 }],
          count: 1,
        });
      } else {
        if (
          (new Date(new Date().setHours(0, 0, 0, 0)) -
            new Date(
              data.stats.chat["7d"][data.stats.chat["7d"].length - 1].date
            )) /
            86400000 >=
          1
        ) {
          data.stats.chat["7d"].push({
            date: new Date(new Date().setHours(0, 0, 0, 0)).getTime(),
            channels: [{ id: message.channelId, count: 1 }],
            count: 1,
          });
        } else {
          let index = getIndex(
            message.channelId,
            data.stats.chat["7d"][data.stats.chat["7d"].length - 1].channels
          );

          if (index == -1) {
            data.stats.chat["7d"][
              data.stats.chat["7d"].length - 1
            ].channels.push({ id: message.channelId, count: 1 });
            data.stats.chat["7d"][data.stats.chat["7d"].length - 1].count += 1;
          } else {
            data.stats.chat["7d"][data.stats.chat["7d"].length - 1].channels[
              index
            ].count += 1;
            data.stats.chat["7d"][data.stats.chat["7d"].length - 1].count += 1;
          }
        }
      }
      if (data.stats.chat["7d"].length > 7) {
        data.stats.chat["7d"].splice(0, data.stats.chat["7d"].length - 7);
      }

      if (data.stats.chat["14d"].length == 0) {
        data.stats.chat["14d"].push({
          date: new Date(new Date().setHours(0, 0, 0, 0)).getTime(),
          channels: [{ id: message.channelId, count: 1 }],
          count: 1,
        });
      } else {
        if (
          (new Date(new Date().setHours(0, 0, 0, 0)) -
            new Date(
              data.stats.chat["14d"][data.stats.chat["14d"].length - 1].date
            )) /
            86400000 >=
          1
        ) {
          data.stats.chat["14d"].push({
            date: new Date(new Date().setHours(0, 0, 0, 0)).getTime(),
            channels: [{ id: message.channelId, count: 1 }],
            count: 1,
          });
        } else {
          let index = getIndex(
            message.channelId,
            data.stats.chat["14d"][data.stats.chat["14d"].length - 1].channels
          );

          if (index == -1) {
            data.stats.chat["14d"][
              data.stats.chat["14d"].length - 1
            ].channels.push({ id: message.channelId, count: 1 });
            data.stats.chat["14d"][
              data.stats.chat["14d"].length - 1
            ].count += 1;
          } else {
            data.stats.chat["14d"][data.stats.chat["14d"].length - 1].channels[
              index
            ].count += 1;
            data.stats.chat["14d"][
              data.stats.chat["14d"].length - 1
            ].count += 1;
          }
        }
      }
      if (data.stats.chat["14d"].length > 14) {
        data.stats.chat["14d"].splice(0, data.stats.chat["14d"].length - 14);
      }

      if (data.stats.chat["30d"].length == 0) {
        data.stats.chat["30d"].push({
          date: new Date(new Date().setHours(0, 0, 0, 0)).getTime(),
          channels: [{ id: message.channelId, count: 1 }],
          count: 1,
        });
      } else {
        if (
          (new Date(new Date().setHours(0, 0, 0, 0)) -
            new Date(
              data.stats.chat["30d"][data.stats.chat["30d"].length - 1].date
            )) /
            86400000 >=
          1
        ) {
          data.stats.chat["30d"].push({
            date: new Date(new Date().setHours(0, 0, 0, 0)).getTime(),
            channels: [{ id: message.channelId, count: 1 }],
            count: 1,
          });
        } else {
          let index = getIndex(
            message.channelId,
            data.stats.chat["30d"][data.stats.chat["30d"].length - 1].channels
          );

          if (index == -1) {
            data.stats.chat["30d"][
              data.stats.chat["30d"].length - 1
            ].channels.push({ id: message.channelId, count: 1 });
            data.stats.chat["30d"][
              data.stats.chat["30d"].length - 1
            ].count += 1;
          } else {
            data.stats.chat["30d"][data.stats.chat["30d"].length - 1].channels[
              index
            ].count += 1;
            data.stats.chat["30d"][
              data.stats.chat["30d"].length - 1
            ].count += 1;
          }
        }
      }
      if (data.stats.chat["30d"].length > 30) {
        data.stats.chat["30d"].splice(0, data.stats.chat["30d"].length - 30);
      }
    }

    await usersDB.updateOne(
      { userID: member.id },
      {
        $set: {
          stats: data.stats,
          "currency.common": parseFloat(
            (parseFloat(data.currency.common.toFixed(2)) + 0.01).toFixed(2)
          ),
        },
        $inc: {
          messages: 1,
        },
      }
    );
    await BannerInfo.updateOne({}, { $inc: { messages: 1 } });
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
