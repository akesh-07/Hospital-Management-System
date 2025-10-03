// src/components/vitals/PreOPDIntake.tsx
import React, {
  useState,
  useReducer,
  useCallback,
  useMemo,
  useRef,
} from "react";
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

import { VitalsAssessment } from "./VitalsAssessment";
import { db } from "../../firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import {
  Patient,
  PreOPDIntakeData,
  Complaint,
  ChronicCondition,
  Allergy,
  MedicationDetails,
  PastHistory,
} from "../../types";

import * as pdfjsLib from "pdfjs-dist";
import mammoth from "mammoth";
import Tesseract from "tesseract.js"; // 💡 MOCK IMPORT: Assume Tesseract.js is globally available/imported

// 🚨 IMPORT MODULAR SECTIONS AND CONSTANTS
import {
  MOCK_MASTERS,
  InputStyle,
  PresentingComplaintsSection,
  ChronicConditionsSection,
  AllergiesSection,
  PastHistorySection,
  RecordsUploadSection,
  AiClinicalSummarySection,
} from "./PreOPDIntakeSections";

// --- FILE EXTRACTION LOGIC (MOVED FROM DoctorModule.tsx) ---
const extractTextFromFile = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (event) => {
      try {
        let text = "";

        if (file.type === "application/pdf") {
          const loadingTask = pdfjsLib.getDocument(
            event.target?.result as ArrayBuffer
          );
          const pdf = await loadingTask.promise;
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            // Append a new line or separator for clarity between pages
            text +=
              content.items.map((item: any) => item.str).join(" ") +
              "\n--- Page Break ---\n";
          }
          // Prefix PDF content with a tag
          resolve(`[PDF Embedded Text Extracted]\n${text}`);
        } else if (
          file.type ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ) {
          const arrayBuffer = event.target?.result as ArrayBuffer;
          const result = await mammoth.extractRawText({ arrayBuffer });
          // Prefix DOCX content with a tag
          resolve(`[DOCX Text Content Extracted]\n${result.value}`);
        } else if (file.type === "text/plain") {
          // Prefix Plain Text content with a tag
          resolve(`[Plain Text Content]\n${event.target?.result as string}`);
        } else if (file.type.startsWith("image/")) {
          // Read as data URL for browser-based OCR
          const dataUrl = event.target?.result as string;

          // 💡 OCR IMPLEMENTATION NOTE:
          // The actual OCR call using Tesseract.recognize(dataUrl, 'eng') needs to be implemented here.
          // The Tesseract.js library is not bundled/installed in the current environment.

          // Returning an instructional placeholder/mock resolution:
          const mockResolution = `
            [Image OCR Required]
            File: ${file.name}
            Size: ${(file.size / 1024).toFixed(1)} KB
            Type: ${file.type}
            ***
            To enable OCR for this file, you must:
            1. Install Tesseract.js: 'npm install tesseract.js'
            2. Implement the call here: const { data: { text } } = await Tesseract.recognize(dataUrl, 'eng');
            ***`;
          resolve(mockResolution);
        } else {
          reject(
            new Error(
              `Unsupported file type: ${file.type}. Text extraction failed.`
            )
          );
        }
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = (error) => {
      reject(error);
    };

    // Read file based on type, reading images as DataURL for OCR
    if (
      file.type === "application/pdf" ||
      file.type ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      reader.readAsArrayBuffer(file);
    } else if (file.type.startsWith("image/") || file.type === "text/plain") {
      reader.readAsDataURL(file); // Reading images as DataURL
    } else {
      reader.readAsText(file);
    }
  });
};
// --- END FILE EXTRACTION LOGIC ---

// --- INITIAL STATE (REMAINS) ---
const INITIAL_INTAKE_STATE: PreOPDIntakeData = {
  complaints: [],
  chronicConditions: [],
  allergies: {
    hasAllergies: false,
    type: [],
    substance: "",
    reaction: "",
    severity: "",
  },
  pastHistory: {
    illnesses: [],
    surgeries: [],
    hospitalizations: [],
    currentMedications: [],
    overallCompliance: "Unknown",
  },
};

// --- REDUCER (REMAINS) ---
function intakeReducer(
  state: PreOPDIntakeData,
  action: { type: string; payload: any }
): PreOPDIntakeData {
  switch (action.type) {
    case "UPDATE_COMPLAINTS":
      return { ...state, complaints: action.payload };
    case "UPDATE_CHRONIC_CONDITIONS":
      return { ...state, chronicConditions: action.payload };
    case "UPDATE_ALLERGIES":
      return { ...state, allergies: action.payload };
    case "UPDATE_PAST_HISTORY":
      return { ...state, pastHistory: action.payload };
    case "RESET_ALL":
      return INITIAL_INTAKE_STATE;
    default:
      return state;
  }
}

// ------------------------------------------------------------------
// --- MAIN COMPONENT ---
// ------------------------------------------------------------------
interface PreOPDIntakeProps {
  selectedPatient?: Patient | null;
  onBack?: () => void;
}

export const PreOPDIntake: React.FC<PreOPDIntakeProps> = ({
  selectedPatient,
  onBack,
}) => {
  const [intakeData, dispatch] = useReducer(
    intakeReducer,
    INITIAL_INTAKE_STATE
  );
  const [status, setStatus] = useState({
    isSaving: false,
    showSuccess: false,
    errorMessage: "",
  });

  // NEW STATE: Holds extracted text data from uploaded files
  const [extractedRecords, setExtractedRecords] = useState<
    Record<string, string>
  >({});

  // AI Summary state
  const [aiSummary, setAiSummary] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiExpanded, setAiExpanded] = useState(false);

  // --- HANDLERS ---
  const handleComplaintsChange = useCallback((complaints: Complaint[]) => {
    dispatch({ type: "UPDATE_COMPLAINTS", payload: complaints });
  }, []);

  const handleChronicConditionsChange = useCallback(
    (conditions: ChronicCondition[]) => {
      dispatch({ type: "UPDATE_CHRONIC_CONDITIONS", payload: conditions });
    },
    []
  );

  const handleAllergiesChange = useCallback((allergies: Allergy) => {
    dispatch({ type: "UPDATE_ALLERGIES", payload: allergies });
  }, []);

  const handlePastHistoryChange = useCallback((pastHistory: PastHistory) => {
    dispatch({ type: "UPDATE_PAST_HISTORY", payload: pastHistory });
  }, []);

  const handleClearForm = useCallback(() => {
    dispatch({ type: "RESET_ALL", payload: null });
    setExtractedRecords({}); // Clear extracted records on form reset
    setAiSummary("");
  }, []);

  // NEW HANDLER: Passed to RecordsUploadSection for updating extracted content
  const handleExtractedRecordsChange = useCallback(
    (newRecords: Record<string, string>) => {
      setExtractedRecords(newRecords);
    },
    []
  );

  const generateAiSummary = useCallback(async () => {
    if (!selectedPatient) {
      setAiSummary("Please select a patient first.");
      return;
    }

    setIsAiLoading(true);
    setAiSummary("");
    setAiExpanded(false); // Collapse during loading

    // Collect all data for the AI prompt
    const allMeds = [
      ...intakeData.chronicConditions.flatMap((c) => c.medications),
      ...intakeData.pastHistory.currentMedications,
    ];

    const extractedRecordText = Object.entries(extractedRecords)
      .map(([type, content]) => `--- ${type} ---\n${content}`)
      .join("\n\n");

    // Mock AI summary generation based on intake data
    const mockSummary = `Patient ${selectedPatient.fullName} (${
      selectedPatient.age
    }Y, ${selectedPatient.gender}) presents with ${
      intakeData.complaints.length
    } chief complaint(s) including: ${
      intakeData.complaints.map((c) => c.complaint).join(", ") || "None"
    }. ${
      intakeData.complaints.some((c) => c.redFlagTriggered)
        ? "🚨 **RED FLAG: Critical symptoms detected** requiring immediate attention. "
        : ""
    }
    Known chronic conditions: ${
      intakeData.chronicConditions.map((c) => c.name).join(", ") || "None"
    }. The patient is currently on ${
      allMeds.length
    } regular medication(s). Current medication compliance is **${
      intakeData.pastHistory.overallCompliance
    }**. ${
      extractedRecordText.length > 0
        ? `\n\n**Previous Records Analyzed:**\n${extractedRecordText.substring(
            0,
            500
          )}...`
        : "No previous records analyzed."
    }
    Comprehensive assessment recommended.`;

    // Simulate API delay
    setTimeout(() => {
      setAiSummary(mockSummary);
      setIsAiLoading(false);
      setAiExpanded(true);
    }, 2000);
  }, [selectedPatient, intakeData, extractedRecords]);

  const handleSubmit = async () => {
    if (!selectedPatient) {
      setStatus({ ...status, errorMessage: "No patient selected!" });
      return;
    }

    setStatus({ isSaving: true, showSuccess: false, errorMessage: "" });

    try {
      const intakeRecord = {
        patientId: selectedPatient.id,
        patientUhid: selectedPatient.uhid,
        patientName: selectedPatient.fullName,
        complaints: intakeData.complaints,
        chronicConditions: intakeData.chronicConditions,
        allergies: intakeData.allergies,
        pastHistory: intakeData.pastHistory,
        extractedRecords, // Save the extracted text content
        aiSummary,
        recordedAt: Timestamp.now(),
        recordedBy: "Medical Staff",
        status: "completed",
      };

      // NOTE: This line requires a valid Firebase setup ('db' import)
      await addDoc(collection(db, "preOPDIntake"), intakeRecord);

      setStatus({ isSaving: false, showSuccess: true, errorMessage: "" });
      setTimeout(
        () => setStatus((prev) => ({ ...prev, showSuccess: false })),
        4000
      );
    } catch (error: any) {
      console.error("Error saving Pre-OPD intake:", error);
      setStatus({
        isSaving: false,
        showSuccess: false,
        errorMessage:
          "Failed to save intake data. Please check console for details.",
      });
    }
  };

  // Combine all medications for the allergy check across all relevant components
  const allMedsForCheck = useMemo(
    () => [
      ...intakeData.chronicConditions.flatMap((c) => c.medications),
      ...intakeData.pastHistory.currentMedications,
    ],
    [intakeData.chronicConditions, intakeData.pastHistory.currentMedications]
  );

  // --- RENDER ---
  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-20">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <header className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            {onBack && (
              <button
                onClick={onBack}
                className="p-2 hover:bg-white rounded-lg border border-gray-200 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-[#1a4b7a]" />
              </button>
            )}
            <FileText className="w-8 h-8 text-[#012e58]" />
            <div>
              <h1 className="text-3xl font-bold text-[#0B2D4D]">
                Pre-OPD Intake Assessment
              </h1>
              <p className="text-[#1a4b7a]">
                Comprehensive patient intake and medical history
              </p>
            </div>
          </div>

          {/* Patient Info */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 text-right">
            <p className="text-sm text-[#1a4b7a]">Current Patient</p>
            <p className="font-semibold text-[#0B2D4D]">
              {selectedPatient?.fullName || "No Patient Selected"}
            </p>
            <p className="text-sm text-[#1a4b7a]">
              {selectedPatient ? (
                <>
                  {selectedPatient.uhid} • {selectedPatient.age}Y •{" "}
                  {selectedPatient.gender}
                </>
              ) : (
                "Please select a patient"
              )}
            </p>
          </div>
        </header>

        {/* Status Messages */}
        {status.showSuccess && (
          <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-green-800">
              Pre-OPD intake saved successfully!
            </span>
          </div>
        )}
        {status.errorMessage && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <span className="text-red-800">{status.errorMessage}</span>
          </div>
        )}

        {/* Main Content Sections */}
        <div className="space-y-6">
          {/* 1. Vitals Assessment (External Component) */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center space-x-2">
                <Activity className="w-5 h-5 text-[#012e58]" />
                <h2 className="text-lg font-semibold text-[#0B2D4D]">
                  1. Vital Signs Assessment
                </h2>
              </div>
            </div>
            <div className="p-0">
              {/* NOTE: VitalsAssessment component assumes to be fully implemented separately */}
              <VitalsAssessment
                selectedPatient={selectedPatient}
                isSubcomponent={true}
              />
            </div>
          </div>

          {/* 2. Presenting Complaints */}
          <PresentingComplaintsSection
            data={intakeData.complaints}
            onChange={handleComplaintsChange}
          />

          {/* 3. Chronic Conditions */}
          <ChronicConditionsSection
            data={intakeData.chronicConditions}
            onChange={handleChronicConditionsChange}
          />

          {/* 4. Allergies */}
          <AllergiesSection
            data={intakeData.allergies}
            onChange={handleAllergiesChange}
            allMeds={allMedsForCheck} // Pass combined meds for conflict check
          />

          {/* 5. Past & Medication History */}
          <PastHistorySection
            data={intakeData.pastHistory}
            onChange={handlePastHistoryChange}
            chronicMeds={intakeData.chronicConditions.flatMap(
              (c) => c.medications
            )}
          />

          {/* 6. Previous Records Uploads */}
          <RecordsUploadSection
            extractTextFromFile={extractTextFromFile}
            onRecordsChange={handleExtractedRecordsChange}
          />

          {/* 7. AI Clinical Summary */}
          <AiClinicalSummarySection
            summary={aiSummary}
            isLoading={isAiLoading}
            isExpanded={aiExpanded}
            onToggleExpand={() => setAiExpanded(!aiExpanded)}
            onGenerate={generateAiSummary}
          />
        </div>
      </div>

      {/* Fixed Bottom Submit Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                **{intakeData.complaints.length}** complaints, **
                {intakeData.chronicConditions.length}** conditions recorded
              </span>
              {intakeData.complaints.some((c) => c.redFlagTriggered) && (
                <span className="flex items-center text-red-600 bg-red-100 px-2 py-1 rounded-full text-xs font-semibold">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Red Flag Alert
                </span>
              )}
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleClearForm}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Clear Form</span>
              </button>
              <button
                onClick={handleSubmit}
                disabled={status.isSaving || !selectedPatient}
                className="flex items-center space-x-2 px-6 py-2 rounded-lg font-semibold transition-colors disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed bg-[#012e58] text-white hover:bg-[#1a4b7a]"
              >
                <Save className="w-4 h-4" />
                <span>{status.isSaving ? "Saving..." : "Submit Intake"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreOPDIntake;
