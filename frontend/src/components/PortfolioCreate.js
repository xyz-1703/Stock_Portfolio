import React, { useState } from "react";
import { Plus, AlertCircle, Loader2 } from "lucide-react";
import { apiUrl } from "../utils/api";

function PortfolioCreate({ onCreated }) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.name.trim()) {
      setError("Portfolio name is required");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(apiUrl("/api/portfolios/create/"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create portfolio");
      }

      setFormData({ name: "", description: "" });
      setShowForm(false);
      onCreated();
    } catch (err) {
      setError(err.message);
      console.error("Error creating portfolio:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="w-full px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-medium text-sm rounded-xl hover:shadow-lg hover:shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 btn-glow"
      >
        <Plus className="w-4 h-4" />
        New Portfolio
      </button>
    );
  }

  return (
    <div className="glass-surface p-4 space-y-3">
      <h3 className="font-semibold text-white text-sm">Create Portfolio</h3>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-2.5 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
          <p className="text-red-300 text-xs">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          name="name"
          placeholder="Portfolio name"
          value={formData.name}
          onChange={handleChange}
          className="w-full px-3 py-2 bg-white/[0.03] border border-white/[0.06] rounded-lg text-white text-sm placeholder-slate-600 focus:outline-none focus:border-blue-500/40 focus:ring-1 focus:ring-blue-500/20 transition-all"
          disabled={loading}
        />

        <textarea
          name="description"
          placeholder="Description (optional)"
          value={formData.description}
          onChange={handleChange}
          rows="2"
          className="w-full px-3 py-2 bg-white/[0.03] border border-white/[0.06] rounded-lg text-white text-sm placeholder-slate-600 focus:outline-none focus:border-blue-500/40 focus:ring-1 focus:ring-blue-500/20 transition-all resize-none"
          disabled={loading}
        />

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-3 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium text-sm rounded-lg hover:shadow-lg hover:shadow-blue-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
          >
            {loading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Creating...
              </>
            ) : (
              "Create"
            )}
          </button>
          <button
            type="button"
            onClick={() => {
              setShowForm(false);
              setError(null);
              setFormData({ name: "", description: "" });
            }}
            disabled={loading}
            className="flex-1 px-3 py-2 bg-white/[0.05] text-slate-300 font-medium text-sm rounded-lg hover:bg-white/[0.08] transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-white/[0.06]"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default PortfolioCreate;
