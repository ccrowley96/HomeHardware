import React from 'react';
import './AssignDriverModal.scss';

class AssignDriverModal extends React.Component{

    constructor(props){
        super(props);
        
        this.state = {
            driver: '',
            formError: ''
        }
    }

    componentDidMount(){
        document.body.style.overflow = 'hidden';
        this.driver.focus(); 
    }

    componentWillUnmount(){
        document.body.style.overflow = 'unset';
    }

    handleDriverChange(event) {
        let formError = this.state.formError
        if(event.target.value !== '') formError = '';
        this.setState({driver: event.target.value, formError});
    }

    handleConfirm(){
        if(this.state.driver.length === 0){
            this.setState({formError: 'Please enter driver'})
            return;
        }

        this.props.confirm(this.state.driver)
    }

    render(){
        return(
            <div className="AssignDriverModalBlocker">
                <div className="AssignDriverModal">
                    <div className="confirmSection confirmText">
                        {this.props.message}
                    </div>
                    <div className="contentWrapper">
                        <div className ="AssignDriverWrapper">
                            <label>
                                {this.props?.context}
                            </label>
                            <input className="formItem" type="text" name="driver" 
                                ref={(input) => { this.driver = input; }} 
                                value={this.state.driver} 
                                onChange={(e) => this.handleDriverChange(e)}
                                placeholder={'Enter driver name'} 
                                maxLength={140}
                            />
                            <div className ="formError">{this.state.formError}</div>
                        </div>
                    </div>
                    <div className="confirmSection confirmTools">
                        <div className="buttonSection">
                            <button onClick={() => this.handleConfirm()} className="green">Confirm</button>
                        </div>
                        <div className="buttonSection">
                            <button onClick={() => this.props.triggerClose()} className="red">Cancel</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default AssignDriverModal;