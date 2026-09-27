import express from "express";
import "dotenv/config";
import bookRouter from "./routes/bookRoutes.js";

const app = express();
const port = Number(process.env.PORT) || 4200;
const host = process.env.HOST || "http://localhost";

app.use(express.json());
// Файлы из public доступны напрямую, например /covers/hobbit.svg.
app.use(express.static("public"));
app.use("/books", bookRouter);

app.use((req, res) => {
  res.status(404).json({ message: "Маршрут не найден" });
});

app.listen(port, () => {
  console.log(`Server started: ${host}:${port}`);
});
