const { Events } = require("../Validation/EventNames");
const { promisify } = require("util");
const { glob } = require("glob");
const PG = promisify(glob);
const Ascii = require("ascii-table");

module.exports = async (client) => {
  const Table = new Ascii("Events Loaded");

  (await PG(`Events/*/*.js`)).map(async (file) => {
    const event = require(`../${file}`);

    if (!Events.includes(event.name) || !event.name) {
      const L = file.split("/");
      await Table.addRow(
        `${event.name || "MISSING"}`,
        `⛔ Events name is either invalid or missing: ${L[2] + `/` + L[3]}`
      );
      return;
    }

    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args, client));
    } else {
      client.on(event.name, (...args) => event.execute(...args, client));
    }
    const L = file.split("/");
    await Table.addRow(L[2].replace(".js", ""), "✅ SUCCESSFUL");
  });
  console.log(Table.toString());
};
