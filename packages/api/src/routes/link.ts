import { Router } from 'express';
import { User } from '@dota/common/src/models/User';
import { authenticate } from '../middleware/auth';

const router = Router();

// POST /link
router.post('/', authenticate, async (req, res) => {
    const { discordId, steamId } = req.body;
    if (!discordId || !steamId) 
        return res.status(400).json({ error: 'Missing discorId or dotaAccountId' });

    try {
        const user = await User.findOneAndUpdate(
            { discordId },
            { discordId, steamId },
            { upsert: true, new: true }
        );
        res.json({ success: true, user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to link account' });
    }
});

export default router;