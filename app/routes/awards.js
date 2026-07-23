// routes/awards.js
const express = require('express');
const Award = require('../app/models/Award');
const UserAward = require('../app/models/UserAward');

const router = express.Router();

/**
 * POST /awards
 * Create a preset award
 */
router.post('/awards', async (req, res) => {
  try {
    const { key, name, description, imageUrl, rarity } = req.body;

    const award = await Award.create({
      key,
      name,
      description,
      imageUrl,
      rarity
    });

    res.status(201).json(award);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


/**
 * GET /awards
 * List all preset awards
 */
router.get('/awards', async (req, res) => {
  try {
    const awards = await Award.find({});
    res.json(awards);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /awards/:key
 * Get single preset award by key
 */
router.get('/awards/:key', async (req, res) => {
  try {
    const award = await Award.findOne({ key: req.params.key });
    if (!award) return res.status(404).json({ error: 'Award not found' });
    res.json(award);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /users/:userId/awards/:key
 * Give an award to a user
 */
router.post('/users/:userId/awards/:key', async (req, res) => {
  try {
    const { userId, key } = req.params;

    const award = await Award.findOne({ key });
    if (!award) return res.status(404).json({ error: 'Award not found' });

    const existing = await UserAward.findOne({ userId, awardKey: key });
    if (existing) return res.status(409).json({ error: 'Award already collected' });

    const userAward = await UserAward.create({ userId, awardKey: key });
    res.status(201).json({ userAward, award });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * GET /users/:userId/awards
 * Get all awards collected by a user (with images + rarity)
 */
router.get('/users/:userId/awards', async (req, res) => {
  try {
    const { userId } = req.params;

    const userAwards = await UserAward.find({ userId });
    const awardKeys = userAwards.map(a => a.awardKey);

    const awards = await Award.find({ key: { $in: awardKeys } });

    const result = userAwards.map(ua => {
      const award = awards.find(a => a.key === ua.awardKey);
      return {
        userId: ua.userId,
        awardKey: ua.awardKey,
        collectedAt: ua.collectedAt,
        name: award?.name,
        description: award?.description,
        imageUrl: award?.imageUrl,
        rarity: award?.rarity
      };
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
/**
 * DELETE /awards/:key
 * Delete a preset award entirely
 */
router.delete('/awards/:key', async (req, res) => {
  try {
    const { key } = req.params;

    const award = await Award.findOneAndDelete({ key });
    if (!award) return res.status(404).json({ error: 'Award not found' });

    // Also remove this award from all users
    await UserAward.deleteMany({ awardKey: key });

    res.json({ deleted: true, key });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * DELETE /users/:userId/awards/:key
 * Remove a specific award from a user
 */
router.delete('/users/:userId/awards/:key', async (req, res) => {
  try {
    const { userId, key } = req.params;

    const removed = await UserAward.findOneAndDelete({ userId, awardKey: key });
    if (!removed) return res.status(404).json({ error: 'User does not have this award' });

    res.json({ removed: true, userId, key });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * DELETE /users/:userId/awards
 * Remove all awards collected by a user
 */
router.delete('/users/:userId/awards', async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await UserAward.deleteMany({ userId });
    res.json({ removedCount: result.deletedCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
