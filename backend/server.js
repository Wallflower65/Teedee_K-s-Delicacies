import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config();

const { Pool } = pg;

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// PostgreSQL Connection Pool
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'teedeeks_db',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5432,
});

// Test Database Connection
pool.connect((err, client, release) => {
  if (err) {
    console.error('Error connecting to PostgreSQL database:', err.stack);
  } else {
    console.log('Connected to PostgreSQL Database successfully!');
    release();
  }
});

// API Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: "Teedee_K's Delicacies API" });
});

// Create Order Endpoint (Saves Date, Time, Contact & Items)
app.post('/api/orders', async (req, res) => {
  try {
    const {
      items,
      suburb,
      paymentMethod,
      rawSubtotal,
      discount,
      deliveryFee,
      finalTotal,
      customerName,
      customerPhone,
      fulfillmentType,
      scheduledDate,
      scheduledTimeSlot,
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Order must contain at least one item.' });
    }

    const orderId = 'TD-' + Math.floor(100000 + Math.random() * 900000);

    const query = `
      INSERT INTO orders (
        order_id, items, suburb, payment_method, raw_subtotal, discount, 
        delivery_fee, final_total, status, customer_name, customer_phone, 
        fulfillment_type, scheduled_date, scheduled_time_slot
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *;
    `;

    const values = [
      orderId,
      JSON.stringify(items),
      suburb,
      paymentMethod,
      rawSubtotal,
      discount,
      deliveryFee,
      finalTotal,
      'Pending',
      customerName || null,
      customerPhone || null,
      fulfillmentType || 'Delivery',
      scheduledDate || 'ASAP',
      scheduledTimeSlot || 'Standard Delivery',
    ];

    const result = await pool.query(query, values);
    const newOrder = result.rows[0];

    console.log(`[DB ORDER SAVED] ID: ${orderId} | Total: R${finalTotal.toFixed(2)}`);

    res.status(201).json({
      success: true,
      orderId,
      message: 'Order saved to database successfully',
      order: {
        ...newOrder,
        orderId: newOrder.order_id,
        paymentMethod: newOrder.payment_method,
        rawSubtotal: parseFloat(newOrder.raw_subtotal),
        discount: parseFloat(newOrder.discount),
        deliveryFee: parseFloat(newOrder.delivery_fee),
        finalTotal: parseFloat(newOrder.final_total),
        customerName: newOrder.customer_name,
        customerPhone: newOrder.customer_phone,
        fulfillmentType: newOrder.fulfillment_type,
        scheduledDate: newOrder.scheduled_date,
        scheduledTimeSlot: newOrder.scheduled_time_slot,
        items: newOrder.items,
      },
    });
  } catch (error) {
    console.error('Error saving order to DB:', error);
    res.status(500).json({ error: 'Failed to record order in database' });
  }
});

// Get All Orders Endpoint
app.get('/api/orders', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');

    const formattedOrders = result.rows.map((o) => ({
      orderId: o.order_id,
      items: typeof o.items === 'string' ? JSON.parse(o.items) : o.items,
      suburb: o.suburb,
      paymentMethod: o.payment_method,
      rawSubtotal: parseFloat(o.raw_subtotal),
      discount: parseFloat(o.discount),
      deliveryFee: parseFloat(o.delivery_fee),
      finalTotal: parseFloat(o.final_total),
      status: o.status,
      customerName: o.customer_name,
      customerPhone: o.customer_phone,
      fulfillmentType: o.fulfillment_type,
      scheduledDate: o.scheduled_date,
      scheduledTimeSlot: o.scheduled_time_slot,
      createdAt: o.created_at,
    }));

    res.json({ success: true, count: formattedOrders.length, orders: formattedOrders });
  } catch (error) {
    console.error('Error fetching orders from DB:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Live Track Order Endpoint
app.get('/api/orders/track/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    const query = 'SELECT * FROM orders WHERE LOWER(order_id) = LOWER($1)';
    const result = await pool.query(query, [orderId.trim()]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found. Please check your Order ID.' });
    }

    const o = result.rows[0];
    const formattedOrder = {
      orderId: o.order_id,
      customerName: o.customer_name,
      items: typeof o.items === 'string' ? JSON.parse(o.items) : o.items,
      suburb: o.suburb,
      fulfillmentType: o.fulfillment_type,
      scheduledDate: o.scheduled_date,
      scheduledTimeSlot: o.scheduled_time_slot,
      paymentMethod: o.payment_method,
      finalTotal: parseFloat(o.final_total),
      status: o.status,
      createdAt: o.created_at,
    };

    res.json({ success: true, order: formattedOrder });
  } catch (error) {
    console.error('Error tracking order:', error);
    res.status(500).json({ error: 'Failed to track order' });
  }
});

// Update Order Status Endpoint
app.patch('/api/orders/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const query = 'UPDATE orders SET status = $1 WHERE order_id = $2 RETURNING *;';
    const result = await pool.query(query, [status, orderId]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    console.log(`[DB ORDER UPDATED] ID: ${orderId} -> Status: ${status}`);
    res.json({ success: true, message: 'Order status updated in database' });
  } catch (error) {
    console.error('Error updating order status in DB:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

app.listen(PORT, () => {
  console.log(`Teedee_K Backend Server running on http://localhost:${PORT}`);
});