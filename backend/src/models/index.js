const sequelize = require('../config/db.config');
const { DataTypes } = require('sequelize');

// Import các models
const Account = require('./Account')(sequelize, DataTypes);
const User = require('./User')(sequelize, DataTypes);
const Teacher = require('./Teacher')(sequelize, DataTypes);
const Student = require('./Student')(sequelize, DataTypes);
const ClassRoom = require('./ClassRoom')(sequelize, DataTypes);
const Subject = require('./Subject')(sequelize, DataTypes);
const Class = require('./Class')(sequelize, DataTypes);
const ClassRegistration = require('./ClassRegistration')(sequelize, DataTypes);
const Schedule = require('./Schedule')(sequelize, DataTypes);
const RoomRequest = require('./RoomRequest')(sequelize, DataTypes);

// Định nghĩa các mối quan hệ
Account.hasOne(User, {
    foreignKey: 'accountId',
    as: 'user'
});

User.belongsTo(Account, {
    foreignKey: 'accountId',
    as: 'account'
});

User.hasOne(Teacher, {
    foreignKey: 'userId',
    as: 'teacher'
});

User.hasOne(Student, {
    foreignKey: 'userId',
    as: 'student'
});

Teacher.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user'
});

Student.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user'
});

Teacher.hasMany(Class, {
    foreignKey: 'teacherId',
    as: 'classes'
});

Teacher.hasMany(Schedule, {
    foreignKey: 'teacherId',
    as: 'schedules'
});

Student.hasMany(ClassRegistration, {
    foreignKey: 'studentId',
    as: 'registrations'
});

Subject.hasMany(Class, {
    foreignKey: 'subjectId',
    as: 'classes'
});

Class.belongsTo(Subject, {
    foreignKey: 'subjectId',
    as: 'subject'
});

Class.belongsTo(Teacher, {
    foreignKey: 'teacherId',
    as: 'teacher'
});

Class.hasMany(ClassRegistration, {
    foreignKey: 'classId',
    as: 'registrations'
});

Class.hasMany(Schedule, {
    foreignKey: 'classId',
    as: 'schedules'
});

ClassRoom.hasMany(Schedule, {
    foreignKey: 'classRoomId',
    as: 'schedules'
});

ClassRoom.hasMany(RoomRequest, {
    foreignKey: 'classRoomId',
    as: 'requests'
});

Schedule.belongsTo(Class, {
    foreignKey: 'classId',
    as: 'class'
});

Schedule.belongsTo(ClassRoom, {
    foreignKey: 'classRoomId',
    as: 'classRoom'
});

Schedule.belongsTo(Teacher, {
    foreignKey: 'teacherId',
    as: 'teacher'
});

RoomRequest.belongsTo(ClassRoom, {
    foreignKey: 'classRoomId',
    as: 'classRoom'
});

// Export các models
module.exports = {
    sequelize,
    Account,
    User,
    Teacher,
    Student,
    ClassRoom,
    Subject,
    Class,
    ClassRegistration,
    Schedule,
    RoomRequest
}; 