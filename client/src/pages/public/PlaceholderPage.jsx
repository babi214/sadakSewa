import { Link } from 'react-router-dom'
import Button from '../../components/common/Button'

export default function PlaceholderPage({ title, description, backTo = '/' }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="text-3xl font-bold text-secondary">{title}</h1>
      <p className="mt-3 max-w-md text-muted">{description}</p>
      <Link to={backTo} className="mt-8">
        <Button variant="outline">Back to Home</Button>
      </Link>
    </div>
  )
}
