const { Client, Collection } = require("discord.js");
const client = new Client({ intents: 65535, partials: ["MESSAGE"] });
const { TOKEN, COLOR } = require("./config.json");
const { DisTube } = require("distube");
const { SpotifyPlugin } = require("@distube/spotify");

client.distube = new DisTube(client, {
  emitNewSongOnly: true,
  savePreviousSongs: false,
  nsfw: true,
  emitAddSongWhenCreatingQueue: false,
  plugins: [new SpotifyPlugin()],
  youtubeDL: false,
  leaveOnEmpty: true,
  leaveOnFinish: true,
});

module.exports = client;

client.commands = new Collection();
client.SpamSystemUsers = new Collection();

require("./Systems/GiveawaySystem")(client);

client.setMaxListeners(0);

require("./Handlers/Events")(client);
require("./Handlers/Commands")(client);

client.login(TOKEN);
