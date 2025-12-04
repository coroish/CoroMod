const { Events } = require('discord.js');
const { logMemberJoin } = require('../utils/logger');

module.exports = {
    name: Events.GuildMemberAdd,

    async execute(member) {
        // Log the member join
        await logMemberJoin(member);

        // You can add welcome message functionality here
        // const guildSettings = getGuildSettings(member.guild.id);
        // if (guildSettings?.welcome_channel_id) {
        //     const channel = member.guild.channels.cache.get(guildSettings.welcome_channel_id);
        //     if (channel) {
        //         channel.send(`Welcome to the server, ${member}! 🎉`);
        //     }
        // }
    }
};
