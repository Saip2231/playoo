import "dotenv/config";
import express from "express";
import matchLogRoutes from "./routes/matchLog.js";

const app = express();
app.use(express.json());

app.use("/api", matchLogRoutes);

app.get("/", (req, res) => {
  res.send("Backend is running");
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
