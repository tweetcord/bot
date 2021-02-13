import express, { Request, Response } from "express";
import bodyparser from "body-parser"
import { TopGGVote } from "../components/Types";
import axios from "axios"

const app = express()
app.use(bodyparser.json())
app.listen(8080, () => console.log("Started api in 8080"))


app.post("/vote", (req: Request, res: Response) => {
    if (!req.headers.authorization || req.headers.authorization !== process.env.DBL_WEBHOOK_TOKEN) {
        return res.status(401);
    }
    
    const data: TopGGVote = req.body;


    axios({
        url: process.env.VOTE_WEBHOOK,
        method: "POST",
        data: {
            content: `<@${data.user}> (\`${data.user}\`) just voted.`,
            username: "top.gg",
            avatar_url: "https://cdn.discordapp.com/icons/264445053596991498/a_a8aec6ad1a286d0cfeae8845886dfe2a.png"
        }
    }).then(() => {
        return res.status(200)
    }).catch(err => {
        console.error(err)
        return res.status(500)
    })
})

