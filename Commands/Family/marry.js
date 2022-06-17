const {
  Client,
  MessageEmbed,
  MessageActionRow,
  MessageButton,
  CommandInteraction,
} = require("discord.js");
const usersDB = require("../../Schemas/usersDB");
const { COLOR } = require("../../config.json");

module.exports = {
  name: "marry",
  description: "Создать семейный союз с пользователем.",
  options: [
    {
      name: "target",
      description: "Пользователь, с которым Вы хотите создать семейный союз.",
      type: "USER",
      required: true,
    },
  ],

  /**
   *
   * @param {CommandInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    const target = interaction.options.getMember("target");
    const Embed = new MessageEmbed()
      .setTimestamp()
      .setFooter({
        text: interaction.member.displayName,
        iconURL: interaction.member.displayAvatarURL({ dynamic: true }),
      })
      .setAuthor({ name: `Реакция: брак` })
      .setColor(COLOR);

    if (interaction.member.id === target.id)
      return interaction.reply({
        embeds: [Embed.setDescription("Может попробуете указать не себя?..")],
        ephemeral: true,
      });
    if (target.user.bot)
      return interaction.reply({
        embeds: [Embed.setDescription("Не трогайте ботов, прошу!")],
        ephemeral: true,
      });

    await interaction.deferReply();
    let docMember = await usersDB.findOne({ userID: interaction.member.id });
    let docTarget = await usersDB.findOne({ userID: target.id });

    if (docMember.family.partner != "")
      return interaction.editReply({
        embeds: [
          Embed.setDescription(
            `У тебя уже есть брачный союз с <@!${docMember.family.partner}>`
          ),
        ],
      });
    if (docTarget.family.partner != "")
      return interaction.editReply({
        embeds: [
          Embed.setDescription(
            `У ${target} уже есть брачный союз с <@!${docTarget.family.partner}>`
          ),
        ],
      });

    if (docMember.currency.common < 70)
      return interaction.editReply({
        embeds: [
          Embed.setDescription(
            `Недостаточно йен на балансе.\n\nСтоимость брачного союза: 70.00 <:xi_yen:976539761747566653>.\nНа вашем счету сейчас: ${docMember.currency.common} <:xi_yen:976539761747566653>`
          ),
        ],
      });

    const Row = new MessageActionRow().addComponents(
      new MessageButton()
        .setCustomId("marry-yes")
        .setEmoji("<:yes:879083428836933712>")
        .setStyle("SECONDARY"),
      new MessageButton()
        .setCustomId("marry-no")
        .setEmoji("<:no:879083439742152744>")
        .setStyle("SECONDARY")
    );

    await interaction.editReply({
      content: `${target}`,
      embeds: [
        Embed.setDescription(
          `${target}, тебе предлагает создать брачный союз ${interaction.member}. Ожидаем твой ответ...`
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
        i.customId.startsWith("marry"),
      time: 120000,
    });
    let answered = false;
    collector.on("collect", async (i) => {
      if (i.customId.endsWith("yes")) {
        await i.update({
          embeds: [
            Embed.setDescription(
              `${interaction.member} и ${target} создали брачный союз.\nПоздравляем!`
            ),
          ],
          components: [],
        });
        let timeDate = parseInt(new Date().getTime() / 1000);
        let docMemberNew = await usersDB.findOne({
          userID: interaction.member.id,
        });
        let bal = parseFloat((docMemberNew.currency.common - 70).toFixed(2));
        await usersDB.updateOne(
          { userID: interaction.member.id },
          {
            $set: {
              "family.partner": target.id,
              "family.marryTime": timeDate,
              "currency.common": bal,
            },
          }
        );
        await usersDB.updateOne(
          { userID: target.id },
          {
            $set: {
              "family.partner": interaction.member.id,
              "family.marryTime": timeDate,
            },
          }
        );
        interaction.member.roles.add("977703472533209108");
        target.roles.add("977703472533209108");
      } else {
        await i.update({
          embeds: [
            Embed.setDescription(
              `${target} отвечает отказом пользователю ${interaction.member}`
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

function declension(forms, val) {
  const cases = [2, 0, 1, 1, 1, 2];
  if (val % 100 > 4 && val % 100 < 20) return forms[2];
  else {
    if (val % 10 < 5) return forms[cases[val % 10]];
    else return forms[cases[5]];
  }
}
