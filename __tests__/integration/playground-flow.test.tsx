import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Playground from '@/components/Playground';

describe.skip('Playground Integration Tests', () => {
  describe('Complete User Flow', () => {
    it('should complete full prompt testing workflow', async () => {
      // Mock API responses
      global.fetch = jest.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ credits: 100, planType: 'PRO' })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ 
            result: 'AI generated response',
            tokensUsed: 150,
            creditsCharged: 1
          })
        });

      render(<Playground />);

      // Step 1: Enter prompt
      const textarea = screen.getByRole('textbox');
      fireEvent.change(textarea, { 
        target: { value: 'Write a product description for a smart watch' } 
      });

      // Step 2: Adjust settings
      const settingsTab = screen.getByText(/settings/i);
      fireEvent.click(settingsTab);

      const temperatureSlider = screen.getByLabelText(/temperature/i);
      fireEvent.change(temperatureSlider, { target: { value: '0.7' } });

      // Step 3: Run prompt
      const runButton = screen.getByText(/run/i);
      fireEvent.click(runButton);

      // Step 4: Wait for result
      await waitFor(() => {
        expect(screen.getByText(/AI generated response/i)).toBeInTheDocument();
      });

      // Step 5: Copy result
      const copyButton = screen.getByLabelText(/copy/i);
      fireEvent.click(copyButton);

      // Step 6: Check history
      const historyTab = screen.getByText(/history/i);
      fireEvent.click(historyTab);

      expect(screen.getByText(/Write a product description/i)).toBeInTheDocument();
    });

    it('should handle multi-model comparison', async () => {
      global.fetch = jest.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ credits: 100 })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ 
            gpt4: 'GPT-4 response',
            claude: 'Claude response',
            gemini: 'Gemini response'
          })
        });

      render(<Playground />);

      const textarea = screen.getByRole('textbox');
      fireEvent.change(textarea, { target: { value: 'Test prompt' } });

      // Enable multi-model mode
      const compareButton = screen.getByText(/compare models/i);
      fireEvent.click(compareButton);

      const runButton = screen.getByText(/run/i);
      fireEvent.click(runButton);

      await waitFor(() => {
        expect(screen.getByText(/GPT-4 response/i)).toBeInTheDocument();
        expect(screen.getByText(/Claude response/i)).toBeInTheDocument();
        expect(screen.getByText(/Gemini response/i)).toBeInTheDocument();
      });
    });
  });

  describe('Error Recovery', () => {
    it('should recover from API error and retry', async () => {
      let callCount = 0;
      global.fetch = jest.fn().mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return Promise.reject(new Error('Network error'));
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ result: 'Success after retry' })
        });
      });

      render(<Playground />);

      const textarea = screen.getByRole('textbox');
      fireEvent.change(textarea, { target: { value: 'Test prompt' } });

      const runButton = screen.getByText(/run/i);
      fireEvent.click(runButton);

      await waitFor(() => {
        expect(screen.getByText(/error/i)).toBeInTheDocument();
      });

      // Retry
      const retryButton = screen.getByText(/retry/i);
      fireEvent.click(retryButton);

      await waitFor(() => {
        expect(screen.getByText(/Success after retry/i)).toBeInTheDocument();
      });
    });
  });

  describe('Performance Under Load', () => {
    it('should handle rapid consecutive executions', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ result: 'Response', tokensUsed: 100 })
      });

      render(<Playground />);

      const textarea = screen.getByRole('textbox');
      const runButton = screen.getByText(/run/i);

      // Rapid fire 5 executions
      for (let i = 0; i < 5; i++) {
        fireEvent.change(textarea, { target: { value: `Prompt ${i}` } });
        fireEvent.click(runButton);
      }

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(5);
      });
    });
  });

  describe('State Persistence', () => {
    it('should persist settings across sessions', () => {
      const { rerender } = render(<Playground />);

      const settingsTab = screen.getByText(/settings/i);
      fireEvent.click(settingsTab);

      const temperatureSlider = screen.getByLabelText(/temperature/i);
      fireEvent.change(temperatureSlider, { target: { value: '0.9' } });

      // Simulate component unmount/remount
      rerender(<Playground />);

      fireEvent.click(settingsTab);
      expect(screen.getByLabelText(/temperature/i)).toHaveValue('0.9');
    });
  });
});
