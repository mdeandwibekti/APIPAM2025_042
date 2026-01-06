const bcrypt = require('bcrypt');
const User = require('../models/User');

// --- REGISTER USER ---
exports.register = async (req, res) => {
    try {
        const { username, password, role, email, fullname } = req.body;

        // Validasi input
        if (!username || !password) {
            return res.status(400).json({ msg: "Username dan password harus diisi!" });
        }

        // Cek username kembar
        const existingUser = await User.findOne({ where: { username } });
        if (existingUser) {
            return res.status(400).json({ msg: "Username sudah dipakai!" });
        }

        // Hash Password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            username,
            password: hashedPassword,
            role: role || 'user',
            email,
            fullname
        });

        const responseData = newUser.toJSON();
        delete responseData.password;

        res.status(201).json({
            msg: "User berhasil dibuat",
            data: responseData
        });

    } catch (error) {
        console.log("ERROR REGISTER:", error);
        res.status(500).json({ msg: "Gagal Register", error: error.message });
    }
};

// --- LOGIN USER ---
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ msg: "Username dan password harus diisi!" });
        }

        // Cari User
        const user = await User.findOne({ where: { username } });

        if (!user) {
            return res.status(404).json({ msg: "Username tidak ditemukan" });
        }

        // Cek Password
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ msg: "Password Salah" });
        }

        res.json({
            msg: "Login Berhasil",
            data: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                fullname: user.fullname
            }
        });

    } catch (error) {
        console.log("ERROR LOGIN:", error);
        res.status(500).json({ msg: error.message });
    }
};

// --- GET ALL USERS (Admin Only) ---
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: { exclude: ['password'] }
        });

        res.json({
            msg: "Data users berhasil diambil",
            data: users
        });

    } catch (error) {
        console.log("ERROR GET USERS:", error);
        res.status(500).json({ msg: error.message });
    }
};

// --- GET USER BY ID ---
exports.getUserById = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findByPk(id, {
            attributes: { exclude: ['password'] }
        });

        if (!user) {
            return res.status(404).json({ msg: "User tidak ditemukan" });
        }

        res.json({
            msg: "Data user berhasil diambil",
            data: user
        });

    } catch (error) {
        console.log("ERROR GET USER BY ID:", error);
        res.status(500).json({ msg: error.message });
    }
};

// --- UPDATE USER ---
exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { email, fullname, phone, address } = req.body;

        const user = await User.findByPk(id);

        if (!user) {
            return res.status(404).json({ msg: "User tidak ditemukan" });
        }

        // Update data user
        await user.update({
            email: email || user.email,
            fullname: fullname || user.fullname,
            phone: phone || user.phone,
            address: address || user.address
        });

        const responseData = user.toJSON();
        delete responseData.password;

        res.json({
            msg: "User berhasil diupdate",
            data: responseData
        });

    } catch (error) {
        console.log("ERROR UPDATE USER:", error);
        res.status(500).json({ msg: error.message });
    }
};

// --- CHANGE PASSWORD ---
exports.changePassword = async (req, res) => {
    try {
        const { id } = req.params;
        const { oldPassword, newPassword } = req.body;

        if (!oldPassword || !newPassword) {
            return res.status(400).json({ msg: "Password lama dan baru harus diisi!" });
        }

        const user = await User.findByPk(id);

        if (!user) {
            return res.status(404).json({ msg: "User tidak ditemukan" });
        }

        // Cek password lama
        const isMatch = await bcrypt.compare(oldPassword, user.password);

        if (!isMatch) {
            return res.status(400).json({ msg: "Password lama tidak sesuai" });
        }

        // Hash password baru
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await user.update({ password: hashedPassword });

        res.json({
            msg: "Password berhasil diubah"
        });

    } catch (error) {
        console.log("ERROR CHANGE PASSWORD:", error);
        res.status(500).json({ msg: error.message });
    }
};

// --- DELETE USER ---
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findByPk(id);

        if (!user) {
            return res.status(404).json({ msg: "User tidak ditemukan" });
        }

        await user.destroy();

        res.json({
            msg: "User berhasil dihapus"
        });

    } catch (error) {
        console.log("ERROR DELETE USER:", error);
        res.status(500).json({ msg: error.message });
    }
};

// --- DEACTIVATE USER (Soft Delete) ---
exports.deactivateUser = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findByPk(id);

        if (!user) {
            return res.status(404).json({ msg: "User tidak ditemukan" });
        }

        await user.update({ is_active: false });

        res.json({
            msg: "User berhasil dinonaktifkan"
        });

    } catch (error) {
        console.log("ERROR DEACTIVATE USER:", error);
        res.status(500).json({ msg: error.message });
    }
};

// --- ACTIVATE USER ---
exports.activateUser = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findByPk(id);

        if (!user) {
            return res.status(404).json({ msg: "User tidak ditemukan" });
        }

        await user.update({ is_active: true });

        res.json({
            msg: "User berhasil diaktifkan"
        });

    } catch (error) {
        console.log("ERROR ACTIVATE USER:", error);
        res.status(500).json({ msg: error.message });
    }
};
