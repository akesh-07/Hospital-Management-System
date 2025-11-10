// src/components/doctor/Ai.tsx
import React, { useState } from "react";
import {
  Copy,
  Plus,
  Bot,
  User,
  Brain,
  Loader,
  FlaskConical,
  Trash2,
} from "lucide-react";
import { Patient, Medication } from "../../types";
import { usePrescription } from "../../contexts/PrescriptionContext";
import { db } from "../../firebase";
import { collection, addDoc } from "firebase/firestore";

// Type definitions (expanded for clarity)
interface ConsultationData {
  symptoms: Array<{
    id: number;
    symptom: string;
    duration: string;
    factors: string;
  }>;
  duration: string;
  aggravatingFactors: string[];
  generalExamination: string[];
  systemicExamination: string[];
  investigations: string[];
  diagnosis: string;
  notes: string;
}

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
  aiDosage: string;
  aiFrequency: string;
  aiDuration: string;
  aiInstructions: string;
  doctorMedication: string;
  doctorDosage: string;
  doctorFrequency: string;
  doctorDuration: string;
  doctorInstructions: string;
}

interface MedicalDashboardProps {
  consultation: ConsultationData; // Using the explicit type
  selectedPatient: Patient;
  vitals: any;
  onDiagnosisUpdate: (diagnosis: string) => void; // 🚨 NEW PROP
}

const MedicalDashboard: React.FC<MedicalDashboardProps> = ({
  consultation,
  selectedPatient,
  vitals,
  onDiagnosisUpdate, // 🚨 DESTUCTURE PROP
}) => {
  const { addMedications } = usePrescription();

  // --- Mock Current User ID (Replace with actual context/auth data) ---
  const currentUser = { staffId: "DOC_987" };

  // State management
  const [diagnosis, setDiagnosis] = useState<DiagnosisData>({
    aiSuggested: "",
    doctorEntry: "",
  });

  const [labInvestigation, setLabInvestigation] =
    useState<LabInvestigationData>({
      aiSuggestion: "",
      doctorEntry: "",
      aiTests: { cbc: false, lft: false, rft: false },
      doctorTests: { cbc: false, lft: false, rft: false },
    });

  const [medicationRows, setMedicationRows] = useState<MedicationRow[]>([]);

  const [isLoading, setIsLoading] = useState(false); // Used for AI generation
  const [isSendingLab, setIsSendingLab] = useState(false); // State for lab submission

  const labResults = ["ECG", "X-RAY", "TCA-troraric", "In-xity coavortiatric"];

  const handleGenerateSuggestions = async () => {
    // ⚠️ Prefer storing your key on the server; this inline usage is only for local testing.
    const OPENAI_API_KEY = "";

    if (!OPENAI_API_KEY) {
      alert(
        "Please set your OpenAI API Key in the OPENAI_API_KEY variable (or proxy it via a backend)."
      );
      return;
    }

    setIsLoading(true);

    const systemPrompt = `You are an expert medical AI assistant. Based on the provided patient consultation details, generate a concise and structured JSON object with suggestions for the attending doctor. The JSON object must strictly follow this structure with the following keys:
1. "diagnosis": A string with a likely diagnosis and its corresponding ICD-10 code (example: "Type 2 Diabetes Mellitus (E11.9)").
2. "labInvestigationSuggestion": A short descriptive string recommending relevant lab tests (example: "Complete metabolic panel recommended for diabetic monitoring").
3. "labTests": A JSON object with boolean flags for the following specific tests: "cbc", "lft", "rft". Example: { "cbc": true, "lft": false, "rft": true }
4. "medications": An array of JSON objects for prescriptions. Each object must include: "name", "dosage", "frequency", "duration", and "instructions". Example: [ { "name": "Metformin", "dosage": "500mg", "frequency": "Twice daily", "duration": "30 days", "instructions": "After meals" } ]

Do not include any explanatory text or markdown formatting outside of the JSON object.`;

    // 🟢 FIXED: Map symptoms array to a readable string format
    const formattedSymptoms = consultation.symptoms
      .filter((s) => s.symptom.trim() !== "")
      .map(
        (s) =>
          `Symptom: ${s.symptom}, Duration: ${s.duration || "N/A"}, Factors: ${
            s.factors || "N/A"
          }`
      )
      .join("; ");

    const userPrompt = `
      Patient Information:
      - Name: ${selectedPatient.fullName}
      - Age: ${selectedPatient.age}
      - Gender: ${selectedPatient.gender}
      - Chronic Conditions: ${
        selectedPatient.chronicConditions?.join(", ") || "None"
      }

      Consultation Details from Assessment:
      - Symptoms: ${formattedSymptoms || "Not specified"}
      - General Examination Findings: ${
        consultation.generalExamination?.join(", ") || "Not specified"
      }
      - Systemic Examination: ${
        consultation.systemicExamination?.join(", ") || "Not specified"
      }
    `;

    try {
      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: "gpt-5-nano",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt },
            ],
            //
            response_format: { type: "json_object" },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          `API request failed with status ${
            response.status
          }: ${await response.text()}`
        );
      }

      const data = await response.json();
      const content = data?.choices?.[0]?.message?.content?.trim();

      if (content) {
        try {
          const aiResponse = JSON.parse(content);

          if (aiResponse.diagnosis) {
            setDiagnosis((prev) => ({
              ...prev,
              aiSuggested: aiResponse.diagnosis,
            }));
          }

          if (aiResponse.labInvestigationSuggestion || aiResponse.labTests) {
            setLabInvestigation((prev) => ({
              ...prev,
              aiSuggestion:
                aiResponse.labInvestigationSuggestion || prev.aiSuggestion,
              aiTests: {
                cbc: aiResponse.labTests?.cbc ?? false,
                lft: aiResponse.labTests?.lft ?? false,
                rft: aiResponse.labTests?.rft ?? false,
              },
            }));
          }

          if (Array.isArray(aiResponse.medications)) {
            const newMedicationRows = aiResponse.medications.map(
              (med: any, index: number) => ({
                id: String(index + 1),
                sno: index + 1,
                aiMedication: med.name || "",
                aiDosage: med.dosage || "",
                aiFrequency: med.frequency || "",
                aiDuration: med.duration || "",
                aiInstructions: med.instructions || "",
                doctorMedication: "",
                doctorDosage: "",
                doctorFrequency: "",
                doctorDuration: "",
                doctorInstructions: "",
              })
            );
            if (newMedicationRows.length > 0) {
              setMedicationRows(newMedicationRows);
            }
          }
        } catch (e) {
          console.error(
            "Failed to parse AI response JSON. Raw content:",
            content,
            "Error:",
            e
          );
          alert(
            "AI generated suggestions, but they were in an unreadable format. See console for details."
          );
        }
      }
    } catch (err) {
      console.error("Error calling OpenAI API:", err);
      alert(
        "Failed to connect to the AI service. Check network or API key setup."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyPrescription = () => {
    const medicationsToCopy: Omit<Medication, "id">[] = medicationRows.map(
      (row) => ({
        name: row.aiMedication,
        dosage: row.aiDosage,
        frequency: row.aiFrequency,
        duration: row.aiDuration,
        instructions: row.aiInstructions,
      })
    );
    addMedications(medicationsToCopy);
    alert("Prescription copied successfully!");
  };

  const copyToField = (
    aiValue: string,
    field: "diagnosis" | "labInvestigation"
  ) => {
    if (field === "diagnosis") {
      setDiagnosis((prev) => ({ ...prev, doctorEntry: aiValue }));
      onDiagnosisUpdate(aiValue); // 🚨 CALL PROP HERE
    } else if (field === "labInvestigation") {
      setLabInvestigation((prev) => ({ ...prev, doctorEntry: aiValue }));
    }
  };

  const copyMedicationField = (
    rowId: string,
    field: "medication" | "dosage" | "frequency" | "duration" | "instructions",
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

  // 🟢 CORRECTED HANDLER: Parses Doctor's Manual Input and adds items to the 'tests' array
  const handleSendLabOrder = async () => {
    // 1. Determine the patient ID using patId or generic id.
    const patientIdentifier = selectedPatient.patId || selectedPatient.id;

    if (!patientIdentifier) {
      alert(
        "Cannot send lab order: Patient ID is missing. Please ensure a patient is properly selected."
      );
      return;
    }

    // 2. Identify specific selected test codes (CBC, LFT, etc.)
    const specificTests = (
      Object.keys(labInvestigation.doctorTests) as Array<
        keyof typeof labInvestigation.doctorTests
      >
    )
      .filter((key) => labInvestigation.doctorTests[key])
      .map((test) => test.toUpperCase());

    // 3. PARSE DOCTOR'S MANUAL INPUT
    let manualTests: string[] = [];
    if (labInvestigation.doctorEntry) {
      manualTests = labInvestigation.doctorEntry
        .split(/,\s*|\s+and\s+/i)
        .map((item) => item.trim())
        .filter((item) => item.length > 0);
    }

    // 4. Construct the final tests array: specific test codes + parsed manual text
    const finalTestsArray = [...new Set([...specificTests, ...manualTests])];

    if (finalTestsArray.length === 0) {
      alert(
        "No specific tests selected and no manual notes provided to send to the lab."
      );
      return;
    }

    setIsSendingLab(true);

    try {
      // 5. Prepare the data payload
      const labRequestPayload = {
        patId: patientIdentifier,
        tests: finalTestsArray,
        assignDoctorId: currentUser.staffId,
        requestedAt: new Date(),
      };

      // 6. Send data to the Firestore 'labRequests' collection
      const labRequestsCollection = collection(db, "labRequests");
      await addDoc(labRequestsCollection, labRequestPayload);

      console.log("Lab order sent successfully:", labRequestPayload);
      alert(
        `Lab order initiated for ${
          selectedPatient.fullName
        }. Tests: ${finalTestsArray.join(" | ")}.`
      );
    } catch (error) {
      console.error("Error sending lab order to Firebase:", error);
      alert("Failed to send lab order. Check console and Firebase rules.");
    } finally {
      setIsSendingLab(false);
    }
  };

  // Handlers
  const handleDiagnosisChange = (value: string) => {
    setDiagnosis((prev) => ({ ...prev, doctorEntry: value }));
    onDiagnosisUpdate(value); // 🚨 CALL PROP HERE to update DoctorModule state
  };

  const handleLabInvestigationChange = (value: string) => {
    setLabInvestigation((prev) => ({ ...prev, doctorEntry: value }));
  };

  // 🔄 Handler to toggle test state when the tag is clicked
  const handleTestChange = (test: "cbc" | "lft" | "rft") => {
    setLabInvestigation((prev) => ({
      ...prev,
      doctorTests: { ...prev.doctorTests, [test]: !prev.doctorTests[test] },
    }));
  };

  // Handlers for Doctor's manual medication table, for future implementation
  const handleDoctorMedicationChange = (
    rowId: string,
    field: keyof MedicationRow,
    value: string
  ) => {
    setMedicationRows((prev) =>
      prev.map((row) => (row.id === rowId ? { ...row, [field]: value } : row))
    );
  };

  const addManualMedicationRow = () => {
    setMedicationRows((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        sno: prev.length + 1,
        aiMedication: "",
        aiDosage: "",
        aiFrequency: "",
        aiDuration: "",
        aiInstructions: "",
        doctorMedication: "",
        doctorDosage: "",
        doctorFrequency: "",
        doctorDuration: "",
        doctorInstructions: "",
      },
    ]);
  };

  const removeMedicationRow = (rowId: string) => {
    setMedicationRows((prev) => prev.filter((row) => row.id !== rowId));
  };

  return (
    <div className="space-y-3 p-2 bg-gray-100 font-sans text-xs">
      <div className="bg-white p-2 rounded shadow border border-gray-200">
        <button
          onClick={handleGenerateSuggestions}
          disabled={isLoading}
          className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-[#012e58] to-[#1a4b7a] text-white rounded-lg hover:from-[#1a4b7a] hover:to-[#012e58] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              <span className="text-sm font-semibold">
                Generating AI Suggestions...
              </span>
            </>
          ) : (
            <>
              <Brain className="w-5 h-5" />
              <span className="text-sm font-semibold">
                Generate AI Suggestions from Assessment
              </span>
            </>
          )}
        </button>
      </div>
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
              placeholder="Enter lab investigation (e.g., Blood Culture, Liver scan)"
              value={labInvestigation.doctorEntry}
              onChange={(e) => handleLabInvestigationChange(e.target.value)}
              className="w-full p-1.5 border border-gray-300 rounded bg-gray-50 focus:ring-1 focus:ring-[#012e58] focus:border-[#012e58] transition duration-200 ease-in-out text-[#0B2D4D] placeholder:text-gray-500 text-xs"
            />
            {/* 🟢 Lab Test Tags Display (based on doctor selection) */}
            <div className="flex flex-wrap gap-1">
              {(["cbc", "lft", "rft"] as const).map(
                (test) =>
                  labInvestigation.doctorTests[test] && (
                    <span
                      key={`tag-${test}`}
                      className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full border border-blue-300"
                    >
                      {test.toUpperCase()}
                    </span>
                  )
              )}
            </div>
            {/* End Tags Display */}

            <div className="flex flex-col gap-1">
              <div className="flex gap-2">
                {/* 🟢 TEST SELECTION AS TAGS (Toggles state on click) */}
                {(["cbc", "lft", "rft"] as const).map((test) => (
                  <span
                    key={test}
                    onClick={() => handleTestChange(test)}
                    className={`
                      cursor-pointer px-3 py-1 text-xs font-semibold rounded-full border transition-all duration-200 
                      ${
                        labInvestigation.doctorTests[test]
                          ? "bg-[#012e58] text-white border-[#012e58]"
                          : "bg-white text-[#0B2D4D] border-gray-300 hover:bg-gray-100"
                      }
                    `}
                  >
                    {test.toUpperCase()}
                  </span>
                ))}
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={copyAiTests}
                  className="flex items-center gap-1 px-2 py-1 text-xs border border-[#012e58] rounded text-[#012e58] bg-white hover:bg-[#012e58] hover:text-white focus:outline-none focus:ring-1 focus:ring-[#012e58] transition-all duration-300"
                  disabled={isSendingLab}
                >
                  <Copy size={10} />
                  Copy AI Tests
                </button>
                {/* Send to Lab Button */}
                <button
                  onClick={handleSendLabOrder}
                  className="flex items-center gap-1 px-2 py-1 text-xs border border-green-600 rounded text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-1 focus:ring-green-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSendingLab}
                >
                  {isSendingLab ? (
                    <Loader className="w-3 h-3 animate-spin" />
                  ) : (
                    <FlaskConical size={10} />
                  )}
                  {isSendingLab ? "Sending..." : "Send to Lab"}
                </button>
              </div>
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
            {/* 🟢 AI Suggested Text as a Single Tag */}
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-full font-medium">
                {labInvestigation.aiSuggestion || "No suggestions yet."}
              </span>
            </div>

            <button
              onClick={() =>
                copyToField(labInvestigation.aiSuggestion, "labInvestigation")
              }
              disabled={!labInvestigation.aiSuggestion}
              className="px-1 py-0.5 border border-[#012e58] rounded text-[#012e58] bg-white hover:bg-[#012e58] hover:text-white focus:outline-none focus:ring-1 focus:ring-[#012e58] transition-all duration-300 disabled:opacity-50"
            >
              <Copy size={10} />
            </button>

            {/* 🟢 AI Suggested Individual Test Tags */}
            <div className="flex flex-wrap gap-1 pt-2">
              <span className="text-gray-500 text-xs font-semibold mr-1">
                Suggested Tests:
              </span>
              {(["cbc", "lft", "rft"] as const).map(
                (test) =>
                  labInvestigation.aiTests[test] && (
                    <span
                      key={`ai-tag-${test}`}
                      className="px-2 py-0.5 bg-purple-100 text-purple-800 text-xs rounded-full border border-purple-300"
                    >
                      {test.toUpperCase()}
                    </span>
                  )
              )}
            </div>
            {/* End AI Tags Display */}
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
        <div className="p-2 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-sm font-bold text-[#0B2D4D] tracking-tight">
            AI-Suggested Medication Table
          </h3>
          <button
            onClick={handleCopyPrescription}
            disabled={medicationRows.length === 0}
            className="flex items-center space-x-2 px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-xs disabled:opacity-50"
          >
            <Copy className="w-3 h-3" />
            <span>Copy All Suggestions</span>
          </button>
        </div>
        <div className="p-2 overflow-x-auto">
          <table className="w-full text-xs border-collapse border border-gray-300">
            <thead className="bg-gradient-to-r from-[#012e58] to-[#1a4b7a] text-white">
              <tr>
                <th className="p-1 border border-gray-300 font-semibold text-xs min-w-[100px]">
                  Name (AI)
                </th>
                <th className="p-1 border border-gray-300 font-semibold text-xs min-w-[70px]">
                  Dosage (AI)
                </th>
                <th className="p-1 border border-gray-300 font-semibold text-xs min-w-[70px]">
                  Freq (AI)
                </th>
                <th className="p-1 border border-gray-300 font-semibold text-xs min-w-[70px]">
                  Duration (AI)
                </th>
                <th className="p-1 border border-gray-300 font-semibold text-xs min-w-[120px]">
                  Instructions (AI)
                </th>
                <th className="p-1 border border-gray-300 font-semibold text-xs min-w-[100px]">
                  Name (Dr. Entry)
                </th>
                <th className="p-1 border border-gray-300 font-semibold text-xs text-center min-w-[30px]">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {medicationRows.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-[#012e58]/5 transition-colors"
                >
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
                    <div className="flex gap-1 items-center">
                      <span className="flex-1 text-[#0B2D4D] font-medium text-xs">
                        {row.aiDosage}
                      </span>
                      <button
                        onClick={() =>
                          copyMedicationField(row.id, "dosage", row.aiDosage)
                        }
                        className="p-0.5 border border-[#012e58] rounded text-[#012e58] bg-white hover:bg-[#012e58] hover:text-white focus:outline-none focus:ring-1 focus:ring-[#012e58] transition-all duration-300"
                      >
                        <Copy size={10} />
                      </button>
                    </div>
                  </td>
                  <td className="p-1 border border-gray-300">
                    <div className="flex gap-1 items-center">
                      <span className="flex-1 text-[#0B2D4D] font-medium text-xs">
                        {row.aiFrequency}
                      </span>
                      <button
                        onClick={() =>
                          copyMedicationField(
                            row.id,
                            "frequency",
                            row.aiFrequency
                          )
                        }
                        className="p-0.5 border border-[#012e58] rounded text-[#012e58] bg-white hover:bg-[#012e58] hover:text-white focus:outline-none focus:ring-1 focus:ring-[#012e58] transition-all duration-300"
                      >
                        <Copy size={10} />
                      </button>
                    </div>
                  </td>
                  <td className="p-1 border border-gray-300">
                    <div className="flex gap-1 items-center">
                      <span className="flex-1 text-[#0B2D4D] font-medium text-xs">
                        {row.aiDuration}
                      </span>
                      <button
                        onClick={() =>
                          copyMedicationField(
                            row.id,
                            "duration",
                            row.aiDuration
                          )
                        }
                        className="p-0.5 border border-[#012e58] rounded text-[#012e58] bg-white hover:bg-[#012e58] hover:text-white focus:outline-none focus:ring-1 focus:ring-[#012e58] transition-all duration-300"
                      >
                        <Copy size={10} />
                      </button>
                    </div>
                  </td>
                  <td className="p-1 border border-gray-300">
                    <div className="flex gap-1 items-center">
                      <span className="flex-1 text-[#0B2D4D] font-medium text-xs">
                        {row.aiInstructions}
                      </span>
                      <button
                        onClick={() =>
                          copyMedicationField(
                            row.id,
                            "instructions",
                            row.aiInstructions
                          )
                        }
                        className="p-0.5 border border-[#012e58] rounded text-[#012e58] bg-white hover:bg-[#012e58] hover:text-white focus:outline-none focus:ring-1 focus:ring-[#012e58] transition-all duration-300"
                      >
                        <Copy size={10} />
                      </button>
                    </div>
                  </td>
                  {/* Doctor Entry Column (Only Name field shown here for compactness) */}
                  <td className="p-1 border border-gray-300">
                    <input
                      type="text"
                      value={row.doctorMedication}
                      onChange={(e) =>
                        handleDoctorMedicationChange(
                          row.id,
                          "doctorMedication",
                          e.target.value
                        )
                      }
                      className="w-full p-1 border border-gray-200 rounded text-xs focus:ring-1 focus:ring-blue-300"
                      placeholder="Dr. Name"
                    />
                  </td>
                  {/* Action Column */}
                  <td className="p-1 border border-gray-300 text-center">
                    <button
                      onClick={() => removeMedicationRow(row.id)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <Trash2 size={12} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button
            onClick={addManualMedicationRow}
            className="mt-2 flex items-center gap-1 px-3 py-1 text-xs bg-gray-200 text-[#0B2D4D] rounded hover:bg-gray-300 transition-colors"
          >
            <Plus size={12} />
            Add Manual Row
          </button>
        </div>
      </div>
    </div>
  );
};

export default MedicalDashboard;
