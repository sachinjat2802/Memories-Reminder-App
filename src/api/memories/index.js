const express = require('express');
const { createMemory, updateMemory, getAllMemories, getAMemory } = require("./memory-controller");
const { authorizationService } = require("../../services");
const router = express.Router();

router.get("/", authorizationService.authenticateUser, getAllMemories);
router.get("/:id", authorizationService.authenticateUser, getAMemory);
router.post("/create", authorizationService.authenticateUser, createMemory);
router.post("/update", authorizationService.authenticateUser, updateMemory);

module.exports = router;
