const fs = require('fs');
const path = require('path');

const filesToUpdate = [
  '/Users/fasil/Desktop/AurumOS/client/src/components/Shared/SidebarLayout.jsx',
  '/Users/fasil/Desktop/AurumOS/client/src/components/Dashboard/AdminDashboard.jsx',
  '/Users/fasil/Desktop/AurumOS/client/src/components/Dashboard/EmployeeDashboard.jsx',
  '/Users/fasil/Desktop/AurumOS/client/src/components/Dashboard/SuperAdminDashboard.jsx',
];

const classMap = {
  // Backgrounds
  'bg-slate-900': 'bg-slate-50',
  'bg-slate-800/80': 'bg-white/90',
  'bg-slate-800/60': 'bg-white/80',
  'bg-slate-800/50': 'bg-white/70',
  'bg-slate-800/40': 'bg-white/60',
  'bg-slate-800': 'bg-white',
  'bg-slate-900/50': 'bg-slate-50',
  'bg-slate-900/30': 'bg-slate-50',
  'bg-slate-700/50': 'bg-slate-100',
  'bg-slate-700/30': 'bg-slate-100',
  'bg-slate-700/20': 'bg-slate-50',
  'bg-slate-700': 'bg-slate-200',
  
  // Text
  'text-slate-100': 'text-slate-800',
  'text-white': 'text-slate-800',
  'text-slate-200': 'text-slate-700',
  'text-slate-300': 'text-slate-600',
  'text-slate-400': 'text-slate-500',
  'text-slate-500': 'text-slate-500',
  
  // Borders
  'border-slate-700/50': 'border-slate-200',
  'border-slate-600/50': 'border-slate-200',
  'border-slate-600': 'border-slate-300',
  'border-slate-700': 'border-slate-200',
  
  // Hover Backgrounds
  'hover:bg-slate-700/50': 'hover:bg-slate-100',
  'hover:bg-slate-700/30': 'hover:bg-slate-100',
  'hover:bg-slate-700/20': 'hover:bg-slate-50',
  'hover:bg-slate-700': 'hover:bg-slate-200',
  
  // Hover Text
  'hover:text-white': 'hover:text-slate-900',
  'hover:text-slate-100': 'hover:text-slate-800',
  'hover:text-slate-200': 'hover:text-slate-700',
  
  // Specific tweaks
  'bg-black/50': 'bg-slate-900/20',
  'shadow-[0_0_15px_rgba(37,99,235,0.1)]': 'shadow-sm',
  'shadow-[0_0_8px_rgba(96,165,250,0.8)]': 'shadow-sm',
  'bg-gradient-to-b from-blue-900/20': 'bg-gradient-to-b from-indigo-100/50',
  'bg-indigo-600/10': 'bg-indigo-300/20',
  'bg-blue-600/10': 'bg-blue-300/20',
};

filesToUpdate.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Sort keys by length descending to replace longer matches first
    const sortedKeys = Object.keys(classMap).sort((a, b) => b.length - a.length);
    
    sortedKeys.forEach(key => {
      const regex = new RegExp(key.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g');
      content = content.replace(regex, classMap[key]);
    });
    
    fs.writeFileSync(filePath, content);
    console.log(`Updated theme in ${path.basename(filePath)}`);
  }
});
