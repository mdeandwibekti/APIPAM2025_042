const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const User = require('../models/User');
const Product = require('../models/Product');
const Cart = require('../models/Cart');

// --- HELPER FUNCTION ---
const generateOrderNumber = () => {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substr(2, 5).toUpperCase();
    return `ORD-${timestamp}-${random}`;
};

// --- CREATE ORDER FROM CART ---
exports.createOrderFromCart = async (req, res) => {
    try {
        const { user_id, shipping_address, shipping_phone, notes } = req.body;

        if (!user_id || !shipping_address) {
            return res.status(400).json({ msg: "User ID dan shipping address harus diisi!" });
        }

        // Cek user exist
        const user = await User.findByPk(user_id);
        if (!user) {
            return res.status(404).json({ msg: "User tidak ditemukan" });
        }

        // Ambil cart items
        const cartItems = await Cart.findAll({
            where: { user_id },
            include: [
                {
                    model: Product,
                    attributes: ['id', 'name', 'price', 'stock']
                }
            ]
        });

        if (cartItems.length === 0) {
            return res.status(400).json({ msg: "Keranjang kosong!" });
        }

        // Hitung total harga
        let total_price = 0;
        const orderItems = [];

        for (const cartItem of cartItems) {
            const itemTotal = cartItem.product.price * cartItem.quantity;
            total_price += itemTotal;

            orderItems.push({
                product_id: cartItem.product_id,
                quantity: cartItem.quantity,
                price: cartItem.product.price
            });
        }

        // Create order
        const order_number = generateOrderNumber();
        const newOrder = await Order.create({
            user_id,
            order_number,
            total_price,
            final_price: total_price,
            shipping_address,
            shipping_phone: shipping_phone || user.phone,
            notes,
            status: 'pending'
        });

        // Create order items
        for (const item of orderItems) {
            await OrderItem.create({
                order_id: newOrder.id,
                product_id: item.product_id,
                quantity: item.quantity,
                price: item.price
            });
        }

        // Clear cart
        await Cart.destroy({ where: { user_id } });

        res.status(201).json({
            msg: "Order berhasil dibuat",
            data: newOrder
        });

    } catch (error) {
        console.log("ERROR CREATE ORDER:", error);
        res.status(500).json({ msg: error.message });
    }
};

// --- CREATE ORDER MANUAL ---
exports.createOrder = async (req, res) => {
    try {
        const { user_id, items, shipping_address, shipping_phone, shipping_cost = 0, discount = 0, notes } = req.body;

        if (!user_id || !items || items.length === 0 || !shipping_address) {
            return res.status(400).json({ msg: "User ID, items, dan shipping address harus diisi!" });
        }

        // Cek user exist
        const user = await User.findByPk(user_id);
        if (!user) {
            return res.status(404).json({ msg: "User tidak ditemukan" });
        }

        let total_price = 0;

        // Validasi items
        for (const item of items) {
            const product = await Product.findByPk(item.product_id);
            if (!product) {
                return res.status(404).json({ msg: `Produk dengan ID ${item.product_id} tidak ditemukan` });
            }
            total_price += product.price * item.quantity;
        }

        // Hitung final price
        const final_price = total_price + shipping_cost - discount;

        // Create order
        const order_number = generateOrderNumber();
        const newOrder = await Order.create({
            user_id,
            order_number,
            total_price,
            shipping_cost,
            discount,
            final_price,
            shipping_address,
            shipping_phone: shipping_phone || user.phone,
            notes,
            status: 'pending'
        });

        // Create order items
        for (const item of items) {
            const product = await Product.findByPk(item.product_id);
            await OrderItem.create({
                order_id: newOrder.id,
                product_id: item.product_id,
                quantity: item.quantity,
                price: product.price
            });
        }

        res.status(201).json({
            msg: "Order berhasil dibuat",
            data: newOrder
        });

    } catch (error) {
        console.log("ERROR CREATE ORDER:", error);
        res.status(500).json({ msg: error.message });
    }
};

// --- GET ALL ORDERS ---
exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.findAll({
            include: [
                {
                    model: User,
                    attributes: ['id', 'username', 'email', 'fullname']
                },
                {
                    model: OrderItem,
                    attributes: ['id', 'product_id', 'quantity', 'price']
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        res.json({
            msg: "Data order berhasil diambil",
            count: orders.length,
            data: orders
        });

    } catch (error) {
        console.log("ERROR GET ORDERS:", error);
        res.status(500).json({ msg: error.message });
    }
};

// --- GET ORDER BY ID ---
exports.getOrderById = async (req, res) => {
    try {
        const { id } = req.params;

        const order = await Order.findByPk(id, {
            include: [
                {
                    model: User,
                    attributes: ['id', 'username', 'email', 'fullname', 'phone', 'address']
                },
                {
                    model: OrderItem,
                    attributes: ['id', 'product_id', 'quantity', 'price'],
                    include: [
                        {
                            model: Product,
                            attributes: ['id', 'name', 'image']
                        }
                    ]
                }
            ]
        });

        if (!order) {
            return res.status(404).json({ msg: "Order tidak ditemukan" });
        }

        res.json({
            msg: "Data order berhasil diambil",
            data: order
        });

    } catch (error) {
        console.log("ERROR GET ORDER BY ID:", error);
        res.status(500).json({ msg: error.message });
    }
};

// --- GET ORDER BY USER ID ---
exports.getOrderByUserId = async (req, res) => {
    try {
        const { user_id } = req.params;

        const orders = await Order.findAll({
            where: { user_id },
            include: [
                {
                    model: OrderItem,
                    attributes: ['id', 'product_id', 'quantity', 'price']
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        if (orders.length === 0) {
            return res.status(404).json({ msg: "Tidak ada order untuk user ini" });
        }

        res.json({
            msg: "Data order user berhasil diambil",
            count: orders.length,
            data: orders
        });

    } catch (error) {
        console.log("ERROR GET ORDER BY USER ID:", error);
        res.status(500).json({ msg: error.message });
    }
};

// --- GET ORDER BY ORDER NUMBER ---
exports.getOrderByNumber = async (req, res) => {
    try {
        const { order_number } = req.params;

        const order = await Order.findOne({
            where: { order_number },
            include: [
                {
                    model: User,
                    attributes: ['id', 'username', 'email', 'fullname']
                },
                {
                    model: OrderItem,
                    attributes: ['id', 'product_id', 'quantity', 'price'],
                    include: [
                        {
                            model: Product,
                            attributes: ['id', 'name', 'image']
                        }
                    ]
                }
            ]
        });

        if (!order) {
            return res.status(404).json({ msg: "Order tidak ditemukan" });
        }

        res.json({
            msg: "Data order berhasil diambil",
            data: order
        });

    } catch (error) {
        console.log("ERROR GET ORDER BY NUMBER:", error);
        res.status(500).json({ msg: error.message });
    }
};

// --- UPDATE ORDER STATUS ---
exports.updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({ msg: "Status harus diisi!" });
        }

        const order = await Order.findByPk(id);

        if (!order) {
            return res.status(404).json({ msg: "Order tidak ditemukan" });
        }

        // Update status dan catat waktu jika diperlukan
        let updateData = { status };

        if (status === 'shipped' && !order.shipped_at) {
            updateData.shipped_at = new Date();
        }

        if (status === 'delivered' && !order.delivered_at) {
            updateData.delivered_at = new Date();
        }

        await order.update(updateData);

        res.json({
            msg: "Status order berhasil diupdate",
            data: order
        });

    } catch (error) {
        console.log("ERROR UPDATE ORDER STATUS:", error);
        res.status(500).json({ msg: error.message });
    }
};

// --- UPDATE ORDER ---
exports.updateOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const { shipping_cost, discount, shipping_address, shipping_phone, notes } = req.body;

        const order = await Order.findByPk(id);

        if (!order) {
            return res.status(404).json({ msg: "Order tidak ditemukan" });
        }

        // Recalculate final price jika shipping_cost atau discount berubah
        let updateData = {
            shipping_cost: shipping_cost !== undefined ? shipping_cost : order.shipping_cost,
            discount: discount !== undefined ? discount : order.discount,
            shipping_address: shipping_address || order.shipping_address,
            shipping_phone: shipping_phone || order.shipping_phone,
            notes: notes !== undefined ? notes : order.notes
        };

        // Hitung final price
        updateData.final_price = order.total_price + updateData.shipping_cost - updateData.discount;

        await order.update(updateData);

        res.json({
            msg: "Order berhasil diupdate",
            data: order
        });

    } catch (error) {
        console.log("ERROR UPDATE ORDER:", error);
        res.status(500).json({ msg: error.message });
    }
};

// --- CANCEL ORDER ---
exports.cancelOrder = async (req, res) => {
    try {
        const { id } = req.params;

        const order = await Order.findByPk(id);

        if (!order) {
            return res.status(404).json({ msg: "Order tidak ditemukan" });
        }

        if (order.status === 'delivered' || order.status === 'shipped') {
            return res.status(400).json({ msg: "Tidak bisa membatalkan order yang sudah dikirim" });
        }

        await order.update({ status: 'cancelled' });

        res.json({
            msg: "Order berhasil dibatalkan",
            data: order
        });

    } catch (error) {
        console.log("ERROR CANCEL ORDER:", error);
        res.status(500).json({ msg: error.message });
    }
};

// --- DELETE ORDER ---
exports.deleteOrder = async (req, res) => {
    try {
        const { id } = req.params;

        const order = await Order.findByPk(id);

        if (!order) {
            return res.status(404).json({ msg: "Order tidak ditemukan" });
        }

        // Hapus order items terlebih dahulu
        await OrderItem.destroy({ where: { order_id: id } });

        // Hapus order
        await order.destroy();

        res.json({
            msg: "Order berhasil dihapus"
        });

    } catch (error) {
        console.log("ERROR DELETE ORDER:", error);
        res.status(500).json({ msg: error.message });
    }
};

// --- GET ORDER STATISTICS ---
exports.getOrderStats = async (req, res) => {
    try {
        const total_orders = await Order.count();
        const total_revenue = await Order.sum('final_price', {
            where: { status: 'delivered' }
        });
        const pending_count = await Order.count({
            where: { status: 'pending' }
        });
        const confirmed_count = await Order.count({
            where: { status: 'confirmed' }
        });
        const processing_count = await Order.count({
            where: { status: 'processing' }
        });
        const shipped_count = await Order.count({
            where: { status: 'shipped' }
        });
        const delivered_count = await Order.count({
            where: { status: 'delivered' }
        });
        const cancelled_count = await Order.count({
            where: { status: 'cancelled' }
        });

        res.json({
            msg: "Statistik order berhasil diambil",
            data: {
                total_orders,
                total_revenue: total_revenue || 0,
                pending_count,
                confirmed_count,
                processing_count,
                shipped_count,
                delivered_count,
                cancelled_count
            }
        });

    } catch (error) {
        console.log("ERROR GET ORDER STATS:", error);
        res.status(500).json({ msg: error.message });
    }
};
