import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import Navbar from '../components/Navbar'
import { useNavigate } from 'react-router-dom'
import { formatDate } from '../lib/utils'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

L.Icon.Default.mergeOptions({
    iconUrl: markerIcon,
    shadowUrl: markerShadow
})


function TripDetail() {
    const { id } = useParams()
    const [trip, setTrip] = useState(null)
    const [activities, setActivities] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const navigate = useNavigate()

    useEffect(() => {

        const fetchTripData = async () => {
            try {
                const { data, error } = await supabase.from('trips').select('*').eq('id', id).single()
                if (error) throw error
                setTrip(data)

                const { data: activitiesData, error: activitiesError} = await supabase.from('activities').select('*').eq('trip_id', id)
                if (activitiesError) throw activitiesError
                setActivities(activitiesData)
            } catch (error) {
                setError("Something went wrong")
            } finally {
                setLoading(false)
            }
        }
        fetchTripData()
     
    }, [id])

    if (loading) return <div className="min-h-screen flex items-center justify-center"><h1>Loading...</h1></div>
    
    if (error) return <div className="min-h-screen flex items-center justify-center"><h1>There's a problem loading this page.</h1></div>

    return (
        <div>
            <Navbar />
            <div className="px-6 py-4">
                <button onClick={() => navigate('/dashboard')} className="text-sm text-gray-500 hover:underline mb-4 cursor-pointer">Back to Trips</button> 
                <h1 className="text-3xl font-bold">{trip?.title}</h1>
                <p className="text-gray-500">{trip?.destination} • {formatDate(trip?.start_date)} → {formatDate(trip?.end_date)}</p>
            </div>
            <div className="flex gap-6">
                <div className="w-1/2">

                </div>
                <div className="w-1/2">
            
                </div>
            </div>
        </div>
        
    )
}

export default TripDetail