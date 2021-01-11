import { bgYellow, bgRed, bgGreen, bgBlue } from "chalk";
export default class Logger {
    private log(m) {
        const date = 
        console.log(m)
    }

    public warn(input: any) {
        return this.log(bgYellow(input))
    }
    public error(input: any) {
        return this.log(bgRed(input))
    }

}