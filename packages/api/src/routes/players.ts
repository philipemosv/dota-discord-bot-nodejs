import { Router } from 'express';
import { User } from '@dota/common/src/models/User';
import { getPlayerWinLoss, getPlayerWinLossByHero } from '@dota/common/src/stratzClient';
import { authenticate } from '../middleware/auth';

const router = Router();

function parseDaysParam(value: any): number {
  const days = parseInt(value, 10);
  if (isNaN(days)) return 0;
  return Math.max(0, Math.min(days, 30));
}

router.get('/:discordId', authenticate, async (req, res) => {
    const { discordId } = req.params;

    try {
        const user = await User.findOne({ discordId });

        if (!user) {
            return res.status(404).json({ message: 'User not linked' });
        }

        return res.json({
            discordId: user.discordId,
            steamId: user.steamId,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

// GET /:steamId/stats/winrate?days={days}
router.get('/:steamId/stats/winrate', authenticate, async (req, res) => {
    try {
        const { steamId } = req.params; 
        const days = parseDaysParam(req.query.days);
        
        const stats = await getPlayerWinLoss(steamId, days);

        res.json({ 
            steamId: steamId,
            stats: stats
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch win/loss stats' });
    }
});

// GET /:steamId/stats/winrate/heroes?days={days}
router.get('/:steamId/stats/winrate/heroes', authenticate, async (req, res) => {
    try {
        const { steamId } = req.params; 
        const days = parseDaysParam(req.query.days);

        const stats = await getPlayerWinLossByHero(steamId, days);
        
        res.json({ 
            steamId: steamId,
            stats: stats
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch win/loss stats' });
    }
});

export default router;