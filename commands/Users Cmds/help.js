const {
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
} = require("discord.js");
const config = require("../../utils/config");

module.exports = {
  name: "help",
  aliases: ["h"],
  description: "Shows all available commands.",
  cooldown: 5,
  async execute(message, args) {
    const botIcon = message.client.user.displayAvatarURL({ dynamic: true });
    const commandCategories = {
      admin: [
        `\`${config.prefix}\`**addrole** **-** \`Add a role to a user.\``,
        `\`${config.prefix}\`**addemoji** **-** \`Add an emoji to the server.\``,
        `\`${config.prefix}\`**ban** **-** \`Ban a user.\``,
        `\`${config.prefix}\`**boosters** **-** \`Show server boosters.\``,
        `\`${config.prefix}\`**clear** **-** \`Clear messages.\``,
        `\`${config.prefix}\`**crole** **-** \`Create a role.\``,
        `\`${config.prefix}\`**embed** **-** \`Create an embed message.\``,
        `\`${config.prefix}\`**hide** **-** \`Hide a channel.\``,
        `\`${config.prefix}\`**jail** **-** \`Jail a user.\``,
        `\`${config.prefix}\`**kick** **-** \`Kick a user.\``,
        `\`${config.prefix}\`**lock** **-** \`Lock a channel.\``,
        `\`${config.prefix}\`**membercount** **-** \`Show member count.\``,
        `\`${config.prefix}\`**move** **-** \`Move a user to another voice channel.\``,
        `\`${config.prefix}\`**nick** **-** \`Change a user's nickname.\``,
        `\`${config.prefix}\`**remove-role** **-** \`Remove a role from a user.\``,
        `\`${config.prefix}\`**roleinfo** **-** \`Show role information.\``,
        `\`${config.prefix}\`**channelinfo** **-** \`Show channel information.\``,
        `\`${config.prefix}\`**tax** **-** \`Calculate Discord tax.\``,
        `\`${config.prefix}\`**temprole** **-** \`Temporarily assign a role.\``,
        `\`${config.prefix}\`**timeout** **-** \`Timeout a user.\``,
        `\`${config.prefix}\`**unban** **-** \`Unban a user.\``,
        `\`${config.prefix}\`**unhide** **-** \`Unhide a channel.\``,
        `\`${config.prefix}\`**unjail** **-** \`Unjail a user.\``,
        `\`${config.prefix}\`**unlock** **-** \`Unlock a channel.\``,
        `\`${config.prefix}\`**untimeout** **-** \`Remove timeout from a user.\``
      ],
      fun: [
        `\`${config.prefix}\`**cringe** **-** \`Display a cringe message.\``,
        `\`${config.prefix}\`**kill** **-** \`Display a kill message..\``,
        `\`${config.prefix}\`**missyou** **-** \`Display a missyou message..\``,
        `\`${config.prefix}\`**gay** **-** \`Calculate your gay rate!\``,
        `\`${config.prefix}\`**happy** **-** \`Send a happy GIF!.\``,
        `\`${config.prefix}\`**love** **-** \`Calculate love percentage.\``,
        `\`${config.prefix}\`**happy** **-** \`Send a dance GIF!\``,
        `\`${config.prefix}\`**cat** **-** \`Send a cute cat GIF!\``,
        `\`${config.prefix}\`**hug** **-** \`Display a hug message.\``,
        `\`${config.prefix}\`**slape** **-** \`Slap a user.\``,
        `\`${config.prefix}\`**smile** **-** \`Smile at someone.\``,
      ],
      info: [
        `\`${config.prefix}\`**avatar** **-** \`Show user's avatar.\``,
        `\`${config.prefix}\`**banner** **-** \`Show user's banner.\``,
        `\`${config.prefix}\`**channelinfo** **-** \`Show channel info.\``,
        `\`${config.prefix}\`**invite** **-** \`Get bot invite.\``,
        `\`${config.prefix}\`**info channel** **-** \`Show channel information.\``,
        `\`${config.prefix}\`**ping** **-** \`Show bot latency.\``,
        `\`${config.prefix}\`**serverinfo** **-** \`Show server info.\``,
        `\`${config.prefix}\`**user** **-** \`Show user info.\``,
      ],
      games: [
        `\`${config.prefix}\`**xo** **-** \`Play a game of XO\``,
      ],
      voice: [
        `\`${config.prefix}\`**vdeafen** **-** \`Deafen a member in voice.\``,
        `\`${config.prefix}\`**find** **-** \`Find a member in voice.\``,
        `\`${config.prefix}\`**vclist** **-** \`Show list of members in voice.\``,
        `\`${config.prefix}\`**vmute** **-** \`Mute a member in voice.\``,
        `\`${config.prefix}\`**vunmute** **-** \`Unmute a member in voice.\``,
      ],
      verification: [
        `\`${config.prefix}\`**vb** **-** \`Verify a member.\``,
        `\`${config.prefix}\`**vg** **-** \`Verify a female member.\`\n`,
        `</setup-verify:1399405588277891246> **-** \`Setup verification.\``,
      ],
      jail: [
        `\`${config.prefix}\`**jail** **-** \`Jail a user from server.\``,
        `\`${config.prefix}\`**unjail** **-** \`Unjail a user from server.\``,
        `</setup-jail:1402606005929639987> **-** \`Setup Jail System from server.\``,
      ],
      moderation: [
        `\`${config.prefix}\`**ban** **-** \`Ban a user (even if they are not in the server).\``,
        `\`${config.prefix}\`**kick** **-** \`Kick a user from the server.\``,
        `\`${config.prefix}\`**mute** **-** \`Mute a user in the server.\``,
        `\`${config.prefix}\`**nickname** **-** \`Change or reset a user's nickname.\``,
        `\`${config.prefix}\`**addrole** **-** \`Add or remove a role from a user.\``,
        `\`${config.prefix}\`**temprole** **-** \`Temporarily assign a role.\``,
        `\`${config.prefix}\`**timeout** **-** \`Timeout a user.\``,
        `\`${config.prefix}\`**unban** **-** \`Unban a user from the server.\``,
        `\`${config.prefix}\`**unmute** **-** \`Unmute a user in the server.\``,
        `\`${config.prefix}\`**untimeout** **-** \`Remove timeout from a user.\``,
      ],
      security: [
        `\`${config.prefix}\`**antibots** **-** \`Enable or disable Anti-Bot protection.\``,
        `\`${config.prefix}\`**antilink** **-** \`Enable or disable Anti-Link protection.\``,
        `\`${config.prefix}\`**antiwebhook** **-** \`Enable or disable Anti-Webhook protection.\``,
      ],
    };

    if (!args.length) {
      const helpEmbed = new EmbedBuilder()
        .setColor("#a18cd1")
        .setAuthor({ name: `${message.client.user.username} Commands`, iconURL: botIcon })
        .setThumbnail(botIcon)
        .setDescription(
          ` \`${config.prefix}help admin\` **-** Shows admin-related commands\n` +
          ` \`${config.prefix}help info\` **-** Shows informational commands\n` +
          ` \`${config.prefix}help fun\` **-** Lists fun commands\n` +
          ` \`${config.prefix}help marriag\` **-** Displays marriag commands\n` +
          ` \`${config.prefix}help voicemod\` **-** Provides voice modulation commands\n` +
          ` \`${config.prefix}help verification\` **-** Displays verification commands\n` +
          ` \`${config.prefix}help jail\` **-** Lists jail commands\n` +
          ` \`${config.prefix}help moderation\` **-** Shows moderation commands\n` +
          ` \`${config.prefix}help security\` **-** Shows security commands\n\n` +
          `> <:link:1402098763601805362> **Links :**\n` +
          `> <:Apeex:1335402242441875537>**[Support](https://discord.gg/5Vdzw3KA3w)** | **[Add Me](https://discord.com/oauth2/authorize?client_id=1399398715541688394&permissions=8&scope=bot)**`
        );

      const menu = new StringSelectMenuBuilder()
        .setCustomId("help-menu")
        .setPlaceholder("Select a category")
        .addOptions(Object.keys(commandCategories).map((cat) => ({
          label: cat.charAt(0).toUpperCase() + cat.slice(1),
          description: `View ${cat} commands`,
          value: cat,
          emoji: "<:server:1404270361557864608>",
        })));

      const row = new ActionRowBuilder().addComponents(menu);

      const replyMsg = await message.reply({ embeds: [helpEmbed], components: [row] });

      const collector = replyMsg.createMessageComponentCollector({
        filter: (i) => i.user.id === message.author.id,
        time: 60_000,
      });

      collector.on("collect", async (interaction) => {
        if (interaction.customId === "help-menu") {
          const selected = interaction.values[0];
          const categoryEmbed = new EmbedBuilder()
            .setColor("#a18cd1")
            .setAuthor({ name: `${selected.charAt(0).toUpperCase() + selected.slice(1)} Commands`, iconURL: botIcon })
            .setDescription(commandCategories[selected].join("\n"));
          await interaction.update({ embeds: [categoryEmbed], components: [row] });
        }
      });

      return;
    }

    const categoryName = args[0].toLowerCase();
    if (commandCategories[categoryName]) {
      const categoryEmbed = new EmbedBuilder()
        .setColor("#a18cd1")
        .setAuthor({ name: `${categoryName.charAt(0).toUpperCase() + categoryName.slice(1)} Commands`, iconURL: botIcon })
        .setDescription(commandCategories[categoryName].join("\n"));
      return message.reply({ embeds: [categoryEmbed] });
    }

    return message.reply({
      embeds: [
        new EmbedBuilder()
          .setColor("#a18cd1")
          .setDescription(`<:info:1402098933261533285> Invalid category Use \`${config.prefix}help\` **or** \`${config.prefix}help <category>\``)
      ]
    });
  },
};
