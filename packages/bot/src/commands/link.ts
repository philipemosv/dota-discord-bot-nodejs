import { MessageFlags, SlashCommandBuilder } from "discord.js";
import { LinkResponse } from "@dota/common/src/types";
import axios from "axios";

export default {
    data: new SlashCommandBuilder()
        .setName('link')
        .setDescription('Link your Dota account')
        .addStringOption(opt => 
            opt.setName('steam_id')
            .setDescription('Your steam account ID')
            .setRequired(true)
        ),
    async execute(interaction: any) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const steamId = interaction.options.getString('steam_id');
        const discordId = interaction.user.id;

        try {
            const token = process.env.INTERNAL_API_TOKEN;
            
            const res = await axios.post<LinkResponse>(
                `${process.env.API_URL}/link`,
                { discordId, steamId },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (res.data.success) {
                await interaction.editReply(`Linked to Dota account ${steamId}`);
            } else {
                await interaction.editReply('Failed to link account.');
            }
        } catch (err: any) {
            console.error(err.message);
            await interaction.editReply('Error linking account.');
        }
    }
};