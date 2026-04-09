const ContactMessage = require('../models/ContactMessage');

const validatePayload = ({ name, email, subject, message }) => {
  if (!name || !email || !subject || !message) {
    return 'Name, email, subject and message are required';
  }

  if (subject.length > 120) {
    return 'Subject must be 120 characters or less';
  }

  if (message.length > 2000) {
    return 'Message must be 2000 characters or less';
  }

  return null;
};

const submitContactMessage = async (req, res) => {
  try {
    const { type, name, email, subject, message } = req.body;

    if (!['support', 'feedback'].includes(type)) {
      return res.status(400).json({ success: false, message: 'Invalid message type' });
    }

    const validationError = validatePayload({ name, email, subject, message });
    if (validationError) {
      return res.status(400).json({ success: false, message: validationError });
    }

    const contact = await ContactMessage.create({
      user: req.user?.id || null,
      type,
      name,
      email,
      subject,
      message,
    });

    return res.status(201).json({
      success: true,
      message: type === 'support' ? 'Support request submitted successfully' : 'Feedback submitted successfully',
      contactId: contact._id,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { submitContactMessage };
