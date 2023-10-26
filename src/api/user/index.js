const express = require('express');
const { authorizationService } = require("../../services");
const { getNotificationSettings, updateNotificationSettings, toggleSMS, addTittleFilter, addTagFilter, addImageFilter, deleteTittleFilter, deleteTagFilter, deleteImageFilter } = require("./notification-controller");
const { signUpWithOTP, loginUserWithOTP, loginUserWithPassword, completeProfile, changePassword, getJWT, getUserProfile, deleteUserProfile,updateToken } = require("./user-controller");
const router = express.Router();

router.post("/signup/otp", signUpWithOTP);

router.post("/login/otp", loginUserWithOTP);
router.post("/login/password", loginUserWithPassword);

router.get("/profile", authorizationService.authenticateUser, getUserProfile);
router.post("/profile/complete", authorizationService.authenticateUser, completeProfile);
router.delete("/profile", authorizationService.authenticateUser, deleteUserProfile);

router.post("/password/change", authorizationService.authenticateUser, changePassword);

router.post("/oauth", getJWT);

router.patch("/updateToken",authorizationService.authenticateUser,updateToken)

router.get("/notification", authorizationService.authenticateUser, getNotificationSettings);
router.post("/notification", authorizationService.authenticateUser, updateNotificationSettings);
router.get("/notification/toggle", authorizationService.authenticateUser, toggleSMS);
router.post("/notification/tittle", authorizationService.authenticateUser, addTittleFilter);
router.post("/notification/tag", authorizationService.authenticateUser, addTagFilter);
router.post("/notification/image", authorizationService.authenticateUser, addImageFilter);
router.delete("/notification/tittle", authorizationService.authenticateUser, deleteTittleFilter);
router.delete("/notification/tag", authorizationService.authenticateUser, deleteTagFilter);
router.delete("/notification/image", authorizationService.authenticateUser, deleteImageFilter);


module.exports = router;
