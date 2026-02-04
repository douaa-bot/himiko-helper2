const { EmbedBuilder } = require('discord.js');

const COOLDOWN_TIME = 5000;
const cooldowns = new Map();

module.exports = {
    name: 'addrole',
    aliases: ['add', 'roleadd'],
    description: 'Assign a role to a user',
    async execute(message, args) {
        if (cooldowns.has(message.author.id)) {
            return message.react('⏳'); 
        }
        cooldowns.set(message.author.id, Date.now() + COOLDOWN_TIME);
        setTimeout(() => cooldowns.delete(message.author.id), COOLDOWN_TIME);
        if (args.length < 2) {
            const guideEmbed = new EmbedBuilder()
                .setColor('#a18cd1')
                .setAuthor({ name: 'Command : AddRole', iconURL: message.author.displayAvatarURL({ dynamic: true }) })
                .addFields(
                    { name: "Usage:", value: "&addrole \`userid\` \`roleid\`", inline: false },
                )
                .setThumbnail(message.author.displayAvatarURL({ dynamic: true }));
            return message.reply({ embeds: [guideEmbed] });
        }

        const userInput = args[0];
        const roleInput = args[1]; 

        let user;
        if (message.mentions.users.size > 0) {
            user = message.mentions.users.first();
        } else if (/^\d+$/.test(userInput)) {
            try {
                user = await message.client.users.fetch(userInput);
            } catch (error) {
                const errorEmbed = new EmbedBuilder()
                    .setColor('#a18cd1')
                    .setDescription('<:info:1402098933261533285> Invalid user ID or user not found.');
                return message.reply({ embeds: [errorEmbed] });
            }
        } else {
            const errorEmbed = new EmbedBuilder()
                .setColor('#a18cd1')
                .setDescription('<:info:1402098933261533285> Please mention a user or provide a valid user ID.');
            return message.reply({ embeds: [errorEmbed] });
        }
        const member = message.guild.members.cache.get(user.id);
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
                .setDescription('<:info:1402098933261533285> Role not found.');
            return message.reply({ embeds: [errorEmbed] });
        }

        try {
            await member.roles.add(role);
            const successEmbed = new EmbedBuilder()
                .setColor('#a18cd1')
                .setDescription(`<:yes:1402096123434500096> Successfully added the role **${role.name}** to ${user.username}.`);
            message.channel.send({ embeds: [successEmbed] });
        } catch (err) {
            console.error(' Error adding role:', err.message);
            const errorEmbed = new EmbedBuilder()
                .setColor('#a18cd1')
                .setDescription('<:info:1402098933261533285> An error occurred while adding the role.');
            return message.reply({ embeds: [errorEmbed] });
        }
    },
};
