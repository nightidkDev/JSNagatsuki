const { Perms } = require("../Validation/Permissions");
const { Client } = require("discord.js");
const { promisify } = require("util");
const { glob } = require("glob");
const PG = promisify(glob);
const Ascii = require("ascii-table");

/**
 * @param {Client} client
 */
module.exports = async (client) => {
  const Tabel = new Ascii("Command Loaded");

  CommandsArray = [];

  (await PG(`Commands/*/*.js`)).map(async (file) => {
    const command = require(`../${file}`);

    if (!command)
      return Tabel.addRow(file.split("/")[2], "🔸 FAILED", "Missing a name.");

    if (!command.type && !command.description)
      return Tabel.addRow(command.name, "🔸 FAILED", "Missing a description.");

    if (command.permission) {
      if (Perms.includes(command.permission)) command.defaultPermission = false;
      else
        return Tabel.addRow(
          file.split("/")[2],
          "🔸 FAILED",
          "Permission is invalid."
        );
    }

    client.commands.set(command.name, command);
    CommandsArray.push(command);

    await Tabel.addRow(command.name, "🔹 SUCCESSFUL");
  });

  console.log(Tabel.toString());

  client.once("ready", async () => {
    await client.guilds.cache.forEach((guild) => {
      guild.commands
        .set(CommandsArray)
        .then(async (command) => {
          const Roles = (commandName) => {
            const cmdPerms = CommandsArray.find(
              (c) => c.name === commandName
            ).permission;
            if (!cmdPerms) return null;

            return guild.roles.cache.filter((r) => r.permissions.has(cmdPerms));
          };

          const fullPermissions = command.reduce((accumulator, r) => {
            const roles = Roles(r.name);
            if (!roles) return accumulator;

            const permissions = roles.reduce((a, r) => {
              return [{ id: r.id, type: "ROLE", permission: true }];
            }, []);

            return [...accumulator, { id: r.id, permissions }];
          }, []);

          //await guild.commands.permissions.set({ fullPermissions: fullPermissions })
        })
        .catch((err) => {
          //console.log(err);
          console.log(
            `Guild unsupported slash commands - ${guild.name} | ${guild.id}`
          );
        });
    });
  });
};
