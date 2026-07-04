import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'

function Dashboard() {
    const [trips, setTrips] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const navigate = useNavigate()

    useEffect(() => {

        const fetchTrips = async () => {
            try {
                const { data, error } = await supabase.from('trips').select('*')
                if (error) throw error
                setTrips(data)
            } catch (error) {
                setError("Something went wrong")
            } finally {
                setLoading(false)
            }
        }
        fetchTrips()
            
    }, [])
    
    if (loading) return <div className="min-h-screen flex items-center justify-center"><h1>Loading...</h1></div>
    
    if (error) return <div className="min-h-screen flex items-center justify-center"><h1>There's a problem loading this page.</h1></div>

    return (
        <div>
            <Navbar />
            <main className="max-w-4xl mx-auto p-6">
                <div className="flex justify-between">
                    <h2 className="text-4xl font-bold">Your Trips</h2>
                    <button onClick = {() => navigate("/create")} className="bg-teal-600 text-white px-4 py-2 rounded-2xl hover:brightness-95 cursor-pointer">+ Add New Trip</button>
                </div>

                {trips.length === 0 ? (
                    <div className="text-center text-gray-400 mt-12">
                        <p className="text-lg">No trips yet!</p>
                        <p className="text-sm">Create your first trip to get started</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                        {trips.map((trip) => (
                            <div key={trip.id} onClick={() => navigate(`/trips/${trip.id}`)} className="bg-white rounded-xl shadow p-5 hover:shadow-md transition cursor-pointer">
                                <h3 className="text-lg font-semibold">{trip.title}</h3>
                                <p className="text-gray-500 text-sm">{trip.destination}</p>
                                <p className="text-gray-400 text-sm">{trip.start_date} → {trip.end_date}</p>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
        

    )
}

export default Dashboard
