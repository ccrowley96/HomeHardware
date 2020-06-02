import React from 'react';
import {withRouter} from 'react-router-dom';
import {RiPlayListAddLine, RiPassportLine} from 'react-icons/ri';
import {AiOutlineTag, AiFillDelete} from 'react-icons/ai';
import ConfirmModal from '../ConfirmModal/ConfirmModal';
import isMobile from 'ismobilejs';
import './Rooms.scss';

class Rooms extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            rooms: null,
            joinRoomVal: '',
            joinRoomInfo: '',
            confirmOpen: false,
            note: '',
            store: 'woodlawn'
        }
        this.noteTimeout = null;
    }

    componentDidMount() {
        const {params} = this.props.match;
        if('roomCode' in params){
            let join = async() => {
                let roomCode = params.roomCode;
                if(roomCode.length === 6){
                    await this.joinRemoteRoom(roomCode);
                }
                this.validateRooms();
            }
            join();
        } else{
            //Validate rooms
            this.validateRooms();
        }

        this.displayNotes();
    }

    componentWillUnmount(){
        clearTimeout(this.noteTimeout);
    }

    updateRooms(){
        this.setState({rooms: JSON.parse(localStorage.getItem('rooms'))});
    }

    async validateRooms(){
        let localRooms = JSON.parse(localStorage.getItem('rooms'))
        let activeRoom = JSON.parse(localStorage.getItem('activeRoom'));

        if(localRooms){
            let ids = localRooms.map(room => room.roomId);
            let payload = {ids}
            // Hit backend with IDs found in local storage
            let response = await fetch('/api/room/getMatchingIds', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
            let roomsValidated = await response.json();
            // Filter out missing IDs
            let filteredLocalRooms = localRooms.filter(room => roomsValidated.matchingRooms.findIndex(matchID => room.roomId === matchID._id) !== -1)
            if(activeRoom){
                let activeRoomOk = roomsValidated.matchingRooms.findIndex(matchID => matchID === activeRoom.roomId) !== -1;
                if(!activeRoomOk) localStorage.setItem('activeRoom', null);
            }

            // Change local room names
            filteredLocalRooms = filteredLocalRooms.map(localRoom => {
                let remoteName = roomsValidated.matchingRooms.find(room => room._id === localRoom.roomId).roomName
                localRoom.roomName = remoteName;
                return localRoom;
            })
            // Update local storage
            localStorage.setItem('rooms', JSON.stringify(filteredLocalRooms));
        }

        // Add todays rooms to local storage rooms
        let todaysResponse = await fetch('/api/room/getTodaysRooms', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        let todaysRooms = await todaysResponse.json();

        localRooms = JSON.parse(localStorage.getItem('rooms'));
        for(let room of todaysRooms.matchingRooms){
            if(localRooms && localRooms.findIndex(el => el.roomId === room._id) !== -1) continue;
            if(localRooms) localRooms.push({roomId: room._id, roomCode: room.roomCode, roomName: room.roomName});
            else localRooms = [{roomId: room._id, roomCode: room.roomCode, roomName: room.roomName}]
        }
        localStorage.setItem('rooms', JSON.stringify(localRooms));
       
        this.updateRooms();
    }

    async createRoom(){
        let response = await fetch('/api/room', {method: 'POST'});
        let room = await response.json();
        let storageToSet = JSON.parse(localStorage.getItem('rooms'));

        if(storageToSet) storageToSet.push({roomId: room.id, roomCode: room.roomCode, roomName: room.name});
        else storageToSet = [{roomId: room.id, roomCode: room.roomCode, roomName: room.name}]

        localStorage.setItem('rooms', JSON.stringify(storageToSet));
        this.updateRooms();
    }

    async deleteRoom(roomId){
        await fetch(`/api/room/${roomId}`, {method: 'DELETE'});
        let storageToSet = JSON.parse(localStorage.getItem('rooms'));
        storageToSet = storageToSet.filter(localstorage_room => localstorage_room.roomId !== roomId)
        localStorage.setItem('rooms', JSON.stringify(storageToSet));
        this.updateRooms();
    }

    joinMyRoom(roomId, roomCode, roomName){
        //Set activeRoom in local storage
        let storageToSet = {roomId, roomCode, roomName};
        localStorage.setItem('activeRoom', JSON.stringify(storageToSet));
        // Link to List App
        this.props.history.push('/');
    }

    async joinRemoteRoom(roomCode = null){
        let remoteRoomCode = (roomCode ? roomCode : this.state.joinRoomVal).toLowerCase();
        // Check if room exists in database
        let response = await fetch('/api/room/getRoomByCode', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({roomCode: remoteRoomCode})
        });
        let roomValidated = await response.json();
        if(roomValidated.match == null){
            //Flag room not found
            this.setState({joinRoomInfo: 'List code invalid'});
        } else{

            let storageToSet = JSON.parse(localStorage.getItem('rooms'));
            let roomId = roomValidated.match._id, 
                roomCode = roomValidated.match.roomCode,
                roomName = roomValidated.match.roomName;

            // Ignore if room already in localStorage
            if(storageToSet && storageToSet.findIndex(room => room.roomId === roomId) !== -1)
                return;

            if(storageToSet) storageToSet.push({roomId, roomCode, roomName});
            else storageToSet = [{roomId, roomCode, roomName}]

            localStorage.setItem('rooms', JSON.stringify(storageToSet));
            this.updateRooms();
        }
        this.setState({joinRoomVal: ''});
    }

    handleJoinInputChange(e){
        this.setState({joinRoomVal: e.target.value, joinRoomInfo: ''});
    }

    handleSubmit(event) {
        event.preventDefault();

        this.joinRemoteRoom()
    }

    async displayNotes(){
        //Note: Lists will expire in 30 days if not used
        let noteInterval = 10000;
        let notes = [
            {note: 'Lists will expire in 30 days if not used', interval: noteInterval},
            {note: 'Add this app to your phone homescreen from the browser menu', interval: noteInterval},
            {note: 'Share a 7 letter code to invite someone to a list', interval: noteInterval},
            {note: 'You can print your lists!', interval: noteInterval},
            {note: 'Careful: deleting a list also deletes the list for anyone who has access', interval: noteInterval},
            {note: 'Copy a list link and send it to anyone.  They will automatically have access.', interval: noteInterval},
            {note: 'If you want to look at the list for Carp on 12/25/20, enter: c122520 and press join.  You can look up any date this way!', interval: noteInterval}
        ]
        // Shuffle notes and add empty final note
        notes = (notes.sort(() => Math.random() - .5))
        notes.push({note: '', interval: noteInterval});

        this.setState({note: notes[0].note})

        for(let note of notes.slice(1)){
            await new Promise((res, rej) => {
                this.noteTimeout = setTimeout(() => {
                    this.setState({note: note.note})
                    res(note.note);
                }, note.interval)
            })
        }
    }

    render(){
        //TODO sort rooms by date most recent first
        return(
            <div className="roomsWrapper">
                <div className="roomTopToolbarWrapper">
                    <form onSubmit={(e) => this.handleSubmit(e)} className="joinRoomForm">
                        <div className="joinRoomWrapper">
                            <div className="joinRoomInputWrapper">
                                <input 
                                    type="text" 
                                    value={this.state.joinRoomVal} 
                                    onChange={(e) => this.handleJoinInputChange(e)}
                                    placeholder={`[w|c]mmddyy`}
                                    className="joinRoomInput"
                                    maxLength={7}
                                >
                                </input>
                                <div className="joinRoomInfo">{this.state.joinRoomInfo}</div>
                            </div>
                            <div className="joinRoomButtonWrapper">
                                <button className="green joinRoomButton" type="submit" value="Submit">
                                    Join
                                    <AiOutlineTag className="roomToolIcon"/>
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
                
                <div className="storeToggleWrapper">
                    <div className={`storeName woodlawn${this.state.store === 'woodlawn' ? ' storeActive': ''}`} 
                        onClick={()=> this.setState({store: 'woodlawn'})}
                    >
                        Woodlawn
                    </div>
                    <div className={`storeName carp${this.state.store === 'carp' ? ' storeActive': ''}`}
                        onClick={()=> this.setState({store: 'carp'})}
                    >
                        Carp
                    </div>
                    <div className={`storeName custom${this.state.store === 'custom' ? ' storeActive': ''}`}
                        onClick={()=> this.setState({store: 'custom'})}
                    >
                        Custom
                    </div>
                </div>
                
                { 
                    (this.state.rooms && this.state.rooms.length !== 0) ? this.state.rooms.map(room => {
                        if(this.state.store === 'custom' && room.roomCode.length === 6
                        ){
                            return (
                                <RoomItem
                                    key={room.roomId}
                                    roomName={room.roomName}
                                    room={room} 
                                    joinMyRoom={this.joinMyRoom.bind(this)}
                                    deleteRoom={this.deleteRoom.bind(this)}
                                />
                            )
                        }
                        if (!room.roomName.toLowerCase().includes(this.state.store)){
                            return null;
                        } 
                        return (
                            <RoomItem
                                key={room.roomId}
                                roomName={room.roomName}
                                room={room} 
                                joinMyRoom={this.joinMyRoom.bind(this)}
                                deleteRoom={this.deleteRoom.bind(this)}
                            />
                        )
                    }) : <div>No Lists found!</div> 
                }   
                <div className="createRoomWrapper" style={{display: this.state.store === 'custom' ? ' flex' : 'none'}}>
                        <button 
                            className="green createRoom"
                            onClick={() => this.createRoom()}
                        >
                            Custom List
                            <RiPlayListAddLine className="roomToolIcon"/>
                        </button>
                </div>
                <div className="notes">
                    <p><i>{this.state.note}</i></p>
                </div>
            </div>
        )
    }
}

class RoomItem extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            confirmOpen: false
        }
    }

    render(){
        return(
            <div key={this.props.room.roomId} className={`roomWrapper${this.props.room.roomName[0] === 'W' ? ' orange' : ' lightblue'}`} tabIndex={0}>
                <div className="joinRoomClickRegion"
                    onClick={() => this.props.joinMyRoom(this.props.room.roomId, this.props.room.roomCode, this.props.room.roomName)}>
                </div>
                <div className="roomName" >
                    {this.props.room.roomName}
                </div>
                <div className="roomTools">
                    <div className="roomCode">
                        <AiOutlineTag className="roomCodeIcon"/>
                        {this.props.room.roomCode}
                    </div>
                    <div className="roomDelete">
                        <div onClick={() => this.setState({confirmOpen: true})} className="deleteBtn">
                            <AiFillDelete className="deleteIcon"/>
                        </div>
                    </div>
                </div>
                {this.state.confirmOpen ? 
                    <ConfirmModal 
                        triggerClose={() => this.setState({confirmOpen: false})}
                        message={`Do you want to delete: ${this.props.room.roomCode}?`}
                        confirm={() => {
                            this.props.deleteRoom(this.props.room.roomId);
                            this.setState({confirmOpen: false});
                        }}
                    /> : null
                }
            </div>
        )
    }
}

export default withRouter(Rooms);