import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(cors({origin: process.env.CORS_ORIGIN}));

app.use(express.json({limit: "16kb"}));
app.use(express.urlencoded({extended: true, limit: "16kb"}));
app.use(express.static("public"));
app.use(cookieParser());

import adminRouter from "./routes/adminRoutes/admin.routes.js";
import userRouter from "./routes/userRoutes/user.routes.js";
import courseRouter from "./routes/adminRoutes/course.routes.js";
import sectionRouter from "./routes/adminRoutes/section.routes.js";
import mcqRouter from "./routes/mcq.routes.js";
import vdoRouter from "./routes/videoLecture.routes.js";
import fileUploadRouter from "./routes/adminRoutes/fileUpload.routes.js";

app.use(process.env.ADMIN_APP_BASE_URL, adminRouter);

app.use(process.env.ADMIN_APP_BASE_URL, courseRouter);

app.use(process.env.ADMIN_APP_BASE_URL, mcqRouter);

app.use(process.env.ADMIN_APP_BASE_URL, sectionRouter);

app.use(process.env.ADMIN_APP_BASE_URL, vdoRouter);

app.use(process.env.ADMIN_APP_BASE_URL, fileUploadRouter);

app.use(process.env.USER_APP_BASE_URL, userRouter);


export default app;

