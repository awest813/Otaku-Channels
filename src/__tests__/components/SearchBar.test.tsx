import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

import SearchBar from '@/components/search/SearchBar';

describe('SearchBar', () => {
  it('renders with the provided value', () => {
    render(<SearchBar value='naruto' onChange={jest.fn()} />);
    expect(screen.getByRole('searchbox')).toHaveValue('naruto');
  });

  it('renders the default placeholder text', () => {
    render(<SearchBar value='' onChange={jest.fn()} />);
    expect(
      screen.getByPlaceholderText('Search anime, movies, genres…')
    ).toBeInTheDocument();
  });

  it('renders a custom placeholder text', () => {
    render(
      <SearchBar value='' onChange={jest.fn()} placeholder='Find anime…' />
    );
    expect(screen.getByPlaceholderText('Find anime…')).toBeInTheDocument();
  });

  it('calls onChange when the user types', () => {
    const handleChange = jest.fn();
    render(<SearchBar value='' onChange={handleChange} />);
    fireEvent.change(screen.getByRole('searchbox'), {
      target: { value: 'one piece' },
    });
    expect(handleChange).toHaveBeenCalledWith('one piece');
  });

  it('shows a clear button when value is non-empty', () => {
    render(<SearchBar value='bleach' onChange={jest.fn()} />);
    expect(
      screen.getByRole('button', { name: /clear search/i })
    ).toBeInTheDocument();
  });

  it('does not show a clear button when value is empty', () => {
    render(<SearchBar value='' onChange={jest.fn()} />);
    expect(
      screen.queryByRole('button', { name: /clear search/i })
    ).not.toBeInTheDocument();
  });

  it('calls onChange with empty string when the clear button is clicked', () => {
    const handleChange = jest.fn();
    render(<SearchBar value='bleach' onChange={handleChange} />);
    fireEvent.click(screen.getByRole('button', { name: /clear search/i }));
    expect(handleChange).toHaveBeenCalledWith('');
  });
});
