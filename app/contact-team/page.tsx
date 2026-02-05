"use client";

import React, { useState, useRef } from "react";
import { 
  Mail, Twitter, Github, CheckCircle2, Send, Info, X, 
  MessageSquare, Upload, FileText, Trash2 
} from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * TYPES & INTERFACES
 */
interface ContactFormState {
  name: string;
  email: string;
  message: string;
}

interface InputGroupProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "email" | "password";
}

/**
 * COMPONENT: ContactPage
 */
export default function ContactTeamPage() {
  const [form, setForm] = useState<ContactFormState>({ name: "", email: "", message: "" });
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);
    // Simulation of a signal transmission
    setTimeout(() => {
      console.log("Transmission Received:", { ...form, fileName: file?.name });
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#050505] text-slate-900 dark:text-white transition-colors duration-500 py-20 px-6 relative overflow-hidden">
      {/* Background Neural Glow */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-orange-600/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-2xl mx-auto relative z-10">
        <header className="mb-12 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-600/10 border border-orange-600/20 text-orange-600 text-xs font-black uppercase tracking-widest mb-4">
            <MessageSquare size={14} /> Neural Support
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-4">
            Connect with <span className="text-orange-600">RunAsh.</span>
          </h1>
          <p className="text-lg text-slate-500 dark:text-gray-400">
            Submit technical logs for research or apply to join our lab.
          </p>
        </header>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-[2rem] p-8 shadow-2xl shadow-black/[0.02] space-y-5">
            
            {/* Name & Email Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <InputGroup 
                label="Name" 
                placeholder="Nikola Tesla" 
                value={form.name} 
                onChange={(v: string) => setForm({ ...form, name: v })} 
              />
              <InputGroup 
                label="Email" 
                placeholder="research@runash.ai" 
                type="email" 
                value={form.email} 
                onChange={(v: string) => setForm({ ...form, email: v })} 
              />
            </div>
            
            {/* Message Area */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-gray-500 ml-1">Message</label>
              <textarea
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-black/40 focus:ring-2 focus:ring-orange-600/20 focus:border-orange-600 outline-none transition-all h-32 resize-none"
                placeholder="How can we help you build the future?"
                required
                value={form.message}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setForm({ ...form, message: e.target.value })}
              />
            </div>

            {/* Neural File Uploader */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-gray-500 ml-1">Attachments (Logs / Resume)</label>
              <div
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "relative group cursor-pointer border-2 border-dashed rounded-2xl p-6 transition-all flex flex-col items-center justify-center text-center",
                  isDragging 
                    ? "border-orange-600 bg-orange-600/5 scale-[0.99]" 
                    : "border-slate-200 dark:border-white/10 bg-white dark:bg-black/20 hover:border-orange-600/50"
                )}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  className="hidden" 
                  accept=".pdf,.log,.txt,.docx" 
                />
                
                {file ? (
                  <div className="flex items-center gap-4 w-full animate-in fade-in slide-in-from-bottom-2">
                    <div className="p-3 bg-orange-600/10 rounded-xl text-orange-600">
                      <FileText size={24} />
                    </div>
                    <div className="text-left flex-grow truncate">
                      <p className="text-sm font-bold truncate">{file.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono uppercase tracking-tighter">
                        {(file.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                    <button 
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setFile(null); }}
                      className="p-2 hover:bg-red-500/10 text-slate-400 hover:text-red-500 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="py-2">
                    <div className="mb-3 p-3 bg-slate-100 dark:bg-white/5 rounded-full text-slate-400 group-hover:text-orange-600 w-fit mx-auto transition-colors">
                      <Upload size={20} />
                    </div>
                    <p className="text-sm font-medium text-slate-600 dark:text-gray-300">
                      Drag and drop or <span className="text-orange-600">browse files</span>
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-tighter">PDF, LOG, TXT (MAX 10MB)</p>
                  </div>
                )}
              </div>
            </div>

            {/* Action Button */}
            <button
              className={cn(
                "w-full py-4 rounded-xl font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 shadow-xl",
                submitted 
                  ? "bg-green-600 text-white cursor-default" 
                  : "bg-slate-900 dark:bg-white text-white dark:text-black hover:bg-orange-600 dark:hover:bg-orange-600 dark:hover:text-white shadow-orange-600/10"
              )}
              type="submit"
              disabled={submitted}
            >
              {submitted ? (
                <><CheckCircle2 size={18} /> Transmission Successful</>
              ) : (
                <><Send size={16} /> Send Signal</>
              )}
            </button>
          </div>
        </form>

        {/* Channels & Support */}
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="rounded-full px-6 border-slate-200 dark:border-white/10 font-bold hover:border-orange-600/50">
                Direct Channels
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-4 rounded-2xl border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c0c0e] shadow-2xl">
              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-orange-600">Lab Egress</p>
                <div className="space-y-2">
                  <ContactLink icon={<Mail size={14} />} label="hello@runash.in" href="mailto:hello@runash.in" />
                  <ContactLink icon={<Twitter size={14} />} label="@runash_ai" href="https://twitter.com/runash_ai" />
                  <ContactLink icon={<Github size={14} />} label="runash-ai" href="https://github.com/runash-ai" />
                </div>
              </div>
            </PopoverContent>
          </Popover>
          <Button 
            onClick={() => setModalOpen(true)} 
            className="rounded-full px-6 bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-white border-none font-bold hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
          >
            <Info size={16} className="mr-2" /> Support Context
          </Button>
        </div>
      </div>

      {/* Support Modal Overlay */}
      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
          <div 
            className="absolute inset-0 bg-white/80 dark:bg-black/80 backdrop-blur-sm animate-in fade-in" 
            onClick={() => setModalOpen(false)} 
          />
          <div className="relative w-full max-w-lg rounded-[2.5rem] bg-white dark:bg-[#0c0c0e] p-10 shadow-2xl border border-slate-200 dark:border-white/10 animate-in zoom-in duration-300">
            <button 
              onClick={() => setModalOpen(false)} 
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
            >
              <X size={20} className="text-slate-400" />
            </button>
            <h2 className="text-2xl font-black mb-4 tracking-tighter">Support Inquiries</h2>
            <p className="text-slate-500 dark:text-gray-400 mb-6 leading-relaxed">
              For billing, enterprise deployment, or neural engine keys, please contact our priority channel.
            </p>
            <a href="mailto:hi@runash.in" className="text-xl font-bold text-orange-600 hover:underline">
              hi@runash.in
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * HELPER COMPONENT: InputGroup
 */
function InputGroup({ label, placeholder, value, onChange, type = "text" }: InputGroupProps) {
  return (
    <div className="space-y-2 text-left">
      <label className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-gray-500 ml-1">
        {label}
      </label>
      <input
        type={type}
        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-black/40 focus:ring-2 focus:ring-orange-600/20 focus:border-orange-600 outline-none transition-all"
        placeholder={placeholder}
        required
        value={value}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
      />
    </div>
  );
}

/**
 * HELPER COMPONENT: ContactLink
 */
function ContactLink({ icon, label, href }: { icon: React.ReactNode, label: string, href: string }) {
  return (
    <a 
      href={href} 
      target="_blank" 
      rel="noreferrer"
      className="flex items-center gap-3 text-sm text-slate-600 dark:text-gray-300 hover:text-orange-600 transition-colors group"
    >
      <span className="p-2 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 group-hover:border-orange-600/30 transition-all">
        {icon}
      </span>
      {label}
    </a>
  );
  }
