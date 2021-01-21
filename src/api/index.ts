import express, { Request, Response } from "express";
import morgan from "morgan";

const app = express()
app.use(morgan(':method :url :status :res[content-length] - :response-time ms'))
app.listen(8080, () => console.log("Started api in 8080"))


app.post("/vote", (req: Request, res: Response) => {
    console.log("asd")
    return console.log(req.body)
})

