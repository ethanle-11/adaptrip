import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { formatDate  } from '../lib/utils'

function Dashboard() {
    const [trips, setTrips] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const navigate = useNavigate()

    // Trip Deletion State
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [tripToDelete, setTripToDelete] = useState('')

    // Delete Trip

    const handleDeleteTrip = async () => {
        try {
            const { error: deleteTripError } = await supabase.from('trips').delete().eq('id', tripToDelete)
            if (deleteTripError) throw deleteTripError

            fetchTrips()
            setShowDeleteConfirm(false) 
        } catch (error) {
            setError('Unable to delete trip')
        }
    }

    // Fetch Trips

    const fetchTrips = useCallback(async () => {
                try {
                    const { data, error } = await supabase.from('trips').select('*')
                    if (error) throw error
                    setTrips(data)
                } catch (error) {
                    setError("Something went wrong")
                } finally {
                    setLoading(false)
                }
            }, [])


    useEffect(() => {
        fetchTrips()    
    }, [])
    
    if (loading) return (
        <div>
            <Navbar />
            <main className="max-w-4xl mx-auto p-6">
                <div className="flex justify-between">
                    <div className="h-10 w-48 bg-gray-200 rounded animate-pulse" />
                    <div className="h-10 w-24 bg-gray-200 rounded animate-pulse" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    {Array.from({ length: 4}).map((_, i) => (
                        <div key={i} className="animate-pulse bg-white rounded-xl shadow p-5">
                            <div className="h-5 w-3/4 bg-gray-200 rounded mb-3" />
                            <div className="h-4 w-1/2 bg-gray-200 rounded mb-2" />
                            <div className="h-3 w-1/3 bg-gray-200 rounded" />
                        </div>
                    ))}
                </div>

            </main>
        </div>
    )
    
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
                            <div key={trip.id} onClick={() => navigate(`/trips/${trip.id}`)} className="flex justify-between bg-white rounded-xl shadow-lg p-5 hover:shadow-xl transition group cursor-pointer">
                                <div>
                                    <h3 className="text-lg font-semibold">{trip.title}</h3>
                                    <p className="text-gray-500 text-sm">{trip.destination}</p>
                                    <p className="text-gray-400 text-sm">{formatDate(trip.start_date)} → {formatDate(trip.end_date)}</p>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation() 
                                        setShowDeleteConfirm(true)
                                        setTripToDelete(trip.id)
                                    }}
                                    className="opacity-0 group-hover:opacity-100 transition-all duration 200 cursor-pointer hover:scale-150"
                                >✖
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4">
                        <h2 className="text-lg font-bold mb-2">Delete Trip</h2>
                        <p className="text-gray-500 text-sm mb-6">Are you sure you want to delete this trip? This action cannot be undone.</p>
                        <div className="flex justify-end gap-3">
                            <button 
                                onClick={() => setShowDeleteConfirm(false)}
                                className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleDeleteTrip}
                                className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 cursor-pointer"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
        </div>

    )
}

export default Dashboard
