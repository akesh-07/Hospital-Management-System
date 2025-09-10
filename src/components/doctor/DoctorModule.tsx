import React, { useState, useEffect } from "react";
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
  ArrowLeft,
  Loader,
  Brain,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { db } from "../../firebase";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { Vitals } from "../../types";

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

export const DoctorModule: React.FC<DoctorModuleProps> = ({
  selectedPatient,
  onBack,
}) => {
  const [activeTab, setActiveTab] = useState<
    "history" | "assessment" | "prescriptions" | "ai-assist"
  >("history");
  const [vitals, setVitals] = useState<Vitals | null>(null);
  const [consultation, setConsultation] = useState({
    symptoms: [] as string[],
    duration: "",
    aggravatingFactors: [] as string[],
    generalExamination: [] as string[],
    systemicExamination: [] as string[],
    investigations: [] as string[],
    diagnosis: "",
    notes: "",
  });

  // Fetch vitals from Firebase when a patient is selected
  useEffect(() => {
    if (!selectedPatient?.id) {
      setVitals(null);
      return;
    }

    const vitalsQuery = query(
      collection(db, "vitals"),
      where("patientId", "==", selectedPatient.id),
      orderBy("recordedAt", "desc")
    );

    const unsubscribe = onSnapshot(vitalsQuery, (snapshot) => {
      if (snapshot.docs.length > 0) {
        const latestVitals = snapshot.docs[0].data() as Vitals;
        setVitals(latestVitals);
      } else {
        setVitals(null);
      }
    });

    return () => unsubscribe();
  }, [selectedPatient]);

  const AIAssistTab: React.FC<{
    consultation: any;
    selectedPatient: Patient;
  }> = ({ consultation, selectedPatient }) => {
    const [symptoms, setSymptoms] = useState("");
    const [duration, setDuration] = useState("");
    const [diagnosis, setDiagnosis] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async () => {
      if (!symptoms.trim() && !duration.trim()) {
        setDiagnosis("Please enter symptoms or duration to get a diagnosis.");
        return;
      }

      setIsLoading(true);
      setDiagnosis("");

      try {
        const response = await fetch(
          "https://api.groq.com/openai/v1/chat/completions",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer ",
            },
            body: JSON.stringify({
              model: "llama-3.1-8b-instant",
              messages: [
                {
                  role: "system",
                  content:
                    "You are a medical assistant. Given symptoms and duration, suggest a possible diagnosis and treatment plan and also generate a prescription. Format your response in a clear, structured manner with sections for Diagnosis, Treatment Plan, and Prescription.",
                },
                {
                  role: "user",
                  content: `Patient Information:
Name: ${selectedPatient.fullName}
Age: ${selectedPatient.age}
Gender: ${selectedPatient.gender}
Chronic Conditions: ${selectedPatient.chronicConditions?.join(", ") || "None"}

Current Symptoms: ${symptoms || "Not specified"}
Duration: ${duration || "Not specified"}
Additional Symptoms from examination: ${
                    consultation.symptoms?.join(", ") || "None"
                  }`,
                },
              ],
            }),
          }
        );

        const data = await response.json();
        const content =
          data?.choices?.[0]?.message?.content?.trim() ||
          data?.choices?.[0]?.text?.trim() ||
          "Unable to generate diagnosis. Please try again.";

        setDiagnosis(content);
      } catch (err) {
        console.error("Error calling Groq:", err);
        setDiagnosis(
          "Error connecting to AI service. Please check your connection and try again."
        );
      } finally {
        setIsLoading(false);
      }
    };

    const handleAutoFill = () => {
      if (consultation.symptoms?.length > 0) {
        setSymptoms(consultation.symptoms.join(", "));
      }
      if (consultation.duration) {
        setDuration(consultation.duration);
      }
    };

    return (
      <div className="space-y-6">
          {/* Header */} {" "}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
           {" "}
          <div className="flex items-center justify-between mb-6">
             {" "}
            <div className="flex items-center space-x-3">
               {" "}
              <div className="w-10 h-10 bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg flex items-center justify-center">
                  <Brain className="w-6 h-6 text-purple-600" /> {" "}
              </div>
               {" "}
              <div>
                 {" "}
                <h3 className="text-lg font-semibold text-gray-900">
                    AI Diagnostic Assistant  {" "}
                </h3>
                 {" "}
                <p className="text-sm text-gray-600">
                    Get AI-powered insights and recommendations based on patient
                    data  {" "}
                </p>
                 {" "}
              </div>
               {" "}
            </div>
             {" "}
            <button
              onClick={handleAutoFill}
              className="flex items-center space-x-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm"
            >
                <CheckCircle className="w-4 h-4" /> {" "}
              <span>Auto-fill from Examination</span> {" "}
            </button>
             {" "}
          </div>
            {/* Patient Context */} {" "}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
             {" "}
            <h4 className="font-medium text-gray-900 mb-2">Patient Context</h4> {" "}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
               {" "}
              <div>
                  <span className="text-gray-600">Name:</span> {" "}
                <p className="font-medium">{selectedPatient.fullName}</p> {" "}
              </div>
               {" "}
              <div>
                  <span className="text-gray-600">Age:</span> {" "}
                <p className="font-medium">{selectedPatient.age}Y</p> {" "}
              </div>
               {" "}
              <div>
                  <span className="text-gray-600">Gender:</span> {" "}
                <p className="font-medium">{selectedPatient.gender}</p> {" "}
              </div>
               {" "}
              <div>
                  <span className="text-gray-600">Type:</span> {" "}
                <p className="font-medium">{selectedPatient.patientType}</p> {" "}
              </div>
               {" "}
            </div>
             {" "}
            {selectedPatient.chronicConditions &&
              selectedPatient.chronicConditions.length > 0 && (
                <div className="mt-3">
                   {" "}
                  <span className="text-gray-600 text-sm">
                      Chronic Conditions:  {" "}
                  </span>
                   {" "}
                  <div className="flex flex-wrap gap-2 mt-1">
                     {" "}
                    {selectedPatient.chronicConditions.map(
                      (condition, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full"
                        >
                            {condition} {" "}
                        </span>
                      )
                    )}
                     {" "}
                  </div>
                   {" "}
                </div>
              )}
             {" "}
          </div>
            {/* Input Section */} {" "}
          <div className="space-y-4">
             {" "}
            <div>
               {" "}
              <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Symptoms  {" "}
              </label>
               {" "}
              <textarea
                rows={3}
                placeholder="Describe the patient's current symptoms in detail..."
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
               {" "}
            </div>
             {" "}
            <div>
               {" "}
              <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration & Timeline  {" "}
              </label>
               {" "}
              <input
                type="text"
                placeholder="e.g., 3 days, 1 week, chronic for 2 months..."
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
               {" "}
            </div>
             {" "}
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="flex items-center justify-center space-x-2 w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
               {" "}
              {isLoading ? (
                <>
                    <Loader className="w-5 h-5 animate-spin" /> {" "}
                  <span>Analyzing...</span> {" "}
                </>
              ) : (
                <>
                    <Brain className="w-5 h-5" /> {" "}
                  <span>Generate AI Diagnosis</span> {" "}
                </>
              )}
               {" "}
            </button>
             {" "}
          </div>
           {" "}
        </div>
          {/* Results Section - Your original diagnosis display */} {" "}
        {diagnosis && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
             {" "}
            <div className="flex items-center space-x-3 mb-4">
               {" "}
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <Bot className="w-5 h-5 text-green-600" /> {" "}
              </div>
               {" "}
              <div>
                 {" "}
                <h4 className="text-lg font-semibold text-gray-900">
                    Possible Diagnosis  {" "}
                </h4>
                 {" "}
                <p className="text-sm text-gray-600">
                    AI-generated diagnosis based on symptoms and duration  {" "}
                </p>
                 {" "}
              </div>
               {" "}
            </div>
             {" "}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
               {" "}
              <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                  {diagnosis} {" "}
              </div>
               {" "}
            </div>
             {" "}
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
               {" "}
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <AlertCircle className="w-4 h-4" /> {" "}
                <span>
                    AI suggestions are for reference only. Always use clinical  
                  judgment.  {" "}
                </span>
                 {" "}
              </div>
               {" "}
              <div className="flex items-center space-x-3">
                 {" "}
                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                    Copy Results  {" "}
                </button>
                 {" "}
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Add to Notes  {" "}
                </button>
                 {" "}
              </div>
               {" "}
            </div>
             {" "}
          </div>
        )}
          {/* Quick Actions */} {" "}
        {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
  		<div className="bg-white rounded-lg border border-gray-200 p-4">
  			<h5 className="font-medium text-gray-900 mb-2">Quick Analysis</h5>
  			<p className="text-sm text-gray-600 mb-3">
  			Get instant insights from examination data
  			</p>
  			<button
  			onClick={() => {
  				handleAutoFill();
  				handleSubmit();
  			}}
  			className="w-full px-3 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors text-sm"
  			>
  			Analyze Current Case
  			</button>
  		</div>

  		<div className="bg-white rounded-lg border border-gray-200 p-4">
  			<h5 className="font-medium text-gray-900 mb-2">
  			Drug Interactions
  			</h5>
  			<p className="text-sm text-gray-600 mb-3">
  			Check for potential medication conflicts
  			</p>
  			<button className="w-full px-3 py-2 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 transition-colors text-sm">
  			Check Interactions
  			</button>
  		</div>

  		<div className="bg-white rounded-lg border border-gray-200 p-4">
  			<h5 className="font-medium text-gray-900 mb-2">
  			Treatment Guidelines
  			</h5>
  			<p className="text-sm text-gray-600 mb-3">
  			Access evidence-based protocols
  			</p>
  			<button className="w-full px-3 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors text-sm">
  			View Guidelines
  			</button>
  		</div>
  		</div> */}
         {" "}
      </div>
    );
  }; // Mock history data - in real app, this would be fetched from the database

  const mockHistory = [
    { date: "2024-08-15", diagnosis: "Routine Checkup", doctor: "Dr. Smith" },
    {
      date: "2024-07-10",
      diagnosis: "Hypertension Follow-up",
      doctor: "Dr. Wilson",
    },
  ];

  const commonSymptoms = [
    "Fever",
    "Cough",
    "Headache",
    "Back Pain",
    "Muscle Spasm",
    "Diarrhea",
    "Fatigue",
    "Nausea",
    "Chest Pain",
    "Shortness of Breath",
  ];

  const quickTemplates = [
    { name: "Fever Package", symptoms: ["Fever", "Fatigue", "Headache"] },
    { name: "Cold & Cough", symptoms: ["Cough", "Runny Nose", "Sore Throat"] },
    { name: "Back Pain", symptoms: ["Back Pain", "Muscle Spasm"] },
    { name: "Diarrhea", symptoms: ["Diarrhea", "Nausea", "Abdominal Pain"] },
  ];

  const generalExaminations = [
    "Conscious & Oriented",
    "Afebrile",
    "Well Nourished",
    "No Pallor",
    "No Icterus",
    "No Cyanosis",
    "No Clubbing",
    "No Lymphadenopathy",
  ];

  const systemicExaminations = [
    "CVS: S1S2 heard, No murmur",
    "RS: Clear bilateral air entry",
    "CNS: Normal",
    "P/A: Soft, non-tender",
    "Extremities: Normal",
  ];

  const toggleArrayItem = (
    array: string[],
    item: string,
    setter: (fn: (prev: any) => any) => void
  ) => {
    setter((prev: any) => ({
      ...prev,
      [array === consultation.symptoms
        ? "symptoms"
        : array === consultation.aggravatingFactors
        ? "aggravatingFactors"
        : array === consultation.generalExamination
        ? "generalExamination"
        : array === consultation.systemicExamination
        ? "systemicExamination"
        : "investigations"]: array.includes(item)
        ? array.filter((i) => i !== item)
        : [...array, item],
    }));
  };

  const TabButton: React.FC<{
    id: string;
    label: string;
    icon: React.ComponentType<any>;
  }> = ({ id, label, icon: Icon }) => (
    <button
      onClick={() => setActiveTab(id as any)}
      className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-colors ${
        activeTab === id
          ? "bg-blue-600 text-white shadow-sm"
          : "text-gray-600 hover:bg-gray-100"
      }`}
    >
        <Icon className="w-4 h-4" /> {" "}
      <span className="font-medium">{label}</span> {" "}
    </button>
  );

  const CheckboxList: React.FC<{
    title: string;
    items: string[];
    selected: string[];
    onToggle: (item: string) => void;
  }> = ({ title, items, selected, onToggle }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3> {" "}
      <div className="grid grid-cols-2 gap-3">
         {" "}
        {items.map((item) => (
          <label
            key={item}
            className="flex items-center space-x-2 cursor-pointer"
          >
             {" "}
            <input
              type="checkbox"
              checked={selected.includes(item)}
              onChange={() => onToggle(item)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
              <span className="text-sm text-gray-700">{item}</span> {" "}
          </label>
        ))}
         {" "}
      </div>
       {" "}
    </div>
  );

  if (!selectedPatient) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
         {" "}
        <div className="text-center">
            <Stethoscope className="w-12 h-12 text-gray-400 mx-auto mb-3" /> {" "}
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
              No Patient Selected  {" "}
          </h2>
           {" "}
          <p className="text-gray-600 mb-4">
              Please select a patient from the queue to begin consultation.  {" "}
          </p>
           {" "}
          <button
            onClick={onBack}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
              <ArrowLeft className="w-4 h-4" />  <span>Back to Queue</span> {" "}
          </button>
           {" "}
        </div>
         {" "}
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
       {" "}
      <div className="max-w-7xl mx-auto">
         {" "}
        <div className="flex items-center justify-between mb-6">
           {" "}
          <div className="flex items-center space-x-3">
             {" "}
            <button
              onClick={onBack}
              className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
                <ArrowLeft className="w-5 h-5" />  <span>Back to Queue</span> {" "}
            </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <Stethoscope className="w-8 h-8 text-blue-600" /> {" "}
            <div>
               {" "}
              <h1 className="text-3xl font-bold text-gray-900">
                  Doctor Consultation  {" "}
              </h1>
               {" "}
              <p className="text-gray-600">
                  Complete medical examination and diagnosis  {" "}
              </p>
               {" "}
            </div>
             {" "}
          </div>
           {" "}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
             {" "}
            <div className="flex items-center space-x-3">
               {" "}
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                 {" "}
                <span className="text-blue-600 font-medium text-sm">
                   {" "}
                  {selectedPatient.fullName
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("")}
                   {" "}
                </span>
                 {" "}
              </div>
               {" "}
              <div>
                 {" "}
                <p className="font-semibold text-gray-900">
                    {selectedPatient.fullName} {" "}
                </p>
                 {" "}
                <p className="text-sm text-gray-600">
                    {selectedPatient.uhid} • {selectedPatient.age}Y •  {" "}
                  {selectedPatient.gender} {" "}
                </p>
                 {" "}
              </div>
               {" "}
            </div>
             {" "}
          </div>
           {" "}
        </div>
         {" "}
        <div className="flex space-x-2 mb-6 overflow-x-auto">
            <TabButton id="history" label="Patient History" icon={FileText} /> {" "}
          <TabButton
            id="assessment"
            label="Clinical Assessment"
            icon={Stethoscope}
          />
            <TabButton id="prescriptions" label="Prescriptions" icon={Pill} />
            <TabButton id="ai-assist" label="AI Assist" icon={Bot} /> {" "}
        </div>
         {" "}
        {activeTab === "history" && (
          <div className="space-y-6">
             {" "}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
               {" "}
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Patient Information  {" "}
              </h3>
               {" "}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                 {" "}
                <div>
                    <p className="text-sm text-gray-600">Contact Number</p> {" "}
                  <p className="font-medium text-gray-900">
                      {selectedPatient.contactNumber} {" "}
                  </p>
                   {" "}
                </div>
                 {" "}
                <div>
                    <p className="text-sm text-gray-600">Address</p> {" "}
                  <p className="font-medium text-gray-900">
                      {selectedPatient.address} {" "}
                  </p>
                   {" "}
                </div>
                 {" "}
                <div>
                    <p className="text-sm text-gray-600">Visit Type</p> {" "}
                  <p className="font-medium text-gray-900">
                      {selectedPatient.visitType} {" "}
                  </p>
                   {" "}
                </div>
                 {" "}
                <div>
                    <p className="text-sm text-gray-600">Payment Method</p> {" "}
                  <p className="font-medium text-gray-900">
                      {selectedPatient.paymentMethod} {" "}
                  </p>
                   {" "}
                </div>
                 {" "}
              </div>
               {" "}
              {selectedPatient.chronicConditions &&
                selectedPatient.chronicConditions.length > 0 && (
                  <div className="mb-6">
                     {" "}
                    <p className="text-sm text-gray-600 mb-2">
                        Chronic Conditions  {" "}
                    </p>
                     {" "}
                    <div className="flex flex-wrap gap-2">
                       {" "}
                      {selectedPatient.chronicConditions.map(
                        (condition, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-red-100 text-red-700 text-sm rounded-full"
                          >
                              {condition} {" "}
                          </span>
                        )
                      )}
                       {" "}
                    </div>
                     {" "}
                  </div>
                )}
               {" "}
            </div>
             {" "}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
               {" "}
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Previous Consultations  {" "}
              </h3>
               {" "}
              <div className="space-y-3">
                 {" "}
                {mockHistory.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                     {" "}
                    <div>
                       {" "}
                      <p className="font-medium text-gray-900">
                          {item.diagnosis} {" "}
                      </p>
                        <p className="text-sm text-gray-600">{item.doctor}</p> {" "}
                    </div>
                     {" "}
                    <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-gray-400" /> {" "}
                      <span className="text-sm text-gray-600">{item.date}</span>
                       {" "}
                    </div>
                     {" "}
                  </div>
                ))}
                 {" "}
              </div>
               {" "}
            </div>
             {" "}
          </div>
        )}
         {" "}
        {activeTab === "assessment" && (
          <div className="flex flex-col lg:flex-row gap-6">
              {/* Left Column */} {" "}
            <div className="w-full lg:w-2/3 space-y-6">
                {/* Examination Section */} {" "}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                 {" "}
                <div className="flex items-center justify-between mb-4">
                   {" "}
                  <h3 className="text-lg font-semibold text-gray-900">
                      Chief Complaints & Symptoms  {" "}
                  </h3>
                   {" "}
                  <div className="flex space-x-2">
                     {" "}
                    {quickTemplates.map((template) => (
                      <button
                        key={template.name}
                        onClick={() =>
                          setConsultation((prev) => ({
                            ...prev,
                            symptoms: [
                              ...new Set([
                                ...prev.symptoms,
                                ...template.symptoms,
                              ]),
                            ],
                          }))
                        }
                        className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
                      >
                          {template.name} {" "}
                      </button>
                    ))}
                     {" "}
                  </div>
                   {" "}
                </div>
                 {" "}
                <div className="grid grid-cols-3 md:grid-cols-5 gap-3 mb-4">
                   {" "}
                  {commonSymptoms.map((symptom) => (
                    <label
                      key={symptom}
                      className="flex items-center space-x-2 cursor-pointer"
                    >
                       {" "}
                      <input
                        type="checkbox"
                        checked={consultation.symptoms.includes(symptom)}
                        onChange={() =>
                          toggleArrayItem(
                            consultation.symptoms,
                            symptom,
                            setConsultation
                          )
                        }
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                        <span className="text-sm text-gray-700">{symptom}</span>
                       {" "}
                    </label>
                  ))}
                   {" "}
                </div>
                 {" "}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                   {" "}
                  <input
                    type="text"
                    placeholder="Duration of symptoms"
                    value={consultation.duration}
                    onChange={(e) =>
                      setConsultation((prev) => ({
                        ...prev,
                        duration: e.target.value,
                      }))
                    }
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                   {" "}
                  <input
                    type="text"
                    placeholder="Add custom symptom"
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && e.currentTarget.value) {
                        setConsultation((prev) => ({
                          ...prev,
                          symptoms: [...prev.symptoms, e.currentTarget.value],
                        }));
                        e.currentTarget.value = "";
                      }
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                   {" "}
                </div>
                 {" "}
              </div>
               {" "}
              <CheckboxList
                title="General Examination"
                items={generalExaminations}
                selected={consultation.generalExamination}
                onToggle={(item) =>
                  toggleArrayItem(
                    consultation.generalExamination,
                    item,
                    setConsultation
                  )
                }
              />
               {" "}
              <CheckboxList
                title="Systemic Examination"
                items={systemicExaminations}
                selected={consultation.systemicExamination}
                onToggle={(item) =>
                  toggleArrayItem(
                    consultation.systemicExamination,
                    item,
                    setConsultation
                  )
                }
              />
                {/* Investigations Section */} {" "}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                 {" "}
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Upload Reports  {" "}
                </h3>
                 {" "}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                   {" "}
                  {["X-Ray", "Ultrasound", "Discharge Summary"].map((type) => (
                    <div
                      key={type}
                      className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors cursor-pointer"
                    >
                       {" "}
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" /> {" "}
                      <p className="text-sm text-gray-600 mb-1">
                        Upload {type}
                      </p>
                        <p className="text-xs text-gray-500">PDF, Images</p> {" "}
                    </div>
                  ))}
                   {" "}
                </div>
                 {" "}
              </div>
               {" "}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                 {" "}
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Diagnosis & Notes  {" "}
                </h3>
                 {" "}
                <div className="space-y-4">
                   {" "}
                  <input
                    type="text"
                    placeholder="Primary Diagnosis"
                    value={consultation.diagnosis}
                    onChange={(e) =>
                      setConsultation((prev) => ({
                        ...prev,
                        diagnosis: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                   {" "}
                  <textarea
                    rows={4}
                    placeholder="Additional notes and observations..."
                    value={consultation.notes}
                    onChange={(e) =>
                      setConsultation((prev) => ({
                        ...prev,
                        notes: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                   {" "}
                </div>
                 {" "}
              </div>
               {" "}
            </div>
              {/* Right Column */} {" "}
            <div className="w-full lg:w-1/3">
                {/* Vitals Section */} {" "}
              <div className="sticky top-6 bg-white rounded-lg border border-gray-200 p-6">
                 {" "}
                <h3 className="text-lg font-semibold text-gray-900 mb-6">
                    Current Vitals  {" "}
                </h3>
                 {" "}
                <div className="grid grid-cols-2 gap-y-6 gap-x-2">
                   {" "}
                  {vitals ? (
                    <>
                      {Object.entries({
                        "Blood Pressure": vitals.bloodPressure,
                        Pulse: `${vitals.pulse} bpm`,
                        Temperature: `${vitals.temperature}°F`,
                        "SPO₂": `${vitals.spo2}%`,
                        Weight: `${vitals.weight} kg`,
                        Height: `${vitals.height} cm`,
                      }).map(([key, value]) => (
                        <div key={key} className="text-center">
                            <p className="text-sm text-gray-600 mb-1">{key}</p> {" "}
                          <p className="text-xl font-bold text-gray-900">
                            {value}
                          </p>
                           {" "}
                        </div>
                      ))}
                    </>
                  ) : (
                    <div className="col-span-2 text-center text-gray-500">
                      No vitals recorded yet.
                    </div>
                  )}
                   {" "}
                </div>
                 {" "}
              </div>
               {" "}
            </div>
             {" "}
          </div>
        )}
         {" "}
        {activeTab === "prescriptions" && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
             {" "}
            <div className="flex items-center justify-between mb-6">
               {" "}
              <h3 className="text-lg font-semibold text-gray-900">
                  Create Prescription  {" "}
              </h3>
               {" "}
              <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <ChevronRight className="w-4 h-4" /> {" "}
                <span>Continue to Prescription</span> {" "}
              </button>
               {" "}
            </div>
             {" "}
            <div className="text-center py-8">
                <Pill className="w-12 h-12 text-gray-400 mx-auto mb-3" /> {" "}
              <p className="text-gray-600">
                  Complete examination to proceed with prescription  {" "}
              </p>
               {" "}
            </div>
             {" "}
          </div>
        )}
         {" "}
        {activeTab === "ai-assist" && selectedPatient && (
          <AIAssistTab
            consultation={consultation}
            selectedPatient={selectedPatient}
          />
        )}
         {" "}
        <div className="flex items-center justify-between mt-8 p-6 bg-white rounded-lg border border-gray-200">
           {" "}
          <div className="flex items-center space-x-4">
             {" "}
            <button className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                Save Draft  {" "}
            </button>
             {" "}
            <button className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <span>Complete Consultation</span>
                <ChevronRight className="w-4 h-4" /> {" "}
            </button>
             {" "}
          </div>
           {" "}
        </div>
         {" "}
      </div>
       {" "}
    </div>
  );
};