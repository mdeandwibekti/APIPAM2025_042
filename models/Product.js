const { DataTypes } = require('sequelize');
const db = require('../config/database');

const Product = db.define('products', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    seller_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    price: {
        type: DataTypes.DOUBLE,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    category: {
        type: DataTypes.STRING,
        allowNull: true
    },
    image: {
        type: DataTypes.STRING, // Menyimpan nama file gambar atau URL
        allowNull: true
    },
    stock: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    }
}, {
    freezeTableName: true
});

module.exports = Product;