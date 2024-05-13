import http from "http";
import request from "supertest";
import callback from '../example/test';
import { expect } from 'chai';

const httpServer = http.createServer(callback());

describe('HTTP server', () => {
  it('get request method test', async () => {
    const response = await request(httpServer).get('/');
    expect(response.status).to.equal(200);
    expect(response.text).to.equal('{"url":"/","method":"GET"}'); 
  });
  it('post request method test', async () => {
    const response = await request(httpServer).post('/');
    expect(response.status).to.equal(200);
    expect(response.text).to.equal('{"url":"/","method":"POST"}'); 
  });
});

