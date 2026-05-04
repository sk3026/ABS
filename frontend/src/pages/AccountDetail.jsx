import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { accountApi, transactionApi } from '../api/client';
import { v4 as uuidv4 } from 'uuid';
import '../styles/account.css';

export function AccountDetail() {
  const { accountId } = useParams();
  const navigate = useNavigate();
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showTransfer, setShowTransfer] = useState(false);
  const [transferData, setTransferData] = useState({
    toAccountId: '',
    amount: '',
    description: '',
  });

  useEffect(() => {
    fetchAccountDetails();
  }, [accountId]);

  const fetchAccountDetails = async () => {
    try {
      setLoading(true);
      const [accountRes, balanceRes, historyRes] = await Promise.all([
        accountApi.getAccount(accountId),
        transactionApi.getBalance(accountId),
        transactionApi.getHistory(accountId),
      ]);
      setAccount(accountRes.data);
      setBalance(balanceRes.data.balance);
      setTransactions(historyRes.data.transactions);
    } catch (err) {
      setError('Failed to fetch account details');
    } finally {
      setLoading(false);
    }
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    try {
      const idempotencyKey = uuidv4();
      await transactionApi.transfer(
        {
          fromAccountId: accountId,
          toAccountId: transferData.toAccountId,
          amount: parseFloat(transferData.amount),
          description: transferData.description,
        },
        idempotencyKey
      );
      setTransferData({ toAccountId: '', amount: '', description: '' });
      setShowTransfer(false);
      fetchAccountDetails();
    } catch (err) {
      setError(err.response?.data?.error || 'Transfer failed');
    }
  };

  if (loading) return <div className="container">Loading...</div>;

  return (
    <div className="container">
      <button onClick={() => navigate('/dashboard')} className="back-btn">
        ← Back to Dashboard
      </button>

      {account && (
        <div className="account-detail">
          <div className="account-header">
            <div>
              <h1>{account.accountNumber}</h1>
              <p className="account-type">{account.accountType}</p>
            </div>
            <div className="balance-display">
              <p className="label">Balance</p>
              <p className="amount">${balance.toFixed(2)}</p>
            </div>
          </div>

          <div className="actions">
            <button
              onClick={() => setShowTransfer(!showTransfer)}
              className="btn-primary"
            >
              {showTransfer ? 'Cancel' : 'Make Transfer'}
            </button>
          </div>

          {error && <div className="error-message">{error}</div>}

          {showTransfer && (
            <form onSubmit={handleTransfer} className="transfer-form">
              <div className="form-group">
                <label>To Account ID</label>
                <input
                  type="text"
                  value={transferData.toAccountId}
                  onChange={(e) =>
                    setTransferData({ ...transferData, toAccountId: e.target.value })
                  }
                  placeholder="Recipient account ID"
                  required
                />
              </div>
              <div className="form-group">
                <label>Amount</label>
                <input
                  type="number"
                  step="0.01"
                  value={transferData.amount}
                  onChange={(e) =>
                    setTransferData({ ...transferData, amount: e.target.value })
                  }
                  placeholder="0.00"
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <input
                  type="text"
                  value={transferData.description}
                  onChange={(e) =>
                    setTransferData({ ...transferData, description: e.target.value })
                  }
                  placeholder="Optional"
                />
              </div>
              <button type="submit" className="btn-primary">
                Send Transfer
              </button>
            </form>
          )}

          <div className="transactions-section">
            <h2>Transaction History</h2>
            {transactions.length === 0 ? (
              <p className="empty-state">No transactions yet</p>
            ) : (
              <div className="transactions-list">
                {transactions.map((tx) => (
                  <div key={tx._id} className="transaction-item">
                    <div className="tx-info">
                      <p className="tx-desc">{tx.description || 'Transfer'}</p>
                      <p className="tx-date">
                        {new Date(tx.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="tx-amount">
                      <p
                        className={
                          tx.fromAccountId._id === accountId
                            ? 'amount negative'
                            : 'amount positive'
                        }
                      >
                        {tx.fromAccountId._id === accountId ? '-' : '+'}$
                        {tx.amount.toFixed(2)}
                      </p>
                      <p className="tx-status">{tx.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
