import React, { useReducer, useEffect, useCallback, useMemo } from "react";
import {
  Activity,
  Heart,
  Thermometer,
  Upload,
  Bot,
  Save,
  ArrowLeft,
  AlertCircle,
} from "lucide-react";
import { db } from "../../firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";

// --- TYPE DEFINITIONS ---
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

interface VitalsState {
  weight: string;
  height: string;
  bmi: string;
  pulse: string;
  bloodPressure: string;
  temperature: string;
  spo2: string;
  respiratoryRate: string;
  riskFlags: {
    diabetes: boolean;
    heartDisease: boolean;
    kidney: boolean;
  };
}

// --- CONSTANTS ---
const INITIAL_VITALS_STATE: VitalsState = {
  weight: "",
  height: "",
  bmi: "",
  pulse: "",
  bloodPressure: "",
  temperature: "",
  spo2: "",
  respiratoryRate: "",
  riskFlags: {
    diabetes: false,
    heartDisease: false,
    kidney: false,
  },
};

const ACTIONS = {
  UPDATE_VITAL: "UPDATE_VITAL",
  TOGGLE_RISK_FLAG: "TOGGLE_RISK_FLAG",
  RESET_VITALS: "RESET_VITALS",
};

// --- REDUCER FUNCTION ---
// Centralizes all state update logic. A reducer must be a pure function.
function vitalsReducer(
  state: VitalsState,
  action: { type: string; payload: any }
): VitalsState {
  switch (action.type) {
    case ACTIONS.UPDATE_VITAL: {
      const { field, value } = action.payload;
      return { ...state, [field]: value };
    }
    case ACTIONS.TOGGLE_RISK_FLAG: {
      const { flag } = action.payload;
      return {
        ...state,
        riskFlags: {
          ...state.riskFlags,
          // Correctly toggles the specific flag without mutating the original state
          [flag]: !state.riskFlags[flag as keyof VitalsState["riskFlags"]],
        },
      };
    }
    case ACTIONS.RESET_VITALS:
      return INITIAL_VITALS_STATE;
    default:
      return state;
  }
}

// --- MAIN COMPONENT ---
interface VitalsAssessmentProps {
  selectedPatient?: Patient | null;
  onBack?: () => void;
}

export const VitalsAssessment: React.FC<VitalsAssessmentProps> = ({
  selectedPatient,
  onBack,
}) => {
  const [vitals, dispatch] = useReducer(vitalsReducer, INITIAL_VITALS_STATE);
  const [status, setStatus] = useReducer((s: any, a: any) => ({ ...s, ...a }), {
    isSaving: false,
    showSuccess: false,
    errorMessage: "",
    validationErrors: {},
  });

  // --- DERIVED STATE & MEMOIZED FUNCTIONS ---

  // Calculate BMI only when weight or height changes
  useEffect(() => {
    const heightM = parseFloat(vitals.height) / 100;
    const weightKg = parseFloat(vitals.weight);
    let newBmi = "";
    if (heightM > 0 && weightKg > 0) {
      newBmi = (weightKg / (heightM * heightM)).toFixed(1);
    }
    // Only dispatch update if the BMI value has actually changed
    if (newBmi !== vitals.bmi) {
      dispatch({
        type: ACTIONS.UPDATE_VITAL,
        payload: { field: "bmi", value: newBmi },
      });
    }
  }, [vitals.height, vitals.weight, vitals.bmi]);

  const getBMICategory = useCallback((bmi: number) => {
    if (bmi < 18.5) return { category: "Underweight", color: "text-blue-600" };
    if (bmi < 25) return { category: "Normal", color: "text-green-600" };
    if (bmi < 30) return { category: "Overweight", color: "text-yellow-600" };
    return { category: "Obese", color: "text-red-600" };
  }, []);

  const bmiCategory = useMemo(() => {
    const bmiValue = parseFloat(vitals.bmi);
    if (!isNaN(bmiValue) && bmiValue > 0) {
      return getBMICategory(bmiValue);
    }
    return null;
  }, [vitals.bmi, getBMICategory]);

  // --- EVENT HANDLERS ---

  const handleVitalChange = useCallback(
    (field: keyof VitalsState, value: string) => {
      let sanitizedValue = value;
      if (field !== "bloodPressure") {
        // Allow only numbers and a single decimal point
        sanitizedValue = value.replace(/[^0-9.]/g, "");
        const parts = sanitizedValue.split(".");
        if (parts.length > 2) {
          sanitizedValue = `${parts[0]}.${parts.slice(1).join("")}`;
        }
      } else {
        // Allow numbers and the '/' character for blood pressure
        sanitizedValue = value.replace(/[^0-9/]/g, "");
      }
      dispatch({
        type: ACTIONS.UPDATE_VITAL,
        payload: { field, value: sanitizedValue },
      });
    },
    []
  );

  const validateVitals = useCallback(() => {
    const errors: Record<string, string> = {};
    if (!vitals.weight || parseFloat(vitals.weight) <= 0)
      errors.weight = "Required";
    if (!vitals.height || parseFloat(vitals.height) <= 0)
      errors.height = "Required";
    if (!vitals.pulse || parseFloat(vitals.pulse) <= 20)
      errors.pulse = "Required";
    if (
      !vitals.bloodPressure ||
      !/^\d{2,3}\/\d{2,3}$/.test(vitals.bloodPressure)
    )
      errors.bloodPressure = "Use SYS/DIA format";

    setStatus({ validationErrors: errors });
    return Object.keys(errors).length === 0;
  }, [vitals]);

  const handleSaveVitals = async () => {
    console.log("Starting to save vitals...");

    if (!selectedPatient) {
      setStatus({ errorMessage: "No patient selected!" });
      return;
    }

    if (!validateVitals()) {
      setStatus({ errorMessage: "Please fix the errors before saving." });
      return;
    }

    setStatus({ errorMessage: "", isSaving: true, showSuccess: false });

    try {
      if (!db) {
        throw new Error("Firebase database is not initialized");
      }

      const vitalsData = {
        patientId: selectedPatient.id,
        patientUhid: selectedPatient.uhid || "",
        patientName: selectedPatient.fullName || "",
        weight: vitals.weight || "",
        height: vitals.height || "",
        bmi: vitals.bmi || "",
        pulse: vitals.pulse || "",
        bloodPressure: vitals.bloodPressure || "",
        temperature: vitals.temperature || "",
        spo2: vitals.spo2 || "",
        respiratoryRate: vitals.respiratoryRate || "",
        riskFlags: {
          diabetes: vitals.riskFlags.diabetes,
          heartDisease: vitals.riskFlags.heartDisease,
          kidney: vitals.riskFlags.kidney,
        },
        recordedAt: Timestamp.now(),
        recordedBy: "Medical Staff", // This could be dynamic in a real app
        status: "completed",
      };

      console.log("Vitals data to save:", vitalsData);

      const docRef = await addDoc(collection(db, "vitals"), vitalsData);
      console.log("Document written with ID: ", docRef.id);

      setStatus({ showSuccess: true });
      setTimeout(() => setStatus({ showSuccess: false }), 4000);

      // Optional: Clear the form after successful save
      // dispatch({ type: ACTIONS.RESET_VITALS, payload: null });
    } catch (error: any) {
      console.error("Detailed error saving vitals:", error);
      let friendlyMessage = "Failed to save vitals. ";

      if (error.code === "permission-denied") {
        friendlyMessage += "Permission denied. Check Firebase security rules.";
      } else if (error.code === "unavailable") {
        friendlyMessage += "Service temporarily unavailable. Please try again.";
      } else {
        friendlyMessage += `An unexpected error occurred.`;
      }

      setStatus({ errorMessage: friendlyMessage });
    } finally {
      setStatus({ isSaving: false });
    }
  };

  // --- RENDER ---
  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            {onBack && (
              <button
                onClick={onBack}
                className="p-2 hover:bg-white rounded-lg border border-gray-200 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
            )}
            <Activity className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Vitals & Assessment
              </h1>
              <p className="text-gray-600">
                Record patient vital signs and health metrics
              </p>
            </div>
          </div>

          {/* Dynamic Patient Info */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 text-right">
            <p className="text-sm text-gray-500">Current Patient</p>
            <p className="font-semibold text-gray-900">
              {selectedPatient?.fullName || "No Patient Selected"}
            </p>
            <p className="text-sm text-gray-600">
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
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-green-800">Vitals saved successfully!</span>
          </div>
        )}
        {status.errorMessage && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <span className="text-red-800">{status.errorMessage}</span>
          </div>
        )}

        {/* Vitals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <VitalCard
            title="Weight"
            value={vitals.weight}
            unit="kg"
            icon={Activity}
            field="weight"
            onChange={handleVitalChange}
            error={status.validationErrors.weight}
          />
          <VitalCard
            title="Height"
            value={vitals.height}
            unit="cm"
            icon={Activity}
            field="height"
            onChange={handleVitalChange}
            error={status.validationErrors.height}
          />
          <BMIResultCard bmi={vitals.bmi} category={bmiCategory} />
          <VitalCard
            title="Pulse"
            value={vitals.pulse}
            unit="bpm"
            icon={Heart}
            field="pulse"
            normal="60-100"
            onChange={handleVitalChange}
            error={status.validationErrors.pulse}
          />
          <VitalCard
            title="Blood Pressure"
            value={vitals.bloodPressure}
            unit="mmHg"
            icon={Heart}
            field="bloodPressure"
            normal="120/80"
            onChange={handleVitalChange}
            error={status.validationErrors.bloodPressure}
          />
          <VitalCard
            title="Temperature"
            value={vitals.temperature}
            unit="°F"
            icon={Thermometer}
            field="temperature"
            normal="97.8-99.1"
            onChange={handleVitalChange}
          />
          <VitalCard
            title="SPO₂"
            value={vitals.spo2}
            unit="%"
            icon={Activity}
            field="spo2"
            normal="95-100"
            onChange={handleVitalChange}
          />
          <VitalCard
            title="Respiratory Rate"
            value={vitals.respiratoryRate}
            unit="breaths/min"
            icon={Activity}
            field="respiratoryRate"
            normal="12-20"
            onChange={handleVitalChange}
          />
        </div>

        {/* Risk Assessment & Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Risk Assessment Flags
            </h3>
            <div className="space-y-4">
              {Object.entries({
                diabetes: "Diabetes",
                heartDisease: "Heart Disease",
                kidney: "Kidney Disease",
              }).map(([key, label]) => (
                <label
                  key={key}
                  className="flex items-center space-x-3 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={
                      vitals.riskFlags[key as keyof typeof vitals.riskFlags]
                    }
                    onChange={() =>
                      dispatch({
                        type: ACTIONS.TOGGLE_RISK_FLAG,
                        payload: { flag: key },
                      })
                    }
                    className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-gray-700">{label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6 flex flex-col space-y-4">
            <button
              onClick={handleSaveVitals}
              disabled={status.isSaving || !selectedPatient}
              className="flex items-center justify-center space-x-2 w-full px-4 py-3 rounded-lg font-semibold transition-colors disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed bg-blue-600 text-white hover:bg-blue-700"
            >
              <Save className="w-5 h-5" />
              <span>{status.isSaving ? "Saving..." : "Save Vitals"}</span>
            </button>
            <div className="flex space-x-4">
              <button className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300 transition-colors">
                <Upload className="w-4 h-4" />
                <span>Upload Report</span>
              </button>
              <button className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300 transition-colors">
                <Bot className="w-4 h-4" />
                <span>AI Assist</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- SUB-COMPONENTS ---

const VitalCard: React.FC<{
  title: string;
  value: string;
  unit: string;
  icon: React.ComponentType<any>;
  field: keyof Omit<VitalsState, "riskFlags" | "bmi">;
  normal?: string;
  onChange: (
    field: keyof Omit<VitalsState, "riskFlags" | "bmi">,
    value: string
  ) => void;
  error?: string;
}> = ({ title, value, unit, icon: Icon, field, normal, onChange, error }) => (
  <div
    className={`bg-white rounded-lg border p-4 transition-all ${
      error ? "border-red-400 shadow-sm shadow-red-100" : "border-gray-200"
    }`}
  >
    <div className="flex items-center space-x-2 mb-3">
      <Icon className="w-5 h-5 text-blue-600" />
      <h3 className="font-medium text-gray-800">{title}</h3>
    </div>
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(field, e.target.value)}
        className="w-full text-3xl font-bold text-gray-900 bg-transparent border-0 p-0 focus:ring-0 focus:outline-none"
        placeholder="—"
        autoComplete="off"
      />
      <span className="absolute right-0 top-1/2 -translate-y-1/2 text-sm text-gray-500">
        {unit}
      </span>
    </div>
    <div className="flex items-center justify-between mt-2 h-4">
      {normal && (
        <span className="text-xs text-gray-400">Normal: {normal}</span>
      )}
      {error && (
        <span className="text-xs text-red-600 flex items-center gap-1 font-medium">
          <AlertCircle size={12} />
          {error}
        </span>
      )}
    </div>
  </div>
);

const BMIResultCard: React.FC<{
  bmi: string;
  category: { category: string; color: string } | null;
}> = ({ bmi, category }) => (
  <div className="bg-white rounded-lg border border-gray-200 p-4">
    <div className="flex items-center space-x-2 mb-3">
      <Activity className="w-5 h-5 text-blue-600" />
      <h3 className="font-medium text-gray-800">BMI</h3>
    </div>
    <div className="relative">
      <div className="text-3xl font-bold text-gray-900">{bmi || "—"}</div>
      <span className="absolute right-0 top-1/2 -translate-y-1/2 text-sm text-gray-500">
        kg/m²
      </span>
    </div>
    <div className="flex items-center justify-end mt-2 h-4">
      {category && (
        <span
          className={`text-xs font-semibold px-2 py-0.5 rounded-full ${category.color
            .replace("text-", "bg-")
            .replace("-600", "-100")} ${category.color}`}
        >
          {category.category}
        </span>
      )}
    </div>
  </div>
);

export default VitalsAssessment;
