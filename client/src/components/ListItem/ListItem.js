import React from 'react';
import ConfirmModal from '../ConfirmModal/ConfirmModal';
import {withRouter} from 'react-router-dom';
import {GrEdit} from 'react-icons/gr';
import {AiFillDelete, AiFillCheckCircle} from 'react-icons/ai';
import {RiTruckLine} from 'react-icons/ri';
import {MdRadioButtonUnchecked} from 'react-icons/md';
import {getSecretAdminHeader, formatTime} from '../../utils/utils';
import './ListItem.scss';
import InitialModal from '../InitialModal/InitialModal';

class ListItem extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            confirmOpen: false,
            initialValue: null,
            initialKey: null
        };
    }

    render(){
        return (
            <div className={`listItemWrapper${this.props.item.cancelled ? ' cancelled': ''}${this.props.item.complete ? ' complete': ''}${this.props.roomCode[0] === 'w' ? ' orange': ' lightblue' }`}>
                {this.state.confirmOpen ? 
                    <ConfirmModal 
                        triggerClose={() => this.setState({confirmOpen: false})}
                        message={`Do you want to delete: ${''} #${this.props.item.invoice}?`}
                        confirm={() => {
                            this.clickDelete();
                            this.setState({confirmOpen: false});
                        }}
                    /> : null
                }

                {this.state.initialOpen ?
                    <InitialModal
                        triggerClose={() => {this.props.changeInitialsOpen(false); this.setState({initialKey: null, initialValue: null, initialOpen: false})}}
                        context={this.state.initialKey}
                        message={`Please Initial`}
                        confirm={(initials) => {
                            this.props.clickCheck(this.props.item._id, this.state.initialValue, this.state.initialKey, initials)
                            this.setState({initialOpen: false})
                            this.props.changeInitialsOpen(false);
                        }}
                    /> : null
                }

                <div className="assignDriver" onClick={() => this.props.openAssignDriver(this.props.item)}>
                    <div className="assignDriverLabel">Assign</div>
                    <div className="assignDriverIcon"><RiTruckLine /></div>
                    {this.props.item.driver && this.props.item.driver != 'unassigned' ? <div className="assignedFlag">(assigned)</div> : null}
                </div>
                
                <div className="listItem">
                    <div className='invoice listContent'>
                        <b>Invoice #:</b> &nbsp;{this.props.item.invoice}
                    </div>
                    <div className='customer listContent'>
                        <b>Customer:</b> &nbsp;{this.props.item.name}
                    </div>
                    <div className='address listContent'>
                        <b>Address:</b> &nbsp;{this.props.item.address}
                    </div>
                    <div className='address listContent'>
                        <b>Timestamp:</b> &nbsp;{this.props.item.date}
                    </div>
                    <div className='description listContent'>
                        <b>Details:</b> &nbsp;{this.props.item.description}
                    </div>
                    <div className='salesID listContent'>
                        <b>Sales ID:</b> &nbsp;{this.props.item.salesID}
                    </div>
                    <div className='driver listContent'>
                        <b>Assigned Driver: </b> &nbsp;  {this.props.item.driver}
                    </div>
                    {this.props.item.dispatchedAt ?
                    <div className='dispatchTime listContent'>
                        <b>{this.props.item.dispatched ? 'Dispatched: ' : 'Dispatch Cancelled: '}</b> &nbsp;{formatTime(this.props.item.dispatchedAt)}
                    </div> : null} 
                    {this.props.item.edited ?
                    <div className='description listContent'>
                        <b>modified</b> &nbsp; @ &nbsp;{this.props.item.editDate}
                    </div> : null
                    }
                </div>
                <div className={`listToolsWrapper`}>
                    <div className = "listTools">
                        <div onClick={() => {this.setState({initialOpen: true, initialValue: !this.props.item.picked, initialKey: 'picked'}); this.props.changeInitialsOpen(true); }} className={`tool`}>
                            {this.props.item.picked ? <AiFillCheckCircle className="listItemToolIcon checkIcon"/> : <MdRadioButtonUnchecked className="listItemToolIcon checkIcon"/>}
                            <div className="toolLabel">Picked</div>
                            {this.props.item.pickedBy ? <div className="initial">({this.props.item.pickedBy})</div> : null}
                        </div>
                        <div onClick={() => {this.setState({initialOpen: true, initialValue: !this.props.item.dispatched, initialKey: 'dispatched'}); this.props.changeInitialsOpen(true); }} className={`tool`}>
                            {this.props.item.dispatched ? <AiFillCheckCircle className="listItemToolIcon checkIcon"/> : <MdRadioButtonUnchecked className="listItemToolIcon checkIcon"/>}
                            <div className="toolLabel">Dispatched</div>
                            {this.props.item.dispatchedBy ? <div className="initial">({this.props.item.dispatchedBy})</div> : null}
                        </div>
                        
                    </div>
                    {this.props.admin?.admin ?
                        <div className = "deleteBtnTool">
                            <div onClick={() => this.setState({confirmOpen: true})} className={``}><AiFillDelete className="deleteIcon"/></div>
                        </div> : null
                    }
                </div>
                <div className={`listToolsWrapper itemFooter`}>
                    <div className = "listTools">
                        <div onClick={() => {this.setState({initialOpen: true, initialValue: !this.props.item.complete, initialKey: 'complete'}); this.props.changeInitialsOpen(true);}} className={`tool`}>
                            {this.props.item.complete ? <AiFillCheckCircle className="listItemToolIcon checkIcon"/> : <MdRadioButtonUnchecked className="listItemToolIcon checkIcon"/>}
                            <div className="toolLabel">Complete</div>
                            {this.props.item.completeBy ? <div className="initial">({this.props.item.completeBy})</div> : null}
                        </div>
                        <div onClick={() => {this.setState({initialOpen: true, initialValue: !this.props.item.cancelled, initialKey: 'cancelled'}); this.props.changeInitialsOpen(true);}} className={`tool`}>
                            {this.props.item.cancelled ? <AiFillCheckCircle className="listItemToolIcon checkIcon"/> : <MdRadioButtonUnchecked className="listItemToolIcon checkIcon"/>}
                            <div className="toolLabel">Cancelled</div>
                            {this.props.item.cancelledBy ? <div className="initial">({this.props.item.cancelledBy})</div> : null}
                        </div>
                    </div>
                    <div className = "editBtn">
                        <div className={``}>
                            <GrEdit onClick={() => {
                                    this.props.edit(this.props.item);
                                }}
                                className={'editTool'}
                            />
                        </div>
                        {/* <div className ="itemDate">
                            {this.props.item.date}
                            {this.props.item.edited ? <p className="edited">(edited)</p> : null}
                        </div> */}
                    </div>
                </div>
            </div>
        );
    }

    async clickDelete(){
        let response = await fetch(`/api/room/${this.props.roomId}/list/${this.props.item._id}`,
            {
                headers: getSecretAdminHeader(),
                method: 'DELETE',
            });
        
        //fetch updated list
        this.props.fetchNewList();
    }
}

export default withRouter(ListItem);