import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import Navbar from '../components/Navbar'
import { formatDate, getDaysBetween } from '../lib/utils'
import { Map, AdvancedMarker, useMap } from '@vis.gl/react-google-maps'
import { useDebounce } from 'use-debounce'
import axios from 'axios'


function TripDetail() {
    const { id } = useParams()
    const [trip, setTrip] = useState(null)
    const [activities, setActivities] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const navigate = useNavigate()
    const [openDays, setOpenDays] = useState<Set<number>>(new Set())
    const [searchingDayIndex, setSearchingDayIndex] = useState<number | null>(null)
    const [searchResults, setSearchResults] = useState([])
    const [searchQuery, setSearchQuery] = useState('')
    const [debouncedQuery] = useDebounce(searchQuery, 500)
    const map = useMap()
    const [expandedActivityId, setExpandedActivityId] = useState<string | null> (null)

    const [editActivity, setEditActivity] = useState({
        start_time: '',
        duration: null as number | null,
        category: '',
        priority: null as number | null,
    })
    

    // Collapsible day function

    const toggleDay = (index: number) => {
        setOpenDays(prev => {
            const newSet = new Set(prev)
            if (newSet.has(index)) {
                newSet.delete(index)
                setSearchingDayIndex(null)
            } else {
                newSet.add(index)
            }
            return newSet
        })
    }

    // Activity Edit function

    const toggleEditActivity = (activity: any) => {
        if (activity.id === expandedActivityId) {
            setExpandedActivityId(null)
        } else {
            setExpandedActivityId(activity.id)
            setEditActivity({
                start_time: activity.start_time || '',
                duration: activity.duration,
                category: activity.category || '',
                priority: activity.priority

            })
        }
        
    }

    // Fetch activities function

    const fetchActivities = useCallback(async () => {
        try {
            const { data: activitiesData, error: activitiesError} = await supabase.from('activities').select('*').eq('trip_id', id)
                    if (activitiesError) throw activitiesError
                    setActivities(activitiesData)
        } catch (error: any) {
            setError(error.message || "Failed to fetch activities")
        }
    }, [id])
            
    // Select Activity Function 

    const handleSelectPlace = async (place: any) => {
        try {
            await supabase
            .from('activities')
            .insert({   
                trip_id: id,
                title: place.displayName.text,
                latitude: place.location.latitude,
                longitude: place.location.longitude,
                address: place.formattedAddress,
                day_index: searchingDayIndex
            })

            await fetchActivities()

            setSearchQuery('')
            setSearchResults([])
            setSearchingDayIndex(null)

        } catch (error) {
            setError("Failed to add activity")
        }
    }

    // Delete Activity Function

    const handleDeleteActivity = async (activityId: string) => {
        try {
            await supabase
            .from('activities')
            .delete()
            .eq('id', activityId)

            await fetchActivities()

        } catch (error) {
            setError("Failed to delete activity")
        }
    }

    // Update Activity Function

    const handleUpdateActivity = async () => {
        if (!expandedActivityId) return

        try {
            await supabase
            .from('activities')
            .update({
                start_time: editActivity.start_time || null,
                duration: editActivity.duration,
                category: editActivity.category || null,
                priority: editActivity.priority
            })
            .eq('id', expandedActivityId)

            await fetchActivities()

            setExpandedActivityId(null)
        } catch (error) {
            setError('Failed to update activity')
        }
    }

    

    // fetch trips effect

    useEffect(() => {


        const fetchTripData = async () => {
            try {
                const { data, error } = await supabase.from('trips').select('*').eq('id', id).single()
                if (error) throw error
                setTrip(data)

                await fetchActivities()

            } catch (error) {
                setError("Something went wrong")
            } finally {
                setLoading(false)
            }
        }
        fetchTripData()
     
    }, [id, fetchActivities])

    // Search activities effect

    useEffect(() => {

        const searchPlaces = async () => {
            if (!debouncedQuery) {
                setSearchResults([])
                return
            }

            const placesResponse = await axios.get(`${import.meta.env.VITE_API_URL}/api/places/search`, {
                params: {
                    query: debouncedQuery
                }
            })
            setSearchResults(placesResponse.data.places)
        }
        searchPlaces()

    }, [debouncedQuery])

    // Pan map to destination

    useEffect(() => {
        
        if (map && trip) {
            const panToDestination = async () => {
                const geoResponse = await axios.get(`${import.meta.env.VITE_API_URL}/api/geocoding/location`, {
                    params: {
                        destination: trip.destination
                    }
                })

                map?.panTo({ lat: geoResponse.data.lat, lng: geoResponse.data.lng })
                map?.setZoom(6)
            }
            panToDestination()
        }
    }, [map, trip])


    if (loading) return <div className="min-h-screen flex items-center justify-center"><h1>Loading...</h1></div>
    
    if (error) return <div className="min-h-screen flex items-center justify-center"><h1>There's a problem loading this page.</h1></div>

    const days = getDaysBetween(trip?.start_date, trip?.end_date)

    return (
        <div className="h-screen flex flex-col overflow-hidden">
            <Navbar />
            <div className="flex flex-1 overflow-hidden">
                <div className="w-1/2 overflow-y-auto p-6">
                    <button onClick={() => navigate('/dashboard')} className="text-sm text-gray-500 hover:underline mb-4 cursor-pointer">← Back to Trips</button> 
                    <h1 className="text-3xl font-bold">{trip?.title}</h1>
                    <p className="text-gray-500">{trip?.destination} • {formatDate(trip?.start_date)} → {formatDate(trip?.end_date)}</p>

                    {days.map((day, index) => (
                        <div key={index} className="mb-6 bg-white rounded-xl shadow p-4">
                            <div onClick={() => toggleDay(index)}
                                className="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50 rounded-xl"
                            >
                                <h2 className="text-lg font-semibold">
                                    Day {index + 1} <span className='text-gray-400 font-normal'>- {formatDate(day.toISOString())}</span>
                                </h2>
                                <span className="text-gray-400">{openDays.has(index) ? '▼' : '◀'}</span>
                            </div>

                            {openDays.has(index) && (
                                <div className="px-4 pb-4">
                                    { activities
                                        .filter(activity => activity.day_index === index)
                                        .map(activity => (
                                            <div key={activity.id}>
                                                <div 
                                                    className="w-full py-4 border-b border-gray-300 last:border-0 flex justify-between items-center group cursor-pointer"
                                                    onClick={() => toggleEditActivity(activity)}
                                                >
                                                    <div>
                                                        <p className="text-sm font-medium">{activity.title}</p>
                                                        <p className="text-xs text-gray-400">{activity.address}</p>
                                                    </div>
                                                    <button 
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            handleDeleteActivity(activity.id)
                                                        }} 
                                                        className="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">✖
                                                    </button>
                                                </div>

                                                {/* Activity Edit Panel */}

                                                {expandedActivityId === activity.id && (
                                                    <div className="bg-gray-50 rounded-lg p-4 mt-1">
                                                        <div className="flex gap-4">
                                                            {/* Start Time */}
                                                            <div className="flex flex-col gap-1 flex-1">
                                                                <label className="text-xs text-gray-500 font-medium">Start Time</label>
                                                                <input 
                                                                    type="time" 
                                                                    value={editActivity.start_time || ''} 
                                                                    onChange={(e) => setEditActivity(prev => ({ ...prev, start_time: e.target.value}))} 
                                                                    className="border border-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                                                                />
                                                            </div>
                                                            {/* Duration */}
                                                            <div className="flex flex-col gap-1 flex-1">
                                                                <label className="text-xs text-gray-500 font-medium">Duration</label>
                                                                <input 
                                                                    type="number" 
                                                                    value={editActivity.duration ?? ''} 
                                                                    onChange={(e) => setEditActivity(prev => ({ ...prev, duration: e.target.value ? Number(e.target.value): null}))} 
                                                                    className="border border-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                                                                />
                                                            </div>
                                                            {/* Category */}
                                                            <div className="flex flex-col gap-1 flex-1">
                                                                <label className="text-xs text-gray-500 font-medium">Category</label>
                                                                <select
                                                                    value={editActivity.category || ''}
                                                                    onChange={(e) => setEditActivity(prev => ({ ...prev, category: e.target.value}))}
                                                                    className="border border-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                                                                >
                                                                    <option value="">Select Category</option>
                                                                    <option value="indoor">Indoor</option>
                                                                    <option value="outdoor">Outdoor</option>
                                                                    <option value="mixed">Mixed</option>
                                                                </select>
                                                            </div>
                                                            {/* Priority */}
                                                            <div className="flex flex-col gap-1 flex-1">
                                                                <label className="text-xs text-gray-500 font-medium">Priority</label>
                                                                <input 
                                                                    type="number" 
                                                                    min={1} max={5} 
                                                                    value={editActivity.priority || ''} 
                                                                    onChange={(e) => setEditActivity(prev => ({ ...prev, priority: e.target.value ? Number(e.target.value) : null}))} 
                                                                    className="border border-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                                                                />
                                                            </div>

                                                        </div>

                                                        {/* Update activity submit button */}

                                                        <div className="flex justify-end mt-3">
                                                            <button 
                                                                className="bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:brightness-95 cursor-pointer"
                                                                onClick={() => handleUpdateActivity()}
                                                            >
                                                                Save Changes
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    }

                                    {/* Search Results */}

                                    {searchingDayIndex === index ? (
                                        <div>
                                            <input 
                                                type='search' 
                                                autoFocus 
                                                placeholder="Search for attractions..."
                                                className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 mt-2"
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}    
                                            />
                                            {searchResults.length > 0 && (
                                                <div className="bg-white border border-gray-200 rounded-lg shadow-lg mt-1 overflow-hidden">
                                                    {searchResults.map((place, index) => (
                                                        <div key={index} onClick={() => handleSelectPlace(place)} className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0">
                                                            <p className="text-sm font-medium">{place.displayName.text}</p>
                                                            <p className="text-xs text-gray-400">{place.formattedAddress}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                                
                                        </div>
                                        
                                    ) : (
                                        <button 
                                            className="text-sm text-teal-600 py-2 hover:underline mt-2 cursor-pointer" 
                                            onClick={ () => {
                                                setSearchingDayIndex(index) 
                                                setSearchQuery('')
                                                setSearchResults([])
                                            }}>
                                            + Add Activity
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
                <div className="w-1/2 sticky top-0 h-full">
                    <Map
                        mapId="adaptrip-map" 
                        style={{ height: '100%', width: '100%', borderRadius: '12px' }}
                        defaultCenter={{ lat: 20, lng: 0 }}
                        defaultZoom={2}
                        gestureHandling={'greedy'}
                    >
                        {activities.map(activity => (
                            <AdvancedMarker
                                key={activity.id}
                                position={{ lat: activity.latitude, lng: activity.longitude}}
                            />
                        ))}
                    </Map>
                </div>
            </div>
        </div>
        
    )
}

export default TripDetail