import mongoose from "mongoose";
import * as dotenv from "dotenv";
import {job} from "./scraper/index.js";
dotenv.config();

//TODO to separate config.js + config validation
const mongoURI = process.env.MONGO_URI || "mongodb://localhost:27017/mydatabase";

mongoose.connect(mongoURI).then(async () => {
    const db = mongoose.connection;
    db.on("error", (e) => console.error("MongoDB connection error:", e));
    db.once("open", () => {
        console.log("Connected to MongoDB");
    });

    job().catch(e => console.error(e));
    setInterval(() => {
        job.catch(e => console.error(e))
    }, 1000*60*4); //4min //TODO to config file
});
