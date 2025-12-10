const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { logEmbed, sendLog } = require('../../utils/logger');
const settings = require('../../config/settings');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Delete multiple messages from a channel')
        .addIntegerOption(option =>
            option.setName('amount')
                .setDescription('Number of messages to delete (1-100)')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(100))
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Only delete messages from this user')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('contains')
                .setDescription('Only delete messages containing this text')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

    cooldown: 5,

    async execute(interaction) {
        const amount = interaction.options.getInteger('amount');
        const targetUser = interaction.options.getUser('user');
        const containsText = interaction.options.getString('contains');

        await interaction.deferReply({ ephemeral: true });

        try {
            // Fetch messages
            const messages = await interaction.channel.messages.fetch({ limit: 100 });

            // Filter messages
            let filteredMessages = messages.filter(msg => {
                // Messages older than 14 days can't be bulk deleted
                const twoWeeksAgo = Date.now() - 14 * 24 * 60 * 60 * 1000;
                if (msg.createdTimestamp < twoWeeksAgo) return false;

                // Filter by user if specified
                if (targetUser && msg.author.id !== targetUser.id) return false;

                // Filter by content if specified
                if (containsText && !msg.content.toLowerCase().includes(containsText.toLowerCase())) return false;

                return true;
            });

            // Limit to requested amount
            filteredMessages = [...filteredMessages.values()].slice(0, amount);

            if (filteredMessages.length === 0) {
                return interaction.editReply({
                    embeds: [errorEmbed('No Messages', 'No messages found matching the criteria (or they are older than 14 days).')]
                });
            }

            // Delete messages
            const deleted = await interaction.channel.bulkDelete(filteredMessages, true);

            // Log the action
            let logDescription = `🗑️ **${deleted.size}** messages deleted in ${interaction.channel}\n`;
            logDescription += `**Moderator:** ${interaction.user.tag}`;

            if (targetUser) {
                logDescription += `\n**Target User:** ${targetUser.tag}`;
            }
            if (containsText) {
                logDescription += `\n**Containing:** "${containsText}"`;
            }

            const log = logEmbed('Messages Cleared', logDescription, settings.warningColor);
            await sendLog(interaction.guild, log);

            return interaction.editReply({
                embeds: [successEmbed('Messages Deleted', `Successfully deleted **${deleted.size}** message${deleted.size !== 1 ? 's' : ''}.`)]
            });

        } catch (error) {
            console.error('Clear error:', error);
            return interaction.editReply({
                embeds: [errorEmbed('Clear Failed', 'An error occurred while deleting messages. Make sure I have the proper permissions.')]
            });
        }
    }
};
