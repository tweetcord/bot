import { bgBlue, bgRed } from "chalk";
import { LoggerOptions } from "./Types";

const now = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "numeric",
    timeZone: "UTC",
    hour: "numeric",
    minute: "numeric",
    second: "numeric"
})
function log(options: LoggerOptions) {
    return console.log(`[${now}]`, options.title, options.text)
}

export function info(title: string, text: string): void {
    return log({ title: bgBlue(title), text })
}

export function error(title: string, text: string): void {
    return log({ title: bgRed(title), text })
}