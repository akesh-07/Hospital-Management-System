import React, { useState } from 'react';
import { Activity, Heart, Thermometer, Upload, Bot, Save } from 'lucide-react';

export const VitalsAssessment: React.FC = () => {
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

  const [selectedPatient] = useState({
    name: 'John Doe',
    uhid: 'HMS001',
    age: 45,
    gender: 'Male'
  });

  const calculateBMI = () => {
    const heightM = parseFloat(vitals.height) / 100;
    const weightKg = parseFloat(vitals.weight);
    if (heightM && weightKg) {
      const bmi = (weightKg / (heightM * heightM)).toFixed(1);
      setVitals(prev => ({ ...prev, bmi }));
    }
  };

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { category: 'Underweight', color: 'text-blue-600' };
    if (bmi < 25) return { category: 'Normal', color: 'text-green-600' };
    if (bmi < 30) return { category: 'Overweight', color: 'text-yellow-600' };
    return { category: 'Obese', color: 'text-red-600' };
  };

  const VitalCard: React.FC<{
    title: string;
    value: string;
    unit: string;
    icon: React.ComponentType<any>;
    onChange: (value: string) => void;
    normal?: string;
    type?: string;
  }> = ({ title, value, unit, icon: Icon, onChange, normal, type = 'number' }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center space-x-2 mb-3">
        <Icon className="w-5 h-5 text-blue-600" />
        <h3 className="font-medium text-gray-900">{title}</h3>
      </div>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={title === 'Height' || title === 'Weight' ? calculateBMI : undefined}
        className="w-full text-2xl font-bold text-gray-900 bg-transparent border-0 p-0 focus:ring-0 focus:outline-none"
        placeholder="0"
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
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Activity className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Vitals & Assessment</h1>
              <p className="text-gray-600">Record patient vital signs and health metrics</p>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Current Patient</p>
            <p className="font-semibold text-gray-900">{selectedPatient.name}</p>
            <p className="text-sm text-gray-600">{selectedPatient.uhid} • {selectedPatient.age}Y • {selectedPatient.gender}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
          <VitalCard
            title="Weight"
            value={vitals.weight}
            unit="kg"
            icon={Activity}
            onChange={(value) => setVitals(prev => ({ ...prev, weight: value }))}
            normal="50-80 kg"
          />
          <VitalCard
            title="Height"
            value={vitals.height}
            unit="cm"
            icon={Activity}
            onChange={(value) => setVitals(prev => ({ ...prev, height: value }))}
            normal="150-180 cm"
          />
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center space-x-2 mb-3">
              <Activity className="w-5 h-5 text-blue-600" />
              <h3 className="font-medium text-gray-900">BMI</h3>
            </div>
            <div className="text-2xl font-bold text-gray-900">{vitals.bmi || '0.0'}</div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-sm text-gray-500">kg/m²</span>
              {vitals.bmi && (
                <span className={`text-xs font-medium ${getBMICategory(parseFloat(vitals.bmi)).color}`}>
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
            onChange={(value) => setVitals(prev => ({ ...prev, pulse: value }))}
            normal="60-100 bpm"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
          <VitalCard
            title="Blood Pressure"
            value={vitals.bloodPressure}
            unit="mmHg"
            icon={Heart}
            onChange={(value) => setVitals(prev => ({ ...prev, bloodPressure: value }))}
            normal="120/80"
            type="text"
          />
          <VitalCard
            title="Temperature"
            value={vitals.temperature}
            unit="°F"
            icon={Thermometer}
            onChange={(value) => setVitals(prev => ({ ...prev, temperature: value }))}
            normal="98.6°F"
          />
          <VitalCard
            title="SPO₂"
            value={vitals.spo2}
            unit="%"
            icon={Activity}
            onChange={(value) => setVitals(prev => ({ ...prev, spo2: value }))}
            normal="95-100%"
          />
          <VitalCard
            title="Respiratory Rate"
            value={vitals.respiratoryRate}
            unit="/min"
            icon={Activity}
            onChange={(value) => setVitals(prev => ({ ...prev, respiratoryRate: value }))}
            normal="12-20/min"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                    onChange={(e) => setVitals(prev => ({
                      ...prev,
                      riskFlags: { ...prev.riskFlags, [key]: e.target.checked }
                    }))}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-gray-700">{label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Previous Records</h3>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer">
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-1">Upload previous medical records</p>
              <p className="text-xs text-gray-500">PDF, Images up to 10MB</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mt-8 p-6 bg-white rounded-lg border border-gray-200">
          <button className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-colors">
            <Bot className="w-4 h-4" />
            <span>AI Health Summary</span>
          </button>
          
          <div className="flex items-center space-x-4">
            <button className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
              Clear Form
            </button>
            <button className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Save className="w-4 h-4" />
              <span>Save Vitals</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};