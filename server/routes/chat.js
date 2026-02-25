import express from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

import User from "../models/User.js";
import Message from "../models/Message.js";
import Conversation from "../models/Conversation.js";

const router = express.Router();


// 🔐 Protect Middleware
const protect = async (req, res, next) => {
  try {

    const token = req.headers.authorization?.split(" ")[1];

    if (!token)
      return res.status(401).json({ message: "No token" });

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    req.user = await User.findById(decoded.id);

    next();

  } catch (err) {
    res.status(401).json({ message: "Not authorized" });
  }
};


// ✅ GET USERS
router.get("/users", protect, async (req, res) => {

  const users = await User.find({
    _id: { $ne: req.user._id },
  }).select("-password");

  res.json(users);

});


// ✅ CREATE OR GET CONVERSATION (FINAL FIX)
router.post("/conversation", protect, async (req, res) => {

  try {

    const senderId = req.user._id.toString();
    const receiverId = req.body.receiverId;

    // ✅ SORT IDS (IMPORTANT)
    const chatKey = [senderId, receiverId]
      .sort()
      .join("_");

    // ✅ FIND BY UNIQUE KEY
    let conversation =
      await Conversation.findOne({
        chatKey,
      });

    if (!conversation) {

      conversation =
        await Conversation.create({
          participants: [
            senderId,
            receiverId,
          ],
          chatKey,
        });

      console.log("✅ Created New Chat");

    } else {

      console.log("✅ Existing Chat Used");

    }

    res.json(conversation);

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: error.message,
    });

  }

});

// ✅ GET MESSAGES
router.get(
  "/messages/:conversationId",
  protect,
  async (req, res) => {

    const messages =
      await Message.find({
        conversationId:
          req.params.conversationId,
      }).sort({ createdAt: 1 });

    res.json(messages);

  }
);

export default router;