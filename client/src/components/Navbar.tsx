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
            <button onClick={() => navigate('/dashboard')} className="text-xl text-slate-700 font-bold transition-colors hover:text-teal-600 cursor-pointer">
                AdapTrip
            </button>            
            <div className="flex items-center gap-4">
                <span className="font-bold text-slate-700">{userName}</span>
                <button onClick={handleLogout} className="bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:brightness-95 cursor-pointer">
                    Logout
                </button>
            </div>
        </nav>
    )
    
}

export default Navbar