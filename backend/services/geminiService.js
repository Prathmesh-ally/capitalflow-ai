const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

exports.analyzeCashFlow = async (accounts, upcomingPayments) => {
  const prompt = `
    You are an expert AI Corporate Treasurer.
    Analyze the following financial data to predict if any account will drop below its 'minThreshold' due to upcoming payments.

    Corporate Accounts:
    ${JSON.stringify(accounts, null, 2)}

    Upcoming Pending Payments (Sorted by Date):
    ${JSON.stringify(upcomingPayments, null, 2)}

    TASK INSTRUCTIONS:
    1. Calculate the projected balance for each account by subtracting upcoming payments targeted at that account.
    2. If an account's projected balance falls below its 'minThreshold', flag it as a shortfall.
    3. If a shortfall is detected, recommend a transfer FROM an account that has excess liquidity (Current Balance - minThreshold > Transfer Amount) TO the account with the shortfall.
    4. CRITICAL RULE: If the total available funds across all reserve accounts (e.g., Payroll, Tax) are INSUFFICIENT to cover the Operating Account deficit, you MUST NOT recommend an internal transfer. Instead, output the fromAccountId as "EXTERNAL_CREDIT", set the amount to the exact remaining deficit, and state in the reasoningSummary that the CFO must immediately draw from the corporate line of credit.

    OUTPUT CONSTRAINTS:
    You MUST respond strictly in the following JSON structure. Do not include markdown tags (\`\`\`json) or any conversational text.

    {
      "hasShortfall": true/false,
      "detectedIssue": "String describing the specific shortfall",
      "projectedShortfallDate": "YYYY-MM-DD",
      "recommendedAction": {
        "fromAccountId": "ObjectId string or 'EXTERNAL_CREDIT'",
        "toAccountId": "ObjectId string",
        "amountToTransfer": Number
      },
      "reasoningSummary": "String explaining reasoning",
      "aiConfidenceScore": Number
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error(`[Gemini Service Error] API Failed: ${error.message}`);
    console.log('[Gemini Service] Falling back to mock data due to API unavailability.');
    
    return {
      hasShortfall: true,
      detectedIssue: "Primary Operating Account is projected to fall below its minimum threshold due to major vendor payments.",
      projectedShortfallDate: upcomingPayments[0] ? upcomingPayments[0].dueDate : new Date().toISOString(),
      recommendedAction: {
        fromAccountId: accounts[1] ? accounts[1]._id : null, 
        toAccountId: accounts[0] ? accounts[0]._id : null,   
        amountToTransfer: 350000 
      },
      reasoningSummary: "[FALLBACK MOCK] API Unavailable. Simulating transfer of 350,000 INR from Payroll Reserve to cover the 300,000 INR deficit in the Operating Account to restore safety threshold.",
      aiConfidenceScore: 0.95
    };
  }
};