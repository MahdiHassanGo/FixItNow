import express, { Application } from 'express';

const app: Application = express();

app.get("/",(req: express.Request, res: express.Response)=>{
    res.send("Hello World");
});     



export default app;