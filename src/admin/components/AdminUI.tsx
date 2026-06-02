import { Loader } from 'lucide-react';
import type { ReactNode } from 'react';

// ── Stat Card ────────────────────────────────────────────────────────────────
interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon: ReactNode;
  gradient?: string;
  trend?: { value: string; up: boolean };
}
export function StatCard({ label, value, sub, icon, gradient = 'from-purple-500/20 to-indigo-500/20', trend }: StatCardProps) {
  return (
    <div className={`bg-linear-to-br ${gradient} border border-white/5 rounded-2xl p-5 flex flex-col gap-3`}>
      <div className="flex items-center justify-between">
        <span className="text-gray-400 text-sm">{label}</span>
        <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-purple-400">{icon}</div>
      </div>
      <div>
        <p className="text-white text-2xl font-bold">{value}</p>
        {sub && <p className="text-gray-500 text-xs mt-0.5">{sub}</p>}
      </div>
      {trend && (
        <span className={`text-xs font-medium ${trend.up ? 'text-green-400' : 'text-red-400'}`}>
          {trend.up ? '▲' : '▼'} {trend.value}
        </span>
      )}
    </div>
  );
}

// ── Page Header ───────────────────────────────────────────────────────────────
export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-white text-xl font-bold">{title}</h1>
        {subtitle && <p className="text-gray-500 text-sm mt-0.5">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

// ── Badge ─────────────────────────────────────────────────────────────────────
const badgeColors: Record<string, string> = {
  FREE: 'bg-gray-500/20 text-gray-300',
  PRO: 'bg-blue-500/20 text-blue-300',
  PREMIUM: 'bg-purple-500/20 text-purple-300',
  active: 'bg-green-500/20 text-green-300',
  suspended: 'bg-red-500/20 text-red-300',
  approved: 'bg-green-500/20 text-green-300',
  pending: 'bg-yellow-500/20 text-yellow-300',
  rejected: 'bg-red-500/20 text-red-300',
};
export function Badge({ label }: { label: string }) {
  const cls = badgeColors[label] ?? 'bg-white/10 text-gray-300';
  return <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${cls}`}>{label}</span>;
}

// ── Card ──────────────────────────────────────────────────────────────────────
export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`bg-[#0F172A] border border-white/5 rounded-2xl ${className}`}>{children}</div>
  );
}

// ── Section Card ──────────────────────────────────────────────────────────────
export function SectionCard({ title, children, action }: { title: string; children: ReactNode; action?: ReactNode }) {
  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/5">
        <h3 className="text-white font-semibold text-sm">{title}</h3>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </Card>
  );
}

// ── Table ─────────────────────────────────────────────────────────────────────
interface TableProps {
  columns: string[];
  rows: ReactNode[][];
  loading?: boolean;
  empty?: string;
}
export function Table({ columns, rows, loading, empty = 'No data found' }: TableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/5">
            {columns.map(c => (
              <th key={c} className="text-left text-gray-500 font-medium px-4 py-3 text-xs uppercase tracking-wide">{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={columns.length} className="text-center py-12"><Loader size={20} className="animate-spin text-purple-400 mx-auto" /></td></tr>
          ) : rows.length === 0 ? (
            <tr><td colSpan={columns.length} className="text-center py-12 text-gray-600">{empty}</td></tr>
          ) : (
            rows.map((row, i) => (
              <tr key={i} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                {row.map((cell, j) => (
                  <td key={j} className="px-4 py-3 text-gray-300">{cell}</td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

// ── Action Button ─────────────────────────────────────────────────────────────
export function ActionBtn({ label, onClick, variant = 'default' }: { label: string; onClick: () => void; variant?: 'default' | 'danger' | 'success' | 'ghost' }) {
  const cls = {
    default: 'bg-purple-600 hover:bg-purple-700 text-white',
    danger: 'bg-red-500/20 hover:bg-red-500/30 text-red-400',
    success: 'bg-green-500/20 hover:bg-green-500/30 text-green-400',
    ghost: 'bg-white/5 hover:bg-white/10 text-gray-300',
  }[variant];
  return (
    <button onClick={onClick} className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${cls}`}>{label}</button>
  );
}

// ── Input ─────────────────────────────────────────────────────────────────────
export function Input({ value, onChange, placeholder, type = 'text', className = '' }: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string; className?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className={`bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-gray-300 text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500/50 ${className}`}
    />
  );
}

// ── Page Wrapper ──────────────────────────────────────────────────────────────
export function AdminPage({ children }: { children: ReactNode }) {
  return <div className="h-screen overflow-y-auto p-6 bg-[#060B18]">{children}</div>;
}
