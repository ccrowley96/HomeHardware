import moment from 'moment-timezone';
moment().tz("America/Toronto").format();

export function formatTime(date){
    let millis = Date.parse(date);
    return moment(millis).tz("America/Toronto").format("ddd, MMM Do, h:mm a")
}

export function formatDayOfWeekFromRoomCode(roomCode){
    let dateString = roomCode.slice(1);
    let dateFormat = 'MMDDYY';
    let momentObj = moment(dateString, dateFormat).format("dddd")
    return momentObj;
}

export function isRoomCodeToday(roomCode){
    let dateString = roomCode.slice(1);
    let dateFormat = 'MMDDYY';
    let momentObj = moment(dateString, dateFormat);
    if(momentObj.isSame(moment(), 'day')){
        return true;
    }
    return false;
}

export function getSecretHeader(){
    const header = new Headers();
    let secret = JSON.parse(localStorage.getItem('admin'))?.secret;
    header.append('secret', secret);
    return header;
}

export function sortRooms(rooms){
    let sortedRooms = rooms.sort((a, b) => {
        let dateStringA = a.roomCode.slice(1), dateStringB = b.roomCode.slice(1);
        let dateFormat = 'MMDDYY';
        let momentObjA = moment(dateStringA, dateFormat), momentObjB = moment(dateStringB, dateFormat);
        let result = momentObjA.diff(momentObjB);
        return result >= 0 ? 1 : -1;
    });
    return sortedRooms;
}

export const groceryCategories = [
    "Uncategorized",
    "Baking",
    "Beverages",
    "Bread/Bakery",
    "Canned Goods",
    "Cereal/Breakfast",
    "Condiments",
    "Dairy/Dairy Free",
    "Deli",
    "Frozen Foods",
    "Fruits & Vegetables",
    "Meat & Seafood",
    "Non-Food Items",
    "Pasta/Rice",
    "Personal Care",
    "Snacks",
    "Sweets/Desserts",
    "Spices",
    "Other",
]