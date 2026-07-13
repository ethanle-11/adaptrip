import { Router } from 'express'
import axios from 'axios'

const router = Router()

router.get('/forecast', async (req, res) => {
    const { lat, lng, days } = req.query
    try {
        const response = await axios.get(
            'https://api.open-meteo.com/v1/forecast', {
                params: {
                    'latitude': lat,
                    'longitude': lng,
                    daily: 'weathercode,precipitation_sum,temperature_2m_max,precipitation_probability_max',
                    forecastDays: days,
                    timezone: 'auto'
                }
            }
        )
        const daily = response.data.daily
        const forecast = daily.time.map((date: string, index: number) => ({
            date,
            weatherCode: daily.weathercode[index],
            precipitationSum: daily.precipitation_sum[index],
            precipitationProbability: daily.precipitation_probability_max[index],
            maxTemp: daily.temperature_2m_max[index]

        }))
        res.json({ forecast })
    } catch (error: any) {
        console.error(error.response?.data)
        res.status(500).json({ error: "Something went wrong"})
    }
})

export default router

