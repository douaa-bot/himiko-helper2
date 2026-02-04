const { EmbedBuilder, PermissionsBitField } = require('discord.js');

const COOLDOWN_TIME = 5000;
const cooldowns = new Map();

module.exports = {
  name: 'roleinfo',
  aliases: ['rinfo', 'role-info'],
  description: 'Get detailed information about a specific role in the server',
  async execute(message, args) {
    if (cooldowns.has(message.author.id)) {
      return message.react('⏳');
    }
    cooldowns.set(message.author.id, Date.now() + COOLDOWN_TIME);
    setTimeout(() => cooldowns.delete(message.author.id), COOLDOWN_TIME);

    if (args.length < 1) {
      const guideEmbed = new EmbedBuilder()
        .setColor('#a18cd1')
        .setAuthor({ name: 'Command: RoleInfo', iconURL: message.author.displayAvatarURL({ dynamic: true }) })
        .addFields(
          { name: "Usage:", value: "- `&roleinfo `roleid` ", inline: false },
        )
        .setThumbnail(message.author.displayAvatarURL({ dynamic: true }));

      return message.reply({ embeds: [guideEmbed] });
    }

    const roleInput = args[0];
    let role;

    if (/^\d+$/.test(roleInput)) {
      role = message.guild.roles.cache.get(roleInput);
    } else if (message.mentions.roles.size > 0) {
      role = message.mentions.roles.first();
    } else {
      role = message.guild.roles.cache.find(r => r.name.toLowerCase() === roleInput.toLowerCase());
    }

    if (!role) {
      const errorEmbed = new EmbedBuilder()
        .setColor('#a18cd1')
        .setDescription('Role not found. Please check your input.');
      return message.reply({ embeds: [errorEmbed] });
    }

    const rolePermissions = role.permissions.toArray();
    const importantPermissions = [
      'Administrator', 'ManageChannels', 'ManageGuild', 'ManageRoles', 'ManageMessages',
      'KickMembers', 'BanMembers', 'ViewAuditLog', 'MentionEveryone',
      'ManageNicknames', 'ManageWebhooks', 'ManageEmojisAndStickers'
    ];

    const filteredPermissions = importantPermissions
      .map(perm => {
        return rolePermissions.includes(perm) ? perm.replace(/([A-Z])/g, ' $1').trim() : null;
      })
      .filter(Boolean);

    const permissionsText = filteredPermissions.length > 0
      ? filteredPermissions.join('\n')
      : 'No important permissions';

    const membersWithRole = role.members.size;

    const roleEmbed = new EmbedBuilder()
      .setColor('#a18cd1')
      .setAuthor({ name: 'Role Information', iconURL: message.author.displayAvatarURL({ dynamic: true }) })
      .setTitle(role.name)
      .addFields(
        { name: '***Role ID***', value: `\`${role.id}\``, inline: true },
        { name: '***Color***', value: `\`${role.hexColor.toUpperCase()}\``, inline: true },
        { name: '***Position***', value: `\`${role.position}\``, inline: true },
        { name: '***Members with Role***', value: `\`${membersWithRole}\``, inline: true },
        { name: '***Mentionable***', value: role.mentionable ? '`Yes`' : '`No`', inline: true },
        { name: '***Managed***', value: role.managed ? '`Yes`' : '`No`', inline: true },
        { name: '***Created On***', value: `<t:${Math.floor(role.createdTimestamp / 1000)}:F>`, inline: false },
        { name: '***Important Permissions***', value: `\`\`\`\n${permissionsText}\n\`\`\``, inline: false }
      )


    return message.reply({ embeds: [roleEmbed] });
  },
};
