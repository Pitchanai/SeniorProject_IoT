var mongoose = require('mongoose');
var passport = require('passport');
var config = require('../config/database');
require('../config/passport')(passport);
var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var cors = require('cors');
var jwtsimple = require('jwt-simple');

var crypto = require('crypto');
var request = require('request');

var User = require('../models/user');
var MqttAccount = require('../models/mqtt_user');
var MqttAcl = require('../models/mqtt_acl');

const emqtt_url = config.emqttd;

router.use(cors())

router.post('/signin', function(req, res) {
    console.log(req.body.username + " requested to log in.")
    User.findOne({
        username: req.body.username
    }, function(err, user) {
        if (err) throw err;

        if (!user) {
            res.status(401).send({success: false, msg: 'Authentication failed. User not found.'});
        } else {
            user.comparePassword(req.body.password, function (err, isMatch) {
                if (isMatch && !err) {
                    // user found & password right > create a token
                    console.log(user.username + " logged in at " + (new Date()) + ".")
                    var token = jwt.sign(user.toJSON(), config.secret, {expiresIn: 3600});
                    // return the information including token as JSON
                    res.setHeader("Access-Control-Allow-Origin", "*");
                    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
                    res.json({success: true, token: 'JWT ' + token});
                } else {
                    res.json({success: false})
                    //res.status(401).send({success: false, msg: 'Authentication failed. Wrong password.'});
                }
            });
        }  
    });
});

router.post('/signup', passport.authenticate('jwt', {session:false}), function(req, res) {
    var token = getToken(req.headers);
    if (token) {
        const login_user = jwtsimple.decode(token, config.secret).username
        const login_roles = jwtsimple.decode(token, config.secret).roles
        if (login_roles == 'Administrator') {
            if (!req.body.username || !req.body.password) {
                res.json({success: false, msg: 'Please fill username and password.'});
            } else {
                var newUser = new User({
                    username: req.body.username,
                    password: req.body.password,
                    roles: req.body.roles
                });
                // save the user
                newUser.save(function(err) {
                    if (err) {
                        return res.json({success: false, msg: 'Username already exists.'});
                    }
                    res.json({success: true, msg: 'Successful created new user.'});
                });
            }
        } else {
            res.json({success: false, msg: 'Unauthorized. Only ADMIN can signup.'})
        }
    }
});

router.put('/change_password', passport.authenticate('jwt', {session: false}), function(req, res) {
    var token = getToken(req.headers);
    if (token) {
        const login_user = jwtsimple.decode(token, config.secret).username
        const login_roles = jwtsimple.decode(token, config.secret).roles
        
        MqttAccount.findOne({username: login_user}, function(err, user) {
            if (err)
                return res.json({
                    success: false,
                    msg: 'Error quering account from MongoDB.'
                })
            if (!user) {
                return res.json({
                    success: false,
                    msg: 'Username not found.'
                });
            }
            if (req.body.password) {
                user.password = req.body.password
            }
            user.save((err2, user2) => {
                if (err2) 
                    return res.json({
                        success: false,
                        msg: 'Error saving info.'
                    })
                res.json({
                    success: true,
                    msg: 'Update successful.'
                })
                
            })
        })
    }
})

router.get('/mqtt_account/:username', passport.authenticate('jwt', {session:false}), function(req, res) {
    var token = getToken(req.headers);
    if (token) {
        const login_user = jwtsimple.decode(token, config.secret).username
        const login_roles = jwtsimple.decode(token, config.secret).roles
        //console.log(req.user)
        const query1 = MqttAccount.findOne({username: req.params.username});
        const query2 = MqttAcl.findOne({username: req.params.username});
        query1.exec(function(err, user) {
            if(err)
                return res.json({
                    success: false,
                    msg: "Error querying account from mongodb."
                });
            if (!user) {
                return res.json({
                    success: false,
                    msg: "Account [username] not found."
                });
            } else {
                query2.exec(function(err2, user2) {
                    if (err2)
                        return res.json({
                            success: false,
                            msg: 'Error quering acl from mongodb.'
                        });
                    if (!user2) {
                        return res.json({
                            success: false,
                            msg: 'Account [acl] not found.'
                        })
                    } else {
                        if (login_roles == 'Administrator' || login_user == user.owner) {
                            return res.json({
                                success: true,
                                result: {
                                    username: user.username,
                                    is_superuser: user.is_superuser,
                                    created: user.created,
                                    device_name: user.device_name,
                                    description: user.description,
                                    owner: user.owner,
        
                                    publish: user2.publish,
                                    subscribe: user2.subscribe,
                                    pubsub: user2.pubsub,
                                }
                            })
                        } else {
                            res.json({
                                success: false,
                                msg: "You're not the owner of this mqtt account."
                            })
                        }
                    }
                })
            }
        });
    }
});

router.post('/mqtt_account', passport.authenticate('jwt', {session:false}), function(req, res) {
    var token = getToken(req.headers);
    if (token) {
        const login_user = jwtsimple.decode(token, config.secret).username
        var newMqtt = new MqttAccount({
            username: req.body.username.toLowerCase().replace(/\s+/g, ''),
            password: req.body.password,
            salt: '',
            is_superuser: req.body.is_superuser,
            created: Date.now(),
            last_update: Date.now(),
            device_name: req.body.device_name,
            description: req.body.description,
            owner: login_user
        });
        var publish_rules = [];
        var subscribe_rules = [];
        var pubsub_rules = [];
        if (req.body.publish) {
            publish_rules = req.body.publish.replace(/\s+/g, '').split(",")
        }
        if (req.body.subscribe) {
            subscribe_rules = req.body.subscribe.replace(/\s+/g, '').split(",")
        }
        if (req.body.pubsub) {
            pubsub_rules = req.body.pubsub.replace(/\s+/g, '').split(",")
        }
        var newMqttAcl = new MqttAcl({
            username: req.body.username.toLowerCase().replace(/\s+/g, ''),
            clientid: '',
            publish: publish_rules,
            subscribe: subscribe_rules,
            pubsub: pubsub_rules
        })
        newMqtt.save(function(err) {
            if (err) {
                return res.json({success: false, msg: 'Save Mqtt account failed.'});
            }
            newMqttAcl.save(function(err) {
                if (err) {
                    return res.json({success: false, msg: 'Save Mqtt acl failed.'});
                }
                res.json({success: true, msg: 'Created new Mqtt account successfully.'});
            })
        })
    }
});

router.put('/mqtt_account/:username', passport.authenticate('jwt', {session: false}), function(req, res) {
    var token = getToken(req.headers);
    if (token) {
        const login_user = jwtsimple.decode(token, config.secret).username
        const login_roles = jwtsimple.decode(token, config.secret).roles

        const query1 = MqttAccount.findOne({username: req.params.username});
        const query2 = MqttAcl.findOne({username: req.params.username});
        query1.exec(function(err1, user1) {
            if(err1) {
                return res.json({
                    success: false,
                    msg: "Error querying account from mongodb."
                });
            }
            if (user1.owner == login_user || login_roles == 'Administrator') {
                query2.exec(function(err2, user2) {
                    if (err2)
                        return res.json({
                            success: false,
                            msg: "Error querying acl from mongodb."
                        });
                    if  (req.body.password) {
                        user1.password = req.body.password
                    }
                    if (req.body.is_superuser) {
                        user1.is_superuser = req.body.is_superuser
                    }
                    if (req.body.device_name) {
                        user1.device_name = req.body.device_name
                    }
                    if (req.body.description) {
                        user1.description = req.body.description
                    }
                    if (req.body.publish) {
                        user2.publish = req.body.publish.replace(/\s+/g, '').split(",")
                    }
                    if (req.body.subscribe) {
                        user2.subscribe = req.body.subscribe.replace(/\s+/g, '').split(",")
                    }
                    if (req.body.pubsub) {
                        user2.pubsub = req.body.pubsub.replace(/\s+/g, '').split(",")
                    }

                    user1.last_update = new Date()

                    user1.save((err3, user3) => {
                        // Handle error from save
                        if (err3) {
                        return res.json({
                            success: false,
                            msg: "Error edit account info"
                        });
                        }
                        user2.save((err4, user4) => {
                            if (err4) {
                                return res.json({
                                    success: false,
                                    msg: "Error edit acl info"
                                });
                            }
                            return res.json({
                                success: true,
                                msg: "Update successful",
                                result: user3
                            })
                        })
                    })
                })
            } else {
                return res.json({
                    success: false,
                    msg: "You're not the owner of this mqtt account."
                })
            }
        });
    } else {
        return res.status(403).send({success: false, msg: 'Unauthorized.'})
    }
})

router.delete('/mqtt_account/:username', passport.authenticate('jwt', {session: false}), function(req, res) { // TODO MQTT ACL
    var token = getToken(req.headers);
    if (token) {
        const login_user = jwtsimple.decode(token, config.secret).username
        const login_roles = jwtsimple.decode(token, config.secret).roles

        MqttAccount.findOne({username:req.params.username}, function(err1, user1) {
            if(err1)
                return res.json({
                    success: false,
                    msg: 'Error querying account from MongoDB.'
                });
            if(!user1) {
                return res.json({
                    success: false,
                    msg: 'Username not found.'
                });
            }
            if (user1.owner == login_user || login_roles == 'Administrator') {
                MqttAcl.findOne({username: req.params.username}, function(err2, user2) {
                    if (err2)
                        return res.json({
                            success: false,
                            msg: 'Error query acl from MongoDB.'
                        });
                    if (!user2)
                        return res.json({
                            success: false,
                            msg: 'Username in acl not found.'
                        })
                    user1.remove(function (err3) {
                        if (err3)
                            return res.json({
                                success: false,
                                msg: 'Cannot remove this username account from MongoDB.'
                            });
                        user2.remove(function (err4) {
                            if (err4)
                                return res.json({
                                    success: false,
                                    msg: 'Cannot remove this username acl from MongoDB.'
                                });
                            return res.json({
                                success: true,
                                msg: 'Successfully remove user.'
                            })
                        })
                    })
                })
            } else {
                return res.json({
                    success: false,
                    msg: "You're not the owner of this mqtt account."
                })
            }
        });
    } else {
        return res.status(403).send({success: false, msg: 'Unauthorized.'})
    }
})

router.get('/mqtt_all_username', passport.authenticate('jwt', {session: false}), function(req, res) {
    var token = getToken(req.headers);
    if (token) {
        const login_user = jwtsimple.decode(token, config.secret).username
        const login_roles = jwtsimple.decode(token, config.secret).roles

        if (login_roles == 'Administrator') {
            MqttAccount.distinct('username', function(err, username) {
                if (err) {
                    return res.json({success: false, msg: 'Get all mqtt username failed.'});
                }
                res.json({success: true, result: username});
            });
        } else {
            MqttAccount.distinct('username', {'owner':login_user}, function(err, username) {
                if (err) {
                    return res.json({success: false, msg: 'Get all mqtt username failed.'});
                }
                res.json({success: true, result: username});
            })
        }
    } else {
        return res.status(403).send({success: false, msg: 'Unauthorized.'})
    }
});

router.get('/mqtt_all_info', passport.authenticate('jwt', {session: false}), function(req, res) {
    var token = getToken(req.headers);
    if (token) {
        const login_user = jwtsimple.decode(token, config.secret).username
        const login_roles = jwtsimple.decode(token, config.secret).roles

        if (login_roles == 'Administrator') {
            MqttAccount.find({}, function(err, mqtt_info) {
                if (err) {
                    return res.json({success: false, msg: 'Get all mqtt info failed.'});
                }
                res.json({success: true, result: mqtt_info});
            });
        } else {
            MqttAccount.find({owner: login_user}, function(err, mqtt_info) {
                if (err) {
                    return res.json({success: false, msg: 'Get all mqtt info failed.'});
                }
                res.json({success: true, result: mqtt_info});
            })
        }
    } else {
        return res.status(403).send({success: false, msg: 'Unauthorized.'})
    }
});

getToken = function (headers) {
    if (headers && headers.authorization) {
        var parted = headers.authorization.split(' ');
        if (parted.length === 2) {
            return parted[1];
        } else {
            return null;
        }
    } else {
        return null;
    }
};

module.exports = router;