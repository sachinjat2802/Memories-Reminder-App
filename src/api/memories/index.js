const express = require('express');
const { authorizationService } = require("../../services");
const { createMemory, updateMemory, getAllMemories, getAMemory, getAllMemoriesSorted, searchMemory, getTagsSuggestion } = require("./memory-controller");
const router = express.Router();

router.get("/", authorizationService.authenticateUser, getAllMemories);
router.get("/:id", authorizationService.authenticateUser, getAMemory);
router.get("/tag/:name", authorizationService.authenticateUser, getTagsSuggestion);
router.get("/sort/:sortBy", authorizationService.authenticateUser, getAllMemoriesSorted);
router.get("/search/:searchText", authorizationService.authenticateUser, searchMemory);
router.post("/create", authorizationService.authenticateUser, createMemory);
router.post("/update", authorizationService.authenticateUser, updateMemory);

module.exports = router;
