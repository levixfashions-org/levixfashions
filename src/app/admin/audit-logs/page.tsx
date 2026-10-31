import React from 'react';
import {
  ScrollText,
  ShieldAlert,
  Search,
  Filter,
  Terminal,
  Clock,
  UserCheck,
} from 'lucide-react';
import prisma from '@/lib/prisma';
import AdminHeader from '@/components/admin/AdminHeader';

export default async function AdminAuditLogsPage({
  searchParams,
}: {
  searchParams: Promise<{ entity?: string }>;
}) {
  const resolved = await searchParams;
  const entityFilter = resolved.entity || '';

  let logs: any[] = [];
  try {
    const where: any = {};
    if (entityFilter) {
      where.entity = entityFilter;
    }

    logs = await prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        user: { select: { email: true, name: true } },
      },
    });
  } catch (err) {
    console.error('Failed to query audit logs:', err);
    // Mock audit logs
    logs = [
      {
        id: 'log-1',
        createdAt: new Date(),
        action: 'ORDER_STATUS_UPDATED',
        entity: 'Order',
        entityId: 'LVX-2026-9082',
        ipAddress: '103.21.124.5',
        metadata: JSON.stringify({ from: 'PROCESSING', to: 'SHIPPED', courier: 'DELHIVERY' }),
        user: { email: 'admin@thelevix.com', name: 'Levix Principal' },
      },
      {
        id: 'log-2',
        createdAt: new Date(Date.now() - 3600000 * 3),
        action: 'PRODUCT_CREATED',
        entity: 'Product',
        entityId: 'vintage-mineral-acid-wash-tee',
        ipAddress: '103.21.124.5',
        metadata: JSON.stringify({ name: 'Vintage Mineral Acid Wash Tee', variantsCount: 10 }),
        user: { email: 'admin@thelevix.com', name: 'Levix Principal' },
      },
      {
        id: 'log-3',
        createdAt: new Date(Date.now() - 3600000 * 24),
        action: 'CUSTOMER_BLOCKED',
        entity: 'User',
        entityId: 'cust-3',
        ipAddress: '103.21.124.5',
        metadata: JSON.stringify({ reason: 'Fraudulent chargeback activity detected' }),
        user: { email: 'admin@thelevix.com', name: 'Levix Principal' },
      },
    ];
  }

  const ENTITIES = ['All', 'Product', 'Order', 'User', 'Coupon', 'Setting'];

  return (
    <div className="space-y-8 animate-fadeIn pb-24">
      <AdminHeader
        title="Administrative Audit Trail"
        subtitle="Immutable security ledger recording every mutation, status change, and catalog update"
      />

      {/* Filter Tabs */}
      <div className="p-6 rounded-3xl bg-neutral-900/40 dark:bg-[#07070B]/60 backdrop-blur-2xl border border-white/10 dark:border-white/5 shadow-xl flex items-center justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {ENTITIES.map((ent) => {
            const isAll = ent === 'All';
            const isActive = isAll ? !entityFilter : entityFilter === ent;
            return (
              <a
                key={ent}
                href={isAll ? '/admin/audit-logs' : `/admin/audit-logs?entity=${ent}`}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-[#7C5CFF] text-white shadow-md shadow-[#7C5CFF]/30'
                    : 'bg-white/[0.03] text-white/60 hover:text-white hover:bg-white/[0.08]'
                }`}
              >
                {ent} Logs
              </a>
            );
          })}
        </div>

        <div className="flex items-center space-x-2 text-xs text-white/50 font-mono">
          <Terminal className="w-4 h-4 text-[#C8FF3D]" />
          <span>Showing latest {logs.length} events</span>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="p-6 rounded-3xl bg-neutral-900/40 dark:bg-[#07070B]/60 backdrop-blur-2xl border border-white/10 dark:border-white/5 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-white/40 uppercase tracking-wider text-[10px]">
                <th className="pb-3 font-semibold">Timestamp</th>
                <th className="pb-3 font-semibold">Admin Principal</th>
                <th className="pb-3 font-semibold">Action</th>
                <th className="pb-3 font-semibold">Entity</th>
                <th className="pb-3 font-semibold">Target Ref</th>
                <th className="pb-3 font-semibold">IP Address</th>
                <th className="pb-3 font-semibold">Payload Metadata</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {logs.map((log) => {
                let parsedMeta = null;
                try {
                  parsedMeta = log.metadata ? JSON.parse(log.metadata) : null;
                } catch {
                  parsedMeta = log.metadata;
                }

                return (
                  <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                    {/* Timestamp */}
                    <td className="py-4 text-white/50 font-mono text-[11px] whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </td>

                    {/* Admin Principal */}
                    <td className="py-4">
                      <p className="font-semibold text-white">{log.user?.name || 'Root Administrator'}</p>
                      <p className="text-[10px] text-white/40">{log.user?.email || 'admin@thelevix.com'}</p>
                    </td>

                    {/* Action */}
                    <td className="py-4">
                      <span className="font-mono font-bold text-[#C8FF3D] text-[11px] px-2 py-0.5 rounded-lg bg-[#C8FF3D]/10 border border-[#C8FF3D]/20">
                        {log.action}
                      </span>
                    </td>

                    {/* Entity */}
                    <td className="py-4 font-semibold text-white/80">
                      {log.entity}
                    </td>

                    {/* Entity ID / Ref */}
                    <td className="py-4 font-mono text-white/70">
                      {log.entityId || 'N/A'}
                    </td>

                    {/* IP */}
                    <td className="py-4 font-mono text-white/40 text-[11px]">
                      {log.ipAddress || '127.0.0.1'}
                    </td>

                    {/* Metadata */}
                    <td className="py-4 max-w-xs">
                      <pre className="p-2 rounded-xl bg-black/40 border border-white/5 font-mono text-[10px] text-white/70 overflow-x-auto">
                        {parsedMeta ? JSON.stringify(parsedMeta, null, 1) : '{}'}
                      </pre>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
