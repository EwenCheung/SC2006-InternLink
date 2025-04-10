import { fetchUniversities } from '../controllers/universitiesdata.controller';
import { describe, it, expect, vi } from 'vitest';

global.fetch = vi.fn();

describe('fetchUniversities', () => {
    it('should fetch and return a list of unique universities', async () => {
        // Mock API response
        const mockResponse = {
            result: {
                records: [
                    { university: 'University A' },
                    { university: 'University B' },
                    { university: 'University A' }, // Duplicate
                ],
            },
        };

        fetch.mockResolvedValueOnce({
            json: async () => mockResponse,
        });

        const universities = await fetchUniversities();
        expect(universities).toEqual(['University A', 'University B']);

        // Validate the result
        expect(universities).toEqual(['University A', 'University B']);
        expect(fetch).toHaveBeenCalledWith(
            'https://data.gov.sg/api/action/datastore_search?resource_id=d_3c55210de27fcccda2ed0c63fdd2b352&offset=40&limit=1000'
        );

        // Validate the result
        expect(universities).toEqual(['University A', 'University B']);
        expect(fetch).toHaveBeenCalledWith(
            'https://data.gov.sg/api/action/datastore_search?resource_id=d_3c55210de27fcccda2ed0c63fdd2b352&offset=40&limit=1000'
        );
    });

    it('should return an empty array if the API response is invalid', async () => {
        // Mock invalid API response
        fetch.mockResolvedValueOnce({
            json: async () => ({}),
        });

        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        const universities = await fetchUniversities();
        expect(universities).toEqual([]);
        expect(consoleErrorSpy).toHaveBeenCalledWith(
            'Error fetching university data:',
            expect.any(Error)
        );
        consoleErrorSpy.mockRestore();
    });

    it('should handle fetch errors gracefully', async () => {
        // Mock fetch error
        fetch.mockRejectedValueOnce(new Error('Network Error'));

        const universities = await fetchUniversities();

        // Validate the result
        expect(universities).toEqual([]);
    });
});
