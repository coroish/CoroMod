const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { infoEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { getReports, addReport, updateReportStatus } = require('../../utils/database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reports')
        .setDescription('View and manage user reports (Mod only)')
        .addSubcommand(subcommand =>
            subcommand
                .setName('view')
                .setDescription('View pending reports')
                .addStringOption(option =>
                    option.setName('status')
                        .setDescription('Filter by status')
                        .setRequired(false)
                        .addChoices(
                            { name: 'Pending', value: 'pending' },
                            { name: 'Reviewing', value: 'reviewing' },
                            { name: 'Resolved', value: 'resolved' },
                            { name: 'All', value: 'all' }
                        )))
        .addSubcommand(subcommand =>
            subcommand
                .setName('resolve')
                .setDescription('Mark a report as resolved')
                .addStringOption(option =>
                    option.setName('report_id')
                        .setDescription('The report ID to resolve')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('action')
                        .setDescription('Action taken')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Warning Issued', value: 'warned' },
                            { name: 'User Muted', value: 'muted' },
                            { name: 'User Kicked', value: 'kicked' },
                            { name: 'User Banned', value: 'banned' },
                            { name: 'No Action Needed', value: 'no_action' },
                            { name: 'False Report', value: 'false_report' }
                        )))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'view') {
            const status = interaction.options.getString('status') || 'pending';
            const reports = getReports(interaction.guild.id, status === 'all' ? null : status);

            if (reports.length === 0) {
                return interaction.reply({
                    embeds: [infoEmbed('No Reports', `There are no ${status === 'all' ? '' : status + ' '}reports.`)],
                    ephemeral: true
                });
            }

            const reportList = reports.slice(0, 10).map((r, i) =>
                `**${i + 1}.** Report \`${r.id}\`\n` +
                `   👤 Reported: <@${r.target_id}>\n` +
                `   📢 By: <@${r.reporter_id}>\n` +
                `   📝 ${r.reason.slice(0, 50)}${r.reason.length > 50 ? '...' : ''}\n` +
                `   📅 ${new Date(r.created_at).toLocaleDateString()}`
            ).join('\n\n');

            return interaction.reply({
                embeds: [infoEmbed(
                    `📋 Reports (${status})`,
                    reportList + `\n\n*Showing ${Math.min(reports.length, 10)} of ${reports.length} reports*`
                )],
                ephemeral: true
            });

        } else if (subcommand === 'resolve') {
            const reportId = interaction.options.getString('report_id');
            const action = interaction.options.getString('action');

            const result = updateReportStatus(reportId, 'resolved', action, interaction.user.id);

            if (!result) {
                return interaction.reply({
                    embeds: [errorEmbed('Not Found', `Report \`${reportId}\` was not found.`)],
                    ephemeral: true
                });
            }

            return interaction.reply({
                embeds: [infoEmbed(
                    '✅ Report Resolved',
                    `Report \`${reportId}\` has been marked as resolved.\n**Action:** ${action.replace('_', ' ')}`
                )]
            });
        }
    }
};
