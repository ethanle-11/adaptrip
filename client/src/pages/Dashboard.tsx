import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'

function Dashboard() {
    const [user, setUser] = useState(null)
    const [trips, setTrips] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const navigate = useNavigate()

    useEffect(() => {

        const fetchTrips = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser()
                setUser(user)
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
    
    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut()
        if (error) {
            setError(error.message)
        } else {
            navigate('/login')
        }
    }
    
    if (loading) return <div className="min-h-screen flex items-center justify-center"><h1>Loading...</h1></div>
    
    if (error) return <div className="min-h-screen flex items-center justify-center"><h1>There's a problem loading this page.</h1></div>

    return (
        <nav>
            <h1>AdapTrip</h1>
        </nav>
    )
}

export default Dashboard
