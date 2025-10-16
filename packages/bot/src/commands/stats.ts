import { EmbedBuilder, MessageFlags, SlashCommandBuilder } from 'discord.js';
import axios from 'axios';
import { StatsResponse } from '@dota/common/src/types';

export default {
    data: new SlashCommandBuilder()
        .setName('stats')
        .setDescription('View detailed hero win/loss stats')
        .addIntegerOption(opt =>
            opt
                .setName('period')
                .setDescription('Days to look back')
                .setRequired(true)
                .addChoices(
                    { name: 'Today', value: 0 },
                    { name: '7 days', value: 7 },
                    { name: '15 days', value: 15 },
                    { name: '30 days', value: 30 }
                )
        ),

    async execute(interaction: any) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const days = interaction.options.getInteger('period') ?? 0;
        const discordId = interaction.user.id;

        try {
            const token = process.env.INTERNAL_API_TOKEN;

            const userRes = await axios.get(`${process.env.API_URL}/players/${discordId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const user = userRes.data;
            if (!user || !user.steamId) {
                return interaction.editReply(
                    '**User not linked!**\nUse `/link` command to link your account'
                );
            }

            const res = await axios.get<StatsResponse>(
                `${process.env.API_URL}/players/${user.steamId}/stats/winrate/heroes?days=${days}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const { stats } = res.data;
            const period = days === 0 ? 'Today' : `${days} days`;

            const sortedHeroes = Object.entries(stats)
                .sort(([, a], [, b]) => (b.totalMatches || 0) - (a.totalMatches || 0))
                .slice(0, 10);

            if (sortedHeroes.length === 0) {
                return interaction.editReply(`No hero stats found for this period (${period}).`);
            }

            const header = `| Hero                 | TM | W  | L  |    WR    |`;
            const divider = `|----------------------|----|----|----|----------|`;

            const rows = sortedHeroes.map(([hero, data]) => {
                const { totalMatches = 0, wins = 0, losses = 0, winrate = 0 } = data;
                return `| ${hero.padEnd(20).slice(0, 20)} | ${String(totalMatches).padStart(2)} | ${String(wins).padStart(2)} | ${String(losses).padStart(2)} | ${winrate.toFixed(1).padStart(7)}% |`;
            });

            const table = [header, divider, ...rows].join('\n');

            const embed = new EmbedBuilder()
                .setColor(0x2ecc71)
                .setTitle(`🏆 Dota 2 Hero Stats (${period})`)
                .setDescription(
                    [
                        `**Top ${sortedHeroes.length} heroes by matches**`,
                        '```',
                        table,
                        '```'
                    ].join('\n')
                )
                .setFooter({
                    text: 'Tip: Use /wl to check overall win/loss'
                })
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });
        } catch (err: any) {
            if (err.response?.status === 404) {
                return interaction.editReply(
                    '**User not linked!**\nUse `/link` command to link your account'
                );
            }
            console.error(err);
            await interaction.editReply('Failed to get hero stats.');
        }
    },
};
