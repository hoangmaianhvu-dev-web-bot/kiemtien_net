
import React from 'react';
import { SOCIAL_LINKS } from '../constants';

const Support: React.FC = () => {
  const contactMethods = [
    { label: 'Chat trực tuyến', desc: 'Phản hồi trong 5 phút', icon: 'fa-comments', color: 'bg-indigo-500' },
    { label: 'Zalo Support', desc: 'Hỗ trợ kỹ thuật 24/7', icon: 'fa-message', color: 'bg-blue-500', link: SOCIAL_LINKS.ZALO },
    { label: 'Telegram Bot', desc: 'Báo lỗi & Giải đáp', icon: 'fa-paper-plane', color: 'bg-sky-500', link: SOCIAL_LINKS.TELEGRAM },
    { label: 'Email Phản hồi', desc: 'support@linkgold.pro', icon: 'fa-envelope', color: 'bg-slate-700' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-extrabold text-slate-800 mb-2">Bạn cần trợ giúp?</h2>
        <p className="text-slate-500">Đội ngũ LinkGold luôn sẵn sàng hỗ trợ bạn bất cứ lúc nào.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {contactMethods.map((m, i) => (
          <a 
            key={i} 
            href={m.link || '#'} 
            target={m.link ? "_blank" : "_self"}
            className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center space-x-4 hover:border-indigo-300 hover:shadow-md transition-all group"
          >
            <div className={`${m.color} p-4 rounded-2xl text-white group-hover:scale-110 transition-transform`}>
              <i className={`fa-solid ${m.icon} text-2xl`}></i>
            </div>
            <div>
              <h4 className="font-bold text-slate-800">{m.label}</h4>
              <p className="text-sm text-slate-500">{m.desc}</p>
            </div>
          </a>
        ))}
      </div>

      <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
        <h3 className="text-xl font-bold text-slate-800 mb-6">Câu hỏi thường gặp</h3>
        <div className="space-y-4">
          {[
            { q: "Làm sao để kiếm được nhiều Xu hơn?", a: "Hãy chăm chỉ làm các nhiệm vụ mới được cập nhật vào khung giờ vàng 08:00 và 20:00 hàng ngày." },
            { q: "Tại sao nhiệm vụ của tôi bị từ chối?", a: "Đa số trường hợp là do bạn nhập sai mã xác nhận hoặc dùng VPN/Proxy khi làm nhiệm vụ." },
            { q: "Rút tiền bao lâu thì về tài khoản?", a: "Thời gian xử lý trung bình là 30 phút đến 4 tiếng. Tối đa không quá 24h." }
          ].map((faq, i) => (
            <details key={i} className="group border-b border-slate-100 pb-4">
              <summary className="list-none flex items-center justify-between cursor-pointer font-bold text-slate-700 hover:text-indigo-600 transition-colors">
                {faq.q}
                <i className="fa-solid fa-chevron-down text-xs transition-transform group-open:rotate-180"></i>
              </summary>
              <p className="mt-3 text-sm text-slate-500 leading-relaxed">
                {faq.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Support;
