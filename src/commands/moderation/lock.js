const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { logEmbed, sendLog } = require('../../utils/logger');
const settings = require('../../config/settings');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('lock')
        .setDescription('Lock a channel (prevent everyone from sending messages)')
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('Channel to lock (defaults to current)')
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(false))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for locking')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

    cooldown: 5,

    async execute(interaction) {
        const channel = interaction.options.getChannel('channel') || interaction.channel;
        const reason = interaction.options.getString('reason') || 'No reason provided';

        try {
            // Get the @everyone role
            const everyoneRole = interaction.guild.roles.everyone;

            // Check current permissions
            const currentPerms = channel.permissionOverwrites.cache.get(everyoneRole.id);

            if (currentPerms?.deny.has('SendMessages')) {
                return interaction.reply({
                    embeds: [errorEmbed('Already Locked', `${channel} is already locked.`)],
                    ephemeral: true
                });
            }

            // Lock the channel
            await channel.permissionOverwrites.edit(everyoneRole, {
                SendMessages: false
            }, { reason: `Locked by ${interaction.user.tag}: ${reason}` });

            // Send lock message in the channel
            await channel.send({
                embeds: [errorEmbed('🔒 Channel Locked', `This channel has been locked by a moderator.\n**Reason:** ${reason}`)]
            });

            // Log the action
            const log = logEmbed(
                '🔒 Channel Locked',
                `**Channel:** ${channel}\n**Moderator:** ${interaction.user.tag}\n**Reason:** ${reason}`,
                settings.warningColor
            );
            await sendLog(interaction.guild, log);

            return interaction.reply({
                embeds: [successEmbed('Channel Locked', `${channel} has been locked.\n**Reason:** ${reason}`)]
            });

        } catch (error) {
            console.error('Lock error:', error);
            return interaction.reply({
                embeds: [errorEmbed('Lock Failed', 'An error occurred while locking the channel.')],
                ephemeral: true
            });
        }
    }
};
