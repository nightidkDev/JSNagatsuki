const {
  GuildMember,
  CommandInteraction,
  MessageEmbed,
  MessageActionRow,
  MessageButton,
} = require("discord.js");
const { COLOR } = require("../config.json");

module.exports = {
  /**
   * @param {String} name
   * @param {String} text
   * @param {String[]} images
   * @param {GuildMember} member
   * @param {CommandInteraction} interaction
   */
  createSelfMemberReaction: async function createSelfMemberReaction(
    name,
    text,
    images,
    member,
    interaction
  ) {},

  /**
   * @param {String} name
   * @param {String} text
   * @param {String[]} images
   * @param {GuildMember} member
   * @param {CommandInteraction} interaction
   */
  createAllMemberReaction: async function createSelfMemberReaction(
    name,
    text,
    images,
    member,
    interaction
  ) {
    const Embed = new MessageEmbed()
      .setTimestamp()
      .setFooter({
        text: member.nickname || member.user.username,
        iconURL: member.displayAvatarURL({ dynamic: true }),
      })
      .setAuthor({ name: `Реакция: ${name}` })
      .setColor(COLOR);

    Embed.setImage(arrayRand(images));
    Embed.setDescription(text.replace("{self}", `${member}`));

    await interaction.reply({ embeds: [Embed] });
  },

  /**
   * @param {String} name
   * @param {String} text
   * @param {String[]} images
   * @param {GuildMember} member
   * @param {GuildMember} target
   * @param {CommandInteraction} interaction
   */
  createTwoMembersReaction: async function createTwoMembersReaction(
    name,
    text,
    images,
    member,
    target,
    interaction
  ) {
    const Embed = new MessageEmbed()
      .setTimestamp()
      .setFooter({
        text: member.nickname || member.user.username,
        iconURL: member.displayAvatarURL({ dynamic: true }),
      })
      .setAuthor({ name: `Реакция: ${name}` })
      .setColor(COLOR);

    if (member.id === target.id)
      return interaction.reply({
        embeds: [Embed.setDescription("Может попробуете указать не себя?..")],
        ephemeral: true,
      });
    if (target.user.bot && member.id != "252378040024301570")
      return interaction.reply({
        embeds: [Embed.setDescription("Не трогайте ботов, прошу!")],
        ephemeral: true,
      });

    Embed.setImage(arrayRand(images));
    Embed.setDescription(
      text.replace("{self}", `${member}`).replace("{member}", `${target}`)
    );

    await interaction.reply({ content: `${target}`, embeds: [Embed] });
    deletePing(interaction, Embed, [], 100);
  },

  /**
   * @param {String} name
   * @param {String} question
   * @param {String} text
   * @param {String[]} images
   * @param {GuildMember} member
   * @param {GuildMember} target
   * @param {CommandInteraction} interaction
   */
  createConfirmTwoMembersReaction:
    async function createConfirmTwoMembersReaction(
      name,
      question,
      text,
      images,
      member,
      target,
      interaction
    ) {
      const Embed = new MessageEmbed()
        .setTimestamp()
        .setFooter({
          text: member.nickname || member.user.username,
          iconURL: member.displayAvatarURL({ dynamic: true }),
        })
        .setAuthor({ name: `Реакция: ${name}` })
        .setColor(COLOR);

      if (member.id === target.id)
        return interaction.reply({
          embeds: [Embed.setDescription("Может попробуете указать не себя?..")],
          ephemeral: true,
        });
      if (target.user.bot && member.id != "252378040024301570")
        return interaction.reply({
          embeds: [Embed.setDescription("Не трогайте ботов, прошу!")],
          ephemeral: true,
        });

      const Row = new MessageActionRow().addComponents(
        new MessageButton()
          .setCustomId("reaction-yes")
          .setEmoji("<:yes:879083428836933712>")
          .setStyle("SECONDARY"),
        new MessageButton()
          .setCustomId("reaction-no")
          .setEmoji("<:no:879083439742152744>")
          .setStyle("SECONDARY")
      );

      await interaction.reply({
        content: `${target}`,
        embeds: [
          Embed.setDescription(
            question
              .replace("{self}", `${member}`)
              .replace("{member}", `${target}`)
          ),
        ],
        components: [Row],
      });
      deletePing(interaction, Embed, [Row], 100);

      let collector = interaction.channel.createMessageComponentCollector({
        componentType: "BUTTON",
        filter: (i) =>
          i.channelId === interaction.channelId &&
          i.user.id === target.id &&
          i.customId.startsWith("reaction"),
        time: 20000,
      });
      let answered = false;
      collector.on("collect", async (i) => {
        if (i.customId.endsWith("yes")) {
          await i.update({
            embeds: [
              Embed.setDescription(
                text
                  .replace("{self}", `${member}`)
                  .replace("{member}", `${target}`)
              ).setImage(arrayRand(images)),
            ],
            components: [],
          });
        } else {
          await i.update({
            embeds: [
              Embed.setDescription(
                `${target} отвечает отказом пользователю ${member}`
              ).setImage(""),
            ],
            components: [],
          });
        }
        answered = true;
        collector.stop();
      });
      collector.on("end", async () => {
        if (!answered)
          await interaction.editReply({
            embeds: [
              Embed.setDescription(
                `${target} проигнорировал(-а) или не заметил(-а) и время для ответа на команду-реакцию вышло.`
              ).setImage(""),
            ],
            components: [],
          });
      });
    },
};

// --------------------------------------- //
// -------------- Functions -------------- //
// --------------------------------------- //

/**
 * @param {Array} arr
 * @returns {any}
 */
function arrayRand(arr) {
  var rand = Math.floor(Math.random() * arr.length);
  return arr[rand];
}

/**
 * @param {CommandInteraction} interaction
 * @param {MessageEmbed} embed
 * @param {MessageActionRow[]} rows
 * @param {Number} time
 */
async function deletePing(interaction, embed, rows, time) {
  setTimeout(
    async () =>
      await interaction.editReply({
        content: null,
        embeds: [embed],
        components: rows,
      }),
    time
  );
}
