const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Account = require('../models/Account');
const Payment = require('../models/Payment');
const Action = require('../models/Action');

dotenv.config({ path: '../.env' }); 


const getRandomFutureDate = (daysAhead) => {
  const date = new Date();
  date.setDate(date.getDate() + Math.floor(Math.random() * daysAhead) + 1);
  return date;
};

const generateData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/capitalflow_ai');
    console.log('[Seed] Connected to MongoDB.');

    
    await Account.deleteMany();
    await Payment.deleteMany();
    await Action.deleteMany();
    console.log('[Seed] Old data cleared.');

    
    const accounts = await Account.insertMany([
      {
        accountName: 'Primary Operating Account',
        accountNumber: 'OP-10045982',
        balance: 250000,
        minThreshold: 50000,
      },
      {
        accountName: 'Payroll Reserve',
        accountNumber: 'PR-99384756',
        balance: 1500000,
        minThreshold: 100000,
      },
      {
        accountName: 'Tax & Compliance Hold',
        accountNumber: 'TX-55443322',
        balance: 400000,
        minThreshold: 50000,
      },
    ]);

    const opAccountId = accounts[0]._id;
    const payrollAccountId = accounts[1]._id;
    const taxAccountId = accounts[2]._id;

    console.log('[Seed] Corporate Accounts Created.');

    
    const payments = [];
    const vendors = ['AWS Cloud Services', 'WeWork Office Rent', 'Legal Counsel Retainer', 'Marketing Agency', 'Logistics Partner'];
    
    
    
    payments.push({
      payeeName: 'Critical Vendor Supply Co.',
      amount: 300000,
      dueDate: getRandomFutureDate(3),
      category: 'Vendor',
      targetAccountId: opAccountId,
      status: 'Pending',
      description: 'Bulk raw material order (AI should flag this shortfall)',
    });

    
    for (let i = 0; i < 55; i++) {
      const isPayroll = i % 5 === 0;
      const isTax = i % 12 === 0;
      
      let amount = Math.floor(Math.random() * 45000) + 5000;
      let targetAccountId = opAccountId;
      let payeeName = vendors[Math.floor(Math.random() * vendors.length)];
      let category = 'Vendor';

      if (isPayroll) {
        amount = Math.floor(Math.random() * 150000) + 100000;
        targetAccountId = payrollAccountId;
        payeeName = 'Global Payroll Batch';
        category = 'Payroll';
      } else if (isTax) {
        amount = Math.floor(Math.random() * 80000) + 20000;
        targetAccountId = taxAccountId;
        payeeName = 'Quarterly GST Remittance';
        category = 'Tax';
      }

      payments.push({
        payeeName,
        amount,
        dueDate: getRandomFutureDate(14), 
        category,
        targetAccountId,
        status: 'Pending',
      });
    }

    await Payment.insertMany(payments);
    console.log(`[Seed] ${payments.length} Scheduled Payments Generated.`);

    console.log('[Seed] Database successfully populated with synthetic data!');
    process.exit();
  } catch (error) {
    console.error(`[Seed Error] ${error}`);
    process.exit(1);
  }
};

generateData();