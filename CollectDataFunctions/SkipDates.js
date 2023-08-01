
export default async function skipDates(currentDate) {
    if(currentDate.getFullYear() == '2022' || currentDate.getFullYear() == '2023'){
        if(currentDate.getMonth() == 10 && currentDate.getDate() == 8 && currentDate.getFullYear() == 2022) {
            currentDate = currentDate.setDate(currentDate.getDate() + 1)
            currentDate = new Date(currentDate)
        }
        if(currentDate.getMonth() == 10 && currentDate.getDate() == 24 && currentDate.getFullYear() == 2022) {
            currentDate = currentDate.setDate(currentDate.getDate() + 1)
            currentDate = new Date(currentDate)
        }
        if(currentDate.getMonth() == 11 && currentDate.getDate() == 24 && currentDate.getFullYear() == 2022) {
            currentDate = currentDate.setDate(currentDate.getDate() + 1)
            currentDate = new Date(currentDate)
        }
        if(currentDate.getMonth() == 1 && currentDate.getDate() == 17 && currentDate.getFullYear() == 2023) {
            currentDate = currentDate.setDate(currentDate.getDate() + 6)
            currentDate = new Date(currentDate)
        }
        if(currentDate.getMonth() == 3 && currentDate.getDate() == 3 && currentDate.getFullYear() == 2023) {
            currentDate = currentDate.setDate(currentDate.getDate() + 1)
            currentDate = new Date(currentDate)
        }
    }

    return currentDate
}