import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Save, X, Check, RefreshCw } from 'lucide-react';
import { adminApi } from '../utils/adminApi';

interface Plan {
  _id: string;
  name: string;
  price: number;
  billingCycle: string;
  features: string[];
  active: boolean;
}

const EMPTY_FORM = { name: '', price: 0, billingCycle: 'monthly', features: [] as string[] };

export default function AdminSubscriptions() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [featureInput, setFeatureInput] = useState('');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  useEffect(() => { fetchPlans(); }, []);

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchPlans = async () => {
    setLoading(true);
    try {
      // Response shape: { subscriptions: [...] }
      const res = await adminApi.get('/api/admin/subscriptions');
      setPlans(res?.subscriptions || []);
    } catch {
      showToast('error', 'Failed to fetch plans');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (plan: Plan) => {
    setFormData({ name: plan.name, price: plan.price, billingCycle: plan.billingCycle, features: [...plan.features] });
    setEditingId(plan._id);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) return showToast('error', 'Plan name is required');
    if (formData.price < 0) return showToast('error', 'Price cannot be negative');
    setSaving(true);
    try {
      if (editingId) {
        await adminApi.put(`/api/admin/subscriptions/${editingId}`, formData);
        showToast('success', `"${formData.name}" updated successfully`);
      } else {
        await adminApi.post('/api/admin/subscriptions', formData);
        showToast('success', `"${formData.name}" plan created`);
      }
      resetForm();
      fetchPlans();
    } catch {
      showToast('error', 'Failed to save plan');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (plan: Plan) => {
    try {
      await adminApi.put(`/api/admin/subscriptions/${plan._id}`, { ...plan, active: !plan.active });
      showToast('success', `Plan ${plan.active ? 'deactivated' : 'activated'}`);
      fetchPlans();
    } catch {
      showToast('error', 'Failed to toggle plan');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}" plan?`)) return;
    try {
      await adminApi.delete(`/api/admin/subscriptions/${id}`);
      showToast('success', 'Plan deleted');
      fetchPlans();
    } catch {
      showToast('error', 'Failed to delete plan');
    }
  };

  const addFeature = () => {
    const val = featureInput.trim();
    if (val && !formData.features.includes(val)) {
      setFormData(f => ({ ...f, features: [...f.features, val] }));
      setFeatureInput('');
    }
  };

  const resetForm = () => {
    setFormData(EMPTY_FORM);
    setEditingId(null);
    setShowForm(false);
    setFeatureInput('');
  };

  return (
    <div className="p-6 space-y-6 bg-[#060B18] min-h-screen">

      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-xl text-sm font-medium shadow-xl border ${
          toast.type === 'success'
            ? 'bg-green-950 border-green-500/30 text-green-300'
            : 'bg-red-950 border-red-500/30 text-red-300'
        }`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Subscription Plans</h2>
          <p className="text-gray-500 text-sm mt-1">Changes reflect instantly on the pricing page</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchPlans} className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
          >
            <Plus size={16} /> Add Plan
          </button>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-[#1a1a2e] border border-purple-500/30 rounded-2xl p-6">
          <h3 className="text-white font-semibold mb-5">{editingId ? '✏️ Edit Plan' : '➕ New Plan'}</h3>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-gray-400 text-xs mb-1.5 block">Plan Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Free, Pro, Enterprise..."
                className="w-full bg-[#0f0f1e] border border-white/20 rounded-xl px-3 py-2.5 text-white text-sm focus:border-purple-500/50 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-gray-400 text-xs mb-1.5 block">Price (₹)</label>
              <input
                type="number"
                min="0"
                value={formData.price}
                onChange={e => setFormData(f => ({ ...f, price: parseFloat(e.target.value) || 0 }))}
                className="w-full bg-[#0f0f1e] border border-white/20 rounded-xl px-3 py-2.5 text-white text-sm focus:border-purple-500/50 focus:outline-none"
              />
            </div>
            <div className="col-span-2">
              <label className="text-gray-400 text-xs mb-1.5 block">Billing Cycle</label>
              <div className="flex gap-3">
                {['monthly', 'yearly'].map(cycle => (
                  <button
                    key={cycle}
                    onClick={() => setFormData(f => ({ ...f, billingCycle: cycle }))}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all capitalize ${
                      formData.billingCycle === cycle
                        ? 'bg-purple-600/20 border-purple-500/50 text-purple-300'
                        : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                    }`}
                  >
                    {cycle}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mb-5">
            <label className="text-gray-400 text-xs mb-1.5 block">Features</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={featureInput}
                onChange={e => setFeatureInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                placeholder="Type a feature and press Enter..."
                className="flex-1 bg-[#0f0f1e] border border-white/20 rounded-xl px-3 py-2.5 text-white text-sm focus:border-purple-500/50 focus:outline-none"
              />
              <button onClick={addFeature} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 rounded-xl text-sm transition-colors">
                Add
              </button>
            </div>
            {formData.features.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.features.map((f, i) => (
                  <span key={i} className="flex items-center gap-1.5 bg-purple-600/15 border border-purple-500/25 text-purple-300 text-xs px-3 py-1.5 rounded-lg">
                    <Check size={10} /> {f}
                    <button onClick={() => setFormData(d => ({ ...d, features: d.features.filter((_, idx) => idx !== i) }))} className="ml-1 hover:text-white">
                      <X size={11} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
            >
              <Save size={14} /> {saving ? 'Saving...' : editingId ? 'Update Plan' : 'Create Plan'}
            </button>
            <button onClick={resetForm} className="flex items-center gap-2 bg-white/10 hover:bg-white/15 text-white px-4 py-2.5 rounded-xl text-sm transition-colors">
              <X size={14} /> Cancel
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-[#1a1a2e] border border-white/10 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading plans...</div>
        ) : plans.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 mb-1">No plans yet</p>
            <p className="text-gray-600 text-sm">Click "Add Plan" to create your first subscription plan</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 bg-[#0f0f1e]/60">
                {['Plan', 'Price', 'Cycle', 'Features', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider last:text-center">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {plans.map((plan, idx) => (
                <tr key={plan._id} className={`hover:bg-white/2 transition-colors ${idx < plans.length - 1 ? 'border-b border-white/5' : ''}`}>
                  <td className="px-6 py-4 text-white font-semibold">{plan.name}</td>
                  <td className="px-6 py-4 text-purple-300 font-bold">{plan.price === 0 ? 'Free' : `₹${plan.price}`}</td>
                  <td className="px-6 py-4 text-gray-400 capitalize text-sm">{plan.billingCycle}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {plan.features.slice(0, 2).map((f, i) => (
                        <span key={i} className="text-xs bg-white/5 text-gray-300 px-2 py-0.5 rounded-md">{f}</span>
                      ))}
                      {plan.features.length > 2 && <span className="text-xs text-gray-500">+{plan.features.length - 2} more</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggle(plan)}
                      className={`text-xs font-semibold px-3 py-1 rounded-full border transition-all ${
                        plan.active
                          ? 'bg-green-500/15 text-green-400 border-green-500/25 hover:bg-red-500/15 hover:text-red-400 hover:border-red-500/25'
                          : 'bg-red-500/15 text-red-400 border-red-500/25 hover:bg-green-500/15 hover:text-green-400 hover:border-green-500/25'
                      }`}
                    >
                      {plan.active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-3 justify-center">
                      <button onClick={() => handleEdit(plan)} className="text-blue-400 hover:text-blue-300 transition-colors"><Edit size={15} /></button>
                      <button onClick={() => handleDelete(plan._id, plan.name)} className="text-red-400 hover:text-red-300 transition-colors"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
