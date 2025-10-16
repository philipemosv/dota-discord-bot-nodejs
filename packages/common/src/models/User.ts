import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  discordId: string;
  steamId?: string;
}

const userSchema = new Schema<IUser>({
  discordId: { type: String, required: true, unique: true },
  steamId: { type: String }
});

export const User = mongoose.model<IUser>("User", userSchema);