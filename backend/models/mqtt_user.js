var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');

var MqttAccount = new Schema({
    username: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    }, 
    salt: {
        type: String
    },
    is_superuser: {
        type: Boolean,
        required: true
    },
    created: {
        type: Date
    },
    device_name: {
        type: String
    },
    description: {
        type: String
    },
    owner: {
        type: String,
        required: true
    }
});

MqttAccount.pre('save', function(next) {
    var user = this;
    if (this.isModified('password') || this.isNew) {
        bcrypt.genSalt(10, function (err, salt) {
            console.log("salt : " + salt)
            if (err) {
                return next(err);
            }
            bcrypt.hash(user.password, salt, null, function (err, hash) {
                if (err) {
                    return next(err);
                }
                user.password = hash; 
                user.salt = salt;
                next();
            });
        });
    } else {
        return next();
    }
});

MqttAccount.methods.comparePassword = function (passw, cb) {
    //console.log(passw)
    //console.log(this.password)
    bcrypt.compare(passw, this.password, function (err, isMatch) {
        if (err) {
            return cb(err)
        }
        cb(null, isMatch);
    });
};

module.exports = mongoose.model('MqttAccount', MqttAccount);