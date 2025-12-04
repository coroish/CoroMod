const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { successEmbed, errorEmbed, warningEmbed } = require('../../utils/embedBuilder');
const { addWarning, getWarnings, clearWarnings, removeWarning, logModAction: dbLogModAction } = require('../../utils/database');
const { logModAction } = require('../../utils/logger');
const settings = require('../../config/settings');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warn')
        .setDescription('Manage user warnings')
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('Warn a user')
                .addUserOption(option =>
                    option.setName('user')
                        .setDescription('The user to warn')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('reason')
                        .setDescription('Reason for the warning')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('list')
                .setDescription('View warnings for a user')
                .addUserOption(option =>
                    option.setName('user')
                        .setDescription('The user to check warnings for')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('clear')
                .setDescription('Clear all warnings for a user')
                .addUserOption(option =>
                    option.setName('user')
                        .setDescription('The user to clear warnings for')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('Remove a specific warning by ID')
                .addIntegerOption(option =>
                    option.setName('id')
                        .setDescription('The warning ID to remove')
                        .setRequired(true)))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

    cooldown: 3,

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        switch (subcommand) {
            case 'add':
                await handleAddWarning(interaction);
                break;
            case 'list':
                await handleListWarnings(interaction);
                break;
            case 'clear':
                await handleClearWarnings(interaction);
                break;
            case 'remove':
                await handleRemoveWarning(interaction);
                break;
        }
    }
};

async function handleAddWarning(interaction) {
    const target = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason');

    // Can't warn bots
    if (target.bot) {
        return interaction.reply({
            embeds: [errorEmbed('Cannot Warn', 'You cannot warn bots.')],
            ephemeral: true
        });
    }

    // Can't warn yourself
    if (target.id === interaction.user.id) {
        return interaction.reply({
            embeds: [errorEmbed('Cannot Warn', 'You cannot warn yourself.')],
            ephemeral: true
        });
    }

    try {
        // Add warning to database
        addWarning(interaction.guild.id, target.id, interaction.user.id, reason);

        // Get updated warning count
        const warnings = getWarnings(interaction.guild.id, target.id);
        const warningCount = warnings.length;

        // Try to DM the user
        await target.send({
            embeds: [warningEmbed(
                `Warning in ${interaction.guild.name}`,
                `You have been warned.\n**Reason:** ${reason}\n\n⚠️ You now have **${warningCount}** warning${warningCount !== 1 ? 's' : ''}.`
            )]
        }).catch(() => { });

        // Log to database
        dbLogModAction(interaction.guild.id, 'WARN', target.id, interaction.user.id, reason);

        // Log to channel
        await logModAction(interaction.guild, 'User Warned', interaction.user, target, reason);

        const embed = successEmbed(
            'Warning Issued',
            `**${target.tag}** has been warned.\n**Reason:** ${reason}\n\n⚠️ They now have **${warningCount}** warning${warningCount !== 1 ? 's' : ''}.`
        );

        // Add auto-action warning
        if (warningCount >= 5) {
            embed.addFields({
                name: '⚠️ High Warning Count',
                value: 'This user has 5 or more warnings. Consider taking further action.'
            });
        }

        return interaction.reply({ embeds: [embed] });

    } catch (error) {
        console.error('Warning error:', error);
        return interaction.reply({
            embeds: [errorEmbed('Warning Failed', 'An error occurred while issuing the warning.')],
            ephemeral: true
        });
    }
}

async function handleListWarnings(interaction) {
    const target = interaction.options.getUser('user');
    const warnings = getWarnings(interaction.guild.id, target.id);

    if (warnings.length === 0) {
        return interaction.reply({
            embeds: [successEmbed('No Warnings', `**${target.tag}** has no warnings.`)],
            ephemeral: true
        });
    }

    const embed = new EmbedBuilder()
        .setColor(settings.warningColor)
        .setTitle(`⚠️ Warnings for ${target.tag}`)
        .setThumbnail(target.displayAvatarURL({ dynamic: true }))
        .setFooter({ text: `Total: ${warnings.length} warning${warnings.length !== 1 ? 's' : ''}` })
        .setTimestamp();

    // Show last 10 warnings
    const recentWarnings = warnings.slice(0, 10);
    for (const warn of recentWarnings) {
        const date = new Date(warn.created_at).toLocaleDateString();
        embed.addFields({
            name: `#${warn.id} - ${date}`,
            value: `**Reason:** ${warn.reason}\n**By:** <@${warn.moderator_id}>`,
            inline: false
        });
    }

    if (warnings.length > 10) {
        embed.addFields({
            name: '...',
            value: `And ${warnings.length - 10} more warnings.`
        });
    }

    return interaction.reply({ embeds: [embed] });
}

async function handleClearWarnings(interaction) {
    const target = interaction.options.getUser('user');
    const warnings = getWarnings(interaction.guild.id, target.id);

    if (warnings.length === 0) {
        return interaction.reply({
            embeds: [errorEmbed('No Warnings', `**${target.tag}** has no warnings to clear.`)],
            ephemeral: true
        });
    }

    clearWarnings(interaction.guild.id, target.id);

    return interaction.reply({
        embeds: [successEmbed('Warnings Cleared', `Cleared **${warnings.length}** warning${warnings.length !== 1 ? 's' : ''} from **${target.tag}**.`)]
    });
}

async function handleRemoveWarning(interaction) {
    const warningId = interaction.options.getInteger('id');

    const result = removeWarning(warningId);

    if (result.changes === 0) {
        return interaction.reply({
            embeds: [errorEmbed('Warning Not Found', `No warning found with ID **#${warningId}**.`)],
            ephemeral: true
        });
    }

    return interaction.reply({
        embeds: [successEmbed('Warning Removed', `Removed warning **#${warningId}**.`)]
    });
}
