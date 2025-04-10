import axios from 'axios';
import request from 'supertest';
import app from '../server';
import { fetchSkillsData } from '../controllers/skillsdata.controller';
import { describe, it, expect, vi } from 'vitest';

vi.mock('axios');

describe('Skill Data Controller', () => {
    it('should fetch skill data successfully', async () => {
        // Mock the token response
        axios.get.mockResolvedValueOnce({ data: { token2: 'mockAccessToken' } });

        // Mock the skills data response
        axios.mockResolvedValueOnce({
            data: {
                data: [
                    { name: 'Skill 1' },
                    { name: 'Skill 2' },
                ],
            },
});

describe('Skill Data API', () => {
    it('should return skill data successfully', async () => {
        const response = await request(app).get('https://emsiservices.com/skills/versions/latest/skills');
        expect(response.status).toBe(200);
        expect(response.body).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ name: expect.any(String) }),
            ])
        );
    });

    it('should handle errors gracefully', async () => {
        // Simulate an error scenario
        vi.spyOn(axios, 'get').mockImplementationOnce(async (url) => {
            if (url === 'http://localhost:5001/use-token') {
                return { data: { token2: 'mockAccessToken' } };
            }
            throw new Error('API Error');
        });

        const response = await request(app).get('/api/skillsdata');
        expect(response.status).toBe(500);
        expect(response.body).toHaveProperty('error', 'API Error');
    });
});

        const skills = await fetchSkillsData();

        // Validate the fetched skills
        expect(skills).toEqual(['Skill 1', 'Skill 2']);

        // Validate the API calls
        expect(axios.get).toHaveBeenCalledWith('http://localhost:5001/use-token');
        expect(axios).toHaveBeenCalledWith({
            method: 'GET',
            url: 'https://emsiservices.com/skills/versions/latest/skills',
            headers: { Authorization: 'Bearer mockAccessToken' },
        });
    });

    it('should handle errors gracefully', async () => {
        // Mock an error response
        axios.get.mockRejectedValueOnce(new Error('Token fetch failed'));

        const skills = await fetchSkillsData();

        // Validate that no skills are returned on error
        expect(skills).toBeUndefined();

        // Validate the error handling
        expect(axios.get).toHaveBeenCalledWith('http://localhost:5001/use-token');
    });
});
