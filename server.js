var express = require('express');        // call express
var app = express();                 // define our app using express
var bodyParser = require('body-parser');


// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

var port = 8080;        // set our port

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router

// more routes for our API will happen here

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);


// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);

var config = require('./config/config');
var mongoose = require('mongoose');
mongoose.connect(config.appConfig.mongoServer);

// test route to make sure everything is working (accessed at GET http://localhost:8080/)
var usersService = require("./service/usersService.js");
var filmsService = require("./service/filmsService");

router.get('/server', function (req, res) {
    res.send('Server is running! (WatchMeNow.com)');
});

/**
 * /api/verifyemail:
 *   get:
 *     description: verify email from the user after he gets register he receive a mail with a link and a token this function check the token validity
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         description: id of token which is generated after the signup
 *         in: query
 *         required: true
 *     return : redirect on website
 */
router.post('/register', function (req, res) {
    console.log(req.body);
    usersService.registerUser(req.body)
        .then(function (retour) {
            console.log(retour);
            res.send(retour);
        })
        .catch(function (err) {
            console.log(err);
            res.send(err);
        })
});
/**
 * /api/login:
 *   post:
 *     description: Log user with email and password and replying a JWT
 *     parameters:
 *       - name: emailPassword
 *         description: id object to log
 *         in: body
 *         required: true
 *     return : JWT
 */
router.post('/login', function (req, res) {
    var checkUser = usersService.login(req.body);
    checkUser
        .then(function (retour) {
            console.log(retour);
            res.send(retour);
        })
        .catch(function (err) {
            console.log(err);
            res.send(err);
        })
});
/**
 * /api/checkToken:
 *   post:
 *     description:check the token
 *     parameters:
 *       - name: token
 *         in: headers
 *         required: true
 *     return : JWT
 */
router.post('/checkToken', function (req, res) {
    var checkUser = usersService.checkToken(req);
    checkUser
        .then(function (retour) {
            console.log(retour);
            res.send(retour);
        })
        .catch(function (err) {
            console.log(err);
            res.send(err);
        })
});
/**
 * /api/logout:
 *   get:
 *     description: Logout user if he got the good JWT and delete it from the DB(to generate a valid token use login)
 *     parameters:
 *       - name: token
 *         description: JWT generate at login
 *         in: header
 *         required: true
 */
router.get('/logout', function (req, res) {
    var logout = usersService.logout(req);
    logout.then(function (retour) {
        res.send(retour.statusCode, retour);
    })
        .catch(function (err) {
            console.log("failed to logout");
            res.send(err.statusCode, err);
        })
});
/**
 * function finduser is a function that return the profile of the user with the token
 * parameter :
 * header: token
 */
router.get('/finduser', function (req, res) {
    var oneUser = usersService.findUserByToken(req);
    oneUser
        .then(function (userFound) {
            res.send(200, userFound);
        })
        .catch(function (err) {
            res.send(err.statusCode, err);
        })
});
/**
 *
 * description : delete a user from the DB if he still got some tips to deal with he is not delete
 * /api/removeuser:
 *   post:
 *     parameters:
 *       - name: token
 *         description: JWT  generate at login
 *         in: header
 *         required: true
 */
router.post('/removeuser', function (req, res) {
    var removeUser = usersService.removeUser(req);
    removeUser.then(function (retour) {
        res.send(200, retour);
    }).catch(function (erreur) {
        res.send(400, erreur);
    })
});

/**
 * dscription : function to update some infos of the profile user
 * /api/updateuser:
 *   post:
 *     parameters:
 *       - name: updateUser
 *         description: fields that user want to update
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/updateUser'
 *       - name: token
 *         description: token that authenticate user
 *         in: header
 *         required: true
 */
router.post('/updateuser', function (req, res) {
    usersService.updateUser(req)
        .then(function (doc) {
            res.send(doc);
        })
        .catch(function (err) {
            res.send(err);
        })
});

/**
 * /api/addFilms:
 *   post:
 *     description: Creates new tips with field enter by the user
 *     parameters:
 *       - name: tips
 *         description: tips object
 *         in: body
 *       - name: token
 *         description: JWT object
 *         in: header
 *         required: true
 */
router.post('/addfilms', function (req, res) {
    console.log(req.body);
    filmsService.addFilms(req)
        .then(function (retour) {
            res.send(retour);
        })
        .catch(function (err) {
            res.send(err);
        })
});


/**
 * function that reply a film taking his title and The JWT in headers as argument
 * parameter :
 * header = token + title films 
 */
router.get('/getFilmById', function(req,res){
    filmsService.getFilmById(req)
        .then(function(result){
            res.send(200,result);
        })
        .catch(function(err){
            res.send(err.statusCode, err);
        })
})

/**
 * /tips/getallfilms
 *   get:
 *     tags:
 *       - get all films
 *     description: get all films data
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: token
 *         description: JWT object
 *         in: header
 *         required: true
 */
router.get('/getallfilms', function (req, res) {
    var allFilms = filmsService.getAllFilms(req);
    allFilms
        .then(function (retour) {
            res.send(retour.statusCode, retour);
        })
        .catch(function (err) {
            res.send(err.statusCode, err);
        })
});

/**
 * /tips/removefilm
 *     description:  delete film
 *     parameters:
 *       - name: title
 *         description: string
 *         in: body
 *         required: true
 *       - name: token
 *         description: JWT object
 *         in: header
 *         required: true
 */
router.post('/removefilm', function (req, res) {
    filmsService.removeFilms(req)
        .then(function (retour) {
            console.log(retour);
            res.send(retour);
        })
        .catch(function (err) {
            res.send(err);
        })
});

/**
 * /tips/updatefilm:
 *     description:  update tips
 *     parameters:
 *       - name: token
 *         description: JWT object
 *         in: header
 *         required: true
 *       - name: tipstoupdate
 *         description: Json object
 *         in: body
 *         required: true
 */
router.post('/updatefilms', function (req, res) {
    filmsService.updateFilm(req)
        .then(function (retour) {
            console.log(retour);
            res.send(retour);
        })
        .catch(function (err) {
            console.log(err);
            res.send(err);
        })
});

/**
 * 
 */
router.get('/getfilmbytype', function (req,res){
    filmsService.getFilmByType(req)
        .then(function(retour){
            res.send(retour);
        })
        .catch(function(err){
            res.send(err)
        })
});

router.get('/getlast4upload',function(req,res){
    filmsService.getLast4Update()
        .then(function(retour){
            res.send(retour);
        })
        .catch(function(err){
            res.send(err);
        })
});

module.exports = app;