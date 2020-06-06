import React from 'react';
import {withRouter} from 'react-router-dom';
import {formatTime, getSecretEmployeeHeader} from '../../utils/utils';
import {FiCheck} from 'react-icons/fi';
import './Print.scss';

class Print extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            list: null
        }
    }

    updateList(roomId){
        fetch(`/api/room/${roomId}/list`, {headers: getSecretEmployeeHeader()})
          .then(response => response.json())
          .then(list => {
            this.setState({list})
          })
          .catch(err => {
            console.log(err);
          })
    }
    
    componentDidMount() {
        if(JSON.parse(localStorage.getItem('activeRoom')) == null){
            this.props.history.push('/rooms');
          } else{
            let {roomId, roomCode, roomName} = JSON.parse(localStorage.getItem('activeRoom'));
            this.setState({activeRoomID: roomId, activeRoomCode: roomCode, activeRoomName: roomName});
            this.updateList(roomId);
        }
    }

    render(){
        if(!this.state.list) return (<div>loading...</div>);
        if(this.state.list.list.length === 0) return(<div>No items found</div>)

        // 
        let formatList = () => {
            return this.state.list.list.map(item => {
                return(
                    <div key={item._id} className="categoryWrapper">
                        <div className="categoryTitle">Invoice: {' '} #{item.invoice}</div>
                        <div className="categoryContent">
                            <div>
                                <b>Customer:</b>{' '} {item.name} 
                            </div>
                            <div>
                                <b>Address:</b>{' '} {item.address} 
                            </div>
                            <div>
                                <b>Details:</b>{' '} {item.description} 
                            </div>
                            <div >
                                <b>Timestamp:</b>{' '} {formatTime(item.date)} 
                            </div>
                            <div style={{display: `${item.picked ? 'block' : 'none'}`}}>
                                <b>Picked:</b>{' '} <FiCheck className='checkMark'/>
                            </div>
                            <div style={{display: `${item.dispatched ? 'block' : 'none'}`}}>
                                <b>Dispatched:</b>{' '} <FiCheck className='checkMark'/>
                            </div>
                            <div style={{display: `${item.complete ? 'block' : 'none'}`}}>
                                <b>Complete:</b>{' '} <FiCheck className='checkMark'/>
                            </div>
                            <div style={{display: `${item.cancelled ? 'block' : 'none'}`}}>
                                <b>Cancelled:</b>{' '} <FiCheck className='checkMark'/>
                            </div>
                        </div>
                    </div>
                )
            });
        }

        return(
            <div className="printWrapper">
                <div className="listTitle">   
                    {this.state.activeRoomName} - <span className="dateTime">{formatTime(new Date(Date.now()))}</span>
                </div>
                <div className="printDataWrapper">
                    {formatList()}
                </div>
            </div>
        )
    }
}

export default withRouter(Print);