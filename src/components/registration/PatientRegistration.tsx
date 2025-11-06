import React, { useState } from "react";
import {
  UserPlus,
  Save,
  X,
  CheckCircle,
  MapPin,
  HeartPulse,
  UserCog,
  Upload,
  ChevronDown,
  Mail,
  Smartphone,
  Scan,
  ListPlus,
  Plus,
} from "lucide-react";
import { db } from "../../firebase";
import {
  collection,
  addDoc,
  Timestamp,
  doc,
  updateDoc,
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { AutocompleteInput } from "../doctor/AutocompleteInput";

// Helper component for section headers to maintain consistency
const SectionHeader: React.FC<{ icon: React.ElementType; title: string }> = ({
  icon: Icon,
  title,
}) => (
  <div className="flex items-center space-x-2 mb-4">
    <div className="p-1.5 rounded-lg bg-[#e0f7fa]">
      <Icon className="w-5 h-5 text-[#012e58]" />
    </div>
    <h2 className="text-lg font-bold text-[#0B2D4D] tracking-tight">{title}</h2>
  </div>
);

// Custom styled input/select to match the image's aesthetic
const StyledInput: React.FC<any> = ({
  placeholder,
  isSelect,
  children,
  icon: Icon,
  className = "",
  isRequired = false,
  ...props
}) => (
  <div className="relative">
    {Icon && (
      <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#1a4b7a]" />
    )}
    {isSelect ? (
      <select
        className={`w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white focus:ring-1 focus:ring-[#1a4b7a] focus:border-[#1a4b7a] transition-all duration-200 text-sm appearance-none ${
          Icon ? "pl-10" : ""
        } ${className} ${
          props.value === "" ? "text-gray-500" : "text-[#0B2D4D]"
        }`}
        {...props}
      >
        <option value="" disabled className="text-gray-500">
          {placeholder}
        </option>
        {children}
      </select>
    ) : (
      <input
        type="text"
        placeholder={placeholder + (isRequired ? " *" : "")}
        className={`w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white focus:ring-1 focus:ring-[#1a4b7a] focus:border-[#1a4b7a] transition-all duration-200 text-sm ${
          Icon ? "pl-10" : ""
        } ${className}`}
        {...props}
      />
    )}
    {/* Custom down arrow for select to mimic the image style */}
    {isSelect && (
      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#1a4b7a] pointer-events-none" />
    )}
  </div>
);

// Patient Registration Implementation
export const PatientRegistration: React.FC = () => {
  const initialFormState = {
    // CORE FIELDS (LEFT COLUMN)
    salutation: "",
    fullName: "",
    dateOfBirth: "",
    age: "", // Auto-calculated/editable override
    gender: "",
    contactNumber: "",
    registrationType: "", // Optional
    doctorAssigned: "",
    uhid: "",

    // ADDRESS & OPTIONAL FIELDS (RIGHT COLUMN)
    addressLine1: "",
    addressLine2: "",
    area: "",
    district: "",
    pinCode: "",
    state: "",
    alternateMobile: "",
    email: "",
    abhaId: "",

    // ADDITIONAL FIELDS
    bloodGroup: "",
    occupation: "",
    maritalStatus: "",

    // STANDARD APP FIELDS
    patientType: "OPD",
    visitType: "Walk-in",
    paymentMethod: "Cash",
    consultationPackage: "",
    preferredLanguage: "English",
    chronicConditions: [] as string[],
    files: null as FileList | null,
  };

  const [formData, setFormData] = useState(initialFormState);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMoreFields, setShowMoreFields] = useState(false);

  // Mock data for dropdowns
  const salutationOptions = ["Mr", "Mrs", "Mr & Mrs", "Master", "Dr", "Ms"];
  const genderOptions = ["Male", "Female", "Other"];
  const registrationTypeOptions = ["New", "Review", "Referral", "Follow-up"];
  const mockDoctorOptions = [
    "Dr. Sarah Wilson",
    "Dr. Michael Chen",
    "Dr. John Doe",
  ];
  const [doctorOptions] = useState<string[]>(mockDoctorOptions);
  const bloodGroupOptions = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
  const maritalStatusOptions = ["Single", "Married", "Divorced", "Widowed"];

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, files: e.target.files });
  };

  const handleDoctorChange = (id: number, value: string) => {
    setFormData((prev) => ({ ...prev, doctorAssigned: value }));
  };

  const calculateAge = (dobString: string): string => {
    const today = new Date();
    const birthDate = new Date(dobString);
    if (isNaN(birthDate.getTime())) return "";

    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age >= 0 ? String(age) : "";
  };

  const handleDOBChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dob = e.target.value;
    const calculatedAge = dob ? calculateAge(dob) : "";
    setFormData((prev) => ({
      ...prev,
      dateOfBirth: dob,
      age: calculatedAge,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // MODIFIED: Removed !formData.dateOfBirth from the validation check, making DOB optional.
    // Age and other core fields are still required.
    if (
      !formData.fullName ||
      !formData.age ||
      !formData.gender ||
      !formData.contactNumber ||
      !formData.doctorAssigned ||
      !formData.district ||
      !formData.pinCode ||
      !formData.state
    ) {
      alert("Please fill out all required fields (*).");
      setIsSubmitting(false);
      return;
    }

    try {
      const patientDataForDB = {
        // Core Fields
        salutation: formData.salutation,
        fullName: formData.fullName,
        dateOfBirth: formData.dateOfBirth, // Optional, can be empty
        age: formData.age,
        gender: formData.gender,
        contactNumber: formData.contactNumber,
        registrationType: formData.registrationType,
        doctorAssigned: formData.doctorAssigned,

        // Address Fields
        addressLine1: formData.addressLine1,
        addressLine2: formData.addressLine2,
        area: formData.area,
        district: formData.district,
        pinCode: formData.pinCode,
        state: formData.state,

        // Optional Fields
        alternateMobile: formData.alternateMobile,
        email: formData.email,
        abhaId: formData.abhaId,
        bloodGroup: formData.bloodGroup,
        occupation: formData.occupation,
        maritalStatus: formData.maritalStatus,

        // Standard App Fields
        patientType: formData.patientType,
        visitType: formData.visitType,
        paymentMethod: formData.paymentMethod,
        consultationPackage: formData.consultationPackage,
        preferredLanguage: formData.preferredLanguage,
        chronicConditions: formData.chronicConditions,

        fileUrls: [], // Placeholder
        createdAt: Timestamp.now(),
        status: "Waiting",
      };

      const newPatientRef = await addDoc(
        collection(db, "patients"),
        patientDataForDB
      );

      const patientId = newPatientRef.id;
      const storage = getStorage();
      const fileUrls: string[] = [];

      // 2. Upload files
      if (formData.files && formData.files.length > 0) {
        for (const file of Array.from(formData.files)) {
          const storageRef = ref(storage, `patients/${patientId}/${file.name}`);
          const snapshot = await uploadBytes(storageRef, file);
          const downloadURL = await getDownloadURL(snapshot.ref);
          fileUrls.push(downloadURL);
        }
      }

      // 3. Update the Firestore document with the final ID and UHID
      const generatedUhid = `UHID${patientId.slice(0, 8).toUpperCase()}`;

      await updateDoc(newPatientRef, {
        id: patientId,
        uhid: generatedUhid,
        fileUrls: fileUrls,
      });

      // Update local state temporarily to show the generated UHID
      setFormData((prev) => ({ ...prev, uhid: generatedUhid }));

      setShowSuccess(true);
      setTimeout(() => setFormData(initialFormState), 3000);
    } catch (error) {
      console.error("Error adding patient:", error);
      alert("Failed to register patient. Check console for details.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearForm = () => {
    if (window.confirm("Are you sure you want to clear the form?")) {
      setFormData(initialFormState);
      setShowSuccess(false);
      setShowMoreFields(false);
    }
  };

  // --- Component for the fixed action buttons at the bottom ---
  const ActionFooter = () => (
    <div className="flex-shrink-0 flex justify-between space-x-4 mt-6 pt-4 border-t border-gray-200 sticky bottom-0 bg-white/90 backdrop-blur-sm z-10">
      {/* Last Sync Indicator */}
      <p className="text-left text-xs text-gray-500 flex items-center">
        <span className="w-2 h-2 bg-green-500 rounded-full mr-1.5 animate-pulse"></span>
        Last Sync: {new Date().toLocaleTimeString()}
      </p>

      {/* Action buttons */}
      <div className="flex space-x-4">
        <button
          type="button"
          className="group flex items-center px-5 py-2.5 border border-[#1a4b7a] rounded-lg text-[#1a4b7a] bg-white hover:bg-[#e0f7fa] transition-all duration-300 font-medium"
          onClick={clearForm}
          disabled={isSubmitting}
        >
          <X className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:rotate-90" />
          Clear Form
        </button>
        <button
          type="submit"
          className="flex items-center px-6 py-2.5 bg-[#012e58] text-white font-semibold rounded-lg shadow-md hover:bg-[#1a4b7a] transition-all duration-300 disabled:opacity-70 disabled:cursor-wait"
          disabled={isSubmitting}
        >
          <Save className="w-4 h-4 mr-2" />
          {isSubmitting ? "Registering..." : "Register Patient"}
        </button>
      </div>
    </div>
  );

  return (
    <div className="bg-[#F8F9FA] font-sans flex flex-col min-h-screen p-6">
      {/* Outer Container with Pre-OPD style border and shadow */}
      <div className="max-w-7xl mx-auto flex-grow flex flex-col bg-white p-6 rounded-xl shadow-lg border border-gray-200 w-full">
        {/* Success Message */}
        {showSuccess && (
          <div className="mb-4 bg-green-100 border-l-4 border-green-500 text-green-900 p-3 rounded-md flex items-center space-x-3">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="font-medium">
              Patient registered successfully!
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="h-full flex flex-col">
          <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar">
            {/* --- TOP HEADER BAR - Styled like the image --- */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
              <div className="flex items-center space-x-4">
                <UserPlus className="w-6 h-6 text-[#012e58]" />
                <h1 className="text-2xl font-bold text-[#0B2D4D]">
                  Patient Registration
                </h1>
              </div>
              <button
                type="button"
                className="flex items-center space-x-2 px-4 py-2 bg-[#012e58] text-white rounded-lg hover:bg-[#1a4b7a] transition-colors text-sm font-medium"
                onClick={() => alert("Quick add patient logic here.")}
              >
                <Plus className="w-4 h-4" />
                <span>Add New Patient</span>
              </button>
            </div>

            {/* Main Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* --- LEFT COLUMN: CORE PATIENT INFO --- */}
              <div className="space-y-6">
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                  <SectionHeader icon={UserCog} title="Core Patient Details" />

                  {/* Registration Date & Time & UHID (Read-Only Boxes) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                    <div>
                      <label className="text-xs font-medium text-[#1a4b7a] mb-1 block">
                        Reg Date & Time
                      </label>
                      <StyledInput
                        type="text"
                        className="bg-gray-100 cursor-not-allowed text-gray-700 font-medium"
                        value={
                          new Date().toLocaleDateString("en-US", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          }) +
                          " " +
                          new Date().toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          })
                        }
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-[#1a4b7a] mb-1 block">
                        UHID
                      </label>
                      <StyledInput
                        type="text"
                        className="bg-gray-100 cursor-not-allowed text-gray-700 font-medium"
                        value={formData.uhid || "Generate UHID (Auto)"}
                        readOnly
                      />
                    </div>
                  </div>

                  {/* Salutation & Full Name */}
                  <div className="grid grid-cols-5 gap-3">
                    <StyledInput
                      isSelect
                      name="salutation"
                      className="col-span-1"
                      value={formData.salutation}
                      onChange={handleChange}
                      required
                      disabled={isSubmitting}
                      placeholder="Mr/Mrs*"
                    >
                      {salutationOptions.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </StyledInput>
                    <StyledInput
                      type="text"
                      placeholder="Full Name"
                      isRequired={true}
                      name="fullName"
                      className="col-span-4"
                      value={formData.fullName}
                      onChange={handleChange}
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  {/* DOB | Age | Sex */}
                  <div className="grid grid-cols-3 gap-3 mt-3">
                    <div>
                      {/* MODIFIED: Label no longer marked as required */}
                      <label className="text-xs font-medium text-[#1a4b7a] mb-1 block">
                        DOB (Optional)
                      </label>
                      <StyledInput
                        type="date"
                        name="dateOfBirth"
                        className="pr-2"
                        value={formData.dateOfBirth}
                        onChange={handleDOBChange}
                        // MODIFIED: Removed 'required' attribute, making DOB optional
                        disabled={isSubmitting}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-[#1a4b7a] mb-1 block">
                        Age *
                      </label>
                      <StyledInput
                        type="text"
                        placeholder="Age"
                        name="age"
                        value={formData.age}
                        onChange={handleChange}
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-[#1a4b7a] mb-1 block">
                        Gender *
                      </label>
                      <StyledInput
                        isSelect
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        required
                        disabled={isSubmitting}
                        placeholder="Sex"
                      >
                        {genderOptions.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </StyledInput>
                    </div>
                  </div>

                  {/* Mobile Number */}
                  <div className="mt-3">
                    <label className="text-xs font-medium text-[#1a4b7a] mb-1 block">
                      Primary Mobile Number *
                    </label>
                    <StyledInput
                      type="tel"
                      placeholder="Enter 10-digit number"
                      name="contactNumber"
                      icon={Smartphone}
                      value={formData.contactNumber}
                      onChange={handleChange}
                      pattern="[0-9]{10,15}"
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  {/* Registration Type & Doctor */}
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <div>
                      <label className="text-xs font-medium text-[#1a4b7a] mb-1 block">
                        Registration Type (Optional)
                      </label>
                      <StyledInput
                        isSelect
                        name="registrationType"
                        value={formData.registrationType}
                        onChange={handleChange}
                        disabled={isSubmitting}
                        placeholder="Select Type"
                      >
                        {registrationTypeOptions.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </StyledInput>
                    </div>
                    <div>
                      {/* MODIFIED: Label removed the '*' as requirement is in placeholder */}
                      <label className="text-xs font-medium text-[#1a4b7a] mb-1 block">
                        Consulting Doctor
                      </label>
                      <AutocompleteInput
                        symptomId={0}
                        value={formData.doctorAssigned}
                        onChange={handleDoctorChange}
                        symptomOptions={doctorOptions}
                        addSymptomOption={() => {}}
                        // MODIFIED: Changed placeholder text
                        placeholder="Doctor Name *"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* --- RIGHT COLUMN: ADDRESS & OPTIONAL FIELDS --- */}
              <div className="space-y-6">
                {/* Address Card */}
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                  <SectionHeader icon={MapPin} title="Address Details" />
                  <div className="grid grid-cols-1 gap-3">
                    <StyledInput
                      type="text"
                      placeholder="Address Line 1"
                      isRequired={true}
                      name="addressLine1"
                      value={formData.addressLine1}
                      onChange={handleChange}
                      required
                      disabled={isSubmitting}
                    />
                    <StyledInput
                      type="text"
                      placeholder="Address Line 2 (Optional)"
                      name="addressLine2"
                      value={formData.addressLine2}
                      onChange={handleChange}
                      disabled={isSubmitting}
                    />
                    <StyledInput
                      type="text"
                      placeholder="Area / Locality"
                      isRequired={true}
                      name="area"
                      value={formData.area}
                      onChange={handleChange}
                      required
                      disabled={isSubmitting}
                    />

                    {/* District, PIN, State */}
                    <div className="grid grid-cols-3 gap-3">
                      <StyledInput
                        type="text"
                        placeholder="District"
                        isRequired={true}
                        name="district"
                        value={formData.district}
                        onChange={handleChange}
                        required
                        disabled={isSubmitting}
                      />
                      <StyledInput
                        type="text"
                        placeholder="PIN Code"
                        isRequired={true}
                        name="pinCode"
                        value={formData.pinCode}
                        onChange={handleChange}
                        required
                        disabled={isSubmitting}
                      />
                      <StyledInput
                        type="text"
                        placeholder="State"
                        isRequired={true}
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                </div>

                {/* Optional and Medical Card (Collapsed Fields) */}
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                  <SectionHeader
                    icon={HeartPulse}
                    title="Optional & Visit Info"
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <StyledInput
                      type="tel"
                      placeholder="Alternate Mobile"
                      name="alternateMobile"
                      icon={Smartphone}
                      value={formData.alternateMobile}
                      onChange={handleChange}
                      disabled={isSubmitting}
                    />
                    <StyledInput
                      type="email"
                      placeholder="Email Address"
                      name="email"
                      icon={Mail}
                      value={formData.email}
                      onChange={handleChange}
                      disabled={isSubmitting}
                    />
                    <StyledInput
                      type="text"
                      placeholder="ABHA ID (Optional)"
                      name="abhaId"
                      icon={Scan}
                      className="md:col-span-2"
                      value={formData.abhaId}
                      onChange={handleChange}
                      disabled={isSubmitting}
                    />
                  </div>

                  {/* Collapsible Section for More Fields */}
                  <div className="mt-4 pt-3 border-t border-gray-200">
                    <button
                      type="button"
                      className="flex items-center space-x-1.5 text-[#1a4b7a] hover:text-[#012e58] font-medium text-xs transition-colors"
                      onClick={() => setShowMoreFields(!showMoreFields)}
                    >
                      <ListPlus className="w-3 h-3" />
                      <span>
                        {showMoreFields
                          ? "Hide Fewer Fields"
                          : "+ Add More Fields"}
                      </span>{" "}
                      <ChevronDown
                        className={`w-3 h-3 transition-transform ${
                          showMoreFields ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {/* More Fields Content */}
                    <div
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${
                        showMoreFields
                          ? "max-h-96 opacity-100 pt-3 space-y-3"
                          : "max-h-0 opacity-0"
                      }`}
                    >
                      <div className="grid grid-cols-2 gap-3">
                        {/* Blood Group */}
                        <StyledInput
                          isSelect
                          name="bloodGroup"
                          value={formData.bloodGroup}
                          onChange={handleChange}
                          disabled={isSubmitting}
                          placeholder="Blood Group"
                        >
                          {bloodGroupOptions.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </StyledInput>
                        {/* Marital Status */}
                        <StyledInput
                          isSelect
                          name="maritalStatus"
                          value={formData.maritalStatus}
                          onChange={handleChange}
                          disabled={isSubmitting}
                          placeholder="Marital Status"
                        >
                          {maritalStatusOptions.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </StyledInput>
                      </div>
                      {/* Occupation */}
                      <StyledInput
                        type="text"
                        placeholder="Occupation"
                        name="occupation"
                        value={formData.occupation}
                        onChange={handleChange}
                        disabled={isSubmitting}
                      />

                      {/* File Upload (Styled) */}
                      <label className="block cursor-pointer">
                        <div className="w-full px-4 py-2.5 border border-dashed border-gray-300 rounded-lg bg-gray-50 flex items-center justify-between text-gray-500 hover:border-[#1a4b7a] transition-all duration-200">
                          <span className="truncate text-sm">
                            {formData.files && formData.files.length > 0
                              ? `${formData.files.length} file(s) selected`
                              : "Click or drag to upload past medical documents"}
                          </span>
                          <Upload className="w-4 h-4 text-gray-400" />
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          onChange={handleFileChange}
                          multiple
                          accept=".pdf, .docx, .txt"
                          disabled={isSubmitting}
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons (Sticky Footer) and Last Sync Indicator */}
          <ActionFooter />
        </form>
      </div>
    </div>
  );
};

export default PatientRegistration;
