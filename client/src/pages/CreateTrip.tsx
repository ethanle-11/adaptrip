import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Select, { type SingleValue } from 'react-select'
import { supabase } from '../lib/supabase'
import { getNames } from 'country-list'
import { DayPicker, type DateRange} from 'react-day-picker'
import 'react-day-picker/dist/style.css'
import Navbar from '../components/Navbar'

const countryOptions = getNames().map((country) => ({
    value: country,
    label: country
}))

const selectStyles = {
    control: (base: any) => ({
        ...base,
        border: '1px solid black',
        borderRadius: '8px',
        padding: '8px',
        boxShadow: 'none',
        '&:hover': { border: '1px solid black' },
        '&:focus': { border: '1px solid black' },
    }),
}


function CreateTrip() {
    const [title, setTitle] = useState('')
    const [destination, setDestination] = useState('')
    const [error, setError] = useState('')
    const navigate = useNavigate()
    const [dateRange, setDateRange] = useState<DateRange | undefined> (undefined)
    const [showCalendar, setShowCalendar] = useState(false)

    const handleSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault()
        if (!title || !destination || !dateRange?.from || !dateRange?.to) {
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
                start_date: dateRange?.from?.toISOString().split('T')[0], 
                end_date: dateRange?.to?.toISOString().split('T')[0], 
                user_id: user.id
            })
        if (error) {
            setError(error.message)
        } else {
            navigate('/dashboard')
        }
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="flex items-center justify-center p-8">
                <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-lg">
                    <h1 className="text-2xl font-bold mb-2">Create a New Trip</h1>
                    <p className="text-gray-500 text-sm mb-6">Plan your next adventure</p>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        {/* Trip Title */}
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-gray-700">Trip Title</label>
                            <input 
                                className="border border-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-teal-500" 
                                type="text" 
                                placeholder="e.g. Summer in Japan" 
                                value={title} 
                                onChange={(e) => setTitle(e.target.value)} 
                            />
                        </div>
    
                        {/* Destination */}
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-gray-700">Destination</label>
                            <Select
                                styles={selectStyles}
                                options={countryOptions}
                                onChange={(option: SingleValue<{ value: string, label: string}>) => setDestination(option?.value || '')}
                                placeholder="Select a country..."
                            />
                        </div>
    
                        {/* Date selector */}
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-gray-700">Travel Dates</label>
                            <div className="relative">
                                <button 
                                    type="button" 
                                    onClick={() => setShowCalendar(!showCalendar)} 
                                    className="border border-gray-200 rounded-lg p-3 w-full text-left text-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                                >
                                    {dateRange?.from && dateRange?.to   
                                        ? `${dateRange.from.toLocaleDateString('en-US', {month: 'long', day: 'numeric'})} → ${dateRange.to.toLocaleDateString('en-US', {month: 'long', day: 'numeric'})}`
                                        : 'Select travel dates'
                                    }
                                </button>
                                {showCalendar && (
                                    <div className="absolute z-10 bg-white shadow-lg rounded-xl mt-1">
                                        <DayPicker
                                            mode="range"
                                            selected={dateRange}
                                            onSelect={setDateRange}
                                            disabled={{ before: new Date()}}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
    
                        {error && <p className="text-red-500 text-sm">{error}</p>}
    
                        <button 
                            className="bg-teal-600 text-white py-3 rounded-lg font-semibold hover:brightness-95 cursor-pointer mt-2" 
                            type="submit"
                        >
                            Let's Travel
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default CreateTrip