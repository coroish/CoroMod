document.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // CONFIGURATION
    // ==========================================
    const CLIENT_ID = '1446188622771519722';
    const REDIRECT_URI = window.location.origin + window.location.pathname;

    // ==========================================
    // ELEMENT SELECTION
    // ==========================================
    const loginBtn = document.getElementById('discord-login-btn');
    const loggedOutView = document.getElementById('logged-out-view');
    const loggedInView = document.getElementById('logged-in-view'); // Now will contain Dashboard Link
    const userNameSpan = document.getElementById('user-name');
    const userAvatarImg = document.getElementById('user-avatar');
    const menuToggle = document.getElementById('menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    // ==========================================
    // INITIAL CHECKS
    // ==========================================
    if (window.location.protocol === 'file:') {
        alert("⚠️ LOGIN WILL NOT WORK FROM A FILE PATH!\nPlease use a local server like 'Live Server'.");
    }

    // ==========================================
    // NAVIGATION LOGIC
    // ==========================================
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            const isFlex = navLinks.style.display === 'flex';
            navLinks.style.display = isFlex ? 'none' : 'flex';
            if (!isFlex) {
                navLinks.style.flexDirection = 'column';
                navLinks.style.position = 'absolute';
                navLinks.style.top = '70px';
                navLinks.style.left = '0';
                navLinks.style.width = '100%';
                navLinks.style.background = '#141419';
                navLinks.style.padding = '1rem';
                navLinks.style.borderBottom = '1px solid #27272a';
            }
        });
    }

    // ==========================================
    // AUTHENTICATION LOGIC
    // ==========================================

    if (loginBtn) {
        loginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const params = new URLSearchParams({
                client_id: CLIENT_ID,
                redirect_uri: REDIRECT_URI,
                response_type: 'token',
                scope: 'identify guilds'
            });
            window.location.href = `https://discord.com/oauth2/authorize?${params.toString()}`;
        });
    }

    // Handle Auth Redirect (Landing from Discord)
    const handleAuthRedirect = async () => {
        const fragment = new URLSearchParams(window.location.hash.slice(1));
        const accessToken = fragment.get('access_token');
        const tokenType = fragment.get('token_type');

        if (accessToken) {
            // 1. FRESH LOGIN -> Save & Redirect to Dashboard
            console.log("Fresh login detected. Redirecting to Dashboard...");
            localStorage.setItem('discord_access_token', accessToken);
            localStorage.setItem('discord_token_type', tokenType);

            // Clean URL
            window.history.replaceState({}, document.title, window.location.pathname);

            // Redirect
            window.location.href = 'dashboard.html';
        } else {
            // 2. EXISTING SESSION -> Check if logged in
            const savedToken = localStorage.getItem('discord_access_token');
            const savedTokenType = localStorage.getItem('discord_token_type');

            if (savedToken) {
                await fetchDiscordUser(savedTokenType, savedToken);
            }
        }
    };

    const fetchDiscordUser = async (tokenType, accessToken) => {
        try {
            const response = await fetch('https://discord.com/api/users/@me', {
                headers: { authorization: `${tokenType} ${accessToken}` },
            });

            if (response.ok) {
                const user = await response.json();
                updateUI(user);
            } else {
                localStorage.removeItem('discord_access_token'); // Token dead
            }
        } catch (error) {
            console.error('Error fetching user:', error);
        }
    };

    const updateUI = (user) => {
        if (!loggedOutView || !loggedInView) return;

        // Show Logged In State
        loggedOutView.classList.add('hidden');
        loggedInView.classList.remove('hidden');

        // Update user info
        if (userNameSpan) userNameSpan.textContent = user.username;
        if (userAvatarImg) {
            userAvatarImg.src = user.avatar
                ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`
                : `https://cdn.discordapp.com/embed/avatars/${parseInt(user.discriminator || 0) % 5}.png`;
        }

        // Make the profile clickable to go to dashboard
        loggedInView.onclick = () => {
            window.location.href = 'dashboard.html';
        };
        loggedInView.style.cursor = 'pointer';

        // Add "Go to Dashboard" tooltip or text if needed, 
        // but replacing the whole view with a clickable profile is a common pattern.
    };

    handleAuthRedirect();
});
