const { Client, Role, GuildMember } = require("discord.js");
const rolesDB = require("../../Schemas/rolesDB");

module.exports = {
  name: "guildMemberAdd",
  /**
   *
   * @param {GuildMember} member
   * @param {Client} client
   */
  async execute(member, client) {
    let doc = await rolesDB.findOne({ member: member.id });
    if (!doc) return;
    for (let i = 0; i < doc.roles.length; i++) {
      member.roles.add(doc.roles[i]).catch(() => {});
    }
    await rolesDB.deleteOne({ member: member.id });
  },
};
