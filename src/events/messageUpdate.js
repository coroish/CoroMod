const { Events } = require('discord.js');
const { logMessageEdit } = require('../utils/logger');

module.exports = {
    name: Events.MessageUpdate,

    async execute(oldMessage, newMessage) {
        // Ignore partial messages and DMs
        if (!newMessage.guild) return;
        if (oldMessage.partial || newMessage.partial) return;

        // Log the message edit
        await logMessageEdit(oldMessage, newMessage);
    }
};
