const express = require('express');
const { authorizationService } = require("../../services");
const { signUpWithOTP, loginUserWithOTP, loginUserWithPassword, completeProfile, changePassword, getJWT, getUserProfile, deleteUserProfile, toggleSMS } = require("./user-controller");
const router = express.Router();

router.post("/signup/otp", signUpWithOTP);

router.post("/login/otp", loginUserWithOTP);
router.post("/login/password", loginUserWithPassword);

router.get("/profile", authorizationService.authenticateUser, getUserProfile);
router.post("/profile/complete", authorizationService.authenticateUser, completeProfile);
router.delete("/profile", authorizationService.authenticateUser, deleteUserProfile);

router.post("/password/change", authorizationService.authenticateUser, changePassword);
router.post("/oauth", getJWT);

router.get("/notification/toggle", authorizationService.authenticateUser, toggleSMS);

module.exports = router;
