// src/components/vitals/PreOPDIntakeSections.tsx
import React, { useState, useMemo, useRef } from "react";
import {
  FileText,
  HeartPulse,
  Syringe,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Plus,
  Trash2,
  List,
  Upload,
  User,
  Pill,
  Copy,
  Bot,
} from "lucide-react";
import {
  // Assuming standard type definitions exist in a types file
  PreOPDIntakeData,
  Complaint,
  ChronicCondition,
  Allergy,
  MedicationDetails,
  PastHistory,
  Patient,
} from "../../types";

// --- Mock/Master Data (Should be in a separate master data file in a real app) ---
const MOCK_MASTERS = {
  complaints: [
    { label: "Chest Pain", redFlag: true, specialty: "Cardiology" },
    { label: "Fever", redFlag: false, specialty: "General Medicine" },
    { label: "Cough", redFlag: false, specialty: "Pulmonology" },
    { label: "Headache", redFlag: false, specialty: "Neurology" },
    { label: "Diarrhea", redFlag: false, specialty: "Gastroenterology" },
  ],
  chronicConditions: ["Diabetes", "Hypertension", "Asthma", "CKD", "CAD"],
  frequencies: ["OD", "BD", "TDS", "QHS", "QID", "PRN", "Weekly"],
  routes: ["Oral", "SC", "IV", "IM", "Inhaled", "Topical"],
  severity: ["Mild", "Moderate", "Severe"],
  compliance: ["Taking", "Missed", "Ran out", "Unknown"],
};

// --- Shared UI Components ---

const SectionHeader: React.FC<{
  icon: React.ElementType;
  title: string;
  children?: React.ReactNode;
}> = ({ icon: Icon, title, children }) => (
  <div className="flex items-center justify-between space-x-2 mb-3 pt-2">
    <div className="flex items-center space-x-2">
      <div className="bg-[#012e58]/10 p-1.5 rounded-md">
        <Icon className="w-4 h-4 text-[#012e58]" />
      </div>
      <h2 className="text-lg font-bold text-[#0B2D4D] tracking-tight">
        {title}
      </h2>
    </div>
    {children}
  </div>
);

const InputStyle =
  "p-2 border border-gray-300 rounded-md w-full bg-gray-50 focus:ring-2 focus:ring-[#012e58] focus:border-[#012e58] transition duration-200 ease-in-out text-[#0B2D4D] placeholder:text-gray-500 text-sm";

// -----------------------------------------------------------
// 1. Presenting Complaints Section
// -----------------------------------------------------------

interface ComplaintProps {
  data: Complaint[];
  onChange: (data: Complaint[]) => void;
}

export const PresentingComplaints: React.FC<ComplaintProps> = ({
  data,
  onChange,
}) => {
  const addComplaint = () => {
    onChange([
      ...data,
      {
        id: Date.now().toString(),
        complaint: "",
        severity: "",
        duration: { value: "", unit: "d" },
        specialty: "",
        redFlagTriggered: false,
      },
    ]);
  };

  const updateComplaint = (id: string, field: keyof Complaint, value: any) => {
    onChange(
      data.map((c) => {
        if (c.id === id) {
          const updated = { ...c, [field]: value };
          // Mock Auto-Derivation (Checklist feature)
          const masterComplaint = MOCK_MASTERS.complaints.find(
            (m) => m.label.toLowerCase() === updated.complaint.toLowerCase()
          );
          if (masterComplaint) {
            updated.specialty = masterComplaint.specialty;
            updated.redFlagTriggered =
              masterComplaint.redFlag && updated.severity === "Severe";
          }
          return updated;
        }
        return c;
      })
    );
  };

  const removeComplaint = (id: string) => {
    onChange(data.filter((r) => r.id !== id));
  };

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-md">
      <SectionHeader icon={List} title="Presenting Complaint(s)">
        <button
          onClick={addComplaint}
          className="flex items-center space-x-1 px-3 py-1 bg-[#012e58] text-white rounded-md hover:bg-[#1a4b7a] transition-colors text-xs"
        >
          <Plus className="w-3 h-3" />
          <span>Add Complaint</span>
        </button>
      </SectionHeader>

      <div className="space-y-3">
        {data.map((c) => (
          <div
            key={c.id}
            className="p-3 border border-gray-200 rounded-md bg-gray-50"
          >
            <div className="grid grid-cols-6 gap-3 items-end">
              {/* Complaint */}
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Complaint
                </label>
                <input
                  type="text"
                  list="complaint-master"
                  value={c.complaint}
                  onChange={(e) =>
                    updateComplaint(c.id, "complaint", e.target.value)
                  }
                  className={InputStyle}
                  placeholder="e.g., Chest Pain"
                />
                <datalist id="complaint-master">
                  {MOCK_MASTERS.complaints.map((m) => (
                    <option key={m.label} value={m.label} />
                  ))}
                </datalist>
              </div>

              {/* Severity */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Severity
                </label>
                <select
                  value={c.severity}
                  onChange={(e) =>
                    updateComplaint(c.id, "severity", e.target.value)
                  }
                  className={InputStyle}
                >
                  <option value="">Select</option>
                  {MOCK_MASTERS.severity.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              {/* Duration (Structured) */}
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Duration
                </label>
                <div className="flex space-x-1">
                  <input
                    type="text"
                    value={c.duration.value}
                    onChange={(e) =>
                      updateComplaint(c.id, "duration", {
                        ...c.duration,
                        value: e.target.value,
                      })
                    }
                    className={`${InputStyle} flex-1`}
                    placeholder="e.g., 3 days"
                  />
                  <select
                    value={c.duration.unit}
                    onChange={(e) =>
                      updateComplaint(c.id, "duration", {
                        ...c.duration,
                        unit: e.target.value,
                      })
                    }
                    className={`${InputStyle} w-16`}
                  >
                    {["h", "d", "w", "mo", "yr", "Unknown"].map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Delete */}
              <div className="flex justify-end">
                <button
                  onClick={() => removeComplaint(c.id)}
                  className="p-2 text-red-500 hover:text-red-700 rounded-md"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Red Flag & Specialty */}
              <div className="col-span-6 flex items-center space-x-3 pt-1">
                {c.redFlagTriggered && (
                  <span className="flex items-center text-red-600 bg-red-100 px-2 py-0.5 rounded-full text-xs font-semibold">
                    <AlertTriangle className="w-3 h-3 mr-1" /> RED FLAG: Severe
                    condition
                  </span>
                )}
                {c.specialty && (
                  <span className="text-xs text-[#1a4b7a] font-medium">
                    Specialty: {c.specialty}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// -----------------------------------------------------------
// 2. Chronic Conditions Section
// -----------------------------------------------------------

interface ChronicConditionsProps {
  data: ChronicCondition[];
  onChange: (data: ChronicCondition[]) => void;
}

export const ChronicConditionsSection: React.FC<
  ChronicConditionsProps
> = () => {
  // Logic for this is complex due to nested medication tables and will be minimal here.

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-md">
      <SectionHeader icon={HeartPulse} title="Chronic Conditions">
        <button className="flex items-center space-x-1 px-3 py-1 bg-[#012e58] text-white rounded-md hover:bg-[#1a4b7a] transition-colors text-xs">
          <Plus className="w-3 h-3" />
          <span>Add Condition</span>
        </button>
      </SectionHeader>

      <div className="flex flex-wrap gap-2 mb-4">
        {MOCK_MASTERS.chronicConditions.map((cond) => (
          <span
            key={cond}
            className="px-3 py-1 text-sm bg-blue-500 text-white rounded-full cursor-pointer hover:bg-blue-600 transition-colors"
            title="Click to open inline card"
          >
            {cond}
          </span>
        ))}
      </div>

      <div className="p-3 border-l-4 border-yellow-500 bg-yellow-50 text-sm text-gray-700">
        <p className="font-semibold">Incomplete Section: </p>
        <p>
          Logic for adding/editing a Condition Card (with nested Medications
          table) and the HTN/Vitals conflict check is pending implementation.
        </p>
      </div>
    </div>
  );
};

// -----------------------------------------------------------
// 3. Allergies Section
// -----------------------------------------------------------

interface AllergiesProps {
  data: Allergy;
  onToggle: (hasAllergies: boolean) => void;
  onUpdate: (data: Allergy) => void;
  allMeds: MedicationDetails[]; // Used for checking drug conflict
}

export const AllergiesSection: React.FC<AllergiesProps> = ({
  data,
  onToggle,
  onUpdate,
  allMeds,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(!data.hasAllergies);

  const isConflict = useMemo(() => {
    // Mock hard rule: If patient has a Drug allergy, check if that drug is in any medication list
    const drugAllergies = data.type.includes("Drug")
      ? [data.substance.toLowerCase()]
      : [];
    if (drugAllergies.length === 0 || !data.substance) return false;

    return allMeds.some((med) =>
      drugAllergies.some((allergy) => med.name.toLowerCase().includes(allergy))
    );
  }, [data, allMeds]);

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-md">
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <SectionHeader icon={Syringe} title="Allergies (Drug, Food, Other)">
          <div className="flex items-center space-x-3">
            <span
              className={`px-3 py-1 text-xs font-semibold rounded-full ${
                data.hasAllergies
                  ? "bg-red-500 text-white"
                  : "bg-green-100 text-green-700"
              }`}
            >
              {data.hasAllergies ? "Yes" : "No"}
            </span>
            <div className="p-1 rounded-full bg-gray-200">
              {isCollapsed ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronUp className="w-4 h-4" />
              )}
            </div>
          </div>
        </SectionHeader>
      </div>

      <div className="mt-2">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={data.hasAllergies}
            onChange={(e) => {
              onToggle(e.target.checked);
              setIsCollapsed(!e.target.checked);
            }}
            className="w-4 h-4 text-red-600 rounded"
          />
          <span className="text-sm font-medium text-[#0B2D4D]">
            Has Allergies?
          </span>
        </label>
      </div>

      {!isCollapsed && data.hasAllergies && (
        <div className="mt-4 pt-3 border-t border-gray-200 space-y-3">
          {isConflict && (
            <div className="flex items-center bg-red-100 text-red-800 p-2 rounded-md text-xs font-semibold">
              <AlertTriangle className="w-4 h-4 mr-2 flex-shrink-0" />
              HARD RULE: Potential drug conflict with current medication
              detected!
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Type (Select all that apply)
              </label>
              <div className="flex flex-wrap gap-2">
                {["Drug", "Food", "Other"].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() =>
                      onUpdate({
                        ...data,
                        type: data.type.includes(type as any)
                          ? data.type.filter((t) => t !== type)
                          : [...data.type, type as any],
                      })
                    }
                    className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                      data.type.includes(type as any)
                        ? "bg-red-500 text-white border-red-700"
                        : "bg-gray-100 text-gray-600 border-gray-300"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Substance
              </label>
              <input
                type="text"
                value={data.substance}
                onChange={(e) =>
                  onUpdate({ ...data, substance: e.target.value })
                }
                className={InputStyle}
                placeholder="e.g., Penicillin"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Reaction / Severity
            </label>
            <div className="flex space-x-3">
              <input
                type="text"
                value={data.reaction}
                onChange={(e) =>
                  onUpdate({ ...data, reaction: e.target.value })
                }
                className={InputStyle}
                placeholder="e.g., Hives, Anaphylaxis (Max 160 chars)"
                maxLength={160}
              />
              <select
                value={data.severity}
                onChange={(e) =>
                  onUpdate({ ...data, severity: e.target.value })
                }
                className={`${InputStyle} w-32`}
              >
                <option value="">Severity</option>
                {MOCK_MASTERS.severity.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// -----------------------------------------------------------
// 4. Past & Medication History Section
// -----------------------------------------------------------

interface PastHistoryProps {
  data: PastHistory;
  onChange: (data: PastHistory) => void;
  chronicMeds: MedicationDetails[]; // To allow copying
}

export const PastHistorySection: React.FC<PastHistoryProps> = ({
  data,
  onChange,
  chronicMeds,
}) => {
  const toggleMedicationCopy = () => {
    onChange({ ...data, currentMedications: chronicMeds });
  };

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-md">
      <SectionHeader icon={User} title="Past & Medication History" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Illnesses */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[#0B2D4D]">
            Illnesses (Max 5)
          </label>
          {/* Simplified for demo: just show chips */}
          <div className="flex flex-wrap gap-1">
            {data.illnesses.map((i, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 bg-gray-200 rounded-full text-xs"
              >
                {i}
              </span>
            ))}
          </div>
          <input
            type="text"
            className={InputStyle}
            placeholder="Add new illness"
          />
        </div>
        {/* Surgeries */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[#0B2D4D]">
            Surgeries (Year Picker)
          </label>
          {/* Simplified for demo */}
          <input
            type="text"
            className={InputStyle}
            placeholder="Add surgery + year"
          />
        </div>
        {/* Hospitalizations */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[#0B2D4D]">
            Hospitalizations
          </label>
          {/* Simplified for demo */}
          <input
            type="text"
            className={InputStyle}
            placeholder="Add reason + year"
          />
        </div>
      </div>

      <SectionHeader icon={Pill} title="Current Medications">
        <button
          onClick={toggleMedicationCopy}
          className="flex items-center space-x-1 px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-xs"
        >
          <Copy className="w-3 h-3" />
          <span>Copy from Chronic</span>
        </button>
      </SectionHeader>

      <div className="p-3 border-l-4 border-yellow-500 bg-yellow-50 text-sm text-gray-700">
        <p>Medication Table UI logic is complex and pending implementation.</p>
        {data.currentMedications.length > 0 && (
          <p className="mt-2 text-xs text-gray-600">
            Copied {data.currentMedications.length} items.
          </p>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-gray-200">
        <label className="block text-sm font-medium text-[#0B2D4D] mb-2">
          Overall Medication Compliance
        </label>
        <select
          value={data.overallCompliance}
          onChange={(e) =>
            onChange({ ...data, overallCompliance: e.target.value })
          }
          className={`${InputStyle} w-full md:w-1/3`}
        >
          {MOCK_MASTERS.compliance.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

// -----------------------------------------------------------
// 5. Previous Records Uploads & AI Clinical Summary Stubs
// -----------------------------------------------------------

interface RecordsUploadProps {
  // onFileUpload receives the File object after selection
  onFileUpload?: (file: File) => void;
}

export const RecordsUploadSection: React.FC<RecordsUploadProps> = ({
  onFileUpload,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Ref to trigger the hidden file input
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Function to handle the actual network transfer (MUST BE IMPLEMENTED)
  const uploadFileToServer = (file: File) => {
    // --- REAL UPLOAD LOGIC STARTS HERE ---
    console.log("File selected. Preparing to upload:", file.name);

    // 1. Create FormData
    const formData = new FormData();
    formData.append("labReport", file);

    // 2. Network Request (using fetch or axios)
    /*
    fetch('/api/upload-records', { 
        method: 'POST',
        body: formData,
    })
    .then(response => {
        if (!response.ok) throw new Error('Upload failed');
        return response.json();
    })
    .then(data => {
        console.log('Upload successful! Server response:', data);
        onFileUpload?.(file); // Notify parent component after successful upload
    })
    .catch(error => {
        console.error("Upload error:", error);
        // Handle error state (e.g., show message, clear file)
    });
    */
    // --- REAL UPLOAD LOGIC ENDS HERE ---

    // In this demo, we notify the parent immediately after selection for simplicity
    // The actual network call should happen asynchronously as shown above
    onFileUpload?.(file);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);
    if (file) {
      uploadFileToServer(file);
    }
    // Note: The file input's value must be cleared on remove/completion to re-upload the same file.
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const file = event.dataTransfer.files?.[0] || null;
    setSelectedFile(file);
    if (file) {
      uploadFileToServer(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const removeFile = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedFile(null);
    if (fileInputRef.current) {
      // Clear the input value so the onChange event fires again if the user selects the same file
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-md">
      <SectionHeader
        icon={Upload}
        title="Previous Records Uploads (OCR + NLP)"
      />

      {/* Hidden file input: Triggered by clicking the custom drop zone */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept=".pdf,.docx,.jpg,.jpeg,.png"
      />

      <div
        className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center bg-gray-50 hover:bg-gray-100 transition duration-150 cursor-pointer"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => fileInputRef.current?.click()} // Main trigger
      >
        {selectedFile ? (
          <div className="flex items-center justify-between p-2 bg-white border border-green-300 rounded-md">
            <div className="flex items-center space-x-2 truncate">
              <FileText className="w-5 h-5 text-green-600 flex-shrink-0" />
              <p className="text-sm font-medium text-green-700 truncate">
                {selectedFile.name}
              </p>
              <span className="text-xs text-gray-500 flex-shrink-0">
                ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
              </span>
            </div>
            <button
              onClick={removeFile}
              className="p-1 text-red-500 hover:text-red-700 rounded-full flex-shrink-0"
              title="Remove File"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <>
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-[#1a4b7a] mb-2 font-medium">
              Drag and drop a file here, or click to browse
            </p>
            <p className="text-xs text-gray-500">
              Accepted formats: PDF, DOCX, JPG, PNG
            </p>
            <p className="text-xs text-yellow-600 mt-2 font-semibold">
              To fully enable "uploading," you must uncomment and configure the
              `fetch` API call inside `uploadFileToServer`.
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export const AiClinicalSummarySection: React.FC = () => (
  <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-md">
    <SectionHeader icon={Bot} title="AI Clinical Summary" />
    <div className="p-3 border border-blue-200 rounded-lg bg-blue-50">
      <p className="text-sm font-medium text-[#0B2D4D]">
        [AI Summary Placeholder]
      </p>
      <p className="text-xs text-blue-700 mt-2">
        This section must auto-populate with a single paragraph using all
        structured data from the sections above.
      </p>
    </div>
  </div>
);

// Export all components from a single file for cleaner imports
export const PreOPDIntakeSections = {
  PresentingComplaints,
  ChronicConditionsSection,
  AllergiesSection,
  PastHistorySection,
  RecordsUploadSection,
  AiClinicalSummarySection,
};
