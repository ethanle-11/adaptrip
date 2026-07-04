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

const interestOptions = [
    { value: 'hiking', label: 'Hiking' },
    { value: 'food', label: 'Food & Dining' },
    { value: 'museums', label: 'Museums' },
    { value: 'beaches', label: 'Beaches' },
    { value: 'nightlife', label: 'Nightlife' },
    { value: 'shopping', label: 'Shopping' },
    { value: 'history', label: 'History' },
    { value: 'art', label: 'Art' },
    { value: 'nature', label: 'Nature' },
    { value: 'adventure', label: 'Adventure' },
    { value: 'photography', label: 'Photography' },
    { value: 'wellness', label: 'Wellness & Spa' },
]

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
    const [budget, setBudget] = useState<number | null> (null)
    const [interests, setInterests] = useState<{value: string; label: string}[]>([])
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
                budget, 
                interests: interests.map(i => i.value), 
                user_id: user.id
            })
        if (error) {
            setError(error.message)
        } else {
            navigate('/dashboard')
        }
    }

    return (
        <div>
            <Navbar />
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-lg">
                <h1 className="text-2xl font-bold mb-6">Create a New Trip</h1>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    {/* Trip name input */}
                    <input className="border rounded-lg p-3" type="text" placeholder="Trip Title" value={title} onChange={(e) => setTitle(e.target.value)} />

                    {/* Destination Input */}
                    <Select
                        styles={selectStyles}
                        options={countryOptions}
                        onChange={(option: SingleValue<{ value: string, label: string}>) => setDestination(option?.value || '')}
                        placeholder="Enter your destination: e.g. Japan"
                    />

                    {/* Date selector */}

                    <div className="relative">
                        <button type="button" onClick={() => setShowCalendar(!showCalendar)} className = "border rounded-lg p-3 w-full text-left">
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
                    
                    {/* Budget Input */}
                    <input className="border rounded-lg p-3" type="number" placeholder="Budget (Optional) e.g. 2000" value={budget ?? ''} onChange={(e) => setBudget(e.target.value ? Number(e.target.value) : null)} />

                    {/* Interests Input */}
                    <Select
                    styles={selectStyles}
                        isMulti
                        options={interestOptions}
                        value={interests}
                        onChange={(selected) => setInterests(selected as { value: string; label: string}[])}
                        placeholder="Interests (optional)"
                        maxMenuHeight={200}
                    />

                    {error && <p className="self-center text-red-500 text-sm">{error}</p>}


                    {/* Submit button */}
                    <button className="self-center bg-teal-600 text-white py-3 rounded-2xl font-semibold hover:brightness-95 cursor-pointer w-xs" type="submit" >Let's Travel</button>

                </form>
                </div>
            </div>
        </div>
    )
}

export default CreateTrip