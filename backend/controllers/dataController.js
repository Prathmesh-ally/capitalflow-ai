const Account = require('../models/Account');
const Payment = require('../models/Payment');
const Action = require('../models/Action');

exports.getDashboardData = async (req, res) => {
  try {
    const accounts = await Account.find({});
    const upcomingPayments = await Payment.find({ status: 'Pending' }).sort({ dueDate: 1 }).populate('targetAccountId');
    
    // FIX: Removed .populate('recommendedAction.fromAccountId') to prevent the "EXTERNAL_CREDIT" crash
    const pendingActions = await Action.find({ status: 'Pending_Approval' })
      .populate('recommendedAction.toAccountId');

    // FIX: Removed .populate('recommendedAction.fromAccountId') here as well
    const auditLogs = await Action.find({ status: 'Executed' })
      .sort({ executedAt: -1 })
      .populate('recommendedAction.toAccountId');

    res.status(200).json({
      success: true,
      data: {
        accounts,
        upcomingPayments,
        pendingActions,
        auditLogs 
      }
    });
  } catch (error) {
    console.error(`[Dashboard Error] ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error loading dashboard data' });
  }
};

exports.approveAction = async (req, res) => {
  try {
    const { actionId } = req.params;

    const action = await Action.findById(actionId);
    if (!action || action.status !== 'Pending_Approval') {
      return res.status(404).json({ success: false, message: 'Action not found or already processed' });
    }

    const { fromAccountId, toAccountId, amountToTransfer } = action.recommendedAction;

    // 1. Find the target account (this will always exist)
    const toAccount = await Account.findById(toAccountId);
    if (!toAccount) {
      return res.status(404).json({ success: false, message: 'Target account not found' });
    }

    // 2. Safely handle the source account (Internal vs. External Credit)
    let fromAccount = null;
    
    if (fromAccountId !== 'EXTERNAL_CREDIT') {
      // It is a normal internal transfer, so we find and deduct
      fromAccount = await Account.findById(fromAccountId);
      if (!fromAccount) {
        return res.status(404).json({ success: false, message: 'Source account not found' });
      }
      if (fromAccount.balance < amountToTransfer) {
        return res.status(400).json({ success: false, message: 'Insufficient funds in source account for transfer' });
      }
      
      fromAccount.balance -= amountToTransfer;
      await fromAccount.save();
    }

    // 3. Add the funds to the target account
    toAccount.balance += amountToTransfer;
    await toAccount.save();

    // 4. Mark action as executed
    action.status = 'Executed';
    action.executedAt = new Date();
    await action.save();

    res.status(200).json({
      success: true,
      message: 'Transfer executed successfully! Balances updated.',
      updatedAccounts: { fromAccount, toAccount }
    });

  } catch (error) {
    console.error(`[Approve Action Error] ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error executing action', error: error.message });
  }
};

exports.simulateCrash = async (req, res) => {
  try {
    const operatingAccount = await Account.findOne({ accountName: { $regex: /operating/i } });
    
    if (!operatingAccount) {
      return res.status(404).json({ success: false, message: 'Operating account not found' });
    }

    operatingAccount.balance = 5000; 
    await operatingAccount.save();

    res.status(200).json({
      success: true,
      message: '💥 Crash simulated! Primary Operating Account balance dropped to ₹5,000.',
      operatingAccount
    });
  } catch (error) {
    console.error(`[Crash Simulation Error] ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error simulating cash crash' });
  }
};