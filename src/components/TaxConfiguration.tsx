import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { TaxConfig, TaxRule, TaxSlab, SalaryData } from '../types';
import { 
  defaultTaxConfigs, 
  calculateTax, 
  exportTaxConfig, 
  importTaxConfig,
  saveCustomTaxConfig,
  loadCustomTaxConfigs,
  deleteCustomTaxConfig,
  createEmptyTaxRule,
  createEmptySlab
} from '../utils/taxCalculator';
import { Plus, Trash2, Upload, Download, Settings, ChevronDown, ChevronUp, X, Calculator } from 'lucide-react';

interface Props {
  data: SalaryData;
  onConfigChange: (config: TaxConfig) => void;
  currentConfig: TaxConfig | null;
}

const fieldClass = "w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-[13px] text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-500/10 focus:border-zinc-300 transition-all";
const labelClass = "block text-xs font-medium text-zinc-500 mb-1.5 uppercase tracking-wider";

export function TaxConfiguration({ data, onConfigChange, currentConfig }: Props) {
  const [configs, setConfigs] = useState<TaxConfig[]>([]);
  const [selectedConfigId, setSelectedConfigId] = useState<string>('');
  const [editingConfig, setEditingConfig] = useState<TaxConfig | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [expandedRule, setExpandedRule] = useState<string | null>(null);
  const [importError, setImportError] = useState<string>('');
  const [showPreview, setShowPreview] = useState(true);

  useEffect(() => {
    const customConfigs = loadCustomTaxConfigs();
    const allConfigs = [...defaultTaxConfigs, ...customConfigs];
    setConfigs(allConfigs);
    
    if (currentConfig) {
      setSelectedConfigId(currentConfig.id);
    } else {
      setSelectedConfigId(allConfigs[0]?.id || '');
    }
  }, [currentConfig]);

  useEffect(() => {
    const config = configs.find(c => c.id === selectedConfigId);
    if (config) {
      onConfigChange(config);
    }
  }, [selectedConfigId, configs]);

  const handleConfigChange = (id: string) => {
    setSelectedConfigId(id);
    const config = configs.find(c => c.id === id);
    if (config) {
      onConfigChange(config);
    }
  };

  const startEditing = (config: TaxConfig) => {
    setEditingConfig({ ...config });
    setShowEditor(true);
    setExpandedRule(null);
  };

  const saveCustomConfig = () => {
    if (!editingConfig) return;
    
    if (editingConfig.isCustom) {
      saveCustomTaxConfig(editingConfig);
      const customConfigs = loadCustomTaxConfigs();
      setConfigs([...defaultTaxConfigs, ...customConfigs]);
      setSelectedConfigId(editingConfig.id);
    }
    
    setShowEditor(false);
    onConfigChange(editingConfig);
  };

  const createNewConfig = () => {
    const newConfig: TaxConfig = {
      id: `custom-${Date.now()}`,
      name: 'My Custom Tax',
      country: 'Custom',
      currency: 'USD',
      locale: 'en-US',
      taxYear: new Date().getFullYear(),
      isCustom: true,
      rules: []
    };
    setEditingConfig(newConfig);
    setShowEditor(true);
  };

  const addRule = () => {
    if (!editingConfig) return;
    const newRule = createEmptyTaxRule();
    setEditingConfig({
      ...editingConfig,
      rules: [...editingConfig.rules, newRule]
    });
    setExpandedRule(newRule.id);
  };

  const removeRule = (ruleId: string) => {
    if (!editingConfig) return;
    setEditingConfig({
      ...editingConfig,
      rules: editingConfig.rules.filter(r => r.id !== ruleId)
    });
  };

  const updateRule = (ruleId: string, field: keyof TaxRule, value: any) => {
    if (!editingConfig) return;
    setEditingConfig({
      ...editingConfig,
      rules: editingConfig.rules.map(r => 
        r.id === ruleId ? { ...r, [field]: value } : r
      )
    });
  };

  const addSlab = (ruleId: string) => {
    if (!editingConfig) return;
    const newSlab = createEmptySlab();
    setEditingConfig({
      ...editingConfig,
      rules: editingConfig.rules.map(r => 
        r.id === ruleId 
          ? { ...r, slabs: [...(r.slabs || []), newSlab] }
          : r
      )
    });
  };

  const updateSlab = (ruleId: string, slabIndex: number, field: keyof TaxSlab, value: any) => {
    if (!editingConfig) return;
    setEditingConfig({
      ...editingConfig,
      rules: editingConfig.rules.map(r => {
        if (r.id !== ruleId || !r.slabs) return r;
        const newSlabs = [...r.slabs];
        newSlabs[slabIndex] = { ...newSlabs[slabIndex], [field]: value };
        return { ...r, slabs: newSlabs };
      })
    });
  };

  const removeSlab = (ruleId: string, slabIndex: number) => {
    if (!editingConfig) return;
    setEditingConfig({
      ...editingConfig,
      rules: editingConfig.rules.map(r => {
        if (r.id !== ruleId || !r.slabs) return r;
        return { ...r, slabs: r.slabs.filter((_, i) => i !== slabIndex) };
      })
    });
  };

  const handleExport = () => {
    if (!editingConfig) return;
    const blob = new Blob([exportTaxConfig(editingConfig)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tax-config-${editingConfig.name.replace(/\s+/g, '-').toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const config = importTaxConfig(content);
      if (config) {
        setEditingConfig(config);
        setImportError('');
      } else {
        setImportError('Invalid tax configuration file');
      }
    };
    reader.readAsText(file);
  };

  const deleteConfig = (id: string) => {
    deleteCustomTaxConfig(id);
    const customConfigs = loadCustomTaxConfigs();
    setConfigs([...defaultTaxConfigs, ...customConfigs]);
    if (selectedConfigId === id) {
      setSelectedConfigId(defaultTaxConfigs[0].id);
    }
  };

  return (
    <div className="space-y-4">
      {/* Tax Region Selector */}
      <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
        <div className="px-4 pt-4 pb-1 flex items-center justify-between">
          <h3 className="text-[10px] font-bold text-zinc-900 uppercase tracking-widest">Tax Configuration</h3>
          <div className="flex gap-2">
            <button
              onClick={() => {
                const config = configs.find(c => c.id === selectedConfigId);
                if (config) startEditing(config);
              }}
              aria-label="Edit Configuration"
              className="p-1.5 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-all"
              title="Edit Configuration"
            >
              <Settings size={14} />
            </button>
            <button
               onClick={createNewConfig}
               aria-label="New Config"
               className="p-1.5 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-all"
               title="New Config"
            >
               <Plus size={14} />
            </button>
          </div>
        </div>
        <div className="px-4 pb-4 pt-2">
          <select 
            value={selectedConfigId} 
            onChange={(e) => handleConfigChange(e.target.value)}
            className={fieldClass + " text-xs h-9"}
          >
            {defaultTaxConfigs.map(config => (
              <option key={config.id} value={config.id}>
                {config.name} ({config.country})
              </option>
            ))}
            <optgroup label="Custom Configurations">
              {configs.filter(c => c.isCustom && !defaultTaxConfigs.find(d => d.id === c.id)).map(config => (
                <option key={config.id} value={config.id}>
                  {config.name} (Custom)
                </option>
              ))}
            </optgroup>
          </select>
        </div>
      </div>

      {/* Tax Calculation Preview */}
      {data && currentConfig && (
        <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
          <div className="px-4 py-3 border-b border-zinc-50 bg-zinc-50/30">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center justify-between w-full"
            >
              <div className="flex items-center gap-2">
                <Calculator size={14} className="text-zinc-400" />
                <span className="text-[11px] font-bold text-zinc-900 uppercase tracking-wider">Tax Calculation Preview</span>
              </div>
              {showPreview ? <ChevronUp size={14} className="text-zinc-400" /> : <ChevronDown size={14} className="text-zinc-400" />}
            </button>
          </div>
          
          {showPreview && (
            <div className="px-4 py-3">
              {(() => {
                const calc = calculateTax(data, currentConfig);
                return (
                  <div className="space-y-1">
                    {calc.breakdown.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center py-2 group">
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-zinc-700">{item.ruleName}</span>
                          <span className="text-[10px] text-zinc-400 font-medium">
                            {item.baseAmount.toLocaleString()} × {item.rate}%
                          </span>
                        </div>
                        <div className="text-right">
                          <span className={`text-xs font-bold tabular-nums ${item.isDeduction ? 'text-red-600' : 'text-green-600'}`}>
                            {item.isDeduction ? '-' : '+'}{currentConfig.currency}{item.calculatedAmount.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                    
                    <div className="pt-3 mt-2 border-t border-zinc-100">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Total Tax Deductions</span>
                        <span className="text-sm font-black text-red-600 tabular-nums">
                          {currentConfig.currency} {calc.totalTax.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center opacity-70">
                        <span className="text-[10px] text-zinc-500 font-medium">Effective Tax Rate: {calc.effectiveRate}%</span>
                        <span className="text-[10px] text-zinc-500 font-bold"> After Tax: {currentConfig.currency}{calc.afterTaxIncome.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      )}

      {/* Tax Editor Modal — rendered via portal to escape stacking contexts */}
      {showEditor && editingConfig && createPortal(
        <div
          className="fixed inset-0 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.5)', zIndex: 9999 }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowEditor(false); }}
        >
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-zinc-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-zinc-900">
                {editingConfig.isCustom ? 'Edit Custom Tax Config' : 'View Tax Config'}
              </h3>
              <button 
                onClick={() => setShowEditor(false)}
                className="p-1 hover:bg-zinc-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className={labelClass}>Configuration Name</label>
                  <input
                    type="text"
                    value={editingConfig.name}
                    onChange={(e) => setEditingConfig({ ...editingConfig, name: e.target.value })}
                    className={fieldClass}
                    disabled={!editingConfig.isCustom}
                  />
                </div>
                <div>
                  <label className={labelClass}>Currency Code</label>
                  <input
                    type="text"
                    value={editingConfig.currency}
                    onChange={(e) => setEditingConfig({ ...editingConfig, currency: e.target.value })}
                    className={fieldClass}
                    disabled={!editingConfig.isCustom}
                    placeholder="USD, INR, GBP, etc."
                  />
                </div>
                <div>
                  <label className={labelClass}>Locale</label>
                  <input
                    type="text"
                    value={editingConfig.locale}
                    onChange={(e) => setEditingConfig({ ...editingConfig, locale: e.target.value })}
                    className={fieldClass}
                    disabled={!editingConfig.isCustom}
                    placeholder="en-US, en-IN, etc."
                  />
                </div>
              </div>

              {/* Tax Rules */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-semibold text-zinc-900">Tax Rules</h4>
                  {editingConfig.isCustom && (
                    <button
                      onClick={addRule}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors"
                    >
                      <Plus size={14} />
                      Add Rule
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  {editingConfig.rules.map((rule) => (
                    <div 
                      key={rule.id} 
                      className="border border-zinc-200 rounded-lg overflow-hidden"
                    >
                      <button
                        onClick={() => setExpandedRule(expandedRule === rule.id ? null : rule.id)}
                        className="w-full px-4 py-3 flex items-center justify-between bg-zinc-50 hover:bg-zinc-100 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-medium text-sm text-zinc-900">{rule.name || 'Unnamed Rule'}</span>
                          <span className="text-xs px-2 py-0.5 bg-zinc-200 rounded text-zinc-600">
                            {rule.type}
                          </span>
                          {rule.isStatutory && (
                            <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                              Statutory
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {editingConfig.isCustom && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeRule(rule.id);
                              }}
                              className="p-1 text-zinc-400 hover:text-red-500 transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                          {expandedRule === rule.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </div>
                      </button>

                      {expandedRule === rule.id && (
                        <div className="px-4 py-4 space-y-4 bg-white">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className={labelClass}>Rule Name</label>
                              <input
                                type="text"
                                value={rule.name}
                                onChange={(e) => updateRule(rule.id, 'name', e.target.value)}
                                className={fieldClass}
                                disabled={!editingConfig.isCustom}
                              />
                            </div>
                            <div>
                              <label className={labelClass}>Type</label>
                              <select
                                value={rule.type}
                                onChange={(e) => updateRule(rule.id, 'type', e.target.value)}
                                className={fieldClass}
                                disabled={!editingConfig.isCustom}
                              >
                                <option value="percentage">Percentage</option>
                                <option value="slab">Progressive Slabs</option>
                                <option value="fixed">Fixed Amount</option>
                              </select>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <label className={labelClass}>Base Amount On</label>
                              <select
                                value={rule.baseOn}
                                onChange={(e) => updateRule(rule.id, 'baseOn', e.target.value)}
                                className={fieldClass}
                                disabled={!editingConfig.isCustom}
                              >
                                <option value="gross">Gross Salary</option>
                                <option value="basic">Basic Salary</option>
                                <option value="taxable">Taxable Income</option>
                                <option value="net">Net Salary</option>
                              </select>
                            </div>
                            <div>
                              <label className={labelClass}>Rate (%)</label>
                              <input
                                type="number"
                                value={rule.rate || ''}
                                onChange={(e) => updateRule(rule.id, 'rate', parseFloat(e.target.value) || 0)}
                                className={fieldClass}
                                disabled={!editingConfig.isCustom || rule.type === 'slab'}
                              />
                            </div>
                            <div>
                              <label className={labelClass}>Applies To</label>
                              <select
                                value={rule.appliesTo}
                                onChange={(e) => updateRule(rule.id, 'appliesTo', e.target.value)}
                                className={fieldClass}
                                disabled={!editingConfig.isCustom}
                              >
                                <option value="monthly">Monthly</option>
                                <option value="annual">Annual</option>
                                <option value="all">All</option>
                              </select>
                            </div>
                          </div>

                          {rule.type === 'percentage' && (
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className={labelClass}>Min Amount (Optional)</label>
                                <input
                                  type="number"
                                  value={rule.minAmount || ''}
                                  onChange={(e) => updateRule(rule.id, 'minAmount', e.target.value ? parseFloat(e.target.value) : undefined)}
                                  className={fieldClass}
                                  disabled={!editingConfig.isCustom}
                                  placeholder="No minimum"
                                />
                              </div>
                              <div>
                                <label className={labelClass}>Max Amount (Optional)</label>
                                <input
                                  type="number"
                                  value={rule.maxAmount || ''}
                                  onChange={(e) => updateRule(rule.id, 'maxAmount', e.target.value ? parseFloat(e.target.value) : undefined)}
                                  className={fieldClass}
                                  disabled={!editingConfig.isCustom}
                                  placeholder="No maximum"
                                />
                              </div>
                            </div>
                          )}

                          <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={rule.isDeduction}
                                onChange={(e) => updateRule(rule.id, 'isDeduction', e.target.checked)}
                                disabled={!editingConfig.isCustom}
                                className="rounded border-zinc-300"
                              />
                              <span className="text-sm text-zinc-700">Is Deduction</span>
                            </label>
                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={rule.isStatutory}
                                onChange={(e) => updateRule(rule.id, 'isStatutory', e.target.checked)}
                                disabled={!editingConfig.isCustom}
                                className="rounded border-zinc-300"
                              />
                              <span className="text-sm text-zinc-700">Statutory</span>
                            </label>
                          </div>

                          {rule.type === 'slab' && (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <label className={labelClass}>Tax Slabs</label>
                                {editingConfig.isCustom && (
                                  <button
                                    onClick={() => addSlab(rule.id)}
                                    className="text-sm text-zinc-600 hover:text-zinc-900 flex items-center gap-1"
                                  >
                                    <Plus size={14} />
                                    Add Slab
                                  </button>
                                )}
                              </div>
                              <div className="space-y-2">
                                {(rule.slabs || []).map((slab, idx) => (
                                  <div key={idx} className="grid grid-cols-4 gap-2 items-center bg-zinc-50 p-2 rounded">
                                    <input
                                      type="number"
                                      value={slab.min}
                                      onChange={(e) => updateSlab(rule.id, idx, 'min', parseFloat(e.target.value) || 0)}
                                      placeholder="Min"
                                      className={fieldClass}
                                      disabled={!editingConfig.isCustom}
                                    />
                                    <input
                                      type="number"
                                      value={slab.max || ''}
                                      onChange={(e) => updateSlab(rule.id, idx, 'max', e.target.value ? parseFloat(e.target.value) : null)}
                                      placeholder="Max (empty = ∞)"
                                      className={fieldClass}
                                      disabled={!editingConfig.isCustom}
                                    />
                                    <input
                                      type="number"
                                      value={slab.rate}
                                      onChange={(e) => updateSlab(rule.id, idx, 'rate', parseFloat(e.target.value) || 0)}
                                      placeholder="Rate %"
                                      className={fieldClass}
                                      disabled={!editingConfig.isCustom}
                                    />
                                    <div className="flex items-center gap-2">
                                      <input
                                        type="number"
                                        value={slab.fixedAmount || ''}
                                        onChange={(e) => updateSlab(rule.id, idx, 'fixedAmount', e.target.value ? parseFloat(e.target.value) : undefined)}
                                        placeholder="Fixed amt"
                                        className={fieldClass}
                                        disabled={!editingConfig.isCustom}
                                      />
                                      {editingConfig.isCustom && (
                                        <button
                                          onClick={() => removeSlab(rule.id, idx)}
                                          className="p-1 text-zinc-400 hover:text-red-500"
                                        >
                                          <Trash2 size={14} />
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          <div>
                            <label className={labelClass}>Description (Optional)</label>
                            <input
                              type="text"
                              value={rule.description || ''}
                              onChange={(e) => updateRule(rule.id, 'description', e.target.value)}
                              className={fieldClass}
                              disabled={!editingConfig.isCustom}
                              placeholder="e.g., 12% of Basic Salary"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {editingConfig.rules.length === 0 && (
                    <p className="text-center text-sm text-zinc-400 py-8">
                      No tax rules configured. {editingConfig.isCustom ? 'Click "Add Rule" to create one.' : 'This configuration has no tax rules.'}
                    </p>
                  )}
                </div>
              </div>

              {/* Import/Export */}
              {editingConfig.isCustom && (
                <div className="flex gap-3">
                  <button
                    onClick={handleExport}
                    className="flex items-center gap-2 px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-lg text-sm font-medium transition-colors"
                  >
                    <Download size={16} />
                    Export Config
                  </button>
                  <label className="flex items-center gap-2 px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-lg text-sm font-medium transition-colors cursor-pointer">
                    <Upload size={16} />
                    Import Config
                    <input type="file" accept=".json" className="hidden" onChange={handleImport} />
                  </label>
                </div>
              )}
              
              {importError && (
                <p className="text-sm text-red-600">{importError}</p>
              )}
            </div>

            <div className="px-6 py-4 border-t border-zinc-200 flex justify-end gap-3">
              <button
                onClick={() => setShowEditor(false)}
                className="px-4 py-2 text-zinc-600 hover:text-zinc-900 font-medium transition-colors"
              >
                Cancel
              </button>
              {editingConfig.isCustom && (
                <button
                  onClick={saveCustomConfig}
                  className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg font-medium transition-colors"
                >
                  Save Configuration
                </button>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
