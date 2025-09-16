import React, { useState } from "react";
import { Copy, Plus, Bot, User } from "lucide-react";

// Type definitions
interface DiagnosisData {
  aiSuggested: string;
  doctorEntry: string;
}

interface LabInvestigationData {
  aiSuggestion: string;
  doctorEntry: string;
  aiTests: {
    cbc: boolean;
    lft: boolean;
    rft: boolean;
  };
  doctorTests: {
    cbc: boolean;
    lft: boolean;
    rft: boolean;
  };
}

interface MedicationRow {
  id: string;
  sno: number;
  aiMedication: string;
  aiTime: string;
  aiAdvice: string;
  doctorMedication: string;
  doctorTime: string;
  doctorAdvice: string;
}

const MedicalDashboard: React.FC = () => {
  // State management
  const [diagnosis, setDiagnosis] = useState<DiagnosisData>({
    aiSuggested: "Type 2 Diabetes Mellitus (E11.9)",
    doctorEntry: "",
  });

  const [labInvestigation, setLabInvestigation] =
    useState<LabInvestigationData>({
      aiSuggestion:
        "Complete metabolic panel recommended for diabetic monitoring",
      doctorEntry: "",
      aiTests: { cbc: true, lft: true, rft: false },
      doctorTests: { cbc: false, lft: false, rft: false },
    });

  const [medicationRows, setMedicationRows] = useState<MedicationRow[]>([
    {
      id: "1",
      sno: 1,
      aiMedication: "Metformin 500mg",
      aiTime: "8:00 AM, 8:00 PM",
      aiAdvice: "Take with meals",
      doctorMedication: "",
      doctorTime: "",
      doctorAdvice: "",
    },
  ]);

  // AI Auto Suggestion Lab data
  const aiLabSuggestions = [
    { test: "CBC", suggestion: "ingseation" },
    { test: "LFT", suggestion: "Information anaysis" },
    { test: "RFT", suggestion: "Einoricicin" },
  ];

  // Lab Results data
  const labResults = ["ECG", "X-RAY", "TCA-troraric", "In-xity coavortiatric"];

  // Copy functions
  const copyToField = (
    aiValue: string,
    field: "diagnosis" | "labInvestigation"
  ) => {
    if (field === "diagnosis") {
      setDiagnosis((prev) => ({ ...prev, doctorEntry: aiValue }));
    } else if (field === "labInvestigation") {
      setLabInvestigation((prev) => ({ ...prev, doctorEntry: aiValue }));
    }
  };

  const copyMedicationField = (
    rowId: string,
    field: "medication" | "time" | "advice",
    aiValue: string
  ) => {
    setMedicationRows((prev) =>
      prev.map((row) =>
        row.id === rowId
          ? {
              ...row,
              [`doctor${field.charAt(0).toUpperCase() + field.slice(1)}`]:
                aiValue,
            }
          : row
      )
    );
  };

  const copyAiTests = () => {
    setLabInvestigation((prev) => ({
      ...prev,
      doctorTests: { ...prev.aiTests },
    }));
  };

  // Handlers
  const handleDiagnosisChange = (value: string) => {
    setDiagnosis((prev) => ({ ...prev, doctorEntry: value }));
  };

  const handleLabInvestigationChange = (value: string) => {
    setLabInvestigation((prev) => ({ ...prev, doctorEntry: value }));
  };

  const handleTestChange = (test: "cbc" | "lft" | "rft") => {
    setLabInvestigation((prev) => ({
      ...prev,
      doctorTests: { ...prev.doctorTests, [test]: !prev.doctorTests[test] },
    }));
  };

  return (
    <div className="space-y-3 p-2 bg-gray-100 min-h-screen font-sans text-xs">
      {/* Diagnosis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <div className="w-full bg-white p-2 rounded shadow border border-gray-200">
          <div className="p-2 border-b border-gray-200">
            <h3 className="text-sm font-bold text-[#0B2D4D] tracking-tight">
              Diagnosis (ICD-10)
            </h3>
          </div>
          <div className="p-2 space-y-1">
            <div className="flex items-center gap-1">
              <div className="bg-[#012e58]/10 p-1 rounded">
                <User size={12} className="text-[#012e58]" />
              </div>
              <input
                type="text"
                placeholder="Enter diagnosis"
                value={diagnosis.doctorEntry}
                onChange={(e) => handleDiagnosisChange(e.target.value)}
                className="flex-1 p-1.5 border border-gray-300 rounded bg-gray-50 focus:ring-1 focus:ring-[#012e58] focus:border-[#012e58] transition duration-200 ease-in-out text-[#0B2D4D] placeholder:text-gray-500 text-xs"
              />
            </div>
          </div>
        </div>

        <div className="w-full bg-white p-2 rounded shadow border border-gray-200">
          <div className="p-2 border-b border-gray-200">
            <h3 className="text-sm font-bold text-[#0B2D4D] tracking-tight">
              AI-Suggested Diagnosis
            </h3>
          </div>
          <div className="p-2 space-y-1">
            <div className="flex items-center gap-1">
              <div className="bg-[#012e58]/10 p-1 rounded">
                <Bot size={12} className="text-[#012e58]" />
              </div>
              <input
                type="text"
                value={diagnosis.aiSuggested}
                readOnly
                className="flex-1 p-1.5 border border-gray-300 rounded bg-gray-50 text-[#0B2D4D] text-xs"
              />
              <button
                onClick={() => copyToField(diagnosis.aiSuggested, "diagnosis")}
                className="px-2 py-1 border border-[#012e58] rounded text-[#012e58] bg-white hover:bg-[#012e58] hover:text-white focus:outline-none focus:ring-1 focus:ring-[#012e58] transition-all duration-300"
              >
                <Copy size={10} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Lab Investigation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <div className="w-full bg-white p-2 rounded shadow border border-gray-200">
          <div className="p-2 border-b border-gray-200">
            <h3 className="text-sm font-bold text-[#0B2D4D] tracking-tight">
              Lab Investigation
            </h3>
          </div>
          <div className="p-2 space-y-2">
            <input
              type="text"
              placeholder="Enter lab investigation"
              value={labInvestigation.doctorEntry}
              onChange={(e) => handleLabInvestigationChange(e.target.value)}
              className="w-full p-1.5 border border-gray-300 rounded bg-gray-50 focus:ring-1 focus:ring-[#012e58] focus:border-[#012e58] transition duration-200 ease-in-out text-[#0B2D4D] placeholder:text-gray-500 text-xs"
            />
            <div className="flex flex-col gap-1">
              {(["cbc", "lft", "rft"] as const).map((test) => (
                <label
                  key={test}
                  className="flex items-center gap-1 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={labInvestigation.doctorTests[test]}
                    onChange={() => handleTestChange(test)}
                    className="w-3 h-3 text-[#012e58] border-gray-300 rounded focus:ring-[#012e58]"
                  />
                  <span className="text-xs font-medium text-[#0B2D4D]">
                    {test.toUpperCase()}
                  </span>
                </label>
              ))}
              <button
                onClick={copyAiTests}
                className="mt-1 px-2 py-1 text-xs border border-[#012e58] rounded text-[#012e58] bg-white hover:bg-[#012e58] hover:text-white focus:outline-none focus:ring-1 focus:ring-[#012e58] transition-all duration-300"
              >
                Copy AI Tests
              </button>
            </div>
          </div>
        </div>

        <div className="w-full bg-white p-2 rounded shadow border border-gray-200">
          <div className="p-2 border-b border-gray-200">
            <h3 className="text-sm font-bold text-[#0B2D4D] tracking-tight">
              AI Auto Suggestion Lab
            </h3>
          </div>
          <div className="p-2 space-y-1">
            {aiLabSuggestions.map((item, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center p-2 bg-gradient-to-r from-[#012e58]/5 to-[#012e58]/10 rounded border border-gray-200 hover:shadow-sm transition-all"
              >
                <span className="font-medium text-[#0B2D4D] text-xs">
                  {item.test}
                </span>
                <span className="text-xs text-[#1a4b7a]">
                  {item.suggestion}
                </span>
                <button
                  onClick={() =>
                    copyToField(item.suggestion, "labInvestigation")
                  }
                  className="px-1 py-0.5 border border-[#012e58] rounded text-[#012e58] bg-white hover:bg-[#012e58] hover:text-white focus:outline-none focus:ring-1 focus:ring-[#012e58] transition-all duration-300"
                >
                  <Copy size={10} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lab Results */}
      <div className="w-full bg-white p-2 rounded shadow border border-gray-200">
        <div className="p-2 border-b border-gray-200">
          <h3 className="text-sm font-bold text-[#0B2D4D] tracking-tight">
            Lab Results (Auto uploaded by lab technician)
          </h3>
        </div>
        <div className="p-2 flex gap-1 flex-wrap">
          {labResults.map((result, idx) => (
            <span
              key={idx}
              className="px-2 py-0.5 bg-gradient-to-r from-[#012e58]/5 to-[#012e58]/10 text-[#0B2D4D] text-xs rounded border border-gray-200"
            >
              {result}
            </span>
          ))}
        </div>
      </div>

      {/* AI-Suggested Medication Table */}
      <div className="w-full bg-white p-2 rounded shadow border border-gray-200">
        <div className="p-2 border-b border-gray-200">
          <h3 className="text-sm font-bold text-[#0B2D4D] tracking-tight">
            AI-Suggested Medication Table
          </h3>
        </div>
        <div className="p-2 overflow-x-auto">
          <table className="w-full text-xs border-collapse border border-gray-300">
            <thead className="bg-gradient-to-r from-[#012e58] to-[#1a4b7a] text-white">
              <tr>
                <th className="p-1 border border-gray-300 font-semibold text-xs">
                  S.No
                </th>
                <th className="p-1 border border-gray-300 font-semibold text-xs">
                  AI Medication
                </th>
                <th className="p-1 border border-gray-300 font-semibold text-xs">
                  Doctor Medication
                </th>
                <th className="p-1 border border-gray-300 font-semibold text-xs">
                  AI Time
                </th>
                <th className="p-1 border border-gray-300 font-semibold text-xs">
                  Doctor Time
                </th>
                <th className="p-1 border border-gray-300 font-semibold text-xs">
                  AI Advice
                </th>
                <th className="p-1 border border-gray-300 font-semibold text-xs">
                  Doctor Advice
                </th>
              </tr>
            </thead>
            <tbody>
              {medicationRows.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-[#012e58]/5 transition-colors"
                >
                  <td className="p-1 border border-gray-300 text-center text-[#0B2D4D]">
                    {row.sno}
                  </td>
                  <td className="p-1 border border-gray-300">
                    <div className="flex gap-1 items-center">
                      <span className="flex-1 text-[#0B2D4D] font-medium text-xs">
                        {row.aiMedication}
                      </span>
                      <button
                        onClick={() =>
                          copyMedicationField(
                            row.id,
                            "medication",
                            row.aiMedication
                          )
                        }
                        className="p-0.5 border border-[#012e58] rounded text-[#012e58] bg-white hover:bg-[#012e58] hover:text-white focus:outline-none focus:ring-1 focus:ring-[#012e58] transition-all duration-300"
                      >
                        <Copy size={10} />
                      </button>
                    </div>
                  </td>
                  <td className="p-1 border border-gray-300">
                    <input
                      type="text"
                      value={row.doctorMedication}
                      onChange={(e) =>
                        setMedicationRows((prev) =>
                          prev.map((r) =>
                            r.id === row.id
                              ? { ...r, doctorMedication: e.target.value }
                              : r
                          )
                        )
                      }
                      className="w-full p-1 border border-gray-300 rounded bg-gray-50 focus:ring-1 focus:ring-[#012e58] focus:border-[#012e58] transition duration-200 text-[#0B2D4D] text-xs"
                    />
                  </td>
                  <td className="p-1 border border-gray-300">
                    <div className="flex gap-1 items-center">
                      <span className="flex-1 text-[#0B2D4D] font-medium text-xs">
                        {row.aiTime}
                      </span>
                      <button
                        onClick={() =>
                          copyMedicationField(row.id, "time", row.aiTime)
                        }
                        className="p-0.5 border border-[#012e58] rounded text-[#012e58] bg-white hover:bg-[#012e58] hover:text-white focus:outline-none focus:ring-1 focus:ring-[#012e58] transition-all duration-300"
                      >
                        <Copy size={10} />
                      </button>
                    </div>
                  </td>
                  <td className="p-1 border border-gray-300">
                    <input
                      type="text"
                      value={row.doctorTime}
                      onChange={(e) =>
                        setMedicationRows((prev) =>
                          prev.map((r) =>
                            r.id === row.id
                              ? { ...r, doctorTime: e.target.value }
                              : r
                          )
                        )
                      }
                      className="w-full p-1 border border-gray-300 rounded bg-gray-50 focus:ring-1 focus:ring-[#012e58] focus:border-[#012e58] transition duration-200 text-[#0B2D4D] text-xs"
                    />
                  </td>
                  <td className="p-1 border border-gray-300">
                    <div className="flex gap-1 items-center">
                      <span className="flex-1 text-[#0B2D4D] font-medium text-xs">
                        {row.aiAdvice}
                      </span>
                      <button
                        onClick={() =>
                          copyMedicationField(row.id, "advice", row.aiAdvice)
                        }
                        className="p-0.5 border border-[#012e58] rounded text-[#012e58] bg-white hover:bg-[#012e58] hover:text-white focus:outline-none focus:ring-1 focus:ring-[#012e58] transition-all duration-300"
                      >
                        <Copy size={10} />
                      </button>
                    </div>
                  </td>
                  <td className="p-1 border border-gray-300">
                    <input
                      type="text"
                      value={row.doctorAdvice}
                      onChange={(e) =>
                        setMedicationRows((prev) =>
                          prev.map((r) =>
                            r.id === row.id
                              ? { ...r, doctorAdvice: e.target.value }
                              : r
                          )
                        )
                      }
                      className="w-full p-1 border border-gray-300 rounded bg-gray-50 focus:ring-1 focus:ring-[#012e58] focus:border-[#012e58] transition duration-200 text-[#0B2D4D] text-xs"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MedicalDashboard;
