
// Format Date Function

export const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return `${date.getMonth() + 1}/${date.getDate()}`
}


// Stores all dates between start + end dates of a trip

export const getDaysBetween = (start: string, end: string): Date[] => {
    const days: Date[] = []
    const startDate = new Date(start)
    const endDate = new Date(end)

    while (startDate <= endDate) {
        days.push(new Date(startDate))
        startDate.setDate(startDate.getDate() + 1)
    }

    return days
}

// Get distance between two places using Haversine formula

export const getDistanceBetween = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
}
