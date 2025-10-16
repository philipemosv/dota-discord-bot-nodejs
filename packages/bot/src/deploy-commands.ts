import dotenv from 'dotenv';
import { REST, Routes } from 'discord.js';
import path from 'path';
import fs from 'fs';

dotenv.config({ path: "../../.env" });

const commands: any[] = [];

const commandsPath = path.resolve(__dirname, 'commands');
if (!fs.existsSync(commandsPath)) {
    console.error('Commands folder not found at', commandsPath);
    process.exit(1);
}

const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith('.ts') || f.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(path.join(commandsPath, file)).default;
    commands.push(command.data.toJSON());
}

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN!);

(async () => {
    try {
        console.log(`Started refreshing ${commands.length} application (/) commands`);
        await rest.put(
            Routes.applicationGuildCommands(
                process.env.CLIENT_ID!,
                process.env.GUILD_ID!
            ),
            { body: commands }
        );
        console.log('Successfully reloaded application (/) commands');
    } catch (error) {
        console.error(error);
    }
})();
