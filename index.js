const dotenv = require("dotenv");
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const router = require('./router/index');
const bodyParser = require('body-parser');
const errorMiddleware = require('./middleware/error-middleware');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
dotenv.config();
const PORT = process.env.PORT || 3000;
app.use(cors({
  credentials: true,
  origin: process.env.CLIENT_URL
}));
app.use('/api', router)
app.use(express.json());
app.use(errorMiddleware);

const start = async() => {
  try {
    await mongoose.connect(process.env.DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
    app.listen(PORT, () => {
      console.log(`Port: ${PORT}`)
    })
  } catch(e) {
    console.log(e)
  }
}

start();

