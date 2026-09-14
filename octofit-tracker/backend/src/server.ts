import express from 'express'
import cors from 'cors'
import { connectDatabase } from './config/database'
import { Activity, Team, User, Workout } from './models'

const app = express()
const port = Number(process.env.PORT ?? 8000)

app.use(cors())
app.use(express.json())

app.get('/api/health', (_request, response) => {
  response.json({ status: 'ok', database: 'connected' })
})

app.get('/api/dashboard', async (_request, response) => {
  const user = await User.findOne().sort({ points: -1 }).lean()
  if (!user) return response.status(404).json({ message: 'No users found. Run the seed script.' })
  const [activities, teams, leaderboard, workouts] = await Promise.all([
    Activity.find({ userId: user._id }).sort({ date: -1 }).limit(8).lean(),
    Team.find({ members: user._id }).populate('members', 'name avatar points').lean(),
    User.find().sort({ points: -1 }).limit(10).select('name avatar points streak level').lean(),
    Workout.find().limit(6).lean(),
  ])
  response.json({ user, activities, teams, leaderboard, workouts })
})

app.get('/api/activities', async (_request, response) => response.json(await Activity.find().populate('userId', 'name avatar').sort({ date: -1 }).limit(50).lean()))
app.post('/api/activities', async (request, response) => {
  const { userId, type, title, duration, distance, calories } = request.body
  if (!userId || !type || !title || !duration) return response.status(400).json({ message: 'userId, type, title, and duration are required' })
  const points = Math.round(Number(duration) * (type === 'run' ? 5 : type === 'strength' ? 4 : 3))
  const activity = await Activity.create({ userId, type, title, duration, distance, calories, points })
  await User.findByIdAndUpdate(userId, { $inc: { points, streak: 1 } })
  response.status(201).json(activity)
})

app.get('/api/teams', async (_request, response) => response.json(await Team.find().populate('members', 'name avatar points').lean()))
app.post('/api/teams', async (request, response) => {
  const { name, motto, color, userId } = request.body
  if (!name || !userId) return response.status(400).json({ message: 'name and userId are required' })
  response.status(201).json(await Team.create({ name, motto, color, members: [userId] }))
})
app.get('/api/leaderboard', async (_request, response) => response.json(await User.find().sort({ points: -1 }).select('name avatar points streak level').lean()))
app.get('/api/workouts', async (_request, response) => response.json(await Workout.find().lean()))

async function startServer() {
  await connectDatabase()
  app.listen(port, () => console.log(`OctoFit Tracker API listening on port ${port}`))
}

startServer().catch((error) => {
  console.error('Unable to start API:', error)
  process.exit(1)
})