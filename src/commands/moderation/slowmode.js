const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('slowmode')
        .setDescription('Set slowmode for a channel')
        .addIntegerOption(option =>
            option.setName('seconds')
                .setDescription('Slowmode duration in seconds (0 to disable)')
                .setRequired(true)
                .setMinValue(0)
                .setMaxValue(21600)) // Max 6 hours
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('Channel to set slowmode for (defaults to current)')
                .addChannelTypes(ChannelType.GuildText, ChannelType.GuildForum)
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

    cooldown: 5,

    async execute(interaction) {
        const seconds = interaction.options.getInteger('seconds');
        const channel = interaction.options.getChannel('channel') || interaction.channel;

        try {
            await channel.setRateLimitPerUser(seconds, `Set by ${interaction.user.tag}`);

            if (seconds === 0) {
                return interaction.reply({
                    embeds: [successEmbed('Slowmode Disabled', `Slowmode has been disabled in ${channel}.`)]
                });
            }

            const durationText = formatDuration(seconds);
            return interaction.reply({
                embeds: [successEmbed('Slowmode Set', `Slowmode set to **${durationText}** in ${channel}.`)]
            });

        } catch (error) {
            console.error('Slowmode error:', error);
            return interaction.reply({
                embeds: [errorEmbed('Slowmode Failed', 'An error occurred while setting slowmode. Make sure I have the proper permissions.')],
                ephemeral: true
            });
        }
    }
};

function formatDuration(seconds) {
    if (seconds < 60) {
        return `${seconds} second${seconds !== 1 ? 's' : ''}`;
    } else if (seconds < 3600) {
        const minutes = Math.floor(seconds / 60);
        return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    } else {
        const hours = Math.floor(seconds / 3600);
        return `${hours} hour${hours !== 1 ? 's' : ''}`;
    }
}
