// src/components/doctor/ConsultationSummaryModal.tsx
import React, { useRef } from "react";
import {
  X,
  FileText,
  Download,
  CheckCircle,
  Brain,
  Pill,
  Activity,
} from "lucide-react";
import { Patient, Medication } from "../../types";

// Mock interfaces to reflect the data structure used in DoctorModule.tsx
interface ConsultationData {
  symptoms: Array<{
    id: number;
    symptom: string;
    duration: string;
    factors: string;
  }>;
  diagnosis: string;
  notes: string;
  generalExamination: string[];
  systemicExamination: string[];
}

interface SummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFinalComplete: () => void;
  patient: Patient;
  consultation: ConsultationData;
  medications: Medication[];
}

const ConsultationSummaryModal: React.FC<SummaryModalProps> = ({
  isOpen,
  onClose,
  onFinalComplete,
  patient,
  consultation,
  medications,
}) => {
  if (!isOpen) return null;

  const handleDownloadPdf = () => {
    // This uses the browser's native print dialogue, which usually includes
    // a "Save as PDF" option. Print-only CSS styles are applied below.
    window.print();
  };

  const getSummaryContent = () => (
    <div className="space-y-6">
      {/* Print-Only Styles: This entire block is optimized for printing/PDF */}
      <style>{`
        @media print {
          /* Hide everything outside the modal content */
          body > #root > div { display: none; }
          /* Show modal content in a print-friendly format */
          .modal-content-area {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: auto;
            margin: 0;
            padding: 0;
            display: block;
            box-shadow: none;
            background: white;
            color: black;
          }
          .modal-header, .modal-footer, .print-hide { display: none !important; }
        }
      `}</style>

      <div className="modal-content-area p-4">
        {" "}
        {/* Use a dedicated class for print target */}
        <h3 className="text-xl font-bold text-[#0B2D4D] border-b pb-2 flex items-center space-x-2 print:text-black">
          <FileText className="w-5 h-5 text-green-600 print:text-black" />
          <span>
            Consultation Summary - {patient.fullName} (UHID: {patient.uhid})
          </span>
        </h3>
        {/* Patient Info */}
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200 print:bg-white print:border print:shadow-none">
          <p className="text-sm font-semibold text-[#1a4b7a]">
            Patient Details
          </p>
          <p className="text-sm">
            Age: {patient.age}Y, Gender: {patient.gender}, Phone:{" "}
            {patient.contactNumber}
          </p>
          <p className="text-sm">Assigned Doctor: {patient.doctorAssigned}</p>
        </div>
        {/* Diagnosis */}
        <div className="space-y-2 mt-4">
          <h4 className="font-semibold text-[#0B2D4D] flex items-center space-x-2">
            <Brain className="w-4 h-4 text-purple-600" />
            Diagnosis
          </h4>
          <p className="p-3 bg-blue-50 rounded-lg border border-blue-200 text-sm print:bg-white">
            {consultation.diagnosis || "No formal diagnosis entered."}
          </p>
        </div>
        {/* Complaints & Examination */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="space-y-2">
            <h4 className="font-semibold text-[#0B2D4D] flex items-center space-x-2">
              <Activity className="w-4 h-4 text-red-600" />
              Chief Complaints
            </h4>
            <ul className="list-disc list-inside p-3 bg-gray-50 rounded-lg border border-gray-200 text-sm print:bg-white">
              {consultation.symptoms
                .filter((s) => s.symptom.trim())
                .map((s, i) => (
                  <li key={i}>
                    {s.symptom} ({s.duration}) - {s.factors}
                  </li>
                ))}
              {consultation.symptoms.filter((s) => s.symptom.trim()).length ===
                0 && <li>No chief complaints recorded.</li>}
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold text-[#0B2D4D] flex items-center space-x-2">
              <Activity className="w-4 h-4 text-green-600" />
              Doctor Notes
            </h4>
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-sm print:bg-white">
              <p>{consultation.notes || "N/A"}</p>
            </div>
          </div>
        </div>
        {/* Medications */}
        <div className="space-y-2 mt-4">
          <h4 className="font-semibold text-[#0B2D4D] flex items-center space-x-2">
            <Pill className="w-4 h-4 text-orange-600" />
            Medications
          </h4>
          <div className="border border-gray-300 rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100 text-xs uppercase text-gray-600 print:bg-white">
                <tr>
                  <th className="px-6 py-3 text-left">Medicine</th>
                  <th className="px-6 py-3 text-left">Dosage</th>
                  <th className="px-6 py-3 text-left">Schedule</th>
                  <th className="px-6 py-3 text-left">Instructions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 text-sm">
                {medications.map((med, index) => (
                  <tr key={med.id}>
                    <td className="px-6 py-3 font-medium">{med.name}</td>
                    <td className="px-6 py-3">{med.dosage}</td>
                    <td className="px-6 py-3">
                      {med.frequency} for {med.duration}
                    </td>
                    <td className="px-6 py-3">{med.instructions}</td>
                  </tr>
                ))}
                {medications.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-3 text-center text-gray-500"
                    >
                      No medications prescribed.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="modal-header flex items-center justify-between p-5 border-b border-gray-200 bg-[#F8F9FA] rounded-t-xl">
          <div className="flex items-center space-x-3">
            <FileText className="w-6 h-6 text-[#012e58]" />
            <h2 className="text-xl font-bold text-[#0B2D4D]">
              Final Consultation Summary
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-grow">
          {getSummaryContent()}
        </div>

        <div className="modal-footer flex items-center justify-between p-4 border-t border-gray-200 bg-[#F8F9FA] rounded-b-xl">
          <button
            onClick={handleDownloadPdf}
            className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Download PDF/Print</span>
          </button>

          <button
            onClick={onFinalComplete}
            className="flex items-center space-x-2 px-6 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg shadow-md hover:bg-green-700 transition-colors"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Complete Consultation</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConsultationSummaryModal;
