import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useState, useEffect } from 'react'

function Navbar() {
    const [userName, setUserName] = useState(null)
    const navigate = useNavigate()

    useEffect (() => { 
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            setUserName(user?.user_metadata?.name || '')
        }
        getUser()
    }, [])


    const handleLogout = async () => {
        await supabase.auth.signOut()
        navigate('/login')
    }


    return (
        <nav className="bg-white shadow px-6 py-4 flex justify-between items-center">
            <h1 className="text-xl font-bold">AdapTrip</h1>
            <div className="flex items-center gap-4">
                <span>{userName}</span>
                <button onClick={handleLogout} className="text-sm text-red-500 hover:underline cursor-pointer">Logout</button>
            </div>
        </nav>
    )
    
}

export default Navbar