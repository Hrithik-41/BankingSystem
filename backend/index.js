const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const path = require('path');

const port = process.env.PORT || 5001;
const app = express();

app.use(cors({origin: '*'}));
app.use(bodyParser.json());
app.use(express.json());

// MySQL connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'HRIT2002',
    database: 'Bank'
});

db.connect(err => {
    if (err) {
        console.error('DB connection error:', err);
        return;
    }
    console.log('Connected to MySQL');
});

// Customer login route
app.post('/login/customer', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ success: false, message: "Username and password are required" });
    }

    const query = 'SELECT * FROM Users WHERE username = ? AND role = "customer"';
    db.query(query, [username], (err, results) => {
        if (err) return res.status(500).json({ success: false, message: err.message });

        if (results.length === 0) {
            return res.status(401).json({ success: false, message: "User not found" });
        }

        const user = results[0];

        if (user.password !== password) {
            return res.status(401).json({ success: false, message: "Incorrect password" });
        }

        const accessToken = crypto.randomBytes(18).toString('hex'); // 36 chars
        res.json({ success: true, message: "Login successful", accessToken, userId: user.id });
    });
});

// Get all customers (for banker)
app.get('/customers', (req, res) => {
    const query = 'SELECT id, name, username, email FROM Users WHERE role = "customer"';
    db.query(query, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: 'DB error' });
        }
        res.json({ success: true, customers: results });
    });
});


// Banker login route
app.post('/login/banker', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Username and password are required' });
    }

    const query = 'SELECT * FROM Users WHERE username = ? AND password = ? AND role = "banker"';
    db.query(query, [username, password], (err, results) => {
        if (err) return res.status(500).json({ success: false, message: err.message });

        if (results.length === 0) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // Generate 36-character random token
        const token = crypto.randomBytes(18).toString('hex');
        res.json({ success: true, message: 'Banker login successful', token });
    });
});

// Get all transactions for a customer
app.get('/transactions/:userId', (req, res) => {
    const { userId } = req.params;

    const query = 'SELECT * FROM Accounts WHERE user_id = ? ORDER BY created_at DESC';
    db.query(query, [userId], (err, results) => {
        if (err) return res.status(500).json({ success: false, message: err.message });

        res.json({ success: true, transactions: results });
    });
});

// Deposit money
app.post('/transactions/deposit', (req, res) => {
    const { userId, amount } = req.body;

    if (!userId || !amount || amount <= 0) {
        return res.status(400).json({ success: false, message: 'Invalid user or amount' });
    }

    const query = 'INSERT INTO Accounts (user_id, type, amount) VALUES (?, "deposit", ?)';
    db.query(query, [userId, amount], (err, results) => {
        if (err) return res.status(500).json({ success: false, message: err.message });

        res.json({ success: true, message: 'Deposit successful', transactionId: results.insertId });
    });
});

// Withdraw money
app.post('/transactions/withdraw', (req, res) => {
    const { userId, amount } = req.body;

    if (!userId || !amount || amount <= 0) {
        return res.status(400).json({ success: false, message: 'Invalid user or amount' });
    }

    // Calculate current balance from all transactions
    const balanceQuery = `
        SELECT
            SUM(CASE WHEN type='deposit' THEN amount ELSE 0 END) -
            SUM(CASE WHEN type='withdraw' THEN amount ELSE 0 END) AS balance
        FROM Accounts
        WHERE user_id = ?
    `;

    db.query(balanceQuery, [userId], (err, results) => {
        if (err) return res.status(500).json({ success: false, message: err.message });

        const balance = results[0].balance || 0;
        if (amount > balance) {
            return res.status(400).json({ success: false, message: 'Insufficient funds' });
        }

        // Insert withdrawal record
        const query = 'INSERT INTO Accounts (user_id, type, amount) VALUES (?, "withdraw", ?)';
        db.query(query, [userId, amount], (err2, results2) => {
            if (err2) return res.status(500).json({ success: false, message: err2.message });

            res.json({ success: true, message: 'Withdrawal successful', transactionId: results2.insertId });
        });
    });
});

// Withdraw route
app.post('/transactions/withdraw', (req, res) => {
    const { userId, amount } = req.body;

    // Validate amount
    if (!userId || !amount || amount <= 0) {
        return res.status(400).json({ message: "Invalid user or amount" });
    }

    // Get current balance
    const getBalanceQuery = 'SELECT balance FROM Accounts WHERE userId = ? ORDER BY id DESC LIMIT 1';
    db.query(getBalanceQuery, [userId], (err, results) => {
        if (err) return res.status(500).json({ message: "DB error", error: err });

        const balance = results.length ? results[0].balance : 0;

        if (balance < amount) {
            return res.status(400).json({ message: "Insufficient Funds" });
        }

        // Deduct amount and insert transaction
        const newBalance = balance - amount;
        const insertQuery = 'INSERT INTO Accounts (userId, type, amount, balance) VALUES (?, "withdraw", ?, ?)';
        db.query(insertQuery, [userId, amount, newBalance], (err2, result2) => {
            if (err2) return res.status(500).json({ message: "DB error", error: err2 });

            res.json({ message: `Withdrawn ${amount}`, balance: newBalance });
        });
    });
});

// Customer login
app.post('/login/customer', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    // Check user in database
    const query = 'SELECT * FROM Users WHERE email = ? AND role = "customer"';
    db.query(query, [email], (err, results) => {
        if (err) return res.status(500).json({ success: false, message: "DB error", error: err });

        if (results.length === 0) {
            return res.status(401).json({ success: false, message: "User not found" });
        }

        const user = results[0];

        // Simple password check (plaintext for now; later use hashing)
        if (user.password !== password) {
            return res.status(401).json({ success: false, message: "Incorrect password" });
        }

        const accessToken = crypto.randomBytes(18).toString('hex'); // 18 bytes = 36 hex chars

        res.json({ success: true, message: "Login successful", accessToken, userId: user.id });
    });
});

// Deposit endpoint
app.post('/transactions/deposit', async (req, res) => {
    const { username, amount } = req.body;

    if (!username || !amount) {
        return res.status(400).json({ success: false, message: 'Username and amount are required' });
    }

    try {
        // Get user ID
        const [user] = await db.query('SELECT id FROM Users WHERE username = ?', [username]);

        if (user.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const userId = user[0].id;

        // Insert transaction (only record deposit)
        const [result] = await db.query(
            'INSERT INTO Accounts (user_id, type, amount) VALUES (?, ?, ?)',
            [userId, 'deposit', amount]
        );

        res.json({ success: true, message: 'Deposit successful', transactionId: result.insertId });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

app.get('/balance/:username', async (req, res) => {
    const { username } = req.params;

    try {
        // get user id
        const [user] = await db.query('SELECT id FROM Users WHERE username = ?', [username]);

        if (user.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const userId = user[0].id;

        // calculate balance
        const [depositRows] = await db.query(
            "SELECT SUM(amount) AS totalDeposits FROM Accounts WHERE user_id = ? AND type = 'deposit'",
            [userId]
        );

        const [withdrawRows] = await db.query(
            "SELECT SUM(amount) AS totalWithdraws FROM Accounts WHERE user_id = ? AND type = 'withdraw'",
            [userId]
        );

        const balance = 
            (depositRows[0].totalDeposits || 0) - 
            (withdrawRows[0].totalWithdraws || 0);

        res.json({ success: true, balance });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

app.use(express.static(path.join(__dirname, 'build')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
});