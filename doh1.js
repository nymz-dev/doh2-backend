const axios = require('axios');

class Doh1 {

    _baseURL = 'https://one.prat.idf.il/api';

    _headers = {
        'User-Agent': 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:94.0) Gecko/20100101 Firefox/94.0',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.5',
        'Access-Control-Allow-Origin': '*',
        'crossDomain': 'true',
        'Pragma': 'no-cache',
        'Connection': 'keep-alive',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-origin',
    };

    setCookie(cookie) {
        this._headers.Cookie = cookie;
        return this;
    }

    get account() {

        return {

            login: async (recaptchaValue, username, password) => {

                const url = `${this._baseURL}/account/login`;

                const postData = {
                    recaptchaValue,
                    username,
                    password,
                    rememberMe: true,
                };

                const headers = {
                    ...this._headers,
                    'Content-Type': 'application/json;charset=utf-8',
                    'Origin': 'https://one.prat.idf.il',
                    'Referer': 'https://one.prat.idf.il/login',
                    'TE': 'trailers'
                };

                const response = await axios.post(url, postData, { headers, });

                if (response.data.isUserAuth === false) {

                    return false;

                }

                return response.headers['set-cookie'][0];

            },

            getUser: async () => {

                const url = `${this._baseURL}/account/getUser`;
                
                const headers = {
                    ...this._headers,
                    'Referer': 'https://one.prat.idf.il/finish',
                    'Cache-Control': 'max-age=0',
                    'TE': 'trailers'
                };
                
                const response = await axios.get(url, { headers });

                return response.data;

            }

        }

    }

    get attendance() {

        return {

            getAllFilterStatuses: async () => {

                const url = `${this._baseURL}/Attendance/GetAllFilterStatuses`;
                
                const headers = {
                    ...this._headers,
                    'Referer': 'https://one.prat.idf.il/hp',
                    'TE': 'trailers',
                };
                
                const response = await axios.get(url, { headers });

                return response.data;

            },

            getReportedData: async () => {

                const url = `${this._baseURL}/Attendance/GetReportedData`;
                
                const headers = {
                    ...this._headers,
                    'Referer': 'https://one.prat.idf.il/finish',
                    'Cache-Control': 'max-age=0',
                    'TE': 'trailers',
                };
                
                const response = await axios.get(url, { headers });

                return response.data;

            },

            insertPersonalReport: async (mainCode, secondaryCode) => {

                const url = `${this._baseURL}/Attendance/InsertPersonalReport`;

                const postData = `-----------------------------368378427734519220824045423443\r\nContent-Disposition: form-data; name=\"MainCode\"\r\n\r\n${mainCode}\r\n-----------------------------368378427734519220824045423443\r\nContent-Disposition: form-data; name=\"SecondaryCode\"\r\n\r\n${secondaryCode}\r\n-----------------------------368378427734519220824045423443\r\nContent-Disposition: form-data; name=\"IsEmergency\"\r\n\r\nundefined\r\n-----------------------------368378427734519220824045423443--\r\n`;
                
                const headers = {
                    ...this._headers,
                    'Accept-Encoding': 'gzip, deflate, br',
                    'Referer': 'https://one.prat.idf.il/hp',
                    'Content-Type': 'multipart/form-data; boundary=---------------------------368378427734519220824045423443',
                };

                const response = await axios.post(url, postData, { headers });

                return response.data;

            }
        }
    }
}

module.exports = Doh1;