const { DataTypes } = require('sequelize');
const db = require('../config/database');

const Transaction = db.define('transactions', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    product_id: {
        type: DataTypes.INTEGER,
        allowNull: true // Boleh null jika transaksi gabungan banyak produk
    },
    status: {
        type: DataTypes.ENUM('pending', 'processing', 'success', 'failed', 'cancelled'),
        defaultValue: 'pending',
        allowNull: false
    },
    transaction_number: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    paid_at: {
        type: DataTypes.DATE,
        allowNull: true
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        onUpdate: DataTypes.NOW
    }
}, {
    freezeTableName: true
});

module.exports = Transaction;