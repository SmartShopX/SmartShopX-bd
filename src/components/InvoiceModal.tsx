import React from 'react';
import { Order } from '../types';
import { X, Printer, CheckCircle2, Download, ShieldCheck, MapPin, Phone, Calendar, Store, QrCode } from 'lucide-react';

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  language: 'bn' | 'en';
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
  isOpen,
  onClose,
  order,
  language
}) => {
  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-2 sm:p-4 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white text-gray-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-gray-200 my-auto">
        {/* Modal Top Actions */}
        <div className="bg-gradient-to-r from-[#0a3871] via-[#0b1a30] to-[#f85606] text-white p-4 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-sm sm:text-base">
              {language === 'bn' ? 'অফিসিয়াল মানি রিসিট ও ইনভয়েস' : 'Official Money Receipt & Invoice'}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'প্রিন্ট / PDF' : 'Print / PDF'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Area */}
        <div className="p-6 sm:p-8 space-y-6 bg-white print:p-0">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-200 pb-6">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#f85606] text-white flex items-center justify-center font-black text-lg">
                  S
                </div>
                <h1 className="text-2xl font-black tracking-tight text-gray-900">
                  SmartShopX<span className="text-[#f85606]">.bd</span>
                </h1>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                বাংলাদেশের প্রিমিয়াম ই-কমার্স প্ল্যাটফর্ম • হটলাইন: ১৬৪৯২
              </p>
              <p className="text-[11px] text-gray-400">ডোমেন: https://smartshopx.bd</p>
            </div>
            <div className="text-left sm:text-right">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
                {order.status === 'delivered' ? 'ডেলিভার্ড ও পরিশোধিত' : 'অর্ডার কনফার্মড'}
              </span>
              <p className="text-xs font-mono font-bold text-gray-800 mt-2">
                Invoice #{order.id}
              </p>
              <p className="text-xs text-gray-500 flex items-center gap-1 sm:justify-end mt-0.5">
                <Calendar className="w-3 h-3 text-gray-400" /> {order.orderDate}
              </p>
            </div>
          </div>

          {/* Customer & Payment Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-200 text-xs">
            <div>
              <p className="font-bold text-gray-500 uppercase text-[10px] tracking-wider mb-1">
                {language === 'bn' ? 'গ্রাহকের বিবরণ' : 'Customer Info'}
              </p>
              <h4 className="font-bold text-sm text-gray-900">{order.address.fullName}</h4>
              <p className="text-gray-600 flex items-center gap-1 mt-1">
                <Phone className="w-3.5 h-3.5 text-gray-400" /> {order.address.phone}
              </p>
              <p className="text-gray-600 flex items-start gap-1 mt-1">
                <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                <span>{order.address.addressDetails}, {order.address.city}, {order.address.division}</span>
              </p>
            </div>

            <div>
              <p className="font-bold text-gray-500 uppercase text-[10px] tracking-wider mb-1">
                {language === 'bn' ? 'পেমেন্ট ও ডেলিভারি বিবরণ' : 'Payment & Delivery'}
              </p>
              <div className="space-y-1">
                <p className="text-gray-700">
                  <span className="font-semibold">পেমেন্ট মেথড:</span>{' '}
                  <span className="uppercase font-bold text-[#f85606]">{order.paymentMethod}</span>
                </p>
                <p className="text-gray-700">
                  <span className="font-semibold">স্টোর নেম:</span>{' '}
                  <span className="font-medium">{order.storeName || 'SmartShopX Direct'}</span>
                </p>
                <p className="text-gray-700">
                  <span className="font-semibold">ট্র্যাকিং আইডি:</span>{' '}
                  <span className="font-mono">{order.clientOrderId || order.id}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-200 text-gray-500 font-bold uppercase text-[10px]">
                  <th className="py-2.5 px-2">পণ্য বিবরণ</th>
                  <th className="py-2.5 px-2 text-center">পরিমাণ</th>
                  <th className="py-2.5 px-2 text-right">একক মূল্য</th>
                  <th className="py-2.5 px-2 text-right">মোট</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {order.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50">
                    <td className="py-3 px-2">
                      <p className="font-bold text-gray-900">{language === 'bn' ? item.product.titleBn || item.product.title : item.product.title}</p>
                      <p className="text-[11px] text-gray-500">{item.product.brand} • SKU: {item.product.sku || 'SKU-STD'}</p>
                    </td>
                    <td className="py-3 px-2 text-center font-bold">{item.quantity}</td>
                    <td className="py-3 px-2 text-right font-mono">৳{item.product.price.toLocaleString('en-US')}</td>
                    <td className="py-3 px-2 text-right font-mono font-bold">
                      ৳{(item.product.price * item.quantity).toLocaleString('en-US')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary Breakdown */}
          <div className="flex flex-col sm:flex-row items-end justify-between gap-4 border-t-2 border-gray-200 pt-4">
            <div className="text-left text-xs text-gray-500 space-y-1">
              <p className="font-bold text-gray-700">শর্তাবলী ও রিটার্ন পলিসি:</p>
              <p>• পণ্য হাতে পেয়ে যাচাই করে মূল্য পরিশোধ করুন।</p>
              <p>• যেকোনো ত্রুটিতে ৭ দিনের মধ্যে ফ্রি রিপ্লেসমেন্ট ওয়ারেন্টি প্রযোজ্য।</p>
            </div>
            <div className="w-full sm:w-64 space-y-1.5 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>পণ্যের মোট মূল্য:</span>
                <span className="font-mono">৳{order.totalAmount.toLocaleString('en-US')}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>ডেলিভারি ফি:</span>
                <span className="font-mono">৳{order.deliveryFee}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>ডিসকাউন্ট ও অফার:</span>
                  <span className="font-mono">-৳{order.discountAmount.toLocaleString('en-US')}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-black text-gray-900 border-t border-gray-200 pt-2">
                <span>সর্বমোট প্রদেয়:</span>
                <span className="font-mono text-[#f85606]">৳{order.finalAmount.toLocaleString('en-US')}</span>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="text-center text-[11px] text-gray-400 border-t border-gray-100 pt-4">
            SmartShopX.bd • সর্বস্বত্ব সংরক্ষিত ২০২৬ • ধন্যবাদ আমাদের সাথে কেনাকাটা করার জন্য!
          </div>
        </div>
      </div>
    </div>
  );
};
