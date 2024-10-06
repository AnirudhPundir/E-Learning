import dotenv from "dotenv";
import connectDb from "./db/index.js";
import app from "./app.js";

dotenv.config("path: ./env");

connectDb().then((res) => {
    app.on("error", error => {console.log(`ERR ERR ${error}`); throw error;});

    app.listen(process.env.PORT || 3000, () => {
        console.log(`Process started at PORT : ${process.env.PORT}`);
    });
}).catch((err) => console.log(`\n MONGODB connection err ${err}`));
