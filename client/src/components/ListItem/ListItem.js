import React from 'react';
import ConfirmModal from '../ConfirmModal/ConfirmModal';
import {GrEdit} from 'react-icons/gr';
import {AiFillDelete, AiFillCheckCircle} from 'react-icons/ai';
import {MdRadioButtonUnchecked} from 'react-icons/md';
import './ListItem.scss';

class ListItem extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            confirmOpen: false
        };
    }

    render(){
        return (
            <div className={`listItemWrapper${this.props.item.cancelled ? ' cancelled': ''}${this.props.item.complete ? ' complete': ''}${this.props.roomCode[0] === 'w' ? ' orange': ' lightblue' }`}>
                {this.state.confirmOpen ? 
                    <ConfirmModal 
                        triggerClose={() => this.setState({confirmOpen: false})}
                        message={`Do you want to delete: ${this.props.item.content}?`}
                        confirm={() => {
                            this.clickDelete();
                            this.setState({confirmOpen: false});
                        }}
                    /> : null
                }
                
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
                    <div className='description listContent'>
                        <b>Details:</b> &nbsp;{this.props.item.description}
                    </div>
                </div>
                <div className={`listToolsWrapper`}>
                    <div className = "listTools">
                        <div onClick={() => this.props.clickCheck(this.props.item._id, !this.props.item.picked, 'picked')} className={`tool`}>
                            {this.props.item.picked ? <AiFillCheckCircle className="listItemToolIcon checkIcon"/> : <MdRadioButtonUnchecked className="listItemToolIcon checkIcon"/>}
                            <div className="toolLabel">Picked</div>
                        </div>
                        <div onClick={() => this.props.clickCheck(this.props.item._id, !this.props.item.dispatched, 'dispatched')} className={`tool`}>
                            {this.props.item.dispatched ? <AiFillCheckCircle className="listItemToolIcon checkIcon"/> : <MdRadioButtonUnchecked className="listItemToolIcon checkIcon"/>}
                            <div className="toolLabel">Dispatched</div>
                        </div>
                        
                    </div>
                    <div className = "deleteBtnTool">
                        <div onClick={() => this.setState({confirmOpen: true})} className={``}><AiFillDelete className="deleteIcon"/></div>
                        {/* <div className ="itemDate">
                            {this.props.item.date}
                            {this.props.item.edited ? <p className="edited">(edited)</p> : null}
                        </div> */}
                    </div>
                </div>
                <div className={`listToolsWrapper`}>
                    <div className = "listTools">
                        <div onClick={() => this.props.clickCheck(this.props.item._id, !this.props.item.complete, 'complete')} className={`tool`}>
                            {this.props.item.complete ? <AiFillCheckCircle className="listItemToolIcon checkIcon"/> : <MdRadioButtonUnchecked className="listItemToolIcon checkIcon"/>}
                            <div className="toolLabel">Complete</div>

                        </div>
                        <div onClick={() => this.props.clickCheck(this.props.item._id, !this.props.item.cancelled, 'cancelled')} className={`tool`}>
                            {this.props.item.cancelled ? <AiFillCheckCircle className="listItemToolIcon checkIcon"/> : <MdRadioButtonUnchecked className="listItemToolIcon checkIcon"/>}
                            <div className="toolLabel">Cancelled</div>
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
        await fetch(`/api/room/${this.props.roomId}/list/${this.props.item._id}`,{method: 'DELETE'});
        //fetch updated list
        this.props.fetchNewList();
    }
}

export default ListItem;