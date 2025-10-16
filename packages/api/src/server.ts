import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import { connectDB } from "@dota/common/src/db";
import linkRouter from "./routes/link";
import playersRouter from "./routes/players";
import healthRouter from "./routes/health";

dotenv.config({ path: "../../.env" });

const app = express();

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

app.use("/link", linkRouter);
app.use("/players", playersRouter);
app.use("/health", healthRouter);

const PORT = process.env.PORT || 3000;

(async () => {
  try {
    await connectDB(process.env.MONGO_URI!);
    app.listen(PORT, () => console.log(`API running on port ${PORT}`));
  } catch (err) {
    console.error("Failed to start API:", err);
  }
})();