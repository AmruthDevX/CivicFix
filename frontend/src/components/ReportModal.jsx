import React, { useState } from 'react';
import { Camera, X, CheckCircle, MapPin, ScanText, AlertTriangle } from 'lucide-react';
import { submitReport } from '../api';
import { verifyIncidentReport } from '../lib/ai';

export default function ReportModal({ onClose, onSuccess, initialLoc }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    category: 'pothole',
    description: '',
    lat: initialLoc?.lat || 40.7128,
    lng: initialLoc?.lng || -74.0060,
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [ticketData, setTicketData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAiChecking, setIsAiChecking] = useState(false);
  const [aiRejectionReason, setAiRejectionReason] = useState(null);

  const handleNext = () => setStep(s => s + 1);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setIsAiChecking(true);
    setAiRejectionReason(null);
    try {
      if (imageFiles.length > 0) {
        try {
          const aiResult = await verifyIncidentReport(imageFiles[0], formData);
          if (aiResult.recommended_action === "dismiss") {
             setAiRejectionReason(aiResult.human_readable_summary);
             setIsSubmitting(false);
             setIsAiChecking(false);
             return;
          }
          // Optionally append the AI decision to the description so it's logged
          formData.description = `${formData.description}\n\n[AI Triage]: ${aiResult.human_readable_summary}\nAction: ${aiResult.recommended_action}`;
        } catch (aiErr) {
          console.warn("AI check failed, skipping", aiErr);
        }
      }
      setIsAiChecking(false);

      const data = new FormData();
      Object.keys(formData).forEach(k => data.append(k, formData[k]));
      imageFiles.forEach(f => data.append('images', f));

      const res = await submitReport(data);
      setTicketData(res.data);
      setStep(4); // Success step
    } catch (e) {
      console.error(e);
      alert('Error submitting report: ' + e.message);
    } finally {
      setIsSubmitting(false);
      setIsAiChecking(false);
    }
  };

  return (
    <div className="absolute inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-slide-up">
      <div className="bg-white w-full sm:w-full max-w-md rounded-t-[2.5rem] sm:rounded-3xl flex flex-col max-h-[90vh] shadow-[0_-20px_60px_rgba(0,0,0,0.15)]">
        <div className="flex justify-between items-center p-6 border-b border-slate-100">
           <h2 className="text-xl font-extrabold tracking-tight">Report an Issue</h2>
           <button onClick={onClose} className="p-2.5 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors">
             <X size={20} />
           </button>
        </div>
        
        <div className="p-6 overflow-y-auto w-full">
          {step === 1 && (
            <div className="flex flex-col gap-4">
              <h3 className="font-semibold text-lg">Step 1: Confirm Location</h3>
              <div className="bg-slate-100 p-4 rounded-xl flex items-center gap-3 text-slate-600">
                <MapPin className="text-blue-600" />
                <span className="text-sm font-medium">Using Current Location</span>
              </div>
              <p className="text-xs text-slate-500">For this demo, location is set to your geolocated or default position.</p>
              <button onClick={handleNext} className="mt-4 w-full bg-blue-600 text-white rounded-xl py-3 font-semibold text-lg hover:bg-blue-700">Next</button>
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-4 w-full">
              <h3 className="font-semibold text-lg">Step 2: Details</h3>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-slate-700">Category</label>
                <select 
                  className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:outline-none focus:border-blue-500"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                >
                  <option value="pothole">Pothole</option>
                  <option value="light">Broken Streetlight</option>
                  <option value="sidewalk">Sidewalk Damage</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="flex flex-col gap-2 w-full">
                <label className="text-sm font-bold text-slate-700">Description</label>
                <textarea 
                  rows="3"
                  className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:outline-none focus:border-blue-500 resize-none"
                  placeholder="Describe the issue..."
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                ></textarea>
              </div>
              <div className="flex gap-3 mt-4">
                <button onClick={() => setStep(1)} className="flex-1 bg-slate-100 text-slate-700 rounded-xl py-3 font-semibold hover:bg-slate-200">Back</button>
                <button 
                  onClick={handleNext} 
                  disabled={!formData.description}
                  className="flex-1 bg-blue-600 text-white rounded-xl py-3 font-semibold hover:bg-blue-700 disabled:opacity-50"
                >Next</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col gap-4">
              <h3 className="font-semibold text-lg">Step 3: Photos</h3>
              <p className="text-sm text-slate-500">Take a close, unobstructed photo and include surrounding context.</p>
              
              <div className="grid grid-cols-2 gap-3">
                {imageFiles.map((file, i) => (
                  <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200">
                    <img src={URL.createObjectURL(file)} alt="preview" className="w-full h-full object-cover" />
                    <button 
                      onClick={() => setImageFiles(imageFiles.filter((_, idx) => idx !== i))}
                      className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
                {imageFiles.length < 3 && (
                  <label className="border-2 border-dashed border-slate-300 rounded-xl aspect-square flex flex-col items-center justify-center text-slate-400 hover:text-blue-500 hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition-colors">
                    <Camera size={32} className="mb-2" />
                    <span className="text-xs font-semibold">Add Photo</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      multiple
                      onChange={(e) => {
                        if (e.target.files) {
                           setImageFiles([...imageFiles, ...Array.from(e.target.files)].slice(0, 3));
                        }
                      }}
                    />
                  </label>
                )}
              </div>

              <div className="flex gap-3 mt-4">
                 <button onClick={() => setStep(2)} className="flex-1 bg-slate-100 text-slate-700 rounded-xl py-3 font-semibold hover:bg-slate-200" disabled={isSubmitting}>Back</button>
                 <button 
                   onClick={handleSubmit} 
                   disabled={isSubmitting || imageFiles.length === 0}
                   className="flex-[2] bg-blue-600 text-white rounded-xl py-3 font-semibold hover:bg-blue-700 flex justify-center items-center gap-2 transition-all disabled:opacity-50"
                 >
                   {isSubmitting ? (isAiChecking ? 'AI Verifying...' : 'Submitting...') : 'Submit Report'}
                 </button>
              </div>
              {aiRejectionReason && (
                 <div className="mt-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex gap-3 animate-slide-up">
                    <AlertTriangle size={20} className="shrink-0 mt-0.5 line-height-none" />
                    <div>
                      <p className="font-bold mb-1">AI Triage Request Denied</p>
                      <p>{aiRejectionReason}</p>
                    </div>
                 </div>
              )}
            </div>
          )}

          {step === 4 && ticketData && (
             <div className="flex flex-col items-center gap-4 text-center py-6">
                <div className="w-20 h-20 bg-green-100 text-green-500 flex items-center justify-center rounded-full mb-2">
                  <CheckCircle size={40} />
                </div>
                <h3 className="text-2xl font-bold">Report Submitted!</h3>
                <p className="text-slate-600 text-sm">Thank you for improving your community.</p>
                <div className="bg-slate-100 w-full p-4 rounded-xl my-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Your Ticket ID</span>
                  <span className="text-xl font-mono font-bold text-blue-600 tracking-widest">{ticketData.ticket_id}</span>
                </div>
                <button 
                  onClick={onSuccess} 
                  className="w-full bg-blue-600 text-white rounded-xl py-3 font-semibold hover:bg-blue-700 text-lg"
                >
                  Done
                </button>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
