import mongoose, { Schema } from 'mongoose'

const userSchema = new Schema({
  name: { type: String, required: true }, email: { type: String, required: true, unique: true },
  avatar: { type: String, required: true }, points: { type: Number, default: 0 },
  streak: { type: Number, default: 0 }, level: { type: Number, default: 1 },
}, { timestamps: true })

const activitySchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true }, type: { type: String, enum: ['run', 'walk', 'strength', 'cycle', 'yoga'], required: true },
  title: { type: String, required: true }, duration: { type: Number, required: true }, distance: Number,
  calories: { type: Number, default: 0 }, points: { type: Number, default: 0 }, date: { type: Date, default: Date.now },
}, { timestamps: true })

const teamSchema = new Schema({
  name: { type: String, required: true }, motto: { type: String, default: '' }, color: { type: String, default: '#5d8cff' },
  members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true })

const workoutSchema = new Schema({
  title: { type: String, required: true }, category: String, duration: Number, difficulty: String, description: String, accent: String,
})

export const User = mongoose.models.User ?? mongoose.model('User', userSchema)
export const Activity = mongoose.models.Activity ?? mongoose.model('Activity', activitySchema)
export const Team = mongoose.models.Team ?? mongoose.model('Team', teamSchema)
export const Workout = mongoose.models.Workout ?? mongoose.model('Workout', workoutSchema)