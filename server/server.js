import express from "express";
import cors from "cors";

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Bep Nha Server is running!");
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Server hoat dong binh thuong"
  });
});

app.listen(PORT, () => {
  console.log(`Server dang chay tai http://localhost:${PORT}`);
});