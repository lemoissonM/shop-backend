const Payment = require('../models/payment.model');
const User = require('../models/User');

exports.flexPayWebhook = async (req, res) => {
  try {
    const { reference, status, bodyMetadata } = req.body;

    // Find the payment by reference
    const payment = await Payment.findById(reference);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    // Find the user
    const user = await User.findById(payment.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (status === '0') {
      // Payment successful
      await Payment.findByIdAndUpdate(reference, {
        status: 'completed',
        metadata: {
          ...payment.metadata,
          webhookData: bodyMetadata,
        },
      });

      // Update user's remaining songs
      await User.findByIdAndUpdate(payment.userId, {
        $inc: { remainingSongs: payment.credits },
      });

      await global.socketService.emitPaymentUpdate(user._id, {
        paymentId: payment._id,
        status: 'completed',
        credits: payment.credits,
        success: true,
      });

      res.json({ message: 'Payment processed successfully' });
    } else {
      // Payment failed
      await Payment.findByIdAndUpdate(reference, {
        status: 'failed',
        metadata: {
          ...payment.metadata,
          error: 'Payment failed',
          errorDetails: bodyMetadata,
        },
      });

      await global.socketService.emitPaymentUpdate(user._id, {
        paymentId: payment._id,
        status: 'failed',
        credits: payment.credits,
        success: false,
      });

      res.json({ message: 'Payment marked as failed' });
    }
  } catch (error) {
    await global.socketService.emitPaymentUpdate(user._id, {
      paymentId: payment._id,
      status: 'failed',
      credits: payment.credits,
      success: false,
    });
    console.error('Webhook error:', error);
    res.status(500).json({ message: 'Error processing webhook', error: error.message });
  }
}; 