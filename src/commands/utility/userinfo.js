const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const settings = require('../../config/settings');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('userinfo')
        .setDescription('Get information about a user')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to get info about')
                .setRequired(false)),

    cooldown: 5,

    async execute(interaction) {
        const target = interaction.options.getUser('user') || interaction.user;
        const member = await interaction.guild.members.fetch(target.id).catch(() => null);

        const embed = new EmbedBuilder()
            .setColor(settings.embedColor)
            .setTitle(`👤 User Information`)
            .setThumbnail(target.displayAvatarURL({ dynamic: true, size: 256 }))
            .addFields(
                { name: '🏷️ Username', value: target.tag, inline: true },
                { name: '🆔 User ID', value: target.id, inline: true },
                { name: '🤖 Bot', value: target.bot ? 'Yes' : 'No', inline: true },
                { name: '📅 Account Created', value: `<t:${Math.floor(target.createdTimestamp / 1000)}:F>`, inline: false }
            )
            .setTimestamp();

        if (member) {
            const roles = member.roles.cache
                .filter(r => r.id !== interaction.guild.id)
                .sort((a, b) => b.position - a.position)
                .map(r => r.toString())
                .slice(0, 10)
                .join(', ') || 'None';

            embed.addFields(
                { name: '📥 Joined Server', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:F>`, inline: false },
                { name: `🎭 Roles [${member.roles.cache.size - 1}]`, value: roles, inline: false }
            );

            if (member.nickname) {
                embed.addFields({ name: '📛 Nickname', value: member.nickname, inline: true });
            }

            // Add boost info
            if (member.premiumSince) {
                embed.addFields({
                    name: '🚀 Boosting Since',
                    value: `<t:${Math.floor(member.premiumSinceTimestamp / 1000)}:F>`,
                    inline: true
                });
            }

            // Add key permissions
            const keyPermissions = [];
            if (member.permissions.has(PermissionFlagsBits.Administrator)) keyPermissions.push('Administrator');
            if (member.permissions.has(PermissionFlagsBits.ManageGuild)) keyPermissions.push('Manage Server');
            if (member.permissions.has(PermissionFlagsBits.BanMembers)) keyPermissions.push('Ban Members');
            if (member.permissions.has(PermissionFlagsBits.KickMembers)) keyPermissions.push('Kick Members');
            if (member.permissions.has(PermissionFlagsBits.ManageMessages)) keyPermissions.push('Manage Messages');

            if (keyPermissions.length > 0) {
                embed.addFields({
                    name: '🔑 Key Permissions',
                    value: keyPermissions.join(', '),
                    inline: false
                });
            }
        }

        return interaction.reply({ embeds: [embed] });
    }
};
