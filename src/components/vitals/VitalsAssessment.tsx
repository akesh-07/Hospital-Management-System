import React, { useState, useEffect } from 'react';
import { Activity, Heart, Thermometer, Upload, Bot, Save, ArrowLeft } from 'lucide-react';
import { db } from '../../firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

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

interface VitalsAssessmentProps {
  selectedPatient?: Patient | null;
  onBack?: () => void;
}

export const VitalsAssessment: React.FC<VitalsAssessmentProps> = ({ 
  selectedPatient, 
  onBack 
}) => {
  const [vitals, setVitals] = useState({
    weight: '',
    height: '',
    bmi: '',
    pulse: '',
    bloodPressure: '',
    temperature: '',
    spo2: '',
    respiratoryRate: '',
    riskFlags: {
      diabetes: false,
      heartDisease: false,
      kidney: false,
    }
  });

  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const calculateBMI = () => {
    const heightM = parseFloat(vitals.height) / 100;
    const weightKg = parseFloat(vitals.weight);
    
    if (vitals.height && vitals.weight && heightM > 0 && weightKg > 0) {
      const bmi = (weightKg / (heightM * heightM)).toFixed(1);
      setVitals(prev => ({ ...prev, bmi }));
    } else {
      setVitals(prev => ({ ...prev, bmi: '' }));
    }
  };

  useEffect(() => {
    calculateBMI();
  }, [vitals.height, vitals.weight]);

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { category: 'Underweight', color: 'text-blue-600' };
    if (bmi < 25) return { category: 'Normal', color: 'text-green-600' };
    if (bmi < 30) return { category: 'Overweight', color: 'text-yellow-600' };
    return { category: 'Obese', color: 'text-red-600' };
  };

  const handleVitalChange = (field: string, value: string) => {
    if (field === 'bloodPressure') {
      const cleanValue = value.replace(/[^0-9/\s]/g, '');
      setVitals(prev => ({ ...prev, [field]: cleanValue }));
    } else {
      const numericValue = value.replace(/[^0-9.]/g, '');
      const parts = numericValue.split('.');
      let cleanValue = parts[0];
      if (parts.length > 1) {
        cleanValue += '.' + parts[1];
      }
      setVitals(prev => ({ ...prev, [field]: cleanValue }));
    }
  };

  // Save vitals to Firebase with improved error handling
  const handleSaveVitals = async () => {
    console.log('Starting to save vitals...');
    console.log('Selected Patient:', selectedPatient);
    console.log('Firebase db:', db);
    
    if (!selectedPatient) {
      setErrorMessage('No patient selected!');
      return;
    }

    // Clear previous error message
    setErrorMessage('');
    setIsSaving(true);
    
    try {
      // Check if Firebase is properly initialized
      if (!db) {
        throw new Error('Firebase database is not initialized');
      }

      const vitalsData = {
        patientId: selectedPatient.id,
        patientUhid: selectedPatient.uhid || '',
        patientName: selectedPatient.fullName || '',
        patientAge: selectedPatient.age || 0,
        patientGender: selectedPatient.gender || '',
        weight: vitals.weight || '',
        height: vitals.height || '',
        bmi: vitals.bmi || '',
        pulse: vitals.pulse || '',
        bloodPressure: vitals.bloodPressure || '',
        temperature: vitals.temperature || '',
        spo2: vitals.spo2 || '',
        respiratoryRate: vitals.respiratoryRate || '',
        riskFlags: {
          diabetes: vitals.riskFlags.diabetes,
          heartDisease: vitals.riskFlags.heartDisease,
          kidney: vitals.riskFlags.kidney,
        },
        recordedAt: Timestamp.now(),
        recordedBy: 'Medical Staff',
        status: 'completed'
      };

      console.log('Vitals data to save:', vitalsData);

      // Try to add document to Firestore
      const docRef = await addDoc(collection(db, 'vitals'), vitalsData);
      console.log('Document written with ID: ', docRef.id);
      
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 4000);
      
      // Optional: Clear the form after successful save
      // setVitals({
      //   weight: '',
      //   height: '',
      //   bmi: '',
      //   pulse: '',
      //   bloodPressure: '',
      //   temperature: '',
      //   spo2: '',
      //   respiratoryRate: '',
      //   riskFlags: {
      //     diabetes: false,
      //     heartDisease: false,
      //     kidney: false,
      //   }
      // });
      
    } catch (error: any) {
      console.error('Detailed error saving vitals:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      
      let friendlyMessage = 'Failed to save vitals. ';
      
      if (error.code === 'permission-denied') {
        friendlyMessage += 'Permission denied. Check Firebase security rules.';
      } else if (error.code === 'unavailable') {
        friendlyMessage += 'Service temporarily unavailable. Please try again.';
      } else if (error.message.includes('Firebase')) {
        friendlyMessage += 'Firebase connection issue. Check your configuration.';
      } else {
        friendlyMessage += `Error: ${error.message}`;
      }
      
      setErrorMessage(friendlyMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const VitalCard: React.FC<{
    title: string;
    value: string;
    unit: string;
    icon: React.ComponentType<any>;
    field: string;
    normal?: string;
  }> = ({ title, value, unit, icon: Icon, field, normal }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center space-x-2 mb-3">
        <Icon className="w-5 h-5 text-blue-600" />
        <h3 className="font-medium text-gray-900">{title}</h3>
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => handleVitalChange(field, e.target.value)}
        className="w-full text-2xl font-bold text-gray-900 bg-transparent border-0 p-0 focus:ring-0 focus:outline-none"
        placeholder="0"
        autoComplete="off"
      />
      <div className="flex items-center justify-between mt-2">
        <span className="text-sm text-gray-500">{unit}</span>
        {normal && <span className="text-xs text-gray-400">Normal: {normal}</span>}
      </div>
    </div>
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
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
              <h1 className="text-3xl font-bold text-gray-900">Vitals & Assessment</h1>
              <p className="text-gray-600">Record patient vital signs and health metrics</p>
            </div>
          </div>
          
          {/* Dynamic Patient Info */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Current Patient</p>
            <p className="font-semibold text-gray-900">
              {selectedPatient?.fullName || 'No Patient Selected'}
            </p>
            <p className="text-sm text-gray-600">
              {selectedPatient ? (
                <>
                  {selectedPatient.uhid} • {selectedPatient.age}Y • {selectedPatient.gender}
                </>
              ) : (
                'Please select a patient from the queue'
              )}
            </p>
            {selectedPatient?.doctorAssigned && (
              <p className="text-sm text-blue-600 mt-1">
                Dr. {selectedPatient.doctorAssigned}
              </p>
            )}
          </div>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-green-800">Vitals saved successfully to Firebase!</span>
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center space-x-2">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span className="text-red-800">{errorMessage}</span>
          </div>
        )}

        {/* Debug Info (remove in production) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-blue-800 text-sm">
              Debug: Firebase DB Status: {db ? '✅ Connected' : '❌ Not Connected'} | 
              Patient: {selectedPatient ? '✅ Selected' : '❌ None'}
            </p>
          </div>
        )}

        {/* Vitals Input */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
          <VitalCard
            title="Weight"
            value={vitals.weight}
            unit="kg"
            icon={Activity}
            field="weight"
            normal="50-80 kg"
          />
          <VitalCard
            title="Height"
            value={vitals.height}
            unit="cm"
            icon={Activity}
            field="height"
            normal="150-180 cm"
          />
          {/* BMI - Read Only */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center space-x-2 mb-3">
              <Activity className="w-5 h-5 text-blue-600" />
              <h3 className="font-medium text-gray-900">BMI</h3>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {vitals.bmi || '0.0'}
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-sm text-gray-500">kg/m²</span>
              {vitals.bmi && (
                <span
                  className={`text-xs font-medium ${getBMICategory(parseFloat(vitals.bmi)).color}`}
                >
                  {getBMICategory(parseFloat(vitals.bmi)).category}
                </span>
              )}
            </div>
          </div>
          <VitalCard
            title="Pulse"
            value={vitals.pulse}
            unit="bpm"
            icon={Heart}
            field="pulse"
            normal="60-100 bpm"
          />
        </div>

        {/* More Vitals */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
          <VitalCard
            title="Blood Pressure"
            value={vitals.bloodPressure}
            unit="mmHg"
            icon={Heart}
            field="bloodPressure"
            normal="120/80"
          />
          <VitalCard
            title="Temperature"
            value={vitals.temperature}
            unit="°F"
            icon={Thermometer}
            field="temperature"
            normal="98.6°F"
          />
          <VitalCard
            title="SPO₂"
            value={vitals.spo2}
            unit="%"
            icon={Activity}
            field="spo2"
            normal="95-100%"
          />
          <VitalCard
            title="Respiratory Rate"
            value={vitals.respiratoryRate}
            unit="/min"
            icon={Activity}
            field="respiratoryRate"
            normal="12-20/min"
          />
        </div>

        {/* Risk Assessment + Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Risk Assessment */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Assessment</h3>
            <div className="space-y-4">
              {Object.entries({
                diabetes: 'Diabetes Risk',
                heartDisease: 'Heart Disease Risk',
                kidney: 'Kidney Disease Risk'
              }).map(([key, label]) => (
                <label key={key} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={vitals.riskFlags[key as keyof typeof vitals.riskFlags]}
                    onChange={(e) =>
                      setVitals(prev => ({
                        ...prev,
                        riskFlags: {
                          ...prev.riskFlags,
                          [key]: e.target.checked,
                        }
                      }))
                    }
                    className="h-4 w-4 text-blue-600 rounded border-gray-300"
                  />
                  <span className="text-gray-700">{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 flex flex-col space-y-4">
            <button 
              onClick={handleSaveVitals}
              disabled={isSaving || !selectedPatient}
              className={`flex items-center justify-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                isSaving || !selectedPatient 
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : 'Save Vitals'}</span>
            </button>
            <button 
              onClick={() => alert('Upload functionality would be implemented here')}
              className="flex items-center justify-center space-x-2 px-4 py-2 rounded-lg bg-gray-600 text-white hover:bg-gray-700 transition-colors"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Report</span>
            </button>
            <button 
              onClick={() => alert('AI Assistant would provide recommendations based on vitals')}
              className="flex items-center justify-center space-x-2 px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors"
            >
              <Bot className="w-4 h-4" />
              <span>AI Assist</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};