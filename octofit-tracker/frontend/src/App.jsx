import { useEffect, useState } from 'react'
import './App.css'

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'
const emptyForm = { type: 'run', title: '', duration: '', distance: '', calories: '' }

function App() {
  const [data, setData] = useState(null)
  const [view, setView] = useState('overview')
  const [activityForm, setActivityForm] = useState(emptyForm)
  const [teamForm, setTeamForm] = useState({ name: '', motto: '' })
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')

  async function loadDashboard() {
    const response = await fetch(`${API_BASE}/api/dashboard`)
    if (!response.ok) throw new Error('The tracker API is not available yet.')
    setData(await response.json())
  }

  useEffect(() => { loadDashboard().catch((reason) => setError(reason.message)) }, [])

  async function submitActivity(event) {
    event.preventDefault()
    const response = await fetch(`${API_BASE}/api/activities`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...activityForm, userId: data.user._id }) })
    if (!response.ok) return setError('Could not save that activity.')
    setActivityForm(emptyForm)
    setNotice('Activity logged. Your points are on the board.')
    await loadDashboard()
    setView('overview')
  }

  async function submitTeam(event) {
    event.preventDefault()
    const response = await fetch(`${API_BASE}/api/teams`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...teamForm, userId: data.user._id, color: '#d87555' }) })
    if (!response.ok) return setError('Could not create that team.')
    setTeamForm({ name: '', motto: '' })
    setNotice('Your new team is ready.')
    await loadDashboard()
  }

  if (error && !data) return <main className="error-screen"><span className="eyebrow">OCTOFIT TRACKER</span><h1>One small setup step remains.</h1><p>{error} Start the API with <code>npm run dev --prefix octofit-tracker/backend</code>.</p></main>
  if (!data) return <main className="loading-screen"><div className="pulse-mark">O</div><p>Loading your movement map...</p></main>

  const { user, activities, teams, leaderboard, workouts } = data
  const weeklyMinutes = activities.reduce((total, activity) => total + activity.duration, 0)

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark">O</span><span>octofit<span className="brand-dot">.</span></span></div>
        <div className="profile-mini"><div className="avatar avatar-large">{user.avatar}</div><div><strong>{user.name}</strong><span>Level {user.level} athlete</span></div></div>
        <nav className="nav-list" aria-label="Main navigation">
          {[['overview', 'Overview'], ['activity', 'Log activity'], ['teams', 'My teams'], ['leaderboard', 'Leaderboard']].map(([key, label]) => <button className={view === key ? 'nav-item active' : 'nav-item'} onClick={() => { setView(key); setNotice('') }} key={key}><span className="nav-icon">{key === 'overview' ? 'o' : key === 'activity' ? '+' : key === 'teams' ? 't' : 'u'}</span>{label}</button>)}
        </nav>
        <div className="sidebar-foot"><span className="status-dot"></span><span>Tracker synced</span><small>MongoDB live</small></div>
      </aside>

      <section className="content">
        <header className="topbar"><div><span className="eyebrow">MONDAY, OCTOBER 14</span><h2>{view === 'overview' ? 'Your movement, mapped.' : view === 'activity' ? 'Keep the streak moving.' : view === 'teams' ? 'Better together.' : 'Earn your place.'}</h2></div><div className="top-actions"><button className="icon-button" aria-label="Notifications">!</button><div className="avatar">{user.avatar}</div></div></header>
        {notice && <div className="notice" role="status">{notice}</div>}

        {view === 'overview' && <>
          <section className="welcome-panel"><div><span className="eyebrow light">YOUR WEEK IN MOTION</span><h1>Good morning,<br /><em>{user.name.split(' ')[0]}.</em></h1><p>You are building something that lasts. Keep your next move easy and intentional.</p><button className="primary-button" onClick={() => setView('activity')}>Log an activity <span>+</span></button></div><div className="ring-stat"><div className="ring"><strong>{user.streak}</strong><span>day streak</span></div><small>Best this month</small></div></section>
          <section className="metric-grid"><Metric label="Total points" value={user.points.toLocaleString()} detail="Top 12% this month" accent="gold" /><Metric label="Active minutes" value={weeklyMinutes} detail="+18% from last week" accent="blue" /><Metric label="Current level" value={`0${user.level}`} detail={`${Math.max(0, user.level * 200 - user.points % 200)} pts to next`} accent="coral" /></section>
          <div className="section-heading"><div><span className="eyebrow">KEEP YOUR RHYTHM</span><h3>Recent activity</h3></div><button className="text-button" onClick={() => setView('activity')}>View all <span>-&gt;</span></button></div>
          <div className="dashboard-grid"><section className="panel activity-panel">{activities.length === 0 ? <EmptyState text="No activity yet. Log your first move." /> : activities.slice(0, 4).map((activity) => <ActivityRow activity={activity} key={activity._id} />)}</section><section className="panel focus-panel"><div className="panel-head"><div><span className="eyebrow">FOR YOU</span><h3>Suggested next</h3></div><span className="spark">*</span></div>{workouts.slice(0, 2).map((workout) => <WorkoutCard workout={workout} key={workout._id} />)}</section></div>
        </>}

        {view === 'activity' && <section className="page-section"><div className="section-heading"><div><span className="eyebrow">ACTIVITY LOG</span><h3>What did you move today?</h3></div></div><form className="form-panel" onSubmit={submitActivity}><label>Activity type<select value={activityForm.type} onChange={(event) => setActivityForm({ ...activityForm, type: event.target.value })}><option value="run">Run</option><option value="walk">Walk</option><option value="strength">Strength</option><option value="cycle">Cycle</option><option value="yoga">Yoga</option></select></label><label>Title<input required placeholder="Morning miles" value={activityForm.title} onChange={(event) => setActivityForm({ ...activityForm, title: event.target.value })} /></label><div className="form-row"><label>Duration (min)<input required type="number" min="1" value={activityForm.duration} onChange={(event) => setActivityForm({ ...activityForm, duration: event.target.value })} /></label><label>Distance (km)<input type="number" step="0.1" min="0" value={activityForm.distance} onChange={(event) => setActivityForm({ ...activityForm, distance: event.target.value })} /></label><label>Calories<input type="number" min="0" value={activityForm.calories} onChange={(event) => setActivityForm({ ...activityForm, calories: event.target.value })} /></label></div><button className="primary-button" type="submit">Save activity <span>-&gt;</span></button></form><div className="section-heading compact"><div><span className="eyebrow">HISTORY</span><h3>All recent movement</h3></div></div><section className="panel activity-panel">{activities.map((activity) => <ActivityRow activity={activity} key={activity._id} />)}</section></section>}

        {view === 'teams' && <section className="page-section"><div className="section-heading"><div><span className="eyebrow">COMMUNITY</span><h3>Find your people.</h3></div></div><div className="team-layout"><section className="team-list">{teams.map((team) => <TeamCard team={team} key={team._id} />)}</section><form className="form-panel create-team" onSubmit={submitTeam}><span className="eyebrow">START A CREW</span><h3>Make a new team</h3><p>Invite a little friendly pressure into your week.</p><label>Team name<input required placeholder="Weekend movers" value={teamForm.name} onChange={(event) => setTeamForm({ ...teamForm, name: event.target.value })} /></label><label>Motto<input placeholder="Move as one." value={teamForm.motto} onChange={(event) => setTeamForm({ ...teamForm, motto: event.target.value })} /></label><button className="primary-button" type="submit">Create team <span>+</span></button></form></div></section>}

        {view === 'leaderboard' && <section className="page-section"><div className="section-heading"><div><span className="eyebrow">THIS MONTH</span><h3>The movement board.</h3></div><span className="board-badge">Live ranking</span></div><section className="panel leaderboard">{leaderboard.map((member, index) => <div className={member._id === user._id ? 'leader-row current' : 'leader-row'} key={member._id}><span className="rank">{String(index + 1).padStart(2, '0')}</span><div className="avatar">{member.avatar}</div><div className="leader-name"><strong>{member.name}{member._id === user._id && <small>YOU</small>}</strong><span>{member.streak} day streak</span></div><strong className="leader-points">{member.points.toLocaleString()} <small>pts</small></strong></div>)}</section></section>}
      </section>
    </main>
  )
}

function Metric({ label, value, detail, accent }) { return <article className={`metric ${accent}`}><span>{label}</span><strong>{value}</strong><small>{detail}</small></article> }
function ActivityRow({ activity }) { return <div className="activity-row"><div className={`activity-icon ${activity.type}`}>{activity.type === 'run' ? '>' : activity.type === 'strength' ? '[]' : 'o'}</div><div className="activity-copy"><strong>{activity.title}</strong><span>{new Date(activity.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} - {activity.duration} min</span></div><strong className="points">+{activity.points} <small>pts</small></strong></div> }
function WorkoutCard({ workout }) { return <article className="workout-card" style={{ '--workout-accent': workout.accent }}><div><span>{workout.category} - {workout.duration} min</span><h4>{workout.title}</h4><p>{workout.description}</p></div><button aria-label={`Start ${workout.title}`}>-&gt;</button></article> }
function TeamCard({ team }) { return <article className="team-card" style={{ '--team-color': team.color }}><div className="team-color"></div><div><span className="eyebrow">{team.members.length} MEMBERS</span><h3>{team.name}</h3><p>{team.motto}</p><div className="member-stack">{team.members.map((member) => <span className="avatar" key={member._id}>{member.avatar}</span>)}</div></div><span className="team-arrow">-&gt;</span></article> }
function EmptyState({ text }) { return <div className="empty-state">{text}</div> }

export default App
