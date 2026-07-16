import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import placesRouter from './routes/places'
import geocodingRouter from './routes/geocoding'
import weatherRouter from './routes/weather'
import adaptationRouter from './routes/adapt'

dotenv.config()

const app = express()
app.use(cors())
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

