import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { accountApi, transactionApi } from '../api/client';
import '../styles/dashboard.css';

export function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [accountType, setAccountType] = useState('CHECKING');

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const { data } = await accountApi.getAccounts();
      setAccounts(data);
    } catch (err) {
      setError('Failed to fetch accounts');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    try {
      await accountApi.createAccount({ accountType });
      setShowCreateForm(false);
      fetchAccounts();
    } catch (err) {
      setError('Failed to create account');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSelectAccount = (accountId) => {
    navigate(`/account/${accountId}`);
  };

  return (
    <div className="dashboard-container">
      <div className="navbar">
        <h1>Banking Ledger</h1>
        <div className="nav-items">
          <span>Welcome, {user?.firstName || user?.email}</span>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="accounts-section">
          <div className="section-header">
            <h2>Your Accounts</h2>
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="btn-primary"
            >
              {showCreateForm ? 'Cancel' : 'Create Account'}
            </button>
          </div>

          {error && <div className="error-message">{error}</div>}

          {showCreateForm && (
            <form onSubmit={handleCreateAccount} className="create-form">
              <div className="form-group">
                <label>Account Type</label>
                <select
                  value={accountType}
                  onChange={(e) => setAccountType(e.target.value)}
                >
                  <option value="CHECKING">Checking</option>
                  <option value="SAVINGS">Savings</option>
                  <option value="CREDIT">Credit</option>
                </select>
              </div>
              <button type="submit" className="btn-primary">
                Create
              </button>
            </form>
          )}

          {loading ? (
            <p>Loading accounts...</p>
          ) : accounts.length === 0 ? (
            <p className="empty-state">No accounts yet. Create one to get started!</p>
          ) : (
            <div className="accounts-grid">
              {accounts.map((account) => (
                <div
                  key={account._id}
                  className="account-card"
                  onClick={() => handleSelectAccount(account._id)}
                >
                  <div className="account-number">{account.accountNumber}</div>
                  <div className="account-type">{account.accountType}</div>
                  <div className="account-status">{account.status}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
