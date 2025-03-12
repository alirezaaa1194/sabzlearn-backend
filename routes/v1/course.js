const express = require("express");
const multer = require("multer");

const courseController = require("../../controllers/v1/course");
const multerStorage = require("../../util/multerStorage");
const authenticatedMiddleware = require("../../middlewares/authenticated");
const isAdminMiddleware = require("../../middlewares/isAdmin");
const loginUser = require("../../middlewares/loginUser");
const { createClient } = require("@supabase/supabase-js");
const crypto = require("crypto");
const courseModel = require("../../models/course");

require("dotenv").config();
const router = express.Router();


const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
// تنظیم Multer برای حافظه موقت
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // حداکثر 10 مگابایت
});

router
  .route("/")
  .post(
    authenticatedMiddleware, // اول احراز هویت
    isAdminMiddleware, // بعد چک کردن ادمین بودن
    upload.single("cover"), // بعد آپلود فایل در حافظه
    async (req, res, next) => {
      // console.log("Uploaded file:", req.file); // لاگ گرفتن از فایل دریافتی

      try {
        if (!req.file) return res.status(400).json({ error: "فایلی ارسال نشده!" });
        // تولید نام یکتا برای فایل
        const sha256 = crypto.createHash("SHA256");
        const hashedFileName = sha256.update(req.file.originalname).digest("hex");
        const fileName = `courses/covers/${hashedFileName}${req.file.originalname}`;

        // آپلود به Supabase Storage
        const { data, error } = await supabase.storage
          .from("sabzlearn-bucket") // اسم باکت
          .upload(fileName, req.file.buffer, {
            contentType: req.file.mimetype,
            upsert: true,
          });

        if (error) {
          // console.log("Error uploading file:", error);
          return res.status(500).json({ error: "خطا در آپلود فایل" });
        }

        // بررسی داده‌ها
        // console.log("Uploaded file data:", data);

        // دریافت URL عمومی فایل
        const { data: publicUrl, error: urlError } = supabase.storage.from("sabzlearn-bucket").getPublicUrl(fileName);

        if (urlError) {
          // console.log("Error getting public URL:", urlError);
          return res.status(500).json({ error: "خطا در دریافت URL فایل" });
        } else {
          // console.log("Public URL:", publicUrl.publicUrl);
          req.body.cover = publicUrl.publicUrl; // اضافه کردن لینک به body درخواست
          // console.log('An :)=> ', publicUrl.publicUrl);
        }

        next(); // ادامه پردازش
      } catch (error) {
        console.log("Error:", error);
        res.status(500).json({ error: error.message });
      }
    },
    courseController.create // حالا کنترلر مقدار `req.body.cover` رو می‌گیره و ذخیره می‌کنه
  )
  .get(courseController.getAll);


router.route("/category/:categoryName").get(courseController.getCategoryCourses);

router
  .route("/:id")
  .delete(authenticatedMiddleware, isAdminMiddleware, courseController.remove)
  .put(
    upload.single("cover"), // آپلود فایل کاور در حافظه
    authenticatedMiddleware,
    isAdminMiddleware,
    async (req, res, next) => {
      try {
        if (!req.file) return next(); // اگر فایلی ارسال نشده، فقط بقیه اطلاعات آپدیت بشه

        // تولید نام یکتا برای فایل جدید
        const sha256 = crypto.createHash("SHA256");
        const hashedFileName = sha256.update(req.file.originalname).digest("hex");
        const fileName = `courses/covers/${hashedFileName}${req.file.originalname}`;

        // آپلود فایل جدید در Supabase
        const { data, error } = await supabase.storage
          .from("sabzlearn-bucket") // اسم باکت
          .upload(fileName, req.file.buffer, {
            contentType: req.file.mimetype,
            upsert: true, // جایگزینی فایل قبلی
          });

        if (error) return res.status(500).json({ error: "خطا در آپلود فایل جدید" });

        // دریافت URL جدید کاور
        const { data: publicUrl, error: urlError } = supabase.storage.from("sabzlearn-bucket").getPublicUrl(fileName);

        if (urlError) return res.status(500).json({ error: "خطا در دریافت URL کاور جدید" });

        req.body.cover = publicUrl.publicUrl; // قرار دادن لینک جدید در body

        next(); // ارسال به کنترلر برای ذخیره تغییرات در دیتابیس
      } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: error.message });
      }
    },
    courseController.update // کنترلر برای آپدیت اطلاعات در دیتابیس
  );


router
  .route("/:id/sessions")
  .post(
    upload.single("video"), // آپلود فایل در حافظه
    authenticatedMiddleware,
    isAdminMiddleware,
    async (req, res, next) => {
      try {
        if (!req.file) return res.status(400).json({ error: "فایلی ارسال نشده!" });

        // تولید نام یکتا برای فایل
        const sha256 = crypto.createHash("SHA256");
        const hashedFileName = sha256.update(req.file.originalname).digest("hex");
        const fileName = `courses/sessions/${hashedFileName}${req.file.originalname}`;

        // آپلود در Supabase Storage
        const { data, error } = await supabase.storage
          .from("sabzlearn-bucket") // اسم باکت
          .upload(fileName, req.file.buffer, {
            contentType: req.file.mimetype,
            upsert: true,
          });

        if (error) return res.status(500).json({ error: "خطا در آپلود فایل" });

        // دریافت URL عمومی ویدیو
        const { data: publicUrl, error: urlError } = supabase.storage.from("sabzlearn-bucket").getPublicUrl(fileName);

        if (urlError) return res.status(500).json({ error: "خطا در دریافت URL فایل" });

        req.body.video = publicUrl.publicUrl; // لینک ویدیو در body قرار می‌گیرد

        next(); // ارسال به کنترلر برای ذخیره در دیتابیس
      } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: error.message });
      }
    },
    courseController.createSession // کنترلر که اطلاعات را در دیتابیس ذخیره می‌کند
  );



router.route("/sessions").get(courseController.getAllSessions);

router.route("/sessions/:id").delete(authenticatedMiddleware, isAdminMiddleware, courseController.removeSession);

router.route("/related/:shortName").get(courseController.getRelated);

router.route("/:shortName/:sessionID").get(authenticatedMiddleware, courseController.getSessionInfo);

router.route("/presell").get(courseController.getAll);
router.route("/popular").get(courseController.getAll);

router.route("/:shortName").get(loginUser, courseController.getOne);

router.route("/:id/register").post(authenticatedMiddleware, courseController.register);

module.exports = router;
