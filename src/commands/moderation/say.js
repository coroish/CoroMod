const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { errorEmbed } = require('../../utils/embedBuilder');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('say')
        .setDescription('Make the bot say something (admin only)')
        .addStringOption(option =>
            option.setName('message')
                .setDescription('The message for the bot to say')
                .setRequired(true))
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('The channel to send the message in (defaults to current channel)')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    cooldown: 3,

    async execute(interaction) {
        const message = interaction.options.getString('message');
        const targetChannel = interaction.options.getChannel('channel') || interaction.channel;

        // Check if bot can send messages in the target channel
        if (!targetChannel.permissionsFor(interaction.guild.members.me).has('SendMessages')) {
            return interaction.reply({
                embeds: [errorEmbed('Permission Denied', `I don't have permission to send messages in ${targetChannel}.`)],
                ephemeral: true
            });
        }

        try {
            // Send the message to the target channel
            await targetChannel.send(message);

            // Reply ephemerally to confirm (only visible to the admin)
            await interaction.reply({
                content: `✅ Message sent to ${targetChannel}!`,
                ephemeral: true
            });

        } catch (error) {
            console.error('Say command error:', error);
            return interaction.reply({
                embeds: [errorEmbed('Failed', 'An error occurred while sending the message.')],
                ephemeral: true
            });
        }
    }
};
