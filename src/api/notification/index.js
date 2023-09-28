const express = require('express');
const { authorizationService } = require("../../services");
const { saveNotification, deleteNotification, getNotification, getNotifications } = require("./notification-controller");
const router = express.Router();

router.post("/", authorizationService.authenticateUser, saveNotification);
router.get("/", authorizationService.authenticateUser, getNotifications);
router.get("/:id", authorizationService.authenticateUser, getNotification);
router.delete("/:id", authorizationService.authenticateUser, deleteNotification);

module.exports = router;
