const { NeedHelpVoice } = require('../models/schemas');

module.exports = {
  name: 'voiceStateUpdate',
  async execute(oldState, newState) {
    if (!newState.guild) return;

    const data = await NeedHelpVoice.findOne({ guildId: newState.guild.id });
    if (!data) return;

    const guild = newState.guild;

    if (newState.channelId === data.templateChannelId) {
      const member = newState.member;

      try {
        let helperRole = null;
        if (data.helperRoleId) {
          helperRole = guild.roles.cache.get(data.helperRoleId);
          if (!helperRole) {
            console.warn(`Helper role ID ${data.helperRoleId} not found in guild ${guild.id}`);
          }
        }

        const permissionOverwrites = [
          {
            id: guild.roles.everyone.id,
            deny: ['ViewChannel', 'Connect', 'Speak'],
          },
          {
            id: member.id,
            allow: ['ViewChannel', 'Connect', 'Speak', 'MuteMembers', 'DeafenMembers', 'MoveMembers'],
          },
        ];

        if (helperRole) {
          permissionOverwrites.push({
            id: helperRole.id,
            allow: ['ViewChannel', 'Connect', 'Speak', 'Stream', 'UseVAD'],
          });
        }
        const newChannel = await guild.channels.create({
          name: `⏳・${member.user.username}'s help`,
          type: 2, 
          parent: newState.channel.parentId || null,
          permissionOverwrites,
          reason: 'Need Help voice channel created for user',
        });

        await member.voice.setChannel(newChannel);
      } catch (err) {
        console.error('Failed to create Need Help voice channel:', err);
      }
    }

    if (oldState.channelId && !newState.channelId) {
      const oldChannel = guild.channels.cache.get(oldState.channelId);
      if (!oldChannel) return;

      if (oldChannel.type === 2 && oldChannel.members.size === 0 && oldChannel.name.startsWith('⏳・')) {
        try {
          await oldChannel.delete();
          console.log(`Deleted empty Need Help voice channel: ${oldChannel.name}`);
        } catch (err) {
          console.error('Failed to delete empty Need Help voice channel:', err);
        }
      }
    }

    if (oldState.channelId && newState.channelId && oldState.channelId !== newState.channelId) {
      if (oldState.channelId !== data.templateChannelId) {
        const oldChannel = guild.channels.cache.get(oldState.channelId);
        if (!oldChannel) return;

        if (oldChannel.type === 2 && oldChannel.members.size === 0 && oldChannel.name.startsWith('⏳・')) {
          try {
            await oldChannel.delete();
            console.log(`Deleted empty Need Help voice channel: ${oldChannel.name}`);
          } catch (err) {
            console.error('Failed to delete empty Need Help voice channel:', err);
          }
        }
      }
    }
  }
};
