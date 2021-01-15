import { Client } from "discord.js";
import Event from "../components/Event";

export default class Ready extends Event {
    constructor(client: Client) {
        super(client, {
            name: "ready",
            type: "on"
        })
    }
    public run(): void {
        return console.log("Bot is online");
    }
}