const { Events } = require('discord.js');
const { logMessageDelete } = require('../utils/logger');

module.exports = {
    name: Events.MessageDelete,

    async execute(message) {
        // Ignore partial messages and DMs
        if (!message.guild) return;
        if (message.partial) return;

        // Log the message deletion
        await logMessageDelete(message);
    }
};
