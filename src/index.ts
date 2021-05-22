import { SlashCreator, GatewayServer } from 'slash-create';
import Discord from 'discord.js-light';
const client = new Discord.Client();
import path from 'path';
const creator = new SlashCreator({
    applicationID: '696101246045519882',
    publicKey: 'e523d746fa9b3317ba7f5e0fbd37885dff130d0628327b27cd1da5cae64b5f3b',
    token: 'Njk2MTAxMjQ2MDQ1NTE5ODgy.Xoj0zQ.iP2MpAqmIGC_QlIjuxEz56OwoCU',
});

creator.withServer(new GatewayServer((handler) =>
    client.on('interactionCreate', handler)))
    .registerCommandsIn(path.join(__dirname, 'commands'))
    .syncCommands();

client.login('Njk2MTAxMjQ2MDQ1NTE5ODgy.Xoj0zQ.iP2MpAqmIGC_QlIjuxEz56OwoCU')