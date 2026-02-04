const { PermissionsBitField } = require('discord.js');

module.exports = {
  name: 'webhookCreate',
  async execute(webhook, client) {
    const settings = await client.getSettings(webhook.guild.id);
    if (
      settings?.antiWebhook === 1 &&
      webhook.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageWebhooks)
    ) {
      try {
        await webhook.delete('Anti-Webhook system enabled.');
      } catch (error) {
        console.error('Failed to delete webhook:', error);
      }
    }
  }
};
