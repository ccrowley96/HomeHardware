import React from 'react';
import {withRouter} from 'react-router-dom';
import {getSecretEmployeeHeader} from '../../utils/utils';
import List from '../List/List'
import './ListContainer.scss';

class App extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      list: null,
      activeRoomID: null,
      activeRoomCode: null,
      activeRoomName: null,
      checkAll: false,
      checkDisabled: false,
      admin: null
    }

    this.updateInterval = null;
  }

  updateList(inititalRoomId = null){
    let roomId = inititalRoomId ? inititalRoomId : this.state.activeRoomID;

    fetch(`/api/room/${roomId}/list`, {headers: getSecretEmployeeHeader()})
      .then(response => {
        if(response.status === 401) this.props.history.push('/login');
        else if(response.status !== 200){
          this.props.history.push('/rooms');
          throw new Error('Room not found');
        }
        else return response.json()
      })
      .then(list => {
        //Find check state for check / uncheck all button
        let numChecked = list.list.reduce((acc, cur) => acc += cur.checked ? 1 : 0, 0);
        let prevCheckAll = this.state.checkAll;
        let checkAll = numChecked === list.list.length / 2 ? prevCheckAll : numChecked >= Math.ceil(list.list.length / 2);
        this.setState({list, checkAll, checkDisabled: false});
      })
      .catch(err => {
        console.log(err);
      })
  }

  componentDidMount(){
    if(JSON.parse(localStorage.getItem('activeRoom')) == null){
      this.props.history.push('/rooms');
    } else{
      let {roomId, roomCode, roomName} = JSON.parse(localStorage.getItem('activeRoom'));
      let admin = JSON.parse(localStorage.getItem('admin'));
      this.setState({activeRoomID: roomId, activeRoomCode: roomCode, activeRoomName: roomName, admin});
      this.updateList(roomId);
      // Set up update interval
      this.updateInterval = setInterval(() => this.updateList(roomId), 5000);
    }
  }

  componentWillUnmount(){
    // Destroy update interval
    clearInterval(this.updateInterval);
  }

  handlePrintClick(){
    window.open('/print');
  }

  async handleCheckAllClick(){
    let onClickCheckState = !this.state.checkAll;
    this.setState(prevState => ({checkAll: !prevState.checkAll, checkDisabled: true}));
    let response = await fetch(`/api/room/${this.state.activeRoomID}/list/checkAll`, {
        method: 'POST',
        headers: getSecretEmployeeHeader([{'Content-Type': 'application/json'}]),
        body: JSON.stringify({checked: onClickCheckState})
    });
    if(response.status === 401) this.props.history.push('/login');

    this.updateList();
  }

  render(){
    if(!this.state.activeRoomID|| !this.state.activeRoomCode || !this.state.activeRoomName) return null;
    return(
      <div className = {`appWrapper`}>
        <List
          roomId={this.state.activeRoomID} 
          roomCode={this.state.activeRoomCode}
          roomName={this.state.activeRoomName}
          list={this.state.list?.list} 
          checkAll={this.state.checkAll}
          checkDisabled={this.state.checkDisabled}
          fetchNewList={() => this.updateList()}
          handlePrintClick={() => this.handlePrintClick()}
          handleCheckAllClick={() => this.handleCheckAllClick()}
          admin={this.state.admin}
        />
      </div>
    )
  }
}

export default withRouter(App);
