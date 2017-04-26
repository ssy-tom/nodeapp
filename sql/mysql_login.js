/**
 * Created by Administrator on 2017/4/2 0002.
 */

let client = require('mysql').createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database:'school_manager'
});
// client.connect();

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

let query=function(sql){
    return new Promise((resolve, reject)=> {
        client.getConnection(function (err, conn) {
            if (err) {
                callback(err, null, null);
            } else {

                conn.query(sql, function (qerr, vals, fields) {
                    //释放连接
                    conn.release();
                    //事件驱动回调
                    if (err == null) {
                        resolve(vals);
                    } else {
                        reject(qerr);
                    }
                    // callback(qerr,vals,fields);
                });
            }
        })
    })
};
exports.query=query;

exports.client = client;
exports.makePromise = makePromise;