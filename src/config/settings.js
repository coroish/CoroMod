// Bot configuration settings
module.exports = {
    // Default embed color (Discord blue)
    embedColor: 0x5865F2,

    // Success color (green)
    successColor: 0x57F287,

    // Error color (red)
    errorColor: 0xED4245,

    // Warning color (yellow)
    warningColor: 0xFEE75C,

    // Default automod settings
    automod: {
        enabled: true,
        antiSpam: {
            enabled: true,
            maxMessages: 5,
            interval: 5000, // 5 seconds
            action: 'timeout', // 'warn', 'timeout', 'kick', 'ban'
            timeoutDuration: 60000 // 1 minute
        },
        badWords: {
            enabled: true,
            words: ['spam', 'scam'], // Add more as needed
            action: 'delete' // 'delete', 'warn', 'timeout'
        },
        antiLinks: {
            enabled: false,
            whitelistedDomains: ['discord.gg', 'youtube.com', 'twitch.tv'],
            action: 'delete'
        },
        antiRaid: {
            enabled: true,
            maxJoins: 10,
            interval: 10000, // 10 seconds
            action: 'lockdown'
        }
    },

    // Logging settings
    logging: {
        enabled: true,
        logChannelName: 'mod-logs', // Channel name to send logs to
        events: {
            memberJoin: true,
            memberLeave: true,
            messageDelete: true,
            messageEdit: true,
            modActions: true,
            voiceActivity: false
        }
    },

    // Permission levels
    permissionLevels: {
        user: 0,
        moderator: 1,
        admin: 2,
        owner: 3
    }
};
