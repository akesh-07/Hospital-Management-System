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
  Save,
  RotateCcw,
  ArrowLeft,
  Activity,
  Loader,
  CheckCircle,
  Eye,
  EyeOff,
  ClipboardCopy,
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

// --- CONSTANTS & MOCK DATA (Extracted from PreOPDIntake.tsx) ---
export const MOCK_MASTERS = {
  complaints: [
    { label: "Chest Pain", redFlag: true, specialty: "Cardiology" },
    { label: "Shortness of Breath", redFlag: true, specialty: "Cardiology" },
    { label: "Severe Headache", redFlag: true, specialty: "Neurology" },
    { label: "High Fever", redFlag: true, specialty: "General Medicine" },
    { label: "Abdominal Pain", redFlag: false, specialty: "Gastroenterology" },
    { label: "Fever", redFlag: false, specialty: "General Medicine" },
    { label: "Cough", redFlag: false, specialty: "Pulmonology" },
    { label: "Headache", redFlag: false, specialty: "Neurology" },
    { label: "Diarrhea", redFlag: false, specialty: "Gastroenterology" },
    { label: "Back Pain", redFlag: false, specialty: "Orthopedics" },
  ],
  chronicConditions: [
    "Diabetes Mellitus",
    "Hypertension",
    "Asthma",
    "COPD",
    "Chronic Kidney Disease",
    "Coronary Artery Disease",
    "Hyperthyroidism",
    "Hypothyroidism",
    "Rheumatoid Arthritis",
    "Osteoarthritis",
  ],
  medications: [
    "Metformin",
    "Insulin",
    "Amlodipine",
    "Lisinopril",
    "Atorvastatin",
    "Aspirin",
    "Levothyroxine",
    "Salbutamol",
    "Prednisolone",
    "Paracetamol",
  ],
  frequencies: ["OD", "BD", "TDS", "QHS", "QID", "PRN", "Weekly", "Monthly"],
  routes: ["Oral", "SC", "IV", "IM", "Inhaled", "Topical", "Sublingual"],
  severity: ["Mild", "Moderate", "Severe"],
  compliance: ["Taking", "Missed", "Ran out", "Unknown"],
};

export const InputStyle =
  "p-2 border border-gray-300 rounded-md w-full bg-white focus:ring-2 focus:ring-[#012e58] focus:border-[#012e58] transition duration-200 ease-in-out text-[#0B2D4D] placeholder:text-gray-500 text-sm";

// Helper component for section headers (also required by the sections)
export const SectionHeader: React.FC<{
  icon: React.ElementType;
  title: string;
}> = ({ icon: Icon, title }) => (
  <div className="flex items-center space-x-2 mb-4">
    <div className="p-1.5 rounded-lg bg-[#e0f7fa]">
      <Icon className="w-5 h-5 text-[#012e58]" />
    </div>
    <h2 className="text-lg font-bold text-[#0B2D4D] tracking-tight">{title}</h2>
  </div>
);

// Presenting Complaints Section
interface PresentingComplaintsSectionProps {
  data: Complaint[];
  onChange: (data: Complaint[]) => void;
}

export const PresentingComplaintsSection: React.FC<
  PresentingComplaintsSectionProps
> = ({ data, onChange }) => {
  const addComplaint = () => {
    if (data.length >= 5) return; // Max 5 complaints
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
          // Auto-derive specialty and red flag
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
    onChange(data.filter((c) => c.id !== id));
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <List className="w-5 h-5 text-[#012e58]" />
            <h2 className="text-lg font-semibold text-[#0B2D4D]">
              2. Presenting Complaint(s){" "}
              {data.length > 0 && `(${data.length}/5)`}
            </h2>
          </div>
          <button
            onClick={addComplaint}
            disabled={data.length >= 5}
            className="flex items-center space-x-1 px-3 py-1 bg-[#012e58] text-white rounded-md hover:bg-[#1a4b7a] transition-colors text-sm disabled:bg-gray-400"
          >
            <Plus className="w-4 h-4" />
            <span>Add Complaint</span>
          </button>
        </div>
      </div>

      <div className="p-4">
        {data.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <List className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No complaints recorded yet</p>
            <p className="text-sm">Click "Add Complaint" to start</p>
          </div>
        ) : (
          <div className="space-y-4">
            {data.map((complaint) => (
              <div
                key={complaint.id}
                className="p-4 border border-gray-200 rounded-lg bg-gray-50"
              >
                <div className="grid grid-cols-12 gap-3 items-end">
                  {/* Complaint */}
                  <div className="col-span-4">
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Chief Complaint
                    </label>
                    <input
                      type="text"
                      list={`complaint-list-${complaint.id}`}
                      value={complaint.complaint}
                      onChange={(e) =>
                        updateComplaint(
                          complaint.id,
                          "complaint",
                          e.target.value
                        )
                      }
                      className={InputStyle}
                      placeholder="e.g., Chest Pain"
                    />
                    <datalist id={`complaint-list-${complaint.id}`}>
                      {MOCK_MASTERS.complaints.map((m) => (
                        <option key={m.label} value={m.label} />
                      ))}
                    </datalist>
                  </div>

                  {/* Severity */}
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Severity
                    </label>
                    <select
                      value={complaint.severity}
                      onChange={(e) =>
                        updateComplaint(
                          complaint.id,
                          "severity",
                          e.target.value
                        )
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

                  {/* Duration */}
                  <div className="col-span-3">
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Duration
                    </label>
                    <div className="flex space-x-1">
                      <input
                        type="text"
                        value={complaint.duration.value}
                        onChange={(e) =>
                          updateComplaint(complaint.id, "duration", {
                            ...complaint.duration,
                            value: e.target.value,
                          })
                        }
                        className={`${InputStyle} flex-1`}
                        placeholder="3"
                      />
                      <select
                        value={complaint.duration.unit}
                        onChange={(e) =>
                          updateComplaint(complaint.id, "duration", {
                            ...complaint.duration,
                            unit: e.target.value,
                          })
                        }
                        className={`${InputStyle} w-16`}
                      >
                        <option value="h">hrs</option>
                        <option value="d">days</option>
                        <option value="w">wks</option>
                        <option value="mo">mos</option>
                        <option value="yr">yrs</option>
                      </select>
                    </div>
                  </div>

                  {/* Specialty (Auto-derived) */}
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Specialty
                    </label>
                    <div className="p-2 bg-gray-100 border border-gray-200 rounded-md text-sm text-gray-700">
                      {complaint.specialty || "Auto-derived"}
                    </div>
                  </div>

                  {/* Delete */}
                  <div className="col-span-1 flex justify-end">
                    <button
                      onClick={() => removeComplaint(complaint.id)}
                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Red Flag Alert */}
                  {complaint.redFlagTriggered && (
                    <div className="col-span-12 mt-2">
                      <div className="flex items-center bg-red-100 text-red-800 p-2 rounded-md text-sm font-semibold">
                        <AlertTriangle className="w-4 h-4 mr-2 flex-shrink-0" />
                        🚨 RED FLAG: Severe {complaint.complaint.toLowerCase()}{" "}
                        requires immediate attention!
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Chronic Conditions Section with Enhanced Features
interface ChronicConditionsSectionProps {
  data: ChronicCondition[];
  onChange: (data: ChronicCondition[]) => void;
}

export const ChronicConditionsSection: React.FC<
  ChronicConditionsSectionProps
> = ({ data, onChange }) => {
  const [selectedCondition, setSelectedCondition] = useState<string | null>(
    null
  );
  const [showAddForm, setShowAddForm] = useState(false);

  const addCondition = (conditionName: string) => {
    const newCondition: ChronicCondition = {
      id: Date.now().toString(),
      name: conditionName,
      duration: "Unknown",
      onMedication: "Unknown",
      medications: [],
    };
    onChange([...data, newCondition]);
    setSelectedCondition(newCondition.id);
    setShowAddForm(false);
  };

  const updateCondition = (id: string, updates: Partial<ChronicCondition>) => {
    onChange(data.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  };

  const removeCondition = (id: string) => {
    onChange(data.filter((c) => c.id !== id));
    if (selectedCondition === id) {
      setSelectedCondition(null);
    }
  };

  const addMedicationToCondition = (conditionId: string) => {
    const newMedication: MedicationDetails = {
      id: Date.now().toString(),
      name: "",
      dose: "",
      frequency: "OD",
      route: "Oral",
      duration: "Unknown",
      compliance: "Unknown",
      notes: "",
    };

    updateCondition(conditionId, {
      medications: [
        ...(data.find((c) => c.id === conditionId)?.medications || []),
        newMedication,
      ],
    });
  };

  const updateMedication = (
    conditionId: string,
    medicationId: string,
    updates: Partial<MedicationDetails>
  ) => {
    const condition = data.find((c) => c.id === conditionId);
    if (condition) {
      const updatedMedications = condition.medications.map((m) =>
        m.id === medicationId ? { ...m, ...updates } : m
      );
      updateCondition(conditionId, { medications: updatedMedications });
    }
  };

  const removeMedication = (conditionId: string, medicationId: string) => {
    const condition = data.find((c) => c.id === conditionId);
    if (condition) {
      const updatedMedications = condition.medications.filter(
        (m) => m.id !== medicationId
      );
      updateCondition(conditionId, { medications: updatedMedications });
    }
  };

  // Check for uncontrolled conditions based on medications
  const getUncontrolledWarning = (condition: ChronicCondition) => {
    if (
      (condition.name.toLowerCase().includes("diabetes") ||
        condition.name.toLowerCase().includes("hypertension")) &&
      condition.medications.length === 0
    ) {
      return "⚠️ No medications recorded - suggests possible poor control or unmanaged condition.";
    }
    return null;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <HeartPulse className="w-5 h-5 text-[#012e58]" />
            <h2 className="text-lg font-semibold text-[#0B2D4D]">
              3. Chronic Conditions {data.length > 0 && `(${data.length})`}
            </h2>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center space-x-1 px-3 py-1 bg-[#012e58] text-white rounded-md hover:bg-[#1a4b7a] transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Condition</span>
          </button>
        </div>
      </div>

      <div className="p-4">
        {/* Quick Add from Master List */}
        {showAddForm && (
          <div className="mb-4 p-3 border border-blue-200 rounded-lg bg-blue-50">
            <h4 className="font-medium text-[#0B2D4D] mb-2">
              Select from common conditions:
            </h4>
            <div className="flex flex-wrap gap-2">
              {MOCK_MASTERS.chronicConditions
                .filter((condition) => !data.some((d) => d.name === condition))
                .map((condition) => (
                  <button
                    key={condition}
                    onClick={() => addCondition(condition)}
                    className="px-3 py-1 text-sm bg-white text-blue-800 rounded-full border border-blue-300 hover:bg-blue-100 transition-colors"
                  >
                    {condition}
                  </button>
                ))}
            </div>
            <div className="mt-2 flex items-center space-x-2">
              <input
                type="text"
                placeholder="Or type custom condition..."
                className="flex-1 p-2 border border-gray-300 rounded-md text-sm"
                onKeyPress={(e) => {
                  if (e.key === "Enter" && e.currentTarget.value.trim()) {
                    addCondition(e.currentTarget.value.trim());
                    e.currentTarget.value = "";
                  }
                }}
              />
              <button
                onClick={() => setShowAddForm(false)}
                className="px-3 py-1 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-100"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Condition Cards */}
        {data.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <HeartPulse className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No chronic conditions recorded</p>
            <p className="text-sm">Click "Add Condition" to start</p>
          </div>
        ) : (
          <div className="space-y-4">
            {data.map((condition) => {
              const uncontrolledWarning = getUncontrolledWarning(condition);
              const isExpanded = selectedCondition === condition.id;

              return (
                <div
                  key={condition.id}
                  className={`border rounded-lg transition-all ${
                    isExpanded ? "border-blue-300 shadow-md" : "border-gray-200"
                  }`}
                >
                  {/* Condition Header */}
                  <div
                    className={`p-4 cursor-pointer ${
                      isExpanded ? "bg-blue-50" : "bg-gray-50 hover:bg-gray-100"
                    }`}
                    onClick={() =>
                      setSelectedCondition(isExpanded ? null : condition.id)
                    }
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-semibold text-[#0B2D4D]">
                            {condition.name}
                          </h4>
                          <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full border border-blue-200">
                            {condition.medications.length} med
                            {condition.medications.length !== 1 ? "s" : ""}
                          </span>
                        </div>
                        {uncontrolledWarning && (
                          <span className="text-xs text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full border border-orange-200">
                            May be uncontrolled
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeCondition(condition.id);
                          }}
                          className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <div className="p-1 rounded">
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-gray-500" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-gray-500" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="p-4 border-t border-gray-200 bg-white">
                      {/* Condition Details */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Duration
                          </label>
                          <select
                            value={
                              typeof condition.duration === "string"
                                ? condition.duration
                                : "Custom"
                            }
                            onChange={(e) =>
                              updateCondition(condition.id, {
                                duration:
                                  e.target.value === "Unknown"
                                    ? "Unknown"
                                    : {
                                        years: parseInt(e.target.value) || 0,
                                        months: 0,
                                      },
                              })
                            }
                            className={InputStyle}
                          >
                            <option value="Unknown">Unknown</option>
                            <option value="< 1 year">Less than 1 year</option>
                            <option value="1-5 years">1-5 years</option>
                            <option value="5-10 years">5-10 years</option>
                            <option value="> 10 years">
                              More than 10 years
                            </option>
                            <option value="Custom">Custom</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            On Medication
                          </label>
                          <select
                            value={condition.onMedication}
                            onChange={(e) =>
                              updateCondition(condition.id, {
                                onMedication: e.target.value as any,
                              })
                            }
                            className={InputStyle}
                          >
                            <option value="Unknown">Unknown</option>
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                          </select>
                        </div>
                        <div className="flex items-end">
                          <button
                            onClick={() =>
                              addMedicationToCondition(condition.id)
                            }
                            className="flex items-center space-x-1 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
                          >
                            <Plus className="w-4 h-4" />
                            <span>Add Medication</span>
                          </button>
                        </div>
                      </div>

                      {/* Uncontrolled Warning */}
                      {uncontrolledWarning && (
                        <div className="mb-4 p-3 bg-orange-100 border border-orange-200 rounded-md">
                          <p className="text-sm text-orange-800">
                            {uncontrolledWarning}
                          </p>
                        </div>
                      )}

                      {/* Medications Table */}
                      {condition.medications.length > 0 && (
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                          <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                            <h5 className="font-medium text-[#0B2D4D] flex items-center space-x-2">
                              <Pill className="w-4 h-4" />
                              <span>
                                Medications ({condition.medications.length})
                              </span>
                            </h5>
                          </div>
                          <div className="overflow-x-auto">
                            <table className="w-full">
                              <thead className="bg-gray-100">
                                <tr className="text-xs text-gray-600">
                                  <th className="text-left p-2 w-1/4">
                                    Medication
                                  </th>
                                  <th className="text-left p-2 w-1/5">Dose</th>
                                  <th className="text-left p-2 w-1/6">
                                    Frequency
                                  </th>
                                  <th className="text-left p-2 w-1/6">Route</th>
                                  <th className="text-left p-2 w-1/6">
                                    Compliance
                                  </th>
                                  <th className="text-left p-2 w-1/12">
                                    Actions
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {condition.medications.map((medication) => (
                                  <tr
                                    key={medication.id}
                                    className="border-t border-gray-100"
                                  >
                                    <td className="p-2">
                                      <input
                                        type="text"
                                        list="medication-list"
                                        value={medication.name}
                                        onChange={(e) =>
                                          updateMedication(
                                            condition.id,
                                            medication.id,
                                            {
                                              name: e.target.value,
                                            }
                                          )
                                        }
                                        className="w-full p-1 border border-gray-300 rounded text-sm"
                                        placeholder="Medication name"
                                      />
                                      <datalist id="medication-list">
                                        {MOCK_MASTERS.medications.map((med) => (
                                          <option key={med} value={med} />
                                        ))}
                                      </datalist>
                                    </td>
                                    <td className="p-2">
                                      <input
                                        type="text"
                                        value={medication.dose}
                                        onChange={(e) =>
                                          updateMedication(
                                            condition.id,
                                            medication.id,
                                            {
                                              dose: e.target.value,
                                            }
                                          )
                                        }
                                        className="w-full p-1 border border-gray-300 rounded text-sm"
                                        placeholder="e.g., 500mg"
                                      />
                                    </td>
                                    <td className="p-2">
                                      <select
                                        value={medication.frequency}
                                        onChange={(e) =>
                                          updateMedication(
                                            condition.id,
                                            medication.id,
                                            {
                                              frequency: e.target.value,
                                            }
                                          )
                                        }
                                        className="w-full p-1 border border-gray-300 rounded text-sm"
                                      >
                                        {MOCK_MASTERS.frequencies.map(
                                          (freq) => (
                                            <option key={freq} value={freq}>
                                              {freq}
                                            </option>
                                          )
                                        )}
                                      </select>
                                    </td>
                                    <td className="p-2">
                                      <select
                                        value={medication.route}
                                        onChange={(e) =>
                                          updateMedication(
                                            condition.id,
                                            medication.id,
                                            {
                                              route: e.target.value,
                                            }
                                          )
                                        }
                                        className="w-full p-1 border border-gray-300 rounded text-sm"
                                      >
                                        {MOCK_MASTERS.routes.map((route) => (
                                          <option key={route} value={route}>
                                            {route}
                                          </option>
                                        ))}
                                      </select>
                                    </td>
                                    <td className="p-2">
                                      <select
                                        value={medication.compliance}
                                        onChange={(e) =>
                                          updateMedication(
                                            condition.id,
                                            medication.id,
                                            {
                                              compliance: e.target.value,
                                            }
                                          )
                                        }
                                        className="w-full p-1 border border-gray-300 rounded text-sm"
                                      >
                                        {MOCK_MASTERS.compliance.map((comp) => (
                                          <option key={comp} value={comp}>
                                            {comp}
                                          </option>
                                        ))}
                                      </select>
                                    </td>
                                    <td className="p-2">
                                      <button
                                        onClick={() =>
                                          removeMedication(
                                            condition.id,
                                            medication.id
                                          )
                                        }
                                        className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

// Allergies Section
interface AllergiesSectionProps {
  data: Allergy;
  onChange: (data: Allergy) => void;
  allMeds: MedicationDetails[];
}

export const AllergiesSection: React.FC<AllergiesSectionProps> = ({
  data,
  onChange,
  allMeds,
}) => {
  const [isExpanded, setIsExpanded] = useState(data.hasAllergies);

  const toggleAllergies = (hasAllergies: boolean) => {
    onChange({ ...data, hasAllergies });
    setIsExpanded(hasAllergies);
  };

  const updateAllergyType = (type: "Drug" | "Food" | "Other") => {
    const newTypes = data.type.includes(type)
      ? data.type.filter((t) => t !== type)
      : [...data.type, type];
    onChange({ ...data, type: newTypes });
  };

  // Check for drug conflicts
  const drugConflicts = useMemo(() => {
    if (!data.hasAllergies || !data.type.includes("Drug") || !data.substance) {
      return [];
    }
    const allergySubstance = data.substance.toLowerCase();
    // Simple mock conflict check: checks if the substance is part of any medication name
    return allMeds.filter((med) =>
      med.name.toLowerCase().includes(allergySubstance)
    );
  }, [data, allMeds]);

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center space-x-2">
            <Syringe className="w-5 h-5 text-[#012e58]" />
            <h2 className="text-lg font-semibold text-[#0B2D4D]">
              4. Allergies (Drug, Food, Other)
            </h2>
          </div>
          <div className="flex items-center space-x-3">
            <span
              className={`px-3 py-1 text-xs font-semibold rounded-full ${
                data.hasAllergies
                  ? "bg-red-100 text-red-700 border border-red-200"
                  : "bg-green-100 text-green-700 border border-green-200"
              }`}
            >
              {data.hasAllergies ? "Yes" : "No"}
            </span>
            <div className="p-1 rounded-full bg-gray-200">
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="p-4">
        <label className="flex items-center space-x-2 mb-4">
          <input
            type="checkbox"
            checked={data.hasAllergies}
            onChange={(e) => toggleAllergies(e.target.checked)}
            className="w-4 h-4 text-red-600 rounded border-gray-300 focus:ring-red-500"
          />
          <span className="text-sm font-medium text-[#0B2D4D]">
            Patient has known allergies
          </span>
        </label>

        {isExpanded && data.hasAllergies && (
          <div className="space-y-4 pt-3 border-t border-gray-200">
            {/* Drug Conflict Banner */}
            {drugConflicts.length > 0 && (
              <div className="flex items-start bg-red-100 text-red-800 p-3 rounded-md border border-red-200">
                <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm">
                    Drug Conflict Detected!
                  </p>
                  <p className="text-sm">
                    Patient is allergic to **"{data.substance}"** but is
                    currently prescribed: **
                    {drugConflicts.map((med) => med.name).join(", ")}**
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Allergy Types */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Allergy Type(s)
                </label>
                <div className="flex flex-wrap gap-2">
                  {(["Drug", "Food", "Other"] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => updateAllergyType(type)}
                      className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                        data.type.includes(type)
                          ? "bg-red-500 text-white border-red-600"
                          : "bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Substance */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Substance/Allergen
                </label>
                <input
                  type="text"
                  value={data.substance}
                  onChange={(e) =>
                    onChange({ ...data, substance: e.target.value })
                  }
                  className={InputStyle}
                  placeholder="e.g., Penicillin, Peanuts, Latex"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Reaction */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reaction Description
                </label>
                <input
                  type="text"
                  value={data.reaction}
                  onChange={(e) =>
                    onChange({ ...data, reaction: e.target.value })
                  }
                  className={InputStyle}
                  placeholder="e.g., Hives, Swelling, Difficulty breathing"
                  maxLength={160}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {data.reaction.length}/160 characters
                </p>
              </div>

              {/* Severity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Severity Level
                </label>
                <div className="flex space-x-2">
                  {MOCK_MASTERS.severity.map((severity) => (
                    <button
                      key={severity}
                      type="button"
                      onClick={() => onChange({ ...data, severity })}
                      className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                        data.severity === severity
                          ? severity === "Severe"
                            ? "bg-red-500 text-white border-red-600"
                            : severity === "Moderate"
                            ? "bg-yellow-500 text-white border-yellow-600"
                            : "bg-green-500 text-white border-green-600"
                          : "bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200"
                      }`}
                    >
                      {severity}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Past History Section (Simplified)
interface PastHistorySectionProps {
  data: PastHistory;
  onChange: (data: PastHistory) => void;
  chronicMeds: MedicationDetails[];
}

export const PastHistorySection: React.FC<PastHistorySectionProps> = ({
  data,
  onChange,
  chronicMeds,
}) => {
  const copyFromChronic = () => {
    onChange({ ...data, currentMedications: [...chronicMeds] });
  };

  const handleAddIllness = (value: string) => {
    const newIllness = value.trim();
    if (
      data.illnesses.length < 5 &&
      newIllness &&
      !data.illnesses.includes(newIllness)
    ) {
      onChange({
        ...data,
        illnesses: [...data.illnesses, newIllness],
      });
      return true; // Indicates success
    }
    return false;
  };

  const handleRemoveIllness = (illness: string) => {
    onChange({
      ...data,
      illnesses: data.illnesses.filter((i) => i !== illness),
    });
  };

  // NOTE: For brevity, Surgery and Hospitalization input logic remains simple text entry for this large merge.

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-2">
          <User className="w-5 h-5 text-[#012e58]" />
          <h2 className="text-lg font-semibold text-[#0B2D4D]">
            5. Past & Medication History
          </h2>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Past History Items as Chips */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Past Illnesses (Max 5)
            </label>
            <div className="flex flex-wrap gap-1 mb-2 min-h-[2.5rem]">
              {data.illnesses.map((illness, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full border border-blue-200"
                >
                  {illness}
                  <button
                    onClick={() => handleRemoveIllness(illness)}
                    className="ml-1 text-blue-600 hover:text-red-500"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <input
              type="text"
              className={InputStyle}
              placeholder="Add illness (press Enter)"
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  if (handleAddIllness(e.currentTarget.value)) {
                    e.currentTarget.value = "";
                  }
                }
              }}
              disabled={data.illnesses.length >= 5}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Past Surgeries
            </label>
            <div className="flex flex-wrap gap-1 mb-2">
              {data.surgeries.map((surgery, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full border border-purple-200"
                >
                  {surgery.name} ({surgery.year})
                </span>
              ))}
            </div>
            <input
              type="text"
              className={InputStyle}
              placeholder="Surgery name + year (e.g., Appy 2020)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Past Hospitalizations
            </label>
            <div className="flex flex-wrap gap-1 mb-2">
              {data.hospitalizations.map((hosp, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full border border-orange-200"
                >
                  {hosp.reason} ({hosp.year})
                </span>
              ))}
            </div>
            <input
              type="text"
              className={InputStyle}
              placeholder="Reason + year (e.g., Pneumonia 2019)"
            />
          </div>
        </div>

        {/* Current Medications */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Pill className="w-5 h-5 text-[#012e58]" />
              <h3 className="text-md font-semibold text-[#0B2D4D]">
                Current Medications
              </h3>
            </div>
            {chronicMeds.length > 0 && (
              <button
                onClick={copyFromChronic}
                className="flex items-center space-x-1 px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
              >
                <Copy className="w-4 h-4" />
                <span>Copy from Chronic ({chronicMeds.length})</span>
              </button>
            )}
          </div>

          <div className="p-4 border-l-4 border-yellow-500 bg-yellow-50 text-sm text-gray-700 rounded-r-md">
            <p className="font-semibold text-yellow-800 mb-1">
              Medication Table Implementation Note:
            </p>
            <p>
              The medications currently listed below are for calculation (e.g.,
              allergy check) only. The interactive table UI is complex and is
              pending full implementation here.
            </p>
            {data.currentMedications.length > 0 && (
              <p className="mt-2 text-xs text-gray-600">
                Currently displaying:{" "}
                {data.currentMedications.map((m) => m.name).join(", ")}
              </p>
            )}
          </div>
        </div>

        {/* Overall Compliance */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Overall Medication Compliance
          </label>
          <select
            value={data.overallCompliance}
            onChange={(e) =>
              onChange({ ...data, overallCompliance: e.target.value })
            }
            className={`${InputStyle} w-full md:w-1/3`}
          >
            {MOCK_MASTERS.compliance.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

// Records Upload Section with MOCK Upload/OCR Logic
export const RecordsUploadSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState("lab-reports");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploadedFiles, setUploadedFiles] = useState<{
    [key: string]: Array<{
      id: string;
      name: string;
      type: string;
      size: number;
      status: "uploading" | "processing" | "completed" | "error";
      confidence: number;
      extractedData?: any;
    }>;
  }>({
    "lab-reports": [],
    radiology: [],
    prescriptions: [],
    "discharge-summaries": [],
    other: [],
  });

  const categories = [
    { id: "lab-reports", label: "Lab Reports", icon: "🧪" },
    { id: "radiology", label: "Radiology", icon: "🩻" },
    { id: "prescriptions", label: "Prescriptions", icon: "💊" },
    { id: "discharge-summaries", label: "Discharge", icon: "📋" },
    { id: "other", label: "Other", icon: "📄" },
  ];

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Here, we simulate the actual upload and processing
      mockUploadProcess(activeTab, file);
    }
    // Clear the input value so the onChange event fires again if the user selects the same file
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const mockUploadProcess = (categoryId: string, file: File) => {
    const mockFile = {
      id: Date.now().toString(),
      name: file.name,
      type: file.type,
      size: file.size,
      status: "uploading" as const,
      confidence: 0,
    };

    setUploadedFiles((prev) => ({
      ...prev,
      [categoryId]: [...(prev[categoryId] || []), mockFile],
    }));

    // NOTE: To make this "really upload," replace this mock with a fetch/axios call
    // to your backend, and update the status based on the server's response.

    // Simulate upload and processing
    setTimeout(() => {
      setUploadedFiles((prev) => ({
        ...prev,
        [categoryId]: prev[categoryId].map((f) =>
          f.id === mockFile.id ? { ...f, status: "processing" as const } : f
        ),
      }));
    }, 1000);

    setTimeout(() => {
      const confidence = Math.floor(Math.random() * 30) + 70; // 70-100%
      const extractedData = {
        "lab-reports": {
          tests: ["CBC", "Lipid Profile", "HbA1c"],
          values: [
            "Hemoglobin: 12.5 g/dL",
            "Cholesterol: 180 mg/dL",
            "HbA1c: 6.2%",
          ],
        },
        radiology: {
          findings: ["Normal chest X-ray", "No acute findings"],
          impression: "No significant abnormality",
        },
        prescriptions: {
          medications: ["Metformin 500mg BD", "Amlodipine 5mg OD"],
          doctor: "Dr. Smith",
        },
      }[categoryId] || { content: "Document processed successfully" };

      setUploadedFiles((prev) => ({
        ...prev,
        [categoryId]: prev[categoryId].map((f) =>
          f.id === mockFile.id
            ? {
                ...f,
                status: "completed" as const,
                confidence,
                extractedData,
              }
            : f
        ),
      }));
    }, 3000);
  };

  const removeFile = (categoryId: string, fileId: string) => {
    setUploadedFiles((prev) => ({
      ...prev,
      [categoryId]: prev[categoryId].filter((file) => file.id !== fileId),
    }));
  };

  const getStatusBadge = (status: string, confidence?: number) => {
    let color: "green" | "yellow" | "red" | "blue" | "gray" = "gray";
    let text = "";

    switch (status) {
      case "uploading":
        color = "blue";
        text = "Uploading...";
        break;
      case "processing":
        color = "yellow";
        text = "Processing OCR...";
        break;
      case "completed":
        if (confidence && confidence >= 90) color = "green";
        else if (confidence && confidence >= 70) color = "yellow";
        else color = "red";
        text = `✓ ${confidence}% confident`;
        break;
      case "error":
        color = "red";
        text = "Error";
        break;
      default:
        return null;
    }
    return (
      <span
        className={`px-2 py-0.5 text-xs bg-${color}-100 text-${color}-700 rounded-full`}
      >
        {text}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-2">
          <Upload className="w-5 h-5 text-[#012e58]" />
          <h2 className="text-lg font-semibold text-[#0B2D4D]">
            6. Previous Records Upload (OCR + NLP)
          </h2>
        </div>
      </div>

      <div className="p-4">
        {/* Hidden file input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept=".pdf,.docx,.jpg,.jpeg,.png"
          // To allow multiple files, uncomment the 'multiple' attribute:
          // multiple
        />

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 mb-4 border-b border-gray-200">
          {categories.map((category) => {
            const fileCount = uploadedFiles[category.id]?.length || 0;
            return (
              <button
                key={category.id}
                onClick={() => setActiveTab(category.id)}
                className={`flex items-center space-x-2 px-3 py-2 text-sm rounded-t-md border-b-2 transition-colors ${
                  activeTab === category.id
                    ? "border-[#012e58] text-[#012e58] bg-blue-50"
                    : "border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                }`}
              >
                <span>{category.icon}</span>
                <span>{category.label}</span>
                {fileCount > 0 && (
                  <span className="px-1.5 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full">
                    {fileCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Upload Area */}
        <div className="mb-4">
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
            onClick={triggerFileUpload}
          >
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-2 font-medium">
              Upload {categories.find((c) => c.id === activeTab)?.label} files
            </p>
            <p className="text-xs text-gray-500 mb-3">
              Drag and drop or **click to browse** • PDF, DOCX, JPG, PNG
            </p>
            <div className="px-4 py-2 bg-[#012e58] text-white rounded-md hover:bg-[#1a4b7a] transition-colors text-sm inline-block">
              Browse Files
            </div>
          </div>
        </div>

        {/* Uploaded Files */}
        {uploadedFiles[activeTab]?.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-[#0B2D4D]">
              Uploaded Files ({uploadedFiles[activeTab].length})
            </h4>
            {uploadedFiles[activeTab].map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-gray-50"
              >
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">📄</div>
                  <div>
                    <p className="text-sm font-medium text-[#0B2D4D]">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  {getStatusBadge(file.status, file.confidence)}
                  <button
                    onClick={() => removeFile(activeTab, file.id)}
                    className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Extracted Data Preview */}
        {uploadedFiles[activeTab]?.some(
          (file) => file.status === "completed" && file.extractedData
        ) && (
          <div className="mt-4 p-4 border border-blue-200 rounded-lg bg-blue-50">
            <h4 className="font-medium text-[#0B2D4D] mb-2 flex items-center space-x-2">
              <Bot className="w-4 h-4" />
              <span>Extracted Data (Verify & Apply)</span>
            </h4>
            {uploadedFiles[activeTab]
              .filter(
                (file) => file.status === "completed" && file.extractedData
              )
              .map((file) => (
                <div
                  key={file.id}
                  className="mb-3 p-3 bg-white border border-blue-200 rounded"
                >
                  <p className="text-sm font-medium text-[#0B2D4D] mb-2">
                    From: {file.name}
                  </p>
                  <div className="text-sm text-gray-700 space-y-1">
                    {Object.entries(file.extractedData || {}).map(
                      ([key, value]) => (
                        <div key={key} className="flex">
                          <span className="font-medium w-1/4 capitalize">
                            {key.replace(/([A-Z])/g, " $1")}:
                          </span>
                          <span className="w-3/4">
                            {Array.isArray(value)
                              ? value.join(", ")
                              : String(value)}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                  <div className="mt-2 flex space-x-2">
                    <button className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700">
                      Apply to Form
                    </button>
                    <button className="px-3 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700">
                      Edit First
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

// AI Clinical Summary Section
interface AiClinicalSummarySectionProps {
  summary: string;
  isLoading: boolean;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onGenerate: () => void;
}

export const AiClinicalSummarySection: React.FC<
  AiClinicalSummarySectionProps
> = ({ summary, isLoading, isExpanded, onToggleExpand, onGenerate }) => {
  const copyToClipboard = () => {
    navigator.clipboard.writeText(summary);
    // Could add a toast notification here
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bot className="w-5 h-5 text-[#012e58]" />
            <h2 className="text-lg font-semibold text-[#0B2D4D]">
              7. AI Clinical Summary
            </h2>
          </div>
          <div className="flex items-center space-x-2">
            {summary && (
              <>
                <button
                  onClick={copyToClipboard}
                  className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                >
                  <ClipboardCopy className="w-4 h-4" />
                  <span>Copy to EMR</span>
                </button>
                <button
                  onClick={onToggleExpand}
                  className="p-1 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
                >
                  {isExpanded ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </>
            )}
            <button
              onClick={onGenerate}
              disabled={isLoading}
              className="flex items-center space-x-1 px-3 py-1 bg-[#012e58] text-white rounded-md hover:bg-[#1a4b7a] transition-colors text-sm disabled:bg-gray-400"
            >
              {isLoading ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                <Bot className="w-4 h-4" />
              )}
              <span>{isLoading ? "Generating..." : "Generate Summary"}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="p-4">
        {!summary && !isLoading && (
          <div className="text-center py-8 text-gray-500">
            <Bot className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No AI summary generated yet</p>
            <p className="text-sm">
              Click "Generate Summary" to create an automated clinical summary
            </p>
          </div>
        )}

        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader className="w-8 h-8 animate-spin text-[#012e58] mr-3" />
            <span className="text-gray-600">
              Analyzing patient data and generating summary...
            </span>
          </div>
        )}

        {summary && isExpanded && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="prose prose-sm max-w-none">
              <p className="text-gray-800 leading-relaxed">{summary}</p>
            </div>
          </div>
        )}

        {summary && !isExpanded && (
          <div className="p-3 bg-gray-100 border border-gray-200 rounded-lg">
            <p className="text-sm text-gray-600 truncate">
              {summary.substring(0, 150)}...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
