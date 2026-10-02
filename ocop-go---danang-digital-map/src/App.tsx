import React, { useEffect, useState } from 'react';
import { 
  Map as MapIcon, 
  MapPin,
  Users, 
  User,
  TrendingUp, 
  Handshake, 
  Navigation, 
  Building, 
  Landmark,
  ArrowRight, 
  BarChart3,
  Store,
  Compass,
  ExternalLink,
  Calendar,
  ShoppingCart,
  Star,
  QrCode,
  Crown,
  Megaphone,
  ShieldCheck,
  Database,
  Check,
  Mountain
} from 'lucide-react';

const NAV_LINKS = [
  { id: 'problem', label: 'Vấn đề' },
  { id: 'solution', label: 'Giải pháp' },
  { id: 'demo', label: 'Demo' },
  { id: 'layers', label: 'Business Model' },
  { id: 'business', label: 'Hợp tác' },
  { id: 'impact', label: 'Tác động' },
];

function Navbar() {
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    const sections = NAV_LINKS
      .map(({ id }) => document.getElementById(id))
      .filter((element): element is HTMLElement => element !== null);

    const observer = new IntersectionObserver(
      (entries) => {
        const activeEntry = entries.find((entry) => entry.isIntersecting);
        if (activeEntry) {
          setActiveId(activeEntry.target.id);
        }
      },
      { rootMargin: '-40% 0px -55% 0px', threshold: 0 }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center">
            <MapIcon className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-900">OCOP GO</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-base font-medium text-slate-600">
          {NAV_LINKS.map(({ id, label }) => (
            <a
              key={id}
              href={`#${id}`}
              className={`transition-colors ${
                activeId === id ? 'text-teal-600 font-semibold' : 'hover:text-teal-600'
              }`}
            >
              {label}
            </a>
          ))}
        </div>
        <a
          href="https://docs.google.com/forms/d/e/1FAIpQLSdSEqbaTZ4MV0og4YYpxO7o_x2VWrv0Y7GvHCbpXN-pRkMJNw/viewform"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-slate-900 text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-slate-800 transition-colors"
        >
          Trở thành Đối tác
        </a>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <section className="relative pt-40 pb-32 md:pt-52 md:pb-40 overflow-hidden bg-slate-900">
      {/* Background Image Banner */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/Hero Image.png" 
          alt="OCOP GO Platform Banner" 
          className="w-full h-full object-cover"
        />
        {/* Dark Gradient Overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-slate-900/60 to-slate-900/95 backdrop-blur-[2px]"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-12 max-w-4xl mx-auto leading-[1.1] drop-shadow-xl">
          Bản đồ số và nền tảng hệ sinh thái địa phương.
        </h1>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a href="/map/" className="w-full sm:w-auto px-8 py-4 bg-teal-500 text-white rounded-full font-semibold hover:bg-teal-400 hover:scale-105 transition-all flex items-center justify-center gap-2 shadow-lg shadow-teal-900/50">
            KHÁM PHÁ NỀN TẢNG
            <ArrowRight className="w-4 h-4" />
          </a>
          <a href="https://docs.google.com/forms/d/e/1FAIpQLSdSEqbaTZ4MV0og4YYpxO7o_x2VWrv0Y7GvHCbpXN-pRkMJNw/viewform" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto px-8 py-4 bg-white/10 text-white border border-white/20 backdrop-blur-md rounded-full font-semibold hover:bg-white/20 transition-all flex items-center justify-center gap-2">
            TRỞ THÀNH ĐỐI TÁC
          </a>
        </div>
      </div>
    </section>
  );
}

function Problem() {
  const problems = [
    {
      target: 'Cơ quan quản lý',
      headline: 'Thiếu dữ liệu để quản lý hiệu quả',
      desc: 'Dữ liệu hiện có chưa phản ánh đầy đủ hoạt động, thị trường và nhu cầu hỗ trợ của từng doanh nghiệp.',
      colorClass: 'bg-indigo-50/60 border-indigo-100 hover:border-indigo-300',
      titleColor: 'text-indigo-950',
      badgeColor: 'bg-indigo-100 text-indigo-700 border-indigo-200'
    },
    {
      target: 'Doanh nghiệp địa phương',
      headline: 'Có sản phẩm nhưng khó tiếp cận thị trường',
      desc: 'Sản phẩm địa phương có tiềm năng nhưng thiếu kênh kết nối hiệu quả với khách hàng, đặc biệt là khách du lịch.',
      colorClass: 'bg-emerald-50/60 border-emerald-100 hover:border-emerald-300',
      titleColor: 'text-emerald-950',
      badgeColor: 'bg-emerald-100 text-emerald-700 border-emerald-200'
    },
    {
      target: 'Du khách',
      headline: 'Khó khám phá sản phẩm địa phương',
      desc: 'Thông tin về sản phẩm, dịch vụ và trải nghiệm địa phương còn phân tán và chưa được kết nối với hành trình.',
      colorClass: 'bg-amber-50/60 border-amber-100 hover:border-amber-300',
      titleColor: 'text-amber-950',
      badgeColor: 'bg-amber-100 text-amber-700 border-amber-200'
    }
  ];

  return (
    <section id="problem" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <h2 className="text-xl font-bold tracking-normal text-slate-400 uppercase mb-8">VẤN ĐỀ</h2>
        <blockquote className="text-4xl md:text-5xl font-black text-slate-900 leading-normal mb-16 tracking-normal">
          "Sản phẩm địa phương ở khắp mọi nơi.<br />
          <span className="text-slate-400">Nhưng sự kết nối đang bị phân mảnh."</span>
        </blockquote>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          {problems.map((item, idx) => (
            <div key={idx} className={`rounded-3xl p-10 border transition-all hover:shadow-xl ${item.colorClass}`}>
              <div className={`inline-block px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-6 border ${item.badgeColor}`}>
                {item.target}
              </div>
              <h3 className={`text-xl font-bold mb-4 ${item.titleColor}`}>
                {item.headline}
              </h3>
              <p className="text-slate-600 leading-relaxed text-base">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Solution() {
  const stakeholders = [
    {
      icon: Landmark,
      title: 'Cơ quan quản lý',
      desc: 'Minh bạch dữ liệu'
    },
    {
      icon: Store,
      title: 'Doanh nghiệp',
      desc: 'Tăng cơ hội kinh doanh'
    },
    {
      icon: User,
      title: 'Du khách',
      desc: 'Trải nghiệm trọn vẹn'
    },
    {
      icon: Users,
      title: 'Cộng đồng',
      desc: 'Phát triển bền vững'
    }
  ];

  const leftFlowCards = [
    {
      num: '01',
      title: 'Dữ liệu',
      desc: 'Thông tin doanh nghiệp, sản phẩm, địa điểm và thông tin OCOP được số hóa.',
      icon: Database,
      circleBg: 'bg-teal-500 shadow-teal-500/30',
      textColor: 'text-teal-500'
    },
    {
      num: '02',
      title: 'Khám phá',
      desc: 'Khách hàng tìm thấy sản phẩm, doanh nghiệp, địa điểm và trải nghiệm phù hợp.',
      icon: MapPin,
      circleBg: 'bg-violet-500 shadow-violet-500/30',
      textColor: 'text-violet-500'
    },
    {
      num: '03',
      title: 'Lập kế hoạch',
      desc: 'Người dùng đưa những điểm quan tâm vào itinerary để lên kế hoạch trải nghiệm.',
      icon: Calendar,
      circleBg: 'bg-emerald-500 shadow-emerald-500/30',
      textColor: 'text-emerald-500'
    }
  ];

  const rightFlowCards = [
    {
      num: '04',
      title: 'Trải nghiệm',
      desc: 'Nền tảng biến khám phá trực tuyến thành lưu lượng khách hàng thực tế.',
      icon: Navigation,
      circleBg: 'bg-amber-400 shadow-amber-400/30',
      textColor: 'text-amber-500'
    },
    {
      num: '05',
      title: 'Thương mại',
      desc: 'Thúc đẩy giao dịch mua sắm tại điểm bán và trực tuyến.',
      icon: ShoppingCart,
      circleBg: 'bg-rose-400 shadow-rose-400/30',
      textColor: 'text-rose-500'
    },
    {
      num: '06',
      title: 'Phân tích',
      desc: 'Hệ thống thu thập, phân tích và trả về dữ liệu giá trị.',
      icon: BarChart3,
      circleBg: 'bg-indigo-500 shadow-indigo-500/30',
      textColor: 'text-indigo-500'
    }
  ];

  const loopSteps = [
    { label: 'Dữ liệu', icon: Database, circleBg: 'bg-teal-500 shadow-teal-500/30' },
    { label: 'Khám phá', icon: MapPin, circleBg: 'bg-violet-500 shadow-violet-500/30' },
    { label: 'Trải nghiệm', icon: Star, circleBg: 'bg-amber-400 shadow-amber-400/30' },
    { label: 'Thương mại', icon: ShoppingCart, circleBg: 'bg-rose-400 shadow-rose-400/30' },
    { label: 'Phân tích', icon: BarChart3, circleBg: 'bg-indigo-500 shadow-indigo-500/30' }
  ];

  return (
    <section id="solution" className="py-24 md:py-32 bg-gradient-to-b from-[#F2FBF9] via-[#EBF8F5] to-[#F4FBF9] text-slate-900 overflow-hidden border-t border-teal-100/60">
      <div className="max-w-[1440px] mx-auto px-6">
        
        {/* Tầng 1 — Header 2 cột cân xứng: Một nền tảng. Đa kết nối. + 4 đối tượng thụ hưởng */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center mb-24">
          <div className="lg:col-span-5 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <span className="w-6 h-[1.5px] bg-teal-500"></span>
              <h2 className="text-xs font-bold tracking-widest text-teal-600 uppercase">
                GIẢI PHÁP CỦA CHÚNG TÔI
              </h2>
              <span className="w-6 h-[1.5px] bg-teal-500"></span>
            </div>
            <h3 className="text-4xl md:text-5xl lg:text-[56px] font-black text-slate-900 tracking-normal leading-[1.12] uppercase">
              Một nền tảng.<br />
              <span className="text-teal-600">Đa kết nối.</span>
            </h3>
          </div>

          <div className="lg:col-span-7">
            <div className="bg-white/95 backdrop-blur-md rounded-[2.25rem] p-6 md:p-8 shadow-xl shadow-teal-900/5 border border-white">
              <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
                {stakeholders.map((item, idx) => (
                  <div key={idx} className="px-4 py-3 sm:py-1 flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-2xl bg-teal-50/80 text-teal-600 flex items-center justify-center mb-3">
                      <item.icon className="w-6 h-6 stroke-[1.75]" />
                    </div>
                    <h4 className="text-sm md:text-base font-bold text-slate-900 mb-1">
                      {item.title}
                    </h4>
                    <p className="text-xs text-slate-500 leading-snug">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tầng 2 — 3 Cột đồng bộ chiều cao (01-03, OCOP GO Demo mở rộng ở giữa, 04-06) */}
        <div id="demo" className="mb-28 scroll-mt-24 w-screen relative left-1/2 -translate-x-1/2 max-w-[1920px] px-4 md:px-6 xl:px-10">
          <div className="flex flex-col xl:flex-row gap-6 lg:gap-6 items-stretch">
            
            {/* Cột Trái — 01 Dữ liệu, 02 Khám phá, 03 Lập kế hoạch */}
            <div className="w-full xl:w-[260px] 2xl:w-[290px] shrink-0 order-2 xl:order-1 grid grid-cols-1 md:grid-cols-3 xl:grid-cols-1 gap-5">
              {leftFlowCards.map((card) => (
                <div
                  key={card.num}
                  className="bg-white/95 backdrop-blur-sm rounded-3xl p-6 shadow-lg shadow-teal-950/5 border border-white hover:border-teal-200 hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-center"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-full ${card.circleBg} text-white flex items-center justify-center shadow-lg shrink-0`}>
                      <card.icon className="w-5 h-5" />
                    </div>
                    <span className={`text-lg font-bold leading-none pt-1 ${card.textColor}`}>
                      {card.num}
                    </span>
                  </div>
                  <h5 className={`text-lg font-bold mb-2 ${card.textColor}`}>
                    {card.title}
                  </h5>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    {card.desc}
                  </p>
                </div>
              ))}
            </div>

            {/* Cột Giữa — Giao diện bản đồ OCOP GO DEMO (Mở rộng chiều ngang tương đương ảnh Business Model) */}
            <div className="flex-1 min-w-0 order-1 xl:order-2 flex flex-col">
              {/* Browser / Map Mockup container */}
              <div className="rounded-3xl overflow-hidden border border-slate-200 shadow-2xl shadow-teal-950/10 bg-white flex flex-col h-full min-h-[460px] lg:min-h-[580px] w-full">
                {/* Browser Header */}
                <div className="bg-slate-50 border-b border-slate-200 px-4 py-3.5 flex items-center justify-between shrink-0">
                  <div className="flex gap-1.5 w-20">
                    <div className="w-3 h-3 rounded-full bg-slate-300"></div>
                    <div className="w-3 h-3 rounded-full bg-slate-300"></div>
                    <div className="w-3 h-3 rounded-full bg-slate-300"></div>
                  </div>
                  <div className="mx-auto bg-white rounded-md px-4 py-1.5 text-xs text-slate-500 font-mono flex items-center justify-center gap-2 w-1/2 max-w-sm border border-slate-200 shadow-sm">
                    <MapPin className="w-3 h-3 text-teal-500" /> goocop.vn/map/
                  </div>
                  <a
                    href="/map/"
                    className="flex items-center gap-1.5 bg-white text-teal-600 border border-teal-500 text-xs font-semibold px-3 py-2 rounded-lg hover:bg-teal-50 transition-colors whitespace-nowrap"
                  >
                    Mở trong OCOP GO
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
                {/* Embedded Map iframe */}
                <div className="w-full flex-1 aspect-square md:aspect-video xl:aspect-auto bg-slate-100 relative">
                  {(typeof window === 'undefined' || window.self === window.top) && (
                  <iframe 
                    src="/map/" 
                    title="OCOP GO Digital Map Demo"
                    width="100%" 
                    height="100%" 
                    style={{ border: 0 }} 
                    allowFullScreen={true} 
                    loading="lazy" 
                    referrerPolicy="no-referrer-when-downgrade"
                    className="absolute inset-0 w-full h-full"
                  ></iframe>
                  )}
                </div>
              </div>
            </div>

            {/* Cột Phải — 04 Trải nghiệm, 05 Thương mại, 06 Phân tích */}
            <div className="w-full xl:w-[260px] 2xl:w-[290px] shrink-0 order-3 grid grid-cols-1 md:grid-cols-3 xl:grid-cols-1 gap-5">
              {rightFlowCards.map((card) => (
                <div
                  key={card.num}
                  className="bg-white/95 backdrop-blur-sm rounded-3xl p-6 shadow-lg shadow-teal-950/5 border border-white hover:border-teal-200 hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-center"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-full ${card.circleBg} text-white flex items-center justify-center shadow-lg shrink-0`}>
                      <card.icon className="w-5 h-5" />
                    </div>
                    <span className={`text-lg font-bold leading-none pt-1 ${card.textColor}`}>
                      {card.num}
                    </span>
                  </div>
                  <h5 className={`text-lg font-bold mb-2 ${card.textColor}`}>
                    {card.title}
                  </h5>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    {card.desc}
                  </p>
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* Tầng 3 — HỆ SINH THÁI THÔNG MINH HƠN: Qua từng tương tác */}
        <div className="max-w-5xl mx-auto text-center pt-4">
          <div className="flex items-center justify-center gap-3 mb-3">
            <span className="w-10 h-[1.5px] bg-teal-400/70"></span>
            <h3 className="text-xs font-bold tracking-widest text-teal-600 uppercase">
              HỆ SINH THÁI THÔNG MINH HƠN
            </h3>
            <span className="w-10 h-[1.5px] bg-teal-400/70"></span>
          </div>

          <h4 className="text-3xl md:text-5xl font-black text-slate-900 mb-5 tracking-tight">
            Qua từng tương tác.
          </h4>

          <p className="text-slate-600 max-w-2xl mx-auto mb-14 text-base md:text-lg leading-relaxed">
            OCOP GO vận hành theo một vòng lặp khép kín: dữ liệu số hóa thúc đẩy khám phá, trải nghiệm và thương mại; mỗi tương tác lại tạo ra dữ liệu phân tích giúp hệ sinh thái ngày càng thông minh và hiệu quả hơn.
          </p>

          {/* 5 hình tròn chu trình khép kín */}
          <div className="relative max-w-4xl mx-auto">
            <div className="flex flex-wrap md:flex-nowrap items-center justify-center gap-4 md:gap-3 lg:gap-5 relative z-10">
              {loopSteps.map((step, index) => (
                <React.Fragment key={step.label}>
                  <div className="w-28 h-28 md:w-36 md:h-36 rounded-full bg-white shadow-xl shadow-teal-950/5 border border-teal-50 flex flex-col items-center justify-center gap-2.5 shrink-0 hover:-translate-y-1 transition-transform duration-300">
                    <div className={`w-12 h-12 md:w-14 md:h-14 rounded-full ${step.circleBg} text-white flex items-center justify-center shadow-md`}>
                      <step.icon className="w-5 h-5 md:w-6 md:h-6" />
                    </div>
                    <span className="text-xs md:text-sm font-bold text-slate-800">
                      {step.label}
                    </span>
                  </div>
                  {index < loopSteps.length - 1 && (
                    <ArrowRight className="w-5 h-5 text-violet-300 hidden md:block shrink-0" />
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* Đường vòng cung phản hồi bên dưới: Tạo giá trị bền vững */}
            <div className="hidden md:flex flex-col items-center mt-2 relative">
              <svg className="w-3/4 h-12 text-teal-400/70 overflow-visible" viewBox="0 0 600 50" fill="none">
                <path
                  d="M 560 5 C 560 42, 40 42, 40 5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  fill="none"
                />
                <polygon points="36,10 40,2 45,9" fill="currentColor" />
              </svg>
              <span className="-mt-6 px-4 py-1 bg-[#EFF9F7] text-teal-700 font-bold text-xs md:text-sm rounded-full">
                Tạo giá trị bền vững
              </span>
            </div>
            <div className="md:hidden mt-6">
              <span className="inline-block px-4 py-1.5 bg-white/80 border border-teal-200 text-teal-700 font-bold text-xs rounded-full shadow-sm">
                ↻ Tạo giá trị bền vững
              </span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}

function FiveLayerPlatform() {
  return (
    <section id="layers" className="py-24 bg-[#F8F9FA] border-y border-slate-200">
      <div className="max-w-[1440px] mx-auto px-6">
        <div className="text-center mb-16 max-w-4xl mx-auto">
          <h2 className="text-xs font-bold tracking-widest text-teal-700 uppercase mb-4">Mô hình cốt lõi</h2>
          <h3 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">BUSINESS MODEL</h3>
          <p className="text-lg md:text-xl text-slate-500 font-light leading-relaxed">
            OCOP GO lấy số hóa doanh nghiệp và dữ liệu địa phương làm nền tảng, từng bước mở rộng qua khám phá, lên kế hoạch, trải nghiệm và thương mại. Mỗi lớp vừa tạo thêm giá trị, vừa làm giàu dữ liệu cho lớp tiếp theo, đưa OCOP GO trở thành nền tảng kết nối và dữ liệu cho hệ sinh thái địa phương.
          </p>
        </div>
        
        <div className="w-full bg-white rounded-3xl p-4 shadow-xl border border-slate-200 overflow-hidden">
          <img 
            src="/5 OCOP.png" 
            alt="Mô hình 5 lớp của nền tảng OCOP GO" 
            className="w-full h-auto object-contain rounded-2xl"
          />
        </div>
      </div>
    </section>
  );
}

function BusinessModel() {
  const models = [
    {
      num: '01',
      title: 'Đối tác nội dung / Listing miễn phí',
      icon: Store,
      features: ['Hiển thị hồ sơ doanh nghiệp, sản phẩm, điểm bán', 'Tăng hiện diện số và độ phủ bản đồ', 'Cập nhật thông tin chính xác, xác thực'],
      border: 'border-t-slate-400',
      iconColor: 'text-slate-600',
      iconBg: 'bg-slate-100',
      checkColor: 'text-slate-500'
    },
    {
      num: '02',
      title: 'Hồ sơ doanh nghiệp cao cấp',
      badge: 'HOT',
      icon: Crown,
      features: ['Gian hàng nổi bật, nhiều ảnh/video', 'Catalogue, kể chuyện sản phẩm, mã QR động', 'Báo cáo: lượt xem, chỉ đường, mức độ quan tâm'],
      border: 'border-t-blue-500',
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-50',
      checkColor: 'text-blue-500'
    },
    {
      num: '03',
      title: 'Hợp tác chiến dịch Marketing',
      icon: Megaphone,
      features: ['Chiến dịch theo mùa, lễ hội, du lịch', 'Ưu tiên hiển thị, truyền thông, bài giới thiệu', 'Tăng nhận diện sản phẩm OCOP'],
      border: 'border-t-indigo-500',
      iconColor: 'text-indigo-600',
      iconBg: 'bg-indigo-50',
      checkColor: 'text-indigo-500'
    },
    {
      num: '04',
      title: 'Quét mã QR / Câu chuyện số',
      icon: QrCode,
      features: ['Mã QR tại điểm bán, hội chợ, bao bì', 'Truy xuất, xác thực, kể câu chuyện sản phẩm', 'Đo lường lượt quét và hành vi khách hàng'],
      border: 'border-t-teal-500',
      iconColor: 'text-teal-600',
      iconBg: 'bg-teal-50',
      checkColor: 'text-teal-500'
    },
    {
      num: '05',
      title: 'Trải nghiệm OCOP & Du lịch',
      icon: Mountain,
      features: ['Kết nối cơ sở sản xuất với tour và trải nghiệm', 'Tham quan, thử sản phẩm, workshop', 'Tăng giá trị địa phương & quà tặng du lịch'],
      border: 'border-t-emerald-500',
      iconColor: 'text-emerald-600',
      iconBg: 'bg-emerald-50',
      checkColor: 'text-emerald-500'
    },
    {
      num: '06',
      title: 'Hoa hồng & Chia sẻ doanh thu',
      icon: Handshake,
      features: ['Kết nối khách hàng thực tế', 'Theo dõi hành trình: từ bản đồ → QR → mua hàng', 'Doanh nghiệp chỉ trả phí khi có giao dịch.'],
      border: 'border-t-orange-500',
      iconColor: 'text-orange-600',
      iconBg: 'bg-orange-50',
      checkColor: 'text-orange-500'
    }
  ];

  return (
    <section id="business" className="py-24 bg-[#F8FAFC] border-y border-slate-200 overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-6">
        <div className="mb-12 max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="text-xs font-bold tracking-widest text-teal-700 uppercase">MÔ HÌNH HỢP TÁC</span>
          </div>
          <h3 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight leading-tight">
            Hệ sinh thái mở.<br />
           <span className="text-teal-700">Mô hình hợp tác đa tầng.</span>
          </h3>
          <p className="text-lg md:text-xl text-slate-500 font-light leading-relaxed">
            OCOP GO thiết kế hệ sinh thái theo hướng mở, cho phép doanh nghiệp tham gia với nhiều mức độ và hình thức khác nhau. Từ hiện diện và xây dựng hồ sơ số đến marketing, trải nghiệm và phân phối khách hàng, tạo điều kiện để doanh nghiệp mở rộng mức độ hiện diện, tiếp cận thị trường và chuyển hóa nhu cầu thành cơ hội kinh doanh.
          </p>
        </div>

        <div className="w-full pb-8 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
             {models.map((model, idx) => (
               <div key={idx} className={`bg-white rounded-2xl border-t-4 shadow-sm border-x border-b border-x-slate-100 border-b-slate-100 flex flex-col h-full ${model.border} relative hover:-translate-y-1 hover:shadow-lg transition-all duration-300`}>
                 <div className="p-5 flex-1">
                   <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${model.iconBg}`}>
                     <model.icon className={`w-6 h-6 ${model.iconColor}`} />
                   </div>
                   <div className="text-xs font-bold text-slate-400 mb-2">{model.num}</div>
                   <h4 className="text-lg font-bold text-slate-900 mb-4 leading-tight min-h-[44px]">
                     {model.title} {model.badge && <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.5 rounded-full uppercase ml-1 align-middle">{model.badge}</span>}
                   </h4>
                   <ul className="space-y-3 pb-2">
                     {model.features.map((f, i) => (
                       <li key={i} className="flex items-start text-xs text-slate-600">
                         <Check className={`w-4 h-4 mr-2 shrink-0 ${model.checkColor}`} />
                         <span className="leading-relaxed">{f}</span>
                       </li>
                     ))}
                   </ul>
                 </div>
               </div>
             ))}
          </div>
        </div>

        {/* Bottom Banner - GIÁ TRỊ DOANH NGHIỆP */}
        <div className="mt-8 bg-[#0a2724] rounded-2xl p-6 md:p-8 border border-teal-900 shadow-xl relative overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl"></div>
           
           <div className="flex flex-col xl:flex-row items-center gap-8 relative z-10">
              <div className="flex flex-col xl:w-1/3 w-full text-center xl:text-left">
                 <h5 className="text-teal-400 font-bold text-sm tracking-widest uppercase mb-2">GIÁ TRỊ DOANH NGHIỆP</h5>
                 <p className="text-white font-bold text-xl md:text-2xl leading-snug">Tăng nhận diện. Thêm khách hàng. Tăng trưởng mạnh mẽ.</p>
              </div>

              <div className="flex-1 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-6 xl:gap-4 w-full">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full border border-teal-600/50 flex items-center justify-center shrink-0 bg-teal-800/30 text-teal-300">
                       <Megaphone className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-bold leading-tight text-white uppercase tracking-wide">Tăng nhận diện<br/>thương hiệu</span>
                 </div>
                 
                 <div className="flex items-center gap-3 relative xl:before:content-[''] xl:before:absolute xl:before:-left-2 xl:before:top-1/2 xl:before:-translate-y-1/2 xl:before:w-px xl:before:h-8 xl:before:bg-teal-800/50">
                    <div className="w-10 h-10 rounded-full border border-teal-600/50 flex items-center justify-center shrink-0 bg-teal-800/30 text-teal-300">
                       <MapPin className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-bold leading-tight text-white uppercase tracking-wide">Tăng khách đến<br/>điểm bán</span>
                 </div>
                 
                 <div className="flex items-center gap-3 relative xl:before:content-[''] xl:before:absolute xl:before:-left-2 xl:before:top-1/2 xl:before:-translate-y-1/2 xl:before:w-px xl:before:h-8 xl:before:bg-teal-800/50">
                    <div className="w-10 h-10 rounded-full border border-teal-600/50 flex items-center justify-center shrink-0 bg-teal-800/30 text-teal-300">
                       <TrendingUp className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-bold leading-tight text-white uppercase tracking-wide">Tăng lead /<br/>đơn hàng</span>
                 </div>
                 
                 <div className="flex items-center gap-3 relative xl:before:content-[''] xl:before:absolute xl:before:-left-2 xl:before:top-1/2 xl:before:-translate-y-1/2 xl:before:w-px xl:before:h-8 xl:before:bg-teal-800/50">
                    <div className="w-10 h-10 rounded-full border border-teal-600/50 flex items-center justify-center shrink-0 bg-teal-800/30 text-teal-300">
                       <Database className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-bold leading-tight text-white uppercase tracking-wide">Có dữ liệu<br/>đo lường</span>
                 </div>
                 
                 <div className="flex items-center gap-3 relative xl:before:content-[''] xl:before:absolute xl:before:-left-2 xl:before:top-1/2 xl:before:-translate-y-1/2 xl:before:w-px xl:before:h-8 xl:before:bg-teal-800/50">
                    <div className="w-10 h-10 rounded-full border border-teal-600/50 flex items-center justify-center shrink-0 bg-teal-800/30 text-teal-300">
                       <ShieldCheck className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-bold leading-tight text-white uppercase tracking-wide">Tăng mức độ<br/>tin cậy</span>
                 </div>
              </div>
           </div>
        </div>

      </div>
    </section>
  );
}

function Impact() {
  const impacts = [
    { title: 'Cơ quan quản lý', subtitle: 'Government', desc: 'Chuyển đổi số sản phẩm địa phương, minh bạch hóa và quản lý hiệu quả.', icon: Building, color: 'text-indigo-400', bg: 'bg-indigo-400/10', border: 'border-indigo-500/20' },
    { title: 'Doanh nghiệp', subtitle: 'Business', desc: 'Tiếp cận trực tiếp dòng khách du lịch, tăng tỷ lệ chuyển đổi.', icon: Store, color: 'text-teal-400', bg: 'bg-teal-400/10', border: 'border-teal-500/20' },
    { title: 'Du khách', subtitle: 'Tourist', desc: 'Trải nghiệm du lịch đích thực, mượt mà và được cá nhân hóa.', icon: Compass, color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-500/20' },
    { title: 'Kinh tế địa phương', subtitle: 'Local Economy', desc: 'Giữ lại dòng tiền du lịch trong cộng đồng, thúc đẩy hệ sinh thái phát triển.', icon: TrendingUp, color: 'text-green-400', bg: 'bg-green-400/10', border: 'border-green-500/20' },
  ];

  return (
    <section id="impact" className="py-24 bg-slate-900 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] opacity-30 pointer-events-none">
         <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-emerald-500 blur-[120px] rounded-full"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-xs font-bold tracking-widest text-teal-400 uppercase mb-4">Giá trị cốt lõi</h2>
          <h3 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight">TÁC ĐỘNG ĐẾN HỆ SINH THÁI</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {impacts.map((item, i) => (
            <div key={i} className={`p-8 rounded-3xl bg-slate-800/40 border ${item.border} backdrop-blur-xl hover:-translate-y-2 hover:bg-slate-800/80 transition-all duration-300 shadow-xl`}>
              <div className={`w-14 h-14 rounded-2xl ${item.bg} ${item.color} flex items-center justify-center mb-6 shadow-inner`}>
                <item.icon className="w-7 h-7" />
              </div>
              <h4 className="text-xl font-bold text-white mb-1">{item.title}</h4>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">{item.subtitle}</p>
              <p className="text-slate-300 leading-relaxed text-base">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PartnerWithUs() {
  return (
    <section id="partner" className="py-32 bg-teal-600 text-white text-center">
      <div className="max-w-3xl mx-auto px-6">
        <h2 className="text-4xl md:text-5xl font-black mb-8 tracking-tight">HỢP TÁC VỚI CHÚNG TÔI</h2>
        <p className="text-xl md:text-2xl text-teal-100 mb-12 font-light leading-snug">
          "Hãy cùng nhau xây dựng<br />hệ sinh thái số địa phương."
        </p>
        <a
          href="https://docs.google.com/forms/d/e/1FAIpQLSdSEqbaTZ4MV0og4YYpxO7o_x2VWrv0Y7GvHCbpXN-pRkMJNw/viewform"
          target="_blank"
          rel="noopener noreferrer"
          className="px-10 py-5 bg-white text-teal-600 rounded-full font-bold text-lg shadow-xl shadow-teal-900/20 hover:bg-slate-50 hover:scale-105 transition-all flex items-center justify-center gap-2 mx-auto"
        >
          <Handshake className="w-5 h-5" />
          Trở thành Đối tác
        </a>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400 py-12 text-center">
      <div className="max-w-7xl mx-auto px-6 flex flex-col items-center">
        <div className="flex items-center gap-2 mb-6 opacity-50">
          <MapIcon className="w-6 h-6" />
          <span className="font-bold text-xl tracking-tight text-white">OCOP GO</span>
        </div>
        <p className="text-sm">© {new Date().getFullYear()} Danang Digital Map Project. All rights reserved.</p>
        <p className="text-xs mt-2 text-slate-600">A Startup Product & Business Platform Website</p>
      </div>
    </footer>
  );
}

export default function App() {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-teal-200 selection:text-teal-900 scroll-smooth">
      <Navbar />
      <Hero />
      <Problem />
      <Solution />
      <FiveLayerPlatform />
      <BusinessModel />
      <Impact />
      <PartnerWithUs />
      <Footer />
    </div>
  );
}
