import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ActionCard from '../components/ActionCard';

export default function Dashboard() {
  const [data, setData] = useState({ accounts: [], upcomingPayments: [], pendingActions: [], auditLogs: [] });
  const [loading, setLoading] = useState(true);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [crashing, setCrashing] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/dashboard');
      setData(response.data.data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const triggerAIAnalysis = async () => {
    setAiAnalyzing(true);
    try {
      await axios.post('http://localhost:5000/api/ai/analyze');
      await fetchDashboardData();
    } catch (error) {
      console.error("Error running AI:", error);
    } finally {
      setAiAnalyzing(false);
    }
  };

  const triggerCrashSimulation = async () => {
    setCrashing(true);
    try {
      const response = await axios.post('http://localhost:5000/api/ai/crash');
      alert(response.data.message);
      await fetchDashboardData();
    } catch (error) {
      console.error("Error simulating crash:", error);
      alert("Failed to simulate crash.");
    } finally {
      setCrashing(false);
    }
  };

  const handleApprove = async (actionId) => {
    try {
      const response = await axios.post(`http://localhost:5000/api/ai/approve/${actionId}`);
      alert(response.data.message);
      await fetchDashboardData(); 
    } catch (error) {
      console.error("Error approving action:", error);
      alert("Failed to execute transfer.");
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-5 pt-5">
        <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} role="status"></div>
        <p className="mt-3 text-muted fw-bold">Loading Financial Ledger...</p>
      </div>
    );
  }

  return (
    <div className="container pb-5">
      
      {/* Header Section */}
      <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-2">
        <h3 className="fw-bold mb-0">Corporate Accounts Overview</h3>
        <div>
          <button 
            className="btn btn-outline-danger shadow-sm fw-bold me-2" 
            onClick={triggerCrashSimulation}
            disabled={crashing}
          >
            {crashing ? 'Simulating...' : '💥 Simulate Cash Crash'}
          </button>
          <button 
            className="btn btn-primary shadow-sm fw-bold" 
            onClick={triggerAIAnalysis}
            disabled={aiAnalyzing}
          >
            {aiAnalyzing ? (
              <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Analyzing Ledger...</>
            ) : (
              <>🤖 Run AI Treasury Agent</>
            )}
          </button>
        </div>
      </div>

      {/* Account Cards */}
      <div className="row g-4 mb-5">
        {data.accounts.map((account) => (
          <div className="col-md-4" key={account._id}>
            <div className="card h-100 shadow-sm border-0">
              <div className="card-body">
                <h5 className="card-title text-secondary">{account.accountName}</h5>
                <h2 className="card-text fw-bold mb-3">
                  ₹{account.balance.toLocaleString()}
                </h2>
                <div className="d-flex justify-content-between align-items-center text-muted small">
                  <span>Acc: {account.accountNumber}</span>
                  <span>Min: ₹{account.minThreshold.toLocaleString()}</span>
                </div>
                <div className="progress mt-3" style={{ height: '6px' }}>
                  <div 
                    className={`progress-bar ${account.balance < account.minThreshold ? 'bg-danger' : 'bg-success'}`} 
                    style={{ width: `${Math.min((account.balance / (account.minThreshold * 3)) * 100, 100)}%` }}>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Split */}
      <div className="row g-4 mb-5">
        <div className="col-lg-5">
          <h4 className="fw-bold mb-3">Pending AI Actions</h4>
          {data.pendingActions.length === 0 ? (
            <div className="alert alert-success shadow-sm">
              ✅ All accounts are healthy. No interventions required.
            </div>
          ) : (
            data.pendingActions.map(action => (
              <ActionCard key={action._id} action={action} onApprove={handleApprove} />
            ))
          )}
        </div>

        <div className="col-lg-7">
          <h4 className="fw-bold mb-3">Upcoming Liabilities (7-Day Outlook)</h4>
          <div className="card shadow-sm border-0">
            <div className="card-body p-0">
              <div className="table-responsive table-scrollable">
                <table className="table table-hover mb-0 align-middle">
                  <thead className="table-light">
                    <tr>
                      <th className="px-3">Due Date</th>
                      <th>Payee</th>
                      <th>Target Account</th>
                      <th className="text-end px-3">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.upcomingPayments.map(payment => (
                      <tr key={payment._id}>
                        <td className="px-3 text-muted">{new Date(payment.dueDate).toLocaleDateString()}</td>
                        <td className="fw-medium">{payment.payeeName}</td>
                        <td className="text-secondary small">{payment.targetAccountId?.accountName || 'Unknown'}</td>
                        <td className="text-end px-3 fw-bold">₹{payment.amount.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Audit Log */}
      <div className="row">
        <div className="col-12">
          <h4 className="fw-bold mb-3">🛡️ Immutable AI Execution Audit Log</h4>
          <div className="card shadow-sm border-0">
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-striped mb-0 align-middle">
                  <thead className="table-dark">
                    <tr>
                      <th className="px-3">Execution Timestamp</th>
                      <th>Issue Resolved</th>
                      <th>Transfer Route</th>
                      <th className="text-end px-3">Amount Transferred</th>
                      <th className="text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.auditLogs.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="text-center text-muted py-4">
                          No executed transfers in audit history yet.
                        </td>
                      </tr>
                    ) : (
                      data.auditLogs.map(log => {
                        // Map the fallback identity properly for the table
                        const isExternal = log.recommendedAction?.fromAccountId === 'EXTERNAL_CREDIT';
                        const fromName = isExternal 
                          ? '🏦 External Credit Line' 
                          : (log.recommendedAction?.fromAccountId?.accountName || 
                             data.accounts.find(a => a._id === log.recommendedAction?.fromAccountId)?.accountName || 
                             'Reserve Account');

                        return (
                          <tr key={log._id}>
                            <td className="px-3 text-muted small">
                              {new Date(log.executedAt).toLocaleString()}
                            </td>
                            <td className="fw-medium text-truncate" style={{ maxWidth: '250px' }}>
                              {log.detectedIssue}
                            </td>
                            <td>
                              <span className={`badge ${isExternal ? 'bg-danger' : 'bg-secondary'} me-1`}>
                                {fromName}
                              </span> 
                              ⟶ 
                              <span className="badge bg-primary ms-1">
                                {log.recommendedAction?.toAccountId?.accountName || 'Target'}
                              </span>
                            </td>
                            <td className="text-end px-3 fw-bold text-success">
                              ₹{log.recommendedAction?.amountToTransfer?.toLocaleString()}
                            </td>
                            <td className="text-center">
                              <span className="badge bg-success">Executed Successfully</span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}