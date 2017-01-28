/**
 * Created by rano on 22/01/17.
 */
var usersDao = require("../dao/usersDao");
var Q = require("q");
var jwt = require('jsonwebtoken');
var promise = require('promise');
var mongoose = require('mongoose');
var crypto = require('crypto');
var successMessage = {
    "Success": true,
    "infos": {}
    ,
    "statusCode": {}
};
var failedMessage = {
    "Success": false,
    "message": {}
    ,
    "statusCode": {}
};

var registerUser = function (user) {
    var deferred = Q.defer();
    usersDao.getUserByMail(user.email)
        .catch(function (err) {
            if (err !== failedMessage) {
                user._id = mongoose.Types.ObjectId();
                user.password = hashPassword(user.password);
                user.token = undefined;
                console.log(user);
                usersDao.registerUser(user)
                    .then(function () {
                        successMessage = {};
                        successMessage.infos = ('USER_REGISTER_SUCCESS');
                        successMessage.statusCode = 201;
                        deferred.resolve(successMessage);
                    })
                    .catch(function (err) {
                        deferred.reject(err);
                    });
                return deferred.promise;
            }
        })
        .then(function () {
            failedMessage = {};
            failedMessage.message = ('USER_EMAIL_UNIQUE');
            failedMessage.statusCode = 409;
            deferred.reject(failedMessage);
        });
    return deferred.promise;
};


/**
 * function to hash password
 * @param password
 * @returns {passwordCrypt}
 */
function hashPassword(password) {
    var passwordCrypt = crypto.createHmac('sha256', password)
        .digest('hex');
    return passwordCrypt;
}

/**
 *function to authenticate a user with an email and a password , create a webtoken that make possible secure navigation
 * @param emailPassword
 * @returns {*|promise}
 */
var login = function (emailPassword) {
    var deferred = Q.defer();
    getUser(emailPassword.email)
        .catch(function (err) {
            failedMessage = {};
            failedMessage.statusCode = 401;
            failedMessage.message = ('USER_NOT_REGISTERED');
            deferred.reject(failedMessage);
        })
        .then(function (res) {
            var passwordCrypt = hashPassword(emailPassword.password);
            if (passwordCrypt !== res.password) {
                failedMessage.message = {};
                failedMessage.statusCode = 401;
                failedMessage.message = ('USER_WRONG_PASSWORD');
                deferred.reject(failedMessage);
            }
            else {
                var tokenAuth = jwt.sign({email: res.email}, "TRALALALALA", {
                    expiresIn: '60m',
                    algorithm: 'HS256'
                });
                usersDao.login(emailPassword, tokenAuth)
                    .then(function (res) {
                        successMessage.infos = {};
                        successMessage.infos.token = tokenAuth;
                        successMessage.statusCode = 200;
                        deferred.resolve(successMessage);
                        console.log("You are connected as : " + res.email);
                    })
                    .catch(function (err) {
                        deferred.reject(err);
                    });
                return deferred.promise;
            }
        });
    return deferred.promise;
};

/**
 * function which is looking for a user with his mail and pass it if it find it (to authenticate
 * @param mail
 * @returns {user}
 */
function getUser(mail) {
    var deferred = Q.defer();
    usersDao.getUserByMail(mail)
        .then(function (res) {
            {
                deferred.resolve(res);
            }
        })
        .catch(function (err) {
            {
                console.log(err);
                deferred.reject(err);
            }
        });
    return deferred.promise;
}

/**
 * function to logout user (deleting the JWT token from the DB)
 * @param req
 * @returns {*}
 */
function logout(req) {
    var deferred = Q.defer();
    checkToken(req)
        .then(function (decodedToken) {
            var deleteToken = usersDao.deleteToken(decodedToken.email);
            deleteToken
                .then(function () {
                    successMessage.infos = {};
                    successMessage.statusCode = 200;
                    successMessage.infos = ('USER_LOGOUT');
                    deferred.resolve(successMessage);
                })
                .catch(function (err) {
                    deferred.reject(err);
                })
        })
        .catch(function (err) {
            deferred.reject(err);
        });
    return deferred.promise;
}


/**la fonction vérifie puis décode le mot de passe pour obtenir l'email du userCollection et toute ces infos
 * @param requête
 * @return code OK pour le token
 */
function checkToken(req) {
    var token = req.body.token;
    console.log(token);
    var deferred = Q.defer();
    console.log("J'essaye de décoder");
    try {
        jwt.verify(token, "TRALALALALA");
        console.log(jwt.verify(token, "TRALALALALA"));
        var decoded = jwt.decode(token, "TRALALALALA");
        var userFound = usersDao.getUserByMail(decoded.email);
        userFound
            .then(function (res) {
                if (res.token !== token) {// check if token receive is the same that in th DB
                    console.log('***Invalidity1');
                    console.log(res.token);
                    failedMessage.message = {};
                    failedMessage.statusCode = 401;
                    failedMessage.message = ('USER_TOKEN_INVALIDITY');
                    deferred.reject(failedMessage);
                }
                else {
                    console.log('lala');
                    console.log(userFound);
                    deferred.resolve(userFound);
                }
                return deferred.promise;
            })
            .catch(function () {
                failedMessage.message = {};
                failedMessage.statusCode = 401;
                failedMessage.message = ('USER_DOCUMENT_NOT_FOUND');
                deferred.reject(failedMessage);
            });
        return deferred.promise;
    }
    catch (err) {
        console.log('***INVALIDITY2');
        failedMessage.message = {};
        failedMessage.statusCode = 401;
        failedMessage.message = ('USER_TOKEN_INVALIDITY');
        console.log(failedMessage);
        deferred.reject(failedMessage);
    }
    return deferred.promise;
}

/**
 * function to  request deleting a profile from the DB
 * @param token
 * @return Object deleted
 */

function removeUser(req) {
    var deferred = Q.defer();
    checkToken(req)
        .then(function (decoded) {
            var deleteUser = usersDao.deleteUser(decoded.email);
            deleteUser
                .then(function (res) {
                    successMessage = {};
                    successMessage.statusCode = 200;
                    successMessage.infos = ('USER_FOUND_DOCUMENT_DELETE');
                    deferred.resolve(successMessage);
                    console.log("User has been delete");
                })
                .catch(function (err) {
                    deferred.reject(err);
                });
            return deferred.promise;
        })
        .catch(function (err) {
            deferred.reject(err);
        });
    return deferred.promise;
}


/**
 * function updateUser that allow user to change some of his infos
 * @param req
 * @returns {*}
 */
function updateUser(req) {
    var deferred = Q.defer();
    console.log(req.body);
    var newProfile = req.body;
    checkToken(req)
        .then(function (decoded) {
            var tokenAu = jwt.sign({email: decoded.email}, "TRALALALALA", {
                expiresIn: '60m',
                algorithm: 'HS256'
            });
            newProfile.token = tokenAu;
            console.log(newProfile);
            newProfile.password = hashPassword(newProfile.password);
            var updateUser = usersDao.updateUser(decoded.email, newProfile);
            updateUser
                .then(function () {
                    req.body.password = undefined;
                    successMessage.infos = {};
                    successMessage.statusCode = 200;
                    successMessage.infos = req.body;
                    deferred.resolve(successMessage);
                })
                .catch(function (err) {
                    deferred.reject(err);
                });
            return deferred.promise
        })
        .catch(function (err) {
            err.token = undefined;
            deferred.reject(err);
        });
    return deferred.promise;
}

/**
 * function to find user with his token
 * @param req
 * @returns {*}
 */
function findUserByToken(req) {
    var deferred = Q.defer();
    checkToken(req)
        .then(function (decodedToken) {
            deferred.resolve(decodedToken);
        })
        .catch(function (err) {
            deferred.reject(err);
        });
    return deferred.promise;
}


module.exports = {
    registerUser: registerUser,
    getUser: getUser,
    login: login,
    logout: logout,
    checkToken: checkToken,
    removeUser: removeUser,
    updateUser: updateUser,
    findUserByToken : findUserByToken,
};