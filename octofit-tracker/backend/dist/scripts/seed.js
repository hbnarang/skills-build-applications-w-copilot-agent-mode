"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const database_1 = require("../config/database");
const models_1 = require("../models");
async function seedDatabase() {
    await (0, database_1.connectDatabase)();
    await Promise.all([models_1.Activity.deleteMany({}), models_1.Team.deleteMany({}), models_1.User.deleteMany({}), models_1.Workout.deleteMany({})]);
    const users = await models_1.User.insertMany([
        { name: 'Alex Morgan', email: 'alex@octofit.local', avatar: 'AM', points: 1240, streak: 7, level: 8 },
        { name: 'Jamie Rivera', email: 'jamie@octofit.local', avatar: 'JR', points: 1090, streak: 5, level: 7 },
        { name: 'Taylor Kim', email: 'taylor@octofit.local', avatar: 'TK', points: 860, streak: 3, level: 6 },
    ]);
    const teams = await models_1.Team.insertMany([
        { name: 'Summit Crew', motto: 'Small steps, high ground.', color: '#e7a23b', members: [users[0]._id, users[1]._id] },
        { name: 'Track Stars', motto: 'Show up. Move forward.', color: '#5d8cff', members: [users[0]._id, users[2]._id] },
    ]);
    await models_1.Activity.insertMany([
        { userId: users[0]._id, type: 'run', title: 'Morning tempo run', duration: 34, distance: 5.2, calories: 420, points: 180, date: new Date() },
        { userId: users[0]._id, type: 'strength', title: 'Upper body circuit', duration: 28, calories: 260, points: 140, date: new Date(Date.now() - 86400000) },
        { userId: users[1]._id, type: 'walk', title: 'Lakeside walk', duration: 42, distance: 3.8, calories: 210, points: 110, date: new Date(Date.now() - 172800000) },
    ]);
    await models_1.Workout.insertMany([
        { title: 'Tempo builder', category: 'Run', duration: 32, difficulty: 'Intermediate', description: 'Build speed with three controlled efforts and easy recovery.', accent: '#e7a23b' },
        { title: 'Core reset', category: 'Strength', duration: 18, difficulty: 'Beginner', description: 'A low-impact core sequence for a stronger, steadier base.', accent: '#5d8cff' },
        { title: 'After-school unwind', category: 'Mobility', duration: 14, difficulty: 'Beginner', description: 'Release the day with a gentle full-body mobility flow.', accent: '#d87555' },
    ]);
    console.log(`Seeded ${users.length} users, ${teams.length} teams, activities, and workouts`);
    await mongoose_1.default.disconnect();
}
seedDatabase().catch(async (error) => {
    console.error('Error seeding database:', error);
    await mongoose_1.default.disconnect();
    process.exit(1);
});
