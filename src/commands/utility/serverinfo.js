const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const settings = require('../../config/settings');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('serverinfo')
        .setDescription('Get information about the server'),

    cooldown: 10,

    async execute(interaction) {
        const { guild } = interaction;

        // Fetch owner
        const owner = await guild.fetchOwner();

        // Channel counts
        const textChannels = guild.channels.cache.filter(c => c.type === 0).size;
        const voiceChannels = guild.channels.cache.filter(c => c.type === 2).size;
        const categories = guild.channels.cache.filter(c => c.type === 4).size;

        // Member counts
        const totalMembers = guild.memberCount;
        const botCount = guild.members.cache.filter(m => m.user.bot).size;
        const humanCount = totalMembers - botCount;

        // Role count
        const roleCount = guild.roles.cache.size - 1; // Exclude @everyone

        // Emoji counts
        const staticEmojis = guild.emojis.cache.filter(e => !e.animated).size;
        const animatedEmojis = guild.emojis.cache.filter(e => e.animated).size;

        // Boost info
        const boostLevel = guild.premiumTier;
        const boostCount = guild.premiumSubscriptionCount || 0;

        const embed = new EmbedBuilder()
            .setColor(settings.embedColor)
            .setTitle(`📊 ${guild.name}`)
            .setThumbnail(guild.iconURL({ dynamic: true, size: 256 }))
            .addFields(
                { name: '👑 Owner', value: owner.user.tag, inline: true },
                { name: '🆔 Server ID', value: guild.id, inline: true },
                { name: '📅 Created', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`, inline: true },
                {
                    name: `👥 Members [${totalMembers}]`,
                    value: `👤 Humans: ${humanCount}\n🤖 Bots: ${botCount}`,
                    inline: true
                },
                {
                    name: `📁 Channels [${textChannels + voiceChannels}]`,
                    value: `💬 Text: ${textChannels}\n🔊 Voice: ${voiceChannels}\n📂 Categories: ${categories}`,
                    inline: true
                },
                { name: `🎭 Roles`, value: `${roleCount} roles`, inline: true },
                {
                    name: `😀 Emojis [${staticEmojis + animatedEmojis}]`,
                    value: `Static: ${staticEmojis}\nAnimated: ${animatedEmojis}`,
                    inline: true
                },
                {
                    name: '🚀 Boosts',
                    value: `Level ${boostLevel} (${boostCount} boosts)`,
                    inline: true
                },
                {
                    name: '🔒 Verification Level',
                    value: getVerificationLevel(guild.verificationLevel),
                    inline: true
                }
            )
            .setTimestamp();

        if (guild.description) {
            embed.setDescription(guild.description);
        }

        if (guild.bannerURL()) {
            embed.setImage(guild.bannerURL({ size: 512 }));
        }

        return interaction.reply({ embeds: [embed] });
    }
};

function getVerificationLevel(level) {
    const levels = {
        0: 'None',
        1: 'Low',
        2: 'Medium',
        3: 'High',
        4: 'Very High'
    };
    return levels[level] || 'Unknown';
}
