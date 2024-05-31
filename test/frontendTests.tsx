import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import '@testing-library/jest-dom/extend-expect';
import { MyComponent } from './MyComponent';

process.env.REACT_APP_API_URL = 'http://localhost/api';

describe('MyComponent Tests', () => {
  it('should render correctly', () => {
    const { getByText } = render(<MyComponent />);
    expect(getByText('Component content')).toBeInTheDocument();
  });

  it('should handle user input', async () => {
    const { getByLabelText, getByText } = render(<MyComponent />);

    act(() => {
      fireEvent.change(getByLabelText('Input Field Label'), { target: { value: 'New Input' } });
    });

    expect(getByText('Input has changed')).toBeInTheDocument();
  });

  it('should update and reflect state changes', async () => {
    const { getByText, getByTestId } = render(<MyComponent />);
    
    act(() => {
      fireEvent.click(getByText('Change State Button'));
    });
    
    const stateDisplayElement = getByTestId('state-display');
    expect(stateDisplayElement).toHaveTextContent('New State');
  });

  it('fetches data and updates state accordingly', async () == {
    const { getByText, findByText } = render(<MyComponent />);
    
    const fetchedDataDisplay = await findByText('Fetched Data Display');
    expect(fetchedDataDisplay).toBeInTheDocument();
  });
});