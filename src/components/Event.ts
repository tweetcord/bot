import { Client } from "discord.js";
import { EventOptions } from "./Types";
class Event {
    bot: Client;
    name: string
    type: string;
    constructor(client: Client, options: EventOptions) {
        this.bot = client
        this.name = options.name
        this.type = options.type
    };

    run(...args: any[]): any {
        return console.log("No run function for this event")
    }
};

export default Event;