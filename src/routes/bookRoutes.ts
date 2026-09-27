import { Router, Request, Response } from "express";
import { pool } from "../db/db_connection.js";

const router = Router();

// GET /books — получить все книги.
// GET /books?title=гарри — найти книги по полю title.
router.get("/", async (req: Request, res: Response) => {
  try {
    const title = typeof req.query.title === "string"
      ? req.query.title.trim()
      : "";
    const result = title
      ? await pool.query(
        "SELECT * FROM public.books WHERE title ILIKE $1 ORDER BY id",
        [`%${title}%`]
      )
      : await pool.query("SELECT * FROM public.books ORDER BY id");
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ошибка при получении книг" });
  }
});

// GET /books/title/:title — найти книги по части названия без учёта регистра.
// Этот маршрут должен находиться выше /:id, иначе Express примет слово title за id.
router.get(
  "/title/:title",
  async (req: Request<{ title: string }>, res: Response) => {
    try {
      const result = await pool.query(
        "SELECT * FROM public.books WHERE title ILIKE $1 ORDER BY id",
        [`%${req.params.title}%`]
      );
      res.json(result.rows);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Ошибка при поиске книг" });
    }
  }
);

// GET /books/:id — получить одну книгу по id.
router.get("/:id", async (req: Request<{ id: string }>, res: Response) => {
  const id = Number(req.params.id);

  try {
    const result = await pool.query(
      "SELECT * FROM public.books WHERE id = $1",
      [id]
    );

    if (result.rowCount === 0) {
      res.status(404).json({ message: "Книга не найдена" });
      return;
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ошибка при получении книги" });
  }
});

export default router;
