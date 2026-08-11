import app from "./app.js";

import dotenv from "dotenv";
import connectDB from "./db/index.js";

dotenv.config({
 path: new URL('../.env', import.meta.url).pathname
}); 

connectDB()
.then(() => {
    app.listen(process.env.PORT || 4000, () => {
        console.log(`Server is running on port ${process.env.PORT || 4000}`);
    });
})
.catch((error) => {
    console.log("Error connecting to MongoDB:", error); 
})





// import express from "express";

// const express = require("express"); 


// ( async ()=> {
//     try {
//    await  mongoose.connection(`${process.env.MONDODB_URI}/${DB_NAME}`)
//     app.on("error",(error)=>
//     {
//         console.error("Error connecting to MongoDB:", error);
//         throw error;
//     }) 
//        app.listen(process.env.PORT,()=> {
//         log(`Server is running on port ${process.env.PORT}`);
//        })
//     } catch (error) {
//         console.error("Error connecting to MongoDB:", error);
//     }
// })