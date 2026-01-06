const { DataTypes } = require('sequelize');
const db = require('../config/database');

const Order = db.define('orders', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    order_number: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    },
    total_price: {
        type: DataTypes.DOUBLE,
        allowNull: false
    },
    status: {
        type: DataTypes.STRING, // Contoh: 'pending', 'paid', 'shipped'
        allowNull: false,
        defaultValue: 'pending'
    }
}, {
    freezeTableName: true
});

module.exports = Order;