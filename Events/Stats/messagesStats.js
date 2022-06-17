const { Client, Message } = require("discord.js");
const usersDB = require("../../Schemas/usersDB");

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

    let data = await usersDB.findOneAndUpdate(
      { userID: member.id },
      {},
      { new: true, upsert: true }
    );

    if (!data.stats) {
      data.stats = {
        chat: { "7d": [], "14d": [], "30d": [] },
        voice: { "7d": [], "14d": [], "30d": [] },
      };
    }
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
          data.stats.chat["7d"][data.stats.chat["7d"].length - 1].channels.push(
            { id: message.channelId, count: 1 }
          );
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
          data.stats.chat["14d"][data.stats.chat["14d"].length - 1].count += 1;
        } else {
          data.stats.chat["14d"][data.stats.chat["14d"].length - 1].channels[
            index
          ].count += 1;
          data.stats.chat["14d"][data.stats.chat["14d"].length - 1].count += 1;
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
          data.stats.chat["30d"][data.stats.chat["30d"].length - 1].count += 1;
        } else {
          data.stats.chat["30d"][data.stats.chat["30d"].length - 1].channels[
            index
          ].count += 1;
          data.stats.chat["30d"][data.stats.chat["30d"].length - 1].count += 1;
        }
      }
    }
    if (data.stats.chat["30d"].length > 30) {
      data.stats.chat["30d"].splice(0, data.stats.chat["30d"].length - 30);
    }

    await usersDB.updateOne(
      { userID: member.id },
      {
        $set: {
          stats: data.stats,
        },
      }
    );
  },
};
