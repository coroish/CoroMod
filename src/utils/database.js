const fs = require('fs');
const path = require('path');

// Path to the JSON database file
const dbPath = path.join(__dirname, '..', '..', 'data', 'database.json');

// Ensure data directory exists
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Load or initialize database
function loadDatabase() {
    try {
        if (fs.existsSync(dbPath)) {
            const data = fs.readFileSync(dbPath, 'utf8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.error('Error loading database:', error);
    }
    return {
        warnings: [],
        guildSettings: {},
        modActions: []
    };
}

// Save database
function saveDatabase(data) {
    try {
        fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error saving database:', error);
    }
}

// Initialize database
let db = loadDatabase();
console.log('✅ Database initialized');

// Warning functions
function addWarning(guildId, userId, moderatorId, reason) {
    const warning = {
        id: db.warnings.length + 1,
        guild_id: guildId,
        user_id: userId,
        moderator_id: moderatorId,
        reason: reason,
        created_at: new Date().toISOString()
    };
    db.warnings.push(warning);
    saveDatabase(db);
    return warning;
}

function getWarnings(guildId, userId) {
    return db.warnings
        .filter(w => w.guild_id === guildId && w.user_id === userId)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

function clearWarnings(guildId, userId) {
    const before = db.warnings.length;
    db.warnings = db.warnings.filter(w => !(w.guild_id === guildId && w.user_id === userId));
    saveDatabase(db);
    return { changes: before - db.warnings.length };
}

function removeWarning(warningId) {
    const before = db.warnings.length;
    db.warnings = db.warnings.filter(w => w.id !== warningId);
    saveDatabase(db);
    return { changes: before - db.warnings.length };
}

// Guild settings functions
function getGuildSettings(guildId) {
    return db.guildSettings[guildId] || null;
}

function setGuildSettings(guildId, settings) {
    if (!db.guildSettings[guildId]) {
        db.guildSettings[guildId] = {};
    }
    Object.assign(db.guildSettings[guildId], settings);
    saveDatabase(db);
    return db.guildSettings[guildId];
}

// Mod action logging
function logModAction(guildId, actionType, targetUserId, moderatorId, reason, duration = null) {
    const action = {
        id: db.modActions.length + 1,
        guild_id: guildId,
        action_type: actionType,
        target_user_id: targetUserId,
        moderator_id: moderatorId,
        reason: reason,
        duration: duration,
        created_at: new Date().toISOString()
    };
    db.modActions.push(action);
    saveDatabase(db);
    return action;
}

function getModActions(guildId, targetUserId = null, limit = 10) {
    let actions = db.modActions.filter(a => a.guild_id === guildId);

    if (targetUserId) {
        actions = actions.filter(a => a.target_user_id === targetUserId);
    }

    return actions
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, limit);
}

module.exports = {
    addWarning,
    getWarnings,
    clearWarnings,
    removeWarning,
    getGuildSettings,
    setGuildSettings,
    logModAction,
    getModActions
};
