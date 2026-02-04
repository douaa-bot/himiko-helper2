const { EmbedBuilder } = require('discord.js');

const cooldowns = new Map();
const COOLDOWN_TIME = 10000; 

module.exports = {
    name: 'user',
    aliases: ['u','userinfo','user-info'],
    description: 'Get detailed information about a user.',
    cooldown: 10,
    userPerms: [],
    botPerms: [], 
    async execute(message, args) {
        if (cooldowns.has(message.author.id)) {
            return message.react('⏳');
        }

        cooldowns.set(message.author.id, Date.now() + COOLDOWN_TIME);
        setTimeout(() => cooldowns.delete(message.author.id), COOLDOWN_TIME);

        let user;
        if (message.mentions.users.size) {
            user = message.mentions.users.first();
        } else if (args.length) {
            user = await message.client.users.fetch(args[0]).catch(() => null);
        } else {
            user = message.author;
        }

        if (!user) {
            return message.channel.send('User not found.');
        }

        const member = message.guild.members.cache.get(user.id);

        if (!member) {
            return message.channel.send('This user is not in the server.');
        }

        const joinedAt = member.joinedAt;
        const timeJoined = `<t:${Math.floor(joinedAt.getTime() / 1000)}:R>`;
        const createdAt = user.createdAt;
        const timeCreated = `<t:${Math.floor(createdAt.getTime() / 1000)}:R>`;
        const highestRole = member.roles.highest;
        const highestRoleName = highestRole ? highestRole.toString() : '`No Role`';
        const bannerURL = user.bannerURL ? user.bannerURL({ size: 2048, format: 'png' }) : null;
        const nickname = member.nickname || '`No Nickname`';

        const roles = member.roles.cache
            .filter(role => role.id !== message.guild.id)
            .map(role => role.toString())
            .join(', ');

        const rolesDisplay = roles.length > 0 ? roles : '`No Roles`';

        const userInfoEmbed = new EmbedBuilder()
            .setAuthor({ 
                name: `${user.username}'s Information`,
                iconURL: user.displayAvatarURL({ dynamic: true, size: 512 }),
            })
            .setColor('#a18cd1')
            .setThumbnail(member.displayAvatarURL({ dynamic: true }))
            .setImage(bannerURL || null)
            .setDescription(`<:menu:1341837979936886875> ***User information for*** \`${user.username}\``)
            .addFields(
                { name: '__Info General__', value: `Username: ${user.username} / <@${user.id}>\nNickname : ${nickname}\nID : \`${user.id}\`\nAccount Created : ${timeCreated}`, inline: false },
                { name: '__Basic Server Info__', value: `Joined Server : ${timeJoined}\nHighest Role : ${highestRoleName}`, inline: false },
                { name: '__Roles :__', value: rolesDisplay, inline: false }
            )
            .setFooter({ text: `Requested by ${message.author.username}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) });

        await message.channel.send({ embeds: [userInfoEmbed] });
    }
};
