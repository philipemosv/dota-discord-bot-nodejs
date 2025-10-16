import { MessageFlags, SlashCommandBuilder } from "discord.js";
import axios from "axios";

export default {
    data: new SlashCommandBuilder()
        .setName("wl")
        .setDescription("View win/loss stats")
        .addIntegerOption(opt =>
            opt
                .setName("period")
                .setDescription("Days to look back")
                .setRequired(true)
                .addChoices(
                    { name: "Today", value: 0 },
                    { name: "7 days", value: 7 },
                    { name: "15 days", value: 15 },
                    { name: "30 days", value: 30 }
                )
        ),

    async execute(interaction: any) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const days = interaction.options.getInteger("period") ?? 0;
        const discordId = interaction.user.id;

        try {
            const token = process.env.INTERNAL_API_TOKEN;

            const userRes = await axios.get(`${process.env.API_URL}/players/${discordId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const user = userRes.data;
            if (!user?.steamId) {
                return interaction.editReply(
                    "**User not linked!**\nUse `/link` command to link your account"
                );
            }

            const statsRes = await axios.get(`${process.env.API_URL}/players/${user.steamId}/stats/winrate`, {
                headers: { Authorization: `Bearer ${token}` },
                params: { days },
            });

            const { wins, losses, winRate } = statsRes.data.stats;
            const period = days === 0 ? "Today" : days === 1 ? "1 day" : `${days} days`;

            const message = [
                '\u200B',
                `📅 **Period:** ${period}`,
                `✅ **Wins:** ${wins}`,
                `❌ **Losses:** ${losses}`,
                `🏆 **Win Rate:** ${winRate}%`
            ].join('\n');

            await interaction.editReply(message);
        } catch (err: any) {
            if (err.response?.status === 404) {
                await interaction.editReply(
                    "**User not linked!**\nUse `/link` command to link your account"
                );
            } else {
                console.error(err);
                await interaction.editReply("Failed to get stats from API.");
            }
        }
    },
};