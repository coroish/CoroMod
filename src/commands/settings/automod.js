const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { successEmbed, errorEmbed, infoEmbed } = require('../../utils/embedBuilder');
const { getGuildSettings, setGuildSettings } = require('../../utils/database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('automod')
        .setDescription('Configure auto-moderation settings')
        .addSubcommand(subcommand =>
            subcommand
                .setName('toggle')
                .setDescription('Enable or disable auto-moderation')
                .addBooleanOption(option =>
                    option.setName('enabled')
                        .setDescription('Enable auto-moderation')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('antispam')
                .setDescription('Toggle anti-spam protection')
                .addBooleanOption(option =>
                    option.setName('enabled')
                        .setDescription('Enable anti-spam')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('antilinks')
                .setDescription('Toggle link filtering')
                .addBooleanOption(option =>
                    option.setName('enabled')
                        .setDescription('Enable link filtering')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('badwords')
                .setDescription('Toggle bad word filtering')
                .addBooleanOption(option =>
                    option.setName('enabled')
                        .setDescription('Enable bad word filter')
                        .setRequired(true)))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

    cooldown: 5,

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const enabled = interaction.options.getBoolean('enabled');

        try {
            switch (subcommand) {
                case 'toggle':
                    setGuildSettings(interaction.guild.id, { automod_enabled: enabled ? 1 : 0 });
                    return interaction.reply({
                        embeds: [successEmbed(
                            'Auto-Moderation Updated',
                            `Auto-moderation is now ${enabled ? '✅ **enabled**' : '❌ **disabled**'}.`
                        )]
                    });

                case 'antispam':
                    setGuildSettings(interaction.guild.id, { anti_spam: enabled ? 1 : 0 });
                    return interaction.reply({
                        embeds: [successEmbed(
                            'Anti-Spam Updated',
                            `Anti-spam protection is now ${enabled ? '✅ **enabled**' : '❌ **disabled**'}.`
                        )]
                    });

                case 'antilinks':
                    setGuildSettings(interaction.guild.id, { anti_links: enabled ? 1 : 0 });
                    return interaction.reply({
                        embeds: [successEmbed(
                            'Link Filter Updated',
                            `Link filtering is now ${enabled ? '✅ **enabled**' : '❌ **disabled**'}.`
                        )]
                    });

                case 'badwords':
                    setGuildSettings(interaction.guild.id, { bad_word_filter: enabled ? 1 : 0 });
                    return interaction.reply({
                        embeds: [successEmbed(
                            'Bad Word Filter Updated',
                            `Bad word filtering is now ${enabled ? '✅ **enabled**' : '❌ **disabled**'}.`
                        )]
                    });
            }
        } catch (error) {
            console.error('Automod settings error:', error);
            return interaction.reply({
                embeds: [errorEmbed('Error', 'Failed to update auto-moderation settings.')],
                ephemeral: true
            });
        }
    }
};
