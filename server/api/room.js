const express = require('express');
const router = express.Router();
const randomstring = require('randomstring');
const {Item, Room } = require('../db/db_index');
const utils = require('./utils');
const moment = require('moment-timezone');
const {validateRoom, validateItem, validateAdmin, secondsUntilExpire} = require('./middleware');

var ObjectId = require('mongoose').Types.ObjectId; 

/* --------------- ROOM ROUTING --------------- */
// Create Room
router.post('/', validateAdmin, async (req, res, next) => {
    // Find unique room code
    let roomCodeCheck = null;
    let roomCode = null;
    do{
        roomCode = randomstring.generate({
            length: 6,
            charset: 'alphabetic',
            readable: true,
            capitalization: 'lowercase'
        }).toLowerCase();
        roomCodeCheck = await Room.find({roomCode: roomCode});
    } while(roomCodeCheck.length !== 0);

    let expireAt = new Date(Date.now() + secondsUntilExpire);
    let room = new Room({roomCode, expireAt});

    // Save new room using roomCode
    try {
        let roomCreated = await room.save();
        res.status(200);
        res.json({
            name: roomCreated.roomName,
            roomCode: roomCode,
            id: roomCreated._id
        });
    } catch (err) {
        console.log(err);
        res.sendStatus(500);
    }
});

// Delete Room
router.delete('/:id', validateAdmin, async (req, res, next) => {
    let roomId;
    try{
        roomId = req.params.id;
    } catch(err){
        res.status(400);
        res.send('Missing or incorrect id query parameter');
    }

    try{
        await Room.deleteOne({'_id': new ObjectId(roomId)});
        res.sendStatus(200);
    } catch(err){
        console.log(err);
        res.sendStatus(500);
    }
});

// Fetch room - (used to fetch rooms by id stored in local storage)
router.post('/getMatchingIds', async (req, res, next) => {
    // pull ids from body id []
    let ids;
    try{
        ids = req.body.ids;
    } catch(err){
        res.status(400);
        res.send('Missing or incorrect ids in body');
    }
    
    let matchingRooms = [];
    // fetch matching ids from db and return those rooms
    try{
        for(let id of ids){
            let match = await Room.findById(new ObjectId(id))
            if(match) matchingRooms.push(match);
        }

        res.status(200);
        res.json({
            title: 'Rooms',
            matchingRooms
        });
    } catch(err){
        console.log(err);
        res.sendStatus(500);
    }
});

// Fetch room by room code - (used to fetch rooms by room code stored in local storage)
router.post('/getRoomByCode', async (req, res, next) => {
    // pull ids from body id []
    let roomCode;
    try{
        roomCode = req.body.roomCode;
        if(!roomCode) throw new Error();
    } catch(err){
        res.status(400);
        res.send('Missing or incorrect roomCode in body');
        return;
    }
    roomCode = roomCode.toLowerCase();
    let matchingRooms = [];
    // fetch matching ids from db and return those rooms
    try{
        let match = await Room.findOne({roomCode})
        if(match){
            res.status(200);
            res.json({
                title: 'Rooms',
                match
            });
        } else{
            let sendErrorStatus = (code = 404) => {
                res.status(code);
                res.json({
                    title: 'Rooms',
                    match: null
                })
            }
            if(roomCode.length !== 7 || ['c', 'w', 'C', 'W'].indexOf(roomCode[0]) === -1){
                sendErrorStatus();
                return;
            }
            roomCode = roomCode[0].toLowerCase() + roomCode.slice(1);
            let dateString = roomCode.slice(1);
            let dateFormat = 'MMDDYY';
            let momentObj = moment(dateString, dateFormat);
            let isValidDate = moment(momentObj, dateFormat, true).isValid();

            if(!isValidDate){
                sendErrorStatus();
                return;
            }

            if(Math.abs(momentObj.diff(moment())) > 365*24*60*60*1000){
                sendErrorStatus(406);
                return;
            }

            let dispDate = moment(dateString, dateFormat).format('MM/DD/YY');

            // Create room
            let expireAt = new Date(Date.now() + utils.secondsInYear);
            let room = new Room({
                roomCode, 
                expireAt: expireAt, 
                roomName: roomCode[0] === 'c' ? `Carp ${dispDate}` : `Woodlawn ${dispDate}`});
            // Save new room using roomCode
            let roomCreated;
            try {
                roomCreated = await room.save();
            } catch (err) {
                console.log(err);
            }
            res.status(200);
            res.json({
                title: 'Rooms',
                match: roomCreated
            })
        }
    } catch(err){
        console.log(err);
        res.sendStatus(500);
    }
});

// Fetch today's rooms
router.post('/getTimeframeRooms', async (req, res, next) => {
    let timeframe = 7;
    let matchingRooms = [];
    let codes = [];
    for(let offset = 0; offset < timeframe; offset++){
        codes.push(utils.getOffsetListCodes(offset))
    }
    for(let dayCode of codes){
        try{
            for(let storeCode of dayCode){
                let match = await Room.findOne({roomCode: storeCode});
                if(match) matchingRooms.push(match);
            }
        } catch(err){
            console.log(err);
            res.sendStatus(500);
            return;
        }
    }
    res.status(200);
    res.json({
        title: 'Rooms',
        matchingRooms
    });
});

// Update Room Name
router.post('/:id/changeName', validateAdmin, async (req, res, next) => {
    let roomId;
    let roomName;
    try{
        roomId = req.params.id;
    } catch(err){
        res.status(400);
        res.send('Missing or incorrect id query parameter');
    }

    let room = await Room.findById(new ObjectId(roomId));
    if(room){
        if(!req.body.roomName){
            res.status(400);
            res.send('Incorrect request body (see roomName)');
            return;
        }
        roomName = req.body.roomName;

        await Room.findByIdAndUpdate(new ObjectId(roomId),
            {$set: {"roomName": roomName}}
        )
        res.sendStatus(200);
    } else{
        res.status(404);
        res.send(`Room ID: ${roomId} not found`)
    }
})

/* --------------- LIST ROUTING --------------- */
//GET all list items from room
router.get('/:id/list', validateRoom, async (req, res, next) => {
    let roomId = req.params.id;
    let room = await Room.findById(new ObjectId(roomId));
    let list = room.roomList;

    res.status(200);
    res.json({
        title: 'List',
        list
    });
});

//POST new list item
router.post('/:id/list', validateRoom, async (req, res, next) => {
    let roomId = req.params.id;
    
    if(!req.body.invoice || !req.body.address || !req.body.name){
        res.status(400);
        res.send('Incorrect request body (see invoice and address and name)');
        return;
    }

    let itemObj = {
        name: req.body.name,
        address: req.body.address,
        invoice: req.body.invoice,
        description: req.body.description
    }
        
    const item = new Item(itemObj);

    try {
        await Room.findByIdAndUpdate(new ObjectId(roomId),
            {$push: {roomList: item}}
        )
        res.sendStatus(200);
    } catch (err) {
        console.log(err);
        res.sendStatus(500);
    }
});

// UPDATE item by ID
router.put('/:id/list/:item_id', validateRoom, validateItem, async (req, res, next) => {
    let roomId = req.params.id;
    let itemId = req.params.item_id;
    
    if(!req.body.address || !req.body.name || !req.body.invoice){
        res.status(400);
        res.send('Incorrect request body (body needs address and name and description and invoice)');
        return;
    }
    try{
        await Room.findOneAndUpdate({'_id': new ObjectId(roomId), 'roomList._id': new ObjectId(itemId)},
            {$set: {
                "roomList.$.name": req.body.name, 
                "roomList.$.address": req.body.address,
                "roomList.$.description": req.body.description,
                "roomList.$.invoice": req.body.invoice,
                "roomList.$.edited": true,
                "roomList.$.editDate": new Date(),
            }}
        )
        res.sendStatus(200);
    } catch(err){
        console.log(err);
        res.sendStatus(500);
    }
});

//toggle 'checked' on item id
router.post('/:id/list/:item_id/check', validateRoom, validateItem, async (req, res, next) => {
    let roomId = req.params.id;
    let itemId = req.params.item_id;

    if(Object.keys(req.body).length > 1){
        res.status(400);
        res.send("Incorrect request body; body must only have one key");
    }
    
    for(let key of Object.keys(req.body)){
        if(['picked', 'dispatched', 'complete', 'cancelled'].indexOf(key) === -1 && typeof key !== 'boolean'){
            res.status(400);
            res.send("Incorrect request body one of ['picked', 'dispatched', 'complete', 'cancelled'] must be in body and be of type boolean");
            return;
        }
    }

    let checkName = Object.keys(req.body)[0];

    // Toggle checked
    try{
        await Room.findOneAndUpdate({'_id': new ObjectId(roomId), 'roomList._id': new ObjectId(itemId)},
            {$set: {[`roomList.$.${checkName}`]: req.body[checkName]}}
        )
        res.sendStatus(200);
    } catch(err){
        console.log(err);
        res.sendStatus(500);
    }
})

//toggle 'check all' on room
router.post('/:id/list/checkAll', validateRoom, async (req, res, next) => {
    let roomId = req.params.id;

    if(req.body.checked === undefined || typeof req.body.checked != 'boolean'){
        res.status(400);
        res.send('Incorrect request body (checked: boolean) must be in body');
        return;
    }

    try{
        await Room.updateMany({'_id': new ObjectId(roomId)},
            {$set: {"roomList.$[].checked": req.body.checked}});
            res.sendStatus(200);
    } catch(err){
        console.log(err);
        res.sendStatus(500);
    }
});

//DELETE item by ID
router.delete('/:id/list/:item_id', validateAdmin, validateRoom, async (req, res, next) => {
    let roomId = req.params.id;
    let itemId = req.params.item_id;

    try{
        await Room.updateOne({"_id": new ObjectId(roomId)}, {
            "$pull": {"roomList" : {"_id": new ObjectId(itemId)}}
        })
        res.sendStatus(200);
    } catch(err){
        console.log(err);
        res.sendStatus(500);
    }
});

//DELETE all items (clear list)
router.delete('/:id/list', validateAdmin, validateRoom, async (req, res, next) => {
    let roomId = req.params.id;
    
    try{
        await Room.updateOne({"_id": new ObjectId(roomId)}, {
            "$set": {"roomList" : []}
        })
        res.sendStatus(200);
    } catch(err){
        console.log(err);
        res.sendStatus(500);
    }
});

module.exports = router;