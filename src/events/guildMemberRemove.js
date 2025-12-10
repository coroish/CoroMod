const { Events } = require('discord.js');
const { logMemberLeave } = require('../utils/logger');

module.exports = {
    name: Events.GuildMemberRemove,

    async execute(member) {
        // Log the member leave
        await logMemberLeave(member);
    }
};
