import { useState } from "react";
import { Medication } from "../../types";
import { Patient } from "../../types";
import { FileText } from "lucide-react";
import { Plus } from "lucide-react";
import { Trash2 } from "lucide-react";
import { Bot } from "lucide-react";

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
export default PrescriptionModule;
