/**
 * Created by Administrator on 2017/4/2 0002.
 */
// let mysql = require('mysql');
// let client = require('mysql').createConnection({
//     host: 'localhost',
//     user: 'root',
//     password: ''
//     //database: Db.database
// });
// client.query("use school_manager", function (err) {
//     // console.log(err)
//     // res.send('hello world');
// });
let client = require('mysql').createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database:'school_manager'
});
client.connect();

function makePromise(commend) {
    return new Promise((resolve, reject)=> {
        client.query(commend, function (err, json) {
            if (err == null) {
                resolve(json);
            } else {
                reject(err);
            }
        });
    });
}

exports.client = client;
exports.makePromise = makePromise;