import express, { Request, Response } from "express";
import morgan from "morgan";
import bodyparser from "body-parser"
import * as config from "../Config"


const app = express()
app.use(morgan(':method :url :status :res[content-length] - :response-time ms'))

app.use(bodyparser.json())
app.listen(8080, () => console.log("Started api in 8080"))


app.post("/vote", (req: Request, res: Response) => {
    if (!req.headers.authorization || req.headers.authorization !== config.dbl_webhook_token) {
        return res.status(401);
    }
    
    console.log(req.body)
    
    return res.status(200)
})

