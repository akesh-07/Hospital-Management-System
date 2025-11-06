import React, { useState, useEffect, useRef } from "react";
import {
  Stethoscope,
  FileText,
  TestTube,
  Pill,
  User,
  Clock,
  Upload,
  Bot,
  ChevronRight,
  Activity,
  ArrowLeft,
  Loader,
  Brain,
  AlertCircle,
  CheckCircle,
  Calendar,
  Save,
  Heart,
  FileDown,
  Search,
  UserCheck,
  ClipboardList,
  Eye,
  BookOpen,
  X,
  Plus,
  Trash2,
  Hospital,
} from "lucide-react";
import AIAssistTab from "./AIAssistTab";
import { db } from "../../firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  doc,
  updateDoc,
} from "firebase/firestore";
import { Vitals } from "../../types";
import PatientQueue from "../queue/PatientQueue";
import { Patient } from "../../types";
import PrescriptionModule from "../prescription/PrescriptionModule";
import * as pdfjsLib from "pdfjs-dist";
import mammoth from "mammoth";
import { PrescriptionProvider } from "../../contexts/PrescriptionContext";
import Ai from "./Ai";

// --- GLOBAL UTILITY SETUP ---
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.mjs`;
pdfjsLib.GlobalWorkerOptions.standardFontDataUrl = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/standard_fonts/`;

// --- INTERFACES ---
interface DoctorModuleProps {
  selectedPatient?: Patient | null;
  onBack?: () => void;
  onCompleteConsultation: (patientId: string) => void;
}

interface AdmissionData {
  roomNumber: string;
  wardNumber: string;
  admissionDate: string;
  attendingDoctor: string;
  assignedNurse: string;
  expectedDischargeDate: string;
  reasonForAdmission: string;
  additionalNotes: string;
}

// --- AUTOCMPLETE INPUT COMPONENT ---
const AutocompleteInput: React.FC<{
  symptomId: number;
  value: string;
  onChange: (symptomId: number, value: string) => void;
  symptomOptions: string[];
  addSymptomOption: (symptom: string) => void;
}> = ({ symptomId, value, onChange, symptomOptions, addSymptomOption }) => {
  const [inputValue, setInputValue] = useState(value);
  const [showDropdown, setShowDropdown] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef]);

  const filteredSymptoms = symptomOptions.filter((s) =>
    s.toLowerCase().includes(inputValue.toLowerCase())
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    onChange(symptomId, e.target.value);
    setShowDropdown(true);
  };

  const handleSelectSymptom = (symptom: string) => {
    setInputValue(symptom);
    onChange(symptomId, symptom);
    setShowDropdown(false);
  };

  const handleAddSymptom = () => {
    if (inputValue && !symptomOptions.includes(inputValue)) {
      addSymptomOption(inputValue);
      handleSelectSymptom(inputValue);
    }
  };

  const showAddButton =
    inputValue &&
    !symptomOptions.some((s) => s.toLowerCase() === inputValue.toLowerCase());

  return (
    <div className="relative" ref={wrapperRef}>
      <div className="relative">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setShowDropdown(true)}
          className="p-2 border border-gray-300 rounded-md w-full bg-gray-50 focus:ring-2 focus:ring-[#012e58] focus:border-[#012e58] transition duration-200 ease-in-out text-[#0B2D4D] placeholder:text-gray-500 text-sm"
          placeholder="Enter symptom"
        />
        {showAddButton && (
          <button
            type="button"
            onClick={handleAddSymptom}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 bg-gray-200 rounded-full hover:bg-gray-300"
          >
            <Plus className="w-4 h-4 text-gray-600" />
          </button>
        )}
      </div>
      {showDropdown && filteredSymptoms.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
          {filteredSymptoms.map((symptom, index) => (
            <div
              key={index}
              onClick={() => handleSelectSymptom(symptom)}
              className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
            >
              {symptom}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Helper component for section headers to maintain consistency
const SectionHeader: React.FC<{ icon: React.ElementType; title: string }> = ({
  icon: Icon,
  title,
}) => (
  <div className="flex items-center space-x-2 mb-3">
    <div className="bg-[#012e58]/10 p-1.5 rounded-md">
      <Icon className="w-4 h-4 text-[#012e58]" />
    </div>
    <h2 className="text-lg font-bold text-[#0B2D4D] tracking-tight">{title}</h2>
  </div>
);

// Component for rendering formatted AI summary
const FormattedAiSummary: React.FC<{ summary: string }> = ({ summary }) => {
  const lines = summary.split("\n").filter((line) => line.trim() !== "");

  return (
    <div className="space-y-4 text-[#1a4b7a]">
      {lines.map((line, index) => {
        if (line.startsWith("**") && line.endsWith("**")) {
          return (
            <h3 key={index} className="text-lg font-bold text-[#0B2D4D] pt-2">
              {line.slice(2, -2)}
            </h3>
          );
        }
        if (line.startsWith("* ") || line.startsWith("- ")) {
          return (
            <ul key={index} className="list-disc list-inside pl-4">
              <li>{line.slice(2)}</li>
            </ul>
          );
        }
        if (line.includes(":")) {
          const parts = line.split(":");
          const key = parts[0];
          const value = parts.slice(1).join(":");
          return (
            <div key={index} className="flex">
              <span className="font-semibold w-1/3">{key}:</span>
              <span className="w-2/3">{value}</span>
            </div>
          );
        }
        return <p key={index}>{line}</p>;
      })}
    </div>
  );
};

// AI Summary Modal Component
const AiSummaryModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  summary: string;
  isLoading: boolean;
}> = ({ isOpen, onClose, summary, isLoading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200 bg-[#F8F9FA] rounded-t-xl">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-[#e0f7fa] rounded-full">
              <Bot className="w-6 h-6 text-[#012e58]" />
            </div>
            <h2 className="text-xl font-bold text-[#0B2D4D]">
              AI-Generated Summary (Document History)
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-grow">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[250px] text-center">
              <Loader className="w-12 h-12 text-[#012e58] animate-spin mb-4" />
              <p className="text-lg font-semibold text-[#0B2D4D]">
                Analyzing Documents...
              </p>
              <p className="text-sm text-[#1a4b7a]">
                Please wait while our AI processes the historical information.
              </p>
            </div>
          ) : (
            <FormattedAiSummary summary={summary} />
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end p-4 border-t border-gray-200 bg-[#F8F9FA] rounded-b-xl">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1a4b7a] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// --- IN-PATIENT ADMISSION MODAL ---
const InPatientAdmissionModal: React.FC<{
  patient: Patient;
  onClose: () => void;
  onConfirm: (data: AdmissionData) => void;
}> = ({ patient, onClose, onConfirm }) => {
  const [formData, setFormData] = useState<AdmissionData>({
    roomNumber: "",
    wardNumber: "General Ward",
    admissionDate: new Date().toISOString().slice(0, 10),
    attendingDoctor: patient.doctorAssigned || "",
    assignedNurse: "",
    expectedDischargeDate: "",
    reasonForAdmission: "",
    additionalNotes: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!formData.roomNumber.trim())
      errors.roomNumber = "Room Number is required.";
    if (!formData.wardNumber) errors.wardNumber = "Ward is required.";
    if (!formData.admissionDate)
      errors.admissionDate = "Admission Date is required.";
    if (!formData.attendingDoctor.trim())
      errors.attendingDoctor = "Attending Doctor is required.";
    if (!formData.assignedNurse.trim())
      errors.assignedNurse = "Assigned Nurse is required.";
    if (!formData.expectedDischargeDate)
      errors.expectedDischargeDate = "Expected Discharge Date is required.";
    if (!formData.reasonForAdmission.trim())
      errors.reasonForAdmission = "Reason for Admission is required.";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // --- STEP 1: MOCK DATABASE UPDATE (Replace with actual Firestore/API call) ---
      // await updateDoc(doc(db, "patients", patient.id), { patientType: "IPD", ipdDetails: formData });
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setSuccessMessage(
        `Patient ${patient.fullName} successfully admitted to Ward ${formData.wardNumber}, Room ${formData.roomNumber}.`
      );
      onConfirm(formData);
    } catch (error) {
      console.error("Error during in-patient admission:", error);
      setSuccessMessage(
        `Admission failed: ${
          error instanceof Error ? error.message : "Network error."
        }`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputStyle = (hasError: boolean) =>
    `w-full px-3 py-2 border rounded-md text-sm transition-colors ${
      hasError
        ? "border-red-500 focus:ring-red-500"
        : "border-gray-300 focus:ring-[#012e58] focus:border-[#012e58]"
    }`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[95vh] overflow-y-auto">
        <div className="flex justify-between items-center p-5 border-b bg-[#012e58]/5">
          <h2 className="text-xl font-bold text-[#0B2D4D]">
            Admit Patient: {patient.fullName}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 p-1 rounded-full hover:bg-gray-200"
          >
            <X />
          </button>
        </div>

        {successMessage ? (
          <div className="p-8 text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <p className="text-lg font-semibold text-[#0B2D4D]">
              {successMessage}
            </p>
            <button
              onClick={onClose}
              className="mt-6 px-6 py-2 bg-[#012e58] text-white rounded-lg"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Room Number */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Room Number *
                </label>
                <input
                  type="text"
                  name="roomNumber"
                  value={formData.roomNumber}
                  onChange={handleChange}
                  className={inputStyle(!!formErrors.roomNumber)}
                  placeholder="e.g., 301"
                />
                {formErrors.roomNumber && (
                  <p className="text-red-500 text-xs mt-1">
                    {formErrors.roomNumber}
                  </p>
                )}
              </div>

              {/* Ward Number */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Ward Number *
                </label>
                <select
                  name="wardNumber"
                  value={formData.wardNumber}
                  onChange={handleChange}
                  className={inputStyle(!!formErrors.wardNumber)}
                >
                  <option value="">Select Ward</option>
                  <option value="General Ward">General Ward</option>
                  <option value="ICU">ICU</option>
                  <option value="Emergency">Emergency</option>
                  <option value="Pediatrics">Pediatrics</option>
                </select>
                {formErrors.wardNumber && (
                  <p className="text-red-500 text-xs mt-1">
                    {formErrors.wardNumber}
                  </p>
                )}
              </div>

              {/* Admission Date */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Admission Date *
                </label>
                <input
                  type="date"
                  name="admissionDate"
                  value={formData.admissionDate}
                  onChange={handleChange}
                  className={inputStyle(!!formErrors.admissionDate)}
                />
                {formErrors.admissionDate && (
                  <p className="text-red-500 text-xs mt-1">
                    {formErrors.admissionDate}
                  </p>
                )}
              </div>

              {/* Attending Doctor */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Attending Doctor *
                </label>
                <input
                  type="text"
                  name="attendingDoctor"
                  value={formData.attendingDoctor}
                  onChange={handleChange}
                  className={inputStyle(!!formErrors.attendingDoctor)}
                  placeholder="Doctor Name"
                />
                {formErrors.attendingDoctor && (
                  <p className="text-red-500 text-xs mt-1">
                    {formErrors.attendingDoctor}
                  </p>
                )}
              </div>

              {/* Assigned Nurse */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Assigned Nurse *
                </label>
                <input
                  type="text"
                  name="assignedNurse"
                  value={formData.assignedNurse}
                  onChange={handleChange}
                  className={inputStyle(!!formErrors.assignedNurse)}
                  placeholder="Nurse Name"
                />
                {formErrors.assignedNurse && (
                  <p className="text-red-500 text-xs mt-1">
                    {formErrors.assignedNurse}
                  </p>
                )}
              </div>

              {/* Expected Discharge Date */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Expected Discharge Date *
                </label>
                <input
                  type="date"
                  name="expectedDischargeDate"
                  value={formData.expectedDischargeDate}
                  onChange={handleChange}
                  className={inputStyle(!!formErrors.expectedDischargeDate)}
                />
                {formErrors.expectedDischargeDate && (
                  <p className="text-red-500 text-xs mt-1">
                    {formErrors.expectedDischargeDate}
                  </p>
                )}
              </div>
            </div>

            {/* Reason for Admission */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Reason for Admission *
              </label>
              <textarea
                name="reasonForAdmission"
                rows={2}
                value={formData.reasonForAdmission}
                onChange={handleChange}
                className={inputStyle(!!formErrors.reasonForAdmission)}
                placeholder="Detailed reason for patient admission"
              ></textarea>
              {formErrors.reasonForAdmission && (
                <p className="text-red-500 text-xs mt-1">
                  {formErrors.reasonForAdmission}
                </p>
              )}
            </div>

            {/* Additional Notes */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Additional Notes (Optional)
              </label>
              <textarea
                name="additionalNotes"
                rows={3}
                value={formData.additionalNotes}
                onChange={handleChange}
                className={inputStyle(false)}
                placeholder="Any special instructions or observations"
              ></textarea>
            </div>

            <div className="flex justify-end pt-4 border-t">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center space-x-2 px-6 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition-colors disabled:bg-gray-400"
              >
                {isSubmitting ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>
                  {isSubmitting ? "Admitting..." : "Confirm Admission"}
                </span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

// --- Main DoctorModule Component ---
const DoctorModuleContent: React.FC<DoctorModuleProps> = ({
  selectedPatient,
  onBack,
  onCompleteConsultation,
}) => {
  const [activeTab, setActiveTab] = useState<
    "history" | "assessment" | "prescriptions" | "ai-assist"
  >("assessment");
  const [vitals, setVitals] = useState<Vitals | null>(null);
  const [showAdmissionModal, setShowAdmissionModal] = useState(false);
  const [consultation, setConsultation] = useState({
    symptoms: [{ id: 1, symptom: "", duration: "", factors: "" }],
    duration: "",
    aggravatingFactors: [] as string[],
    generalExamination: [] as string[],
    systemicExamination: [] as string[], // Placeholder for CNS, RS, etc.
    investigations: [] as string[],
    diagnosis: "",
    notes: "",
  });

  // ✅ FIX: State for checkboxes, decoupled from the symptoms table
  const [quickSymptoms, setQuickSymptoms] = useState<string[]>([]);

  const [symptomOptions, setSymptomOptions] = useState<string[]>([
    "Fever",
    "Cold",
    "Cough",
    "Diarrhea",
    "Vomiting",
    "Headache",
    "Back Pain",
  ]);

  const addSymptomOption = (symptom: string) => {
    if (!symptomOptions.includes(symptom)) {
      setSymptomOptions((prev) => [...prev, symptom]);
    }
  };

  const [uploadedFilesData, setUploadedFilesData] = useState<
    Record<string, string>
  >({});
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [aiSummary, setAiSummary] = useState("");
  const [isAiSummaryLoading, setIsAiSummaryLoading] = useState(false);
  const fileInputRefs = {
    "Discharge Summary": useRef<HTMLInputElement>(null),
    "X-Ray (PDF)": useRef<HTMLInputElement>(null),
    "USG (PDF)": useRef<HTMLInputElement>(null),
    "Investigation ROP": useRef<HTMLInputElement>(null),
  };

  // --- Utility functions: File Handling and Text Extraction ---
  const extractTextFromFile = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          if (file.type === "application/pdf") {
            const loadingTask = pdfjsLib.getDocument(
              event.target?.result as ArrayBuffer
            );
            const pdf = await loadingTask.promise;
            let text = "";
            for (let i = 1; i <= pdf.numPages; i++) {
              const page = await pdf.getPage(i);
              const content = await page.getTextContent();
              text += content.items.map((item: any) => item.str).join(" ");
            }
            resolve(text);
          } else if (
            file.type ===
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          ) {
            const arrayBuffer = event.target?.result as ArrayBuffer;
            const result = await mammoth.extractRawText({ arrayBuffer });
            resolve(result.value);
          } else if (file.type === "text/plain") {
            resolve(event.target?.result as string);
          } else {
            reject(new Error("Unsupported file type"));
          }
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = (error) => {
        reject(error);
      };

      if (
        file.type === "application/pdf" ||
        file.type ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        reader.readAsArrayBuffer(file);
      } else {
        reader.readAsText(file);
      }
    });
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    fileType: string
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const text = await extractTextFromFile(file);
        setUploadedFilesData((prev) => ({ ...prev, [fileType]: text }));
        // alert(`Successfully extracted text from ${fileType}!`);
      } catch (error) {
        console.error("Error extracting text from file:", error);
        alert(`Failed to extract text from ${fileType}.`);
      }
      // Reset file input to allow uploading the same file again if needed
      event.target.value = "";
    }
  };

  // 🧠 CORE AI LOGIC: Document-Only Summary
  const handleAiSummary = async () => {
    setIsSummaryModalOpen(true);
    setIsAiSummaryLoading(true);
    setAiSummary("");

    const fileContentArray = Object.entries(uploadedFilesData)
      .filter(([_, text]) => text && text.trim().length > 0)
      .map(
        ([fileType, text]) => `**--- ${fileType.toUpperCase()} ---**\n${text}`
      );

    // Safety check for no content
    if (fileContentArray.length === 0) {
      setIsAiSummaryLoading(false);
      setAiSummary(
        "No uploaded or successfully processed medical history documents found to generate a summary from."
      );
      return;
    }

    // Prompt content STRICTLY limits input to uploaded files
    const combinedData = `
        DOCUMENT-ONLY MEDICAL HISTORY SUMMARY REQUEST:
        
        The following documents were uploaded for Patient ${
          selectedPatient?.uhid || "N/A"
        }:
        
        ${fileContentArray.join("\n\n")}
        
        TASK: You are a medical records specialist. Your task is to generate a comprehensive and objective summary based *strictly* on the text provided in the documents above. Do not include any external information. Structure the summary with clear markdown headers and bullet points covering:
        1. **Patient Demographics (if present in documents)**
        2. **Key Past Diagnoses/Procedures**
        3. **Medications (if listed)**
        4. **Date and Reason for Document Creation**
        5. **Overall Summary/Conclusion of the Documents**
        
        If a section's information is not present in the documents, state 'N/A' for that section.
    `;

    try {
      // NOTE: This API Key is exposed in client-side code and SHOULD BE PROXIED through a backend in a production environment.
      const response = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer ",
          },
          body: JSON.stringify({
            model: "llama-3.1-8b-instant",
            messages: [
              {
                role: "system",
                content:
                  "You are a medical records specialist. Generate the summary ONLY from the provided text using clear markdown. Do not hallucinate or include outside information.",
              },
              {
                role: "user",
                content: combinedData,
              },
            ],
          }),
        }
      );
      const data = await response.json();
      const summary =
        data?.choices?.[0]?.message?.content?.trim() ||
        "Could not generate summary from documents.";
      setAiSummary(summary);
    } catch (error) {
      console.error("Error generating AI summary:", error);
      setAiSummary(
        "An error occurred while connecting to the AI service. Check console for details."
      );
    } finally {
      setIsAiSummaryLoading(false);
    }
  };

  // --- Utility functions: Consultation & Vitals ---

  const handleSymptomChange = (
    id: number,
    field: "symptom" | "duration" | "factors",
    value: string
  ) => {
    setConsultation((prev) => ({
      ...prev,
      symptoms: prev.symptoms.map((symptom) =>
        symptom.id === id ? { ...symptom, [field]: value } : symptom
      ),
    }));
  };

  const addSymptomRow = () => {
    setConsultation((prev) => ({
      ...prev,
      symptoms: [
        ...prev.symptoms,
        {
          id: Date.now(),
          symptom: "",
          duration: "",
          factors: "",
        },
      ],
    }));
  };

  const removeSymptomRow = (id: number) => {
    setConsultation((prev) => ({
      ...prev,
      symptoms: prev.symptoms.filter((symptom) => symptom.id !== id),
    }));
  };

  const handleToggleGeneralExam = (finding: string, isChecked: boolean) => {
    setConsultation((prev) => ({
      ...prev,
      generalExamination: isChecked
        ? [...prev.generalExamination, finding]
        : prev.generalExamination.filter((f) => f !== finding),
    }));
  };

  const handleSystemicExamChange = (system: string, value: string) => {
    setConsultation((prev) => {
      // Simple approach: find the existing entry for the system and update it, or add it.
      const existingIndex = prev.systemicExamination.findIndex((item) =>
        item.startsWith(`${system}:`)
      );
      const newEntry = `${system}: ${value}`;

      const newSystemicExam = [...prev.systemicExamination];

      if (existingIndex > -1) {
        newSystemicExam[existingIndex] = newEntry;
      } else {
        newSystemicExam.push(newEntry);
      }

      return { ...prev, systemicExamination: newSystemicExam };
    });
  };

  const formatBloodPressure = (bp: string): string => {
    if (!bp || bp === "0/0") return "N/A";
    return bp.includes("/") ? bp : `${bp}/N/A`;
  };

  const getVitalsDisplay = () => {
    if (!vitals) {
      return [
        { label: "BP", value: "N/A", unit: "mmHg" },
        { label: "PR", value: "N/A", unit: "bpm" },
        { label: "SpO₂", value: "N/A", unit: "%" },
        { label: "BMI", value: "N/A", unit: "" },
        { label: "RR", value: "N/A", unit: "/min" },
      ];
    }

    return [
      {
        label: "BP",
        value: formatBloodPressure(vitals.bloodPressure),
        unit: "mmHg",
      },
      {
        label: "PR",
        value: vitals.pulse?.toString() || "N/A",
        unit: "bpm",
      },
      {
        label: "SpO₂",
        value: vitals.spo2?.toString() || "N/A",
        unit: "%",
      },
      {
        label: "BMI",
        value: vitals.bmi?.toString() || "N/A",
        unit: "",
      },
      {
        label: "RR",
        value: vitals.respiratoryRate?.toString() || "N/A",
        unit: "/min",
      },
    ];
  };

  const inputStyle =
    "p-2 border border-gray-300 rounded-md w-full bg-gray-50 focus:ring-2 focus:ring-[#012e58] focus:border-[#012e58] transition duration-200 ease-in-out text-[#0B2D4D] placeholder:text-gray-500 text-sm";

  const TabButton: React.FC<{
    id: string;
    label: string;
    icon: React.ComponentType<any>;
  }> = ({ id, label, icon: Icon }) => (
    <button
      onClick={() => setActiveTab(id as any)}
      className={`flex items-center space-x-1.5 px-3 py-2 rounded-md font-medium text-sm transition-all duration-200 ${
        activeTab === id
          ? "bg-[#012e58] text-white shadow-md"
          : "text-[#1a4b7a] hover:bg-[#012e58]/10 border border-gray-200 bg-white"
      }`}
    >
      <Icon className="w-4 h-4" /> <span>{label}</span>
    </button>
  );

  // Fetch vitals from Firebase when a patient is selected
  useEffect(() => {
    if (!selectedPatient?.id) {
      setVitals(null);
      return;
    }
    const vitalsQuery = query(
      collection(db, "vitals"),
      where("patientId", "==", selectedPatient.id),
      orderBy("recordedAt", "desc") // Fetch latest vital
    );
    const unsubscribe = onSnapshot(vitalsQuery, (snapshot) => {
      if (snapshot.docs.length > 0) {
        const latestVitals = snapshot.docs[0].data() as Vitals;
        setVitals(latestVitals);
      } else {
        setVitals(null);
      }
    });
    return () => unsubscribe();
  }, [selectedPatient]);

  const mockHistory = [
    { date: "2024-08-15", diagnosis: "Routine Checkup", doctor: "Dr. Dhinesh" },
    {
      date: "2024-07-10",
      diagnosis: "Hypertension Follow-up",
      doctor: "Dr. Dhinesh",
    },
  ];

  // --- ADMISSION LOGIC ---
  const handleAddToInPatient = () => {
    if (selectedPatient) {
      setShowAdmissionModal(true);
    }
  };

  const handleConfirmAdmission = (admissionData: AdmissionData) => {
    console.log(
      `IPD Admission Confirmed for ${selectedPatient?.fullName}:`,
      admissionData
    );
    // Real logic to update DB and redirect/refresh goes here.
  };
  // --- END ADMISSION LOGIC ---

  if (!selectedPatient) {
    return <PatientQueue />;
  }

  return (
    <div className="p-2 bg-gray-100 min-h-screen font-sans">
      <div className="w-full bg-white p-4 rounded-lg shadow-lg border border-gray-200">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <button
              onClick={onBack}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-[#1a4b7a] hover:text-[#0B2D4D] hover:bg-gray-100 rounded-md transition-colors border border-gray-200 text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="font-medium">Back</span>
            </button>
            <div className="h-6 w-px bg-gray-300"></div>
            <div className="flex space-x-2">
              <TabButton id="history" label="History" icon={FileText} />
              <TabButton
                id="assessment"
                label="Assessment"
                icon={Stethoscope}
              />
              <TabButton id="ai-assist" label="AI Assist" icon={Bot} />
              <TabButton id="prescriptions" label="Prescriptions" icon={Pill} />
            </div>
          </div>
          <div className="bg-gradient-to-r from-[#012e58]/5 to-[#1a4b7a]/5 rounded-lg border border-gray-200 p-3 shadow-sm">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-[#012e58] rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">
                  {selectedPatient.fullName
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("")}
                </span>
              </div>
              <div>
                <p className="font-bold text-sm text-[#0B2D4D]">
                  {selectedPatient.fullName}
                </p>
                <p className="text-[#1a4b7a] font-medium text-xs">
                  {selectedPatient.uhid} • {selectedPatient.age}Y •{" "}
                  {selectedPatient.gender}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "history" && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-lg border border-gray-200 transition-shadow hover:shadow-md">
              <SectionHeader icon={UserCheck} title="Patient Information" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-[#1a4b7a] mb-1 block">
                      Contact Number
                    </label>
                    <p className="font-semibold text-sm text-[#0B2D4D] bg-gray-50 p-2 rounded-md">
                      {selectedPatient.contactNumber}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[#1a4b7a] mb-1 block">
                      Visit Type
                    </label>
                    <p className="font-semibold text-sm text-[#0B2D4D] bg-gray-50 p-2 rounded-md">
                      {selectedPatient.visitType}
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-[#1a4b7a] mb-1 block">
                      Address
                    </label>
                    <p className="font-semibold text-sm text-[#0B2D4D] bg-gray-50 p-2 rounded-md">
                      {selectedPatient.address}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[#1a4b7a] mb-1 block">
                      Payment Method
                    </label>
                    <p className="font-semibold text-sm text-[#0B2D4D] bg-gray-50 p-2 rounded-md">
                      {selectedPatient.paymentMethod}
                    </p>
                  </div>
                </div>
              </div>
              {selectedPatient.chronicConditions &&
                selectedPatient.chronicConditions.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-gray-200">
                    <label className="text-xs font-medium text-[#1a4b7a] mb-2 block">
                      Chronic Conditions
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedPatient.chronicConditions.map(
                        (condition, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-red-50 border border-red-200 text-red-700 text-xs font-medium rounded-md"
                          >
                            {condition}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                )}
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200 transition-shadow hover:shadow-md">
              <SectionHeader icon={Clock} title="Previous Consultations" />
              <div className="space-y-2">
                {mockHistory.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-gray-50/50 rounded-md border border-gray-100 hover:shadow-sm transition-shadow"
                  >
                    <div>
                      <p className="font-semibold text-[#0B2D4D] text-sm">
                        {item.diagnosis}
                      </p>
                      <p className="text-[#1a4b7a] font-medium text-xs">
                        {item.doctor}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1.5 px-2 py-1 bg-[#012e58]/10 rounded-md">
                        <Calendar className="w-3 h-3 text-[#012e58]" />
                        <span className="text-xs font-medium text-[#012e58]">
                          {item.date}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Assessment Tab */}
        {activeTab === "assessment" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 bg-white p-4 rounded-lg border border-gray-200 transition-shadow hover:shadow-md">
                <SectionHeader icon={Activity} title="Patient Vitals" />
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {getVitalsDisplay().map((vital) => (
                    <div
                      key={vital.label}
                      className="text-center p-3 bg-gradient-to-b from-gray-50 to-white rounded-md border border-gray-100"
                    >
                      <p className="text-xs font-medium text-gray-500 mb-1">
                        {vital.label}
                      </p>
                      <p className="font-bold text-lg text-[#0B2D4D]">
                        {vital.value}
                      </p>
                      {vital.unit && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          {vital.unit}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
                {vitals && (
                  <div className="mt-3 pt-2 border-t border-gray-200">
                    <p className="text-xs text-gray-600">
                      Last recorded:{" "}
                      {vitals.recordedAt && (vitals.recordedAt as any).toDate
                        ? (vitals.recordedAt as any).toDate().toLocaleString()
                        : new Date(vitals.recordedAt).toLocaleString()}
                    </p>
                    {vitals.recordedBy && (
                      <p className="text-xs text-gray-600">
                        Recorded by: {vitals.recordedBy}
                      </p>
                    )}
                  </div>
                )}
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200 transition-shadow hover:shadow-md">
                <SectionHeader icon={FileDown} title="Medical History" />
                <div className="space-y-2">
                  {Object.keys(fileInputRefs).map((name) => (
                    <div key={name}>
                      <input
                        type="file"
                        accept=".pdf,.docx,.txt"
                        ref={fileInputRefs[name as keyof typeof fileInputRefs]}
                        onChange={(e) => handleFileUpload(e, name)}
                        style={{ display: "none" }}
                      />
                      <button
                        onClick={() =>
                          fileInputRefs[
                            name as keyof typeof fileInputRefs
                          ].current?.click()
                        }
                        className="flex items-center space-x-2 w-full px-3 py-2 text-xs bg-gradient-to-r from-[#012e58]/5 to-[#012e58]/10 hover:from-[#012e58]/10 hover:to-[#012e58]/15 rounded-md border border-gray-200 transition-all duration-200 group"
                      >
                        <Upload className="w-3 h-3 text-[#012e58] group-hover:scale-110 transition-transform" />
                        <span className="font-medium text-[#0B2D4D]">
                          {name}
                        </span>
                        {uploadedFilesData[name] && (
                          <CheckCircle className="w-3 h-3 text-green-500 ml-auto" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <button
                    onClick={handleAiSummary}
                    disabled={isAiSummaryLoading}
                    className="w-full flex items-center justify-center space-x-1.5 text-[#012e58] hover:bg-gray-100 p-2 rounded-md transition-colors"
                  >
                    {isAiSummaryLoading ? (
                      <Loader className="w-3 h-3 animate-spin" />
                    ) : (
                      <Brain className="w-3 h-3" />
                    )}
                    <span className="text-xs font-semibold">
                      {isAiSummaryLoading
                        ? "Generating..."
                        : "AI Assisted Summary"}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* ✅ START: CORRECTED CHIEF COMPLAINTS BLOCK */}
            <div className="bg-white p-4 rounded-lg border border-gray-200 transition-shadow hover:shadow-md">
              <SectionHeader icon={ClipboardList} title="Chief Complaints" />
              <div className="mb-4">
                <label className="text-xs font-medium text-[#1a4b7a] mb-2 block">
                  Quick Symptom Selection
                </label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  {["Fever", "Cold", "Cough", "Diarrhea", "Vomiting"].map(
                    (symptom) => (
                      <label
                        key={symptom}
                        className="flex items-center space-x-1.5 p-2 bg-gray-50 rounded-md border border-gray-200 hover:bg-[#012e58]/5 transition-colors cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          // Read 'checked' from the new 'quickSymptoms' state
                          checked={quickSymptoms.includes(symptom)}
                          // 'onChange' only updates the 'quickSymptoms' state
                          onChange={(e) => {
                            if (e.target.checked) {
                              setQuickSymptoms((prev) => [...prev, symptom]);
                            } else {
                              setQuickSymptoms((prev) =>
                                prev.filter((s) => s !== symptom)
                              );
                            }
                          }}
                          className="rounded border-gray-300 text-[#012e58] focus:ring-[#012e58] focus:ring-2"
                        />
                        <span className="text-xs font-medium text-[#0B2D4D]">
                          {symptom}
                        </span>
                      </label>
                    )
                  )}
                </div>
              </div>
              <div className="overflow-x-auto bg-gray-50 rounded-md border border-gray-200">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-[#012e58] to-[#1a4b7a] text-white">
                      <th className="p-2 text-left font-semibold text-xs">
                        Symptom
                      </th>
                      <th className="p-2 text-left font-semibold text-xs">
                        Duration
                      </th>
                      <th className="p-2 text-left font-semibold text-xs">
                        Aggravating/Relieving Factors
                      </th>
                      <th className="p-2 text-center font-semibold text-xs">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {consultation.symptoms.map((symptom) => (
                      <tr key={symptom.id} className="border-t border-gray-200">
                        <td className="p-2">
                          <AutocompleteInput
                            symptomId={symptom.id}
                            value={symptom.symptom}
                            onChange={(id, value) =>
                              handleSymptomChange(id, "symptom", value)
                            }
                            symptomOptions={symptomOptions}
                            addSymptomOption={addSymptomOption}
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="text"
                            value={symptom.duration}
                            onChange={(e) =>
                              handleSymptomChange(
                                symptom.id,
                                "duration",
                                e.target.value
                              )
                            }
                            className={inputStyle}
                            placeholder="Duration (e.g., 2 days)"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="text"
                            value={symptom.factors}
                            onChange={(e) =>
                              handleSymptomChange(
                                symptom.id,
                                "factors",
                                e.target.value
                              )
                            }
                            className={inputStyle}
                            placeholder="Factors that worsen/improve"
                          />
                        </td>
                        <td className="p-2 text-center">
                          <button
                            onClick={() => removeSymptomRow(symptom.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <button
                  onClick={addSymptomRow}
                  className="w-full mt-2 flex items-center justify-center space-x-1.5 p-2 text-xs font-medium text-[#012e58] bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Symptom</span>
                </button>
              </div>
            </div>
            {/* ✅ END: CORRECTED CHIEF COMPLAINTS BLOCK */}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg border border-gray-200 transition-shadow hover:shadow-md">
                <SectionHeader icon={Eye} title="General Examination" />
                <div className="mb-4">
                  <label className="text-xs font-medium text-[#1a4b7a] mb-2 block">
                    Clinical Findings
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {["Pallor", "Icterus", "Cyanosis", "Clubbing", "LAP"].map(
                      (item) => (
                        <label
                          key={item}
                          className="flex items-center space-x-1.5 p-2 bg-gray-50 rounded-md border border-gray-200 hover:bg-[#012e58]/5 transition-colors cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={consultation.generalExamination.includes(
                              item
                            )}
                            onChange={(e) =>
                              handleToggleGeneralExam(item, e.target.checked)
                            }
                            className="rounded border-gray-300 text-[#012e58] focus:ring-[#012e58] focus:ring-2"
                          />
                          <span className="text-xs font-medium text-[#0B2D4D]">
                            {item}
                          </span>
                        </label>
                      )
                    )}
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-[#1a4b7a] mb-1 block">
                      Consciousness
                    </label>
                    <input
                      type="text"
                      className={inputStyle}
                      placeholder="Level of consciousness"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[#1a4b7a] mb-1 block">
                      Built
                    </label>
                    <select className={inputStyle}>
                      <option value="">Select built</option>
                      <option value="Mild">Mild</option>
                      <option value="Moderate">Moderate</option>
                      <option value="Severe">Severe</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200 transition-shadow hover:shadow-md">
                <SectionHeader icon={BookOpen} title="Templates & Quick Fill" />
                <div className="mb-4">
                  <label className="text-xs font-medium text-[#1a4b7a] mb-2 block">
                    Common Templates
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    {["Knee Pain", "Back Pain", "Muscle Spasm"].map((item) => (
                      <label
                        key={item}
                        className="flex items-center space-x-2 p-2 bg-gradient-to-r from-[#012e58]/5 to-[#012e58]/10 rounded-md border border-gray-200 hover:shadow-sm transition-all cursor-pointer group"
                      >
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-[#012e58] focus:ring-[#012e58] focus:ring-2"
                        />
                        <span className="font-medium text-xs text-[#0B2D4D] group-hover:text-[#012e58] transition-colors">
                          {item}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search symptoms/findings"
                    className="pl-8 pr-3 py-2 w-full border border-gray-300 rounded-md bg-gray-50 focus:ring-2 focus:ring-[#012e58] focus:border-[#012e58] transition duration-200 text-sm"
                  />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg border border-gray-200 transition-shadow hover:shadow-md">
                <SectionHeader icon={Heart} title="Systemic Examination" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    {
                      label: "CNS",
                      placeholder: "Central Nervous System findings",
                    },
                    { label: "RS", placeholder: "Respiratory System findings" },
                    {
                      label: "CVS",
                      placeholder: "Cardiovascular System findings",
                    },
                    { label: "P/A", placeholder: "Per Abdomen findings" },
                  ].map((system) => {
                    // Extract the current value from the state based on the system label
                    const currentEntry =
                      consultation.systemicExamination.find((item) =>
                        item.startsWith(`${system.label}:`)
                      ) || `${system.label}: `;
                    const currentValue = currentEntry.substring(
                      system.label.length + 2
                    ); // Get text after "CNS: "

                    return (
                      <div key={system.label} className="space-y-1">
                        <label className="text-xs font-semibold text-[#1a4b7a] block">
                          {system.label}
                        </label>
                        <textarea
                          className="w-full p-2 border border-gray-300 rounded-md bg-gray-50 focus:ring-2 focus:ring-[#012e58] focus:border-[#012e58] transition duration-200 resize-none text-sm"
                          rows={2}
                          placeholder={system.placeholder}
                          value={currentValue}
                          onChange={(e) =>
                            handleSystemicExamChange(
                              system.label,
                              e.target.value
                            )
                          }
                        ></textarea>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200 transition-shadow hover:shadow-md">
                <SectionHeader icon={Stethoscope} title="Local Examination" />
                <div className="flex items-center justify-center h-32 border-2 border-dashed border-gray-300 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100">
                  <div className="text-center space-y-1">
                    <Stethoscope className="w-8 h-8 text-gray-400 mx-auto" />
                    <p className="text-gray-500 font-medium text-sm">
                      Case-Specific Examination
                    </p>
                    <p className="text-xs text-gray-400">
                      Orthopedic module integration
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "prescriptions" && selectedPatient && (
          <div className="space-y-4">
            <PrescriptionModule
              selectedPatient={selectedPatient}
              consultation={consultation}
            />
          </div>
        )}
        {activeTab === "ai-assist" && selectedPatient && (
          <div className="space-y-4">
            <Ai
              consultation={consultation}
              selectedPatient={selectedPatient}
              vitals={vitals}
            />
          </div>
        )}

        {/* Action Footer */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200">
          <div className="flex items-center space-x-3">
            <button className="group flex items-center px-4 py-2 border border-[#012e58] rounded-md text-[#012e58] bg-white hover:bg-[#012e58] hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#012e58] transition-all duration-300 text-sm font-medium">
              <Save className="w-4 h-4 mr-1.5 transition-transform duration-300 group-hover:scale-110" />
              Save Draft
            </button>

            {/* Add to In-Patient Button */}
            <button
              onClick={handleAddToInPatient}
              className="group flex items-center px-4 py-2 bg-red-500 text-white font-semibold rounded-md shadow-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-300 text-sm"
            >
              <Hospital className="w-4 h-4 mr-1.5" />
              <span>Add to In-Patient</span>
            </button>

            {activeTab === "assessment" && (
              <button
                onClick={() => setActiveTab("ai-assist")}
                className="group flex items-center px-4 py-2 border border-[#012e58] rounded-md  bg-[#012e58] hover:bg-[#012e58e3] text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#012e58] transition-all duration-300 text-sm font-medium"
              >
                <Bot className="w-4 h-4 mr-1.5 transition-transform duration-300 group-hover:scale-110" />
                AI Assist
              </button>
            )}
            {activeTab === "ai-assist" && (
              <button
                onClick={() => setActiveTab("prescriptions")}
                className="group flex items-center px-4 py-2 bg-[#012e58] text-white font-semibold rounded-md shadow-md hover:bg-[#1a4b7a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#012e58] transition-all duration-300 text-sm"
              >
                <span>Prescription</span>
                <ChevronRight className="w-4 h-4 ml-1.5" />
              </button>
            )}
          </div>

          {(activeTab === "prescriptions" || activeTab === "assessment") && (
            <button
              onClick={() => onCompleteConsultation(selectedPatient.id)}
              className="group flex items-center px-4 py-2 bg-green-600 text-white font-semibold rounded-md shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-600 transition-all duration-300 text-sm"
            >
              <span>Complete Consultation</span>
              <CheckCircle className="w-4 h-4 ml-1.5" />
            </button>
          )}
        </div>
      </div>
      <AiSummaryModal
        isOpen={isSummaryModalOpen}
        onClose={() => setIsSummaryModalOpen(false)}
        summary={aiSummary}
        isLoading={isAiSummaryLoading}
      />

      {/* In-Patient Admission Modal Renderer */}
      {showAdmissionModal && selectedPatient && (
        <InPatientAdmissionModal
          patient={selectedPatient}
          onClose={() => setShowAdmissionModal(false)}
          onConfirm={handleConfirmAdmission}
        />
      )}
    </div>
  );
};

export const DoctorModule: React.FC<DoctorModuleProps> = (props) => {
  return (
    <PrescriptionProvider>
      <DoctorModuleContent {...props} />
    </PrescriptionProvider>
  );
};

export default DoctorModule;
