"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDatabase = connectDatabase;
const mongoose_1 = __importDefault(require("mongoose"));
const connectionString = process.env.MONGODB_URI ?? 'mongodb://localhost:27017/octofit_db';
async function connectDatabase() {
    await mongoose_1.default.connect(connectionString);
    console.log('Connected to octofit_db');
}
exports.default = mongoose_1.default.connection;
