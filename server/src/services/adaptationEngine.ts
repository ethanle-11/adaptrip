import { getDistanceBetween } from '../lib/utils'

interface Activity {
    id: string,
    title: string,
    category: string
    priority: number,
    day_index: number,
    latitude: number,
    longitude: number
}

interface ForecastDay {
    date: string,
    weatherCode: number,
    precipitationSum: number,
    precipitationProbability: number,
    maxTemp: number
}

interface Recommendation {
    dayIndex: number,
    reason: string,
    affectedActivity: Activity,
    suggestedAlternatives: Activity[]
}

export const runAdaptation = (activities: Activity[], forecast: ForecastDay[], startDate: string, endDate: string): Recommendation[] => {
    if (activities.length === 0 || forecast.length === 0) return []

    // Check if trip dates fall in projected forecast
    const tripStart = new Date(startDate)
    const tripEnd = new Date(endDate)
    const tripForecast = forecast.filter(day => {
        const forecastDate = new Date(day.date)
        return forecastDate >= tripStart && forecastDate <= tripEnd
    })

    const recommendations: Recommendation[] = []
    for (const day of tripForecast) {
        if((day.weatherCode >= 51 && day.weatherCode <= 99) || day.precipitationProbability > 50) {
            const forecastDate = new Date(day.date)
            const dayIndex = Math.round((forecastDate.getTime() - tripStart.getTime()) / 86400000)
            const affectedActivities = activities.filter(activity => {
                return activity.day_index === dayIndex && activity.category === 'outdoor'
            })

            if (affectedActivities.length === 0) {
                continue
            } else {
                for (const affectedActivity of affectedActivities) {
                    const suggestions = activities
                    .filter(activity => {
                        const distance = getDistanceBetween(
                            affectedActivity.latitude,
                            affectedActivity.longitude,
                            activity.latitude,
                            activity.longitude
                        )
                        return (activity.category === 'indoor' || activity.category === 'mixed') && (activity.day_index !== dayIndex && distance < 10)
                    })
                    .sort((a, b) => b.priority - a.priority)
                    .slice(0, 3)

                    recommendations.push({
                        dayIndex: dayIndex,
                        reason: `Bad Weather forecast - ${day.weatherCode >= 51 ? 'Rain/storm expected' : 'High precipitation probability'}`,
                        affectedActivity: affectedActivity,
                        suggestedAlternatives: suggestions
                    })

                }
            }

            
        }
    }

    return recommendations
}