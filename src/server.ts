import express from "express";
import expressEjsLayouts from "express-ejs-layouts";
import path from "node:path";
import { fileURLToPath } from "node:url";
import "dotenv/config";
import bookRouter from "./routes/bookRoutes.js";

const app = express();
const port = Number(process.env.PORT) || 4200;
const host = process.env.HOST || "http://localhost";
const currentDirectory = path.dirname(fileURLToPath(import.meta.url));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(currentDirectory, "..", "public")));

app.set("views", path.join(currentDirectory, "..", "views"));
app.set("view engine", "ejs");
app.use(expressEjsLayouts);
app.set("layout", path.join(currentDirectory, "..", "views", "layouts", "main"));

app.get("/", (_req, res) => res.redirect("/books"));
app.use("/books", bookRouter);

app.use((_req, res) => {
  res.status(404).render("pages/error", {
    title: "Страница не найдена",
    message: "Такого маршрута не существует"
  });
});

app.listen(port, () => {
  console.log(`Server started: ${host}:${port}`);
});
