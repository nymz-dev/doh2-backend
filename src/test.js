require('dotenv/config');
const app = require('./app');
const request = require('supertest');
const mongoose = require('mongoose');
const User = require('./models/User');
const nock = require('nock');

beforeAll(async () => {

    mongoose.connect(process.env.DB_CONNECTION, () => {

        const isConnected = mongoose.connection.readyState == 1;
        isConnected && console.log('Connected to DB.');
        isConnected == false && console.log('Connection to DB failed.');

    });

});

afterAll(async () => {

    await mongoose.connection.close();

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

        const headers = {
            'set-cookie': 'AppCookie=AAAA;'
        };

        const body = {
            isUserAuth: true,
            isCommanderAuth: false,
            error: null,
        }

        nock('https://one.prat.idf.il')
            .post('/api/account/login')
            .reply(200, body, headers);

        const data = { username: '123456787', password: '123456', recaptchaValue: 'ABCD' };
        const response = await request(app).post('/users/login').send(data);
        expect(response.status).toBe(200);
        const user = await User.findOne({ username: '123456787' });
        expect(user).toMatchObject({ username: '123456787' });

    });

    it("users can login", async () => {

        const headers = {
            'set-cookie': 'AppCookie=AAAA;'
        };

        const body = {
            isUserAuth: true,
            isCommanderAuth: false,
            error: null,
        }

        nock('https://one.prat.idf.il')
            .post('/api/account/login')
            .reply(200, body, headers);

        const data = { username: '123456789', password: '123456', recaptchaValue: 'ABCD' };
        const response = await request(app).post('/users/login').send(data);
        expect(response.status).toBe(200);
        expect(response.text).toContain("token");
        expect(response.text).toContain("success");

    });

});