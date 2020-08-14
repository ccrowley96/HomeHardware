import React from 'react';
import './AddEditModal.scss';

class AddEditModal extends React.Component{
    constructor(props){
        super(props);
        
        if(this.props.populate){
            this.state = {
                invoice: this.props.populate.invoice,
                address: this.props.populate.address,
                name: this.props.populate.name,
                description: this.props.populate.description,
                salesID: this.props.populate.salesID
            }
        } else{
            this.state = {
                invoice: '',
                address: '',
                name: '',
                description: '',
                salesID: ''
            }
        }

        this.state.formError = '';
    }

    componentDidMount(){
        document.body.style.overflow = 'hidden';
        this.itemInput.focus(); 
    }

    componentWillUnmount(){
        document.body.style.overflow = 'unset';
    }

    handleInvoiceChange(event) {
        let formError = this.state.formError
        if(event.target.value !== '') formError = '';
        this.setState({invoice: event.target.value, formError});
    }

    handleSalesIDChange(event){
        let formError = this.state.formError
        if(event.target.value !== '') formError = '';
        this.setState({salesID: event.target.value, formError});
    }

    handleNameChange(event) {
        let formError = this.state.formError
        if(event.target.value !== '') formError = '';
        this.setState({name: event.target.value, formError});
    }

    handleDescriptionChange(event) {
        let formError = this.state.formError
        if(event.target.value !== '') formError = '';
        this.setState({description: event.target.value, formError});
    }

    handleAddressChange(event) {
        let formError = this.state.formError
        if(event.target.value !== '') formError = '';
        this.setState({address: event.target.value, formError});
    }

    handleCatChange(event){
        this.setState({itemCat: event.target.value});
    }

    handleCustomChange(event){
        this.setState({customCat: event.target.value});
    }

    handleSubmit(event) {
        event.preventDefault();

        if(this.state.invoice === ''){
            this.setState({formError: 'Description cannot be empty'})
            return;
        }
        if(this.state.salesID === ''){
            this.setState({formError: 'SalesID cannot be empty'})
            return;
        }
        if(this.state.address === ''){
            this.setState({formError: 'Address cannot be empty'})
            return;
        }
        if(this.state.name === ''){
            this.setState({formError: 'Name cannot be empty'})
            return;
        }
        
        this.props.addItem({
            name: this.state.name,
            salesID: this.state.salesID,
            address: this.state.address,
            description: this.state.description,
            invoice: this.state.invoice
        })
        
        this.setState({name: '', address: '', description: '', invoice: ''});
    }

    render(){
        return(
            <div className="addEditModalBlocker">
                <div className="addEditModal">
                    <form className="modalWrapper" onSubmit={(e) => this.handleSubmit(e)}>
                        <div className="addTitle">
                            {this.props.context}
                        </div>
                        <div className ="formWrapper">
                            <div className="addForm">
                                <div className="addFormItemDesc">
                                    <label>
                                        Invoice #
                                    </label>
                                    <input className="formItem" type="text" name="invoice" 
                                        ref={(input) => { this.itemInput = input; }} 
                                        value={this.state.invoice} 
                                        onChange={(e) => this.handleInvoiceChange(e)}
                                        placeholder={'Invoice #'} 
                                        maxLength={140}
                                    />
                                    <label>
                                        Sales ID
                                    </label>
                                    <input className="formItem" type="text" name="salesID" 
                                        value={this.state.salesID} 
                                        onChange={(e) => this.handleSalesIDChange(e)}
                                        placeholder={'Your Sales ID'} 
                                        maxLength={140}
                                    />
                                    <label>
                                        Address
                                    </label>
                                    <input className="formItem" type="text" name="address" 
                                        value={this.state.address} 
                                        onChange={(e) => this.handleAddressChange(e)}
                                        placeholder={'Address'} 
                                        maxLength={140}
                                    />
                                    <label>
                                        Name
                                    </label>
                                    <input className="formItem" type="text" name="name" 
                                        value={this.state.name} 
                                        onChange={(e) => this.handleNameChange(e)}
                                        placeholder={'Jim'} 
                                        maxLength={140}
                                    />
                                    <label>
                                        Description
                                    </label>
                                    <input className="formItem" type="text" name="description" 
                                        value={this.state.description} 
                                        onChange={(e) => this.handleDescriptionChange(e)}
                                        placeholder={'Optional Details'} 
                                        maxLength={140}
                                    />
                                    
                                    <div className ="formError">{this.state.formError}</div>
                                </div>
                            </div>
                        </div>
                        <div className="tools">
                            <div className="toolSection">
                                <button type="submit" value="Submit" className="green">{this.props.context}</button>
                            </div>
                            <div className="toolSection">
                                <button onClick={() => this.props.triggerClose()} className="red">Cancel</button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        );
    }
}

export default AddEditModal;