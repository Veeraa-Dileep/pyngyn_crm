import React, { useState, useCallback, useRef } from 'react';
import * as XLSX from 'xlsx';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';

const STEP = {
    UPLOAD: 1,
    MAP: 2,
    PREVIEW: 3,
    IMPORT: 4,
    RESULTS: 5
};

const MAX_LEADS = 2000;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const ImportLeadsModal = ({ isOpen, onClose, existingLeads, onImport }) => {
    const fileInputRef = useRef(null);
    const [step, setStep] = useState(STEP.UPLOAD);
    const [file, setFile] = useState(null);
    const [parsedData, setParsedData] = useState([]);
    const [headers, setHeaders] = useState([]);
    const [columnMapping, setColumnMapping] = useState({});
    const [validatedData, setValidatedData] = useState({ valid: [], invalid: [] });
    const [importing, setImporting] = useState(false);
    const [progress, setProgress] = useState(0);
    const [results, setResults] = useState(null);
    const [dragActive, setDragActive] = useState(false);

    const fieldOptions = [
        { value: '', label: 'Skip this column' },
        { value: 'name', label: 'Name' },
        { value: 'company', label: 'Company' },
        { value: 'email', label: 'Email *' },
        { value: 'mobile', label: 'Mobile' },
        { value: 'source', label: 'Source' },
    ];

    const downloadTemplate = () => {
        const template = [
            ['Name', 'Company', 'Email', 'Mobile', 'Source'],
            ['John Doe', 'Acme Corp', 'john@acme.com', '+1234567890', 'Manual'],
            ['Jane Smith', 'Tech Inc', 'jane@tech.com', '+0987654321', 'Signup'],
        ];

        const ws = XLSX.utils.aoa_to_sheet(template);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Leads Template');
        XLSX.writeFile(wb, 'leads_import_template.xlsx');
    };

    const handleDrag = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    }, []);

    const handleFileInput = (e) => {
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const handleFile = (uploadedFile) => {
        // Validate file type
        const validTypes = [
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'text/csv'
        ];
        if (!validTypes.includes(uploadedFile.type) &&
            !uploadedFile.name.endsWith('.csv') &&
            !uploadedFile.name.endsWith('.xlsx') &&
            !uploadedFile.name.endsWith('.xls')) {
            alert('Please upload a valid CSV or Excel file');
            return;
        }

        // Validate file size
        if (uploadedFile.size > MAX_FILE_SIZE) {
            alert(`File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit`);
            return;
        }

        setFile(uploadedFile);

        // Parse file
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = e.target.result;
                const workbook = XLSX.read(data, { type: 'binary' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

                if (jsonData.length === 0) {
                    alert('File is empty');
                    return;
                }

                if (jsonData.length > MAX_LEADS + 1) {
                    alert(`File contains ${jsonData.length - 1} rows. Maximum allowed is ${MAX_LEADS}.`);
                    return;
                }

                const headers = jsonData[0];
                const rows = jsonData.slice(1).filter(row => row.some(cell => cell)); // Remove empty rows

                setHeaders(headers);
                setParsedData(rows);

                // Auto-detect column mapping
                const autoMapping = {};
                headers.forEach((header, index) => {
                    const normalized = header.toLowerCase().trim();
                    if (normalized.includes('name') && !normalized.includes('company')) autoMapping[index] = 'name';
                    else if (normalized.includes('company') || normalized.includes('organization')) autoMapping[index] = 'company';
                    else if (normalized.includes('email') || normalized.includes('e-mail')) autoMapping[index] = 'email';
                    else if (normalized.includes('mobile') || normalized.includes('phone')) autoMapping[index] = 'mobile';
                    else if (normalized.includes('source')) autoMapping[index] = 'source';
                });

                setColumnMapping(autoMapping);
                setStep(STEP.MAP);
            } catch (error) {
                console.error('Error parsing file:', error);
                alert('Error parsing file. Please ensure it\'s a valid CSV or Excel file.');
            }
        };
        reader.readAsBinaryString(uploadedFile);
    };

    const handleMapColumns = () => {
        // Validate at least email and (name or company) are mapped
        const mappedFields = Object.values(columnMapping);
        const hasEmail = mappedFields.includes('email');
        const hasNameOrCompany = mappedFields.includes('name') || mappedFields.includes('company');

        if (!hasEmail) {
            alert('Please map the Email column');
            return;
        }

        if (!hasNameOrCompany) {
            alert('Please map at least Name or Company column');
            return;
        }

        // Convert rows to objects based on mapping
        const mappedData = parsedData.map((row, rowIndex) => {
            const lead = {};
            Object.entries(columnMapping).forEach(([colIndex, field]) => {
                if (field) {
                    lead[field] = row[colIndex];
                }
            });
            lead._rowIndex = rowIndex + 2; // +2 for header row and 0-indexing
            return lead;
        });

        // Validate data
        const valid = [];
        const invalid = [];

        mappedData.forEach(lead => {
            const errors = [];

            // Check required fields
            if (!lead.email) {
                errors.push('Email is required');
            } else {
                // Validate email format
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(lead.email)) {
                    errors.push('Invalid email format');
                } else {
                    // Check for duplicates in existing leads
                    const isDuplicate = existingLeads?.some(existing =>
                        existing.email?.toLowerCase() === lead.email?.toLowerCase()
                    );
                    if (isDuplicate) {
                        errors.push('Duplicate email (will be skipped)');
                    }
                }
            }

            if (!lead.name && !lead.company) {
                errors.push('Name or Company is required');
            }

            if (errors.length > 0) {
                invalid.push({ ...lead, errors });
            } else {
                // Set default source if not provided
                if (!lead.source) {
                    lead.source = 'Imported';
                }
                valid.push(lead);
            }
        });

        setValidatedData({ valid, invalid });
        setStep(STEP.PREVIEW);
    };

    const handleImport = async () => {
        setStep(STEP.IMPORT);
        setImporting(true);
        setProgress(0);

        const { valid } = validatedData;
        const batchSize = 50;
        const imported = [];
        const failed = [];

        try {
            for (let i = 0; i < valid.length; i += batchSize) {
                const batch = valid.slice(i, i + batchSize);

                try {
                    await onImport(batch);
                    imported.push(...batch);
                    setProgress(Math.round((imported.length / valid.length) * 100));
                } catch (error) {
                    console.error('Batch import error:', error);
                    failed.push(...batch.map(lead => ({ ...lead, error: error.message })));
                }

                // Small delay to prevent overwhelming Firebase
                await new Promise(resolve => setTimeout(resolve, 100));
            }

            setResults({
                total: parsedData.length,
                imported: imported.length,
                skipped: validatedData.invalid.length,
                failed: failed.length,
                failedRows: failed
            });

            setStep(STEP.RESULTS);
        } catch (error) {
            console.error('Import error:', error);
            alert('An error occurred during import');
        } finally {
            setImporting(false);
        }
    };

    const handleClose = () => {
        if (importing) {
            if (!window.confirm('Import is in progress. Are you sure you want to cancel?')) {
                return;
            }
        }

        // Reset state
        setStep(STEP.UPLOAD);
        setFile(null);
        setParsedData([]);
        setHeaders([]);
        setColumnMapping({});
        setValidatedData({ valid: [], invalid: [] });
        setProgress(0);
        setResults(null);
        onClose();
    };

    const downloadErrorReport = () => {
        const { invalid } = validatedData;
        const { failedRows } = results || {};

        const allErrors = [
            ...invalid.map(row => ({ ...row, reason: row.errors.join(', ') })),
            ...(failedRows || []).map(row => ({ ...row, reason: row.error }))
        ];

        const ws = XLSX.utils.json_to_sheet(allErrors);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Errors');
        XLSX.writeFile(wb, 'import_errors.xlsx');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-background rounded-xl shadow-elevation-3 w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
            >
                {/* Header */}
                <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-foreground">Import Leads</h2>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            {step === STEP.UPLOAD && 'Upload your CSV or Excel file'}
                            {step === STEP.MAP && 'Map your columns'}
                            {step === STEP.PREVIEW && 'Review and validate'}
                            {step === STEP.IMPORT && 'Importing leads...'}
                            {step === STEP.RESULTS && 'Import complete'}
                        </p>
                    </div>
                    <button
                        onClick={handleClose}
                        disabled={importing}
                        className="text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                    >
                        <Icon name="X" size={20} />
                    </button>
                </div>

                {/* Progress Steps */}
                <div className="px-6 py-4 border-b border-border">
                    <div className="flex items-center justify-between">
                        {[1, 2, 3, 4].map((s) => (
                            <div key={s} className="flex items-center flex-1">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${step >= s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                                    }`}>
                                    {s}
                                </div>
                                {s < 4 && <div className={`flex-1 h-1 mx-2 ${step > s ? 'bg-primary' : 'bg-muted'}`} />}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    <AnimatePresence mode="wait">
                        {step === STEP.UPLOAD && (
                            <motion.div
                                key="upload"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-4"
                            >
                                <div
                                    onDragEnter={handleDrag}
                                    onDragLeave={handleDrag}
                                    onDragOver={handleDrag}
                                    onDrop={handleDrop}
                                    className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${dragActive ? 'border-primary bg-primary/5' : 'border-border'
                                        }`}
                                >
                                    <Icon name="Upload" size={48} className="mx-auto text-muted-foreground mb-4" />
                                    <h3 className="text-lg font-semibold text-foreground mb-2">
                                        {file ? file.name : 'Drop your file here'}
                                    </h3>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        {file
                                            ? `${(file.size / 1024).toFixed(2)} KB`
                                            : 'Supports .xlsx, .xls, .csv files up to 5MB'}
                                    </p>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept=".xlsx,.xls,.csv"
                                        onChange={handleFileInput}
                                        className="hidden"
                                    />
                                    <Button
                                        variant="outline"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <Icon name="FolderOpen" size={16} className="mr-2" />
                                        Browse Files
                                    </Button>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                                    <div className="flex items-center space-x-3">
                                        <Icon name="FileSpreadsheet" size={20} className="text-primary" />
                                        <span className="text-sm text-foreground">Need a template?</span>
                                    </div>
                                    <Button variant="outline" size="sm" onClick={downloadTemplate}>
                                        <Icon name="Download" size={14} className="mr-2" />
                                        Download Template
                                    </Button>
                                </div>

                                <div className="space-y-2 text-sm text-muted-foreground">
                                    <p className="font-semibold text-foreground">Requirements:</p>
                                    <ul className="list-disc list-inside space-y-1">
                                        <li>Email is required</li>
                                        <li>Name OR Company is required</li>
                                        <li>Maximum {MAX_LEADS.toLocaleString()} leads per import</li>
                                        <li>Duplicates will be skipped automatically</li>
                                    </ul>
                                </div>
                            </motion.div>
                        )}

                        {step === STEP.MAP && (
                            <motion.div
                                key="map"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-4"
                            >
                                <p className="text-sm text-muted-foreground">
                                    We've auto-detected your columns. Please confirm or adjust the mappings below.
                                </p>

                                <div className="space-y-3">
                                    {headers.map((header, index) => (
                                        <div key={index} className="flex items-center space-x-4">
                                            <div className="flex-1">
                                                <label className="text-sm font-medium text-foreground">
                                                    {header}
                                                </label>
                                                <p className="text-xs text-muted-foreground">
                                                    {parsedData[0]?.[index] || '(empty)'}
                                                </p>
                                            </div>
                                            <Icon name="ArrowRight" size={20} className="text-muted-foreground" />
                                            <select
                                                value={columnMapping[index] || ''}
                                                onChange={(e) => setColumnMapping({ ...columnMapping, [index]: e.target.value })}
                                                className="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                            >
                                                {fieldOptions.map(option => (
                                                    <option key={option.value} value={option.value}>
                                                        {option.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    ))}
                                </div>

                                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                    <p className="text-sm text-blue-900 dark:text-blue-100">
                                        <strong>Preview:</strong> Based on your mapping, we'll import {parsedData.length} leads
                                    </p>
                                </div>
                            </motion.div>
                        )}

                        {step === STEP.PREVIEW && (
                            <motion.div
                                key="preview"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-4"
                            >
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                                        <div className="text-2xl font-bold text-green-900 dark:text-green-100">
                                            {validatedData.valid.length}
                                        </div>
                                        <div className="text-sm text-green-700 dark:text-green-300">Valid leads</div>
                                    </div>
                                    <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                                        <div className="text-2xl font-bold text-red-900 dark:text-red-100">
                                            {validatedData.invalid.length}
                                        </div>
                                        <div className="text-sm text-red-700 dark:text-red-300">Invalid / Duplicates</div>
                                    </div>
                                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                        <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                                            {parsedData.length}
                                        </div>
                                        <div className="text-sm text-blue-700 dark:text-blue-300">Total rows</div>
                                    </div>
                                </div>

                                {validatedData.invalid.length > 0 && (
                                    <div className="border border-border rounded-lg overflow-hidden">
                                        <div className="bg-muted/50 px-4 py-2 border-b border-border">
                                            <h4 className="font-semibold text-foreground">Invalid Rows</h4>
                                        </div>
                                        <div className="max-h-48 overflow-y-auto">
                                            {validatedData.invalid.slice(0, 10).map((row, idx) => (
                                                <div key={idx} className="px-4 py-3 border-b border-border last:border-b-0">
                                                    <div className="text-sm font-medium text-foreground">
                                                        Row {row._rowIndex}: {row.name || row.company || row.email}
                                                    </div>
                                                    <div className="text-xs text-error mt-1">
                                                        {row.errors.join(', ')}
                                                    </div>
                                                </div>
                                            ))}
                                            {validatedData.invalid.length > 10 && (
                                                <div className="px-4 py-2 text-xs text-muted-foreground bg-muted/30">
                                                    ... and {validatedData.invalid.length - 10} more
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div className="border border-border rounded-lg overflow-hidden">
                                    <div className="bg-muted/50 px-4 py-2 border-b border-border">
                                        <h4 className="font-semibold text-foreground">Valid Leads Preview (First 5)</h4>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead className="bg-muted/30">
                                                <tr>
                                                    <th className="px-4 py-2 text-left">Name</th>
                                                    <th className="px-4 py-2 text-left">Company</th>
                                                    <th className="px-4 py-2 text-left">Email</th>
                                                    <th className="px-4 py-2 text-left">Source</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {validatedData.valid.slice(0, 5).map((row, idx) => (
                                                    <tr key={idx} className="border-t border-border">
                                                        <td className="px-4 py-2">{row.name || '-'}</td>
                                                        <td className="px-4 py-2">{row.company || '-'}</td>
                                                        <td className="px-4 py-2">{row.email}</td>
                                                        <td className="px-4 py-2">{row.source || 'Imported'}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {step === STEP.IMPORT && (
                            <motion.div
                                key="import"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex flex-col items-center justify-center py-12 space-y-6"
                            >
                                <div className="relative w-32 h-32">
                                    <svg className="transform -rotate-90" width="128" height="128">
                                        <circle
                                            cx="64"
                                            cy="64"
                                            r="56"
                                            stroke="currentColor"
                                            strokeWidth="8"
                                            fill="none"
                                            className="text-muted"
                                        />
                                        <circle
                                            cx="64"
                                            cy="64"
                                            r="56"
                                            stroke="currentColor"
                                            strokeWidth="8"
                                            fill="none"
                                            strokeDasharray={`${2 * Math.PI * 56}`}
                                            strokeDashoffset={`${2 * Math.PI * 56 * (1 - progress / 100)}`}
                                            className="text-primary transition-all duration-300"
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-3xl font-bold text-foreground">{progress}%</span>
                                    </div>
                                </div>
                                <div className="text-center">
                                    <h3 className="text-lg font-semibold text-foreground mb-2">
                                        Importing {validatedData.valid.length} leads...
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        Please wait, this may take a moment
                                    </p>
                                </div>
                            </motion.div>
                        )}

                        {step === STEP.RESULTS && results && (
                            <motion.div
                                key="results"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="space-y-6"
                            >
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Icon name="CheckCircle" size={32} className="text-green-600 dark:text-green-400" />
                                    </div>
                                    <h3 className="text-xl font-bold text-foreground mb-2">Import Complete!</h3>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-card border border-border rounded-lg">
                                        <div className="text-2xl font-bold text-green-600">{results.imported}</div>
                                        <div className="text-sm text-muted-foreground">Successfully imported</div>
                                    </div>
                                    <div className="p-4 bg-card border border-border rounded-lg">
                                        <div className="text-2xl font-bold text-yellow-600">{results.skipped}</div>
                                        <div className="text-sm text-muted-foreground">Skipped (invalid/duplicate)</div>
                                    </div>
                                </div>

                                {results.failed > 0 && (
                                    <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="font-semibold text-red-900 dark:text-red-100">
                                                    {results.failed} leads failed to import
                                                </div>
                                                <div className="text-sm text-red-700 dark:text-red-300 mt-1">
                                                    Download the error report for details
                                                </div>
                                            </div>
                                            <Button variant="outline" size="sm" onClick={downloadErrorReport}>
                                                <Icon name="Download" size={14} className="mr-2" />
                                                Error Report
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-border flex items-center justify-between">
                    <div>
                        {step === STEP.MAP && (
                            <Button variant="outline" onClick={() => setStep(STEP.UPLOAD)}>
                                <Icon name="ChevronLeft" size={16} className="mr-2" />
                                Back
                            </Button>
                        )}
                        {step === STEP.PREVIEW && (
                            <Button variant="outline" onClick={() => setStep(STEP.MAP)}>
                                <Icon name="ChevronLeft" size={16} className="mr-2" />
                                Back
                            </Button>
                        )}
                    </div>
                    <div className="flex space-x-3">
                        {step !== STEP.IMPORT && step !== STEP.RESULTS && (
                            <Button variant="outline" onClick={handleClose}>
                                Cancel
                            </Button>
                        )}
                        {step === STEP.UPLOAD && file && (
                            <Button onClick={() => setStep(STEP.MAP)}>
                                Next
                                <Icon name="ChevronRight" size={16} className="ml-2" />
                            </Button>
                        )}
                        {step === STEP.MAP && (
                            <Button onClick={handleMapColumns}>
                                Next
                                <Icon name="ChevronRight" size={16} className="ml-2" />
                            </Button>
                        )}
                        {step === STEP.PREVIEW && validatedData.valid.length > 0 && (
                            <Button onClick={handleImport}>
                                <Icon name="Upload" size={16} className="mr-2" />
                                Import {validatedData.valid.length} Leads
                            </Button>
                        )}
                        {step === STEP.RESULTS && (
                            <Button onClick={handleClose}>
                                Done
                            </Button>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default ImportLeadsModal;
