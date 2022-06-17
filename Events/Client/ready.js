const { Client } = require("discord.js");
const mongoose = require("mongoose");
const { DB } = require("../../config.json");
const os = require("os");
const osUtils = require("os-utils");
const ms = require("ms");

const DateBase = require("../../Schemas/ClientDB");

module.exports = {
  name: "ready",
  once: true,
  /**
   * @param {Client} client
   */
  execute(client) {
    require("../../Modules/checkVoiceState").checkVoiceState(client);
    // -------------- Loops --------------//
    require("../../Loops/Moderation").mutes(client);
    require("../../Loops/Donates").check(client);
    require("../../Loops/EconomyVoice").voiceEconomy(client);
    require("../../Loops/DonatesSponsor").checkSponsorDonate(client);
    require("../../Loops/SponsorsGiveStamps").sponsorsGive(client);
    require("../../Loops/SponsorsCheck").sponsorsCheck(client);
    require("../../Loops/BannerEdit").editBanner(client);
    require("../../Loops/BannerInfoCheck").bannerInfoCheck(client);
    require("../../Loops/PrivatesExpire").checkExpirePrivates(client);

    client.user.setPresence({
      activities: [
        {
          name: `💥 Инициализация...`,
          type: "PLAYING",
        },
      ],
      status: "idle",
    });

    console.log(`${client.user.tag} is online.`);
    setTimeout(() => {
      client.user.setPresence({
        activities: [
          {
            name: "meow💚",
            type: "LISTENING",
          },
        ],
        status: "online",
      });
    }, 5000);

    if (!DB) return;
    mongoose
      .connect(DB, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
      .then(() => {
        console.log("DB connected.");
      })
      .catch((err) => {
        console.log(err);
      });

    // -------------- Events --------------//

    // Memory Data Update
    let memArray = [];

    setInterval(async () => {
      //Used Memory in GB
      memArray.push(await getMemoryUsage());

      if (memArray.length >= 14) {
        memArray.shift();
      }

      // Store in Database
      await DateBase.findOneAndUpdate(
        {
          Client: true,
        },
        {
          Memory: memArray,
        },
        {
          upsert: true,
        }
      );
    }, ms("5s")); //= 5000 (ms)
  },
};

/* ----------[CPU Usage]---------- */
const cpus = os.cpus();
const cpu = cpus[0];

// Accumulate every CPU times values
const total = Object.values(cpu.times).reduce((acc, tv) => acc + tv, 0);

// Calculate the CPU usage
const usage = process.cpuUsage();
const currentCPUUsage = (usage.user + usage.system) * 1000;
const perc = (currentCPUUsage / total) * 100;

/* ----------[RAM Usage]---------- */

/**Get the process memory usage (in MB) */
async function getMemoryUsage() {
  return process.memoryUsage().heapUsed / (1024 * 1024).toFixed(2);
}
