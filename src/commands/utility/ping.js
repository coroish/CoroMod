const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const settings = require('../../config/settings');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Check bot latency'),

    cooldown: 5,

    async execute(interaction) {
        const sent = await interaction.reply({
            content: '🏓 Pinging...',
            fetchReply: true
        });

        const roundtrip = sent.createdTimestamp - interaction.createdTimestamp;
        const wsLatency = interaction.client.ws.ping;

        const embed = new EmbedBuilder()
            .setColor(getLatencyColor(roundtrip))
            .setTitle('🏓 Pong!')
            .addFields(
                { name: '📡 Roundtrip', value: `${roundtrip}ms`, inline: true },
                { name: '💓 Heartbeat', value: `${wsLatency}ms`, inline: true }
            )
            .setTimestamp();

        return interaction.editReply({ content: null, embeds: [embed] });
    }
};

function getLatencyColor(latency) {
    if (latency < 100) return settings.successColor;
    if (latency < 200) return settings.warningColor;
    return settings.errorColor;
}
