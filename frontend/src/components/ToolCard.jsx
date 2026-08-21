import { Link } from 'react-router-dom'

export default function ToolCard({ to, icon, title, description }) {
  return (
    <Link to={to} className="tool-card">
      <span className="tool-icon">{icon}</span>
      <h3>{title}</h3>
      <p>{description}</p>
    </Link>
  )
}
