import React, { useState, useEffect } from 'react';
import { Plus, X, ListTodo, Package, User as UserIcon, CheckCircle, Clock, Layers, AlertTriangle } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const TaskManagement = () => {
  const [tasks, setTasks] = useState([]);
  const [products, setProducts] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [sections, setSections] = useState([]);
  const [inventoryBalance, setInventoryBalance] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [taskToDelete, setTaskToDelete] = useState(null);

  const [formData, setFormData] = useState({
    taskName: '',
    clientName: '',
    totalWeight: '',
    products: []
  });

  useEffect(() => {
    fetchTasks();
    fetchDependencies();
  }, []);

  const fetchTasks = async () => {
    try {
      const { data } = await api.get('/tasks');
      setTasks(data.tasks);
    } catch (error) {
      toast.error('Failed to load tasks');
    }
  };

  const fetchDependencies = async () => {
    try {
      const { data } = await api.get('/tasks/dependencies');
      setProducts(data.products);
      setEmployees(data.employees);
      setSections(data.sections || []);
      setInventoryBalance(data.inventoryBalance || 0);
    } catch (error) {
      toast.error('Failed to load dependencies');
    }
  };

  const resetForm = () => {
    setFormData({ taskName: '', clientName: '', totalWeight: '', products: [] });
    setEditingTaskId(null);
  };

  const handleAddProductRow = () => {
    setFormData({
      ...formData,
      products: [...formData.products, { type: 'Product', product: '', quantity: 1, urgencyLevel: 'Normal', assignments: [] }]
    });
  };

  const handleAddSectionRow = () => {
    setFormData({
      ...formData,
      products: [...formData.products, { type: 'Section', section: '', quantity: 1, urgencyLevel: 'Normal', assignments: [] }]
    });
  };

  const handleRemoveProductRow = (index) => {
    const newProducts = [...formData.products];
    newProducts.splice(index, 1);
    setFormData({ ...formData, products: newProducts });
  };

  const handleProductSelection = (index, productId) => {
    const selectedProduct = products.find(p => p._id === productId);
    const newProducts = [...formData.products];
    newProducts[index].product = productId;
    
    // Auto-generate assignments based on product sections
    if (selectedProduct && selectedProduct.sections) {
      newProducts[index].assignments = selectedProduct.sections.filter(sec => sec).map(sec => ({
        section: sec._id,
        sectionName: sec.name, // For UI purposes
        employee: ''
      }));
    } else {
      newProducts[index].assignments = [];
    }
    
    setFormData({ ...formData, products: newProducts });
  };

  const handleSectionSelection = (index, sectionId) => {
    const selectedSection = sections.find(s => s._id === sectionId);
    const newProducts = [...formData.products];
    newProducts[index].section = sectionId;
    newProducts[index].product = undefined;
    
    if (selectedSection) {
      newProducts[index].assignments = [{
        section: selectedSection._id,
        sectionName: selectedSection.name,
        employee: ''
      }];
    } else {
      newProducts[index].assignments = [];
    }
    
    setFormData({ ...formData, products: newProducts });
  };

  const handleAssignmentChange = (prodIndex, assignIndex, employeeId) => {
    const newProducts = [...formData.products];
    newProducts[prodIndex].assignments[assignIndex].employee = employeeId;
    setFormData({ ...formData, products: newProducts });
  };

  const getEmployeesForSection = (sectionId) => {
    return employees.filter(emp => emp.sections && emp.sections.some(s => s && s._id === sectionId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.taskName || !formData.totalWeight || formData.products.length === 0) {
      toast.error('Please fill all required fields and add at least one product');
      return;
    }

    // Validate that all assignments have an employee selected
    for (let i = 0; i < formData.products.length; i++) {
      const prod = formData.products[i];
      if (prod.type === 'Product' && !prod.product) {
        toast.error('Please select a product for all product rows');
        return;
      }
      if (prod.type === 'Section' && !prod.section) {
        toast.error('Please select a section for all section rows');
        return;
      }
      for (let j = 0; j < prod.assignments.length; j++) {
        if (!prod.assignments[j].employee) {
          toast.error(`Please assign an employee for ${prod.assignments[j].sectionName} in row ${i + 1}`);
          return;
        }
      }
    }

    setLoading(true);
    try {
      if (editingTaskId) {
        await api.put(`/tasks/${editingTaskId}`, formData);
        toast.success('Task updated successfully');
      } else {
        await api.post('/tasks', formData);
        toast.success('Task created successfully');
      }
      setIsModalOpen(false);
      resetForm();
      fetchTasks();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (task) => {
    // Map backend task data to formData format
    const formattedProducts = task.products.map(p => ({
      type: p.product ? 'Product' : 'Section',
      product: p.product ? p.product._id : undefined,
      section: !p.product && p.assignments.length > 0 ? (p.assignments[0].section ? p.assignments[0].section._id : '') : '',
      quantity: p.quantity,
      urgencyLevel: p.urgencyLevel || 'Normal',
      assignments: p.assignments.map(a => ({
        section: a.section ? a.section._id : '',
        sectionName: a.section ? a.section.name : '',
        employee: a.employee ? (a.employee._id ? a.employee._id : a.employee) : ''
      }))
    }));

    setFormData({
      taskName: task.taskName,
      clientName: task.clientName || '',
      totalWeight: task.totalWeight,
      products: formattedProducts
    });
    setEditingTaskId(task._id);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    setTaskToDelete(id);
  };

  const confirmDelete = async () => {
    if (!taskToDelete) return;
    setLoading(true);
    try {
      await api.delete(`/tasks/${taskToDelete}`);
      toast.success('Task deleted successfully');
      fetchTasks();
    } catch (error) {
      toast.error('Failed to delete task');
    } finally {
      setTaskToDelete(null);
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/80 p-6 rounded-2xl border border-slate-200 backdrop-blur-xl shadow-xl">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <ListTodo className="text-blue-500" /> Task Management
          </h2>
          <p className="text-slate-500 mt-1">Assign orders to production workflows</p>
        </div>
        <button
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg hover:shadow-blue-500/25 hover:from-blue-500 hover:to-indigo-500 transition-all"
        >
          <Plus size={20} /> Create Task
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {tasks.map(task => (
          <div key={task._id} className="bg-white rounded-2xl border border-slate-200 shadow-md p-6 relative group hover:shadow-xl transition-shadow">
            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => handleEdit(task)} className="p-1.5 text-slate-400 hover:text-blue-500 bg-slate-50 hover:bg-blue-50 rounded-lg">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
              </button>
              <button onClick={() => handleDelete(task._id)} className="p-1.5 text-slate-400 hover:text-rose-500 bg-slate-50 hover:bg-rose-50 rounded-lg">
                <X size={16} />
              </button>
            </div>
            
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-800">{task.taskName}</h3>
                {task.clientName && <p className="text-sm text-slate-500">Client: {task.clientName}</p>}
              </div>
              <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold border border-blue-100">
                {task.totalWeight}g
              </div>
            </div>

            <div className="space-y-4 mt-4 border-t border-slate-100 pt-4">
              {task.products.map((p, idx) => (
                <div key={idx} className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <div className="flex items-center gap-2 mb-3">
                    {p.product ? <Package className="text-slate-400" size={16} /> : <Layers className="text-slate-400" size={16} />}
                    <span className="font-semibold text-slate-700">
                      {p.product ? p.product.productCode : (p.assignments?.[0]?.section?.name ? `${p.assignments[0].section.name} (Section Task)` : 'Custom Stage')}
                    </span>
                    <span className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">Qty: {p.quantity}</span>
                    {p.urgencyLevel && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ml-auto ${
                        p.urgencyLevel === 'Urgent' ? 'bg-rose-100 text-rose-600 border border-rose-200' :
                        p.urgencyLevel === 'Low' ? 'bg-slate-100 text-slate-500 border border-slate-200' :
                        'bg-blue-100 text-blue-600 border border-blue-200'
                      }`}>
                        {p.urgencyLevel}
                      </span>
                    )}
                  </div>
                  
                  <div className="pl-6 space-y-2 relative before:absolute before:inset-y-0 before:left-2 before:w-px before:bg-slate-300">
                    {p.assignments.map((assign, aIdx) => (
                      <div key={aIdx} className="relative flex items-center gap-3">
                        <div className="absolute -left-5 w-2 h-2 rounded-full bg-slate-300 border-2 border-white"></div>
                        <span className="text-xs font-semibold text-slate-500 w-20 truncate">{assign.section ? assign.section.name : 'Unknown'}</span>
                        <div className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-lg border border-slate-200 shadow-sm flex-1">
                          <UserIcon size={12} className="text-blue-500" />
                          <span className="text-xs text-slate-700 font-medium truncate">
                            {assign.employee ? `${assign.employee.firstName} ${assign.employee.lastName}` : 'Unassigned'}
                          </span>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${assign.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                          {assign.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        {tasks.length === 0 && !loading && (
          <div className="col-span-full py-20 flex flex-col items-center justify-center bg-white/50 rounded-2xl border border-slate-200 border-dashed">
            <ListTodo size={64} className="text-slate-300 mb-4" />
            <p className="text-slate-500 font-medium text-lg">No tasks assigned yet</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            <div className="sticky top-0 px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white/90 backdrop-blur z-10">
              <h3 className="text-lg font-bold text-slate-800">{editingTaskId ? 'Edit Task' : 'Create New Task'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 rounded-lg transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 bg-slate-50 p-5 rounded-xl border border-slate-200">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Task / Order Name</label>
                  <input
                    type="text"
                    required
                    value={formData.taskName}
                    onChange={e => setFormData({...formData, taskName: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="e.g. Order #1002"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Client Name (Optional)</label>
                  <input
                    type="text"
                    value={formData.clientName}
                    onChange={e => setFormData({...formData, clientName: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="e.g. John Doe"
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-sm font-semibold text-slate-700">Total Raw Weight (g)</label>
                    <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      Available: {inventoryBalance.toFixed(2)}g
                    </span>
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    required
                    max={editingTaskId ? undefined : inventoryBalance}
                    value={formData.totalWeight}
                    onChange={e => setFormData({...formData, totalWeight: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="e.g. 100"
                  />
                  {formData.totalWeight && Number(formData.totalWeight) > inventoryBalance && !editingTaskId && (
                    <p className="text-xs text-rose-500 mt-1.5 flex items-center gap-1">
                      <AlertTriangle size={12} /> Exceeds available inventory balance!
                    </p>
                  )}
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-md font-bold text-slate-800">Task Items</h4>
                  <div className="flex gap-2">
                    <button type="button" onClick={handleAddSectionRow} className="text-sm font-semibold text-slate-600 hover:text-slate-700 flex items-center gap-1 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors border border-slate-200">
                      <Plus size={16} /> Add Section Task
                    </button>
                    <button type="button" onClick={handleAddProductRow} className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors border border-blue-200">
                      <Plus size={16} /> Add Product Task
                    </button>
                  </div>
                </div>
                
                {formData.products.length === 0 && (
                  <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-slate-500 text-sm">
                    No products added. Click "Add Product" to begin.
                  </div>
                )}

                <div className="space-y-4">
                  {formData.products.map((prod, pIdx) => (
                    <div key={pIdx} className="p-5 rounded-xl border border-slate-200 bg-white shadow-sm relative">
                      <button type="button" onClick={() => handleRemoveProductRow(pIdx)} className="absolute top-4 right-4 text-slate-400 hover:text-rose-500 transition-colors">
                        <X size={18} />
                      </button>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 pr-8">
                        {prod.type === 'Product' ? (
                          <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Select Product</label>
                            <select
                              required
                              value={prod.product || ''}
                              onChange={(e) => handleProductSelection(pIdx, e.target.value)}
                              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                            >
                              <option value="">-- Choose Product --</option>
                              {products.map(p => (
                                <option key={p._id} value={p._id}>{p.productCode} ({p.weight}g)</option>
                              ))}
                            </select>
                          </div>
                        ) : (
                          <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Select Section</label>
                            <select
                              required
                              value={prod.section || ''}
                              onChange={(e) => handleSectionSelection(pIdx, e.target.value)}
                              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                            >
                              <option value="">-- Choose Section --</option>
                              {sections.map(s => (
                                <option key={s._id} value={s._id}>{s.name}</option>
                              ))}
                            </select>
                          </div>
                        )}
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Quantity</label>
                          <input
                            type="number"
                            min="1"
                            required
                            value={prod.quantity}
                            onChange={(e) => {
                              const newProducts = [...formData.products];
                              newProducts[pIdx].quantity = e.target.value;
                              setFormData({...formData, products: newProducts});
                            }}
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Urgency</label>
                          <select
                            required
                            value={prod.urgencyLevel}
                            onChange={(e) => {
                              const newProducts = [...formData.products];
                              newProducts[pIdx].urgencyLevel = e.target.value;
                              setFormData({...formData, products: newProducts});
                            }}
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                          >
                            <option value="Low">Low</option>
                            <option value="Normal">Normal</option>
                            <option value="Urgent">Urgent</option>
                          </select>
                        </div>
                      </div>

                      {(prod.product || prod.section) && prod.assignments.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-slate-100 bg-slate-50 p-4 rounded-lg">
                          <h5 className="text-xs font-bold text-slate-600 mb-3 uppercase tracking-wider flex items-center gap-1.5">
                            <Layers size={14} /> Workflow Assignment
                          </h5>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                            {prod.assignments.map((assign, aIdx) => {
                              const availableEmployees = getEmployeesForSection(assign.section);
                              return (
                                <div key={aIdx} className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                                  <label className="block text-xs font-bold text-slate-700 mb-1.5">{assign.sectionName}</label>
                                  <select
                                    required
                                    value={assign.employee}
                                    onChange={(e) => handleAssignmentChange(pIdx, aIdx, e.target.value)}
                                    className="w-full px-2 py-1.5 rounded-md border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none text-xs"
                                  >
                                    <option value="">-- Assign Employee --</option>
                                    {availableEmployees.map(emp => (
                                      <option key={emp._id} value={emp._id}>{emp.firstName} {emp.lastName}</option>
                                    ))}
                                  </select>
                                  {availableEmployees.length === 0 && (
                                    <p className="text-[10px] text-rose-500 mt-1 mt-1">No employees assigned to this section!</p>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                      {(prod.product || prod.section) && prod.assignments.length === 0 && (
                         <div className="mt-4 pt-4 border-t border-slate-100">
                           <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-200">This product has no production stages assigned to it. Please edit the product to add workflow sections.</p>
                         </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 text-slate-500 font-semibold hover:bg-slate-100 rounded-xl mr-3"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg hover:shadow-blue-500/25 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? 'Saving...' : editingTaskId ? 'Update Task' : 'Save Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {taskToDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => !loading && setTaskToDelete(null)}></div>
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Delete Task</h3>
              <p className="text-slate-500 mb-6">Are you sure you want to delete this task? This action cannot be undone.</p>
              <div className="flex gap-3">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => setTaskToDelete(null)}
                  className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2.5 bg-rose-500 text-white font-bold rounded-xl shadow-lg shadow-rose-500/25 hover:bg-rose-600 transition-all disabled:opacity-50"
                >
                  {loading ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskManagement;
