import React from 'react';
import { CheckCircle, Clock, XCircle } from 'lucide-react';

export const getInvitationColumns = (handleRevoke) => [
  {
    accessorKey: 'email',
    header: 'Recipient',
    cell: info => (
      <div className="flex items-center">
        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-medium text-sm mr-3">
          {info.getValue().charAt(0).toUpperCase()}
        </div>
        <span className="text-sm font-medium text-slate-700">{info.getValue()}</span>
      </div>
    )
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: info => {
      const status = info.getValue();
      return (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${status === 'accepted' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
          status === 'pending' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
            'bg-rose-500/10 text-rose-400 border-rose-500/20'
          }`}>
          {status === 'accepted' && <CheckCircle size={12} className="mr-1.5" />}
          {status === 'pending' && <Clock size={12} className="mr-1.5" />}
          {status === 'revoked' && <XCircle size={12} className="mr-1.5" />}
          <span className="capitalize">{status}</span>
        </span>
      );
    }
  },
  {
    accessorKey: 'createdAt',
    header: 'Sent Date',
    cell: info => <span className="text-sm text-slate-500">{new Date(info.getValue()).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
  },
  {
    id: 'actions',
    accessorFn: row => row,
    header: () => <div className="text-right">Actions</div>,
    cell: info => {
      const inv = info.getValue();
      return (
        <div className="text-right">
          {inv.status === 'pending' ? (
            <button
              onClick={() => handleRevoke(inv._id)}
              className="text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 px-3 py-1.5 rounded-lg transition-colors focus:opacity-100 font-medium text-sm"
            >
              Revoke
            </button>
          ) : (
            <span className="text-slate-600 font-medium text-sm">-</span>
          )}
        </div>
      );
    }
  }
];
