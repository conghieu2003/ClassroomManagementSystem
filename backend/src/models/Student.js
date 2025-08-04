module.exports = (sequelize, DataTypes) => {
    const Student = sequelize.define('Student', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true
        },
        studentCode: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        major: {
            type: DataTypes.STRING,
            allowNull: true
        }
    }, {
        tableName: 'Students',
        timestamps: true
    });

    return Student;
}; 