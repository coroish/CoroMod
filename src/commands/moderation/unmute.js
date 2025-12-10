const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { logModAction } = require('../../utils/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unmute')
        .setDescription('Remove timeout from a user')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to unmute')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for the unmute')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

    cooldown: 3,

    async execute(interaction) {
        const target = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason') || 'No reason provided';

        const member = await interaction.guild.members.fetch(target.id).catch(() => null);

        if (!member) {
            return interaction.reply({
                embeds: [errorEmbed('User Not Found', 'This user is not in the server.')],
                ephemeral: true
            });
        }

        // Check if user is actually timed out
        if (!member.isCommunicationDisabled()) {
            return interaction.reply({
                embeds: [errorEmbed('Not Muted', 'This user is not currently muted.')],
                ephemeral: true
            });
        }

        try {
            // Remove timeout
            await member.timeout(null, `${reason} | Unmuted by ${interaction.user.tag}`);

            // Log to channel
            await logModAction(interaction.guild, 'User Unmuted', interaction.user, target, reason);

            return interaction.reply({
                embeds: [successEmbed('User Unmuted', `**${target.tag}** has been unmuted.\n**Reason:** ${reason}`)]
            });

        } catch (error) {
            console.error('Unmute error:', error);
            return interaction.reply({
                embeds: [errorEmbed('Unmute Failed', 'An error occurred while trying to unmute this user.')],
                ephemeral: true
            });
        }
    }
};
