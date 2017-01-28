/**
 * Created by rano on 22/01/17.
 */
var mongoose = require('mongoose');
var userCollection = require("../Models/user");
var Q = require("q");
var promise = require('promise');
var successMessage = {
    "Success": true,
    "infos": {}
    ,
    "statusCode": {}
};
var failedMessage ={
    "Success": false,
    "message": {}
    ,
    "statusCode": {}
};
/**
 * function which enter a new profile in the DB
 * @param user1
 * @returns promise with success or failed message and statuscode
 */
var registerUser = function (userData) {
    var deferred = Q.defer();
    console.log(userData);
    var userModel = new userCollection(userData);
    userModel.save(function (err) {
        if (err) {
            failedMessage.message = {};
            failedMessage.statusCode = 500;
            failedMessage.message =('USER_MONGODB_ERROR');
            failedMessage.infos = err;
            deferred.reject(failedMessage);
        }
        else {
            console.log('User added');
            deferred.resolve();
        }
    });
    return deferred.promise;
};
/**
 * Authentify user with his email and passer,...
 * @param emailPassword
 * @param passwordCrypt
 * @param tokenAuth
 * @returns {*|promise with a JWT associate to the user
 */
var login = function (emailPassword, tokenAuth) {
    var deferred = Q.defer();
    userCollection.findOneAndUpdate({"email": emailPassword.email}, {$set: {token: tokenAuth}}, function (err, res) {
        if (err) {
            failedMessage.message = {};
            failedMessage.message = ('USER_MONGODB_ERROR');
            failedMessage.infos = err;
            deferred.reject(failedMessage);
        }
        if (userCollection) {
            console.log(res);
            res.password = undefined;
            res.verifyEmailToken = undefined;
            console.log('User trouver et JWT donné pour 60min');
            deferred.resolve(res);
        }
        else {
            failedMessage.message = {};
            failedMessage.message = ('USER_DOCUMENT_NOT_FOUND');
            deferred.reject(failedMessage);
        }
    });
    return deferred.promise;
};
/**
 * Looking for a user with his email
 * @param mail
 * @returns {*|promise}
 */
function getUserByMail(mail) {
    var deferred = Q.defer();
    console.log(mail);
    userCollection.findOne({'email': mail}, function (err, res) {
        if (err) {
            failedMessage.message = {};
            failedMessage.statusCode = 500;
            failedMessage.message = ('USER_MONGODB_ERROR');
            failedMessage.infos = err;
            deferred.reject(failedMessage);
        }
        if (res !== null) {
            
            deferred.resolve(res);
        }
        else {
            deferred.reject(res);
        }
    });
    return deferred.promise;
};

/**
 * function that delete the token to logout the user
 * @param mail
 * @returns {*|promise}
 */
var deleteToken = function (mail) {
    var deferred = Q.defer();
    var newToken = null;
    userCollection.findOneAndUpdate({"email": mail}, {$set: {token: newToken}}, function (err, res) {
        if (err) {
            failedMessage.message = {};
            failedMessage.message = ('USER_MONGODB_ERROR');
            failedMessage.statusCode = 500;
            failedMessage.infos = err;
            deferred.reject(failedMessage);
        }
        if (res === null) {
            failedMessage.message = {};
            failedMessage.message = 500;
            failedMessage.message = ('USER_DOCUMENT_NOT_FOUND');
            deferred.reject(failedMessage);
        }
        else {
            deferred.resolve(res);
        }
    });
    return deferred.promise;
};

/**
 * Delete User identify it by the token that has been generate previously
 * @param mail -> from the token decode
 * @returns {*|promise}
 */
var deleteUser = function (promesse) {
    var deferred = Q.defer();
    console.log(promesse);
    userCollection.findOneAndRemove({"email": promesse}, function (err, res) {
        if (err) {
            failedMessage.message = {};
            failedMessage.message = 'USER_MONGODB_ERROR';
            failedMessage.statusCode = 500;
            failedMessage.infos = err;
            deferred.reject(failedMessage);
        }
        if (res !== null) {
            deferred.resolve(res);
        }
        else {
            failedMessage.message = {};
            failedMessage.message = ('USER_DOCUMENT_NOT_FOUND');
            failedMessage.statusCode = 400;
            deferred.reject(failedMessage);
        }
    });
    return deferred.promise;
};

/**
* function that change in DB the data that the user want to change
* @param mail
* @param newData
* @returns {*|promise}
*/
var updateUser = function (mail, newData) {
    var deferred = Q.defer();
    var newUser = userCollection(newData);
    console.log(newUser);
    console.log(mail)
    userCollection.findOneAndUpdate({"email": mail}, newUser, function (err, res) {
        if (err) {
            failedMessage.message = {};
            failedMessage.message = ('USER_MONGODB_ERROR');
            failedMessage.infos = err;
            deferred.reject(failedMessage);
        }
        if (res === null) {
            failedMessage.message = {};
            failedMessage.statusCode = 400;
            failedMessage.message = ('USER_DOCUMENT_NOT_FOUND');
            deferred.reject(failedMessage);
        }
        else {
            deferred.resolve(res);
        }
    });
    return deferred.promise;
};

module.exports = {
    registerUser:registerUser,
    getUserByMail: getUserByMail,
    login: login,
    deleteToken: deleteToken,
    deleteUser: deleteUser,
    updateUser: updateUser
};