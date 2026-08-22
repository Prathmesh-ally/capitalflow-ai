import React from 'react';

export default function ActionCard({ action, onApprove }) {
  const isExternal = action.recommendedAction?.fromAccountId === 'EXTERNAL_CREDIT';
  
  const fromAccountName = isExternal 
    ? '🏦 External Credit Line' 
    : action.recommendedAction?.fromAccountId?.accountName || 'Reserve Account';
    
  const toAccountName = action.recommendedAction?.toAccountId?.accountName || 'Operating Account';
  const amount = action.recommendedAction?.amountToTransfer || 0;
  
  
  const confidence = action.aiConfidenceScore !== undefined ? action.aiConfidenceScore : 0.95;
  const confidencePercent = Math.round(confidence * 100);
  
  
  let badgeColor = 'bg-success';
  let riskLabel = 'Low Risk / High Confidence';
  if (confidence < 0.8) {
    badgeColor = 'bg-danger';
    riskLabel = 'High Risk / Review Required';
  } else if (confidence < 0.9) {
    badgeColor = 'bg-warning text-dark';
    riskLabel = 'Moderate Risk';
  }

  return (
    <div className="card border-warning shadow-sm mb-4">
      <div className="card-header bg-warning text-dark fw-bold d-flex justify-content-between align-items-center">
        <span>⚠️ AI Intervention Required</span>
        <span className={`badge ${badgeColor} px-2 py-1`}>
          Confidence: {confidencePercent}% ({riskLabel})
        </span>
      </div>
      <div className="card-body">
        <h5 className="card-title text-danger mb-3">{action.detectedIssue}</h5>
        <p className="card-text text-muted mb-4">{action.reasoningSummary}</p>
        
        <div className="p-3 bg-light rounded border mb-4">
          <div className="row text-center align-items-center">
            <div className="col">
              <span className="d-block small text-muted text-uppercase mb-1">Transfer From</span>
              {/* Added dynamic color: turns red if using external credit */}
              <strong className={`fs-5 ${isExternal ? 'text-danger' : ''}`}>
                {fromAccountName}
              </strong>
            </div>
            <div className="col-auto">
              <span className="fw-bold text-success" style={{ fontSize: '1.2rem' }}>
                ⟶ ₹{amount.toLocaleString()} ⟶
              </span>
            </div>
            <div className="col">
              <span className="d-block small text-muted text-uppercase mb-1">Transfer To</span>
              <strong className="fs-5">{toAccountName}</strong>
            </div>
          </div>
        </div>

        <button 
          className="btn btn-success w-100 fw-bold py-2 shadow-sm" 
          onClick={() => onApprove(action._id)}
        >
          Approve & Execute Transfer
        </button>
      </div>
    </div>
  );
}