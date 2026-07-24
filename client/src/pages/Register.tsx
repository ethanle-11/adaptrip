import React, { useState } from "react"
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

function Register() {
    const navigate = useNavigate()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [name, setName] = useState('')

    const handleSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault()
        const { error } = await supabase.auth.signUp({ email, password, options: { data: { name } } })
        if (error) {
            setError(error.message)
        } else {
            navigate('/login');
        }
    }
    return (
        <div className="min-h-screen flex">
            {/* Left side - branding */}
            <div className="hidden md:flex w-1/2 bg-teal-600 flex-col justify-center items-center text-white p-12">
                <h1 className="text-5xl font-bold mb-4">AdapTrip</h1>
                <p className="text-teal-100 text-lg text-center max-w-xs">Smart travel planning that adapts to the unexpected</p>
            </div>
    
            {/* Right side - form */}
            <div className="w-full md:w-1/2 flex items-center justify-center p-8 bg-gray-50">
                <div className="w-full max-w-md">
                    <h2 className="text-3xl font-bold mb-2">Create an account</h2>
                    <p className="text-gray-500 mb-8">Start planning smarter trips today</p>
    
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-gray-700">Full Name</label>
                            <input 
                                className="border border-gray-200 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-teal-500" 
                                type="text" 
                                placeholder="Ethan Le" 
                                value={name} 
                                onChange={(e) => setName(e.target.value)} 
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-gray-700">Email</label>
                            <input 
                                className="border border-gray-200 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-teal-500" 
                                type="email" 
                                placeholder="you@example.com" 
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)} 
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-gray-700">Password</label>
                            <input 
                                className="border border-gray-200 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-teal-500" 
                                type="password" 
                                placeholder="••••••••" 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                            />
                        </div>
    
                        {error && <p className="text-red-500 text-sm">{error}</p>}
    
                        <button 
                            className="bg-teal-600 text-white py-3 rounded-lg font-semibold hover:brightness-95 cursor-pointer mt-2" 
                            type="submit"
                        >
                            Create Account
                        </button>
                    </form>
    
                    <p className="text-center text-sm text-gray-500 mt-6">
                        Already have an account? <Link className="text-teal-600 font-medium hover:underline" to="/login">Sign in</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default Register