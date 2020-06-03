import React from 'react';
import {withRouter} from 'react-router-dom';
import {RiPlayListAddLine} from 'react-icons/ri';
import {AiOutlineTag, AiFillDelete, AiOutlineUnorderedList} from 'react-icons/ai';
import ConfirmModal from '../ConfirmModal/ConfirmModal';
import {sortRooms, formatDayOfWeekFromRoomCode, isRoomCodeToday, getSecretHeader} from '../../utils/utils';
import './Rooms.scss';

class Rooms extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            rooms: null,
            joinRoomVal: '',
            joinRoomInfo: '',
            employeePassword: '',
            empoloyeePasswordInfo: '',
            confirmOpen: false,
            note: '',
            store: 'woodlawn'
        }
        this.noteTimeout = null;
    }

    componentDidMount() {
        const {params} = this.props.match;

        // Load local storage into state (if available)
        let store = localStorage.getItem('store');
        store = store ? store : 'woodlawn';
        let localRoomsObj = JSON.parse(localStorage.getItem('rooms'));
        let admin = JSON.parse(localStorage.getItem('admin'))?.admin;
        if(!admin) admin = false;
        this.setState({rooms: localRoomsObj, admin, store});
        // this.setState({admin, store});
       
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

    async adminBtnClick(){
        if(this.state.admin){
            localStorage.setItem('admin', null);
            this.setState({admin: false});
            return;
        }
        let password = prompt('Enter Admin Password');
        if(!password) return;
        let response = await fetch(`/api/verifyAdmin`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({password})
        });
        
        if(response.status === 200){
            let responseBody = await response.json();
            localStorage.setItem('admin', JSON.stringify({admin: true, secret: responseBody.secret}));
            this.setState({admin: true, joinRoomInfo: ''});
        } else{
            this.setState({joinRoomInfo: 'Admin Password Incorrect.'})
        }
    }

    updateRooms(){
        this.setState({rooms: JSON.parse(localStorage.getItem('rooms'))});
    }

    clearStoreRooms(){
        localStorage.removeItem('rooms');
        localStorage.removeItem('activeRoom');
        window.location.reload(); 
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
        let todaysResponse = await fetch('/api/room/getTimeframeRooms', {
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
        let response = await fetch('/api/room', {
            headers: getSecretHeader(),
            method: 'POST'
        });
        let room = await response.json();
        let storageToSet = JSON.parse(localStorage.getItem('rooms'));

        if(storageToSet) storageToSet.push({roomId: room.id, roomCode: room.roomCode, roomName: room.name});
        else storageToSet = [{roomId: room.id, roomCode: room.roomCode, roomName: room.name}]

        localStorage.setItem('rooms', JSON.stringify(storageToSet));
        this.updateRooms();
    }

    async deleteRoom(roomId){
        await fetch(`/api/room/${roomId}`, {
            headers: getSecretHeader(),
            method: 'DELETE'
        });
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
        if(response.status === 406){
            this.setState({joinRoomInfo: 'Date must be within 1 year'})
        }
        else if(roomValidated.match == null){
            //Flag room not found
            this.setState({joinRoomInfo: 'List code invalid'});
        }
        else{
            let storageToSet = JSON.parse(localStorage.getItem('rooms'));
            let roomId = roomValidated.match._id, 
                roomCode = roomValidated.match.roomCode,
                roomName = roomValidated.match.roomName;

            // Ignore if room already in localStorage
            if(storageToSet && storageToSet.findIndex(room => room.roomId === roomId) !== -1){
                this.setState({joinRoomInfo: 'Room already joined!'})
                return;
            }

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

    handlePasswordInputChange(e){
        this.setState({employeePassword: e.target.value, employeePasswordInfo: ''});
    }

    handleSubmit(event) {
        event.preventDefault();
        this.joinRemoteRoom()
    }
    async handleEmployeePasswordSubmit(event){
        event.preventDefault();
        if(this.state.employeePassword === ''){
            this.setState({employeePasswordInfo: 'Password cannot be empty'});
            return;
        }
        let result = window.confirm(`Are you sure you want to change employee password to: ${this.state.employeePassword}`);
        if(result){
            console.log('trying to change password to: ', this.state.employeePassword);
           
            let response = await fetch(`/api/changeEmployeePassword`, {
                method: 'POST',
                headers: getSecretHeader([{'Content-Type': 'application/json'}]),
                body: JSON.stringify({password: this.state.employeePassword})
            });
            console.log(response.status);
        }
        this.setState({employeePassword: ''})
    }

    async displayNotes(){
        //Note: Lists will expire in 30 days if not used
        let noteInterval = 1000;
        let notes = [
            {note: 'Delivery lists will expire in 1 year', interval: 8000},
            {note: 'Add this app to your phone homescreen from the browser menu', interval: 10000},
            {note: 'Share a 7 letter code to invite someone to a delivery list', interval: 8000},
            {note: 'You can print your delivery lists!', interval: 5000},
            {note: 'Copy a delivery list link and send it to anyone.  They will automatically have access.', interval: 8000},
            {note: 'If you want to look at the delivery list for Carp on 12/25/20, enter: c122520 and press "Join".', interval: 15000},
            {note: 'The "Join" button lets you look at any delivery day.', interval: 8000}
        ]
        // Shuffle notes and add empty final note
        notes = (notes.sort(() => Math.random() - .5))
        notes.push({note: '', interval: noteInterval});

        this.setState({note: notes[0].note})

        let idx = 1;
        for(let note of notes.slice(1)){
            await new Promise((res, rej) => {
                this.noteTimeout = setTimeout(() => {
                    this.setState({note: note.note})
                    res(note.note);
                }, notes[idx - 1].interval)
            })
            idx += 1;
        }
    }

    render(){
        //TODO sort rooms by date most recent first
        let sortedRooms = this.state.rooms;
        if(this.state.store !== 'custom' && sortedRooms){
            sortedRooms = sortedRooms.filter(room => room.roomCode.length === 7);
            sortedRooms = sortRooms(sortedRooms);
        }
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
                        onClick={()=> {
                            localStorage.setItem('store', 'woodlawn');
                            this.setState({store: 'woodlawn'})
                        }}
                    >
                        Woodlawn
                    </div>
                    <div className={`storeName carp${this.state.store === 'carp' ? ' storeActive': ''}`}
                        onClick={()=> {
                            localStorage.setItem('store', 'carp');
                            this.setState({store: 'carp'})
                        }}
                    >
                        Carp
                    </div>
                    {/* <div className={`storeName custom${this.state.store === 'custom' ? ' storeActive': ''}`}
                        onClick={()=> this.setState({store: 'custom'})}
                    >
                        Custom
                    </div> */}
                </div>
                
                { 
                    (sortedRooms && sortedRooms.length !== 0) ? sortedRooms.map(room => {
                        if(this.state.store === 'custom' && room.roomCode.length === 6
                        ){
                            return (
                                <RoomItem
                                    key={room.roomId}
                                    roomName={room.roomName}
                                    room={room} 
                                    joinMyRoom={this.joinMyRoom.bind(this)}
                                    deleteRoom={this.deleteRoom.bind(this)}
                                    admin={this.state.admin}
                                />
                            )
                        }
                        if (!room.roomName.toLowerCase().includes(this.state.store)){
                            return null;
                        } 
                        return (
                            <RoomItem
                                isToday={isRoomCodeToday(room.roomCode)}
                                key={room.roomId}
                                roomName={room.roomName}
                                room={room} 
                                joinMyRoom={this.joinMyRoom.bind(this)}
                                deleteRoom={this.deleteRoom.bind(this)}
                                admin={this.state.admin}
                            />
                        )
                    }) : <div>No Lists found!</div> 
                }   
                <div className="createRoomWrapper">
                        <button 
                                className="yellow adminBtn"
                                onClick={() => {this.adminBtnClick()}}
                        >
                            {this.state.admin ? 'Logout Admin' : 'Admin'}
                        </button>
                        {this.state.store !== 'custom' ?
                            <button 
                                className="green createRoom"
                                onClick={() => this.clearStoreRooms()}
                            >
                                Show This Week Only
                                <AiOutlineUnorderedList className="roomToolIcon"/>
                            </button> :
                            <button 
                                className="green createRoom"
                                onClick={() => this.createRoom()}
                            >
                                Custom List
                                <RiPlayListAddLine className="roomToolIcon"/>
                            </button>
                        }
                </div>
                {this.state.admin ?
                    <form onSubmit={(e) => this.handleEmployeePasswordSubmit(e)} className="changePasswordForm">
                        <button 
                                className="red employeePasswordBtn"
                                onClick={() => {}}
                                type='submit'
                                value="Submit" 
                        >
                            Change Employee Password
                        </button>
                        <input
                            type="text" 
                            value={this.state.employeePassword} 
                            onChange={(e) => this.handlePasswordInputChange(e)}
                            placeholder={`********`}
                            className="passwordInput"
                            maxLength={14}
                        >
                        </input>
                        <label className="employeePasswordInfo">{this.state.employeePasswordInfo}</label>
                    </form>
                 : null
                }
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
            <div key={this.props.room.roomId} className={`roomWrapper${this.props.room.roomName[0] === 'W' ? ' orange' : ' lightblue'}${this.props.isToday ? ' today' : ''}`} tabIndex={0}>
                <div className="joinRoomClickRegion"
                    onClick={() => this.props.joinMyRoom(this.props.room.roomId, this.props.room.roomCode, this.props.room.roomName)}>
                </div>
                <div className="roomName" >
                    {this.props.room.roomName} <span className="dayOfWeek">&nbsp;-&nbsp;{formatDayOfWeekFromRoomCode(this.props.room.roomCode)}</span>
                </div>
                <div className="roomTools">
                    <div className="roomCode">
                        <AiOutlineTag className="roomCodeIcon"/>
                        {this.props.room.roomCode}
                    </div>
                    <div className={`roomDelete${this.props.admin ? ' admin' :' hidden'}`}>
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