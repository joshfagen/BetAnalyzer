export default async function modifyCurrentDate(currentDate) {
    if(currentDate > 100000) {
        currentDate = new Date(currentDate)
    }
    let currentMonth = currentDate.getMonth() + 1;
    let currentDay = currentDate.getDate();
    let currentYear = currentDate.getFullYear().toString().slice(-2,);
    let currentDateRightFormat = {}
    currentDateRightFormat = `${currentMonth}/${currentDay}/${currentYear}`
    

    return [currentDateRightFormat, currentMonth, currentDay, currentYear]
}