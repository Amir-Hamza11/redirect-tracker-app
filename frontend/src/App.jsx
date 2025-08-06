import React, { useEffect, useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import { CalendarDays, Search, LogOut, Download, RefreshCcw } from "lucide-react";

const PASSWORD = "admin123";

const App = () => {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState({ pid: "", uid: "", status: "", from: "", to: "" });
  const [authenticated, setAuthenticated] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const [inputPassword, setInputPassword] = useState("");

  useEffect(() => {
    const isAuth = localStorage.getItem("auth") === "true";
    setAuthenticated(isAuth);
  }, []);

  useEffect(() => {
    if (authenticated) {
      fetchData();
      setCurrentPage(1);
    }
  }, [authenticated, search]);

  const handleLogout = () => {
    localStorage.removeItem("auth");
    setAuthenticated(false);
    setInputPassword("");
  };

  const fetchData = () => {
    axios.get("http://localhost:3001/data").then((res) => setData(res.data));
  };

  const filtered = data.filter((entry) => {
    const pidMatch = entry.pid.toLowerCase().includes(search.pid.toLowerCase());
    const uidMatch = entry.uid.toLowerCase().includes(search.uid.toLowerCase());
    const statusMatch = search.status === "" || entry.status === search.status;
    const entryDate = new Date(entry.timestamp);
    const fromDate = search.from ? new Date(search.from) : null;
    const toDate = search.to ? new Date(search.to) : null;
    const fromMatch = fromDate ? entryDate >= fromDate : true;
    const toMatch = toDate ? entryDate <= toDate : true;
    return pidMatch && uidMatch && statusMatch && fromMatch && toMatch;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedData = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (!authenticated) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="bg-white p-8 rounded shadow-md w-96">
          <h2 className="text-xl font-bold mb-4 text-center">🔒 Admin Login</h2>
          <input
            type="password"
            placeholder="Enter password"
            value={inputPassword}
            onChange={(e) => setInputPassword(e.target.value)}
            className="border p-2 w-full mb-4 rounded"
          />
          <button
            onClick={() => {
              if (inputPassword === PASSWORD) {
                setAuthenticated(true);
                localStorage.setItem("auth", "true");
              } else {
                alert("Incorrect password");
              }
            }}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-blue-700">🚀 Dashboard</h1>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          <LogOut size={16} /> Logout
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <input
          type="text"
          placeholder="🔍 Search PID"
          className="border p-2 rounded shadow-sm"
          onChange={(e) => setSearch({ ...search, pid: e.target.value })}
        />
        <input
          type="text"
          placeholder="🔍 Search UID"
          className="border p-2 rounded shadow-sm"
          onChange={(e) => setSearch({ ...search, uid: e.target.value })}
        />
        <select
          className="border p-2 rounded shadow-sm"
          onChange={(e) => setSearch({ ...search, status: e.target.value })}
        >
          <option value="">All Statuses</option>
          <option value="complete">✅ Complete</option>
          <option value="terminate">❌ Terminate</option>
          <option value="quotafull">⚠️ Quota Full</option>
        </select>
        <div className="relative">
          <input
            type="date"
            className="border p-2 rounded shadow-sm pr-10 w-full appearance-none"
            onChange={(e) => setSearch({ ...search, from: e.target.value })}
          />
          <CalendarDays className="absolute top-2.5 right-3 text-gray-400" size={18} />
        </div>
        <div className="relative">
          <input
            type="date"
            className="border p-2 rounded shadow-sm pr-10 w-full appearance-none"
            onChange={(e) => setSearch({ ...search, to: e.target.value })}
          />
          <CalendarDays className="absolute top-2.5 right-3 text-gray-400" size={18} />
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <button
          onClick={() => {
            const exportData = filtered.map(({ pid, uid, status, timestamp, ipaddress }) => ({
              PID: pid,
              UID: uid,
              Status: status,
              Timestamp: new Date(timestamp).toLocaleString(),
              IPAddress: ipaddress || "",
            }));

            const worksheet = XLSX.utils.json_to_sheet(exportData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Redirect Data");
            XLSX.writeFile(workbook, "redirect-data.xlsx");
          }}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          <Download size={16} /> Export to Excel
        </button>

        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          <RefreshCcw size={16} /> Refresh
        </button>
      </div>

      <div className="overflow-auto">
        <table className="min-w-full border border-gray-300 shadow-sm rounded">
          <thead className="bg-blue-100">
            <tr>
              <th className="border p-2">PID</th>
              <th className="border p-2">UID</th>
              <th className="border p-2">Status</th>
              <th className="border p-2">Timestamp</th>
              <th className="border p-2">IP Address</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((entry) => (
              <tr key={entry.id} className="hover:bg-gray-100">
                <td className="border p-2">{entry.pid}</td>
                <td className="border p-2">{entry.uid}</td>
                <td className="border p-2 capitalize">{entry.status}</td>
                <td className="border p-2">{new Date(entry.timestamp).toLocaleString()}</td>
                <td className="border p-2">{entry.ipaddress}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex justify-center gap-2">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >⬅ Prev</button>

        {[...Array(totalPages)].map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentPage(index + 1)}
            className={`px-3 py-1 border rounded ${currentPage === index + 1 ? "bg-blue-500 text-white" : ""}`}
          >
            {index + 1}
          </button>
        ))}

        <button
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >Next ➡</button>
      </div>
    </div>
  );
};

export default App;
