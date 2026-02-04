module.exports = {
  name: 'guildMemberAdd',
  async execute(member) {
    const settings = await member.client.getSettings(member.guild.id);
    if (!settings) return;

    if (settings.removedRole) {
      try {
        await member.roles.add(settings.removedRole);
      } catch (err) {
        console.error(`Failed to add unverified role to ${member.user.tag}:`, err);
      }
    }

    if (settings.antiBot === 1 && member.user.bot) {
      try {
        await member.kick("AntiBot system: kicking new bot.");
        console.log(`Kicked a bot: ${member.user.tag}`);
      } catch (err) {
        console.error(`Failed to kick bot:`, err);
      }
    }
  }
};
