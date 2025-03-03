<<<<<<< HEAD
const dotenv = require('dotenv');
const { default: mongoose } = require('mongoose');
const app = require('./app');
=======
const dotenv = require("dotenv");
const { default: mongoose } = require("mongoose");
const app = require("./app");
>>>>>>> e1913f0 (initial files)

//* Load env
dotenv.config();

//* Database connection
(async () => {
  try {
<<<<<<< HEAD
=======
    // const conn = await mongoose.connect(process.env.MONGO_URI,{
    //   authSource:'admin',
    //   useNewUrlParser:true,
    //   useUnifiedTopology:true
    // });
>>>>>>> e1913f0 (initial files)
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    //?error catch
    console.log(err);
    process.exit(1);
  }
})();

<<<<<<< HEAD

const port = +process.env.PORT || 3000;

const productionMode = process.env.NODE_ENV === 'production'
app.listen(port, () => {
  console.log(`Server running in ${productionMode?"production":"development"} mode on port ${port}`);
=======
// const port = +process.env.PORT || 3000;
const port = 4000;

const productionMode = process.env.NODE_ENV === "production";
app.listen(port, () => {
  console.log(`Server running in ${productionMode ? "production" : "development"} mode on port ${port}`);
>>>>>>> e1913f0 (initial files)
});
