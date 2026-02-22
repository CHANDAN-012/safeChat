import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";

const router = express.Router();

// STEP 4️⃣ Start or get conversation
router.post("/conversation", authMiddleware, async (req, res) => {
  try {
    const { userId } = req.body;

    let conversation = await Conversation.findOne({
      members: { $all: [req.user._id, userId] }
    });

    if (!conversation) {
      conversation = await Conversation.create({
        members: [req.user._id, userId]
      });
    }

    res.json(conversation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// STEP 5️⃣ Send message
router.post("/message", authMiddleware, async (req, res) => {
  try {
    const { conversationId, text } = req.body;

    const message = await Message.create({
      conversationId,
      sender: req.user._id,
      text
    });

    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: text
    });

    res.json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// STEP 6️⃣ Get messages
router.get("/message/:conversationId", authMiddleware, async (req, res) => {
  try {
    const messages = await Message.find({
      conversationId: req.params.conversationId
    }).populate("sender", "name");

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
