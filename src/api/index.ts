import express, { Request, Response } from "express";
import morgan from "morgan";
import * as config from "../Config"


const app = express()
app.use(morgan(':method :url :status :res[content-length] - :response-time ms'))
app.listen(8080, () => console.log("Started api in 8080"))


app.post("/vote", (req: Request, res: Response) => {
    if (!req.headers.authorization || req.headers.authorization !== config.dbl_webhook_token) {
        return res.status(401);
    }
    // const body = JSON.parse(req.body)
    console.log(req)
    return res.status(200)
})

