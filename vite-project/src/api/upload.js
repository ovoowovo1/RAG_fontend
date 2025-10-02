import axios from 'axios';
import { API_BASE_URL } from '../config.js';

export const uploadMultiple = (files, clientId) => {
  const uploadPromises = files.map(file => {
    const formData = new FormData();
    formData.append('files', file.originFileObj || file);
    return axios.post(`${API_BASE_URL}/upload-multiple?clientId=${encodeURIComponent(clientId)}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  });
  return Promise.all(uploadPromises);
};


export const uploadLink = (url, clientId) => {
  return axios.post(`${API_BASE_URL}/upload-link?clientId=${encodeURIComponent(clientId)}`, { url });
};


