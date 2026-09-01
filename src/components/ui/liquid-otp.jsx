import React, { useState, useRef } from "react";
import { ShieldCheck } from "lucide-react";

export default function LiquidOTPInput() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef([]);

  const handleChange = (index, e) => {
    const value = e.target.value;
    if (isNaN(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    if (value && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0 && inputRefs.current[index - 1]) {
      inputRefs.current[index - 1].focus();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 rounded-3xl border border-white/10 bg-black/60 backdrop-blur-2xl shadow-2xl relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
      
      <div className="relative z-10 flex flex-col items-center space-y-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]">
          <ShieldCheck className="w-8 h-8 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
        </div>
        
        <div className="text-center space-y-2">
          <h3 className="text-xl font-semibold text-white tracking-tight">Otentikasi Sistem</h3>
          <p className="text-sm text-zinc-400">Masukkan kode akses untuk membuka portofolio</p>
        </div>

        <div className="flex gap-3">
          {otp.map((data, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              name="otp"
              maxLength="1"
              value={data}
              onChange={(e) => handleChange(index, e)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold text-white bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/30 focus:bg-white/10 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)] backdrop-blur-md"
            />
          ))}
        </div>

        <button className="relative overflow-hidden rounded-full border border-white/20 bg-white/10 px-8 py-3 text-sm font-semibold text-white backdrop-blur-md transition-all hover:bg-white/20 hover:scale-105 active:scale-95 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]" style={{ filter: "url(#container-glass)" }}>
          <span className="relative z-10">Verifikasi Kode</span>
        </button>
      </div>
    </div>
  );
}
