import React from 'react';
import { FileText } from 'lucide-react';

export const goldReceiptColumns = [
  {
    accessorKey: 'createdAt',
    header: 'Date',
    cell: info => <span className="text-slate-600 font-medium whitespace-nowrap">{new Date(info.getValue()).toLocaleString()}</span>
  },
  {
    accessorKey: 'transactionType',
    header: 'Type',
    cell: info => {
      const type = info.getValue() || 'Receive';
      return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
          type === 'Return' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
        }`}>
          {type}
        </span>
      );
    }
  },
  {
    accessorKey: 'source',
    header: 'Source',
    cell: info => {
      const source = info.getValue();
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-indigo-50 text-indigo-600 border border-indigo-100 whitespace-nowrap">
          {source && source.name ? source.name : (source || 'Unknown')}
        </span>
      );
    }
  },
  {
    id: 'receivedBy',
    accessorFn: row => `${row.receivedBy?.firstName || ''} ${row.receivedBy?.lastName || ''}`.trim(),
    header: 'Received By',
    cell: info => <span className="text-slate-600 whitespace-nowrap">{info.getValue()}</span>
  },
  {
    id: 'gold',
    accessorFn: row => row,
    header: () => <div className="text-right">Gold (g)</div>,
    cell: info => {
      const receipt = info.getValue();
      const isReturn = receipt.transactionType === 'Return';
      return (
        <div className={`text-right font-bold whitespace-nowrap ${isReturn ? 'text-rose-600' : 'text-emerald-600'}`}>
          {receipt.weightReceived > 0 ? (
            <>
              {isReturn ? '-' : '+'}{receipt.weightReceived}g
              {receipt.purity && <span className="text-xs text-slate-500 ml-1">({receipt.purity})</span>}
            </>
          ) : '-'}
        </div>
      );
    }
  },
  {
    accessorKey: 'notes',
    header: 'Notes',
    cell: info => {
      const notes = info.getValue();
      return notes ? (
        <div className="flex items-center gap-1.5" title={notes}>
          <FileText size={14} className="text-slate-400 flex-shrink-0" />
          <span className="truncate max-w-[150px] inline-block">{notes}</span>
        </div>
      ) : '-';
    }
  }
];

export const stoneReceiptColumns = [
  {
    accessorKey: 'createdAt',
    header: 'Date',
    cell: info => <span className="text-slate-600 font-medium whitespace-nowrap">{new Date(info.getValue()).toLocaleString()}</span>
  },
  {
    accessorKey: 'transactionType',
    header: 'Type',
    cell: info => {
      const type = info.getValue() || 'Receive';
      return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
          type === 'Return' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
        }`}>
          {type}
        </span>
      );
    }
  },
  {
    accessorKey: 'source',
    header: 'Source',
    cell: info => {
      const source = info.getValue();
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-indigo-50 text-indigo-600 border border-indigo-100 whitespace-nowrap">
          {source && source.name ? source.name : (source || 'Unknown')}
        </span>
      );
    }
  },
  {
    id: 'receivedBy',
    accessorFn: row => `${row.receivedBy?.firstName || ''} ${row.receivedBy?.lastName || ''}`.trim(),
    header: 'Received By',
    cell: info => <span className="text-slate-600 whitespace-nowrap">{info.getValue()}</span>
  },
  {
    id: 'stones',
    accessorFn: row => row,
    header: 'Stones',
    cell: info => {
      const receipt = info.getValue();
      const stones = receipt.stones;
      const isReturn = receipt.transactionType === 'Return';
      
      return stones && stones.length > 0 ? (
        <div className="flex flex-wrap gap-1 min-w-[120px]">
          {stones.map((st, i) => (
            <span key={i} className={`text-[10px] px-1.5 py-0.5 rounded border font-medium capitalize whitespace-nowrap ${
              isReturn ? 'bg-rose-50 text-rose-700 border-rose-100' : 'bg-indigo-50 text-indigo-700 border-indigo-100'
            }`}>
              {st.type}: {isReturn ? '-' : '+'}{st.quantity} {st.carats ? `(${st.carats}ct)` : ''}
            </span>
          ))}
        </div>
      ) : <span className="text-slate-300">-</span>;
    }
  },
  {
    accessorKey: 'notes',
    header: 'Notes',
    cell: info => {
      const notes = info.getValue();
      return notes ? (
        <div className="flex items-center gap-1.5" title={notes}>
          <FileText size={14} className="text-slate-400 flex-shrink-0" />
          <span className="truncate max-w-[150px] inline-block">{notes}</span>
        </div>
      ) : '-';
    }
  },
];
