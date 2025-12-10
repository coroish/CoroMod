const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const settings = require('../../config/settings');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('View all available commands')
        .addStringOption(option =>
            option.setName('command')
                .setDescription('Get info about a specific command')
                .setRequired(false)),

    cooldown: 3,

    async execute(interaction) {
        const commandName = interaction.options.getString('command');

        if (commandName) {
            return showCommandHelp(interaction, commandName);
        }

        const embed = new EmbedBuilder()
            .setColor(settings.embedColor)
            .setTitle('🤖 Bot Commands')
            .setDescription('Here are all available commands. Use `/help <command>` for more details.')
            .addFields(
                {
                    name: '🛡️ Moderation',
                    value: [
                        '`/ban` - Ban a user from the server',
                        '`/kick` - Kick a user from the server',
                        '`/mute` - Timeout a user',
                        '`/unmute` - Remove timeout from a user',
                        '`/warn` - Manage user warnings',
                        '`/clear` - Delete multiple messages',
                        '`/slowmode` - Set channel slowmode',
                        '`/lock` - Lock a channel',
                        '`/unlock` - Unlock a channel'
                    ].join('\n'),
                    inline: false
                },
                {
                    name: '🔧 Utility',
                    value: [
                        '`/userinfo` - Get info about a user',
                        '`/serverinfo` - Get info about the server',
                        '`/help` - View this help menu',
                        '`/ping` - Check bot latency'
                    ].join('\n'),
                    inline: false
                },
                {
                    name: '⚙️ Settings',
                    value: [
                        '`/settings` - Configure bot settings',
                        '`/automod` - Configure auto-moderation'
                    ].join('\n'),
                    inline: false
                }
            )
            .setFooter({ text: 'Made with ❤️ for server moderation' })
            .setTimestamp();

        return interaction.reply({ embeds: [embed] });
    }
};

async function showCommandHelp(interaction, commandName) {
    const command = interaction.client.commands.get(commandName.toLowerCase());

    if (!command) {
        return interaction.reply({
            content: `❌ Command \`${commandName}\` not found.`,
            ephemeral: true
        });
    }

    const embed = new EmbedBuilder()
        .setColor(settings.embedColor)
        .setTitle(`📖 Command: /${command.data.name}`)
        .setDescription(command.data.description)
        .addFields(
            { name: '⏱️ Cooldown', value: `${command.cooldown || 3} seconds`, inline: true }
        )
        .setTimestamp();

    // Add subcommands if any
    const subcommands = command.data.options?.filter(opt => opt.type === 1);
    if (subcommands?.length > 0) {
        const subcommandList = subcommands
            .map(sub => `\`${sub.name}\` - ${sub.description}`)
            .join('\n');
        embed.addFields({
            name: '📂 Subcommands',
            value: subcommandList,
            inline: false
        });
    }

    // Add options if any
    const options = command.data.options?.filter(opt => opt.type !== 1 && opt.type !== 2);
    if (options?.length > 0) {
        const optionList = options
            .map(opt => `\`${opt.name}\` - ${opt.description}${opt.required ? ' (required)' : ''}`)
            .join('\n');
        embed.addFields({
            name: '📝 Options',
            value: optionList,
            inline: false
        });
    }

    return interaction.reply({ embeds: [embed] });
}
