const moment = require('moment-timezone');
const CronJob = require('cron').CronJob;
const {Item, Room, Employee } = require('../db/db_index');

moment().tz("America/Toronto").format();

exports.secondsInYear = 365*24*60*60*1000;
exports.listTimeFrame = 7;
// Function to create two new lists for this week (only if they are not already created)
exports.createListsInTimeFrame = async (timeFrame) => {
    for(let offset = 0; offset < timeFrame; offset++){
        // Generate list codes for today + offset
        let storeCodes = this.getOffsetListCodes(offset);

        //Check if list codes already in DB
        for(let storeCode of storeCodes){
            roomCodeCheck = await Room.find({roomCode: storeCode});
            if(roomCodeCheck.length === 0){
                // If not, create lists for each code
                let expireAt = new Date(Date.now() + exports.secondsInYear);
                let dispDate = moment(storeCode.slice(1), 'MMDDYY').format('MM/DD/YY');
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
    }
};

exports.getOffsetListCodes = (offset) => {
    let target = new Date();
    target.setDate(target.getDate() + offset)
    let millis = Date.parse(target);
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
            exports.createListsInTimeFrame(exports.listTimeFrame);
        },
        start: true,
        timeZone: 'US/Eastern'
      });
}

exports.createOrVerifyEmployeePassword = async () => {
    // Check if entry is already in Employee
    let employeeDbCount = await Employee.find().count();
    if(employeeDbCount === 0){
        // Create new employee entry with password
        const employee = new Employee({
            password: process.env.DEFAULT_EMPLOYEE_PASSWORD
        })
        employee.save();
    } else{
        // Password already created
        return;
    }
}