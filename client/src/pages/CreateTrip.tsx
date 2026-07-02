import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

function CreateTrip() {
    const [title, setTitle] = useState('')
    const [destination, setDestination] = useState('')
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [budget, setBudget] = useState(0)
    const [interests, setInterests] = useState([])
    const [error, setError] = useState('')
    const navigate = useNavigate()

    const handleSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault()
        if (!title || !destination || !startDate || !endDate) {
            setError('Please fill in all required fields.')
            return
        }
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            setError('You must be logged in to create a trip.')
            return
        }
        const { error } = await supabase
            .from('trips')
            .insert({
                title, 
                destination, 
                start_date: startDate, 
                end_date: endDate, 
                budget, 
                interests, 
                user_id: user.id
            })
        if (error) {
            setError(error.message)
        } else {
            navigate('/dashboard')
        }
    }
}

export default CreateTrip