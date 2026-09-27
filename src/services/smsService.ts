export interface SMSLog {
  id: string;
  recipientPhone: string;
  recipientName: string;
  message: string;
  orderId?: string;
  status: 'sent' | 'delivered' | 'failed';
  gateway: string;
  timestamp: string;
}

export interface SMSGatewayConfig {
  provider: 'greenweb' | 'reve' | 'onnorokom' | 'alpha' | 'twilio' | 'custom_sim';
  apiKey: string;
  senderId: string;
  isEnabled: boolean;
  orderPlacedTemplate: string;
  orderConfirmedTemplate: string;
  orderShippedTemplate: string;
  orderDeliveredTemplate: string;
}

const DEFAULT_SMS_CONFIG: SMSGatewayConfig = {
  provider: 'greenweb',
  apiKey: 'GW_LIVE_API_94827103',
  senderId: 'SmartShopX.bd',
  isEnabled: true,
  orderPlacedTemplate: 'প্রিয় {NAME}, SmartShopX.bd-এ আপনার অর্ডার #{ORDER_ID} সফলভাবে গৃহীত হয়েছে। মোট মূল্য: ৳{AMOUNT}। বিস্তারিত ট্র্যাকিং: smartshopx.bd',
  orderConfirmedTemplate: 'প্রিয় {NAME}, আপনার অর্ডার #{ORDER_ID} কনফার্ম করা হয়েছে। পণ্য প্যাকেজিং সম্পন্ন করে দ্রুত কুরিয়ারে পাঠানো হচ্ছে।',
  orderShippedTemplate: 'প্রিয় {NAME}, আপনার অর্ডার #{ORDER_ID} কুরিয়ারে হস্তান্তর করা হয়েছে। ডেলিভারি রাইডার আপনাকে ফোন করবে। প্রস্তুত রাখুন ৳{AMOUNT}।',
  orderDeliveredTemplate: 'প্রিয় {NAME}, আপনার অর্ডার #{ORDER_ID} সফলভাবে ডেলিভারি হয়েছে! SmartShopX.bd-এর সাথে থাকার জন্য ধন্যবাদ।'
};

const SMS_CONFIG_KEY = 'smartshopx_sms_config';
const SMS_LOGS_KEY = 'smartshopx_sms_logs';

export const SMSService = {
  getConfig(): SMSGatewayConfig {
    try {
      const saved = localStorage.getItem(SMS_CONFIG_KEY);
      if (saved) return { ...DEFAULT_SMS_CONFIG, ...JSON.parse(saved) };
    } catch {
      // ignore
    }
    return DEFAULT_SMS_CONFIG;
  },

  saveConfig(config: SMSGatewayConfig): void {
    localStorage.setItem(SMS_CONFIG_KEY, JSON.stringify(config));
  },

  getLogs(): SMSLog[] {
    try {
      const saved = localStorage.getItem(SMS_LOGS_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [];
  },

  sendSMS(params: {
    phone: string;
    name: string;
    orderId?: string;
    type: 'placed' | 'confirmed' | 'shipped' | 'delivered' | 'custom';
    amount?: number;
    customMessage?: string;
    onNotify?: (log: SMSLog) => void;
  }): SMSLog {
    const config = this.getConfig();
    let messageText = '';

    if (params.type === 'custom' && params.customMessage) {
      messageText = params.customMessage;
    } else {
      let template = config.orderPlacedTemplate;
      if (params.type === 'confirmed') template = config.orderConfirmedTemplate;
      if (params.type === 'shipped') template = config.orderShippedTemplate;
      if (params.type === 'delivered') template = config.orderDeliveredTemplate;

      messageText = template
        .replace(/{NAME}/g, params.name || 'সম্মানিত গ্রাহক')
        .replace(/{ORDER_ID}/g, params.orderId || '')
        .replace(/{AMOUNT}/g, params.amount ? params.amount.toLocaleString('en-US') : '0');
    }

    const newLog: SMSLog = {
      id: `SMS-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      recipientPhone: params.phone,
      recipientName: params.name,
      message: messageText,
      orderId: params.orderId,
      status: 'delivered',
      gateway: config.provider.toUpperCase(),
      timestamp: new Date().toLocaleTimeString('bn-BD', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        day: 'numeric',
        month: 'short'
      })
    };

    const existingLogs = this.getLogs();
    const updatedLogs = [newLog, ...existingLogs.slice(0, 49)];
    localStorage.setItem(SMS_LOGS_KEY, JSON.stringify(updatedLogs));

    if (params.onNotify) {
      params.onNotify(newLog);
    }

    // Trigger Custom Event for in-app floating SMS preview
    window.dispatchEvent(
      new CustomEvent('smartshopx_sms_dispatched', {
        detail: newLog
      })
    );

    return newLog;
  }
};
