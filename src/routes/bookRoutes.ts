import { Router, Request, Response } from "express";
import { pool } from "../db/db_connection.js";

type BookUpdateBody = {
  title?: string;
  price?: string | number;
  is_active?: string | boolean;
  image?: string;
};

const router = Router();

const parseId = (value: string) => {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
};

// GET /books — каталог книг из PostgreSQL.
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

    res.render("pages/books", {
      title: "Книги",
      books: result.rows,
      search: title
    });
  } catch (error) {
    console.error(error);
    res.status(500).render("pages/error", {
      title: "Ошибка",
      message: "Не удалось получить книги"
    });
  }
});

// GET /books/title/:title — поиск по части названия без учёта регистра.
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

// Страница редактирования должна быть объявлена до маршрута /:id.
router.get("/:id/edit", async (req: Request<{ id: string }>, res: Response) => {
  const id = parseId(req.params.id);
  if (id === null) {
    res.status(400).render("pages/error", {
      title: "Ошибка",
      message: "Некорректный id книги"
    });
    return;
  }

  try {
    const result = await pool.query(
      "SELECT * FROM public.books WHERE id = $1",
      [id]
    );
    const book = result.rows[0];

    if (!book) {
      res.status(404).render("pages/error", {
        title: "Книга не найдена",
        message: "Книга с таким id не существует"
      });
      return;
    }

    res.render("pages/edit-book", { title: "Редактировать книгу", book });
  } catch (error) {
    console.error(error);
    res.status(500).render("pages/error", {
      title: "Ошибка",
      message: "Не удалось загрузить книгу"
    });
  }
});

// PUT /books/:id — обновить информацию о книге в PostgreSQL.
router.put(
  "/:id",
  async (req: Request<{ id: string }, unknown, BookUpdateBody>, res: Response) => {
    const id = parseId(req.params.id);
    const title = typeof req.body.title === "string" ? req.body.title.trim() : "";
    const price = Number(req.body.price);
    const isActive = req.body.is_active === true || req.body.is_active === "true";
    const image = typeof req.body.image === "string" ? req.body.image.trim() : "";

    if (id === null || !title || !Number.isInteger(price) || price < 0) {
      res.status(400).json({ message: "Проверьте название, цену и id книги" });
      return;
    }

    try {
      const result = await pool.query(
        `UPDATE public.books
         SET title = $1, price = $2, is_active = $3, image = NULLIF($4, '')
         WHERE id = $5
         RETURNING *`,
        [title, price, isActive, image, id]
      );

      if (result.rowCount === 0) {
        res.status(404).json({ message: "Книга не найдена" });
        return;
      }

      res.json({ message: "Книга обновлена", book: result.rows[0] });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Не удалось обновить книгу" });
    }
  }
);

// DELETE /books/:id — удалить книгу из PostgreSQL.
router.delete("/:id", async (req: Request<{ id: string }>, res: Response) => {
  const id = parseId(req.params.id);
  if (id === null) {
    res.status(400).json({ message: "Некорректный id книги" });
    return;
  }

  try {
    const result = await pool.query(
      "DELETE FROM public.books WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rowCount === 0) {
      res.status(404).json({ message: "Книга не найдена" });
      return;
    }

    res.json({ message: "Книга удалена", book: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Не удалось удалить книгу" });
  }
});

// GET /books/:id — получить одну книгу по id в JSON.
router.get("/:id", async (req: Request<{ id: string }>, res: Response) => {
  const id = parseId(req.params.id);
  if (id === null) {
    res.status(400).json({ message: "Некорректный id книги" });
    return;
  }

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
