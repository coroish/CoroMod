const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { logEmbed, sendLog } = require('../../utils/logger');
const settings = require('../../config/settings');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unlock')
        .setDescription('Unlock a channel (allow everyone to send messages)')
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('Channel to unlock (defaults to current)')
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(false))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for unlocking')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

    cooldown: 5,

    async execute(interaction) {
        const channel = interaction.options.getChannel('channel') || interaction.channel;
        const reason = interaction.options.getString('reason') || 'No reason provided';

        try {
            // Get the @everyone role
            const everyoneRole = interaction.guild.roles.everyone;

            // Unlock the channel
            await channel.permissionOverwrites.edit(everyoneRole, {
                SendMessages: null // Reset to default
            }, { reason: `Unlocked by ${interaction.user.tag}: ${reason}` });

            // Send unlock message in the channel
            await channel.send({
                embeds: [successEmbed('🔓 Channel Unlocked', `This channel has been unlocked.\n**Reason:** ${reason}`)]
            });

            // Log the action
            const log = logEmbed(
                '🔓 Channel Unlocked',
                `**Channel:** ${channel}\n**Moderator:** ${interaction.user.tag}\n**Reason:** ${reason}`,
                settings.successColor
            );
            await sendLog(interaction.guild, log);

            return interaction.reply({
                embeds: [successEmbed('Channel Unlocked', `${channel} has been unlocked.\n**Reason:** ${reason}`)]
            });

        } catch (error) {
            console.error('Unlock error:', error);
            return interaction.reply({
                embeds: [errorEmbed('Unlock Failed', 'An error occurred while unlocking the channel.')],
                ephemeral: true
            });
        }
    }
};
