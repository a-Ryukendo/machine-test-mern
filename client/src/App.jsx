import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

async function request(path, method = "GET", body, token) {
  const isFormData = body instanceof FormData;
  const headers = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }
  return data;
}

function Alert({ message }) {
  if (!message) return null;
  return <div className="alert alert--info">{message}</div>;
}

function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [agentForm, setAgentForm] = useState({ name: "", email: "", mobile: "", password: "" });
  const [message, setMessage] = useState("");
  const [agents, setAgents] = useState([]);
  const [distributed, setDistributed] = useState([]);

  const fetchAgents = async () => {
    const data = await request("/agents", "GET", null, token);
    setAgents(data.agents);
  };

  const fetchDistributed = async () => {
    const data = await request("/tasks/distributed", "GET", null, token);
    setDistributed(data.distributed);
  };

  useEffect(() => {
    if (!token) return;
    fetchAgents().catch((error) => setMessage(error.message));
    fetchDistributed().catch((error) => setMessage(error.message));
  }, [token]);

  const handleLogin = async (event) => {
    event.preventDefault();
    try {
      const data = await request("/auth/login", "POST", loginForm);
      localStorage.setItem("token", data.token);
      setToken(data.token);
      setMessage("Logged in successfully");
    } catch (error) {
      setMessage(error.message);
    }
  };

  const handleAddAgent = async (event) => {
    event.preventDefault();
    try {
      await request("/agents", "POST", agentForm, token);
      setAgentForm({ name: "", email: "", mobile: "", password: "" });
      setMessage("Agent added successfully");
      fetchAgents();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const handleFileUpload = async (event) => {
    event.preventDefault();
    const file = event.target.file.files[0];
    if (!file) {
      setMessage("Please choose a file");
      return;
    }
    const formData = new FormData();
    formData.append("file", file);

    try {
      const data = await request("/tasks/upload", "POST", formData, token);
      setMessage(`${data.message} (${data.totalItems} items)`);
      fetchDistributed();
      event.target.reset();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken("");
    setMessage("");
  };

  if (!token) {
    return (
      <div className="page page--centered">
        <div className="login-brand">
          <h1>Admin Portal</h1>
          <p>Sign in to manage agents and distribute lists</p>
        </div>
        <div className="card login-card">
          <form onSubmit={handleLogin} className="form">
            <div className="field">
              <label htmlFor="login-email">Email</label>
              <input
                id="login-email"
                type="email"
                placeholder="admin@example.com"
                value={loginForm.email}
                onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="login-password">Password</label>
              <input
                id="login-password"
                type="password"
                placeholder="Enter your password"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                required
              />
            </div>
            <button type="submit" className="btn btn--primary btn--block">
              Sign in
            </button>
          </form>
          <Alert message={message} />
        </div>
      </div>
    );
  }

  const hasDistribution = distributed.some((g) => g.items.length > 0);

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1 className="page-header__title">Dashboard</h1>
          <p className="page-header__subtitle">Manage agents and distribute uploaded lists</p>
        </div>
        <button type="button" className="btn btn--ghost" onClick={handleLogout}>
          Logout
        </button>
      </header>

      <Alert message={message} />

      <div className="dashboard-grid dashboard-grid--top">
        <section className="card">
          <h2 className="card__title">Add Agent</h2>
          <form onSubmit={handleAddAgent} className="form">
            <div className="form-row form-row--2">
              <div className="field">
                <label htmlFor="agent-name">Name</label>
                <input
                  id="agent-name"
                  type="text"
                  placeholder="John Doe"
                  value={agentForm.name}
                  onChange={(e) => setAgentForm({ ...agentForm, name: e.target.value })}
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="agent-email">Email</label>
                <input
                  id="agent-email"
                  type="email"
                  placeholder="agent@example.com"
                  value={agentForm.email}
                  onChange={(e) => setAgentForm({ ...agentForm, email: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="form-row form-row--2">
              <div className="field">
                <label htmlFor="agent-mobile">Mobile</label>
                <input
                  id="agent-mobile"
                  type="text"
                  placeholder="+919999999999"
                  value={agentForm.mobile}
                  onChange={(e) => setAgentForm({ ...agentForm, mobile: e.target.value })}
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="agent-password">Password</label>
                <input
                  id="agent-password"
                  type="password"
                  placeholder="••••••••"
                  value={agentForm.password}
                  onChange={(e) => setAgentForm({ ...agentForm, password: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn--primary">
                Add Agent
              </button>
            </div>
          </form>
        </section>

        <section className="card">
          <h2 className="card__title">Upload List</h2>
          <form onSubmit={handleFileUpload} className="form">
            <div className="field file-field">
              <label htmlFor="upload-file">CSV, XLSX, or XLS</label>
              <input
                id="upload-file"
                type="file"
                name="file"
                accept=".csv,.xlsx,.xls"
                required
              />
            </div>
            <p className="hint">
              Columns: <strong>FirstName</strong>, <strong>Phone</strong>, <strong>Notes</strong>
            </p>
            <div className="form-actions">
              <button type="submit" className="btn btn--primary">
                Upload &amp; Distribute
              </button>
            </div>
          </form>
        </section>
      </div>

      <section className="card">
        <h2 className="card__title">
          Agents
          <span className="badge">{agents.length}</span>
        </h2>
        {agents.length === 0 ? (
          <div className="empty">
            <strong>No agents yet</strong>
            Add at least 5 agents before uploading a list.
          </div>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Mobile</th>
                </tr>
              </thead>
              <tbody>
                {agents.map((agent) => (
                  <tr key={agent._id}>
                    <td>{agent.name}</td>
                    <td>{agent.email}</td>
                    <td className="mono">{agent.mobile}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="card">
        <h2 className="card__title">Distributed Lists</h2>
        {!hasDistribution ? (
          <div className="empty">
            <strong>No distributed tasks</strong>
            Upload a CSV or spreadsheet to assign items to agents.
          </div>
        ) : (
          <div className="distribution-list">
            {distributed
              .filter((group) => group.items.length > 0)
              .map((group) => (
                <article key={group.agent.id} className="agent-panel">
                  <div className="agent-panel__head">
                    <div>
                      <h3 className="agent-panel__name">{group.agent.name}</h3>
                      <p className="agent-panel__meta">{group.agent.email}</p>
                    </div>
                    <span className="badge">{group.items.length} items</span>
                  </div>
                  <div className="agent-panel__body">
                    <div className="table-wrap">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>First Name</th>
                            <th>Phone</th>
                            <th>Notes</th>
                          </tr>
                        </thead>
                        <tbody>
                          {group.items.map((item) => (
                            <tr key={item.id}>
                              <td>{item.firstName}</td>
                              <td className="mono">{item.phone}</td>
                              <td>{item.notes || "—"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </article>
              ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default App;
