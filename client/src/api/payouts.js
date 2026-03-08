import api from './axios';

export const getBankDetails = async () => {
    const response = await api.get('/payouts/bank-details');
    return response.data;
};

export const updateBankDetails = async (data) => {
    const response = await api.post('/payouts/bank-details', data);
    return response.data;
};

export const requestInstantPayout = async () => {
    const response = await api.post('/payouts/instant');
    return response.data;
};

export const getPayoutHistory = async (params = { skip: 0, limit: 20 }) => {
    const response = await api.get('/payouts/history', { params });
    return response.data;
};
export const downloadWorkerReport = async (month, year) => {
    const response = await api.get('/invoices/worker-report', {
        params: { month, year },
        responseType: 'blob'
    });

    const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Worker_ITR_Report_${month}_${year}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(url);
};
