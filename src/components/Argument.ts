import { Client, Message } from "discord.js";
import { isValidUsername } from "twitter-text";
import { Lexer, Parser, prefixedStrategy, Args } from "lexure"


export default class ArgumentParser {
    message: Message;
    bot: Client
    constructor(message: Message, bot: Client) {
        this.message = message;
        this.bot = bot
    }

    public parse() {
        const lexer = new Lexer(this.message.content)
            .setQuotes([
                ['"', '"'],
                ['“', '”'],
                ["「", "」"]
            ]);

        const lout = lexer.lexCommand(s => s.startsWith('tw') ? 2 : null);
        if (lout == null) {
            return null;
        }

        const [command, getTokens] = lout;
        const tokens = getTokens();
        const parser = new Parser(tokens).setUnorderedStrategy(
            prefixedStrategy(
                ['--', '-', '—'],
                ['=', ':']
            ));

        const pout = parser.parse();
        return [command.value, new Args(pout)];
    }
}