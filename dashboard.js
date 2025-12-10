document.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // CONFIGURATION
    // ==========================================
    const CLIENT_ID = '1446188622771519722';

    // ==========================================
    // ELEMENT SELECTION
    // ==========================================
    const userAvatarImg = document.getElementById('dash-user-avatar');
    const userNameSpan = document.getElementById('dash-user-name');
    const logoutBtn = document.getElementById('dash-logout-btn');

    const loadingState = document.getElementById('loading-servers');
    const errorContainer = document.getElementById('error-container');
    const errorMessage = document.getElementById('error-message');
    const serverGrid = document.getElementById('server-grid');

    // ==========================================
    // HELPER FUNCTIONS
    // ==========================================
    const getStoredToken = () => {
        const accessToken = localStorage.getItem('discord_access_token');
        const tokenType = localStorage.getItem('discord_token_type');
        return { accessToken, tokenType };
    };

    const logout = () => {
        localStorage.removeItem('discord_access_token');
        localStorage.removeItem('discord_token_type');
        window.location.href = 'index.html';
    };

    // Get list of setup servers from localStorage
    const getSetupServers = () => {
        const stored = localStorage.getItem('coromod_setup_servers');
        return stored ? JSON.parse(stored) : [];
    };

    // Mark a server as setup
    const markServerAsSetup = (guildId, guildName, guildIcon) => {
        const servers = getSetupServers();
        if (!servers.find(s => s.id === guildId)) {
            servers.push({ id: guildId, name: guildName, icon: guildIcon });
            localStorage.setItem('coromod_setup_servers', JSON.stringify(servers));
        }
    };

    // Check if server is setup
    const isServerSetup = (guildId) => {
        const servers = getSetupServers();
        return servers.some(s => s.id === guildId);
    };

    // ==========================================
    // MAIN LOGIC
    // ==========================================

    const initDashboard = async () => {
        const { accessToken, tokenType } = getStoredToken();

        if (!accessToken) {
            window.location.href = 'index.html';
            return;
        }

        try {
            const user = await fetchUserProfile(tokenType, accessToken);
            updateUserProfile(user);

            const guilds = await fetchUserGuilds(tokenType, accessToken);

            const adminGuilds = guilds.filter(guild => {
                const perms = BigInt(guild.permissions);
                const manageGuild = BigInt(0x20);
                const administrator = BigInt(0x8);
                return (perms & manageGuild) === manageGuild || (perms & administrator) === administrator;
            });

            renderGuilds(adminGuilds);

        } catch (error) {
            console.error(error);
            showError("Failed to load your servers. Please try logging in again.");
            if (error.message.includes('401')) {
                logout();
            }
        }
    };

    // ==========================================
    // API CALLS
    // ==========================================

    const fetchUserProfile = async (tokenType, accessToken) => {
        const response = await fetch('https://discord.com/api/users/@me', {
            headers: { authorization: `${tokenType} ${accessToken}` }
        });
        if (!response.ok) throw new Error(`Profile Error: ${response.status}`);
        return await response.json();
    };

    const fetchUserGuilds = async (tokenType, accessToken) => {
        const response = await fetch('https://discord.com/api/users/@me/guilds', {
            headers: { authorization: `${tokenType} ${accessToken}` }
        });
        if (!response.ok) throw new Error(`Guilds Error: ${response.status}`);
        return await response.json();
    };

    // ==========================================
    // UI UPDATES
    // ==========================================

    const updateUserProfile = (user) => {
        userNameSpan.textContent = user.username;
        if (user.avatar) {
            userAvatarImg.src = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`;
        } else {
            userAvatarImg.src = `https://cdn.discordapp.com/embed/avatars/${parseInt(user.discriminator || 0) % 5}.png`;
        }
    };

    const renderGuilds = (guilds) => {
        loadingState.classList.add('hidden');

        if (guilds.length === 0) {
            showError("You don't have 'Manage Server' permissions on any server.");
            return;
        }

        serverGrid.classList.remove('hidden');
        serverGrid.innerHTML = '';

        guilds.forEach(guild => {
            const card = document.createElement('div');
            card.className = 'server-card';

            const iconSrc = guild.icon
                ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`
                : null;

            const isSetup = isServerSetup(guild.id);
            const inviteLink = `https://discord.com/oauth2/authorize?client_id=${CLIENT_ID}&permissions=8&scope=bot%20applications.commands&guild_id=${guild.id}&disable_guild_select=true`;

            card.innerHTML = `
                <div class="server-header">
                    <div class="server-icon-wrapper">
                        ${iconSrc
                    ? `<img src="${iconSrc}" class="server-icon" alt="${guild.name}">`
                    : `<div class="server-icon no-icon">${guild.name.substring(0, 2).toUpperCase()}</div>`
                }
                    </div>
                </div>
                <div class="server-card-body">
                    <div class="server-name">${guild.name}</div>
                    <div class="server-badge ${isSetup ? 'configured' : 'new'}">
                        ${isSetup ? '<i class="fas fa-check-circle"></i> Configured' : '<i class="fas fa-star"></i> Not Setup'}
                    </div>
                    <div class="server-actions">
                        ${isSetup ? `
                            <a href="server.html?id=${guild.id}" class="btn-setup manage">
                                <i class="fas fa-cog"></i> Manage Server
                            </a>
                        ` : `
                            <button class="btn-setup invite setup-btn" 
                                    data-guild-id="${guild.id}" 
                                    data-guild-name="${guild.name}"
                                    data-guild-icon="${guild.icon || ''}"
                                    data-invite-link="${inviteLink}">
                                <i class="fas fa-plus"></i> Setup CoroMod
                            </button>
                        `}
                    </div>
                </div>
            `;
            serverGrid.appendChild(card);
        });

        // Add event listeners to setup buttons
        document.querySelectorAll('.setup-btn').forEach(btn => {
            btn.addEventListener('click', handleSetupClick);
        });
    };

    // Handle Setup Button Click
    const handleSetupClick = (e) => {
        const btn = e.currentTarget;
        const guildId = btn.dataset.guildId;
        const guildName = btn.dataset.guildName;
        const guildIcon = btn.dataset.guildIcon;
        const inviteLink = btn.dataset.inviteLink;

        // Open the invite link in a new window
        window.open(inviteLink, 'discord-auth', 'width=500,height=800');

        // Mark as setup and update UI
        markServerAsSetup(guildId, guildName, guildIcon);

        // Update the card UI
        const cardBody = btn.closest('.server-card-body');

        // Update badge
        const badge = cardBody.querySelector('.server-badge');
        if (badge) {
            badge.className = 'server-badge configured';
            badge.innerHTML = '<i class="fas fa-check-circle"></i> Configured';
        }

        // Update button
        const actionsDiv = cardBody.querySelector('.server-actions');
        if (actionsDiv) {
            actionsDiv.innerHTML = `
                <a href="server.html?id=${guildId}" class="btn-setup manage">
                    <i class="fas fa-cog"></i> Manage Server
                </a>
            `;
        }
    };

    const showError = (msg) => {
        loadingState.classList.add('hidden');
        serverGrid.classList.add('hidden');
        errorContainer.classList.remove('hidden');
        errorMessage.textContent = msg;
    };

    // ==========================================
    // EVENTS
    // ==========================================
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });
    }

    // Start
    initDashboard();
});
