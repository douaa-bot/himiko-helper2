const { EmbedBuilder } = require('discord.js');
const GuildConfig = require('../../models/schemas');

const cooldowns = new Map();
const COOLDOWN_TIME = 5000;

module.exports = {
  name: "antilink",
  aliases: ["antilinks", "antilink"],
  description: "Enable or disable the AntiLink feature, and manage the whitelist.",

  async execute(message, args, client) {
    const devs = ["1366203418653229247"];

    if (cooldowns.has(message.author.id)) {
      return message.react('⏳');
    }
    cooldowns.set(message.author.id, Date.now() + COOLDOWN_TIME);
    setTimeout(() => cooldowns.delete(message.author.id), COOLDOWN_TIME);

    if (!devs.includes(message.author.id) && message.author.id !== message.guild.ownerId) {
      return message.reply({
        embeds: [new EmbedBuilder()
          .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
          .setDescription("<:yes:1402096123434500096> You don't have permission to use this command.")
          .setColor("#a18cd1")]
      });
    }

    const option = args[0]?.toLowerCase();
    if (!["on", "off", "whitelist", "unwhitelist", "status"].includes(option)) {
      return message.reply({
        embeds: [new EmbedBuilder()
          .setColor("#a18cd1")
          .setAuthor({ name: 'Command : AntiLink', iconURL: message.author.displayAvatarURL({ dynamic: true }) })
          .addFields(
            { name: "__Usage__ :", value: "- &antilink `on` `off` `whitelist` `unwhitelist` `status`", inline: false },
            { name: "__Examples__ :", value: "- &antilink `on`\n- &antilink `off`\n- &antilink `whitelist @role`\n- &antilink `unwhitelist @role`\n- &antilink `status`", inline: false }
          )
          .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
        ]
      });
    }

    const settings = await client.getSettings(message.guild.id);
    const whitelistedRoles = settings.whitelistedRoles || [];

    if (option === "status") {
      const isAntiLinkEnabled = settings.antiLink === 1;
      const statusEmbed = new EmbedBuilder()
        .setColor("#a18cd1")
        .setAuthor({ name: 'Anti Link : Status', iconURL: message.author.displayAvatarURL({ dynamic: true }) })
        .addFields(
          { 
            name: "__Anti Link Status__ :", 
            value: isAntiLinkEnabled ? "Enabled <:On:1349698525360947241>" : "Disabled <:Off:1349698291259932735>", 
            inline: false 
          },
          { 
            name: "__Whitelisted Roles__ :", 
            value: whitelistedRoles.length > 0 ? whitelistedRoles.map(roleId => `<@&${roleId}>`).join("\n") : "`None`", 
            inline: false 
          }
        )
        .setThumbnail(message.author.displayAvatarURL({ dynamic: true }));
      return message.reply({ embeds: [statusEmbed] });
    }

    if (option === "on" || option === "off") {
      const isEnabled = option === "on" ? 1 : 0;
      await client.saveSettings(message.guild.id, "antiLink", isEnabled);

      const embed = new EmbedBuilder()
        .setDescription(`${isEnabled ? "<:On:1349698525360947241> Anti Link is now **Enabled**." : "<:Off:1349698291259932735> Anti Link is now **Disabled**."}`)
        .setColor("#a18cd1");

      return message.reply({ embeds: [embed] });
    }

    if (option === "whitelist" || option === "unwhitelist") {
      const role = message.mentions.roles.first();
      if (!role) {
        return message.reply({
          embeds: [new EmbedBuilder()
            .setColor("#a18cd1")
            .setDescription("<:yes:1402096123434500096> Please mention a role to whitelist or unwhitelist.")]
        });
      }

      if (option === "whitelist") {
        if (whitelistedRoles.includes(role.id)) {
          return message.reply({
            embeds: [new EmbedBuilder()
              .setColor("#a18cd1")
              .setDescription(`<:yes:1402096123434500096> The role ${role} is already whitelisted.`)]
          });
        }

        whitelistedRoles.push(role.id);
        await client.saveSettings(message.guild.id, "whitelistedRoles", whitelistedRoles);

        const confirmEmbed = new EmbedBuilder()
          .setDescription(`<:yes:1402096123434500096> The role ${role} has been added to the whitelist.`)
          .setColor("#a18cd1");

        return message.reply({ embeds: [confirmEmbed] });
      }

      if (option === "unwhitelist") {
        const roleIndex = whitelistedRoles.indexOf(role.id);
        if (roleIndex === -1) {
          return message.reply({
            embeds: [new EmbedBuilder()
              .setColor("#a18cd1")
              .setDescription(`<:yes:1402096123434500096> The role ${role} is not whitelisted.`)]
          });
        }

        whitelistedRoles.splice(roleIndex, 1);
        await client.saveSettings(message.guild.id, "whitelistedRoles", whitelistedRoles);

        const confirmEmbed = new EmbedBuilder()
          .setDescription(`<:yes:1402096123434500096> The role ${role} has been removed from the whitelist.`)
          .setColor("#a18cd1");

        return message.reply({ embeds: [confirmEmbed] });
      }
    }
  },

  async onMessage(message, client) {
    if (message.author.bot || !message.guild) return;

    const settings = await client.getSettings(message.guild.id);
    if (!settings || settings.antiLink === 0) return;

    const whitelistedRoles = settings.whitelistedRoles || [];
    const userRoles = message.member.roles.cache.map(role => role.id);
    const isWhitelisted = userRoles.some(roleId => whitelistedRoles.includes(roleId));

    if (isWhitelisted) return;

    const linkRegex = /(https?:\/\/[^\s]+)/gi;
    if (linkRegex.test(message.content)) {
      try {
        console.log(`Link detected in message: ${message.content}`);
        await message.delete();
        console.log('Message with link deleted.');
      } catch (error) {
        console.error('Error deleting message:', error);
      }
    }
  }
};
