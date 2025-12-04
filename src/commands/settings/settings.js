const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ChannelType } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embedBuilder');
const { getGuildSettings, setGuildSettings } = require('../../utils/database');
const settings = require('../../config/settings');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('settings')
        .setDescription('Configure bot settings for this server')
        .addSubcommand(subcommand =>
            subcommand
                .setName('logchannel')
                .setDescription('Set the channel for mod logs')
                .addChannelOption(option =>
                    option.setName('channel')
                        .setDescription('The channel for logs')
                        .addChannelTypes(ChannelType.GuildText)
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('view')
                .setDescription('View current settings'))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

    cooldown: 5,

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        switch (subcommand) {
            case 'logchannel':
                await handleSetLogChannel(interaction);
                break;
            case 'view':
                await handleViewSettings(interaction);
                break;
        }
    }
};

async function handleSetLogChannel(interaction) {
    const channel = interaction.options.getChannel('channel');

    try {
        setGuildSettings(interaction.guild.id, { log_channel_id: channel.id });

        return interaction.reply({
            embeds: [successEmbed('Log Channel Set', `Mod logs will now be sent to ${channel}.`)]
        });
    } catch (error) {
        console.error('Settings error:', error);
        return interaction.reply({
            embeds: [errorEmbed('Error', 'Failed to update settings.')],
            ephemeral: true
        });
    }
}

async function handleViewSettings(interaction) {
    const guildSettings = getGuildSettings(interaction.guild.id) || {};

    const logChannel = guildSettings.log_channel_id
        ? `<#${guildSettings.log_channel_id}>`
        : 'Not set';

    const welcomeChannel = guildSettings.welcome_channel_id
        ? `<#${guildSettings.welcome_channel_id}>`
        : 'Not set';

    const embed = new EmbedBuilder()
        .setColor(settings.embedColor)
        .setTitle('⚙️ Server Settings')
        .addFields(
            { name: '📋 Log Channel', value: logChannel, inline: true },
            { name: '👋 Welcome Channel', value: welcomeChannel, inline: true },
            { name: '🤖 Auto-Mod', value: guildSettings.automod_enabled ? '✅ Enabled' : '❌ Disabled', inline: true },
            { name: '🚫 Anti-Spam', value: guildSettings.anti_spam !== 0 ? '✅ Enabled' : '❌ Disabled', inline: true },
            { name: '🔗 Anti-Links', value: guildSettings.anti_links ? '✅ Enabled' : '❌ Disabled', inline: true },
            { name: '🤬 Bad Word Filter', value: guildSettings.bad_word_filter !== 0 ? '✅ Enabled' : '❌ Disabled', inline: true }
        )
        .setTimestamp();

    return interaction.reply({ embeds: [embed] });
}
