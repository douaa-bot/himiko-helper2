const { EmbedBuilder, AuditLogEvent } = require('discord.js');
const cooldowns = new Map();
const COOLDOWN_TIME = 5000;

module.exports = {
  name: "antiwebhook",
  aliases: ["antiwebhooks", "webhookblock"],
  description: "Enable/disable anti-webhook protection and manage whitelisted roles.",

  async execute(message, args, client) {
    const devs = ["1366203418653229247"];

    if (cooldowns.has(message.author.id)) return message.react('⏳');
    cooldowns.set(message.author.id, Date.now() + COOLDOWN_TIME);
    setTimeout(() => cooldowns.delete(message.author.id), COOLDOWN_TIME);

    if (!devs.includes(message.author.id) && message.author.id !== message.guild.ownerId) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
            .setDescription("Sorry, <:yes:1402096123434500096> You don't have permission to use this command.")
            .setColor("#a18cd1")
        ]
      });
    }

    const option = args[0]?.toLowerCase();
    if (!["on", "off", "whitelist", "unwhitelist", "status"].includes(option)) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("#a18cd1")
            .setAuthor({ name: 'Command : AntiWebhook', iconURL: message.author.displayAvatarURL({ dynamic: true }) })
            .addFields(
              { name: "__Usage__:", value: "- &antiwebhook `on` `off` `whitelist` `unwhitelist` `status`", inline: false },
              { name: "__Examples__:", value: "- &antiwebhook `on`\n- &antiwebhook `off`\n- &antiwebhook `whitelist @role`\n- &antiwebhook `unwhitelist @role`\n- &antiwebhook `status`", inline: false }
            )
            .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
        ]
      });
    }

    const settings = await client.getSettings(message.guild.id);
    const whitelistedRoles = settings.webhookWhitelist || [];

    if (option === "status") {
      const statusEmbed = new EmbedBuilder()
        .setColor("#a18cd1")
        .setAuthor({ name: 'Anti Webhook : Status', iconURL: message.author.displayAvatarURL({ dynamic: true }) })
        .addFields(
          { name: "__Anti Webhook Status__:", value: settings.antiWebhook === 1 ? "Enabled <:On:1349698525360947241>" : "Disabled <:Off:1349698291259932735>" },
          { name: "__Whitelisted Roles__:", value: whitelistedRoles.length > 0 ? whitelistedRoles.map(r => `<@&${r}>`).join("\n") : "`None`" }
        )
        .setThumbnail(message.author.displayAvatarURL({ dynamic: true }));
      return message.reply({ embeds: [statusEmbed] });
    }

    if (option === "on" || option === "off") {
      const toggle = option === "on" ? 1 : 0;
      await client.saveSettings(message.guild.id, "antiWebhook", toggle);
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("#a18cd1")
            .setDescription(`${toggle ? "<:On:1349698525360947241> Anti Webhook is now **Enabled**." : "<:Off:1349698291259932735> Anti Webhook is now **Disabled**."}`)
        ]
      });
    }

    if (["whitelist", "unwhitelist"].includes(option)) {
      const role = message.mentions.roles.first();
      if (!role) {
        return message.reply({
          embeds: [
            new EmbedBuilder()
              .setColor("#a18cd1")
              .setDescription("<:yes:1402096123434500096> Please mention a role to whitelist or unwhitelist.")
          ]
        });
      }

      if (option === "whitelist") {
        if (whitelistedRoles.includes(role.id)) {
          return message.reply({
            embeds: [new EmbedBuilder().setColor("#a18cd1").setDescription(`<:yes:1402096123434500096> Role ${role} is already whitelisted.`)]
          });
        }
        whitelistedRoles.push(role.id);
        await client.saveSettings(message.guild.id, "webhookWhitelist", whitelistedRoles);
        return message.reply({
          embeds: [new EmbedBuilder().setColor("#a18cd1").setDescription(`<:yes:1402096123434500096> Role ${role} has been whitelisted.`)]
        });
      }

      if (option === "unwhitelist") {
        if (!whitelistedRoles.includes(role.id)) {
          return message.reply({
            embeds: [new EmbedBuilder().setColor("#a18cd1").setDescription(`<:yes:1402096123434500096> Role ${role} is not on the whitelist.`)]
          });
        }
        const index = whitelistedRoles.indexOf(role.id);
        whitelistedRoles.splice(index, 1);
        await client.saveSettings(message.guild.id, "webhookWhitelist", whitelistedRoles);
        return message.reply({
          embeds: [new EmbedBuilder().setColor("#a18cd1").setDescription(`<:yes:1402096123434500096> Role ${role} has been removed from the whitelist.`)]
        });
      }
    }
  },

  async onWebhookUpdate(guild, client) {
    const settings = await client.getSettings(guild.id);
    if (!settings || settings.antiWebhook !== 1) return;

    const whitelistedRoles = settings.webhookWhitelist || [];

    try {
      const fetchedLogs = await guild.fetchAuditLogs({ limit: 1, type: AuditLogEvent.WebhookCreate });
      const webhookLog = fetchedLogs.entries.first();
      if (!webhookLog) return;

      const { executor } = webhookLog;
      if (!executor || executor.bot) return;

      const member = await guild.members.fetch(executor.id).catch(() => null);
      if (!member) return;

      const hasWhitelist = member.roles.cache.some(role => whitelistedRoles.includes(role.id));
      if (hasWhitelist) return;

      const webhooks = await guild.fetchWebhooks();
      const targetWebhook = webhooks.find(w => w.owner?.id === executor.id);
      if (targetWebhook) {
        await targetWebhook.delete("AntiWebhook Protection");
        console.log(`Deleted webhook by ${executor.tag}`);
      }

    } catch (error) {
      console.error("Error in AntiWebhook:", error);
    }
  }
};
