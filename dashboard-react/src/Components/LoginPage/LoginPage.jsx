import React, { Component } from 'react';
import 'semantic-ui-css/semantic.min.css';
import { Redirect } from 'react-router-dom'

import { Container, Tab, Form, Button, Dimmer, Loader, Table, Icon, Label, Message, Modal, Header, Popup } from 'semantic-ui-react';

//const api_url = 'https://pitchanai.me:22000/api/'
//const api_url = 'http://localhost:22000/api/'
const api_url = 'https://api.vehicleon.cloud/api/'
const emqtt_api_url = 'https://api.vehicleon.cloud/emqtt/'

export default class LoginPage extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            // Login
            login_username: '',
            login_password: '',

            login_username_error: false,
            login_password_error: false,

            submitted_login_username: '',
            submitted_login_password: '',

            jwt_token: '',
            login_success: false,

            // Server Status
            fetch_server_status_success: false,
            backend: false,
            broker: false,

            // Tab
            activeIndex: 0,
            
            // Device Status
            device_status_fetch_success: false,
            emqttd_status_fetch_success: false,

            device_list: [],
            device_active_num: 0,
            device_active: [],

            delete_username: '',
            delete_confirm: {},

            // Device Registration
            mqtt_account_created_success: false,
            mqtt_acl_created_success: false,

            create_username: '',
            create_password: '',
            create_password_c: '',
            create_is_superuser: false,
            create_device_name: '',
            create_device_description: '',

            create_publish_rules: '',
            create_subscribe_rules: '',
            create_pubsub_rules: '',

            create_username_error: false,
            create_password_error: false,
            create_password_c_error: false,
            create_password_notmatch_error: false,
            create_rules_error: false, // at least 1 rule selected.

            sm_create_username: '',
            sm_create_password: '',
            sm_create_is_superuser: false,
            sm_create_device_name: '',
            sm_create_device_description: '',

            sm_create_publish_rules: '',
            sm_create_subscribe_rules: '',
            sm_create_pubsub_rules: '',

            create_device_history: [],

            // Device Edit
            device_edit_fetch_success: false,
            edit_username: '',

            edit_is_superuser: '',
            edit_device_name: '',
            edit_device_description: '',
            edit_owner: '',
            edit_publish_rules: '',
            edit_subscribe_rules: '',
            edit_pubsub_rules: '',

            edit_password_fill: '',
            edit_password_c_fill: '',
            edit_is_superuser_fill: '',
            edit_device_name_fill: '',
            edit_device_description_fill: '',
            edit_publish_rules_fill: '',
            edit_subscribe_rules_fill: '',
            edit_pubsub_rules_fill: '',

            edit_password_notmatch_error: false,
            edit_rules_error: false, // at least 1 rule selected.

        }
        this.handleChange = this.handleChange.bind(this);
        this.handleEditButton = this.handleEditButton.bind(this);
        this.handleEditSubmit = this.handleEditSubmit.bind(this);
        this.handleEditReset = this.handleEditReset.bind(this);
        this.handleDeleteButton = this.handleDeleteButton.bind(this);
        this.handleModalClose = this.handleModalClose.bind(this);
        this.handleConfirmDelete = this.handleConfirmDelete.bind(this);
        this.handleTabChange = this.handleTabChange.bind(this)
        this.handleLoginSubmit = this.handleLoginSubmit.bind(this);
        this.handleCreateAccountSubmit = this.handleCreateAccountSubmit.bind(this);
        this.handleCreateAccountClear = this.handleCreateAccountClear.bind(this);
        //this.toggleCheckBox = this.toggleCheckBox.bind(this); // NOT YET DONE
    }

    handleChange = (e, {name, value}) => {
        this.setState({ [name]: value})
    }

    handleEditButton = (e, {name}) => {
        this.setState({edit_username: name})
        fetch(api_url + 'mqtt_account/' + name, {
            method: 'GET',
                headers: {
                    'Access-Control-Allow-Origin':'*',
                    'Authorization': this.state.jwt_token
                }
        })
        .then(res => res.json())
        .then(results => {
            if (results.success) {
                //console.log(results)
                //console.log(results.result.subscribe.toString())
                this.setState({
                    edit_is_superuser: results.result.is_superuser,
                    edit_is_superuser_fill: results.result.is_superuser,

                    edit_device_name: results.result.device_name,
                    edit_device_name_fill: results.result.device_name,

                    edit_device_description: results.result.description,
                    edit_device_description_fill: results.result.description,

                    edit_owner: results.result.owner,

                    edit_publish_rules: results.result.publish.toString(),
                    edit_publish_rules_fill: results.result.publish.toString(),

                    edit_subscribe_rules: results.result.subscribe.toString(),
                    edit_subscribe_rules_fill: results.result.subscribe.toString(),

                    edit_pubsub_rules: results.result.pubsub.toString(),
                    edit_pubsub_rules_fill: results.result.pubsub.toString(),

                    device_edit_fetch_success: true,

                    activeIndex: 2
                });
            }
        })
    }

    handleEditSubmit = () => {
        const {edit_username, edit_password_fill, edit_password_c_fill,
            edit_is_superuser, edit_is_superuser_fill, edit_device_name, edit_device_name_fill,
            edit_device_description, edit_device_description_fill, edit_publish_rules, edit_publish_rules_fill,
            edit_subscribe_rules, edit_subscribe_rules_fill, edit_pubsub_rules, edit_pubsub_rules_fill, 
            edit_password_notmatch_error, edit_rules_error} = this.state
        this.setState({ edit_rules_error: (edit_publish_rules_fill || edit_subscribe_rules_fill || edit_pubsub_rules_fill) ? false : true})
        
        if (!(edit_password_fill === edit_password_c_fill)) {
            this.setState({ edit_password_notmatch_error: true})
        } else {
            this.setState({ edit_password_notmatch_error: false})
        }

        let canSubmitEdit = () => {
            if (!(edit_publish_rules_fill || edit_subscribe_rules_fill || edit_pubsub_rules_fill)) {
                return false;
            } else if (!(edit_password_fill === edit_password_c_fill)) {
                return false;
            } else {
                return true;
            } 
        }
        if (canSubmitEdit()) {
            let editAccount = {
                password: edit_password_fill,
                is_superuser: edit_is_superuser_fill,
                device_name: edit_device_name_fill,
                description: edit_device_description_fill,
                publish: edit_publish_rules_fill,
                subscribe: edit_subscribe_rules_fill,
                pubsub: edit_pubsub_rules_fill
            }
            fetch(api_url + 'mqtt_account/' + edit_username, {
                method: 'PUT',
                headers: {
                    'Access-Control-Allow-Origin':'*',
                    'Accept': 'application/json, text/plain, */*',
                    'Content-Type': 'application/json',
                    'Authorization': this.state.jwt_token
                },
                body: JSON.stringify(editAccount)
            })
            .then(res => res.json())
            .then(results => {
                if (results.success) {
                    //console.log(results)
                    this.setState({
                        device_edit_fetch_success: false,
                        edit_username: '',

                        edit_is_superuser: '',
                        edit_device_name: '',
                        edit_device_description: '',
                        edit_owner: '',
                        edit_publish_rules: '',
                        edit_subscribe_rules: '',
                        edit_pubsub_rules: '',

                        edit_password_fill: '',
                        edit_password_c_fill: '',
                        edit_is_superuser_fill: '',
                        edit_device_name_fill: '',
                        edit_device_description_fill: '',
                        edit_publish_rules_fill: '',
                        edit_subscribe_rules_fill: '',
                        edit_pubsub_rules_fill: '',

                        edit_password_notmatch_error: false,
                        edit_rules_error: false,

                        activeIndex: 0
                    })
                } else {
                    alert('Edit Error')
                }
            })
        }
    }
    
    handleEditReset = () => {
        const {edit_is_superuser, edit_device_name, edit_device_description,
            edit_publish_rules, edit_subscribe_rules, edit_pubsub_rules} = this.state

        this.setState({
            edit_password_fill: '',
            edit_password_c_fill: '',
            edit_is_superuser_fill: edit_is_superuser,
            edit_device_name_fill: edit_device_name,
            edit_device_description_fill: edit_device_description,
            edit_publish_rules_fill: edit_publish_rules,
            edit_subscribe_rules_fill: edit_subscribe_rules,
            edit_pubsub_rules_fill: edit_pubsub_rules,

            edit_password_notmatch_error: false,
            edit_rules_error: false,
        })
    }

    handleDeleteButton = (e, {name}) => {
        this.setState({
            delete_username: name,
            delete_confirm: {
                [name]: true
            }
        })
    }

    handleModalClose = () => {
        this.setState({
            delete_username: '',
            delete_confirm: {
                [this.state.delete_username]: false
            }
        })  
    }

    handleConfirmDelete = () => { // << REFRESH DEVICE LIST DATA
        //console.log("DELETE : " + this.state.delete_username)
        fetch(api_url + 'mqtt_account/'+ this.state.delete_username, {
            method: 'DELETE',
                headers: {
                    'Access-Control-Allow-Origin':'*',
                    'Authorization': this.state.jwt_token
                }
            })
            .then(res => res.json())
            .then(results => {
                if (results.success) {
                    //console.log(results.msg)
                    this.setState({
                        delete_username: '',
                        device_status_fetch_success: false,
                        deletE_confirm: {
                            [this.state.delete_username]: false
                        }
                    })
                } else {
                    //console.log(results.msg)
                    this.setState({
                        delete_username: '',
                        deletE_confirm: {
                            [this.state.delete_username]: false
                        }
                    })
                }

        })
    }

    handleTabChange = (e, { activeIndex }) => {
        this.setState({ activeIndex })
    }

    handleLoginSubmit = () => {
        //console.log('handleLoginSubmit')
        const {login_username, login_password} = this.state
        if (!login_username) {
            this.setState({login_username_error: true})
        } else {
            this.setState({login_username_error: false})
        }

        if (!login_password) {
            this.setState({login_password_error: true})
        } else {
            this.setState({login_password_error: false})
        }
        const temp_password = login_password;
        if (login_username && login_password) {
            let username_login = {
                username: this.state.login_username,
                password: this.state.login_password
            }
            fetch(api_url + 'signin/', {
              method: 'POST',
              headers: {
                'Access-Control-Allow-Origin':'*',
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(username_login)
            })
            .then(res => res.json())
            .then(results => {
                if (results.success) {
                    this.setState({jwt_token: results.token, login_success:true, submitted_login_password:'', submitted_login_username:''})
                    alert('Login success.')
                    //console.log("Fetch : " + this.state.login_success)
                    //this.state.create_device_history.push([<Label color={'green'}>Test : Added</Label>],[<br />],[<br />]) // << Set State

                } else {
                    alert('Login failed')
                }
            })
          } else {
            this.setState({password_error:true})
          }
        this.setState({submitted_login_username: login_username, submitted_login_password: temp_password, login_password: ''})
    }

    handleCreateAccountSubmit = () => {
        //console.log('handleCreateAccountSubmit');
        const {create_username, create_password, create_password_c,
               create_is_superuser, create_device_name, create_device_description,
               create_publish_rules, create_subscribe_rules, create_pubsub_rules,
               create_username_error, create_password_error, create_password_c_error, 
               create_rules_error, create_password_notmatch_error} = this.state

        this.setState({ create_username_error: (create_username) ? false : true,
                        create_rules_error: (create_publish_rules || create_subscribe_rules || create_pubsub_rules) ? false : true
        });

        if (!(create_password === create_password_c)) {
            this.setState({create_password_notmatch_error: true, create_password_error: true, create_password_c_error: true})
        } else {
            this.setState({ create_password_notmatch_error: false,
                            create_password_error: (create_password) ? false : true,
                            create_password_c_error: (create_password_c) ? false : true,})
        }

        let canSubmit = () => {
            if (!create_username) {
                return false;
            } else if (!create_password) {
                return false;
            } else if (!create_password_c) {
                return false;
            } else if (!(create_publish_rules || create_subscribe_rules || create_pubsub_rules)) {
                return false;
            } else if (!(create_password === create_password_c)) {
                return false;
            } else {
                return true;
            }
        }
        //console.log("can submit : " + canSubmit())
        if (canSubmit()) { // << FIX THIS !!!!!!
            let createAccount = {
                username: create_username,
                password: create_password,
                is_superuser: create_is_superuser,
                device_name: create_device_name,
                description: create_device_description,
                publish: create_publish_rules,
                subscribe: create_subscribe_rules,
                pubsub: create_pubsub_rules
            }
            fetch(api_url + 'mqtt_account', {
              method: 'POST',
              headers: {
                'Access-Control-Allow-Origin':'*',
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json',
                'Authorization': this.state.jwt_token
              },
              body: JSON.stringify(createAccount)
            })
            .then(res => res.json())
            .then(results => {
                if (results.success) {
                    //console.log(results)
                    let temp = this.state.create_device_history;
                    temp.push([<Label color={'green'}>{create_username} : Added</Label>],[<br />],[<br />])
                    this.setState({
                        create_username: '',
                        create_password: '',
                        create_password_c: '',
                        create_is_superuser: false,
                        create_device_name: '',
                        create_device_description: '',
                        create_device_history: temp,
                        create_publish_rules: '',
                        create_subscribe_rules: '',
                        create_pubsub_rules: '',

                        activeIndex: 0,
                        device_status_fetch_success: false
                    })
                    //console.log(this.state.create_device_history)
                    //console.log(temp)
                } else {
                    alert('Add failed')
                    //console.log(results)
                    let temp = this.state.create_device_history;
                    temp.push([<Label color={'red'}>{create_username} : Failed</Label>],[<br />],[<br />])
                    this.setState({
                        create_device_history: temp
                    })
                    //console.log(this.state.create_device_history)
                    //console.log(temp)
                }
            })

        } else {
            alert('Please fill all required form.')
        }
    }

    handleCreateAccountClear = () => {
        this.setState({
            mqtt_account_created_success: false,
            mqtt_acl_created_success: false,

            create_username: '',
            create_password: '',
            create_password_c: '',
            create_is_superuser: false,
            create_device_name: '',
            create_device_description: '',

            create_publish_rules: '',
            create_subscribe_rules: '',
            create_pubsub_rules: '',
        })
    }

    /*handleCheckbox = (e, {name}) => {
        const {[name]} = this.state
        this.setState({
            [name]: ![name]
        })
    }*/
    
    componentWillReceiveProps(nextProps){
    }
    componentDidUpdate() {
        /*if (!this.state.fetch_server_status_success && !this.state.device_status_fetch_success) {
            console.log('FETCH SERVER STATUS :' + this.state.fetch_server_status_success)
            fetch(api_url + 'server_status/', {
                method: 'GET',
                headers: {
                    'Access-Control-Allow-Origin':'*',
                    'Access-Control-Allow-Credentials': true,
                }
            })
            .then(res => res.json())
            .then(results => {
                console.log("GET STATUS")
                console.log(results)
                this.setState({
                    backend: results.backend,
                    broker: results.broker,
                    fetch_server_status_success: true
                })
            })
        }*/

        //console.log('ComponentDidUpdate called.')
        if (this.state.login_success && !this.state.device_status_fetch_success) {
            fetch(api_url + "mqtt_all_info/", {
                method: 'GET',
                headers: {
                    'Access-Control-Allow-Origin':'*',
                    'Authorization': this.state.jwt_token
                }
            })
            .then(res => res.json())
            .then(results => {
                if (results.success) {
                    //console.log(results)
                    var temp = {}
                    for (var i = 0; i < results.result.length; i++) {
                        temp[results.result[i].username] = false
                    }
                    this.setState({device_status_fetch_success: true, device_list: results.result, delete_confirm: temp})
                    
                    fetch(emqtt_api_url + 'clients', {
                        method: 'GET',
                        headers: {
                            'Access-Control-Allow-Origin':'*',
                            'Access-Control-Allow-Credentials': true,
                            'Accept': 'application/json, text/plain, */*',
                            'Content-Type': 'application/json',
                            'Authorization': this.state.jwt_token
                        },
                    })
                    .then(res2 => res2.json())
                    .then(results2 => {
                        var temp = []
                        var temp2 = {}
                        //console.log(results2)
                        if (results2.success) {
                            //console.log(results2.result)
                            if (results2.result.total_num > 0) {
                                //console.log(results2.result.objects)
                                for (var i = 0; i < results2.result.total_num; i++) {
                                    temp.push(results2.result.objects[i].username)
                                    //temp2[results2.result.objects[i].username] = false
                                }
                                this.setState({device_active: temp, emqttd_status_fetch_success: true});
                            } else {
                                this.setState({emqttd_status_fetch_success: true});
                            }
                            //console.log(this.state.device_active)
                        }
                    })
                }
            })
        }
    }

    shouldComponentUpdate () {
        return true
      }

    render() {
        //const { login_username, login_password, login_username_error, login_password_error} = this.state
        if (!this.state.login_success) {
            return (
                <Container>
                    <Header as='h1' content='vCloud Backend' subheader='for testing backend authentication API' />
                    <Tab panes={[
                        { menuItem: 'Login', render: () => <Tab.Pane> <div>
                            <Form onSubmit={this.handleLoginSubmit}>
                                <Form.Input error={this.state.login_username_error} label="Username" placeholder='Username' 
                                    name='login_username' value={this.state.login_username} onChange={this.handleChange} />
                                <Form.Input error={this.state.login_password_error} label="Password" placeholder='Password' type='password' 
                                    name='login_password' value={this.state.login_password} onChange={this.handleChange}/>
                                <Button color='blue' type='submit'>Log in</Button>
                            </Form>
                        </div> </Tab.Pane> }
                    ]} />
                </Container>
            );
        } else if (this.state.login_success) {
            var device_table = []
            for (var i = 0; i < this.state.device_list.length; i++) {
                var icon = ''
                var label = ''
                if (this.state.device_active.indexOf(this.state.device_list[i].username) > -1) {
                    icon = 'checkmark'
                    label = "Active"
                } else {
                    icon = 'close'
                    label = "Inactive"
                }
                /*device_table.push(
                    <Table.Row>
                        <Table.Cell>{i+1}</Table.Cell>
                        <Table.Cell>{this.state.device_list[i].device_name}</Table.Cell>
                        <Table.Cell>{this.state.device_list[i].username}</Table.Cell>
                        <Table.Cell positive={this.state.device_list[i].username.indexOf(this.state.device_active[i]) > -1} 
                                    negative={!this.state.device_list[i].username.indexOf(this.state.device_active[i]) > -1}>Inactive</Table.Cell>
                    </Table.Row>
                )*/
                device_table.push(
                    <Table.Row>
                        <Table.Cell>{i+1}</Table.Cell>
                        <Table.Cell>{this.state.device_list[i].device_name}</Table.Cell>
                        <Table.Cell>{this.state.device_list[i].username}</Table.Cell>
                        <Table.Cell positive={this.state.device_active.indexOf(this.state.device_list[i].username) > -1} 
                                    negative={!(this.state.device_active.indexOf(this.state.device_list[i].username) > -1)}><Icon name={icon} />
                                    {label}</Table.Cell>
                        <Table.Cell> 
                            <Button size='small' animated='fade' name={this.state.device_list[i].username} onClick={this.handleEditButton} >
                                <Button.Content visible><Icon name='edit' /></Button.Content>
                                <Button.Content hidden>Edit</Button.Content>
                            </Button>
                            
                            <Modal trigger={<Button negative size='small' animated='fade' name={this.state.device_list[i].username}
                                            onClick={this.handleDeleteButton}>
                                                <Button.Content visible><Icon name='trash' /></Button.Content>
                                                <Button.Content hidden>Delete</Button.Content>
                                            </Button>}
                                            
                                open={this.state.delete_confirm[this.state.device_list[i].username]}
                                onClose={this.handleModalClose}
                                basic
                                size='small'        
                            >
                                <Modal.Header>Confirm to delete {this.state.delete_username}</Modal.Header>
                                <Modal.Content>
                                    <p>Confirm ?</p>
                                </Modal.Content>
                                <Modal.Actions>
                                    <Button color='grey' onClick={this.handleModalClose} inverted>
                                        <Icon name='cancel'/> Cancel
                                    </ Button>
                                    <Button color='red' onClick={this.handleConfirmDelete} inverted>
                                        <Icon name='trash'/> Confirm Delete
                                    </ Button>
                                </Modal.Actions>
                            </Modal>
                        </Table.Cell> 
                    </Table.Row>
                )
            }

            let NoUsername = () => {
                return (
                    <Tab.Pane>
                        <h1>No Username</h1>
                    </Tab.Pane>
            )}

            let HaveUsername = () => {
                return (
                    <Tab.Pane>
                        <Form>
                                    <Form.Input error={this.state.edit_username_error} label="Device Username" placeholder='Device Username' required width={16}
                                        name='edit_username_fill' value={this.state.edit_username} onChange={this.handleChange} />

                                    <Form.Group>
                                    <Form.Input error={this.state.edit_password_error} label="Password" placeholder='Password' required width={8} type='password'
                                        name='edit_password_fill' value={this.state.edit_password_fill} onChange={this.handleChange} />
                                    <Form.Input error={this.state.edit_password_c_error} label=" " placeholder='Confirm Password' required width={8} type='password'
                                        name='edit_password_c_fill' value={this.state.edit_password_c_fill} onChange={this.handleChange} />
                                    </Form.Group>
                                    <Message negative hidden={!this.state.edit_password_notmatch_error}>
                                        <Message.Header>Password Error</Message.Header>
                                        <Message.Content>The passwords you entered do not match.</Message.Content>
                                    </Message>
                                    <Form.Checkbox inline label='Superuser' required 
                                        name='edit_is_superuser_fill' checked={this.state.edit_is_superuser_fill} onChange={this.handleChange}/>
                                    <Form.Input label="Device Name" placeholder='Device Name' width={16}
                                        name='edit_device_name_fill' value={this.state.edit_device_name_fill} onChange={this.handleChange} />
                                    <Form.TextArea label='Device Description' placeholder='Device Description' width={16}
                                        name='edit_device_description_fill' value={this.state.edit_device_description_fill} onChange={this.handleChange} />

                                    <Form.Input error={this.state.edit_rules_error} label='Publish Rules' placeholder="Topic01,Topic02"
                                        name='edit_publish_rules_fill' value={this.state.edit_publish_rules_fill} onChange={this.handleChange} />
                                    <Form.Input error={this.state.edit_rules_error} label='Subscribe Rules' placeholder="Topic01,Topic02"
                                        name='edit_subscribe_rules_fill' value={this.state.edit_subscribe_rules_fill} onChange={this.handleChange} />
                                    <Form.Input error={this.state.edit_rules_error} label='Publish & Subscribe Rules' placeholder="Topic01,Topic02"
                                        name='edit_pubsub_rules_fill' value={this.state.edit_pubsub_rules_fill} onChange={this.handleChange} />

                                    <Button color='blue' type='submit'>Edit Device</Button>
                                    <Button color='red' type='reset'>Clear</Button>
                        </Form>
                    </Tab.Pane>
                )
            }

            return (
                <Container>
                    <Tab menu={{attached: false, tabular: false }} activeIndex={this.state.activeIndex} onTabChange={this.handleTabChange}
                        panes={[
                        { menuItem: 'Device Status', render: () => <Tab.Pane>
                                <Dimmer active={!this.state.device_status_fetch_success}>
                                    <Loader>Loading</Loader>
                                </Dimmer>
                                <h1> Device Status </h1>
                                <Table celled>
                                    <Table.Header>
                                    <Table.Row>
                                        <Table.HeaderCell>#</Table.HeaderCell>
                                        <Table.HeaderCell>Device Name</Table.HeaderCell>
                                        <Table.HeaderCell>Device ID</Table.HeaderCell>
                                        <Table.HeaderCell>Status</Table.HeaderCell>
                                        <Table.HeaderCell>Function</Table.HeaderCell>
                                    </Table.Row>
                                    </Table.Header>
                                    <Table.Body>
                                        {device_table}
                                    </Table.Body>
                                </Table>
                                <Label color={(this.state.device_status_fetch_success) ? 'green' : 'red'}>Backend Server Status : {(this.state.device_status_fetch_success) ? 'Active' : 'Inactive'}</Label>
                                <Label color={(this.state.emqttd_status_fetch_success) ? 'green' : 'red'}>Emqtt Server Status : {(this.state.emqttd_status_fetch_success) ? 'Active' : 'Inactive'}</Label>                             
                            </Tab.Pane>},
                        { menuItem: 'Add Device', render: () => <Tab.Pane>
                                <Form onSubmit={this.handleCreateAccountSubmit}>
                                    <Form.Input error={this.state.create_username_error} label="Device Username" placeholder='Device Username' required width={16}
                                        name='create_username' value={this.state.create_username} onChange={this.handleChange} />

                                    <Form.Group>
                                    <Form.Input error={this.state.create_password_error} label="Password" placeholder='Password' required width={8} type='password'
                                        name='create_password' value={this.state.create_password} onChange={this.handleChange} />
                                    <Form.Input error={this.state.create_password_c_error} label=" " placeholder='Confirm Password' required width={8} type='password'
                                        name='create_password_c' value={this.state.create_password_c} onChange={this.handleChange} />
                                    </Form.Group>
                                    <Message negative hidden={!this.state.create_password_notmatch_error}>
                                        <Message.Header>Password Error</Message.Header>
                                        <Message.Content>The passwords you entered do not match.</Message.Content>
                                    </Message>
                                    <Form.Checkbox inline label='Superuser'
                                        name='create_is_superuser' checked={this.state.create_is_superuser} onClick={() => { this.setState({create_is_superuser: !this.state.create_is_superuser})}}/>
                                    <Form.Input label="Device Name" placeholder='Device Name' width={16}
                                        name='create_device_name' value={this.state.create_device_name} onChange={this.handleChange} />
                                    <Form.TextArea label='Device Description' placeholder='Device Description' width={16}
                                        name='create_device_description' value={this.state.create_device_description} onChange={this.handleChange} />

                                    <Form.Input error={this.state.create_rules_error} label='Publish Rules' placeholder="Topic01,Topic02"
                                        name='create_publish_rules' value={this.state.create_publish_rules} onChange={this.handleChange} />
                                    <Form.Input error={this.state.create_rules_error} label='Subscribe Rules' placeholder="Topic01,Topic02"
                                        name='create_subscribe_rules' value={this.state.create_subscribe_rules} onChange={this.handleChange} />
                                    <Form.Input error={this.state.create_rules_error} label='Publish & Subscribe Rules' placeholder="Topic01,Topic02"
                                        name='create_pubsub_rules' value={this.state.create_pubsub_rules} onChange={this.handleChange} />

                                    <Button color='blue' type='submit'>Add Device</Button>
                                    <Button color='red' type='reset' onClick={this.handleCreateAccountClear}>Clear</Button>
                                    <br />
                                    <br />
                                    {this.state.create_device_history}
                                </Form>
                        </Tab.Pane>},
                        { menuItem: 'Edit Device', render: () => (this.state.edit_username && this.state.device_edit_fetch_success) ? 
                        <Tab.Pane>
                            <h1>Editing {this.state.edit_username}</h1>
                            <Form onSubmit={this.handleEditSubmit}>
                                    <Form.Input error={this.state.edit_username_error} label="Device Username" placeholder='Device Username' required width={16}
                                        name='edit_username' value={this.state.edit_username}/>

                                    <Form.Group>
                                    <Form.Input error={this.state.edit_password_error} label="Password" placeholder='Password' width={6} type='password'
                                        name='edit_password_fill' value={this.state.edit_password_fill} onChange={this.handleChange} />
                                    <Form.Input error={this.state.edit_password_c_error} label="Confirm Password" placeholder='Confirm Password' width={6} type='password'
                                        name='edit_password_c_fill' value={this.state.edit_password_c_fill} onChange={this.handleChange} />
                                    </Form.Group>
                                    <Message negative hidden={!this.state.edit_password_notmatch_error}>
                                        <Message.Header>Password Error</Message.Header>
                                        <Message.Content>The passwords you entered do not match.</Message.Content>
                                    </Message>
                                    <Form.Checkbox inline label='Superuser' required 
                                        name='edit_is_superuser_fill' checked={this.state.edit_is_superuser_fill} onClick={() => { this.setState({edit_is_superuser_fill: !this.state.edit_is_superuser_fill})}}/>
                                    <Form.Input label="Device Name" placeholder='Device Name' width={16}
                                        name='edit_device_name_fill' value={this.state.edit_device_name_fill} onChange={this.handleChange} />
                                    <Form.TextArea label='Device Description' placeholder='Device Description' width={16}
                                        name='edit_device_description_fill' value={this.state.edit_device_description_fill} onChange={this.handleChange} />

                                    <Form.Input error={this.state.edit_rules_error} label='Publish Rules' placeholder="Topic01,Topic02"
                                        name='edit_publish_rules_fill' value={this.state.edit_publish_rules_fill} onChange={this.handleChange} />
                                    <Form.Input error={this.state.edit_rules_error} label='Subscribe Rules' placeholder="Topic01,Topic02"
                                        name='edit_subscribe_rules_fill' value={this.state.edit_subscribe_rules_fill} onChange={this.handleChange} />
                                    <Form.Input error={this.state.edit_rules_error} label='Publish & Subscribe Rules' placeholder="Topic01,Topic02"
                                        name='edit_pubsub_rules_fill' value={this.state.edit_pubsub_rules_fill} onChange={this.handleChange} />

                                    <Button color='blue' type='submit'>Edit Device</Button>
                                    <Button color='red' type='reset' onClick={this.handleEditReset}>Reset</Button>
                            </Form>
                    </Tab.Pane>
                        :<NoUsername/>},
                    ]} />
                </Container>
            );
        }
      }
}