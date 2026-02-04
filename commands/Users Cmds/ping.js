const { EmbedBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  name: 'ping',
  description: 'Display the bot\'s ping and uptime',
  category: "user",
  cooldown: 8,
  async execute(message, args) {
    const ping = Date.now() - message.createdTimestamp;
    const uptime = process.uptime();
    const days = Math.floor(uptime / 86400);
    const hours = Math.floor(uptime / 3600) % 24;
    const minutes = Math.floor(uptime / 60) % 60;
    const seconds = Math.floor(uptime % 60);
    const uptimeString = `${days}d ${hours}h ${minutes}m ${seconds}s`;

    const embed = new EmbedBuilder()
      .setColor('#a18cd1') 
      .setDescription(
        `- ***__Bot Latency:__*** \`${ping}\`\n` +
        `- ***__Uptime:__*** \`${uptimeString}\`\n` +
        `- ***__Developer:__*** \`allggoo\` `
      )
      .setThumbnail(message.client.user.displayAvatarURL({ dynamic: true }));

    const button = new ButtonBuilder()
      .setLabel('Support')
      .setURL('https://discord.gg/MfsrDGc8py')
      .setStyle(ButtonStyle.Link);

    await message.reply({ embeds: [embed], components: [{ type: 1, components: [button] }] });
  },
};
