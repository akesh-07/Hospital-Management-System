import React, { useState } from 'react';
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
  ArrowLeft
} from 'lucide-react';

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

interface DoctorModuleProps {
  selectedPatient: Patient | null;
  onBack: () => void;
}

export const DoctorModule: React.FC<DoctorModuleProps> = ({ selectedPatient, onBack }) => {
  const [activeTab, setActiveTab] = useState<'history' | 'vitals' | 'examination' | 'investigations' | 'prescriptions'>('history');
  const [consultation, setConsultation] = useState({
    symptoms: [] as string[],
    duration: '',
    aggravatingFactors: [] as string[],
    generalExamination: [] as string[],
    systemicExamination: [] as string[],
    investigations: [] as string[],
    diagnosis: '',
    notes: ''
  });

  // Mock vitals data - in real app, this would be fetched from the database
  const mockVitals = {
    bp: '120/80',
    pulse: 72,
    temp: 98.6,
    spo2: 98,
    weight: 70,
    height: 165
  };

  // Mock history data - in real app, this would be fetched from the database
  const mockHistory = [
    { date: '2024-08-15', diagnosis: 'Routine Checkup', doctor: 'Dr. Smith' },
    { date: '2024-07-10', diagnosis: 'Hypertension Follow-up', doctor: 'Dr. Wilson' }
  ];

  const commonSymptoms = [
    'Fever', 'Cough', 'Headache', 'Back Pain', 'Muscle Spasm', 
    'Diarrhea', 'Fatigue', 'Nausea', 'Chest Pain', 'Shortness of Breath'
  ];

  const quickTemplates = [
    { name: 'Fever Package', symptoms: ['Fever', 'Fatigue', 'Headache'] },
    { name: 'Cold & Cough', symptoms: ['Cough', 'Runny Nose', 'Sore Throat'] },
    { name: 'Back Pain', symptoms: ['Back Pain', 'Muscle Spasm'] },
    { name: 'Diarrhea', symptoms: ['Diarrhea', 'Nausea', 'Abdominal Pain'] }
  ];

  const generalExaminations = [
    'Conscious & Oriented', 'Afebrile', 'Well Nourished', 'No Pallor',
    'No Icterus', 'No Cyanosis', 'No Clubbing', 'No Lymphadenopathy'
  ];

  const systemicExaminations = [
    'CVS: S1S2 heard, No murmur', 'RS: Clear bilateral air entry',
    'CNS: Normal', 'P/A: Soft, non-tender', 'Extremities: Normal'
  ];

  const toggleArrayItem = (array: string[], item: string, setter: (fn: (prev: any) => any) => void) => {
    setter((prev: any) => ({
      ...prev,
      [array === consultation.symptoms ? 'symptoms' :
       array === consultation.aggravatingFactors ? 'aggravatingFactors' :
       array === consultation.generalExamination ? 'generalExamination' :
       array === consultation.systemicExamination ? 'systemicExamination' : 'investigations'
      ]: array.includes(item) ? array.filter(i => i !== item) : [...array, item]
    }));
  };

  const TabButton: React.FC<{ id: string; label: string; icon: React.ComponentType<any> }> = 
    ({ id, label, icon: Icon }) => (
    <button
      onClick={() => setActiveTab(id as any)}
      className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-colors ${
        activeTab === id 
          ? 'bg-blue-600 text-white shadow-sm' 
          : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      <Icon className="w-4 h-4" />
      <span className="font-medium">{label}</span>
    </button>
  );

  const CheckboxList: React.FC<{
    title: string;
    items: string[];
    selected: string[];
    onToggle: (item: string) => void;
  }> = ({ title, items, selected, onToggle }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="grid grid-cols-2 gap-3">
        {items.map((item) => (
          <label key={item} className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={selected.includes(item)}
              onChange={() => onToggle(item)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">{item}</span>
          </label>
        ))}
      </div>
    </div>
  );

  // If no patient is selected, show error state
  if (!selectedPatient) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Stethoscope className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Patient Selected</h2>
          <p className="text-gray-600 mb-4">Please select a patient from the queue to begin consultation.</p>
          <button
            onClick={onBack}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Queue</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Queue</span>
            </button>
            <div className="h-6 w-px bg-gray-300"></div>
            <Stethoscope className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Doctor Consultation</h1>
              <p className="text-gray-600">Complete medical examination and diagnosis</p>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-medium text-sm">
                  {selectedPatient.fullName?.split(" ").map(n => n[0]).join("")}
                </span>
              </div>
              <div>
                <p className="font-semibold text-gray-900">{selectedPatient.fullName}</p>
                <p className="text-sm text-gray-600">
                  {selectedPatient.uhid} • {selectedPatient.age}Y • {selectedPatient.gender}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex space-x-2 mb-6 overflow-x-auto">
          <TabButton id="history" label="Patient History" icon={FileText} />
          <TabButton id="vitals" label="Vitals" icon={Activity} />
          <TabButton id="examination" label="Examination" icon={Stethoscope} />
          <TabButton id="investigations" label="Investigations" icon={TestTube} />
          <TabButton id="prescriptions" label="Prescriptions" icon={Pill} />
        </div>

        {activeTab === 'history' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Patient Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <p className="text-sm text-gray-600">Contact Number</p>
                  <p className="font-medium text-gray-900">{selectedPatient.contactNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Address</p>
                  <p className="font-medium text-gray-900">{selectedPatient.address}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Visit Type</p>
                  <p className="font-medium text-gray-900">{selectedPatient.visitType}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Payment Method</p>
                  <p className="font-medium text-gray-900">{selectedPatient.paymentMethod}</p>
                </div>
              </div>
              
              {selectedPatient.chronicConditions && selectedPatient.chronicConditions.length > 0 && (
                <div className="mb-6">
                  <p className="text-sm text-gray-600 mb-2">Chronic Conditions</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedPatient.chronicConditions.map((condition, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-red-100 text-red-700 text-sm rounded-full"
                      >
                        {condition}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Previous Consultations</h3>
              <div className="space-y-3">
                {mockHistory.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{item.diagnosis}</p>
                      <p className="text-sm text-gray-600">{item.doctor}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{item.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'vitals' && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Current Vitals</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {Object.entries({
                'Blood Pressure': mockVitals.bp,
                'Pulse': `${mockVitals.pulse} bpm`,
                'Temperature': `${mockVitals.temp}°F`,
                'SPO₂': `${mockVitals.spo2}%`,
                'Weight': `${mockVitals.weight} kg`,
                'Height': `${mockVitals.height} cm`
              }).map(([key, value]) => (
                <div key={key} className="text-center">
                  <p className="text-sm text-gray-600 mb-1">{key}</p>
                  <p className="text-xl font-bold text-gray-900">{value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'examination' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Chief Complaints & Symptoms</h3>
                <div className="flex space-x-2">
                  {quickTemplates.map((template) => (
                    <button
                      key={template.name}
                      onClick={() => setConsultation(prev => ({ 
                        ...prev, 
                        symptoms: [...new Set([...prev.symptoms, ...template.symptoms])] 
                      }))}
                      className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
                    >
                      {template.name}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-3 md:grid-cols-5 gap-3 mb-4">
                {commonSymptoms.map((symptom) => (
                  <label key={symptom} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={consultation.symptoms.includes(symptom)}
                      onChange={() => toggleArrayItem(consultation.symptoms, symptom, setConsultation)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{symptom}</span>
                  </label>
                ))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <input
                  type="text"
                  placeholder="Duration of symptoms"
                  value={consultation.duration}
                  onChange={(e) => setConsultation(prev => ({ ...prev, duration: e.target.value }))}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="text"
                  placeholder="Add custom symptom"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && e.currentTarget.value) {
                      setConsultation(prev => ({ 
                        ...prev, 
                        symptoms: [...prev.symptoms, e.currentTarget.value] 
                      }));
                      e.currentTarget.value = '';
                    }
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <CheckboxList
              title="General Examination"
              items={generalExaminations}
              selected={consultation.generalExamination}
              onToggle={(item) => toggleArrayItem(consultation.generalExamination, item, setConsultation)}
            />

            <CheckboxList
              title="Systemic Examination"
              items={systemicExaminations}
              selected={consultation.systemicExamination}
              onToggle={(item) => toggleArrayItem(consultation.systemicExamination, item, setConsultation)}
            />
          </div>
        )}

        {activeTab === 'investigations' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Reports</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {['X-Ray', 'Ultrasound', 'Discharge Summary'].map((type) => (
                  <div key={type} className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors cursor-pointer">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-1">Upload {type}</p>
                    <p className="text-xs text-gray-500">PDF, Images</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Diagnosis & Notes</h3>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Primary Diagnosis"
                  value={consultation.diagnosis}
                  onChange={(e) => setConsultation(prev => ({ ...prev, diagnosis: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <textarea
                  rows={4}
                  placeholder="Additional notes and observations..."
                  value={consultation.notes}
                  onChange={(e) => setConsultation(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'prescriptions' && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Create Prescription</h3>
              <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <ChevronRight className="w-4 h-4" />
                <span>Continue to Prescription</span>
              </button>
            </div>
            <div className="text-center py-8">
              <Pill className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">Complete examination to proceed with prescription</p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mt-8 p-6 bg-white rounded-lg border border-gray-200">
          <button className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-colors">
            <Bot className="w-4 h-4" />
            <span>AI Diagnostic Assist</span>
          </button>
          
          <div className="flex items-center space-x-4">
            <button className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
              Save Draft
            </button>
            <button className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <span>Complete Consultation</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};