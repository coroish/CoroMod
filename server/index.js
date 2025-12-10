const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
// Ensure fetch is available in older Node versions
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Proxy Embed Action to Bot
app.post('/api/actions/embed/:guildId', async (req, res) => {
    const { guildId } = req.params;
    const { channelId, embed } = req.body;

    if (!channelId || !embed) {
        return res.status(400).json({ success: false, error: 'Missing channelId or embed data' });
    }

    try {
        const response = await fetch('http://localhost:3000/api/embed', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ guildId, channelId, embed })
        });

        if (response.ok) {
            res.json({ success: true });
        } else {
            const err = await response.json().catch(() => ({}));
            res.status(500).json({ success: false, error: err.error || 'Bot failed to send embed' });
        }
    } catch (error) {
        console.error('Failed to proxy to bot:', error);
        res.status(500).json({ success: false, error: 'Bot is offline or unreachable' });
    }
});

// Data file path
const DATA_FILE = path.join(__dirname, 'server-configs.json');

// Initialize data file if it doesn't exist
if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({}, null, 2));
}

// Helper to read configs
const readConfigs = () => {
    try {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return {};
    }
};

// Helper to write configs
const writeConfigs = (configs) => {
    fs.writeFileSync(DATA_FILE, JSON.stringify(configs, null, 2));
};

// Metadata file path
const METADATA_FILE = path.join(__dirname, 'server-data.json');

// Initialize metadata file if it doesn't exist
if (!fs.existsSync(METADATA_FILE)) {
    fs.writeFileSync(METADATA_FILE, JSON.stringify({}, null, 2));
}

// Helper to read metadata
const readMetadata = () => {
    try {
        const data = fs.readFileSync(METADATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return {};
    }
};

// Helper to write metadata
const writeMetadata = (data) => {
    fs.writeFileSync(METADATA_FILE, JSON.stringify(data, null, 2));
};

// ==========================================
// IN-MEMORY STORE FOR STATS
// ==========================================
// serverStats: Map<guildId, { 
//    counters: { bans: 0, kicks: 0, messagesDeleted: 0, warnings: 0 },
//    logs: [ { action: 'Ban', user: 'User#123', reason: 'Spam', time: '...' } ] 
// }>
const serverStats = new Map();

// ==========================================
// API ENDPOINTS
// ==========================================

// ... (Existing Config Endpoints) ...

// POST /api/stats/:guildId - Bot sends stats/logs updates
app.post('/api/stats/:guildId', (req, res) => {
    const { guildId } = req.params;
    const { counters, logEntry } = req.body;

    let stats = serverStats.get(guildId) || {
        counters: { bans: 0, kicks: 0, messagesDeleted: 0, warnings: 0 },
        logs: []
    };

    // Update counters if provided
    if (counters) {
        stats.counters = { ...stats.counters, ...counters };
    }

    // Add log entry if provided
    if (logEntry) {
        stats.logs.unshift(logEntry); // Add to beginning
        if (stats.logs.length > 50) stats.logs.pop(); // Keep last 50
    }

    serverStats.set(guildId, stats);
    res.json({ success: true });
});

// GET /api/stats/:guildId - Dashboard fetches stats
app.get('/api/stats/:guildId', (req, res) => {
    const { guildId } = req.params;
    const stats = serverStats.get(guildId) || {
        counters: { bans: 0, kicks: 0, messagesDeleted: 0, warnings: 0 },
        logs: []
    };
    res.json({ success: true, stats });
});

// ... (Existing Metadata Endpoints) ...

// GET /api/config/:guildId - Get config for a specific server
app.get('/api/config/:guildId', (req, res) => {
    const { guildId } = req.params;
    const configs = readConfigs();

    if (configs[guildId]) {
        res.json({ success: true, config: configs[guildId] });
    } else {
        // Return default config if none exists
        res.json({
            success: true,
            config: {
                guildId: guildId,
                modRole: null,
                muteRole: null,
                modLogChannel: null,
                messageLogChannel: null,
                antiSpam: false,
                badWordsFilter: false,
                linkProtection: false,
                badWordsList: [],
                allowedLinks: [],
                commands: {},
                createdAt: new Date().toISOString()
            }
        });
    }
});

// POST /api/config/:guildId - Save config for a specific server
app.post('/api/config/:guildId', (req, res) => {
    const { guildId } = req.params;
    const newConfig = req.body;

    const configs = readConfigs();

    configs[guildId] = {
        ...configs[guildId],
        ...newConfig,
        guildId: guildId,
        updatedAt: new Date().toISOString()
    };

    writeConfigs(configs);

    console.log(`[API] Config updated for guild ${guildId}`);
    res.json({ success: true, config: configs[guildId] });
});

// GET /api/configs - Get all configs (for bot to read on startup)
app.get('/api/configs', (req, res) => {
    const configs = readConfigs();
    res.json({ success: true, configs });
});

// POST /api/data/:guildId - Bot sends guild metadata (channels, roles)
app.post('/api/data/:guildId', (req, res) => {
    const { guildId } = req.params;
    const { channels, roles } = req.body;

    if (!channels || !roles) {
        return res.status(400).json({ success: false, error: 'Missing data' });
    }

    const metadata = readMetadata();
    metadata[guildId] = {
        channels,
        roles,
        updatedAt: new Date().toISOString()
    };

    writeMetadata(metadata);

    console.log(`[API] Received metadata for guild ${guildId}: ${channels.length} channels, ${roles.length} roles`);
    res.json({ success: true });
});

// GET /api/data/:guildId - Dashboard fetches guild metadata
app.get('/api/data/:guildId', (req, res) => {
    const { guildId } = req.params;
    const metadata = readMetadata();
    const data = metadata[guildId];

    if (data) {
        res.json({ success: true, data });
    } else {
        res.status(404).json({ success: false, error: 'Data not found' });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════╗
║       CoroMod API Server Running!          ║
╠════════════════════════════════════════════╣
║  Local:   http://localhost:${PORT}             ║
║  API:     http://localhost:${PORT}/api         ║
╚════════════════════════════════════════════╝
    `);
});
