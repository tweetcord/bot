import { bgYellow, bgRed, bgGreen, bgBlue } from "chalk";
export default class Logger {
    private log(m) {
        const date = new Date(Date.now()).toLocaleString("az-AZ", {
            timeZone: "Asia/Baku",
            hour12: true,
        })
        console.log(`${date} ${m}`)
    }

    public info(input: any) {
  return this.log(input)
    }

    public warn(input: any) {
        return this.log(bgYellow(input))
    }
    public error(input: any) {
        return this.log(bgRed(input))
    }

}