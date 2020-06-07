import React from 'react';
import {withRouter} from 'react-router-dom';
import {isLoggedIn} from '../../utils/utils'
import './Login.scss';

class Login extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            password: '',
            formError: '',
        }
    }

    componentDidMount(){
        localStorage.removeItem('passwordRequired');
        localStorage.removeItem('employee');
        this.checkLoggedIn();
    }

    async checkLoggedIn(){
        let loggedIn = await isLoggedIn();
        console.log('checking logged in: ', loggedIn);
        if(loggedIn) this.props.history.push('/rooms');
    }

    handlePasswordChange(e){
        let formError = this.state.formError;
        if(e.target.value !== '') formError = '';
        this.setState({password: e.target.value, formError});
    }

    async handleSubmit(e){
        e.preventDefault();

        if(this.state.password === ''){
            this.setState({formError: 'Password empty'})
            return;
        }

        let response = await fetch('/api/verifyEmployee', 
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({password: this.state.password})
                }
            );

        if(response.status === 200){
            let responseBody = await response.json();
            let storageToSet = {
                loggedIn: true,
                secret: responseBody.secret,
            };
            localStorage.setItem('employee', JSON.stringify(storageToSet));
            let redirect = this.props.location?.state?.from;
            if(redirect) this.props.history.push(redirect);
            else{
                this.props.history.push('/rooms');
            }
        } else{
            this.setState({formError: 'Password Incorrect'})
        }
    }

    render(){
        return(
            <div className="loginWrapper">
                <div className="loginBox">
                    <div className="loginTitle">Employee Login</div>
                    <form className="loginForm" onSubmit={(e) => this.handleSubmit(e)}>
                        <input 
                            className="passwordInput"
                            type="password"
                            value={this.state.password} 
                            onChange={(e) => this.handlePasswordChange(e)}
                            placeholder={'Employee Password'} 
                            maxLength={140}
                        ></input>
                        <div className="submitBtnWrap">
                            <button type="submit" value="Submit" className="green">Log In</button>
                            <div className ="formError">{this.state.formError}</div>
                        </div>
                        <div className="loginSubtitle">Log in to access Deka Home Hardware Listing Service</div>
                    </form>
                    
                </div>
            </div>
        )
    }
}

export default withRouter(Login);