// axios.js
import axios from 'axios';

export const BASE_URL = 'http://localhost:8080';

export const myAxios = axios.create({
    baseURL: BASE_URL,
});

export const setAuthToken = (token) => {
    if (token) {
        myAxios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        delete myAxios.defaults.headers.common['Authorization'];
    }
};
