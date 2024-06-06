import React from 'react';
import { render, fireEvent, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { MyComponent } from './MyComponent';

process.env.REACT_APP_API_URL = 'http://localhost/api';

const renderMyComponent = () => render(<MyComponent />);

describe('MyComponent Tests', () => {
  afterEach(cleanup);

  it('renders the component content as expected', () => {
    const { getByText } = renderMyComponent();
    expect(getByText('Component content')).toBeInTheDocument();
  });

  it('responds to user input changes correctly', async () => {
    const { getByLabelText, getByText } = renderMyComponent();

    await act(async () => {
      fireEvent.change(getByLabelText('Input Field Label'), { target: { value: 'New Input' } });
    });

    expect(getByText('Input has changed')).toBeInTheDocument();
  });

  it('updates and displays new state following user interaction', async () => {
    const { getByText, getByTestId } = renderMyComponent();
    
    await act(async () => {
      fireEvent.click(getByText('Change State Button'));
    });
    
    const stateValueElement = getByTestId('state-display');
    expect(stateValueElement).toHaveTextContent('New State');
  });

  it('correct crushers and displays data from an API', async () => {
    const { findByText } = renderMyComponent();
    
    const apiDataDisplayElement = await findByText('Fetched Data Display');
    expect(apiDataDisplayElement).toBeInTheDocument();
  });
});