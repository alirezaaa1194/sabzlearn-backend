const courseModel = require("../../models/course");
const userModel = require("../../models/user");
const infosModel = require("../../models/infos");
const sessionModel = require("../../models/session");
const courseUserModel = require("../../models/course-user");

exports.getIndex = async (req, res, next) => {
  try {
    const allInfos = await infosModel.find();
    const coursesCount = await courseModel.find().lean().count();
    const usersCount = await userModel.find().lean().count();
    const sessions = await sessionModel.find().lean();

<<<<<<< HEAD
    const totalTime = sessions.reduce(
      (prev, current) => prev + Number(current.time.slice(0, 2)),
      0
    );
=======
    const totalTime = sessions.reduce((prev, current) => prev + Number(current.time.slice(0, 2)), 0);
>>>>>>> e1913f0 (initial files)

    res.json({
      phone: allInfos[0].phone,
      email: allInfos[0].email,
      coursesCount,
      usersCount,
      totalTime,
    });
  } catch (error) {
    next(error);
  }
};

exports.getPAdmin = async (req, res, next) => {
  try {
    const coursesRegistersCount = await courseUserModel.find().lean().count();
    const coursesCount = await courseModel.find().lean().count();
    const sessionsCount = await sessionModel.find().lean().count();
<<<<<<< HEAD
    let users = await userModel.find().sort({ _id: -1 }).lean();

    const admin = await userModel.findOne({ _id: req.user._id });
    users = users.slice(0, 5);
=======
    let allUsers = await userModel.find().sort({ _id: -1 }).lean();

    const admin = await userModel.findOne({ _id: req.user._id });
    let users = allUsers.slice(0, 5);
>>>>>>> e1913f0 (initial files)

    res.json({
      infos: [
        {
<<<<<<< HEAD
          count: coursesRegistersCount,
=======
          count: allUsers.length,
>>>>>>> e1913f0 (initial files)
          title: "ثبت نامی‌ها",
        },
        {
          count: coursesCount,
          title: "دوره‌ها",
        },
        {
          count: sessionsCount,
          title: "جلسات",
        },
      ],
      lastUsers: users,
<<<<<<< HEAD
      adminName: admin.name,
=======
      adminName: admin?.name,
>>>>>>> e1913f0 (initial files)
    });
  } catch (error) {
    next(error);
  }
};
