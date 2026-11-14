
const express = require("express");

const router = express.Router();

const {
    createBookRequest,
    getMySentRequests,
    getReceivedRequests,
    updateRequestStatus,
    completeBookExchange
} = require("../controllers/bookRequest.controller");

const userAuth = require("../middlewares/auth.middleware");

// Send a book request
router.post("/", userAuth, createBookRequest);

// Get requests sent by logged-in user
router.get("/sent", userAuth, getMySentRequests);

// Get requests received by logged-in user
router.get("/received", userAuth, getReceivedRequests);

// Accept or reject a request
router.patch("/:id/status", userAuth, updateRequestStatus);

// Complete Book Exchange
router.patch(
    "/:id/complete",
    userAuth,
    completeBookExchange
);

module.exports = router;
