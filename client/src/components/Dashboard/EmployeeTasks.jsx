import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { CheckSquare, Package, Clock, PlayCircle, X } from 'lucide-react';
import toast from 'react-hot-toast';

const EmployeeTasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [activeAssignments, setActiveAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [completingTask, setCompletingTask] = useState(null);
  const [outputWeight, setOutputWeight] = useState('');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const { data } = await api.get('/tasks');
      setTasks(data.tasks);
      calculateActiveAssignments(data.tasks);
    } catch (error) {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const calculateActiveAssignments = (allTasks) => {
    const active = [];
    allTasks.forEach(task => {
      if (task.status === 'Completed') return;

      task.products.forEach(product => {
        if (product.status === 'Completed') return;

        // Find the index of the first assignment that is not completed
        const assignmentIndex = product.assignments.findIndex(a => a.status !== 'Completed');
        if (assignmentIndex === -1) return;
        
        const currentAssignment = product.assignments[assignmentIndex];
        
        // If the current assignment belongs to this user, add to their work list
        if (currentAssignment.employee && currentAssignment.employee._id === user._id) {
          
          // Calculate input weight
          let inputWeight = 0;
          if (assignmentIndex === 0) {
            // First stage: base weight * quantity or task total weight for section tasks
            inputWeight = product.product ? (product.product.weight || 0) * product.quantity : (task.totalWeight || 0);
          } else {
            // Subsequent stage: output weight of previous stage
            inputWeight = product.assignments[assignmentIndex - 1].outputWeight || 0;
          }

          active.push({
            task,
            product,
            assignment: currentAssignment,
            inputWeight
          });
        }
      });
    });
    setActiveAssignments(active);
  };

  const handleUpdateStatus = async (taskId, productId, assignmentId, newStatus, weight = undefined, inputWeight = undefined) => {
    try {
      const payload = { status: newStatus };
      if (weight !== undefined) payload.outputWeight = Number(weight);
      if (inputWeight !== undefined) payload.inputWeight = Number(inputWeight);

      await api.patch(`/tasks/${taskId}/products/${productId}/assignments/${assignmentId}`, payload);
      toast.success(`Task marked as ${newStatus}`);
      fetchTasks();
      setCompletingTask(null);
      setOutputWeight('');
    } catch (error) {
      toast.error('Failed to update task status');
    }
  };

  const handleCompleteSubmit = (e) => {
    e.preventDefault();
    if (!outputWeight || isNaN(outputWeight) || Number(outputWeight) <= 0) {
      toast.error('Please enter a valid output weight');
      return;
    }
    if (Number(outputWeight) > completingTask.inputWeight) {
      toast.error(`Output weight cannot exceed received weight (${completingTask.inputWeight}g)`);
      return;
    }
    handleUpdateStatus(completingTask.taskId, completingTask.productId, completingTask.assignmentId, 'Pending QC', outputWeight, completingTask.inputWeight);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white/60 rounded-2xl border border-slate-200 backdrop-blur-md">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-slate-500 font-medium">Loading your tasks...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4 bg-white/80 p-6 rounded-2xl border border-slate-200 backdrop-blur-xl shadow-xl">
        <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500">
          <CheckSquare size={24} />
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">My Work List</h2>
          <p className="text-slate-500 mt-1">These are the tasks currently in your stage of production.</p>
        </div>
        <div className="bg-rose-50 border border-rose-100 px-4 py-2 rounded-xl flex items-center gap-2">
          <div className="w-8 h-8 bg-rose-100 text-rose-500 rounded-lg flex items-center justify-center">
            <X size={16} />
          </div>
          <div>
            <p className="text-xs font-bold text-rose-500 uppercase tracking-wider">Total Loss</p>
            <p className="text-sm font-bold text-slate-700">{user.totalLossWeight ? user.totalLossWeight.toFixed(2) : '0.00'}g</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {activeAssignments.length === 0 ? (
          <div className="col-span-full py-20 flex flex-col items-center justify-center bg-white/50 rounded-2xl border border-slate-200 border-dashed">
            <CheckSquare size={64} className="text-slate-300 mb-4" />
            <p className="text-slate-500 font-medium text-lg">You're all caught up!</p>
            <p className="text-slate-400 text-sm mt-1">No active tasks are currently assigned to your stage.</p>
          </div>
        ) : (
          activeAssignments.map(({ task, product, assignment, inputWeight }, idx) => (
            <div key={`${task._id}-${product._id}-${assignment._id}`} className="bg-white rounded-2xl border border-slate-200 shadow-md p-6 relative group hover:shadow-xl transition-shadow flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-800">{task.taskName}</h3>
                  <p className="text-sm text-slate-500">Client: {task.clientName || 'Internal'}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                  product.urgencyLevel === 'Urgent' ? 'bg-rose-100 text-rose-700 border border-rose-200' :
                  product.urgencyLevel === 'Low' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                  'bg-blue-100 text-blue-700 border border-blue-200'
                }`}>
                  {product.urgencyLevel}
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 mb-6 flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                    <Package size={16} />
                  </div>
                  <div className="flex-1 flex justify-between items-center">
                    <div>
                      <p className="text-sm font-semibold text-slate-700">{product.product?.productCode || (assignment.section?.name ? `${assignment.section.name} Task` : 'Custom Task')}</p>
                      <p className="text-xs text-slate-500">Qty: {product.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-500">Received {task.purity ? `(${task.purity} Purity)` : ''}</p>
                      <p className="text-sm font-bold text-slate-700">{inputWeight}g</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-200">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Your Current Stage</p>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
                    <span className="text-sm font-bold text-slate-700">{assignment.section?.name || 'Unknown Stage'}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-auto">
                {assignment.status === 'Pending' && (
                  <button
                    onClick={() => handleUpdateStatus(task._id, product._id, assignment._id, 'In Progress')}
                    className="flex-1 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold rounded-xl flex items-center justify-center gap-2 transition-colors border border-blue-200"
                  >
                    <PlayCircle size={18} /> Start Work
                  </button>
                )}
                
                {assignment.status === 'In Progress' && (
                  <button
                    onClick={() => setCompletingTask({ taskId: task._id, productId: product._id, assignmentId: assignment._id, inputWeight })}
                    className="flex-1 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all flex items-center justify-center gap-2"
                  >
                    <CheckSquare size={18} /> Submit for QC
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {completingTask && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setCompletingTask(null)}></div>
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-800">Complete Stage</h3>
              <button onClick={() => setCompletingTask(null)} className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 rounded-lg transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCompleteSubmit} className="p-6">
              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Output Weight (g)</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    required
                    max={completingTask.inputWeight}
                    value={outputWeight}
                    onChange={e => setOutputWeight(e.target.value)}
                    className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors bg-slate-50"
                    placeholder={`Max: ${completingTask.inputWeight}`}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-sm">
                    g
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Received weight was <span className="font-semibold text-slate-700">{completingTask.inputWeight}g</span>. Update with the final weight after your work.
                </p>
              </div>
              
              <button
                type="submit"
                className="w-full py-3 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all flex items-center justify-center gap-2"
              >
                <CheckSquare size={18} /> Submit for Review
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeTasks;
