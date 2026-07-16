import { Router } from 'express'
import { runAdaptation } from '../services/adaptationEngine'
import supabase from '../lib/supabase'
import axios from 'axios'

const router = Router()

router.get('/:tripId', async (req, res) => {
    const { tripId } = req.params
    try {
        const {data, error} = await supabase.from('trips').select('*').eq('id', tripId).single()
        if (error) throw error

        const {data: activitiesData, error: activitiesError} = await supabase.from('activities').select('*').eq('trip_id', tripId)
        if (activitiesError) throw activitiesError

        const geoResponse = await axios.get(
            `https://geocode.googleapis.com/v4/geocode/address/${data.destination}`, {
                params: {
                    key: process.env.GOOGLE_MAPS_API_KEY
                }
            }
        )
        const location = geoResponse.data.results[0].location
        const lat = location.latitude
        const lng = location.longitude

        const tripDays = Math.round((new Date(data.end_date).getTime() - new Date(data.start_date).getTime()) / 86400000) + 1
        const weatherResponse = await axios.get(
            'https://api.open-meteo.com/v1/forecast', {
                params: {
                    'latitude': lat,
                    'longitude': lng,
                    daily: 'weathercode,precipitation_sum,temperature_2m_max,precipitation_probability_max',
                    forecast_days: tripDays,
                    timezone: 'auto'
                }
            }
        )
        const daily = weatherResponse.data.daily
        const forecast = daily.time.map((date: string, index: number) => ({
            date,
            weatherCode: daily.weathercode[index],
            precipitationSum: daily.precipitation_sum[index],
            precipitationProbability: daily.precipitation_probability_max[index],
            maxTemp: daily.temperature_2m_max[index]

        }))

        const recommendations = runAdaptation(activitiesData, forecast, data.start_date, data.end_date)
        res.json({ recommendations })


    } catch (error) {
        res.status(500).json({ error: 'Something went wrong.' })
    }
})

export default router