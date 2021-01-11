import Event from "../components/Event";

export default class Ready extends Event {
    constructor(client) {
        super(client, {
            name: "ready",
            type: "on"
        })
    }
    public run(): void {
        return console.log("Bot is online");
    }
}