const express = require("express");
const multer = require("multer");

const articleController = require("../../controllers/v1/articleController");
const multerStorage = require("../../util/multerStorage");
const authenticatedMiddleware = require("../../middlewares/authenticated");
const isAdminMiddleware = require("../../middlewares/isAdmin");

const crypto = require("crypto");
const { createClient } = require("@supabase/supabase-js");

require("dotenv").config();
const router = express.Router();

// مقداردهی Supabase
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// استفاده از حافظه به جای دیسک سرور
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 1000000000 } });

router
  .route("/")
  .post(
    upload.single("cover"), // آپلود فایل کاور در حافظه
    authenticatedMiddleware,
    isAdminMiddleware,
    async (req, res, next) => {
      try {
        if (!req.file) return res.status(400).json({ error: "فایلی ارسال نشده!" });

        // تولید نام یکتا برای فایل
        const sha256 = crypto.createHash("SHA256");
        const hashedFileName = sha256.update(req.file.originalname).digest("hex");
        const fileName = `articles/covers/${hashedFileName}${req.file.originalname}`;

        // آپلود فایل در Supabase
        const { data, error } = await supabase.storage
          .from("sabzlearn-bucket") // اسم باکت
          .upload(fileName, req.file.buffer, {
            contentType: req.file.mimetype,
            upsert: true,
          });

        if (error) return res.status(500).json({ error: "خطا در آپلود کاور مقاله" });

        // دریافت URL عمومی کاور
        const { data: publicUrl, error: urlError } = supabase.storage.from("sabzlearn-bucket").getPublicUrl(fileName);

        if (urlError) return res.status(500).json({ error: "خطا در دریافت URL کاور مقاله" });

        req.body.cover = publicUrl.publicUrl; // قرار دادن لینک در body

        next(); // ارسال به کنترلر برای ذخیره در دیتابیس
      } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: error.message });
      }
    },
    articleController.create // کنترلر برای ذخیره مقاله در دیتابیس
  )
  .get(articleController.getAll);

router.route("/:shortName").get(articleController.getOne);

router.route("/draft").post(
  upload.single("cover"), // آپلود کاور در حافظه
  authenticatedMiddleware,
  isAdminMiddleware,
  async (req, res, next) => {
    try {
      if (!req.file) return res.status(400).json({ error: "فایلی ارسال نشده!" });

      // تولید نام یکتا برای فایل
      const sha256 = crypto.createHash("SHA256");
      const hashedFileName = sha256.update(req.file.originalname).digest("hex");
      const fileName = `articles/drafts/${hashedFileName}${req.file.originalname}`;

      // آپلود در Supabase
      const { data, error } = await supabase.storage
        .from("sabzlearn-bucket") // اسم باکت
        .upload(fileName, req.file.buffer, {
          contentType: req.file.mimetype,
          upsert: true,
        });

      if (error) return res.status(500).json({ error: "خطا در آپلود کاور پیش‌نویس" });

      // دریافت URL عمومی کاور
      const { data: publicUrl, error: urlError } = supabase.storage.from("sabzlearn-bucket").getPublicUrl(fileName);

      if (urlError) return res.status(500).json({ error: "خطا در دریافت URL کاور پیش‌نویس" });

      req.body.cover = publicUrl.publicUrl; // اضافه کردن لینک کاور به body

      next(); // ارسال به کنترلر برای ذخیره پیش‌نویس در دیتابیس
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ error: error.message });
    }
  },
  articleController.saveDraft // کنترلر برای ذخیره پیش‌نویس در دیتابیس
);

router.route("/:id").delete(authenticatedMiddleware, isAdminMiddleware, articleController.remove);

module.exports = router;
