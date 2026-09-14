import mongoose from 'mongoose'
import { connectDatabase } from '../config/database'
import { Activity, Team, User, Workout } from '../models'

async function seedDatabase() {
  await connectDatabase()
  await Promise.all([Activity.deleteMany({}), Team.deleteMany({}), User.deleteMany({}), Workout.deleteMany({})])

  const users = await User.insertMany([
    { name: 'Alex Morgan', email: 'alex@octofit.local', avatar: 'AM', points: 1240, streak: 7, level: 8 },
    { name: 'Jamie Rivera', email: 'jamie@octofit.local', avatar: 'JR', points: 1090, streak: 5, level: 7 },
    { name: 'Taylor Kim', email: 'taylor@octofit.local', avatar: 'TK', points: 860, streak: 3, level: 6 },
  ])

  const teams = await Team.insertMany([
    { name: 'Summit Crew', motto: 'Small steps, high ground.', color: '#e7a23b', members: [users[0]._id, users[1]._id] },
    { name: 'Track Stars', motto: 'Show up. Move forward.', color: '#5d8cff', members: [users[0]._id, users[2]._id] },
  ])

  await Activity.insertMany([
    { userId: users[0]._id, type: 'run', title: 'Morning tempo run', duration: 34, distance: 5.2, calories: 420, points: 180, date: new Date() },
    { userId: users[0]._id, type: 'strength', title: 'Upper body circuit', duration: 28, calories: 260, points: 140, date: new Date(Date.now() - 86400000) },
    { userId: users[1]._id, type: 'walk', title: 'Lakeside walk', duration: 42, distance: 3.8, calories: 210, points: 110, date: new Date(Date.now() - 172800000) },
  ])

  await Workout.insertMany([
    { title: 'Tempo builder', category: 'Run', duration: 32, difficulty: 'Intermediate', description: 'Build speed with three controlled efforts and easy recovery.', accent: '#e7a23b' },
    { title: 'Core reset', category: 'Strength', duration: 18, difficulty: 'Beginner', description: 'A low-impact core sequence for a stronger, steadier base.', accent: '#5d8cff' },
    { title: 'After-school unwind', category: 'Mobility', duration: 14, difficulty: 'Beginner', description: 'Release the day with a gentle full-body mobility flow.', accent: '#d87555' },
  ])

  console.log(`Seeded ${users.length} users, ${teams.length} teams, activities, and workouts`)
  await mongoose.disconnect()
}

seedDatabase().catch(async (error) => {
  console.error('Error seeding database:', error)
  await mongoose.disconnect()
  process.exit(1)
})
