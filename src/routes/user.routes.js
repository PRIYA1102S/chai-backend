import { Router } from "express";
import { registerUser, testEndpoint ,  loginUser, 
    logoutUser, refreshAccessToken} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middlewares.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

router.route("/test").get(testEndpoint)

// Test route to check if multer is working
router.route("/test-upload").post(upload.fields([
    {
        name: "avatar",
        maxCount: 1
    },
    {
        name: "coverImage",
        maxCount: 1
    }
]), (req, res) => {
    console.log("Test upload - Files:", req.files);
    console.log("Test upload - Body:", req.body);
    res.json({
        success: true,
        files: req.files,
        body: req.body
    });
});

router.route("/register").post(upload.fields([
    {
        name:"avatar",
        maxCount: 1
    },
    {
        name:"coverImage",
        maxCount: 1
    }
]),registerUser)

router.route("/login").post(loginUser)

//secured routes
router.route("/logout").post(verifyJWT,  logoutUser)

router.route("/refresh-token").post(refreshAccessToken)

export default router