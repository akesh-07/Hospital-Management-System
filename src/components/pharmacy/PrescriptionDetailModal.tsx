// You can place this inside PrescriptionFulfillment.tsx or in its own file.

import { X, RefreshCw, CheckCircle, Printer } from "lucide-react";
import {
  PharmacyPrescription,
  PrescriptionMedication,
} from "../../types/pharmacy";

// This function can be moved here if it's only used in the modal now
const suggestSubstitute = (medicationName: string) => {
  const substitutes: { [key: string]: string[] } = {
    Paracetamol: ["Acetaminophen", "Tylenol", "Calpol"],
    Metformin: ["Glucophage", "Fortamet", "Riomet"],
    Amoxicillin: ["Augmentin", "Trimox", "Amoxil"],
    Lisinopril: ["Prinivil", "Zestril", "Qbrelis"],
  };
  return substitutes[medicationName] || ["No substitutes available"];
};

interface PrescriptionDetailModalProps {
  prescription: PharmacyPrescription;
  onClose: () => void;
  onToggleDispense: (prescriptionId: string, medicationId: string) => void;
}

export const PrescriptionDetailModal: React.FC<PrescriptionDetailModalProps> = ({
  prescription,
  onClose,
  onToggleDispense,
}) => {
  return (
    // Modal Overlay
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      {/* Modal Content */}
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Prescription Details
            </h2>
            <p className="text-sm text-gray-600">
              Patient:{" "}
              <span className="font-medium">{prescription.patientName}</span>{" "}
              (UHID: {prescription.uhid})
            </p>
            <p className="text-sm text-gray-600">
              Prescribed by Dr. {prescription.doctorName} on{" "}
              {new Date(prescription.prescriptionDate).toLocaleDateString()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Modal Body with Table */}
        <div className="p-6 overflow-y-auto">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Medications to Dispense
          </h3>
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="w-full text-sm text-left text-gray-700">
              <thead className="text-xs text-gray-800 uppercase bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3">
                    Dispense
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Medication Details
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Instructions
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Qty & Price
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Substitutes
                  </th>
                </tr>
              </thead>
              <tbody>
                {prescription.medications.map((med) => (
                  <tr
                    key={med.id}
                    className="bg-white border-b hover:bg-gray-50"
                  >
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={med.dispensed}
                        onChange={() =>
                          onToggleDispense(prescription.id, med.id)
                        }
                        className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500 focus:ring-2"
                      />
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {med.drugName}
                      <p className="text-xs text-gray-500 font-normal">
                        {med.dosage}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      {med.frequency} &bull; {med.duration}
                      <p className="text-xs text-blue-600">
                        {med.instructions}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      Qty: {med.quantity}
                      <p className="text-xs text-gray-500">
                        ${med.unitPrice.toFixed(2)} each
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      {!med.dispensed ? (
                        <div className="flex items-center space-x-2">
                          <button className="flex items-center space-x-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full hover:bg-blue-200">
                            <RefreshCw className="w-3 h-3" />
                            <span>Suggest</span>
                          </button>
                          <span className="text-xs text-gray-500">
                            {suggestSubstitute(med.drugName)[0]}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end space-x-4 p-6 border-t border-gray-200 bg-gray-50 rounded-b-lg">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100"
          >
            Close
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">
            <Printer className="w-4 h-4" />
            <span>Print Slip</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700">
            <CheckCircle className="w-4 h-4" />
            <span>Complete Dispensing</span>
          </button>
        </div>
      </div>
    </div>
  );
};
