import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(cors({origin: process.env.CORS_ORIGIN}));

app.use(express.json({limit: "16kb"}));
app.use(express.urlencoded({extended: true, limit: "16kb"}));
app.use(express.static("public"));
app.use(cookieParser());

import adminRouter from "./routes/admin.routes.js";

app.use(process.env.ADMIN_APP_BASE_URL, adminRouter);

export default app;

