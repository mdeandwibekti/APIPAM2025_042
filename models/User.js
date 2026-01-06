const { DataTypes } = require('sequelize');
const db = require('../config/database');

const User = db.define('users', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true
    },
    role: {
        type: DataTypes.STRING, // Contoh isi: 'seller', 'user'
        allowNull: false
    }
}, {
    freezeTableName: true
});

module.exports = User;