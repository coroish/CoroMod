require('dotenv').config();
const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

const commands = [];

// Load all commands
const commandsPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(commandsPath);

for (const folder of commandFolders) {
    const folderPath = path.join(commandsPath, folder);
    const stat = fs.statSync(folderPath);

    if (stat.isDirectory()) {
        const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));
        for (const file of commandFiles) {
            const filePath = path.join(folderPath, file);
            const command = require(filePath);
            if ('data' in command && 'execute' in command) {
                commands.push(command.data.toJSON());
                console.log(`📦 Loaded command: ${command.data.name}`);
            }
        }
    }
}

// Deploy commands
const rest = new REST().setToken(process.env.DISCORD_TOKEN);

(async () => {
    try {
        console.log(`\n🔄 Started refreshing ${commands.length} application (/) commands.\n`);

        let data;

        // If GUILD_ID is set, deploy to that guild (faster for testing)
        if (process.env.GUILD_ID) {
            console.log('📍 Deploying to guild:', process.env.GUILD_ID);
            data = await rest.put(
                Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
                { body: commands }
            );
        } else {
            // Deploy globally (takes up to 1 hour to propagate)
            console.log('🌍 Deploying globally (this may take up to 1 hour to propagate)');
            data = await rest.put(
                Routes.applicationCommands(process.env.CLIENT_ID),
                { body: commands }
            );
        }

        console.log(`\n✅ Successfully reloaded ${data.length} application (/) commands!`);

    } catch (error) {
        console.error('❌ Error deploying commands:', error);
    }
})();
