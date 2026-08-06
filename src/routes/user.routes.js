import Router from "express";
import {registerUser} from "../controllers/users.controllers.js"


const router = Router();

router.route("/register").post(registerUser)
//router.route("/login").post(Login)


export default router;