const Payment = require('../models/payment.model');
const PaymentPreference = require('../models/paymentPreference.model');
const User = require('../models/User');
const { Flexpay } = require('../services/flexpay.service');
const EmailService = require('../services/email.service');

// Initialize FlexPay
const flexPay = new Flexpay({
  apiKey: process.env.FLEX_PAY_API_KEY,
  webhookUrl: process.env.FLEX_PAY_WEBHOOK_URL,
  merchant: process.env.FLEX_PAY_MERCHANT,
});

// Helper function to format phone number
const setPhone = (phone) => {
  // Remove any non-digit characters
  let phoneNumber = phone.toString().replace(/\D/g, '').replace(/^0/, '');
  if(phoneNumber.startsWith('243')) {
    return '' + phoneNumber;
  }
  return '243' +phoneNumber;
};

// Helper function to calculate credits based on amount
const calculateCredits = (amount) => {
  // Example: $10 = 1 credit, $50 = 6 credits, $100 = 15 credits
  return Math.floor(amount / 1);
};

// Create a payment
exports.createPayment = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if(Number(req.body.amount) % 1 !== 0) {
      return res.status(400).json({ message: 'Payment amount must be a multiple of 4' });
    }

    if(req.body.country !== 'DR. Congo') {
      await Payment.create({
        userId: req.user.id,
        amount: req.body.amount,
        status: 'pending',
        credits: 0,
        metadata: {
          ...req.body,
        },
      });
      return res.status(200).json({ processing: true, message: 'Payment created successfully' });
    }

    const credits = calculateCredits(req.body.amount);
    if (credits === 0) {
      return res.status(400).json({ message: 'Minimum payment amount is $1' });
    }

    const paymentData = {
      userId: req.user.id,
      amount: req.body.amount,
      status: 'pending',
      credits,
      metadata: {},
    };

    const payment = await Payment.create(paymentData);

    try {
      const flexPayResponse = await flexPay.pay({
        amount: payment.amount.toString(),
        phone: setPhone(req.body.phoneNumber),
        reference: payment._id.toString(),
        currency: 'USD',
      });

      // Update payment with FlexPay reference
      await Payment.findByIdAndUpdate(payment._id, {
        metadata: {
          flexPayOrderNumber: flexPayResponse.orderNumber,
          flexPayReference: flexPayResponse.reference,
        },
      });

      res.json(flexPayResponse);
    } catch (error) {
      console.log(error);
      await Payment.findByIdAndUpdate(payment._id, {
        status: 'failed',
        metadata: {
          error: 'Failed to call flexpay api',
          errorDetails: error.message,
        },
      });
      res.status(500).json({ message: 'Error while processing payment', error: error.message });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get payment status
exports.getPaymentStatus = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    if (req.user.role !== 'admin' && payment.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (payment.metadata?.flexPayOrderNumber) {
      try {
        const status = await flexPay.check(payment.metadata.flexPayOrderNumber);
        res.json(status);
      } catch (error) {
        res.status(500).json({ message: 'Error checking payment status', error: error.message });
      }
    } else {
      res.json({ status: payment.status });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get user's payment preferences
exports.getPaymentPreferences = async (req, res) => {
  try {
    const preferences = await PaymentPreference.findOne({ userId: req.user.id });
    res.json(preferences || {});
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update payment preferences
exports.updatePaymentPreferences = async (req, res) => {
  try {
    const preferences = await PaymentPreference.findOneAndUpdate(
      { userId: req.user.id },
      {
        userId: req.user.id,
        phoneNumber: req.body.phoneNumber,
        defaultCurrency: req.body.defaultCurrency,
        defaultPaymentType: req.body.defaultPaymentType,
        savedPaymentMethods: req.body.savedPaymentMethods,
      },
      { upsert: true, new: true }
    );
    res.json(preferences);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get user's remaining songs
exports.getRemainingSongs = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ remainingSongs: user.remainingSongs });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}; 