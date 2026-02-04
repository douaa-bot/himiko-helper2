const { EmbedBuilder } = require('discord.js');

const cooldowns = new Map();
const COOLDOWN_TIME = 5000;

const devs = ["1366203418653229247"];

module.exports = {
  name: "autorole",
  aliases: ["setautorole", "set-autorole", "set-auto-role", "setupautorole", "setup-auto-role"],
  description: "Setup auto role system.",

  async execute(message, args, client) {
    if (cooldowns.has(message.author.id)) return message.react('⏳');
    cooldowns.set(message.author.id, Date.now() + COOLDOWN_TIME);
    setTimeout(() => cooldowns.delete(message.author.id), COOLDOWN_TIME);

    const isOwner = message.author.id === message.guild.ownerId;
    const isAdmin = message.member.permissions.has("Administrator");
    const isDev = devs.includes(message.author.id);

    if (!(isOwner || isAdmin || isDev)) {
      return message.reply({
        embeds: [new EmbedBuilder()
          .setDescription("<:info:1402098933261533285> You don't have permission to use this command.")
          .setColor("#a18cd1")]
      });
    }

    const subcommand = args[0]?.toLowerCase();
    const settings = await client.getSettings(message.guild.id);

    if (subcommand === "status") {
      const roleId = settings?.autoRole;
      const role = roleId ? message.guild.roles.cache.get(roleId) : null;
      const isEnabled = !!role;

      const statusEmbed = new EmbedBuilder()
        .setColor("#a18cd1")
        .setAuthor({ name: 'Auto Role : Status', iconURL: message.author.displayAvatarURL({ dynamic: true }) })
        .addFields(
          {
            name: "__Auto Role Status__ :",
            value: isEnabled ? "Enabled <:On:1349698525360947241>" : "Disabled <:Off:1349698291259932735>",
            inline: false
          },
          {
            name: "__Assigned Role__ :",
            value: isEnabled ? `<@&${role.id}>` : "`None`",
            inline: false
          }
        )
        .setThumbnail(message.author.displayAvatarURL({ dynamic: true }));

      return message.reply({ embeds: [statusEmbed] });
    }

    if (subcommand === "remove") {
      const roleId = settings?.autoRole;
      const role = roleId ? message.guild.roles.cache.get(roleId) : null;

      if (!role) {
        return message.reply({
          embeds: [new EmbedBuilder()
            .setDescription("<:info:1402098933261533285> No auto role has been set.")
            .setColor("#a18cd1")]
        });
      }

      await client.saveSettings(message.guild.id, "autoRole", null);

      const embed = new EmbedBuilder()
        .setDescription(`<:yes:1402096123434500096> Auto Role has been removed <@&${role.id}>`)
        .setColor("#a18cd1");

      const memberWithRole = message.guild.members.cache.filter(member => member.roles.cache.has(role.id));
      if (memberWithRole.size > 0) {
        embed.addFields(
          {
            name: "Note:",
            value: `The role <@&${role.id}> has been removed from the auto role system. It might still be assigned to some members.`,
            inline: false
          }
        );
      }

      return message.reply({ embeds: [embed] });
    }

    const role = message.mentions.roles.first()
      || message.guild.roles.cache.find(r => r.name.toLowerCase() === args.join(" ").toLowerCase())
      || message.guild.roles.cache.get(args[0]);

    if (!role) {
      const helpEmbed = new EmbedBuilder()
        .setColor("#a18cd1")
        .setAuthor({ name: 'Command : AutoRole', iconURL: message.author.displayAvatarURL({ dynamic: true }) })
        .addFields(
          { name: "__Usage__ :", value: `- &autorole \`roleId\`\n- &autorole \`remove\`\n- &autorole \`status\``, inline: false },
          { name: "__Example__ :", value: `- &autorole \`@Unverified\``, inline: false }
        )
        .setThumbnail(message.author.displayAvatarURL({ dynamic: true }));

      return message.reply({ embeds: [helpEmbed] });
    }

    await client.saveSettings(message.guild.id, "autoRole", role.id);

    const embed = new EmbedBuilder()
      .setDescription(`<:yes:1402096123434500096> Auto Role has been set to <@&${role.id}>`)
      .setColor("#a18cd1");

    return message.reply({ embeds: [embed] });
  }
};
