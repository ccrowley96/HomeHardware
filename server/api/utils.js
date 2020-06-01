const moment = require('moment-timezone');
const CronJob = require('cron').CronJob;
const {Item, Room } = require('../db/db_index');

moment().tz("America/Toronto").format();

exports.secondsInYear = 31104000;
// Function to create two new lists for today (only if they are not already created)
exports.createTodaysLists = async () => {
    // Generate list codes
    let storeCodes = this.getTodaysListCodes();
    //Check if list codes already in DB
    for(let storeCode of storeCodes){
        roomCodeCheck = await Room.find({roomCode: storeCode});
        if(roomCodeCheck.length === 0){
            // If not, create lists for each code
            let expireAt = new Date(Date.now() + exports.secondsInYear);
            let dispDate = moment(storeCode.slice(1), 'MMDDYY').format('MM/DD');
            let room = new Room({
                roomCode: storeCode, 
                expireAt: expireAt, 
                roomName: storeCode[0]  === 'c' ? `Carp ${dispDate}` : `Woodlawn ${dispDate}`});
            // Save new room using roomCode
            try {
                let roomCreated = await room.save();
            } catch (err) {
                console.log(err);
            }
        }
    }
};

exports.getTodaysListCodes = () => {
    let today = new Date();
    let millis = Date.parse(today);
    let dateString = moment(millis).tz("America/Toronto").format('MMDDYY');
    return ['w'+dateString, 'c'+dateString];
}

exports.scheduleListCreator = () => {
    const job = new CronJob({
        // Run at 05:00 Central time, only on weekdays
        cronTime: '00 00 * * *',
        onTick: function() {
            // Run whatever you like here..
            console.log(`Creating today's lists @: ${moment(Date.parse(new Date)).tz("America/Toronto").format("ddd, MMM Do, h:mm a")}`);
            exports.createTodaysLists();
        },
        start: true,
        timeZone: 'US/Eastern'
      });
}