import { Router } from "express";
import { registerUser, testEndpoint } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middlewares.js";

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

export default router