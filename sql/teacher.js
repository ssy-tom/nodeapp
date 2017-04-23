/**
 * Created by Administrator on 2017/4/2 0002.
 */
let client = require('./mysql_login');
let co = require('co');
let makePromise = require('./mysql_login').makePromise;
// var await = require('asyncawait/await');
let teacher_data = function (res, username, profession) {
    let classExist = function () {
                let getClassList = makePromise(`SELECT * from class WHERE class_name="1508A"`);
                return getClassList
    };

    let getData = function (hasClass) {
        if(hasClass.length==0){
            res.send({status:201,des:"用户名不存在"});
        }else{
            let getStudentList = makePromise(`SELECT s.id,s.birthday,s.id_card,s.length_of_schooling,s.name,s.now_has_course,s.score,
         s.sex,s.student_status,s.time_of_come_school,c.class_name,ma.name FROM student s 
LEFT JOIN class c ON s.class_id=c.id
LEFT JOIN market ma ON s.market_id=ma.id`);
            let getClassList = makePromise(`SELECT id,class_name from class`);
            let rewards = makePromise(`SELECT * FROM reward_and_punishment`);
            let courseList = makePromise(`SELECT * FROM course`);
            let thisTeachingCycle = makePromise(`SELECT cycle_name,start_time,end_time FROM teaching_cycle WHERE type=1`);
            let theClassData=makePromise(`SELECT c.id,c.class_name,he.name,co.course_name,c.cScore,c.status,c.profession FROM class c 
left join headmaster he on c.headMaster_id=he.id
left join teacher te on c.teacher_id=te.teacher
left join course co on c.course_id=co.id
where c.class_name="1508A" and c.profession=0`);
            let students=makePromise(`SELECT stu.id,stu.name,stu.sex,stu.id_card,stu.birthday,stu.time_of_come_school,cl.class_name,ma.name market
,stu.length_of_schooling,stu.score,stu.now_has_course,stu.student_status,stu.no 
FROM student stu
left join class cl on cl.id=stu.class_id
left join market ma on stu.market_id=ma.id`);
            return Promise.all([getStudentList, getClassList, rewards, courseList, thisTeachingCycle,theClassData,students]);
        }

    };

    var teacherGenerator = function*() {
        //判断取数据
        let hasClass=yield classExist();
        let judgeCycle = yield getData(hasClass);
        return judgeCycle;
    };

    //数据回调发送
    co(teacherGenerator).then(function (json) {
        console.log(123123123);
        let teacher_data = {
            status: 200
        };
        // console.log(json);
        teacher_data["studentList"] = json[0];
        teacher_data["ClassList"] = json[1];
        teacher_data["rewards"] = json[2];
        teacher_data["courseList"] = json[3];
        teacher_data["thisTeachingCycle"] = json[4];
        teacher_data["theClassData"] = json[5];
        teacher_data["students"] = json[6];

        res.json(teacher_data);

    }).catch(function (err) {
        console.log(err)
        res.send("404");
    });

};
exports.teacher_data = teacher_data;