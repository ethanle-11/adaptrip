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
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
                <h1 className="text-2xl font-bold mb-6 text-center">Create Account</h1>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <input className="border rounded-lg p-3 w-full" type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} />
                    <input className="border rounded-lg p-3 w-full" type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} />
                    <input className="border rounded-lg p-3 w-full" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
                    <button className="bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700" type="submit">Create Account</button>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <Link className="text-center text-sm text-blue-600" to="/login">Already have an account? Login</Link>
                </form>
            </div>
        </div>
    )
}

export default Register