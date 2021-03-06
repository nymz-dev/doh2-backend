require('dotenv/config');
const app = require('./app');
const request = require('supertest');
const mongoose = require('mongoose');
const User = require('./models/User');
const Report = require('./models/Report');
const nock = require('nock');
const resetReports = require('./jobs/resetReports');
const report = require('./jobs/report');
const DB = require('./database');
const Message = require('./models/Message');

const mockLoginRequest = () => {

    const headers = {
        'set-cookie': 'AppCookie=AAAA;'
    };

    const body = {
        isUserAuth: true,
        isCommanderAuth: false,
        error: null,
    };

    nock('https://one.prat.idf.il')
        .post('/api/account/login')
        .reply(200, body, headers);

};

const getToken = async ({ username, password, recaptchaValue }) => {

    const data = { username, password, recaptchaValue };
    const response = await request(app).post('/users/login').send(data);
    return response.body.data.token;

}

beforeAll(async () => {

    await DB.connect();

});

afterAll(async () => {

    await DB.disconnect();

});

describe('Main route', () => {

    it("Get main route", async () => {

        const response = await request(app).get('/');
        expect(response.status).toBe(200);
        // expect(response.text).toContain('uptime');
        expect(response.text).toContain('message');
        expect(response.text).toContain('date');

    });

});

describe('Post to /users/login', () => {

    it("username is required", async () => {

        const data = { password: '12345678', recaptchaValue: 'ABCD' };
        const response = await request(app).post('/users/login').send(data);
        expect(response.status).toBe(400);

    });

    it("password id is required", async () => {

        const data = { username: '209267913', recaptchaValue: 'ABCD' };
        const response = await request(app).post('/users/login').send(data);
        expect(response.status).toBe(400);

    });

    it("recaptcha is required", async () => {

        const data = { username: '209267913', password: '12345678' };
        const response = await request(app).post('/users/login').send(data);
        expect(response.status).toBe(400);

    });

    it("users can register", async () => {

        await mockLoginRequest();
        const data = { username: '123456787', password: '123456', recaptchaValue: 'ABCD' };
        const response = await request(app).post('/users/login').send(data);
        expect(response.status).toBe(200);
        const user = await User.findOne({ username: '123456787' });
        expect(user).toMatchObject({ username: '123456787' });

    });

    it("users can login", async () => {

        await mockLoginRequest();
        const data = { username: '123456789', password: '123456', recaptchaValue: 'ABCD' };
        const response = await request(app).post('/users/login').send(data);
        expect(response.status).toBe(200);
        expect(response.text).toContain("token");
        expect(response.text).toContain("success");

    });

});

describe('Get to /users/me', () => {

    it("user must be logged in", async () => {

        const response = await request(app).get('/users/me');
        expect(response.status).toBe(403);

    });

    it("logged in users can access route", async () => {

        await mockLoginRequest();
        const data = { username: '123456789', password: '123456', recaptchaValue: 'ABCD' };
        const token = await getToken(data);

        response = await request(app).get('/users/me').set('Authorization', `Bearer ${token}`);
        expect(response.status).toBe(200);
        expect(response.body).toMatchObject({ username: '123456789' });

    });

});

describe('Patch to /users/me', () => {

    it("user must be logged in", async () => {

        const response = await request(app).patch('/users/');
        expect(response.status).toBe(403);

    });

    it("notification is required", async () => {

        await mockLoginRequest();
        const data = { username: '123456789', password: '123456', recaptchaValue: 'ABCD' };
        const token = await getToken(data);

        const payload = { phone: "0541231234", whatsapp: false };
        response = await request(app).patch('/users').set('Authorization', `Bearer ${token}`).send(payload);
        expect(response.status).toBe(400);

    });

    it("whatsapp is required", async () => {

        await mockLoginRequest();
        const data = { username: '123456789', password: '123456', recaptchaValue: 'ABCD' };
        const token = await getToken(data);

        const payload = { phone: "0541231234", notification: false };
        response = await request(app).patch('/users').set('Authorization', `Bearer ${token}`).send(payload);
        expect(response.status).toBe(400);

    });

    it("route is working", async () => {

        await mockLoginRequest();
        const data = { username: '123456789', password: '123456', recaptchaValue: 'ABCD' };
        const token = await getToken(data);

        const payload = { phone: "0541231234", notification: false, whatsapp: true };
        response = await request(app).patch('/users').set('Authorization', `Bearer ${token}`).send(payload);
        expect(response.status).toBe(200);

        const user = await User.findOne({ username: '123456789' });
        expect(user).toMatchObject({ phone: "0541231234", notification: false, whatsapp: true });

    });

});

describe("Post to /reports", () => {

    it("user must be logged in", async () => {

        const response = await request(app).post('/reports');
        expect(response.status).toBe(403);

    });

    it("route is working", async () => {

        await mockLoginRequest();
        let data = { username: '123456789', password: '123456', recaptchaValue: 'ABCD' };
        const token = await getToken(data);

        data = {
            "sunday": {
                "type": "0101",
                "hour": 6,
            }
        }

        response = await request(app).post('/reports').set('Authorization', `Bearer ${token}`).send(data);
        expect(response.status).toBe(200);

    });

    it("hour is required", async () => {

        await mockLoginRequest();
        let data = { username: '123456789', password: '123456', recaptchaValue: 'ABCD' };
        const token = await getToken(data);

        data = {
            "sunday": {
                "type": "0101",
            }
        }

        response = await request(app).post('/reports').set('Authorization', `Bearer ${token}`).send(data);
        expect(response.status).toBe(400);

    });

    it("type is required", async () => {

        await mockLoginRequest();
        let data = { username: '123456789', password: '123456', recaptchaValue: 'ABCD' };
        const token = await getToken(data);

        data = {
            "sunday": {
                "hour": 6,
            }
        }

        response = await request(app).post('/reports').set('Authorization', `Bearer ${token}`).send(data);
        expect(response.status).toBe(400);

        // TODO: also check with the database

    });

});


describe("Get to /reports", () => {

    it("user must be logged in", async () => {

        const response = await request(app).get('/reports');
        expect(response.status).toBe(403);

    });

    it("route is working", async () => {

        await mockLoginRequest();
        let data = { username: '123456789', password: '123456', recaptchaValue: 'ABCD' };
        const token = await getToken(data);
        response = await request(app).get('/reports').set('Authorization', `Bearer ${token}`);
        expect(response.status).toBe(200);

    });

});

describe("Reset reports job", () => {

    it("job is working", async () => {

        await mockLoginRequest();
        let data = { username: '123456789', password: '123456', recaptchaValue: 'ABCD' };
        const token = await getToken(data);

        data = {
            "sunday": {
                "type": "0101",
                "hour": 6,
            }
        }

        response = await request(app).post('/reports').set('Authorization', `Bearer ${token}`).send(data);
        expect(response.status).toBe(200);

        let report = await Report.findOne({});
        expect(report).toMatchObject(data);
        await DB.disconnect();
        await resetReports();
        await DB.connect();
        report = await Report.findOne({});
        expect(report).not.toMatchObject(data);

    });

});

describe("Report job is working", () => {

    it("job is working", async () => {

        nock('https://one.prat.idf.il')
            .post('/api/Attendance/InsertPersonalReport')
            .reply(200);

        const oldMessagesCount = await Message.count({});

        const user = await User.findOne({});
        const job = {
            data: {
                user,
                reportType: "0101"
            }
        };

        await DB.disconnect();
        await report(job);
        await DB.connect();

        const newMessagesCount = await Message.count({});
        expect(newMessagesCount).toBe(oldMessagesCount + 1);

    });

});

// TODO: improve tests speed