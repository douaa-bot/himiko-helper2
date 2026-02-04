const { ActivityType } = require('discord.js');

module.exports = {
  name: 'ready',
  once: true,
  async execute(client) {
    client.user.setStatus('idle'); 
    client.user.setActivity('hi bb', { type: 4 }); 
  },
};
