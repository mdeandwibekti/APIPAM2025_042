const Product = require('../models/Product');
const User = require('../models/User');

// --- CREATE PRODUCT ---
exports.createProduct = async (req, res) => {
    try {
        const { seller_id, name, price, description, category, image, stock } = req.body;

        // Validasi input
        if (!seller_id || !name || !price || !stock) {
            return res.status(400).json({ msg: "Seller ID, Name, Price, dan Stock harus diisi!" });
        }

        if (price < 0 || stock < 0) {
            return res.status(400).json({ msg: "Price dan Stock tidak boleh negatif!" });
        }

        // Cek seller exist
        const seller = await User.findByPk(seller_id);
        if (!seller) {
            return res.status(404).json({ msg: "Seller tidak ditemukan" });
        }

        const newProduct = await Product.create({
            seller_id,
            name,
            price,
            description,
            category,
            image,
            stock,
            is_active: true
        });

        res.status(201).json({
            msg: "Produk berhasil dibuat",
            data: newProduct
        });

    } catch (error) {
        console.log("ERROR CREATE PRODUCT:", error);
        res.status(500).json({ msg: error.message });
    }
};

// --- GET ALL PRODUCTS ---
exports.getAllProducts = async (req, res) => {
    try {
        const { category, min_price, max_price, search, sort } = req.query;

        let where = { is_active: true };

        // Filter by category
        if (category) {
            where.category = category;
        }

        // Filter by price range
        if (min_price || max_price) {
            where.price = {};
            if (min_price) where.price[sequelize.Op.gte] = min_price;
            if (max_price) where.price[sequelize.Op.lte] = max_price;
        }

        // Search by name
        if (search) {
            const { Op } = require('sequelize');
            where.name = { [Op.like]: `%${search}%` };
        }

        // Sort options
        let order = [['createdAt', 'DESC']];
        if (sort === 'price_asc') order = [['price', 'ASC']];
        if (sort === 'price_desc') order = [['price', 'DESC']];
        if (sort === 'rating') order = [['rating', 'DESC']];
        if (sort === 'sold') order = [['sold', 'DESC']];

        const products = await Product.findAll({
            where,
            include: [
                {
                    model: User,
                    attributes: ['id', 'username', 'fullname']
                }
            ],
            order
        });

        res.json({
            msg: "Data produk berhasil diambil",
            count: products.length,
            data: products
        });

    } catch (error) {
        console.log("ERROR GET PRODUCTS:", error);
        res.status(500).json({ msg: error.message });
    }
};

// --- GET PRODUCT BY ID ---
exports.getProductById = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await Product.findByPk(id, {
            include: [
                {
                    model: User,
                    attributes: ['id', 'username', 'email', 'fullname', 'phone']
                }
            ]
        });

        if (!product) {
            return res.status(404).json({ msg: "Produk tidak ditemukan" });
        }

        res.json({
            msg: "Data produk berhasil diambil",
            data: product
        });

    } catch (error) {
        console.log("ERROR GET PRODUCT BY ID:", error);
        res.status(500).json({ msg: error.message });
    }
};

// --- GET PRODUCTS BY SELLER ID ---
exports.getProductBySellerId = async (req, res) => {
    try {
        const { seller_id } = req.params;

        // Cek seller exist
        const seller = await User.findByPk(seller_id);
        if (!seller) {
            return res.status(404).json({ msg: "Seller tidak ditemukan" });
        }

        const products = await Product.findAll({
            where: { seller_id },
            order: [['createdAt', 'DESC']]
        });

        if (products.length === 0) {
            return res.json({
                msg: "Seller tidak memiliki produk",
                data: [],
                count: 0
            });
        }

        res.json({
            msg: "Data produk seller berhasil diambil",
            count: products.length,
            data: products
        });

    } catch (error) {
        console.log("ERROR GET PRODUCTS BY SELLER:", error);
        res.status(500).json({ msg: error.message });
    }
};

// --- GET PRODUCTS BY CATEGORY ---
exports.getProductByCategory = async (req, res) => {
    try {
        const { category } = req.params;

        const products = await Product.findAll({
            where: { category, is_active: true },
            order: [['createdAt', 'DESC']]
        });

        if (products.length === 0) {
            return res.json({
                msg: "Tidak ada produk di kategori ini",
                data: [],
                count: 0
            });
        }

        res.json({
            msg: "Data produk kategori berhasil diambil",
            count: products.length,
            data: products
        });

    } catch (error) {
        console.log("ERROR GET PRODUCTS BY CATEGORY:", error);
        res.status(500).json({ msg: error.message });
    }
};

// --- SEARCH PRODUCTS ---
exports.searchProducts = async (req, res) => {
    try {
        const { keyword } = req.params;
        const { Op } = require('sequelize');

        const products = await Product.findAll({
            where: {
                is_active: true,
                [Op.or]: [
                    { name: { [Op.like]: `%${keyword}%` } },
                    { description: { [Op.like]: `%${keyword}%` } }
                ]
            },
            include: [
                {
                    model: User,
                    attributes: ['id', 'username', 'fullname']
                }
            ],
            order: [['rating', 'DESC']]
        });

        res.json({
            msg: "Hasil pencarian produk",
            count: products.length,
            data: products
        });

    } catch (error) {
        console.log("ERROR SEARCH PRODUCTS:", error);
        res.status(500).json({ msg: error.message });
    }
};

// --- UPDATE PRODUCT ---
exports.updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, price, description, category, image, stock } = req.body;

        const product = await Product.findByPk(id);

        if (!product) {
            return res.status(404).json({ msg: "Produk tidak ditemukan" });
        }

        // Validasi input
        if (price && price < 0) {
            return res.status(400).json({ msg: "Price tidak boleh negatif!" });
        }

        if (stock !== undefined && stock < 0) {
            return res.status(400).json({ msg: "Stock tidak boleh negatif!" });
        }

        await product.update({
            name: name || product.name,
            price: price !== undefined ? price : product.price,
            description: description || product.description,
            category: category || product.category,
            image: image || product.image,
            stock: stock !== undefined ? stock : product.stock
        });

        res.json({
            msg: "Produk berhasil diupdate",
            data: product
        });

    } catch (error) {
        console.log("ERROR UPDATE PRODUCT:", error);
        res.status(500).json({ msg: error.message });
    }
};

// --- UPDATE PRODUCT STOCK ---
exports.updateProductStock = async (req, res) => {
    try {
        const { id } = req.params;
        const { quantity, type } = req.body; // type: 'add' atau 'reduce'

        if (!quantity || !type) {
            return res.status(400).json({ msg: "Quantity dan type harus diisi!" });
        }

        if (type !== 'add' && type !== 'reduce') {
            return res.status(400).json({ msg: "Type harus 'add' atau 'reduce'" });
        }

        const product = await Product.findByPk(id);

        if (!product) {
            return res.status(404).json({ msg: "Produk tidak ditemukan" });
        }

        let newStock = product.stock;

        if (type === 'add') {
            newStock += quantity;
        } else if (type === 'reduce') {
            if (product.stock < quantity) {
                return res.status(400).json({ msg: `Stock tidak cukup. Tersedia: ${product.stock}` });
            }
            newStock -= quantity;
        }

        await product.update({ stock: newStock });

        res.json({
            msg: "Stock produk berhasil diupdate",
            data: product
        });

    } catch (error) {
        console.log("ERROR UPDATE PRODUCT STOCK:", error);
        res.status(500).json({ msg: error.message });
    }
};

// --- UPDATE PRODUCT RATING ---
exports.updateProductRating = async (req, res) => {
    try {
        const { id } = req.params;
        const { rating } = req.body;

        if (!rating || rating < 0 || rating > 5) {
            return res.status(400).json({ msg: "Rating harus antara 0 dan 5!" });
        }

        const product = await Product.findByPk(id);

        if (!product) {
            return res.status(404).json({ msg: "Produk tidak ditemukan" });
        }

        await product.update({ rating });

        res.json({
            msg: "Rating produk berhasil diupdate",
            data: product
        });

    } catch (error) {
        console.log("ERROR UPDATE PRODUCT RATING:", error);
        res.status(500).json({ msg: error.message });
    }
};

// --- DEACTIVATE PRODUCT ---
exports.deactivateProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await Product.findByPk(id);

        if (!product) {
            return res.status(404).json({ msg: "Produk tidak ditemukan" });
        }

        await product.update({ is_active: false });

        res.json({
            msg: "Produk berhasil dinonaktifkan"
        });

    } catch (error) {
        console.log("ERROR DEACTIVATE PRODUCT:", error);
        res.status(500).json({ msg: error.message });
    }
};

// --- ACTIVATE PRODUCT ---
exports.activateProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await Product.findByPk(id);

        if (!product) {
            return res.status(404).json({ msg: "Produk tidak ditemukan" });
        }

        await product.update({ is_active: true });

        res.json({
            msg: "Produk berhasil diaktifkan"
        });

    } catch (error) {
        console.log("ERROR ACTIVATE PRODUCT:", error);
        res.status(500).json({ msg: error.message });
    }
};

// --- DELETE PRODUCT ---
exports.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await Product.findByPk(id);

        if (!product) {
            return res.status(404).json({ msg: "Produk tidak ditemukan" });
        }

        await product.destroy();

        res.json({
            msg: "Produk berhasil dihapus"
        });

    } catch (error) {
        console.log("ERROR DELETE PRODUCT:", error);
        res.status(500).json({ msg: error.message });
    }
};

// --- GET PRODUCT STATISTICS ---
exports.getProductStats = async (req, res) => {
    try {
        const total_products = await Product.count();
        const total_active = await Product.count({ where: { is_active: true } });
        const total_inactive = await Product.count({ where: { is_active: false } });
        const avg_price = await Product.findAll({
            attributes: [[require('sequelize').fn('AVG', require('sequelize').col('price')), 'avg_price']],
            raw: true
        });
        const total_stock = await Product.sum('stock');
        const total_sold = await Product.sum('sold');
        const top_rated = await Product.findAll({
            order: [['rating', 'DESC']],
            limit: 5,
            attributes: ['id', 'name', 'rating', 'sold']
        });

        res.json({
            msg: "Statistik produk berhasil diambil",
            data: {
                total_products,
                total_active,
                total_inactive,
                avg_price: avg_price[0]?.avg_price || 0,
                total_stock,
                total_sold: total_sold || 0,
                top_rated
            }
        });

    } catch (error) {
        console.log("ERROR GET PRODUCT STATS:", error);
        res.status(500).json({ msg: error.message });
    }
};
