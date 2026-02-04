const { EmbedBuilder, PermissionsBitField } = require('discord.js');

const COOLDOWN_TIME = 5000; // 5 seconds cooldown
const cooldowns = new Map();

module.exports = {
  name: 'channelinfo',
  aliases: ['cinfo', 'channel-info'],
  description: 'Get information about a specific channel, including its settings and permissions',
  async execute(message, args) {
    if (cooldowns.has(message.author.id)) {
      return message.react('⏳');
    }
    cooldowns.set(message.author.id, Date.now() + COOLDOWN_TIME);
    setTimeout(() => cooldowns.delete(message.author.id), COOLDOWN_TIME);

    if (args.length < 1) {
      const guideEmbed = new EmbedBuilder()
        .setColor('#a18cd1')
        .setAuthor({ name: 'Command : ChannelInfo', iconURL: message.author.displayAvatarURL({ dynamic: true }) })
        .addFields(
          { name: "Usage:", value: "- &channelinfo \`#channelid\`", inline: false },
          { name: "Examples:", value: `- &channelinfo \`#general\`\n- &channelinfo \`1295076771905142811\``, inline: false }
        )
        .setThumbnail(message.author.displayAvatarURL({ dynamic: true }));
      return message.reply({ embeds: [guideEmbed] });
    }

    const channelInput = args[0];
    let channel;

    if (/^\d+$/.test(channelInput)) {
      channel = message.guild.channels.cache.get(channelInput);
    } else if (message.mentions.channels.size > 0) {
      channel = message.mentions.channels.first();
    } else {
      channel = message.guild.channels.cache.find(c => c.name.toLowerCase() === channelInput.toLowerCase());
    }

    if (!channel) {
      const errorEmbed = new EmbedBuilder()
        .setColor('#a18cd1')
        .setDescription('<:info:1402098933261533285> Channel not found.');
      return message.reply({ embeds: [errorEmbed] });
    }
    const channelTypes = {
      0: 'Text Channel',
      2: 'Voice Channel',
      4: 'Category',
      5: 'Announcement Channel',
      13: 'Stage Channel',
      15: 'Forum Channel'
    };

    const channelType = channelTypes[channel.type] || 'Unknown';
    const permissions = channel.permissionsFor(message.guild.roles.everyone).toArray();
    const importantPermissions = [
      'ViewChannel', 'SendMessages', 'ManageChannels', 'ManageMessages',
      'Connect', 'Speak', 'MuteMembers', 'DeafenMembers', 'MoveMembers'
    ];

    const filteredPermissions = permissions
      .filter(perm => importantPermissions.includes(perm))
      .map(perm => ` ${perm.replace(/([A-Z])/g, ' $1').trim()}`)
      .join('\n') || ' No important permissions';

    const channelEmbed = new EmbedBuilder()
      .setColor('#a18cd1')
      .setAuthor({ name: 'Command : Channel Info', iconURL: message.author.displayAvatarURL({ dynamic: true }) })
      .setDescription(`***Channel Information:*** ***__<#${channel.id}>__***\n` +`***Category:*** ${channel.parent ? `<#${channel.parent.id}>` : "None"}`)
      .addFields(
        { name: " ***__Channel ID__***", value: `\`${channel.id}\``, inline: false },
        { name: " ***__Type__***", value: `\`${channelType}\``, inline: false },
        { name: " ***__Created At__***", value: `<t:${Math.floor(channel.createdTimestamp / 1000)}:F>`, inline: false },
        { name: " ***__NSFW__***", value: channel.nsfw ? ' `Yes`' : ' `No`', inline: false },
        { name: " ***__Channel Permissions__***", value: `\`\`\`\n${filteredPermissions}\n\`\`\``, inline: false }
      );


    return message.reply({ embeds: [channelEmbed] });
  },
};
