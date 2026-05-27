import React from 'react';

export const getEmployeeColumns = (setSelectedEmployee) => [
  {
    id: 'employee',
    accessorFn: row => row,
    header: 'Employee',
    cell: info => {
      const emp = info.getValue();
      return (
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-sm mr-3 overflow-hidden">
            {emp.profilePic ? <img src={emp.profilePic} alt="" className="w-full h-full object-cover" /> : emp.firstName?.charAt(0) || 'U'}
          </div>
          <div>
            <span className="block text-sm font-medium text-slate-700">{emp.firstName} {emp.lastName}</span>
            <span className="block text-xs text-slate-500">{emp.email}</span>
          </div>
        </div>
      );
    }
  },
  {
    accessorKey: 'mobileNumber',
    header: 'Contact',
    cell: info => <span className="text-sm text-slate-500">{info.getValue() || '-'}</span>
  },
  {
    id: 'profileStatus',
    accessorFn: row => row,
    header: 'Profile Status',
    cell: info => {
      const emp = info.getValue();
      const fields = ['firstName', 'lastName', 'mobileNumber', 'aadharNumber', 'panNumber', 'address', 'profilePic'];
      let filled = 0;
      fields.forEach(field => { if (emp[field]) filled++; });
      const completion = Math.round((filled / fields.length) * 100);

      return (
        <div className="flex items-center space-x-2">
          <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full ${completion === 100 ? 'bg-emerald-400' : 'bg-blue-400'}`}
              style={{ width: `${completion}%` }}
            ></div>
          </div>
          <span className="text-xs text-slate-500">{completion}%</span>
        </div>
      );
    }
  },
  {
    id: 'verification',
    accessorFn: row => row,
    header: () => <div className="text-right">Verification</div>,
    cell: info => {
      const emp = info.getValue();
      return (
        <div className="text-right">
          <button
            onClick={() => setSelectedEmployee(emp)}
            className="text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 px-3 py-1.5 rounded-lg transition-colors focus:opacity-100 font-medium text-sm"
          >
            View Profile
          </button>
        </div>
      );
    }
  }
];
