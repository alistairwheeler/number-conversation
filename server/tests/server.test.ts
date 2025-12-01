import request from 'supertest';
import { app } from '../src/server';
import sqlite3 from 'sqlite3';

describe('Backend API', () => {
    let token: string;
    let userId: number;
    let postId: number;

    beforeAll(async () => {
        // Wait for DB init if needed, or just sleep a bit. 
        // In a real app we'd export the DB init promise.
        await new Promise(resolve => setTimeout(resolve, 1000));
    });

    it('should register a new user', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                username: 'testuser',
                password: 'password123'
            });
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('message', 'User registered successfully');
    });

    it('should login the user', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                username: 'testuser',
                password: 'password123'
            });
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('token');
        token = res.body.token;
    });

    it('should create a new discussion post', async () => {
        const res = await request(app)
            .post('/api/posts')
            .set('Authorization', `Bearer ${token}`)
            .send({
                value: 100
            });
        expect(res.statusCode).toEqual(200);
        expect(res.body.data).toHaveProperty('result', 100);
        postId = res.body.data.id;
    });

    it('should reply to a discussion post', async () => {
        const res = await request(app)
            .post(`/api/posts/${postId}/reply`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                operation: '+',
                operand: 50
            });
        expect(res.statusCode).toEqual(200);
        expect(res.body.data).toHaveProperty('result', 150);
    });

    it('should get all posts', async () => {
        const res = await request(app).get('/api/posts');
        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.data.length).toBeGreaterThanOrEqual(2);
    });
});
