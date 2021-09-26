import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import { readdirSync } from 'fs';
import { join, resolve } from "path";
import Command from "./components/Command";

const commands = readdirSync(resolve("dist/commands")).filter(a => a.endsWith(".js")).forEach(async c => {
    let m = await import(join(resolve("dist/commands"), c));
    const cmdClass = Object.values(m).find(
        (d: any) => d.prototype instanceof Command
    ) as any;
    const cmd: Command = new cmdClass()
    return cmd.data().toJSON()
})

const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
    try {
        await rest.put(
            // @ts-ignore
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.DEV_SERVER),
            { body: commands },
        );

        console.log('Successfully registered application commands.');
    } catch (error) {
        console.error(error);
    }
})();