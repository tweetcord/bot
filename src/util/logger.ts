import { Logger } from "tslog";

const logger = new Logger({
    colorizePrettyLogs: true,
    dateTimeTimezone: "Asia/Baku",
    dateTimePattern: "day-month-year hour:minute:second.millisecond",
    exposeErrorCodeFrame: true,
    
})

export const baseLogger = logger;