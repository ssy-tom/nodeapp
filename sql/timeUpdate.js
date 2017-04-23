/**
 * Created by Administrator on 2017/4/5 0005.
 */
let CronJob = require('cron').CronJob;
let client = require('./mysql_login').client;
let makePromise = require('./mysql_login').makePromise;

let timeUpdate = function () {
    new CronJob('00 11 14 5 3 *', function () {
        //your job code here
        console.log("这是上海时间");
        ManagerTime();
    }, null, true, 'Asia/Shanghai');
};

function ManagerTime() {
    //判断时间日否符合条件
    let judge = client.query(`SELECT * FROM teaching_cycle WHERE type=1`, function (err, json) {
        // client.query(`update teaching_cycle set type=1 where id=3`);
        if (!(json[0].start_time < new Date() && json[0].end_time > new Date())) {
            execute.next(json[0].id);
        }
    });
//     //如果符合进入下一个周期，整体数据进行处理
    let getNextCycleId = function (id) {//id目前周期的id
        client.query(`SELECT * FROM teaching_cycle WHERE start_time<now() and end_time>now()`, function (err, json) {
            //周期未重置
            if (json[0].id - id > 0) {
                execute.next({last_id: id, now_id: json[0].id});
            } else {
                //重置周期
                execute.next({last_id: 10, now_id: 1});
            }
        });
    };
//     //改变班级和学生的stutas的状态
    let change_student_class_status = function () {
        // makePromise(`BEGIN;`).then((json)=> {
        let class_status = makePromise("UPDATE class SET status=3 WHERE course_id>=20");
        let student_status = makePromise("UPDATE student SET student_status=3 WHERE now_has_course>=length_of_schooling*10");
        Promise.all([class_status, student_status]).then(()=> {
            // client.query(`COMMIT;`,function () {
            execute.next();
            // });
        }).catch((err)=> {
            console.log(err);
        });
    };
    //将上周期数据写入历史
    let change_cycle = function (id_obj) {//id目前周期的id

        makePromise(`BEGIN;`).then((json)=> {
            let changeType1 = makePromise(`update teaching_cycle set type=1 where id=${id_obj.now_id}`);
            let changeType0 = makePromise(`update teaching_cycle set type=0 where id=${id_obj.last_id}`);
            let studentToHistory = makePromise(`INSERT INTO student_history(student_id, start_time, end_time, cycle_name, course_name, score,course_status)
SELECT s.id,t.start_time,t.end_time,t.cycle_name,co.course_name,s.score,IF(s.score>0,1,2)
FROM  teaching_cycle t,
student s left join class c on c.id=s.class_id
left join course co on co.id=c.id
where t.type=1 and s.student_status=1`);
            let classToHistory = makePromise(`INSERT INTO class_history(class_id, start_time, end_time, cycle_name, course_name, score)
            SELECT c.id,t.start_time,t.end_time,t.cycle_name,co.course_name,c.cScore
            FROM  teaching_cycle t,
                 class c left join course co on co.id=c.id
             where t.type=1 and c.status=1`);
            Promise.all([changeType1, changeType0, studentToHistory, classToHistory]).then(()=> {
                client.query(`COMMIT;`, function () {
                    // console.log("success");
                    execute.next();
                });
            });
        }).catch((err)=> {
            client.query(`ROLLBACK;`);
        });

    };
    //将本周期重置
    let reset_this_cycle = function () {
        makePromise(`BEGIN;`).then((json)=> {
            console.log(123);
            //学生的课程修完的课程+1
            let hasStudyCourse = makePromise("UPDATE student set now_has_course=now_has_course+1 WHERE score>0 and now_has_course<length_of_schooling*10");
            // //学生的分数重置
            let student_reset_10000 = makePromise("UPDATE student SET score=10000");
            // 班级分数重置
            let class_reset_10000 = makePromise("UPDATE class SET cScore=10000");
            // //班级课程id+1
            let toNextClassCourse = makePromise(`UPDATE class SET course_id=course_id+1 WHERE course_id<20`);

            Promise.all([hasStudyCourse,student_reset_10000,class_reset_10000,toNextClassCourse]).then(()=> {
                client.query(`COMMIT;`);
            });
        }).catch((err)=> {
            client.query(`ROLLBACK;`);
        });
    };
    
    function* timeGeneretor() {
        let id = yield judge;
        let id_obj = yield getNextCycleId(id);
        yield change_student_class_status();
        yield change_cycle(id_obj);
        yield reset_this_cycle();
    }
    let execute = timeGeneretor();
    execute.next();
}
ManagerTime();
exports.timeUpdate = timeUpdate;