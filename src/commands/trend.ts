import { Message } from "discord.js";
import { Args } from "lexure";
import { Tweetcord } from "../components/Client";
import { Command } from "../components/Command";
import {  } from "twitter-woeid"
export default class Ping extends Command {
    public constructor(client: Tweetcord) {
        super(client, {
            triggers: ["trend", "popular"],
            description: {
                text: "Trends"
            }
        })
    }
    public async execute(message: Message, args: Args): Promise<void | Message> {
        
    }

}