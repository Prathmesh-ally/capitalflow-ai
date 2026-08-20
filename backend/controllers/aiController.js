const emailService = require('../services/emailService');
const Account = require('../models/Account');
const Payment = require('../models/Payment');
const Action = require('../models/Action');
const geminiService = require('../services/geminiService');

exports.runTreasuryAnalysis = async (req, res) => {
  console.log('API Key Status:', process.env.GEMINI_API_KEY ? 'Loaded' : 'MISSING');
  try {
    console.log('[AI Controller] Starting treasury analysis...');

    
    const accounts = await Account.find();
    
    const upcomingPayments = await Payment.find({ status: 'Pending' })
      .sort({ dueDate: 1 })
      .limit(20);

    
    const aiResponse = await geminiService.analyzeCashFlow(accounts, upcomingPayments);

    if (aiResponse.hasShortfall) {
      console.log('[AI Controller] Shortfall detected. Generating Action Item...');
      
      
      const newAction = new Action({
        detectedIssue: aiResponse.detectedIssue,
        projectedShortfallDate: new Date(aiResponse.projectedShortfallDate),
        recommendedAction: {
          fromAccountId: aiResponse.recommendedAction.fromAccountId,
          toAccountId: aiResponse.recommendedAction.toAccountId,
          amountToTransfer: aiResponse.recommendedAction.amountToTransfer
        },
        reasoningSummary: aiResponse.reasoningSummary,
        status: 'Pending_Approval'
      });

      await newAction.save();
      emailService.sendAlertEmail(newAction);
      
      return res.status(200).json({
        success: true,
        message: 'Analysis complete. Risk identified and action proposed.',
        action: newAction
      });
    }

    res.status(200).json({
      success: true,
      message: 'Analysis complete. All accounts are healthy.',
      aiResponse
    });

  } catch (error) {
    console.error(`[AI Controller Error] ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to run AI analysis',
      error: error.message
    });
  }
};