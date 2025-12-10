document.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // GET SERVER ID FROM URL
    // ==========================================
    const urlParams = new URLSearchParams(window.location.search);
    const serverId = urlParams.get('id');

    if (!serverId) {
        window.location.href = 'dashboard.html';
        return;
    }

    // ==========================================
    // ELEMENT SELECTION
    // ==========================================
    const userAvatarImg = document.getElementById('server-user-avatar');
    const userNameSpan = document.getElementById('server-user-name');
    const serverIcon = document.getElementById('server-icon');
    const serverName = document.getElementById('server-name');
    const serverIdDisplay = document.getElementById('server-id-display');
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');

    // Config Elements
    const modRoleSelect = document.getElementById('mod-role');
    const muteRoleSelect = document.getElementById('mute-role');
    const modLogSelect = document.getElementById('mod-log');
    const messageLogSelect = document.getElementById('message-log');
    const embedChannelSelect = document.getElementById('embed-channel');
    const antiSpamToggle = document.getElementById('anti-spam');
    const badWordsToggle = document.getElementById('bad-words');
    const linkProtectionToggle = document.getElementById('link-protection');
    const saveStatus = document.getElementById('save-status');
    const commandListContainer = document.getElementById('command-list');

    // ==========================================
    // API CONFIGURATION
    // ==========================================
    // Support file://, localhost, and LAN IP
    const hostname = window.location.hostname || 'localhost';
    const API_BASE_URL = `http://${hostname}:3001`;

    // ==========================================
    // LOCAL STORAGE HELPERS
    // ==========================================
    const getStoredToken = () => {
        return {
            accessToken: localStorage.getItem('discord_access_token'),
            tokenType: localStorage.getItem('discord_token_type')
        };
    };

    const getSetupServers = () => {
        const stored = localStorage.getItem('coromod_setup_servers');
        return stored ? JSON.parse(stored) : [];
    };

    // Get config for this server (try API first, fallback to localStorage)
    const getServerConfig = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/config/${serverId}`);
            if (response.ok) {
                const data = await response.json();
                if (data.success && data.config) {
                    localStorage.setItem(`coromod_config_${serverId}`, JSON.stringify(data.config));
                    return data.config;
                }
            }
        } catch (error) {
            console.warn('API unavailable, using localStorage fallback:', error.message);
        }

        const key = `coromod_config_${serverId}`;
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : {
            antiSpam: false,
            badWordsFilter: false,
            linkProtection: false,
            badWordsList: [],
            allowedLinks: [],
            modRole: '',
            muteRole: '',
            modLogChannel: '',
            messageLogChannel: '',
            commands: {}
        };
    };

    // Save config for this server
    const saveServerConfig = async (config) => {
        const key = `coromod_config_${serverId}`;
        localStorage.setItem(key, JSON.stringify(config));

        try {
            const response = await fetch(`${API_BASE_URL}/api/config/${serverId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(config)
            });

            if (response.ok) {
                showSaveStatus('✓ Settings saved & synced!', 'success');
            } else {
                showSaveStatus('✓ Saved locally (API sync failed)', 'warning');
            }
        } catch (error) {
            showSaveStatus('✓ Saved locally (API offline)', 'warning');
        }
    };

    // ==========================================
    // COMMAND MANAGEMENT
    // ==========================================
    const AVAILABLE_COMMANDS = [
        { name: 'ban', desc: 'Ban a user from the server' },
        { name: 'kick', desc: 'Kick a user from the server' },
        { name: 'mute', desc: 'Timeout/mute a user' },
        { name: 'unmute', desc: 'Remove timeout from a user' },
        { name: 'warn', desc: 'Warn a user' },
        { name: 'clear', desc: 'Delete messages in bulk' },
        { name: 'slowmode', desc: 'Set channel slowmode' },
        { name: 'lock', desc: 'Lock a channel' },
        { name: 'unlock', desc: 'Unlock a channel' },
        { name: 'automod', desc: 'Configure automod settings' },
        { name: 'settings', desc: 'View bot settings' },
        { name: 'help', desc: 'View help menu' },
        { name: 'ping', desc: 'Check bot latency' },
        { name: 'serverinfo', desc: 'View server information' },
        { name: 'userinfo', desc: 'View user information' }
    ];

    const renderCommands = (configCommands = {}) => {
        if (!commandListContainer) return;

        commandListContainer.innerHTML = '';

        AVAILABLE_COMMANDS.forEach(cmd => {
            const cmdConfig = configCommands[cmd.name] || { enabled: true, alias: '' };
            const isEnabled = cmdConfig.enabled !== false;
            const alias = cmdConfig.alias || '';

            const item = document.createElement('div');
            item.className = 'command-item';
            item.innerHTML = `
                <div class="command-info">
                    <span class="command-name">/${cmd.name}</span>
                    <span class="command-desc">${cmd.desc}</span>
                </div>
                <div class="command-actions">
                    <input type="text" class="alias-input" placeholder="Alias (optional)" 
                           value="${alias}" data-cmd="${cmd.name}">
                    <label class="toggle">
                        <input type="checkbox" class="command-toggle" 
                               ${isEnabled ? 'checked' : ''} data-cmd="${cmd.name}">
                        <span class="toggle-slider"></span>
                    </label>
                </div>
            `;
            commandListContainer.appendChild(item);
        });

        document.querySelectorAll('.command-toggle').forEach(toggle => {
            toggle.addEventListener('change', saveConfigFromUI);
        });

        document.querySelectorAll('.alias-input').forEach(input => {
            input.addEventListener('change', saveConfigFromUI);
        });
    };

    // ==========================================
    // METADATA & DROPDOWNS
    // ==========================================
    let latestMetadata = null;

    const fetchServerMetadata = async (force = false) => {
        const key = `coromod_metadata_${serverId}`;

        try {
            // Add timestamp to prevent caching
            const response = await fetch(`${API_BASE_URL}/api/data/${serverId}?_=${new Date().getTime()}`, {
                cache: 'no-store'
            });
            if (response.ok) {
                const data = await response.json();
                if (data.data) {
                    // Update cache
                    localStorage.setItem(key, JSON.stringify(data.data));
                    latestMetadata = data.data;
                    return data.data;
                }
            }
        } catch (e) {
            console.error('Failed to fetch metadata from API:', e);
        }

        // Fallback to local storage (unless force refresh)
        if (!force) {
            const stored = localStorage.getItem(key);
            if (stored) {
                console.log('Using cached metadata from localStorage');
                latestMetadata = JSON.parse(stored);
                return latestMetadata;
            }
        }

        return null;
    };

    const populateDropdowns = (metadata, config) => {
        if (!metadata) return;

        const populate = (select, items, selectedId) => {
            if (!select) return;
            while (select.options.length > 1) select.remove(1);
            items.forEach(item => {
                const option = document.createElement('option');
                option.value = item.id;
                option.textContent = item.name;
                if (item.id === selectedId) option.selected = true;
                select.appendChild(option);
            });
        };

        populate(modRoleSelect, metadata.roles, config.modRole);
        populate(muteRoleSelect, metadata.roles, config.muteRole);
        populate(modLogSelect, metadata.channels, config.modLogChannel);
        populate(messageLogSelect, metadata.channels, config.messageLogChannel);
        // embedChannelSelect is now handled by custom logic in loadConfigToUI
    };

    // ==========================================
    // EMBED BUILDER
    // ==========================================
    const setupEmbedBuilder = () => {
        const titleInput = document.getElementById('embed-title');
        const descInput = document.getElementById('embed-desc');
        const colorInput = document.getElementById('embed-color');
        const imageInput = document.getElementById('embed-image');
        const footerInput = document.getElementById('embed-footer');

        const previewTitle = document.getElementById('preview-title');
        const previewDesc = document.getElementById('preview-desc');
        const previewColor = document.getElementById('preview-color');
        const previewImage = document.getElementById('preview-image');
        const previewFooter = document.getElementById('preview-footer');

        if (!titleInput) return;

        titleInput.addEventListener('input', (e) => {
            previewTitle.textContent = e.target.value || 'Embed Title';
        });

        descInput.addEventListener('input', (e) => {
            previewDesc.textContent = e.target.value || 'Embed description will appear here...';
        });

        colorInput.addEventListener('input', (e) => {
            previewColor.style.backgroundColor = e.target.value;
        });

        imageInput.addEventListener('input', (e) => {
            if (e.target.value) {
                previewImage.src = e.target.value;
                previewImage.classList.remove('hidden');
            } else {
                previewImage.classList.add('hidden');
            }
        });

        footerInput.addEventListener('input', (e) => {
            previewFooter.textContent = e.target.value;
        });

        // Send Button Logic
        const sendBtn = document.getElementById('send-embed-btn');
        if (sendBtn) {
            sendBtn.addEventListener('click', async () => {
                const channelSelect = document.getElementById('embed-channel');
                const channelId = channelSelect.value;

                if (!channelId) {
                    alert('Please select a channel first!');
                    return;
                }

                sendBtn.disabled = true;
                sendBtn.textContent = 'Sending...';

                // Construct Embed Object
                const embed = {
                    title: titleInput.value || null,
                    description: descInput.value || null,
                    color: colorInput.value ? parseInt(colorInput.value.replace('#', ''), 16) : null,
                    image: imageInput.value ? { url: imageInput.value } : null,
                    footer: footerInput.value ? { text: footerInput.value } : null
                };

                try {
                    const res = await fetch(`${API_BASE_URL}/api/actions/embed/${serverId}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ channelId, embed })
                    });

                    if (res.ok) {
                        alert('Embed sent successfully!');
                        // Optional: Clear form
                    } else {
                        const err = await res.json().catch(() => ({}));
                        alert('Failed to send: ' + (err.error || 'Unknown error'));
                    }
                } catch (e) {
                    console.error('Embed send error:', e);
                    alert('Failed to connect to dashboard API.');
                } finally {
                    sendBtn.disabled = false;
                    sendBtn.textContent = 'Send Embed';
                }
            });
        }
    };

    // ==========================================
    // STATS
    // ==========================================
    const updateStats = async () => {
        const bansEl = document.getElementById('stat-bans');
        const kicksEl = document.getElementById('stat-kicks');
        const deletedEl = document.getElementById('stat-deleted');
        const warningsEl = document.getElementById('stat-warnings');
        const tableBody = document.getElementById('activity-log-body');

        if (!bansEl) return;

        try {
            const response = await fetch(`${API_BASE_URL}/api/stats/${serverId}`);
            if (response.ok) {
                const { stats } = await response.json();

                if (stats.counters) {
                    bansEl.textContent = stats.counters.bans || 0;
                    kicksEl.textContent = stats.counters.kicks || 0;
                    if (deletedEl) deletedEl.textContent = stats.counters.messagesDeleted || 0;
                    if (warningsEl) warningsEl.textContent = stats.counters.warnings || 0;
                }

                if (stats.logs && stats.logs.length > 0 && tableBody) {
                    tableBody.innerHTML = stats.logs.map(log => `
                        <tr>
                            <td><span class="badgish badgish-${log.action.toLowerCase()}">${log.action}</span></td>
                            <td>${log.user}</td>
                            <td>${log.reason}</td>
                            <td>${log.time}</td>
                        </tr>
                    `).join('');
                }
            }
        } catch (e) {
            console.error('Failed to fetch stats:', e);
        }
    };

    // ==========================================
    // LOAD & SAVE
    // ==========================================
    const loadConfigToUI = async () => {
        const [config, metadata] = await Promise.all([
            getServerConfig(),
            fetchServerMetadata()
        ]);

        if (antiSpamToggle) antiSpamToggle.checked = config.antiSpam || false;
        if (badWordsToggle) badWordsToggle.checked = config.badWordsFilter || false;
        if (linkProtectionToggle) linkProtectionToggle.checked = config.linkProtection || false;

        const blockedWordsArea = document.getElementById('blocked-words-list');
        const allowedLinksArea = document.getElementById('allowed-links-list');

        if (blockedWordsArea) blockedWordsArea.value = (config.badWordsList || []).join(', ');
        if (allowedLinksArea) allowedLinksArea.value = (config.allowedLinks || []).join(', ');

        if (metadata) {
            populateDropdowns(metadata, config);
            latestMetadata = metadata;
        } else {
            if (modRoleSelect) modRoleSelect.value = config.modRole || '';
            if (muteRoleSelect) muteRoleSelect.value = config.muteRole || '';
            if (modLogSelect) modLogSelect.value = config.modLogChannel || '';
            if (messageLogSelect) messageLogSelect.value = config.messageLogChannel || '';
        }

        // Custom Channel Dropdown Logic (Always Initialize)
        const channelWrapper = document.getElementById('embed-channel-wrapper');
        const channelTrigger = document.getElementById('embed-channel-trigger');
        const channelOptions = document.getElementById('embed-channel-options');
        const channelInput = document.getElementById('embed-channel');
        const selectedName = document.getElementById('selected-channel-name'); // Will be re-selected after clone

        if (channelWrapper && channelTrigger && channelOptions) {
            // Remove old listener to prevent duplicates
            const newTrigger = channelTrigger.cloneNode(true);
            channelTrigger.parentNode.replaceChild(newTrigger, channelTrigger);
            const activeTrigger = newTrigger;

            // Re-select select content inside the new element
            const activeSelectedName = activeTrigger.querySelector('#selected-channel-name');

            activeTrigger.onclick = (e) => {
                e.stopPropagation();
                channelOptions.classList.toggle('open');
                activeTrigger.classList.toggle('active');
            };

            // Close when clicking outside
            document.addEventListener('click', (e) => {
                if (!channelWrapper.contains(e.target)) {
                    channelOptions.classList.remove('open');
                    activeTrigger.classList.remove('active');
                }
            });

            // Populate Options
            channelOptions.innerHTML = '';

            if (metadata && metadata.channels && metadata.channels.length > 0) {
                // Add "Select Channel" default
                const defaultOption = document.createElement('div');
                defaultOption.className = 'custom-option selected';
                defaultOption.innerHTML = `<span class="hash">#</span> Select Channel`;
                defaultOption.onclick = () => {
                    channelInput.value = '';
                    activeSelectedName.textContent = '# Select Channel';
                    activeSelectedName.style.color = 'var(--text-secondary)';
                    channelOptions.classList.remove('open');
                    activeTrigger.classList.remove('active');
                    document.querySelectorAll('.custom-option').forEach(opt => opt.classList.remove('selected'));
                    defaultOption.classList.add('selected');
                };
                channelOptions.appendChild(defaultOption);

                metadata.channels.forEach(ch => {
                    const opt = document.createElement('div');
                    opt.className = 'custom-option';
                    opt.innerHTML = `<span class="hash">#</span> ${ch.name}`;
                    opt.onclick = () => {
                        channelInput.value = ch.id;
                        activeSelectedName.textContent = `# ${ch.name}`;
                        activeSelectedName.style.color = 'white';
                        channelOptions.classList.remove('open');
                        activeTrigger.classList.remove('active');
                        document.querySelectorAll('.custom-option').forEach(o => o.classList.remove('selected'));
                        opt.classList.add('selected');
                    };
                    channelOptions.appendChild(opt);
                });
            } else {
                channelOptions.innerHTML = '<div class="custom-option" style="cursor: default; color: var(--text-secondary);">No channels found</div>';
            }
        }

        renderCommands(config.commands);
        updateStats();
    };

    const saveConfigFromUI = () => {
        const commandsConfig = {};
        if (commandListContainer) {
            document.querySelectorAll('.command-item').forEach(item => {
                const toggle = item.querySelector('.command-toggle');
                const input = item.querySelector('.alias-input');
                const cmdName = toggle.dataset.cmd;
                commandsConfig[cmdName] = {
                    enabled: toggle.checked, // Explicitly save true/false
                    alias: input.value.trim()
                };
            });
        }

        const blockedWordsArea = document.getElementById('blocked-words-list');
        const allowedLinksArea = document.getElementById('allowed-links-list');
        const getList = (area) => area ? area.value.split(',').map(s => s.trim()).filter(Boolean) : [];

        const config = {
            antiSpam: antiSpamToggle?.checked || false,
            badWordsFilter: badWordsToggle?.checked || false,
            linkProtection: linkProtectionToggle?.checked || false,
            badWordsList: getList(blockedWordsArea),
            allowedLinks: getList(allowedLinksArea),
            modRole: modRoleSelect?.value || '',
            muteRole: muteRoleSelect?.value || '',
            modLogChannel: modLogSelect?.value || '',
            messageLogChannel: messageLogSelect?.value || '',
            commands: commandsConfig,
            updatedAt: new Date().toISOString()
        };
        saveServerConfig(config);
    };

    const showSaveStatus = (message, type) => {
        if (saveStatus) {
            saveStatus.textContent = message;
            saveStatus.className = `save-status ${type}`;
            saveStatus.style.display = 'inline-block';
            setTimeout(() => { saveStatus.style.display = 'none'; }, 2000);
        }
    };

    // ==========================================
    // INIT
    // ==========================================
    const init = async () => {
        const { accessToken, tokenType } = getStoredToken();
        if (!accessToken) {
            window.location.href = 'index.html';
            return;
        }

        try {
            const response = await fetch('https://discord.com/api/users/@me', {
                headers: { authorization: `${tokenType} ${accessToken}` }
            });
            if (response.ok) {
                const user = await response.json();
                if (userNameSpan) userNameSpan.textContent = user.username;
                if (userAvatarImg) {
                    userAvatarImg.src = user.avatar
                        ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`
                        : `https://cdn.discordapp.com/embed/avatars/0.png`;
                }
            }
        } catch (e) {
            console.error('Failed to load user:', e);
        }

        const servers = getSetupServers();
        const server = servers.find(s => s.id === serverId);

        if (server) {
            if (serverName) serverName.textContent = server.name;
            if (serverIdDisplay) serverIdDisplay.textContent = server.id;
            if (server.icon && serverIcon) {
                serverIcon.src = `https://cdn.discordapp.com/icons/${server.id}/${server.icon}.png`;
            } else if (serverIcon) {
                serverIcon.style.display = 'none';
                const placeholder = document.createElement('div');
                placeholder.className = 'server-dash-icon no-icon';
                placeholder.textContent = server.name.substring(0, 2).toUpperCase();
                serverIcon.parentNode.insertBefore(placeholder, serverIcon);
            }
            document.title = `${server.name} - CoroMod Dashboard`;
        } else {
            if (serverName) serverName.textContent = 'Server';
            if (serverIdDisplay) serverIdDisplay.textContent = serverId;
        }

        await loadConfigToUI();
        setupEmbedBuilder();
        setInterval(updateStats, 30000);
    };

    // ==========================================
    // EVENT LISTENERS
    // ==========================================
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.dataset.tab;
            tabButtons.forEach(b => b.classList.remove('active'));
            tabPanes.forEach(p => p.classList.remove('active'));
            btn.classList.add('active');
            const targetPane = document.getElementById(tabId);
            if (targetPane) targetPane.classList.add('active');
        });
    });

    if (antiSpamToggle) antiSpamToggle.addEventListener('change', saveConfigFromUI);
    if (badWordsToggle) badWordsToggle.addEventListener('change', saveConfigFromUI);
    if (linkProtectionToggle) linkProtectionToggle.addEventListener('change', saveConfigFromUI);
    if (modRoleSelect) modRoleSelect.addEventListener('change', saveConfigFromUI);
    if (muteRoleSelect) muteRoleSelect.addEventListener('change', saveConfigFromUI);
    if (modLogSelect) modLogSelect.addEventListener('change', saveConfigFromUI);
    if (messageLogSelect) messageLogSelect.addEventListener('change', saveConfigFromUI);
    document.getElementById('blocked-words-list')?.addEventListener('change', saveConfigFromUI);
    document.getElementById('allowed-links-list')?.addEventListener('change', saveConfigFromUI);

    // Allow manual refresh of channels/roles dropdown
    const refreshBtn = document.getElementById('refresh-channels-btn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', async () => {
            refreshBtn.disabled = true;
            refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Refreshing...';
            const freshMeta = await fetchServerMetadata(true);
            if (freshMeta) {
                populateDropdowns(freshMeta, await getServerConfig());
                // Re-run custom channel rebuild to reflect new options
                loadConfigToUI();
            } else {
                alert('No metadata found. Make sure your bot has called POST /api/data/:guildId');
            }
            refreshBtn.disabled = false;
            refreshBtn.innerHTML = '<i class="fas fa-rotate-right"></i> Refresh';
        });
    }

    init();
});
