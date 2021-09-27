import { REST } from '@discordjs/rest';
import { Routes, RESTPostAPIApplicationCommandsJSONBody } from 'discord-api-types/v9';
import { readdirSync } from 'fs';
import { join, resolve } from "path";
import Command from "./components/Command";

const getCommands = async () => {
    const folder = resolve("dist/src/commands")
    const commands = readdirSync(folder).filter(c => c.endsWith(".js"))
    let commandList: RESTPostAPIApplicationCommandsJSONBody[] = []
    for (const command of commands) {
        const commandFile = await import(join(folder, command))
        const cmd: Command = new commandFile.default()
        //@ts-ignore
        commands.push(cmd.data().toJSON())
    }
    return commandList
}


const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
    const commands = await getCommands()
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