"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Workout = exports.Team = exports.Activity = exports.User = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const userSchema = new mongoose_1.Schema({
    name: { type: String, required: true }, email: { type: String, required: true, unique: true },
    avatar: { type: String, required: true }, points: { type: Number, default: 0 },
    streak: { type: Number, default: 0 }, level: { type: Number, default: 1 },
}, { timestamps: true });
const activitySchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true }, type: { type: String, enum: ['run', 'walk', 'strength', 'cycle', 'yoga'], required: true },
    title: { type: String, required: true }, duration: { type: Number, required: true }, distance: Number,
    calories: { type: Number, default: 0 }, points: { type: Number, default: 0 }, date: { type: Date, default: Date.now },
}, { timestamps: true });
const teamSchema = new mongoose_1.Schema({
    name: { type: String, required: true }, motto: { type: String, default: '' }, color: { type: String, default: '#5d8cff' },
    members: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });
const workoutSchema = new mongoose_1.Schema({
    title: { type: String, required: true }, category: String, duration: Number, difficulty: String, description: String, accent: String,
});
exports.User = mongoose_1.default.models.User ?? mongoose_1.default.model('User', userSchema);
exports.Activity = mongoose_1.default.models.Activity ?? mongoose_1.default.model('Activity', activitySchema);
exports.Team = mongoose_1.default.models.Team ?? mongoose_1.default.model('Team', teamSchema);
exports.Workout = mongoose_1.default.models.Workout ?? mongoose_1.default.model('Workout', workoutSchema);
