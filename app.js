const express = require('express');
const path = require('path');
const app = express();

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'Templates')));

// Routes
const rootRouter = require('./Routes/indexRouter');
const authRouter = require('./Routes/Authentication');
const dashboardRouter = require('./Routes/dashboard');
const manageFilesRouter = require('./Routes/manageFiles');

app.use('/', rootRouter);
app.use('/auth', authRouter);
app.use('/dashboard', dashboardRouter);
app.use('/', manageFilesRouter);

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something broke!', error: err.message });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 