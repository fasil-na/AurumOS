import React from 'react';
import { Building2 } from 'lucide-react';

export const workspaceColumns = [
  {
    accessorKey: 'name',
    header: 'Workspace Name',
    cell: info => (
      <div className="flex items-center">
        <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold text-sm mr-3">
          <Building2 size={16} />
        </div>
        <span className="text-sm font-medium text-slate-700">{info.getValue()}</span>
      </div>
    )
  },
  {
    id: 'adminOwner',
    accessorFn: row => row.owner?.email || 'Unknown',
    header: 'Admin Owner',
    cell: info => <span className="text-sm text-slate-500">{info.getValue()}</span>
  },
  {
    accessorKey: 'createdAt',
    header: 'Created Date',
    cell: info => <span className="text-sm text-slate-500">{new Date(info.getValue()).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
  },
  {
    id: 'status',
    accessorFn: row => row,
    header: () => <div className="text-right">Status</div>,
    cell: () => (
      <div className="text-right">
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
          Active
        </span>
      </div>
    )
  }
];
