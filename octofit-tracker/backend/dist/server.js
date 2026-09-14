"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const database_1 = require("./config/database");
const models_1 = require("./models");
const app = (0, express_1.default)();
const port = Number(process.env.PORT ?? 8000);
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.get('/api/health', (_request, response) => {
    response.json({ status: 'ok', database: 'connected' });
});
app.get('/api/dashboard', async (_request, response) => {
    const user = await models_1.User.findOne().sort({ points: -1 }).lean();
    if (!user)
        return response.status(404).json({ message: 'No users found. Run the seed script.' });
    const [activities, teams, leaderboard, workouts] = await Promise.all([
        models_1.Activity.find({ userId: user._id }).sort({ date: -1 }).limit(8).lean(),
        models_1.Team.find({ members: user._id }).populate('members', 'name avatar points').lean(),
        models_1.User.find().sort({ points: -1 }).limit(10).select('name avatar points streak level').lean(),
        models_1.Workout.find().limit(6).lean(),
    ]);
    response.json({ user, activities, teams, leaderboard, workouts });
});
app.get('/api/activities', async (_request, response) => response.json(await models_1.Activity.find().populate('userId', 'name avatar').sort({ date: -1 }).limit(50).lean()));
app.post('/api/activities', async (request, response) => {
    const { userId, type, title, duration, distance, calories } = request.body;
    if (!userId || !type || !title || !duration)
        return response.status(400).json({ message: 'userId, type, title, and duration are required' });
    const points = Math.round(Number(duration) * (type === 'run' ? 5 : type === 'strength' ? 4 : 3));
    const activity = await models_1.Activity.create({ userId, type, title, duration, distance, calories, points });
    await models_1.User.findByIdAndUpdate(userId, { $inc: { points, streak: 1 } });
    response.status(201).json(activity);
});
app.get('/api/teams', async (_request, response) => response.json(await models_1.Team.find().populate('members', 'name avatar points').lean()));
app.post('/api/teams', async (request, response) => {
    const { name, motto, color, userId } = request.body;
    if (!name || !userId)
        return response.status(400).json({ message: 'name and userId are required' });
    response.status(201).json(await models_1.Team.create({ name, motto, color, members: [userId] }));
});
app.get('/api/leaderboard', async (_request, response) => response.json(await models_1.User.find().sort({ points: -1 }).select('name avatar points streak level').lean()));
app.get('/api/workouts', async (_request, response) => response.json(await models_1.Workout.find().lean()));
async function startServer() {
    await (0, database_1.connectDatabase)();
    app.listen(port, () => console.log(`OctoFit Tracker API listening on port ${port}`));
}
startServer().catch((error) => {
    console.error('Unable to start API:', error);
    process.exit(1);
});
