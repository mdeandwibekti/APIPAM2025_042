const { Sequelize } = require('sequelize');

// Pastikan nama DB, username (root), dan password (kosong) sesuai XAMPP kamu
const db = new Sequelize('shopee_clone_db', 'root', 'Deandwib12345*', {
    host: 'localhost',
    dialect: 'mysql',
    port: 3308
});

module.exports = db;