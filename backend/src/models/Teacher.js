module.exports = (sequelize, DataTypes) => {
    const Teacher = sequelize.define('Teacher', {
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
        teacherCode: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        department: {
            type: DataTypes.STRING,
            allowNull: true
        }
    }, {
        tableName: 'Teachers',
        timestamps: true
    });

    return Teacher;
}; 