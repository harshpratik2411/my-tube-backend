import mongoose from "mongoose";
import { DB_NAME } from "./constants.js"; 








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