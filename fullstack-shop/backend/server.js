const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const DATA_FILE = path.join(__dirname, 'data.json');

app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type']
}));
app.use(express.json());

// Debug logger
app.use((req, _, next) => {
  console.log(req.method, req.url);
  next();
});

// JSON File helper functions
async function readData() {
  try {
    const raw = await fs.readFile(DATA_FILE, 'utf-8');
    const data = JSON.parse(raw);
    return {
      products: Array.isArray(data.products) ? data.products : [],
      cart: Array.isArray(data.cart) ? data.cart : [],
      orders: Array.isArray(data.orders) ? data.orders : [],
    };
  } catch (err) {
    if (err.code === 'ENOENT') {
      const initial = {
        products: [
          { id: 1, name: 'Áo thun basic', price: 150000, category: 'Áo' },
          { id: 2, name: 'Quần jeans slim', price: 450000, category: 'Quần' },
          { id: 3, name: 'Áo sơ mi linen', price: 320000, category: 'Áo' },
          { id: 4, name: 'Túi tote canvas', price: 180000, category: 'Phụ kiện' },
          { id: 5, name: 'Áo khoác daily', price: 590000, category: 'Áo khoác' },
          { id: 6, name: 'Nón canvas', price: 210000, category: 'Phụ kiện' },
        ],
        cart: [],
        orders: [],
      };
      await fs.writeFile(DATA_FILE, JSON.stringify(initial, null, 2));
      return initial;
    }
    throw err;
  }
}

async function writeData(data) {
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
}

function cleanName(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function parsePrice(value) {
  const price = Number(value);
  return Number.isFinite(price) && price > 0 ? price : null;
}

function parseQuantity(value) {
  const quantity = Number(value);
  return Number.isInteger(quantity) && quantity > 0 ? quantity : null;
}

// ================= PRODUCT ROUTES =================
app.get('/api/products', async (req, res) => {
  try {
    const data = await readData();
    res.json(data.products || []);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi đọc dữ liệu' });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const { name, price } = req.body;
    const productName = cleanName(name);
    const productPrice = parsePrice(price);
    if (!productName || productPrice === null) {
      return res.status(400).json({ error: 'Thiếu dữ liệu' });
    }

    const data = await readData();
    const newProduct = {
      id: Date.now(),
      name: productName,
      price: productPrice,
      category: cleanName(req.body.category) || 'Khác',
    };

    data.products = data.products || [];
    data.products.push(newProduct);
    await writeData(data);

    res.status(201).json(newProduct);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi ghi dữ liệu' });
  }
});

app.put('/api/products/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { name, price } = req.body;
    const data = await readData();
    const index = (data.products || []).findIndex(p => p.id === id);

    if (index === -1) {
      return res.status(404).json({ error: 'Không tìm thấy sản phẩm' });
    }

    if (name === undefined && price === undefined && req.body.category === undefined) {
      return res.status(400).json({ error: 'Không có dữ liệu cập nhật' });
    }

    if (name !== undefined) {
      const productName = cleanName(name);
      if (!productName) return res.status(400).json({ error: 'Tên sản phẩm không hợp lệ' });
      data.products[index].name = productName;
    }
    if (price !== undefined) {
      const productPrice = parsePrice(price);
      if (productPrice === null) {
        return res.status(400).json({ error: 'Giá không hợp lệ' });
      }
      data.products[index].price = productPrice;
    }
    if (req.body.category !== undefined) {
      data.products[index].category = cleanName(req.body.category) || 'Khác';
    }

    await writeData(data);
    res.json(data.products[index]);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi cập nhật sản phẩm' });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const data = await readData();
    const index = (data.products || []).findIndex(p => p.id === id);

    if (index === -1) {
      return res.status(404).json({ error: 'Không tìm thấy sản phẩm' });
    }

    data.products.splice(index, 1);
    // Also remove from cart if present
    data.cart = (data.cart || []).filter(item => item.productId !== id);
    await writeData(data);

    res.json({ message: 'Đã xoá thành công' });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi xoá sản phẩm' });
  }
});

// ================= CART ROUTES =================
app.get('/api/cart', async (req, res) => {
  try {
    const data = await readData();
    const productsMap = new Map((data.products || []).map(p => [p.id, p]));
    const items = (data.cart || []).map(item => {
      const product = productsMap.get(item.productId);
      return {
        productId: item.productId,
        quantity: item.quantity,
        name: product ? product.name : 'Sản phẩm không tồn tại',
        price: product ? product.price : 0,
        subtotal: product ? product.price * item.quantity : 0
      };
    });
    const totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0);
    const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);

    res.json({ items, totalCount, totalAmount });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi lấy giỏ hàng' });
  }
});

app.post('/api/cart', async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const pid = Number(productId);
    const qty = parseQuantity(quantity);

    if (!Number.isInteger(pid) || qty === null) {
      return res.status(400).json({ error: 'Product ID hoặc số lượng không hợp lệ' });
    }

    const data = await readData();
    const product = (data.products || []).find(p => p.id === pid);
    if (!product) {
      return res.status(404).json({ error: 'Sản phẩm không tồn tại' });
    }

    data.cart = data.cart || [];
    const cartItem = data.cart.find(c => c.productId === pid);
    if (cartItem) {
      cartItem.quantity += qty;
    } else {
      data.cart.push({ productId: pid, quantity: qty });
    }

    await writeData(data);
    res.status(200).json({ message: 'Đã thêm vào giỏ hàng' });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi thêm vào giỏ hàng' });
  }
});

app.put('/api/cart/:productId', async (req, res) => {
  try {
    const pid = Number(req.params.productId);
    const quantity = parseQuantity(req.body.quantity);
    if (!Number.isInteger(pid) || quantity === null) {
      return res.status(400).json({ error: 'Số lượng không hợp lệ' });
    }

    const data = await readData();
    const cartItem = data.cart.find((item) => item.productId === pid);
    if (!cartItem) {
      return res.status(404).json({ error: 'Sản phẩm chưa có trong giỏ' });
    }

    cartItem.quantity = quantity;
    await writeData(data);
    res.json({ message: 'Đã cập nhật số lượng' });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi cập nhật giỏ hàng' });
  }
});

app.delete('/api/cart/:productId', async (req, res) => {
  try {
    const pid = Number(req.params.productId);
    const data = await readData();
    data.cart = (data.cart || []).filter(c => c.productId !== pid);
    await writeData(data);

    res.json({ message: 'Đã xoá khỏi giỏ hàng' });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi xoá giỏ hàng' });
  }
});

app.delete('/api/cart', async (req, res) => {
  try {
    const data = await readData();
    data.cart = [];
    await writeData(data);
    res.json({ message: 'Đã xoá toàn bộ giỏ hàng' });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi xoá giỏ hàng' });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const customerName = cleanName(req.body.customerName);
    const phone = String(req.body.phone || '').replace(/[\s-]/g, '');
    if (!customerName || !/^0\d{8,10}$/.test(phone)) {
      return res.status(400).json({ error: 'Vui lòng nhập tên và số điện thoại hợp lệ' });
    }

    const data = await readData();
    const productsMap = new Map(data.products.map((product) => [product.id, product]));
    const items = data.cart
      .map((item) => {
        const product = productsMap.get(item.productId);
        return product
          ? {
              productId: product.id,
              name: product.name,
              price: product.price,
              quantity: item.quantity,
              subtotal: product.price * item.quantity,
            }
          : null;
      })
      .filter(Boolean);

    if (!items.length) {
      return res.status(400).json({ error: 'Giỏ hàng đang trống' });
    }

    const order = {
      id: Date.now(),
      code: `FS-${String(Date.now()).slice(-6)}`,
      customerName,
      phone,
      items,
      totalAmount: items.reduce((sum, item) => sum + item.subtotal, 0),
      createdAt: new Date().toISOString(),
    };

    data.orders.push(order);
    data.cart = [];
    await writeData(data);
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi tạo đơn hàng' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend chạy tại port :${PORT}`);
});
