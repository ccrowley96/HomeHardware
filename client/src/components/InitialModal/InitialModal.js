import React from 'react';
import './InitialModal.scss';

class InitialModal extends React.Component{

    constructor(props){
        super(props);
        
       
        this.state = {
            initials: '',
            formError: ''
        }
    }

    componentDidMount(){
        document.body.style.overflow = 'hidden';
        this.initials.focus(); 
    }

    componentWillUnmount(){
        document.body.style.overflow = 'unset';
    }

    handleInitialChange(event) {
        let formError = this.state.formError
        if(event.target.value !== '') formError = '';
        this.setState({initials: event.target.value, formError});
    }

    handleConfirm(){
        if(this.state.initials.length === 0){
            this.setState({formError: 'Please enter initials'})
            return;
        }

        this.props.confirm(this.state.initials)
    }

    render(){
        return(
            <div className="InitialModalBlocker">
                <div className="InitialModal">
                    <div className="confirmSection confirmText">
                        {this.props.message}
                    </div>
                    <div className="contentWrapper">
                        <div className ="initialWrapper">
                            <label>
                                {this.props?.context?.toUpperCase()}
                            </label>
                            <input className="formItem" type="text" name="initials" 
                                ref={(input) => { this.initials = input; }} 
                                value={this.state.initials} 
                                onChange={(e) => this.handleInitialChange(e)}
                                placeholder={'initial here...'} 
                                maxLength={6}
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

export default InitialModal;