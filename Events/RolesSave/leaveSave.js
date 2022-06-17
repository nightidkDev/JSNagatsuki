const { Client, Role, GuildMember } = require("discord.js");
const rolesDB = require("../../Schemas/rolesDB");

module.exports = {
  name: "guildMemberRemove",
  /**
   *
   * @param {GuildMember} member
   * @param {Client} client
   */
  async execute(member, client) {
    const roles = [];
    member.roles.cache.forEach((r) => {
      if (member.guild.roles.everyone.id != r.id) roles.push(r.id);
    });

    await rolesDB.create({ member: member.id, roles: roles });
  },
};
