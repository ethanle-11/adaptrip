
{/* Format Date Function */}

export const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return `${date.getMonth() + 1}/${date.getDate()}`
}


{/* Stores all dates between start + end dates of a trip */}

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
