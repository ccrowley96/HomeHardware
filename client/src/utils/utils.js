import moment from 'moment-timezone';
const randomstring = require('randomstring');

moment().tz("America/Toronto").format();

export async function isLoggedIn(){
    await updateEmployeePasswordRequired();
    let loggedIn = false;
    
    let employee = JSON.parse(localStorage.getItem('employee'));
    let passwordRequired = JSON.parse(localStorage.getItem('passwordRequired'));
    if(passwordRequired?.required === false){
        loggedIn = true;
    }
    else{
        loggedIn = employee?.loggedIn ? employee.loggedIn : false;
    }
    return loggedIn;
}

export async function updateEmployeePasswordRequired(){
    // First check if employee password required
    let response = await fetch(`/api/IsEmployeePasswordRequired`);
    let responseBody = await response.json();
    let storageToSet = JSON.parse(localStorage.getItem('passwordRequired'));
    
    storageToSet = {
        required: responseBody.required
    }
    
    localStorage.setItem('passwordRequired', JSON.stringify(storageToSet));
}

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

export function getSecretAdminHeader(additionalHeaders = null){
    const header = new Headers();
    let secret = JSON.parse(localStorage.getItem('admin'))?.secret;
    header.append('secret', secret);
    if(additionalHeaders){
        for(let addHead of additionalHeaders){
            for(let addHeadKey of Object.keys(addHead)){
                header.append(addHeadKey, addHead[addHeadKey])
            }
        }
    }
    return header;
}

export function getSecretEmployeeHeader(additionalHeaders = null){
    const header = new Headers();
    let secret = JSON.parse(localStorage.getItem('employee'))?.secret;
    header.append('secret', secret);
    if(additionalHeaders){
        for(let addHead of additionalHeaders){
            for(let addHeadKey of Object.keys(addHead)){
                header.append(addHeadKey, addHead[addHeadKey])
            }
        }
    }
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