const express = require('express');
const cookieParser = require('cookie-parser')
const authRouter = require('./Routes/authRoutes');
const app = express();
const globalErrorHandler = require('./Controllers/errorController');
const userRouter = require('./Routes/userRoutes');

app.use(express.json());
app.use(cookieParser());

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);

app.use(globalErrorHandler)
module.exports = app;
