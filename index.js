/**
 * Created by TooNies1810 on 6/16/16.
 */
var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var cheerio = require('cheerio');

var mysql = require('mysql');

// var db = require('./db');
// db.user.loadDatabase();
// db.class.loadDatabase();

var app = express();
app.use(bodyParser());
app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
    res.sendfile(__dirname + '/public');
});


var url_get_infor = "http://203.113.130.218:50223/congdaotao/module/dsthi_new/index.php";

var param = {
    keysearch: ""
};

var form = {
    url: url_get_infor,
    form: param
};

app.post('/register', function (req, res) {
    console.log("req: ", req.body.toString());
    var mssv = req.body.mssv;
    var email = req.body.email;
    form.form.keysearch = mssv;

    postWithMssv(mssv, req, res);
});

function postWithMssv(mssv, req, res) {
    form.form.keysearch = mssv;

    //
    request.post(form, function (err, response, body) {

        if (err || response.statusCode != 200) {
            return;
        }

        // parser lop mon hoc
        var $ = cheerio.load(body, {
            decodeEntities: true
        });
        var trArr = $('tbody > tr');

        if (trArr.length <= 1) {
            console.log("Khong ton tai mssv");

            return;
        }

        // Kiem tra email user, neu user ton tai thi thong bao kiem tra lai hom mail
        // Neu ko ton tai thi tao 1 user trong csdl moi va thong bao check mail
        // them user

        var userSql = {
            id : '',
            email : req.body.email,
            mssv : req.body.mssv,
            isactive : false
        };

        connection.query("INSERT INTO user SET ?", userSql, function (err, result) {
            if (err){
                console.log("loi cmnr");
            } else{
                for (var i = 0; i < trArr.length; i++) {
                    var trTemp = $(trArr[i]);
                    var tdArr = trTemp.children('td');

                    var chooseTd = $(tdArr[6]);

                    if (chooseTd.text().length != 0) {
                        var classId = chooseTd.text().toString().trim();
                        classId = classId.replace(" ", "");
                        classId = classId.toLowerCase();
                        if (classId.length > 0) {
                            console.log(classId);
                            var classTemp = {
                                id : "",
                                idclass : classId,
                                name: '',
                                ishasscore: false
                            };

                            connection.query("INSERT INTO class SET ?", classTemp, function (err, result) {
                                if (err){
                                    console.log("loi cmnr");
                                }
                                // console.log(JSON.stringify(result));
                            });

                            var userClass = {
                                email : req.body.email,
                                idclass: classId,
                                issendmail : false
                            };

                            // user-class
                            connection.query("INSERT INTO user_class SET ?", userClass, function (err, result) {
                                if (err){
                                    console.log("loi cmnr");
                                }
                                // console.log(JSON.stringify(result));
                            });
                        }
                    }
                }
            }
        });

        //lay du lieu user tu web mon thi nhet vao classes.db
    });
}

/////// connection

var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'score-uet'
});

connection.connect(function (err) {
    if(err) throw err;
    console.log("Connected to mysql!");

    app.listen(2345, function () {
        console.log("listening on 2345");
    });
});

// test 
// postWithMssv('13020285');