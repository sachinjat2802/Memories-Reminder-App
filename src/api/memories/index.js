const express = require('express');
const { createMemory, getAllMemories } = require("./memory-controller");
const { authorizationService } = require("../../services");
const router = express.Router();

router.get("/", authorizationService.authenticateUser, getAllMemories);
router.post("/create", authorizationService.authenticateUser, createMemory);

module.exports = router;
