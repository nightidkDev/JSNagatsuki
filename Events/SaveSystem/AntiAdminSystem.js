const { Client, GuildMember } = require("discord.js");

module.exports = {
  name: "guildMemberUpdate",
  /**
   *
   * @param {GuildMember} oldMember
   * @param {GuildMember} newMember
   * @param {Client} client
   */
  async execute(oldMember, newMember, client) {
    if (oldMember.roles == newMember.roles) return;
    if (
      newMember.roles.cache.map((r) => r).sort((a, b) => a.id - b.id) !=
      oldMember.roles.cache.map((r) => r).sort((a, b) => a.id - b.id)
    ) {
      console.log("yup!");
      let result = newMember.roles.cache
        .map((r) => r)
        .filter((el) => !oldMember.roles.cache.map((r) => r).includes(el));
      for (let i = 0; i < result.length; i++) {
        if (result[i].permissions.has("ADMINISTRATOR"))
          newMember.roles.remove(result[i].id, "system role").catch(() => {});
      }
    }
  },
};
