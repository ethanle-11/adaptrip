import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import placesRouter from './routes/places'
import geocodingRouter from './routes/geocoding'
import weatherRouter from './routes/weather'
import adaptationRouter from './routes/adapt'

dotenv.config()

const app = express()
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || origin.includes('vercel.app') || origin === 'http://localhost:5173') {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'))
        }
    }
}))
app.use(express.json())
app.use('/api/places', placesRouter)
app.use('/api/geocoding', geocodingRouter)
app.use('/api/weather', weatherRouter)
app.use('/api/adapt', adaptationRouter)

app.get("/health", (req, res) => {
    res.json({ status: 'ok'})
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})

