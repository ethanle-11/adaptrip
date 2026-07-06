import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import Navbar from '../components/Navbar'
import { formatDate, getDaysBetween } from '../lib/utils'
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
    const [openDayIndex, setOpenDayIndex] = useState<number | null> (null)

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

    const days = getDaysBetween(trip?.start_date, trip?.end_date)

    return (
        <div>
            <Navbar />
            <div className="px-6 py-4">
                <button onClick={() => navigate('/dashboard')} className="text-sm text-gray-500 hover:underline mb-4 cursor-pointer">← Back to Trips</button> 
                <h1 className="text-3xl font-bold">{trip?.title}</h1>
                <p className="text-gray-500">{trip?.destination} • {formatDate(trip?.start_date)} → {formatDate(trip?.end_date)}</p>
            </div>
            <div className="flex gap-6 px-6 py-4">
                <div className="w-1/2">
                    {days.map((day, index) => (
                        <div key={index} className="mb-6 bg-white rounded-xl shadow p-4">
                            <div onClick={() => setOpenDayIndex(openDayIndex === index ? null : index)}
                                className="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50 rounded-xl"
                            >
                                <h2 className="text-lg font-semibold">
                                    Day {index + 1} <span className='text-gray-400 font-normal'>- {formatDate(day.toISOString())}</span>
                                </h2>
                                <span className="text-gray-400">{openDayIndex === index ? '▼' : '◀'}</span>
                            </div>

                            {openDayIndex === index && (
                                <div className="px-4 pb-4">

                                    <button className="text-sm text-teal-600 hover:underline mt-2 cursor-pointer">+ Add Activity</button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
                <div className="w-1/2">
                    <div className="sticky top-4">
                        <MapContainer
                            center={[20, 0]}
                            zoom={2}
                            style={{ height: '500px', width: '100%', borderRadius: '12px'}}
                        >
                            <TileLayer 
                                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                                attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                            />

                        </MapContainer>
                    </div>
                </div>
            </div>
        </div>
        
    )
}

export default TripDetail