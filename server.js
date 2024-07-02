import mongoose from "mongoose";
import app from "./app.js";

const { DB_HOST, PORT } = process.env;

mongoose.connect(DB_HOST, { dbName: 'platzbase' })
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server started on port: ${PORT}`);
            console.log("Database connection successful");
        });
    })
    .catch(error => {
        console.log("Database connection error:", error.message);
        process.exit(1);
    });




// import mongoose from "mongoose";
// import app from "./app.js"

// mongoose.Promise = global.Promise;

// const { DB_HOST } = process.env;
// const { PORT } = process.env;

// mongoose.connect(DB_HOST)
//     .then(() => {
//         app.listen(PORT);
//         console.log(`Server started on port: ${PORT}`);
//         console.log("Database connection successful");
//     })
//     .catch(error => {
//         console.log("Database connection error:", error.message);
//         process.exit(1);
//     });

    