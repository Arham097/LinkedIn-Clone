const express = require('express');
const cookieParser = require('cookie-parser')
const authRouter = require('./Routes/authRoutes');
const app = express();
const globalErrorHandler = require('./Controllers/errorController');
const userRouter = require('./Routes/userRoutes');
const postRouter = require('./Routes/postRoutes');
const notificationRouter = require('./Routes/notificationRoutes');
const connectionRouter = require('./Routes/connectionRoutes');
const cors = require('cors')

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '5mb' }));
app.use(cookieParser());

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/posts', postRouter);
app.use('/api/v1/notifications', notificationRouter);
app.use('/api/v1/connections', connectionRouter);

app.use(globalErrorHandler)
module.exports = app;
