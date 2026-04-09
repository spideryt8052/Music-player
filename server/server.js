const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Coupon = require('./models/Coupon');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/songs', require('./routes/songRoutes'));
app.use('/api/playlists', require('./routes/playlistRoutes'));
app.use('/api/favorites', require('./routes/favoriteRoutes'));
app.use('/api/recent', require('./routes/recentRoutes'));
app.use('/api/song-requests', require('./routes/songRequestRoutes'));
app.use('/api/coupons', require('./routes/couponRoutes'));
app.use('/api/subscriptions', require('./routes/subscriptionRoutes'));
app.use('/api/contact', require('./routes/contactRoutes'));

const PORT = process.env.PORT || 5000;

const bootstrapAdminAccount = async () => {
	const adminUsername = process.env.ADMIN_USERNAME;
	const adminEmail = process.env.ADMIN_EMAIL;
	const adminPassword = process.env.ADMIN_PASSWORD;

	if (!adminUsername || !adminEmail || !adminPassword) {
		console.log('Admin bootstrap skipped: ADMIN_USERNAME, ADMIN_EMAIL, or ADMIN_PASSWORD is missing');
		return;
	}

	const salt = await bcrypt.genSalt(10);
	const hashedPassword = await bcrypt.hash(adminPassword, salt);

	await User.findOneAndUpdate(
		{ username: adminUsername },
		{
			username: adminUsername,
			email: adminEmail,
			password: hashedPassword,
			isAdmin: true,
		},
		{ upsert: true, new: true }
	);

	console.log(`Admin account ready: ${adminUsername}`);
};

const seedTestCoupons = async () => {
	try {
		const adminUser = await User.findOne({ username: process.env.ADMIN_USERNAME });
		if (!adminUser) {
			console.log('Admin user not found, skipping coupon seeding');
			return;
		}

		// Check if test coupons already exist
		const existingCount = await Coupon.countDocuments({ 
			code: { $in: ['SAVE20', 'SAVE50', 'FLAT100'] }
		});
		
		if (existingCount > 0) {
			console.log(`✓ Test coupons already exist (${existingCount} found)`);
			return;
		}

		// Create test coupons
		const testCoupons = [
			{
				code: 'SAVE20',
				discountType: 'percentage',
				discountValue: 20,
				maxUsageCount: 100,
				expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
				description: 'Save 20% on subscription',
				createdBy: adminUser._id,
				isActive: true
			},
			{
				code: 'SAVE50',
				discountType: 'percentage',
				discountValue: 50,
				maxUsageCount: 50,
				expiryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
				description: 'Save 50% on subscription',
				createdBy: adminUser._id,
				isActive: true
			},
			{
				code: 'FLAT100',
				discountType: 'fixed',
				discountValue: 100,
				maxUsageCount: 30,
				expiryDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
				description: 'Flat ₹100 off',
				createdBy: adminUser._id,
				isActive: true
			}
		];

		await Coupon.insertMany(testCoupons);
		console.log('✓ Test coupons created: SAVE20, SAVE50, FLAT100');
	} catch (error) {
		console.error('Error seeding coupons:', error.message);
	}
};

const startServer = async () => {
	await connectDB();
	await bootstrapAdminAccount();
	await seedTestCoupons();
	app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
};

startServer();