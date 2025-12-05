const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { EmbedBuilder } = require('discord.js');
const settings = require('../../config/settings');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('report')
        .setDescription('Report a user to the moderators')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to report')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for the report')
                .setRequired(true))
        .addAttachmentOption(option =>
            option.setName('evidence')
                .setDescription('Screenshot or evidence (optional)')
                .setRequired(false)),

    cooldown: 60, // 1 minute cooldown to prevent spam

    async execute(interaction) {
        const target = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason');
        const evidence = interaction.options.getAttachment('evidence');

        // Can't report yourself
        if (target.id === interaction.user.id) {
            return interaction.reply({
                embeds: [errorEmbed('Invalid Report', 'You cannot report yourself.')],
                ephemeral: true
            });
        }

        // Can't report bots
        if (target.bot) {
            return interaction.reply({
                embeds: [errorEmbed('Invalid Report', 'You cannot report a bot.')],
                ephemeral: true
            });
        }

        try {
            // Find or create a reports channel
            let reportsChannel = interaction.guild.channels.cache.find(
                c => c.name === 'reports' || c.name === 'user-reports' || c.name === 'mod-reports'
            );

            // If no reports channel, try to find a mod channel
            if (!reportsChannel) {
                reportsChannel = interaction.guild.channels.cache.find(
                    c => c.name.includes('mod') && c.type === ChannelType.GuildText
                );
            }

            // If still no channel, notify the user
            if (!reportsChannel) {
                return interaction.reply({
                    embeds: [errorEmbed('No Reports Channel', 'Could not find a reports or mod channel. Please ask an admin to create one named `reports`.')],
                    ephemeral: true
                });
            }

            // Create the report embed
            const reportEmbed = new EmbedBuilder()
                .setColor(0xFF6B6B)
                .setTitle('🚨 New User Report')
                .setThumbnail(target.displayAvatarURL({ dynamic: true }))
                .addFields(
                    { name: '👤 Reported User', value: `${target.tag}\n<@${target.id}>\nID: \`${target.id}\``, inline: true },
                    { name: '📢 Reported By', value: `${interaction.user.tag}\n<@${interaction.user.id}>`, inline: true },
                    { name: '📍 Channel', value: `${interaction.channel}`, inline: true },
                    { name: '📝 Reason', value: reason, inline: false }
                )
                .setTimestamp()
                .setFooter({ text: `Report ID: ${Date.now().toString(36).toUpperCase()}` });

            // Add evidence if provided
            if (evidence) {
                if (evidence.contentType?.startsWith('image/')) {
                    reportEmbed.setImage(evidence.url);
                } else {
                    reportEmbed.addFields({ name: '📎 Evidence', value: `[${evidence.name}](${evidence.url})` });
                }
            }

            // Send the report
            const reportMessage = await reportsChannel.send({
                content: '**A new report has been submitted!**',
                embeds: [reportEmbed]
            });

            // Add reaction options for mods
            await reportMessage.react('✅'); // Handled
            await reportMessage.react('👀'); // Reviewing
            await reportMessage.react('❌'); // Invalid

            // Confirm to the user
            await interaction.reply({
                embeds: [successEmbed(
                    'Report Submitted',
                    `Your report against **${target.tag}** has been sent to the moderators.\n\n` +
                    `Thank you for helping keep this server safe! 🛡️\n\n` +
                    `*Please do not spam reports or submit false reports.*`
                )],
                ephemeral: true
            });

        } catch (error) {
            console.error('Report error:', error);
            return interaction.reply({
                embeds: [errorEmbed('Report Failed', 'An error occurred while submitting your report. Please try again or contact a moderator directly.')],
                ephemeral: true
            });
        }
    }
};
