const express = require('express');
const { authorizationService } = require("../../services");
const { signUpWithOTP, signUpWithPassword, loginUserWithOTP, loginUserWithPassword, completeProfile, changePassword, getJWT, getUserProfile, deleteUserProfile } = require("./user-controller");
const router = express.Router();

router.post("/signup/password", signUpWithPassword);
router.post("/signup/otp", signUpWithOTP);

router.post("/login/otp", loginUserWithOTP);
router.post("/login/password", loginUserWithPassword);

router.get("/profile", authorizationService.authenticateUser, getUserProfile);
router.post("/profile/complete", authorizationService.authenticateUser, completeProfile);
router.delete("/profile", authorizationService.authenticateUser, deleteUserProfile);

router.post("/password/change", authorizationService.authenticateUser, changePassword);
router.post("/oauth", authorizationService.authenticateUser, getJWT);

module.exports = router;
