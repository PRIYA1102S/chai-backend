import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express ()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({limit: "16kb"}))                           //parses json data for incoming requests
app.use(express.urlencoded({extended: true,limit: "16kb"}))     //parses form data
app.use(express.static("public"))                               //files sucha s image etc willl store in this folder
app.use(cookieParser())



//routes imports
import userRouter from './routes/user.routes.js';

app.use("/api/v1/users",userRouter);

export default app;