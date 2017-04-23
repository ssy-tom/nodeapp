var express = require('express');
// const client=require("../sql/mysql_login");
var client = require('../sql/mysql_login');
const teacher = require("../sql/teacher");
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
    // console.log(teacher_data)
    // res.render('index', { title: 'Express' });
    // const req.query.id

    const profession = req.query.profession;
    const username = req.query.username;
    const password = req.query.password;

    if (password != `${username}_85973`) {
        res.json({
            status:201,
            des:"账户名或密码错误"
        })
    }else{
        if(username && password && profession){
            teacher.teacher_data(res, username, profession);
        }
    }
    
});

module.exports = router;
