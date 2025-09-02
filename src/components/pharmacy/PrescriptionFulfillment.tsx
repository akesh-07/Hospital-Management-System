import React, { useState } from 'react';
import { 
  FileText, 
  User, 
  CheckCircle, 
  AlertCircle, 
  Printer, 
  Mail,
  RefreshCw,
  Search,
  Filter
} from 'lucide-react';
import { mockPharmacyPrescriptions } from '../../data/pharmacyData';
import { PharmacyPrescription, PrescriptionMedication } from '../../types/pharmacy';

export const PrescriptionFulfillment: React.FC = () => {
  const [prescriptions, setPrescriptions] = useState<PharmacyPrescription[]>(mockPharmacyPrescriptions);
  const [selectedPrescription, setSelectedPrescription] = useState<PharmacyPrescription | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'partial' | 'completed'>('all');

  const filteredPrescriptions = prescriptions.filter(prescription => {
    const matchesSearch = prescription.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prescription.uhid.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prescription.doctorName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
                         prescription.status.toLowerCase().replace(' ', '') === statusFilter.replace('partial', 'partiallydispensed');
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: PharmacyPrescription['status']) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Partially Dispensed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Completed': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const toggleMedicationDispensed = (prescriptionId: string, medicationId: string) => {
    setPrescriptions(prescriptions.map(prescription => {
      if (prescription.id === prescriptionId) {
        const updatedMedications = prescription.medications.map(med =>
          med.id === medicationId ? { ...med, dispensed: !med.dispensed } : med
        );
        
        const allDispensed = updatedMedications.every(med => med.dispensed);
        const someDispensed = updatedMedications.some(med => med.dispensed);
        
        let newStatus: PharmacyPrescription['status'] = 'Pending';
        if (allDispensed) newStatus = 'Completed';
        else if (someDispensed) newStatus = 'Partially Dispensed';
        
        return {
          ...prescription,
          medications: updatedMedications,
          status: newStatus
        };
      }
      return prescription;
    }));
  };

  const suggestSubstitute = (medicationName: string) => {
    const substitutes: { [key: string]: string[] } = {
      'Paracetamol': ['Acetaminophen', 'Tylenol', 'Calpol'],
      'Metformin': ['Glucophage', 'Fortamet', 'Riomet'],
      'Amoxicillin': ['Augmentin', 'Trimox', 'Amoxil'],
      'Lisinopril': ['Prinivil', 'Zestril', 'Qbrelis']
    };
    
    return substitutes[medicationName] || ['No substitutes available'];
  };

  const PrescriptionCard: React.FC<{ prescription: PharmacyPrescription }> = ({ prescription }) => (
    <div 
      className={`bg-white rounded-lg border p-4 hover:shadow-md transition-all cursor-pointer ${
        selectedPrescription?.id === prescription.id ? 'ring-2 ring-green-500' : 'border-gray-200'
      }`}
      onClick={() => setSelectedPrescription(prescription)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{prescription.patientName}</h3>
            <p className="text-sm text-gray-600">UHID: {prescription.uhid} • {prescription.patientType}</p>
            <p className="text-sm text-gray-600">Dr. {prescription.doctorName}</p>
          </div>
        </div>
        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(prescription.status)}`}>
          {prescription.status}
        </span>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Medications: {prescription.medications.length}</span>
          <span className="text-gray-600">
            Dispensed: {prescription.medications.filter(med => med.dispensed).length}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Total Amount: ${prescription.totalAmount.toFixed(2)}</span>
          <span className="text-gray-600">
            {new Date(prescription.prescriptionDate).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <FileText className="w-8 h-8 text-green-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Prescription Fulfillment</h1>
              <p className="text-gray-600">Process and dispense prescribed medications</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-gray-500">Pending Prescriptions</p>
              <p className="text-2xl font-bold text-green-600">
                {prescriptions.filter(p => p.status !== 'Completed').length}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Active Prescriptions</h3>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search prescriptions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Filter className="w-4 h-4 text-gray-400" />
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as any)}
                      className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="all">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="partial">Partially Dispensed</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                {filteredPrescriptions.map((prescription) => (
                  <PrescriptionCard key={prescription.id} prescription={prescription} />
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {selectedPrescription ? (
              <>
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Prescription Details</h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Patient:</span>
                      <p className="text-gray-900 mt-1">{selectedPrescription.patientName}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">UHID:</span>
                      <p className="text-gray-900 mt-1">{selectedPrescription.uhid}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Doctor:</span>
                      <p className="text-gray-900 mt-1">{selectedPrescription.doctorName}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Date:</span>
                      <p className="text-gray-900 mt-1">
                        {new Date(selectedPrescription.prescriptionDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Medications to Dispense</h3>
                  <div className="space-y-4">
                    {selectedPrescription.medications.map((medication) => (
                      <div key={medication.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{medication.drugName}</h4>
                            <p className="text-sm text-gray-600">
                              {medication.dosage} • {medication.frequency} • {medication.duration}
                            </p>
                            <p className="text-sm text-blue-600">{medication.instructions}</p>
                            <p className="text-sm text-gray-500 mt-1">
                              Quantity: {medication.quantity} • ${medication.unitPrice.toFixed(2)} each
                            </p>
                          </div>
                          <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={medication.dispensed}
                              onChange={() => toggleMedicationDispensed(selectedPrescription.id, medication.id)}
                              className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                            />
                            <span className="text-sm text-gray-700">Dispensed</span>
                          </label>
                        </div>
                        
                        {!medication.dispensed && (
                          <div className="flex items-center space-x-2 mt-3">
                            <button className="flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full hover:bg-blue-200 transition-colors">
                              <RefreshCw className="w-3 h-3" />
                              <span>Substitute</span>
                            </button>
                            <div className="text-xs text-gray-500">
                              Available: {suggestSubstitute(medication.drugName).join(', ')}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
                  <div className="space-y-3">
                    <button className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                      <CheckCircle className="w-4 h-4" />
                      <span>Complete Dispensing</span>
                    </button>
                    <button className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      <Printer className="w-4 h-4" />
                      <span>Print Medicine Slip</span>
                    </button>
                    <button className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                      <Mail className="w-4 h-4" />
                      <span>Email Instructions</span>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">Select a prescription to view details and dispense medications</p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <AlertCircle className="w-6 h-6 text-yellow-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {prescriptions.filter(p => p.status === 'Pending').length}
              </p>
              <p className="text-sm text-gray-600">Pending</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <RefreshCw className="w-6 h-6 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {prescriptions.filter(p => p.status === 'Partially Dispensed').length}
              </p>
              <p className="text-sm text-gray-600">Partial</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {prescriptions.filter(p => p.status === 'Completed').length}
              </p>
              <p className="text-sm text-gray-600">Completed</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{prescriptions.length}</p>
              <p className="text-sm text-gray-600">Total Today</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};