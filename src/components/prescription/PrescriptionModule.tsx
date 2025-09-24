import { useState } from "react";
import { Medication } from "../../types";
import { Patient } from "../../types";
import { FileText } from "lucide-react";
import { Plus } from "lucide-react";
import { Trash2 } from "lucide-react";
import { Bot } from "lucide-react";
import { usePrescription } from "../../contexts/PrescriptionContext";

const PrescriptionModule: React.FC<{
  selectedPatient: Patient;
  consultation: any;
}> = ({ selectedPatient, consultation }) => {
  const { medications, setMedications } = usePrescription();

  const [advice, setAdvice] = useState({
    general: "",
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

  const toggleAdvice = (category: "diet", item: string) => {
    setAdvice((prev) => ({
      ...prev,
      [category]: prev[category].includes(item)
        ? prev[category].filter((i) => i !== item)
        : [...prev[category], item],
    }));
  };

  return (
    <div className="space-y-3">
      {/* Medications Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-3">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-[#0B2D4D]">Medications</h3>
          <button
            onClick={addMedication}
            className="flex items-center space-x-1 px-2 py-1 bg-[#012e58] text-white rounded-md hover:bg-[#1a4b7a] transition-colors text-xs"
          >
            <Plus className="w-3 h-3" />
            <span>Add</span>
          </button>
        </div>

        <div className="space-y-2">
          {medications.map((medication, index) => (
            <div
              key={medication.id}
              className="border border-gray-200 rounded-md p-2 bg-[#F8F9FA]"
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-xs text-[#0B2D4D]">
                  Med {index + 1}
                </h4>
                {medications.length > 1 && (
                  <button
                    onClick={() => removeMedication(medication.id)}
                    className="p-1 text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-5 gap-2">
                <div>
                  <label className="block text-xs font-medium text-[#1a4b7a] mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    list={`medications-${medication.id}`}
                    value={medication.name}
                    onChange={(e) =>
                      updateMedication(medication.id, "name", e.target.value)
                    }
                    className="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#1a4b7a] focus:border-transparent text-xs"
                    placeholder="Medication"
                  />
                  <datalist id={`medications-${medication.id}`}>
                    {commonMedications.map((med) => (
                      <option key={med} value={med} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#1a4b7a] mb-1">
                    Dosage
                  </label>
                  <input
                    type="text"
                    list={`dosage-${medication.id}`}
                    value={medication.dosage}
                    onChange={(e) =>
                      updateMedication(medication.id, "dosage", e.target.value)
                    }
                    className="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#1a4b7a] focus:border-transparent text-xs"
                    placeholder="500mg"
                  />
                  <datalist id={`dosage-${medication.id}`}>
                    {dosageOptions.map((dose) => (
                      <option key={dose} value={dose} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#1a4b7a] mb-1">
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
                    className="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#1a4b7a] focus:border-transparent text-xs"
                  >
                    <option value="">Select</option>
                    {frequencyOptions.map((freq) => (
                      <option key={freq} value={freq}>
                        {freq}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#1a4b7a] mb-1">
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
                    className="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#1a4b7a] focus:border-transparent text-xs"
                  >
                    <option value="">Select</option>
                    {durationOptions.map((dur) => (
                      <option key={dur} value={dur}>
                        {dur}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#1a4b7a] mb-1">
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
                    className="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#1a4b7a] focus:border-transparent text-xs"
                    placeholder="After meals"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Advice and Diet Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* General Advice Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-[#0B2D4D]">
              General Advice
            </h3>
            <button className="flex items-center space-x-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 transition-colors text-xs">
              <Bot className="w-3 h-3" />
              <span>AI Suggest</span>
            </button>
          </div>
          <textarea
            value={advice.general}
            onChange={(e) =>
              setAdvice((prev) => ({
                ...prev,
                general: e.target.value,
              }))
            }
            className="w-full px-2 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#1a4b7a] focus:border-transparent text-xs resize-none"
            rows={4}
            placeholder="Enter general advice for the patient..."
          />
        </div>

        {/* Diet Plan Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <h3 className="text-sm font-semibold text-[#0B2D4D] mb-2">
            Diet Plan
          </h3>
          <div className="space-y-1.5">
            {dietPlans.map((plan) => (
              <label
                key={plan}
                className="flex items-start space-x-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={advice.diet.includes(plan)}
                  onChange={() => toggleAdvice("diet", plan)}
                  className="mt-0.5 w-3 h-3 text-[#012e58] border-gray-300 rounded focus:ring-[#1a4b7a]"
                />
                <span className="text-xs text-[#1a4b7a] leading-tight">
                  {plan}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Follow-up Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-3">
        <h3 className="text-sm font-semibold text-[#0B2D4D] mb-2">
          Follow-up Schedule
        </h3>
        <div className="flex items-center space-x-3">
          <label className="flex items-center space-x-1.5 cursor-pointer">
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
              className="w-3 h-3 text-[#012e58] border-gray-300 rounded focus:ring-[#1a4b7a]"
            />
            <span className="text-xs text-[#1a4b7a]">Schedule follow-up</span>
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
                className="w-16 px-2 py-1 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#1a4b7a] focus:border-transparent text-xs"
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
                className="px-2 py-1 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#1a4b7a] focus:border-transparent text-xs"
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
  );
};
export default PrescriptionModule;
