'use client';

import { useEffect, useMemo, useState } from 'react';
import { Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis } from 'recharts';
import {
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  Heart,
  KeyRound,
  Lock,
  LogOut,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { event } from '@/config/event';
import {
  AuthError,
  clearAuthToken,
  deleteRsvp,
  exportCsv,
  getRsvps,
  getStats,
  isAuthenticated,
  loginAdmin,
  type Rsvp,
  type DashboardStats,
} from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const formatRelative = (dateString: string): string => {
  const seconds = Math.max(1, Math.floor((Date.now() - new Date(dateString).getTime()) / 1000));
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
};

const formatExact = (dateString: string): string =>
  new Date(dateString).toLocaleString('en-IN', { dateStyle: 'long', timeStyle: 'short' });

const initials = (name: string): string =>
  name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

const normalizedName = (name: string): string => name.trim().replace(/\s+/g, ' ').toLowerCase();

function StatusPill({ attending }: { attending: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[.1em] ${
        attending ? 'bg-[#e0eadc] text-green' : 'bg-[#f2ded9] text-rose'
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${attending ? 'bg-[#6b9c62]' : 'bg-rose'}`} />
      {attending ? 'Attending' : "Can't make it"}
    </span>
  );
}

export function DashboardHeader({
  onRefresh,
  refreshing,
  onLogout,
}: {
  onRefresh: () => void;
  refreshing: boolean;
  onLogout: () => void;
}) {
  return (
    <header className="relative overflow-hidden bg-green text-cream shadow-float">
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            'radial-gradient(circle at 82% 25%, #d4b877 0 1px, transparent 1px), radial-gradient(circle at 88% 70%, #d4b877 0 1px, transparent 1px)',
          backgroundSize: '22px 22px',
        }}
      />
      <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-4 px-4 py-4 sm:px-8 sm:py-5 lg:px-12">
        <div className="relative min-w-0">
          <p className="mb-0.5 text-[9px] font-semibold uppercase tracking-[.3em] text-[#d6b970]">
            RSVP dashboard
          </p>
          <div className="truncate font-serif text-[22px] leading-tight sm:text-[32px]">
            {event.firstName} <span className="text-gold">&</span> {event.secondName}
          </div>
          <p className="mt-1 flex items-center gap-1.5 text-[10px] uppercase tracking-[.18em] text-cream/70 sm:mt-2 sm:gap-2">
            <CalendarDays className="h-3 w-3 shrink-0 text-gold" />
            <span className="truncate">{event.shortDate} · {event.place}</span>
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-4">
          <div className="hidden text-right sm:block">
            <div className="mb-0.5 flex items-center justify-end gap-1.5 text-[10px] uppercase tracking-[.14em] text-cream/80">
              <span className="h-2 w-2 animate-soft-pulse rounded-full bg-[#a7cf88]" />
              Live · Connected
            </div>
            <p className="text-[10px] text-cream/45">MongoDB Atlas</p>
          </div>

          <Button
            onClick={onRefresh}
            aria-label="Refresh replies"
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full border border-cream/20 text-cream transition-transform active:scale-95 hover:bg-cream/10 hover:text-cream sm:h-10 sm:w-10"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>

          <Button
            onClick={onLogout}
            aria-label="Lock dashboard"
            title="Lock dashboard"
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full border border-cream/20 text-cream transition-transform active:scale-95 hover:bg-cream/10 hover:text-cream sm:h-10 sm:w-10"
          >
            <Lock className="h-4 w-4 text-gold" />
          </Button>
        </div>
      </div>
    </header>
  );
}

export function StatCard({
  label,
  value,
  caption,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  caption: string;
  icon: typeof Users;
}) {
  return (
    <article className="animate-rise-in rounded-[18px] border border-gold/45 bg-cream p-4 shadow-card transition-all duration-200 hover:-translate-y-0.5 sm:rounded-[20px] sm:p-5">
      <div className="mb-3 flex items-start justify-between sm:mb-6">
        <p className="text-[9px] font-semibold uppercase tracking-[.18em] text-gold sm:text-[10px]">
          {label}
        </p>
        <Icon className="h-4 w-4 text-gold/75" />
      </div>
      <p className="font-serif text-[32px] leading-none text-green sm:text-[42px]">{value}</p>
      <p className="mt-1.5 truncate text-[10px] text-ink/60 sm:mt-2 sm:text-[11px]">{caption}</p>
    </article>
  );
}

export function RepliesChart({ data }: { data: { day: string; replies: number }[] }) {
  const chartData = data.length > 0 ? data : [{ day: 'Today', replies: 0 }];

  return (
    <article className="rounded-[18px] border border-gold/40 bg-cream p-4 shadow-card sm:rounded-[20px] sm:p-6">
      <div className="mb-4 flex items-start justify-between sm:mb-5">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[.19em] text-gold">Activity</p>
          <h2 className="mt-1 font-serif text-[22px] text-green sm:text-[27px]">Replies over time</h2>
        </div>
        <span className="rounded-full bg-[#e4ebdf] px-2.5 py-1 text-[10px] font-medium text-green">
          Live timeline
        </span>
      </div>
      <div className="h-[200px] w-full sm:h-[230px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 8, right: 6, left: -24, bottom: 0 }}>
            <defs>
              <linearGradient id="replyFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6b7c4f" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#6b7c4f" stopOpacity={0.03} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#d7cbaa" strokeDasharray="3 5" vertical={false} />
            <XAxis dataKey="day" tick={{ fill: '#68736a', fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{
                border: '1px solid #b08a45',
                borderRadius: 12,
                background: '#f5efe0',
                color: '#22302a',
                fontSize: 11,
              }}
              cursor={{ stroke: '#b08a45', strokeDasharray: '4 4' }}
            />
            <Area
              type="monotone"
              dataKey="replies"
              stroke="#2e4a3b"
              strokeWidth={2.5}
              fill="url(#replyFill)"
              activeDot={{ r: 5, fill: '#b08a45', stroke: '#f5efe0', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </article>
  );
}

export function AttendanceDonut({
  attending,
  declined,
  people,
}: {
  attending: number;
  declined: number;
  people: number;
}) {
  const data = [
    { name: 'Attending', value: attending || (declined === 0 ? 1 : 0), color: '#2e4a3b' },
    { name: "Can't make it", value: declined, color: '#b4584e' },
  ];

  return (
    <article className="rounded-[18px] border border-gold/40 bg-cream p-4 shadow-card sm:rounded-[20px] sm:p-6">
      <div className="mb-2">
        <p className="text-[10px] font-semibold uppercase tracking-[.19em] text-gold">Response mix</p>
        <h2 className="mt-1 font-serif text-[22px] text-green sm:text-[27px]">Attending vs declined</h2>
      </div>
      <div className="relative mx-auto h-[180px] max-w-[260px] sm:h-[210px] sm:max-w-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={56}
              outerRadius={78}
              paddingAngle={3}
              stroke="none"
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="font-serif text-[32px] leading-none text-green sm:text-[38px]">{people}</span>
          <span className="mt-1 text-[9px] uppercase tracking-[.16em] text-ink/55">headcount</span>
        </div>
      </div>
      <div className="mx-auto flex max-w-[280px] justify-center gap-5 text-[11px] text-ink/70">
        <span className="flex items-center gap-1.5">
          <i className="h-2 w-2 rounded-full bg-green" />
          {attending} attending
        </span>
        <span className="flex items-center gap-1.5">
          <i className="h-2 w-2 rounded-full bg-rose" />
          {declined} declined
        </span>
      </div>
    </article>
  );
}

export function GuestToolbar({
  search,
  setSearch,
  filter,
  setFilter,
  sort,
  setSort,
  counts,
  onExport,
  isExporting,
}: {
  search: string;
  setSearch: (value: string) => void;
  filter: string;
  setFilter: (value: string) => void;
  sort: string;
  setSort: (value: string) => void;
  counts: { all: number; attending: number; declined: number };
  onExport: () => void;
  isExporting: boolean;
}) {
  return (
    <div className="space-y-4 border-b border-gold/20 pb-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40" />
          <Input
            aria-label="Search replies"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search names or blessings..."
            className="h-11 rounded-xl border-green/15 bg-[#fbf7ec] pl-9 text-xs focus-visible:ring-gold sm:h-10"
          />
        </div>
        <div className="flex gap-2">
          <select
            aria-label="Sort replies"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="h-11 flex-1 rounded-xl border border-green/15 bg-[#fbf7ec] px-3 text-[11px] text-ink outline-none transition focus:border-gold sm:h-10 sm:flex-initial"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="name">Name A to Z</option>
            <option value="guests">Most guests</option>
          </select>
          <Button
            onClick={onExport}
            disabled={isExporting}
            variant="outline"
            className="h-11 flex-1 rounded-xl border-green/20 bg-transparent px-3 text-[11px] text-green transition active:scale-98 hover:bg-green hover:text-cream sm:h-10 sm:flex-initial"
          >
            <Download className="mr-1.5 h-3.5 w-3.5" />
            {isExporting ? 'Exporting...' : 'Export CSV'}
          </Button>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {[
          ['all', 'All', counts.all],
          ['attending', 'Attending', counts.attending],
          ['declined', "Can't make it", counts.declined],
        ].map(([key, label, count]) => (
          <button
            key={String(key)}
            onClick={() => setFilter(String(key))}
            className={`rounded-full border px-3.5 py-1.5 text-[10px] font-semibold transition-all active:scale-95 ${
              filter === key
                ? 'border-green bg-green text-cream shadow-sm'
                : 'border-green/15 bg-transparent text-ink/65 hover:border-gold hover:text-green'
            }`}
          >
            {label} <span className="ml-1 opacity-65">{count}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function DuplicateBadge() {
  return (
    <Badge className="border-gold/35 bg-[#f2e7ca] text-[9px] font-semibold uppercase tracking-[.08em] text-[#896b32] hover:bg-[#f2e7ca]">
      Possible duplicate
    </Badge>
  );
}

export function GuestTable({
  rows,
  duplicateIds,
  newIds,
  onSelect,
  onDelete,
}: {
  rows: Rsvp[];
  duplicateIds: Set<string>;
  newIds: Set<string>;
  onSelect: (rsvp: Rsvp) => void;
  onDelete: (rsvp: Rsvp) => void;
}) {
  return (
    <div className="hidden overflow-x-auto md:block">
      <table className="w-full min-w-[720px] text-left">
        <thead>
          <tr className="border-b border-gold/20 text-[10px] uppercase tracking-[.13em] text-ink/45">
            <th className="pb-3 pl-2 font-semibold">Guest</th>
            <th className="pb-3 font-semibold">Status</th>
            <th className="pb-3 font-semibold">Guests</th>
            <th className="pb-3 font-semibold">Message</th>
            <th className="pb-3 font-semibold">Received</th>
            <th className="pb-3 pr-2 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((rsvp) => (
            <tr
              key={rsvp.id}
              onClick={() => onSelect(rsvp)}
              className={`group cursor-pointer border-b border-gold/10 transition-colors hover:bg-[#eee7d5]/70 last:border-0 ${
                newIds.has(rsvp.id) ? 'new-row' : ''
              }`}
            >
              <td className="py-4 pl-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#dce6d9] font-serif text-sm font-semibold text-green">
                    {initials(rsvp.name)}
                  </div>
                  <div>
                    <p className="font-semibold text-ink">{rsvp.name.trim()}</p>
                    {duplicateIds.has(rsvp.id) && <DuplicateBadge />}
                  </div>
                </div>
              </td>
              <td>
                <StatusPill attending={rsvp.attending} />
              </td>
              <td className="font-semibold text-green">{rsvp.guests || '—'}</td>
              <td className="max-w-[240px] truncate text-xs text-ink/65">
                {rsvp.message || 'No message'}
              </td>
              <td className="text-xs text-ink/55" title={formatExact(rsvp.createdAt)}>
                {formatRelative(rsvp.createdAt)}
              </td>
              <td className="pr-2 text-right">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(rsvp);
                  }}
                  aria-label={`Delete ${rsvp.name.trim()}`}
                  className="rounded-lg p-2 text-ink/35 opacity-0 transition-opacity hover:bg-[#f2ded9] hover:text-rose group-hover:opacity-100"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function GuestCard({
  rsvp,
  duplicate,
  onSelect,
  onDelete,
}: {
  rsvp: Rsvp;
  duplicate: boolean;
  onSelect: (rsvp: Rsvp) => void;
  onDelete: (rsvp: Rsvp) => void;
}) {
  return (
    <article
      onClick={() => onSelect(rsvp)}
      className="cursor-pointer rounded-2xl border border-gold/25 bg-[#fbf7ec] p-4 transition-all duration-150 active:scale-[0.99] hover:border-gold/60 hover:shadow-card md:hidden"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#dce6d9] font-serif text-sm font-semibold text-green">
            {initials(rsvp.name)}
          </div>
          <div>
            <p className="font-semibold text-ink leading-snug">{rsvp.name.trim()}</p>
            <p className="mt-0.5 text-[10px] text-ink/50">{formatRelative(rsvp.createdAt)}</p>
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(rsvp);
          }}
          aria-label={`Delete ${rsvp.name.trim()}`}
          className="rounded-lg p-2.5 text-ink/40 transition hover:bg-[#f2ded9] hover:text-rose active:scale-95"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <StatusPill attending={rsvp.attending} />
        <span className="text-xs font-medium text-ink/65">
          {rsvp.guests ? `${rsvp.guests} ${rsvp.guests === 1 ? 'guest' : 'guests'}` : 'No guests'}
        </span>
        {duplicate && <DuplicateBadge />}
      </div>
      {rsvp.message && (
        <p className="mt-3 line-clamp-2 rounded-xl bg-cream/70 p-2.5 font-serif text-sm italic text-ink/75">
          “{rsvp.message}”
        </p>
      )}
    </article>
  );
}

export function GuestDrawer({
  rsvp,
  duplicate,
  open,
  onOpenChange,
  onDelete,
}: {
  rsvp: Rsvp | null;
  duplicate: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: (rsvp: Rsvp) => void;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto border-gold/20 bg-cream p-6 sm:max-w-md">
        <SheetHeader className="text-left">
          <p className="text-[10px] font-semibold uppercase tracking-[.2em] text-gold">Full reply</p>
          <SheetTitle className="font-serif text-[28px] font-medium leading-tight text-green sm:text-[34px]">
            {rsvp?.name.trim()}
          </SheetTitle>
          <SheetDescription className="sr-only">Full RSVP details</SheetDescription>
        </SheetHeader>
        {rsvp && (
          <div className="mt-6 space-y-6 sm:mt-8 sm:space-y-7">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#dce6d9] font-serif text-xl font-semibold text-green sm:h-16 sm:w-16 sm:text-2xl">
                {initials(rsvp.name)}
              </div>
              <div>
                <StatusPill attending={rsvp.attending} />
                <p className="mt-1.5 text-xs text-ink/55">Received {formatRelative(rsvp.createdAt)}</p>
              </div>
            </div>

            {duplicate && (
              <div className="flex items-center gap-2 rounded-xl border border-gold/30 bg-[#f2e7ca] px-3 py-2.5">
                <Sparkles className="h-4 w-4 shrink-0 text-gold" />
                <span className="text-xs text-[#896b32]">This guest name appears multiple times.</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-gold/25 bg-[#fbf7ec] p-4">
                <p className="text-[9px] uppercase tracking-[.17em] text-gold">Party size</p>
                <p className="mt-1 font-serif text-2xl text-green sm:text-3xl">{rsvp.guests || '—'}</p>
                <p className="text-xs text-ink/50">
                  {rsvp.attending ? 'people attending' : 'guests'}
                </p>
              </div>
              <div className="rounded-2xl border border-gold/25 bg-[#fbf7ec] p-4">
                <p className="text-[9px] uppercase tracking-[.17em] text-gold">Received</p>
                <p className="mt-1 font-serif text-base text-green sm:text-lg">
                  {new Date(rsvp.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                  })}
                </p>
                <p className="text-xs text-ink/50">
                  {new Date(rsvp.createdAt).toLocaleTimeString('en-IN', {
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>

            <div>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[.19em] text-gold">
                Their message
              </p>
              <div className="relative rounded-2xl bg-green p-4 text-cream sm:p-5">
                <span className="absolute -left-1 -top-4 font-serif text-5xl leading-none text-gold sm:text-6xl sm:-top-5">
                  “
                </span>
                <p className="font-serif text-lg italic leading-relaxed sm:text-xl">
                  {rsvp.message || 'No message was left with this reply.'}
                </p>
              </div>
            </div>

            <p className="text-xs text-ink/50">{formatExact(rsvp.createdAt)}</p>

            <Button
              onClick={() => onDelete(rsvp)}
              variant="outline"
              className="h-11 w-full rounded-xl border-rose/35 text-rose transition active:scale-98 hover:bg-rose hover:text-cream"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete reply
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

export function DeleteDialog({
  rsvp,
  open,
  onOpenChange,
  onConfirm,
}: {
  rsvp: Rsvp | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md rounded-2xl border-gold/30 bg-cream p-6">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-serif text-2xl font-medium text-green">
            Delete this reply?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-xs leading-relaxed text-ink/70">
            This cannot be undone. The reply from{' '}
            <strong className="text-ink">{rsvp?.name.trim()}</strong> will be permanently removed
            from your database.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-4 gap-2 sm:gap-0">
          <AlertDialogCancel className="h-10 rounded-xl border-green/20 bg-transparent text-xs">
            Keep reply
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="h-10 rounded-xl bg-rose text-xs text-cream hover:bg-[#98473f]"
          >
            Delete reply
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function AdminLoginCard({ onLoginSuccess }: { onLoginSuccess: () => void }) {
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return setError('Please enter your admin password.');
    setLoading(true);
    setError('');

    const res = await loginAdmin(password.trim());
    setLoading(false);

    if (res.success) {
      toast.success('Welcome to RSVP Dashboard!');
      onLoginSuccess();
    } else {
      setError(res.message || 'Incorrect admin password.');
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm animate-rise-in rounded-3xl border border-gold/45 bg-cream p-7 text-center shadow-float sm:p-9">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-gold/30 bg-[#e4ebdf] text-green">
          <ShieldCheck className="h-7 w-7 text-green" />
        </div>
        <p className="text-[10px] font-semibold uppercase tracking-[.28em] text-gold">
          Protected Area
        </p>
        <h1 className="mt-2 font-serif text-3xl font-normal text-green">Unlock Dashboard</h1>
        <p className="mt-2 text-xs leading-relaxed text-ink/60">
          Enter your admin password to view live wedding RSVPs & headcount.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 text-left">
          <label
            htmlFor="adminPass"
            className="block text-[10px] font-semibold uppercase tracking-[.2em] text-green"
          >
            Admin Password
          </label>
          <div className="relative mt-2">
            <Input
              id="adminPass"
              type="password"
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password..."
              className="h-11 rounded-xl border-green/20 bg-[#fbf7ec] pl-4 pr-10 text-sm focus-visible:ring-gold"
            />
            <KeyRound className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/35" />
          </div>

          {error && <p className="mt-2 text-xs text-rose">{error}</p>}

          <Button
            type="submit"
            disabled={loading}
            className="mt-5 h-11 w-full rounded-xl bg-green text-xs font-semibold uppercase tracking-[.2em] text-cream shadow-md transition active:scale-98 hover:bg-green/90"
          >
            {loading ? 'Unlocking...' : 'Unlock Dashboard'}
          </Button>

          <p className="mt-4 text-center text-[10px] text-ink/40">
            Default initial password: <span className="font-mono text-gold">admin123</span>
          </p>
        </form>
      </div>
    </div>
  );
}

export function EmptyState({ filtered }: { filtered: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-4 rounded-full bg-[#e4ebdf] p-4 text-olive">
        {filtered ? <Search className="h-6 w-6" /> : <Heart className="h-6 w-6" />}
      </div>
      <h3 className="font-serif text-2xl text-green">
        {filtered ? 'No replies match your search' : 'No replies yet'}
      </h3>
      <p className="mt-2 max-w-xs text-xs leading-relaxed text-ink/50">
        {filtered
          ? 'Try another guest name, blessing text, or clear the status filter.'
          : 'Replies will automatically appear here as guests mark their attendance.'}
      </p>
    </div>
  );
}

export default function Dashboard() {
  const [authed, setAuthed] = useState<boolean>(false);
  const [rsvps, setRsvps] = useState<Rsvp[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    peopleAttending: 0,
    replies: 0,
    declined: 0,
    averagePartySize: 0,
    repliesByDay: [],
  });
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState(false);
  const [selected, setSelected] = useState<Rsvp | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Rsvp | null>(null);
  const [newIds, setNewIds] = useState<Set<string>>(new Set());

  // Check initial login state
  useEffect(() => {
    setAuthed(isAuthenticated());
  }, []);

  const load = async (initial = false) => {
    if (initial) setLoading(true);
    else setRefreshing(true);
    setError(false);

    try {
      const nextRsvps = await getRsvps();
      const nextStats = await getStats(nextRsvps);

      setRsvps((previous) => {
        const previousIds = new Set(previous.map((r) => r.id));
        setNewIds(new Set(nextRsvps.filter((r) => !previousIds.has(r.id)).map((r) => r.id)));
        return nextRsvps;
      });
      setStats(nextStats);
    } catch (err: unknown) {
      if (err instanceof AuthError) {
        setAuthed(false);
      } else {
        setError(true);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (authed) {
      void load(true);
      const interval = window.setInterval(() => {
        if (!deleteTarget) void load();
      }, 12000);
      return () => window.clearInterval(interval);
    }
  }, [authed, deleteTarget]);

  useEffect(() => {
    setPage(1);
  }, [search, filter, sort]);

  const duplicateIds = useMemo(() => {
    const grouped = new Map<string, string[]>();
    rsvps.forEach((r) =>
      grouped.set(normalizedName(r.name), [...(grouped.get(normalizedName(r.name)) ?? []), r.id])
    );
    return new Set(Array.from(grouped.values()).filter((ids) => ids.length > 1).flat());
  }, [rsvps]);

  const filteredRows = useMemo(() => {
    const value = search.trim().toLowerCase();
    const filtered = rsvps.filter(
      (r) =>
        (!value || r.name.toLowerCase().includes(value) || r.message?.toLowerCase().includes(value)) &&
        (filter === 'all' || (filter === 'attending' ? r.attending : !r.attending))
    );
    return [...filtered].sort((a, b) =>
      sort === 'oldest'
        ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        : sort === 'name'
        ? a.name.localeCompare(b.name)
        : sort === 'guests'
        ? b.guests - a.guests
        : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [rsvps, search, filter, sort]);

  const pageCount = Math.max(1, Math.ceil(filteredRows.length / 10));
  const pageRows = filteredRows.slice((page - 1) * 10, page * 10);
  const counts = {
    all: rsvps.length,
    attending: rsvps.filter((r) => r.attending).length,
    declined: rsvps.filter((r) => !r.attending).length,
  };

  const handleManualRefresh = async () => {
    await load(false);
    toast.success('Replies refreshed', { description: 'Latest responses loaded from MongoDB Atlas.' });
  };

  const handleLogout = () => {
    clearAuthToken();
    setAuthed(false);
    toast('Dashboard locked');
  };

  const handleExportCsv = async () => {
    setIsExporting(true);
    try {
      await exportCsv();
      toast.success('CSV Downloaded', { description: 'Wedding RSVP list saved as spreadsheet.' });
    } catch (err: unknown) {
      toast.error('Export failed', {
        description: err instanceof Error ? err.message : 'Please check your connection.',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const requestDelete = (rsvp: Rsvp) => {
    setSelected(null);
    setDeleteTarget(rsvp);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteRsvp(deleteTarget.id);
      setRsvps((current) => current.filter((r) => r.id !== deleteTarget.id));
      toast.success('Reply deleted', {
        description: `${deleteTarget.name.trim()} was removed from the list.`,
      });
      const nextStats = await getStats(rsvps.filter((r) => r.id !== deleteTarget.id));
      setStats(nextStats);
    } catch (err: unknown) {
      toast.error('Failed to delete', {
        description: err instanceof Error ? err.message : 'Please try again.',
      });
    } finally {
      setDeleteTarget(null);
    }
  };

  if (!authed) {
    return (
      <div className="min-h-screen bg-cream">
        <AdminLoginCard onLoginSuccess={() => setAuthed(true)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream selection:bg-gold/20">
      <DashboardHeader
        onRefresh={handleManualRefresh}
        refreshing={refreshing}
        onLogout={handleLogout}
      />

      <main className="mx-auto max-w-[1280px] px-4 py-6 sm:px-8 sm:py-9 lg:px-12">
        <div className="mb-6 flex items-end justify-between sm:mb-8">
          <div>
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-[.23em] text-gold sm:mb-2">
              A warm welcome awaits
            </p>
            <h1 className="font-serif text-[30px] leading-tight text-green sm:text-[42px]">
              Guest replies
            </h1>
          </div>
          <div className="hidden items-center gap-2 text-right sm:flex">
            <FileText className="h-5 w-5 text-gold" />
            <p className="text-[11px] leading-tight text-ink/50">
              Live RSVP snapshot
              <br />
              Palakkad ceremony
            </p>
          </div>
        </div>

        {error ? (
          <div className="rounded-2xl border border-rose/30 bg-[#f2ded9] p-6 text-center">
            <p className="font-serif text-2xl text-rose">Unable to load replies from backend.</p>
            <p className="mt-1 text-xs text-ink/60">
              Please ensure your RSVP backend is running on port 5000.
            </p>
            <Button
              onClick={() => void load(true)}
              className="mt-4 rounded-xl bg-rose text-cream transition active:scale-95 hover:bg-[#98473f]"
            >
              Try again
            </Button>
          </div>
        ) : (
          <>
            {loading ? (
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <div className="col-span-2 h-36 animate-pulse rounded-[20px] bg-[#e8dfca] sm:h-40 lg:col-span-1" />
                <div className="h-36 animate-pulse rounded-[20px] bg-[#e8dfca] sm:h-40" />
                <div className="h-36 animate-pulse rounded-[20px] bg-[#e8dfca] sm:h-40" />
                <div className="h-36 animate-pulse rounded-[20px] bg-[#e8dfca] sm:h-40" />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <StatCard
                  label="People attending"
                  value={stats.peopleAttending}
                  caption={`across ${counts.attending} attending`}
                  icon={Users}
                />
                <StatCard
                  label="Replies"
                  value={stats.replies}
                  caption="total responses in database"
                  icon={Check}
                />
                <StatCard
                  label="Can't make it"
                  value={stats.declined}
                  caption="with love from afar"
                  icon={X}
                />
                <StatCard
                  label="Average party size"
                  value={stats.averagePartySize.toFixed(1)}
                  caption="guests per attending response"
                  icon={Sparkles}
                />
              </div>
            )}

            <div className="mt-5 grid gap-4 sm:gap-5 lg:grid-cols-[1.4fr_1fr]">
              <RepliesChart data={stats.repliesByDay} />
              <AttendanceDonut
                attending={counts.attending}
                declined={counts.declined}
                people={stats.peopleAttending}
              />
            </div>

            <section className="mt-5 rounded-[18px] border border-gold/40 bg-cream p-4 shadow-card sm:rounded-[20px] sm:p-6">
              <div className="mb-4 flex flex-col gap-2 sm:mb-5 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[.19em] text-gold">
                    Your people
                  </p>
                  <h2 className="mt-1 font-serif text-[24px] text-green sm:text-[27px]">
                    All replies{' '}
                    <span className="font-sans text-xs text-ink/45">
                      · {filteredRows.length} {filteredRows.length === 1 ? 'reply' : 'replies'}
                    </span>
                  </h2>
                </div>
                <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-[.12em] text-ink/45">
                  <span className="h-2 w-2 rounded-full bg-[#a7cf88]" />
                  Auto-syncing (12s)
                </span>
              </div>

              <GuestToolbar
                search={search}
                setSearch={setSearch}
                filter={filter}
                setFilter={setFilter}
                sort={sort}
                setSort={setSort}
                counts={counts}
                onExport={handleExportCsv}
                isExporting={isExporting}
              />

              {pageRows.length ? (
                <>
                  <div className="mt-4 space-y-3 md:hidden">
                    {pageRows.map((rsvp) => (
                      <GuestCard
                        key={rsvp.id}
                        rsvp={rsvp}
                        duplicate={duplicateIds.has(rsvp.id)}
                        onSelect={setSelected}
                        onDelete={requestDelete}
                      />
                    ))}
                  </div>

                  <div className="mt-4">
                    <GuestTable
                      rows={pageRows}
                      duplicateIds={duplicateIds}
                      newIds={newIds}
                      onSelect={setSelected}
                      onDelete={requestDelete}
                    />
                  </div>

                  <div className="mt-5 flex items-center justify-between border-t border-gold/15 pt-4">
                    <p className="text-[11px] text-ink/55">
                      Showing {Math.min((page - 1) * 10 + 1, filteredRows.length)} to{' '}
                      {Math.min(page * 10, filteredRows.length)} of {filteredRows.length}
                    </p>
                    <div className="flex gap-1.5 sm:gap-2">
                      <Button
                        onClick={() => setPage((current) => Math.max(1, current - 1))}
                        disabled={page === 1}
                        variant="outline"
                        size="icon"
                        aria-label="Previous page"
                        className="h-8 w-8 rounded-lg border-green/20"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() => setPage((current) => Math.min(pageCount, current + 1))}
                        disabled={page === pageCount}
                        variant="outline"
                        size="icon"
                        aria-label="Next page"
                        className="h-8 w-8 rounded-lg border-green/20"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <EmptyState filtered={Boolean(search || filter !== 'all')} />
              )}
            </section>
          </>
        )}
      </main>

      <footer className="pb-8 pt-3 text-center text-[10px] font-semibold uppercase tracking-[.22em] text-gold">
        {event.shortDate} · {event.place}
      </footer>

      <GuestDrawer
        rsvp={selected}
        duplicate={Boolean(selected && duplicateIds.has(selected.id))}
        open={Boolean(selected)}
        onOpenChange={(open) => !open && setSelected(null)}
        onDelete={requestDelete}
      />

      <DeleteDialog
        rsvp={deleteTarget}
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={() => void confirmDelete()}
      />
    </div>
  );
}
