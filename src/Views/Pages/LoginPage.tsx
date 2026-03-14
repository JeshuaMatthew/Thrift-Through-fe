import React from "react";
import LoginForm from "../Components/LoginForm";
import vidsrc from "../../Assets/Loginpage/loginpage-vid.webm";

const LoginPage: React.FC = () => {
  return (
    <div className="flex w-full min-h-screen mb-5 justify-center text-tx-primary font-questrial overflow-hidden relative">
      <div className="hidden md:flex flex-col flex-1 justify-center items-center z-10 p-12 relative overflow-hidden group">
        <div className="absolute inset-0 z-0 bg-black">
          <video
            src={vidsrc}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover opacity-90 grayscale transition-all duration-700 ease-in-out group-hover:grayscale-0"
          />
          <div className="absolute inset-0 bg-black/40 mix-blend-multiply"></div>
        </div>

        <div className="max-w-lg text-left relative z-10 p-8 mt-auto mb-auto">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-gasoek text-white leading-0 drop-shadow-lg mb-6">
            Kurangi E-waste
            <span className="text-bg-fresh text-4xl md:text-5xl lg:text-6xl">
              {" "}
              Bersama Kami.
            </span>
          </h1>
          <p className="text-xl text-white/90 leading-relaxed drop-shadow-sm font-questrial">
            Daripada dibuang dan menjadi limbah elektronik, jual atau tukarkan
            gadget bekasmu bersama kami. Beri kesempatan kedua untuk barang yang
            masih berharga, sekaligus wujudkan harapan untuk bumi yang lebih
            bersih.
          </p>
        </div>
      </div>

      {/* Right side: Login Form */}
      <div className="flex-1 flex flex-col justify-center items-center z-10 p-6 sm:p-12 relative bg-bg-vermillion">
        <LoginForm />
      </div>
    </div>
  );
};

export default LoginPage;
