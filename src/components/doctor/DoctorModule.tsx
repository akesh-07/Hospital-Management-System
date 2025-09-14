import React, { useState, useEffect } from "react";
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
  Plus,
  Trash2,
  Calendar,
  Save,
  Printer,
  Heart,
  FileDown,
  Search,
} from "lucide-react";
import { db } from "../../firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
} from "firebase/firestore";
import { Vitals } from "../../types";
import PatientQueue from "../queue/PatientQueue";

// Import the Patient interface from PatientQueue
interface Patient {
  id: string;
  uhid: string;
  fullName: string;
  age: number;
  dateOfBirth: string;
  gender: "Male" | "Female" | "Other";
  contactNumber: string;
  email: string;
  address: string;
  abhaId?: string;
  patientType: "OPD" | "IPD" | "Emergency";
  visitType: "Appointment" | "Walk-in";
  paymentMethod: "Cash" | "Card" | "Insurance" | "Online";
  consultationPackage: string;
  preferredLanguage: string;
  doctorAssigned: string;
  chronicConditions: string[];
  waitTime?: number;
  status: "Waiting" | "In Progress" | "Completed";
  createdAt: string;
}

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

interface DoctorModuleProps {
  selectedPatient?: Patient | null;
  onBack?: () => void;
}

// --- PrescriptionModule Component ---
// This is the PrescriptionModule, now adapted to be used within DoctorModule
const PrescriptionModule: React.FC<{
  selectedPatient: Patient;
  consultation: any;
}> = ({ selectedPatient, consultation }) => {
  const [medications, setMedications] = useState<Medication[]>([
    {
      id: "1",
      name: "",
      dosage: "",
      frequency: "",
      duration: "",
      instructions: "",
    },
  ]);

  const [advice, setAdvice] = useState({
    general: [] as string[],
    diet: [] as string[],
    followUp: {
      enabled: false,
      duration: "",
      unit: "Days" as "Days" | "Months" | "Years",
    },
  });

  const commonMedications = [
    "Paracetamol",
    "Ibuprofen",
    "Metformin",
    "Lisinopril",
    "Omeprazole",
    "Aspirin",
    "Atorvastatin",
    "Amoxicillin",
    "Losartan",
    "Pantoprazole",
  ];

  const dosageOptions = [
    "250mg",
    "500mg",
    "1g",
    "5mg",
    "10mg",
    "25mg",
    "50mg",
    "100mg",
  ];
  const frequencyOptions = [
    "Once daily",
    "Twice daily",
    "Thrice daily",
    "Four times daily",
    "As needed",
  ];
  const durationOptions = [
    "3 days",
    "5 days",
    "7 days",
    "10 days",
    "2 weeks",
    "1 month",
  ];

  const generalAdvice = [
    "Drink plenty of water (8-10 glasses/day)",
    "Take adequate rest and sleep",
    "Avoid smoking and alcohol",
    "Regular exercise as tolerated",
    "Monitor blood pressure regularly",
    "Take medications as prescribed",
  ];

  const dietPlans = [
    "Diabetic Diet - Low sugar, controlled carbs",
    "CKD Diet - Low protein, restricted potassium",
    "Hypertension Diet - Low sodium, DASH diet",
    "Heart Healthy Diet - Low saturated fat",
    "Weight Loss Diet - Calorie controlled",
  ];

  const addMedication = () => {
    const newId = (medications.length + 1).toString();
    setMedications([
      ...medications,
      {
        id: newId,
        name: "",
        dosage: "",
        frequency: "",
        duration: "",
        instructions: "",
      },
    ]);
  };

  const removeMedication = (id: string) => {
    setMedications(medications.filter((med) => med.id !== id));
  };

  const updateMedication = (
    id: string,
    field: keyof Medication,
    value: string
  ) => {
    setMedications(
      medications.map((med) =>
        med.id === id ? { ...med, [field]: value } : med
      )
    );
  };

  const toggleAdvice = (category: "general" | "diet", item: string) => {
    setAdvice((prev) => ({
      ...prev,
      [category]: prev[category].includes(item)
        ? prev[category].filter((i) => i !== item)
        : [...prev[category], item],
    }));
  };

  return (
    <div className="bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <FileText className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Prescription & Advice
              </h1>
              <p className="text-gray-600">
                Create detailed prescription and treatment plan
              </p>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="font-semibold text-gray-900">
              {selectedPatient.fullName}
            </p>
            <p className="text-sm text-gray-600">
              {selectedPatient.uhid} • {selectedPatient.age}Y
            </p>
            <p className="text-sm text-blue-600 font-medium">
              {consultation.diagnosis || "Pending Diagnosis"}
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Medications
              </h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={addMedication}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Medication</span>
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {medications.map((medication, index) => (
                <div
                  key={medication.id}
                  className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-gray-900">
                      Medication {index + 1}
                    </h4>
                    {medications.length > 1 && (
                      <button
                        onClick={() => removeMedication(medication.id)}
                        className="p-1 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Medication Name
                      </label>
                      <input
                        type="text"
                        list={`medications-${medication.id}`}
                        value={medication.name}
                        onChange={(e) =>
                          updateMedication(
                            medication.id,
                            "name",
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter medication"
                      />
                      <datalist id={`medications-${medication.id}`}>
                        {commonMedications.map((med) => (
                          <option key={med} value={med} />
                        ))}
                      </datalist>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Dosage
                      </label>
                      <input
                        type="text"
                        list={`dosage-${medication.id}`}
                        value={medication.dosage}
                        onChange={(e) =>
                          updateMedication(
                            medication.id,
                            "dosage",
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., 500mg"
                      />
                      <datalist id={`dosage-${medication.id}`}>
                        {dosageOptions.map((dose) => (
                          <option key={dose} value={dose} />
                        ))}
                      </datalist>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Frequency
                      </label>
                      <select
                        value={medication.frequency}
                        onChange={(e) =>
                          updateMedication(
                            medication.id,
                            "frequency",
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select frequency</option>
                        {frequencyOptions.map((freq) => (
                          <option key={freq} value={freq}>
                            {freq}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Duration
                      </label>
                      <select
                        value={medication.duration}
                        onChange={(e) =>
                          updateMedication(
                            medication.id,
                            "duration",
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select duration</option>
                        {durationOptions.map((dur) => (
                          <option key={dur} value={dur}>
                            {dur}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Instructions
                      </label>
                      <input
                        type="text"
                        value={medication.instructions}
                        onChange={(e) =>
                          updateMedication(
                            medication.id,
                            "instructions",
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., After meals"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                General Advice
              </h3>
              <div className="space-y-3">
                {generalAdvice.map((item) => (
                  <label
                    key={item}
                    className="flex items-start space-x-3 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={advice.general.includes(item)}
                      onChange={() => toggleAdvice("general", item)}
                      className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{item}</span>
                  </label>
                ))}
              </div>

              <div className="mt-6">
                <button className="flex items-center space-x-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors">
                  <Bot className="w-4 h-4" />
                  <span>AI Suggested Advice</span>
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Diet Plan
              </h3>
              <div className="space-y-3">
                {dietPlans.map((plan) => (
                  <label
                    key={plan}
                    className="flex items-start space-x-3 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={advice.diet.includes(plan)}
                      onChange={() => toggleAdvice("diet", plan)}
                      className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{plan}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Follow-up Schedule
            </h3>
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={advice.followUp.enabled}
                  onChange={(e) =>
                    setAdvice((prev) => ({
                      ...prev,
                      followUp: {
                        ...prev.followUp,
                        enabled: e.target.checked,
                      },
                    }))
                  }
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-gray-700">Schedule follow-up</span>
              </label>

              {advice.followUp.enabled && (
                <>
                  <input
                    type="number"
                    min="1"
                    value={advice.followUp.duration}
                    onChange={(e) =>
                      setAdvice((prev) => ({
                        ...prev,
                        followUp: {
                          ...prev.followUp,
                          duration: e.target.value,
                        },
                      }))
                    }
                    className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="1"
                  />
                  <select
                    value={advice.followUp.unit}
                    onChange={(e) =>
                      setAdvice((prev) => ({
                        ...prev,
                        followUp: {
                          ...prev.followUp,
                          unit: e.target.value as "Days" | "Months" | "Years",
                        },
                      }))
                    }
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Days">Days</option>
                    <option value="Months">Months</option>
                    <option value="Years">Years</option>
                  </select>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Main DoctorModule Component ---
export const DoctorModule: React.FC<DoctorModuleProps> = ({
  selectedPatient,
  onBack,
}) => {
  const [activeTab, setActiveTab] = useState<
    "history" | "assessment" | "prescriptions" | "ai-assist"
  >("assessment");
  const [vitals, setVitals] = useState<Vitals | null>(null);
  const [consultation, setConsultation] = useState({
    symptoms: [] as string[],
    duration: "",
    aggravatingFactors: [] as string[],
    generalExamination: [] as string[],
    systemicExamination: [] as string[],
    investigations: [] as string[],
    diagnosis: "",
    notes: "",
  });

  // Fetch vitals from Firebase when a patient is selected
  useEffect(() => {
    if (!selectedPatient?.id) {
      setVitals(null);
      return;
    }

    const vitalsQuery = query(
      collection(db, "vitals"),
      where("patientId", "==", selectedPatient.id),
      orderBy("recordedAt", "desc")
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

  const AIAssistTab: React.FC<{
    consultation: any;
    selectedPatient: Patient;
  }> = ({ consultation, selectedPatient }) => {
    const [symptoms, setSymptoms] = useState("");
    const [duration, setDuration] = useState("");
    const [diagnosis, setDiagnosis] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async () => {
      if (!symptoms.trim() && !duration.trim()) {
        setDiagnosis("Please enter symptoms or duration to get a diagnosis.");
        return;
      }

      setIsLoading(true);
      setDiagnosis("");

      try {
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
                    "You are a medical assistant. Given symptoms and duration, suggest a possible diagnosis and treatment plan and also generate a prescription. Format your response in a clear, structured manner with sections for Diagnosis, Treatment Plan, and Prescription.",
                },
                {
                  role: "user",
                  content: `Patient Information:
Name: ${selectedPatient.fullName}
Age: ${selectedPatient.age}
Gender: ${selectedPatient.gender}
Chronic Conditions: ${selectedPatient.chronicConditions?.join(", ") || "None"}

Current Symptoms: ${symptoms || "Not specified"}
Duration: ${duration || "Not specified"}
Additional Symptoms from examination: ${
                    consultation.symptoms?.join(", ") || "None"
                  }`,
                },
              ],
            }),
          }
        );

        const data = await response.json();
        const content =
          data?.choices?.[0]?.message?.content?.trim() ||
          data?.choices?.[0]?.text?.trim() ||
          "Unable to generate diagnosis. Please try again.";

        setDiagnosis(content);
      } catch (err) {
        console.error("Error calling Groq:", err);
        setDiagnosis(
          "Error connecting to AI service. Please check your connection and try again."
        );
      } finally {
        setIsLoading(false);
      }
    };

    const handleAutoFill = () => {
      if (consultation.symptoms?.length > 0) {
        setSymptoms(consultation.symptoms.join(", "));
      }
      if (consultation.duration) {
        setDuration(consultation.duration);
      }
    };

    return (
      <div className="space-y-6">
        {/* Header */}{" "}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          {" "}
          <div className="flex items-center justify-between mb-6">
            {" "}
            <div className="flex items-center space-x-3">
              {" "}
              <div className="w-10 h-10 bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg flex items-center justify-center">
                <Brain className="w-6 h-6 text-purple-600" />{" "}
              </div>{" "}
              <div>
                {" "}
                <h3 className="text-lg font-semibold text-gray-900">
                  {" "}
                  AI Diagnostic Assistant{" "}
                </h3>{" "}
                <p className="text-sm text-gray-600">
                  {" "}
                  Get AI-powered insights and recommendations based on patient
                  data{" "}
                </p>{" "}
              </div>{" "}
            </div>{" "}
            <button
              onClick={handleAutoFill}
              className="flex items-center space-x-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm"
            >
              <CheckCircle className="w-4 h-4" />{" "}
              <span>Auto-fill from Examination</span>{" "}
            </button>{" "}
          </div>
          {/* Patient Context */}{" "}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            {" "}
            <h4 className="font-medium text-gray-900 mb-2">
              Patient Context
            </h4>{" "}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              {" "}
              <div>
                <span className="text-gray-600">Name:</span>{" "}
                <p className="font-medium">{selectedPatient.fullName}</p>{" "}
              </div>{" "}
              <div>
                <span className="text-gray-600">Age:</span>{" "}
                <p className="font-medium">{selectedPatient.age}Y</p>{" "}
              </div>{" "}
              <div>
                <span className="text-gray-600">Gender:</span>{" "}
                <p className="font-medium">{selectedPatient.gender}</p>{" "}
              </div>{" "}
              <div>
                <span className="text-gray-600">Type:</span>{" "}
                <p className="font-medium">{selectedPatient.patientType}</p>{" "}
              </div>{" "}
            </div>{" "}
            {selectedPatient.chronicConditions &&
              selectedPatient.chronicConditions.length > 0 && (
                <div className="mt-3">
                  {" "}
                  <span className="text-gray-600 text-sm">
                    {" "}
                    Chronic Conditions:{" "}
                  </span>{" "}
                  <div className="flex flex-wrap gap-2 mt-1">
                    {" "}
                    {selectedPatient.chronicConditions.map(
                      (condition, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full"
                        >
                          {" "}
                          {condition}{" "}
                        </span>
                      )
                    )}{" "}
                  </div>{" "}
                </div>
              )}{" "}
          </div>
          {/* Input Section */}{" "}
          <div className="space-y-4">
            {" "}
            <div>
              {" "}
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {" "}
                Current Symptoms{" "}
              </label>{" "}
              <textarea
                rows={3}
                placeholder="Describe the patient's current symptoms in detail..."
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />{" "}
            </div>{" "}
            <div>
              {" "}
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {" "}
                Duration & Timeline{" "}
              </label>{" "}
              <input
                type="text"
                placeholder="e.g., 3 days, 1 week, chronic for 2 months..."
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />{" "}
            </div>{" "}
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="flex items-center justify-center space-x-2 w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {" "}
              {isLoading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />{" "}
                  <span>Analyzing...</span>{" "}
                </>
              ) : (
                <>
                  <Brain className="w-5 h-5" />{" "}
                  <span>Generate AI Diagnosis</span>{" "}
                </>
              )}{" "}
            </button>{" "}
          </div>{" "}
        </div>
        {/* Results Section - Your original diagnosis display */}{" "}
        {diagnosis && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            {" "}
            <div className="flex items-center space-x-3 mb-4">
              {" "}
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <Bot className="w-5 h-5 text-green-600" />{" "}
              </div>{" "}
              <div>
                {" "}
                <h4 className="text-lg font-semibold text-gray-900">
                  {" "}
                  Possible Diagnosis{" "}
                </h4>{" "}
                <p className="text-sm text-gray-600">
                  {" "}
                  AI-generated diagnosis based on symptoms and duration{" "}
                </p>{" "}
              </div>{" "}
            </div>{" "}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
              {" "}
              <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                {" "}
                {diagnosis}{" "}
              </div>{" "}
            </div>{" "}
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
              {" "}
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <AlertCircle className="w-4 h-4" />{" "}
                <span>
                  {" "}
                  AI suggestions are for reference only. Always use clinical
                  judgment.{" "}
                </span>{" "}
              </div>{" "}
              <div className="flex items-center space-x-3">
                {" "}
                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  {" "}
                  Copy Results{" "}
                </button>{" "}
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  {" "}
                  Add to Notes{" "}
                </button>{" "}
              </div>{" "}
            </div>{" "}
          </div>
        )}
      </div>
    );
  };
  // Mock history data - in real app, this would be fetched from the database
  const mockHistory = [
    { date: "2024-08-15", diagnosis: "Routine Checkup", doctor: "Dr. Smith" },
    {
      date: "2024-07-10",
      diagnosis: "Hypertension Follow-up",
      doctor: "Dr. Wilson",
    },
  ];

  const toggleArrayItem = (
    array: string[],
    item: string,
    setter: (fn: (prev: any) => any) => void
  ) => {
    setter((prev: any) => ({
      ...prev,
      [array === consultation.symptoms
        ? "symptoms"
        : array === consultation.aggravatingFactors
        ? "aggravatingFactors"
        : array === consultation.generalExamination
        ? "generalExamination"
        : array === consultation.systemicExamination
        ? "systemicExamination"
        : "investigations"]: array.includes(item)
        ? array.filter((i) => i !== item)
        : [...array, item],
    }));
  };

  const TabButton: React.FC<{
    id: string;
    label: string;
    icon: React.ComponentType<any>;
  }> = ({ id, label, icon: Icon }) => (
    <button
      onClick={() => setActiveTab(id as any)}
      className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-colors ${
        activeTab === id
          ? "bg-blue-600 text-white shadow-sm"
          : "text-gray-600 hover:bg-gray-100"
      }`}
    >
      <Icon className="w-4 h-4" /> <span className="font-medium">{label}</span>{" "}
    </button>
  );

  if (!selectedPatient) {
    return <PatientQueue />;
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {" "}
      <div className="max-w-7xl mx-auto">
        {" "}
        <div className="flex items-center justify-between mb-6">
          {" "}
          <div className="flex items-center space-x-3">
            {" "}
            <button
              onClick={onBack}
              className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" /> <span>Back to Queue</span>{" "}
            </button>
            <div className="h-6 w-px bg-gray-300"></div>
            <Stethoscope className="w-8 h-8 text-blue-600" />{" "}
            <div>
              {" "}
              <h1 className="text-3xl font-bold text-gray-900">
                {" "}
                Doctor Consultation{" "}
              </h1>{" "}
              <p className="text-gray-600">
                {" "}
                Complete medical examination and diagnosis{" "}
              </p>{" "}
            </div>{" "}
          </div>{" "}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            {" "}
            <div className="flex items-center space-x-3">
              {" "}
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                {" "}
                <span className="text-blue-600 font-medium text-sm">
                  {" "}
                  {selectedPatient.fullName
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("")}{" "}
                </span>{" "}
              </div>{" "}
              <div>
                {" "}
                <p className="font-semibold text-gray-900">
                  {" "}
                  {selectedPatient.fullName}{" "}
                </p>{" "}
                <p className="text-sm text-gray-600">
                  {" "}
                  {selectedPatient.uhid} • {selectedPatient.age}Y •{" "}
                  {selectedPatient.gender}{" "}
                </p>{" "}
              </div>{" "}
            </div>{" "}
          </div>{" "}
        </div>{" "}
        <div className="flex space-x-2 mb-6 overflow-x-auto">
          <TabButton id="history" label="Patient History" icon={FileText} />{" "}
          <TabButton
            id="assessment"
            label="Clinical Assessment"
            icon={Stethoscope}
          />
          <TabButton id="prescriptions" label="Prescriptions" icon={Pill} />
          <TabButton id="ai-assist" label="AI Assist" icon={Bot} />{" "}
        </div>{" "}
        {activeTab === "history" && (
          // ... existing history tab content
          <div className="space-y-6">
            {" "}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              {" "}
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {" "}
                Patient Information{" "}
              </h3>{" "}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {" "}
                <div>
                  <p className="text-sm text-gray-600">Contact Number</p>{" "}
                  <p className="font-medium text-gray-900">
                    {" "}
                    {selectedPatient.contactNumber}{" "}
                  </p>{" "}
                </div>{" "}
                <div>
                  <p className="text-sm text-gray-600">Address</p>{" "}
                  <p className="font-medium text-gray-900">
                    {" "}
                    {selectedPatient.address}{" "}
                  </p>{" "}
                </div>{" "}
                <div>
                  <p className="text-sm text-gray-600">Visit Type</p>{" "}
                  <p className="font-medium text-gray-900">
                    {" "}
                    {selectedPatient.visitType}{" "}
                  </p>{" "}
                </div>{" "}
                <div>
                  <p className="text-sm text-gray-600">Payment Method</p>{" "}
                  <p className="font-medium text-gray-900">
                    {" "}
                    {selectedPatient.paymentMethod}{" "}
                  </p>{" "}
                </div>{" "}
              </div>{" "}
              {selectedPatient.chronicConditions &&
                selectedPatient.chronicConditions.length > 0 && (
                  <div className="mb-6">
                    {" "}
                    <p className="text-sm text-gray-600 mb-2">
                      {" "}
                      Chronic Conditions{" "}
                    </p>{" "}
                    <div className="flex flex-wrap gap-2">
                      {" "}
                      {selectedPatient.chronicConditions.map(
                        (condition, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-red-100 text-red-700 text-sm rounded-full"
                          >
                            {" "}
                            {condition}{" "}
                          </span>
                        )
                      )}{" "}
                    </div>{" "}
                  </div>
                )}{" "}
            </div>{" "}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              {" "}
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {" "}
                Previous Consultations{" "}
              </h3>{" "}
              <div className="space-y-3">
                {" "}
                {mockHistory.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    {" "}
                    <div>
                      {" "}
                      <p className="font-medium text-gray-900">
                        {" "}
                        {item.diagnosis}{" "}
                      </p>
                      <p className="text-sm text-gray-600">{item.doctor}</p>{" "}
                    </div>{" "}
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-400" />{" "}
                      <span className="text-sm text-gray-600">{item.date}</span>{" "}
                    </div>{" "}
                  </div>
                ))}{" "}
              </div>{" "}
            </div>{" "}
          </div>
        )}
        {activeTab === "assessment" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Patient Vitals
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                  <div>
                    <p className="text-sm text-gray-500">BP</p>
                    <p className="font-bold text-lg text-gray-800">120/80</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">PR</p>
                    <p className="font-bold text-lg text-gray-800">72 bpm</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">SpO₂</p>
                    <p className="font-bold text-lg text-gray-800">98%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">BMI</p>
                    <p className="font-bold text-lg text-gray-800">22.5</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">BPR</p>
                    <p className="font-bold text-lg text-gray-800">18/min</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Medical & Personal History
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <button className="flex items-center space-x-2 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md">
                    <FileDown className="w-4 h-4" />
                    <span>Discharge Summary</span>
                  </button>
                  <button className="flex items-center space-x-2 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md">
                    <FileDown className="w-4 h-4" />
                    <span>X-Ray (PDF)</span>
                  </button>
                  <button className="flex items-center space-x-2 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md">
                    <FileDown className="w-4 h-4" />
                    <span>USG (PDF)</span>
                  </button>
                  <button className="flex items-center space-x-2 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md">
                    <FileDown className="w-4 h-4" />
                    <span>Investigation ROP</span>
                  </button>
                </div>
                <div className="mt-2 text-center text-xs text-blue-600 font-semibold">
                  AI Assisted Summary
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Chief Complaints
              </h3>
              <div className="grid grid-cols-4 gap-2 mb-4">
                {["Fever", "Cold", "Cough", "Diarrhea", "Vomiting"].map(
                  (symptom) => (
                    <label
                      key={symptom}
                      className="flex items-center space-x-2 text-sm"
                    >
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span>{symptom}</span>
                    </label>
                  )
                )}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="p-2 text-left font-medium">Symptom</th>
                      <th className="p-2 text-left font-medium">Duration</th>
                      <th className="p-2 text-left font-medium">
                        Aggravating/Relieving Factors
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-2">
                        <input
                          type="text"
                          className="w-full border-gray-300 rounded-md p-1"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          className="w-full border-gray-300 rounded-md p-1"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          className="w-full border-gray-300 rounded-md p-1"
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  General Examination
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  {["Pallor", "Icterus", "Cyanosis", "Clubbing", "LAP"].map(
                    (item) => (
                      <label
                        key={item}
                        className="flex items-center space-x-2 text-sm"
                      >
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span>{item}</span>
                      </label>
                    )
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="text-sm font-medium">Consciousness</label>
                    <input
                      type="text"
                      className="w-full mt-1 border-gray-300 rounded-md p-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Built</label>
                    <select className="w-full mt-1 border-gray-300 rounded-md p-1">
                      <option>Mild</option>
                      <option>Moderate</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Templates for Easy Fill
                </h3>
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {["Knee Pain", "Back Pain", "Muscle Spasm"].map((item) => (
                    <label
                      key={item}
                      className="flex items-center space-x-2 text-sm"
                    >
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span>{item}</span>
                    </label>
                  ))}
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search symptoms/findings"
                    className="w-full pl-10 p-2 border-gray-300 rounded-md"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Systemic Examination
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium">CNS</h4>
                    <textarea
                      className="w-full mt-1 border-gray-300 rounded-md p-1"
                      rows={3}
                    ></textarea>
                  </div>
                  <div>
                    <h4 className="font-medium">RS</h4>
                    <textarea
                      className="w-full mt-1 border-gray-300 rounded-md p-1"
                      rows={3}
                    ></textarea>
                  </div>
                  <div>
                    <h4 className="font-medium">CVS</h4>
                    <textarea
                      className="w-full mt-1 border-gray-300 rounded-md p-1"
                      rows={3}
                    ></textarea>
                  </div>
                  <div>
                    <h4 className="font-medium">P/A</h4>
                    <textarea
                      className="w-full mt-1 border-gray-300 rounded-md p-1"
                      rows={3}
                    ></textarea>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Local Examination
                </h3>
                <div className="text-center text-gray-500 italic p-4 border-2 border-dashed rounded-md">
                  Use based on case type - Ortho module specific.
                </div>
              </div>
            </div>
          </div>
        )}
        {activeTab === "prescriptions" && selectedPatient && (
          <PrescriptionModule
            selectedPatient={selectedPatient}
            consultation={consultation}
          />
        )}{" "}
        {activeTab === "ai-assist" && selectedPatient && (
          <AIAssistTab
            consultation={consultation}
            selectedPatient={selectedPatient}
          />
        )}{" "}
        <div className="flex items-center justify-between mt-8 p-6 bg-white rounded-lg border border-gray-200">
          {" "}
          <div className="flex items-center space-x-4">
            {" "}
            <button className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
              {" "}
              Save Draft{" "}
            </button>{" "}
            <button className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <span>Complete Consultation</span>
              <ChevronRight className="w-4 h-4" />{" "}
            </button>{" "}
          </div>{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
};
