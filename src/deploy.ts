import { ApplicationCommandData } from "discord.js";
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';

const commands: ApplicationCommandData[] = [
    {
        "name": "info",
        "description": "Show information about bot"
    },
    {
        "name": "eval",
        "description": "Evaluates code",
        "options": [
            {
                "type": 3,
                "name": "code",
                "description": "Code to evaluate",
                "required": true,
                "choices": []
            }
        ]
    }
];

const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
    try {
        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.DEV_SERVER),
            { body: commands },
        );

        console.log('Successfully registered application commands.');
    } catch (error) {
        console.error(error);
    }
})();