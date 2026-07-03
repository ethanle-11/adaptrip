import { useState } from 'react'
import { useParams } from 'react-router-dom'

function TripDetail() {
    const { id } = useParams()
    const [trip, setTrip] = useState(null)
    const [activities, setActivities] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

}

export default TripDetail