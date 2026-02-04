module.exports = {
  name: "webhookUpdate",
  async execute(channel, client) {
    if (!channel.guild) return;
    const guild = channel.guild;

    try {
      if (!client.prefixCommands) return; 

      const command = client.prefixCommands.get("antiwebhook");
      if (command && typeof command.onWebhookUpdate === 'function') {
        await command.onWebhookUpdate(guild, client);
      }
    } catch (error) {
      console.error('Error in webhookUpdate event:', error);
    }
  }
};
