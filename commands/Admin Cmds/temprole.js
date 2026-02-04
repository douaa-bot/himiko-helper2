const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'temprole',
    aliases: ['temprole', 'setrolefor'],
    description: 'Assign a role to a user for a specific amount of time',
    async execute(message, args) {
        if (args.length < 3) {
            const guideEmbed = new EmbedBuilder()
                .setColor('#a18cd1')
                .setAuthor({ name: 'Command: TempRole', iconURL: message.author.displayAvatarURL({ dynamic: true }) })
                .addFields(
                    { name: "Usage:", value: "- &temprole `userid` `roleid` `time`", inline: false },
                    { name: "Examples:", value: "- &temprole `user` `roleid` `24h`", inline: false }
                )
                .setThumbnail(message.author.displayAvatarURL({ dynamic: true }));
            return message.reply({ embeds: [guideEmbed] });
        }

        const userInput = args[0];
        const roleInput = args[1];
        const timeInput = args[2];
        let user;

        if (message.mentions.users.size > 0) {
            user = message.mentions.users.first();
        } else if (/^\d+$/.test(userInput)) {
            try {
                user = await message.client.users.fetch(userInput);
            } catch (error) {
                return message.reply({ embeds: [new EmbedBuilder().setColor('#a18cd1').setDescription('<:info:1402098933261533285> Invalid user ID or user not found.')] });
            }
        } else {
            return message.reply({ embeds: [new EmbedBuilder().setColor('#a18cd1').setDescription('<:info:1402098933261533285> Please mention a user or provide a valid user ID.')] });
        }

        const member = message.guild.members.cache.get(user.id);
        if (!member) {
            return message.reply({ embeds: [new EmbedBuilder().setColor('#a18cd1').setDescription('<:info:1402098933261533285> This user is not in this server.')] });
        }

        if (!message.guild.members.me.permissions.has('ManageRoles')) {
            return message.reply({ embeds: [new EmbedBuilder().setColor('#a18cd1').setDescription('<:info:1402098933261533285> I do not have permission to manage roles.')] });
        }

        if (!message.member.permissions.has('ManageRoles')) {
            return message.reply({ embeds: [new EmbedBuilder().setColor('#a18cd1').setDescription('<:info:1402098933261533285> You do not have permission to manage roles.')] });
        }

        let role;
        if (/^\d+$/.test(roleInput)) {
            role = message.guild.roles.cache.get(roleInput);
        } else if (message.mentions.roles.size > 0) {
            role = message.mentions.roles.first();
        } else {
            role = message.guild.roles.cache.find(r => r.name.toLowerCase() === roleInput.toLowerCase());
        }

        if (!role) {
            return message.reply({ embeds: [new EmbedBuilder().setColor('#a18cd1').setDescription('<:info:1402098933261533285> Role not found.')] });
        }

        function parseDuration(duration) {
            const match = duration.match(/^(\d+)(s|m|h|d)$/i);
            if (!match) return null;
            const value = parseInt(match[1]);
            const unit = match[2].toLowerCase();

            switch (unit) {
                case 's': return value * 1000;
                case 'm': return value * 60 * 1000;
                case 'h': return value * 60 * 60 * 1000;
                case 'd': return value * 24 * 60 * 60 * 1000;
                default: return null;
            }
        }

        const timeMs = parseDuration(timeInput);
        if (!timeMs || timeMs <= 0) {
            return message.reply({ embeds: [new EmbedBuilder().setColor('#a18cd1').setDescription('<:info:1402098933261533285> Please provide a valid time (e.g. 10m, 5h, 1d, 30s).')] });
        }

        // دالة باش نرجع نص وقت مناسب مفصل (مثلاً: 1 minute / 5 hours)
        function formatDuration(duration) {
            const seconds = Math.floor(duration / 1000);
            if (seconds < 60) return seconds + (seconds === 1 ? ' second' : ' seconds');
            const minutes = Math.floor(seconds / 60);
            if (minutes < 60) return minutes + (minutes === 1 ? ' minute' : ' minutes');
            const hours = Math.floor(minutes / 60);
            if (hours < 24) return hours + (hours === 1 ? ' hour' : ' hours');
            const days = Math.floor(hours / 24);
            return days + (days === 1 ? ' day' : ' days');
        }

        try {
            await member.roles.add(role);
            message.channel.send({
                embeds: [new EmbedBuilder()
                    .setColor('#a18cd1')
                    .setDescription(`<:yes:1402096123434500096> Successfully added the role <@&${role.id}> to <@${user.id}> for ${formatDuration(timeMs)}.`)]
            });

            setTimeout(async () => {
                try {
                    await member.roles.remove(role);
                    message.channel.send({
                        embeds: [new EmbedBuilder()
                            .setColor('#a18cd1')
                            .setDescription(`<:yes:1402096123434500096> The role <@&${role.id}> was removed from <@${user.id}> after ${formatDuration(timeMs)}.`)]
                    });
                } catch (err) {
                    console.error('Error removing role:', err.message);
                }
            }, timeMs);
        } catch (err) {
            console.error('Error adding role:', err.message);
            return message.reply({ embeds: [new EmbedBuilder().setColor('#a18cd1').setDescription('<:info:1402098933261533285> An error occurred while adding the role.')] });
        }
    },
};
